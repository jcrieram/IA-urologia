import Anthropic from "@anthropic-ai/sdk";

let cliente: Anthropic | null = null;

export function crearClienteAnthropic(): Anthropic {
  if (!cliente) {
    cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cliente;
}

/** Modelo con vision usado para la extraccion OCR de documentos. */
export const MODELO_OCR = "claude-sonnet-4-5";
