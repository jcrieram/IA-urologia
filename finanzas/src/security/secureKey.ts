import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENC_KEY_ID = 'vault_enc_key_v1';

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Devuelve la clave de cifrado del vault. Si no existe, genera una aleatoria
 * de 256 bits y la guarda en el keystore seguro del dispositivo (hardware-backed
 * en la mayoría de teléfonos). La clave NUNCA sale del dispositivo.
 */
export async function getEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENC_KEY_ID);
  if (existing) return existing;
  const random = await Crypto.getRandomBytesAsync(32);
  const key = toHex(random);
  await SecureStore.setItemAsync(ENC_KEY_ID, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}
