"""Exporta pacientes atendidos en los últimos 24 meses desde Mibiodata.

Login manual, scraping con Playwright. Resume si se interrumpe.
"""

import argparse
import csv
import json
import sys
import time
import traceback
from datetime import date, timedelta
from getpass import getpass
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

from encryptor import encrypt_file


BASE_URL = "https://mibiodata.hospitalclinico.cl"
AGENDA_URL = f"{BASE_URL}/newmbd/prof/atenciones/atenciones"
FICHA_URL_TPL = f"{BASE_URL}/newmbd/prof/atenciones/atencion-paciente?cap={{cap}}"

DAYS_BACK = 730
EXCLUDED_STATES = {
    "cancelado", "cancelada",
    "no asistio", "no asistió", "no asistido",
    "en espera",
}

DELAY_BETWEEN_FICHAS = 1.0
DELAY_BETWEEN_DAYS = 0.5

OUT_DIR = Path(__file__).parent / "out"
OUT_DIR.mkdir(exist_ok=True)
PROGRESS_FILE = OUT_DIR / "progress.json"
LOG_FILE = OUT_DIR / "scraper.log"


def log(msg: str) -> None:
    line = f"[{date.today().isoformat()} {time.strftime('%H:%M:%S')}] {msg}"
    print(line)
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"pacientes": {}, "fechas_completas": []}


def save_progress(state: dict) -> None:
    PROGRESS_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def daterange_back(days: int):
    today = date.today()
    return [today - timedelta(days=i) for i in range(days)]


def is_logged_in(page: Page) -> bool:
    return "/prof/" in page.url and "login" not in page.url.lower()


def find_date_input(page: Page):
    inputs = page.locator("input").all()
    for inp in inputs:
        try:
            val = (inp.get_attribute("value") or "").strip()
            if len(val) == 10 and val[2] == "-" and val[5] == "-":
                return inp
        except Exception:
            continue
    return None


def find_state_select(page: Page):
    selects = page.locator("select").all()
    for sel in selects:
        try:
            options = [o.strip().lower() for o in sel.locator("option").all_text_contents()]
            if any("espera" in o or "atendi" in o or "cancel" in o for o in options):
                return sel
        except Exception:
            continue
    return None


def set_date(page: Page, fecha) -> bool:
    inp = find_date_input(page)
    if inp is None:
        return False
    fecha_str = fecha.strftime("%d-%m-%Y")
    inp.click(click_count=3)
    inp.fill(fecha_str)
    inp.dispatch_event("input")
    inp.dispatch_event("change")
    inp.press("Enter")
    inp.evaluate(
        "el => { el.blur(); if (window.jQuery) { jQuery(el).trigger('change'); jQuery(el).trigger('changeDate'); } }"
    )
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(800)
    actual = (inp.input_value() or "").strip()
    if actual != fecha_str:
        log(f"  ! Fecha no se aplicó: input quedó en '{actual}', esperado '{fecha_str}'")
        return False
    body = page.locator("body").inner_text()
    if fecha_str not in body and fecha.strftime("%d/%m/%Y") not in body:
        log(f"  ! Fecha {fecha_str} no aparece en el encabezado de la página.")
        return False
    return True


def list_states(page: Page) -> list[str]:
    sel = find_state_select(page)
    if sel is None:
        return []
    return [o.strip() for o in sel.locator("option").all_text_contents() if o.strip()]


def select_state(page: Page, estado: str) -> bool:
    sel = find_state_select(page)
    if sel is None:
        return False
    sel.select_option(label=estado)
    sel.dispatch_event("change")
    sel.evaluate(
        "el => { if (window.jQuery) jQuery(el).trigger('change'); }"
    )
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(600)
    return True


def collect_rows_in_table(page: Page) -> list[dict]:
    rows = []
    for tr in page.locator("table tbody tr").all():
        link = tr.locator("a[href*='cap=']").first
        if link.count() == 0:
            continue
        href = link.get_attribute("href") or ""
        cap = href.split("cap=")[-1].split("&")[0].strip()
        if not cap.isdigit():
            continue
        cells = tr.locator("td").all_text_contents()
        ficha = cells[1].strip() if len(cells) > 1 else ""
        rows.append({"cap": cap, "ficha": ficha})
    return rows


def extract_field(page: Page, label: str) -> str:
    try:
        loc = page.get_by_text(label, exact=True).first
        if loc.count() == 0:
            return ""
        block = loc.locator("xpath=..").inner_text()
        lines = [ln.strip() for ln in block.splitlines() if ln.strip() and ln.strip() != label]
        return lines[0] if lines else ""
    except Exception:
        return ""


def scrape_ficha(page: Page, cap: str) -> dict:
    page.goto(FICHA_URL_TPL.format(cap=cap), wait_until="networkidle")
    return {
        "nombre": extract_field(page, "Nombre"),
        "rut": extract_field(page, "Rut"),
        "telefono": extract_field(page, "Número contacto"),
        "correo": extract_field(page, "Correo electrónico"),
        "fecha_nacimiento": extract_field(page, "Fecha nacimiento"),
        "prevision": extract_field(page, "Previsión"),
    }


def scrape_day(page: Page, fecha) -> list[dict]:
    if not set_date(page, fecha):
        log(f"  ! No pude setear la fecha {fecha}")
        return []

    estados = list_states(page)
    if not estados:
        log("  ! No encontré dropdown de estados; leeré la tabla con el filtro actual.")
        return collect_rows_in_table(page)

    incluidos = [e for e in estados if e.lower() not in EXCLUDED_STATES]
    log(f"  Estados detectados: {estados}")
    log(f"  Iterando estados incluidos: {incluidos}")

    visited_caps = set()
    out = []
    for estado in estados:
        if estado.lower() in EXCLUDED_STATES:
            continue
        if not select_state(page, estado):
            continue
        for row in collect_rows_in_table(page):
            if row["cap"] in visited_caps:
                continue
            visited_caps.add(row["cap"])
            row["estado"] = estado
            out.append(row)
    return out


def export_csv(state: dict) -> Path:
    csv_path = OUT_DIR / f"pacientes_{date.today().isoformat()}.csv"
    fields = [
        "ficha", "rut", "nombre", "telefono", "correo",
        "fecha_nacimiento", "prevision", "fecha_referencia",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in state["pacientes"].values():
            writer.writerow({k: row.get(k, "") for k in fields})
    return csv_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Exportador Mibiodata")
    parser.add_argument("--days", type=int, default=DAYS_BACK,
                        help=f"Días hacia atrás a recorrer (default: {DAYS_BACK})")
    parser.add_argument("--reset", action="store_true",
                        help="Borra progreso previo antes de comenzar")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    print("=" * 64)
    print(f"  Exportador Mibiodata — últimos {args.days} días")
    print("=" * 64)
    print()
    print("Pasos:")
    print("  1) Se abrirá un navegador en mibiodata.hospitalclinico.cl")
    print("  2) Inicia sesión MANUALMENTE (usuario + médico + clave).")
    print("  3) Cuando veas tu agenda, vuelve aquí y presiona ENTER.")
    print(f"  4) El script recorrerá {args.days} días hacia atrás día a día.")
    print("  5) Si se interrumpe, vuelve a correrlo y retoma donde quedó.")
    print()

    if args.reset and PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()
        log("Progreso anterior borrado por --reset.")

    state = load_progress()
    if state["pacientes"] or state["fechas_completas"]:
        log(f"Reanudando: {len(state['pacientes'])} pacientes, "
            f"{len(state['fechas_completas'])} días ya procesados.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=150)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        page.goto(BASE_URL)
        input(">> Tras iniciar sesión y ver tu agenda, presiona ENTER aquí... ")

        if not is_logged_in(page):
            page.goto(AGENDA_URL)
            page.wait_for_load_state("networkidle")

        all_dates = daterange_back(args.days)
        completed = set(state["fechas_completas"])

        for i, fecha in enumerate(all_dates, start=1):
            fecha_str = fecha.strftime("%Y-%m-%d")
            if fecha_str in completed:
                continue

            log(f"[{i}/{len(all_dates)}] {fecha_str}")

            try:
                page.goto(AGENDA_URL, wait_until="networkidle")
                if not is_logged_in(page):
                    log("  ! Sesión expiró. Re-loguéate en el navegador.")
                    input("  Presiona ENTER cuando hayas vuelto a entrar... ")
                    page.goto(AGENDA_URL, wait_until="networkidle")

                rows = scrape_day(page, fecha)
            except Exception as e:
                log(f"  ! Error al cargar agenda: {e}")
                traceback.print_exc()
                continue

            nuevos = 0
            for row in rows:
                ficha = row["ficha"]
                if not ficha or ficha in state["pacientes"]:
                    continue
                try:
                    detail = context.new_page()
                    data = scrape_ficha(detail, row["cap"])
                    detail.close()
                except Exception as e:
                    log(f"  ! Error en ficha {ficha} (cap={row['cap']}): {e}")
                    continue

                state["pacientes"][ficha] = {
                    "ficha": ficha,
                    **data,
                    "fecha_referencia": fecha_str,
                }
                nuevos += 1
                time.sleep(DELAY_BETWEEN_FICHAS)

            state["fechas_completas"].append(fecha_str)
            save_progress(state)
            log(f"  +{nuevos} pacientes nuevos · {len(state['pacientes'])} únicos en total")
            time.sleep(DELAY_BETWEEN_DAYS)

        browser.close()

    csv_path = export_csv(state)
    log(f"CSV exportado: {csv_path}  ({len(state['pacientes'])} pacientes)")

    cifrar = input(">> ¿Cifrar el CSV con contraseña? [s/N] ").strip().lower()
    if cifrar.startswith("s"):
        pwd = getpass("Contraseña: ")
        pwd2 = getpass("Confirma:   ")
        if pwd != pwd2:
            log("Las contraseñas no coinciden. El CSV queda sin cifrar.")
            return 1
        encrypted = encrypt_file(csv_path, pwd)
        csv_path.unlink()
        log(f"Cifrado: {encrypted}")
        log("Para descifrar: python encryptor.py decrypt <archivo.enc>")
    else:
        log("CSV queda sin cifrar. Muévelo a un lugar seguro y bórralo de aquí.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
