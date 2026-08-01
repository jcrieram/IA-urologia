# Mis Finanzas 🔒

App móvil **personal** para controlar tus finanzas de forma **segura**: importa las cartolas de tus bancos chilenos, ve informes de gastos por fecha / comercio / categoría y lleva el control de tus deudas de tarjetas y créditos.

Construida con **React Native + Expo**, pensada para correr en tu propio teléfono con **Expo Go**.

> **Bancos objetivo:** BancoEstado, Banco de Chile, Scotiabank, Itaú (y cualquier otro vía "Otro").

---

## 🛡️ Principios de seguridad

- **Nunca se guarda la clave de tu banco.** La app no inicia sesión en tu banco. Tú descargas la cartola y la importas.
- **Datos cifrados en el teléfono.** Los movimientos y deudas se guardan cifrados con AES; la llave vive en el **keystore seguro del dispositivo** (hardware-backed).
- **Acceso protegido.** La app se abre con **huella / Face ID** y un **PIN** de respaldo.
- **Sin servidores.** Todo el procesamiento ocurre en tu teléfono. Nada se sube a internet.

---

## 🚀 Cómo correrla (Expo Go)

Necesitas [Node.js 18+](https://nodejs.org) instalado en tu computador.

```bash
cd finanzas
npm install
npx expo start
```

1. Instala **Expo Go** en tu teléfono (App Store / Google Play).
2. Escanea el **QR** que aparece en la terminal (o en el navegador).
3. La app se abre en tu teléfono. La primera vez te pedirá **crear un PIN**.

> Si `npm install` reclama por versiones, corre `npx expo install --fix` y vuelve a `npx expo start`.

### Probar sin banco

En `finanzas/ejemplos/cartola_ejemplo.csv` hay una cartola de prueba. Envíatela al teléfono (correo / WhatsApp / Drive) y, en la pestaña **Importar**, elige "BancoEstado" y selecciónala.

---

## 📥 De dónde sacar la cartola (CSV) en cada banco

En general: entra a la web o app del banco → **Cuenta / Movimientos / Cartola** → **Descargar / Exportar** → elige **CSV** o **Excel** (si es Excel, ábrelo y "Guardar como CSV").

- **BancoEstado:** Saldos y movimientos → Descargar cartola.
- **Banco de Chile:** Mis cuentas → Cartola → Exportar.
- **Scotiabank:** Cuentas → Movimientos → Descargar.
- **Itaú:** Cuenta corriente → Movimientos → Exportar.

El **parser es flexible**: detecta automáticamente la fila de encabezados aunque la cartola traiga metadatos arriba, y reconoce columnas de *Fecha*, *Descripción* y *Monto* o *Cargo/Abono*. Si un formato no calza, avísame y agrego el mapeo específico.

---

## 🧭 Qué hace hoy (v0.1)

| Función | Estado |
|---|---|
| Acceso con biometría + PIN | ✅ |
| Cifrado local de datos | ✅ |
| Importar cartola CSV (4 bancos + genérico) | ✅ |
| Informes por fecha / comercio / categoría | ✅ |
| Registro y control de deudas (tarjetas / créditos) | ✅ |
| Dashboard resumen del mes | ✅ |

## 🔜 Roadmap

- **Conexión automática con Fintoc (open banking Chile)** → leer movimientos y deudas sin importar manualmente, e **iniciar transferencias que confirmas tú en tu banco**. La arquitectura ya está preparada (`src/providers/fintoc/`), pero requiere:
  1. Una cuenta/keys de **Fintoc** (onboarding B2B).
  2. Un **backend** propio donde vive la llave secreta (nunca en la app).
- Soporte de importación desde **Excel (.xlsx)** directo.
- Categorización editable y presupuestos por categoría.
- Exportar informes a PDF.

---

## 🗂️ Estructura

```
finanzas/
├─ App.tsx                     # arma la app: SafeArea > Data > AuthGate > Navegación
├─ src/
│  ├─ security/                # PIN, biometría, clave de cifrado (keystore)
│  ├─ storage/                 # vault cifrado (AES) sobre AsyncStorage
│  ├─ state/                   # DataContext (estado global de movimientos/deudas)
│  ├─ providers/
│  │  ├─ import/               # parser de cartolas CSV + pistas por banco
│  │  └─ fintoc/               # integración open banking (placeholder listo)
│  ├─ features/
│  │  ├─ dashboard/            # resumen
│  │  ├─ import/               # importar cartola
│  │  ├─ reports/              # informes + agregaciones
│  │  └─ debts/                # deudas
│  ├─ components/              # UI compartida
│  └─ utils/                   # formato CLP, categorías
└─ ejemplos/                   # cartola de prueba
```

---

## ⚠️ Sobre las transferencias

Por seguridad, **ninguna app debería mover tu dinero sin tu confirmación en el banco**. El plan es: la app *prepara* la transferencia (vía Fintoc Pagos) y **tú la confirmas en tu propio banco**. Eso es una protección, no una limitación.
