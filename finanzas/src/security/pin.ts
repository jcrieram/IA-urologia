import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_HASH_ID = 'app_pin_hash_v1';
const PIN_SALT_ID = 'app_pin_salt_v1';

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`
  );
}

export async function isPinSet(): Promise<boolean> {
  const h = await SecureStore.getItemAsync(PIN_HASH_ID);
  return !!h;
}

export async function setPin(pin: string): Promise<void> {
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = toHex(saltBytes);
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(PIN_SALT_ID, salt);
  await SecureStore.setItemAsync(PIN_HASH_ID, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const salt = await SecureStore.getItemAsync(PIN_SALT_ID);
  const stored = await SecureStore.getItemAsync(PIN_HASH_ID);
  if (!salt || !stored) return false;
  const hash = await hashPin(pin, salt);
  // comparación simple; el hash tiene longitud fija
  return hash === stored;
}
