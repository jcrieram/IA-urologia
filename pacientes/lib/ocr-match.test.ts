import { describe, expect, it } from "vitest";
import { esDrRiera, determinarRol } from "./ocr-match";

describe("esDrRiera", () => {
  it("reconoce el nombre en distintos ordenes y con tildes", () => {
    expect(esDrRiera("RIERA MEDINA JUAN CARLOS")).toBe(true);
    expect(esDrRiera("Juan Carlos Riera M.")).toBe(true);
  });

  it("rechaza otros nombres", () => {
    expect(esDrRiera("ORDOÑEZ RODRIGUEZ LAURA")).toBe(false);
    expect(esDrRiera(null)).toBe(false);
    expect(esDrRiera(undefined)).toBe(false);
  });
});

describe("determinarRol", () => {
  it("asigna cirujano cuando el Dr. Riera aparece en el campo Cirujano", () => {
    expect(determinarRol("RIERA MEDINA JUAN CARLOS", "ORDOÑEZ RODRIGUEZ LAURA")).toEqual({
      rol: "cirujano",
      cirujanoPrincipal: null,
    });
  });

  it("asigna ayudante y guarda el cirujano principal cuando aparece en Ayudante", () => {
    expect(determinarRol("Dr. Juan Benavides", "RIERA MEDINA JUAN CARLOS")).toEqual({
      rol: "ayudante",
      cirujanoPrincipal: "Dr. Juan Benavides",
    });
  });

  it("por defecto asume cirujano si no reconoce el nombre en ningun campo", () => {
    expect(determinarRol("Alguien Mas", "Otra Persona")).toEqual({
      rol: "cirujano",
      cirujanoPrincipal: null,
    });
  });
});
