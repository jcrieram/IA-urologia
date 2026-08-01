import { DataProvider } from '../types';
import { Debt, Txn } from '../../models/types';

/**
 * Placeholder de integración con Fintoc (open banking Chile).
 *
 * IMPORTANTE — arquitectura segura:
 *  - La llave SECRETA de Fintoc (sk_...) NUNCA debe vivir en la app móvil.
 *    Debe estar en un backend propio (ej: función serverless) que la app llama.
 *  - El flujo real es:
 *      1) La app abre el Widget de Fintoc; el usuario autoriza en su banco.
 *      2) El widget devuelve un `exchange token` a la app.
 *      3) La app manda ese token al backend.
 *      4) El backend lo intercambia por un `link token` (con la sk_) y lo guarda cifrado.
 *      5) El backend usa el link token para pedir cuentas / movimientos / deudas
 *         y se los devuelve a la app ya normalizados.
 *  - Iniciar transferencias (Fintoc Pagos): el backend crea la intención de pago
 *    y el usuario CONFIRMA en su banco. La app nunca mueve plata sin esa confirmación.
 *
 * Config esperada (cuando exista el backend):
 */
export interface FintocConfig {
  /** URL base del backend propio que habla con Fintoc. */
  backendUrl?: string;
  /** Token de sesión del usuario contra el backend (no la sk_ de Fintoc). */
  sessionToken?: string;
}

export class FintocProvider implements DataProvider {
  id = 'fintoc';
  label = 'Fintoc (open banking)';

  constructor(private config: FintocConfig = {}) {}

  async isAvailable(): Promise<boolean> {
    return !!this.config.backendUrl && !!this.config.sessionToken;
  }

  async fetchTransactions(): Promise<Txn[]> {
    if (!(await this.isAvailable())) {
      throw new Error(
        'Fintoc aún no está configurado. Se necesita un backend con la llave secreta de Fintoc. Por ahora usa "Importar cartola".'
      );
    }
    // TODO: GET `${backendUrl}/transactions` con Authorization: Bearer sessionToken
    // y mapear la respuesta de Fintoc a Txn[].
    return [];
  }

  async fetchDebts(): Promise<Debt[]> {
    if (!(await this.isAvailable())) {
      throw new Error('Fintoc aún no está configurado.');
    }
    // TODO: GET `${backendUrl}/debts`
    return [];
  }
}
