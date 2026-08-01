import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getEncryptionKey } from '../security/secureKey';
import { EMPTY_VAULT, Vault } from '../models/types';

const VAULT_ID = 'vault_encrypted_v1';

/**
 * Capa de datos cifrada. El vault (movimientos + deudas) se serializa a JSON,
 * se cifra con AES usando la clave del keystore y se guarda en AsyncStorage.
 * En reposo, en el disco del teléfono, los datos quedan cifrados.
 */
export async function loadVault(): Promise<Vault> {
  const blob = await AsyncStorage.getItem(VAULT_ID);
  if (!blob) return { ...EMPTY_VAULT };
  try {
    const key = await getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(blob, key);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) return { ...EMPTY_VAULT };
    const parsed = JSON.parse(json) as Vault;
    return {
      version: parsed.version ?? 1,
      transactions: parsed.transactions ?? [],
      debts: parsed.debts ?? [],
    };
  } catch (e) {
    console.warn('No se pudo descifrar el vault:', e);
    return { ...EMPTY_VAULT };
  }
}

export async function saveVault(vault: Vault): Promise<void> {
  const key = await getEncryptionKey();
  const json = JSON.stringify(vault);
  const cipher = CryptoJS.AES.encrypt(json, key).toString();
  await AsyncStorage.setItem(VAULT_ID, cipher);
}

export async function wipeVault(): Promise<void> {
  await AsyncStorage.removeItem(VAULT_ID);
}
