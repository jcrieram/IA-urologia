import { describe, expect, it } from "vitest";
import { esRutValido, formatearRut, normalizarRut } from "./rut";

describe("esRutValido", () => {
  it("acepta un RUT valido con DV numerico", () => {
    expect(esRutValido("15.374.351-7")).toBe(true);
  });

  it("acepta un RUT valido con DV K", () => {
    expect(esRutValido("13264490-K")).toBe(true);
  });

  it("rechaza un DV incorrecto", () => {
    expect(esRutValido("15.374.351-8")).toBe(false);
  });

  it("rechaza texto que no es RUT", () => {
    expect(esRutValido("")).toBe(false);
    expect(esRutValido("abc")).toBe(false);
  });
});

describe("formatearRut", () => {
  it("formatea con puntos y guion", () => {
    expect(formatearRut("153743517")).toBe("15.374.351-7");
  });
});

describe("normalizarRut", () => {
  it("quita puntos y deja guion, DV en mayuscula", () => {
    expect(normalizarRut("13.264.490-k")).toBe("13264490-K");
  });
});
