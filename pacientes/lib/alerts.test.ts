import { describe, expect, it } from "vitest";
import { esNoConcretada, esPagoPendiente } from "./alerts";

const AHORA = new Date("2026-08-16T12:00:00Z");

describe("esNoConcretada", () => {
  it("es true si han pasado mas de 18 dias en estado solicitud", () => {
    expect(esNoConcretada("2026-07-20", "solicitud", AHORA)).toBe(true);
  });

  it("es false si aun no pasan 18 dias", () => {
    expect(esNoConcretada("2026-08-10", "solicitud", AHORA)).toBe(false);
  });

  it("es false si ya esta agendada", () => {
    expect(esNoConcretada("2026-07-01", "agendada", AHORA)).toBe(false);
  });

  it("es false sin fecha de solicitud", () => {
    expect(esNoConcretada(null, "solicitud", AHORA)).toBe(false);
  });
});

describe("esPagoPendiente", () => {
  it("es true si operada hace mas de 30 dias sin pago", () => {
    expect(esPagoPendiente("2026-07-01", "operada", false, AHORA)).toBe(true);
  });

  it("es false si ya tiene pago registrado", () => {
    expect(esPagoPendiente("2026-07-01", "operada", true, AHORA)).toBe(false);
  });

  it("es false si aun no pasan 30 dias", () => {
    expect(esPagoPendiente("2026-08-01", "operada", false, AHORA)).toBe(false);
  });

  it("es false si el caso sigue en solicitud", () => {
    expect(esPagoPendiente("2026-07-01", "solicitud", false, AHORA)).toBe(false);
  });
});
