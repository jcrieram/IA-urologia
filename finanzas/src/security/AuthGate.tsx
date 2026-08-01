import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button, Muted } from '../components/ui';
import { colors, radius, spacing } from '../theme/colors';
import { isPinSet, setPin, verifyPin } from './pin';

type Mode = 'loading' | 'onboard' | 'locked' | 'unlocked';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('loading');
  const [pin, setPinInput] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const tryBiometric = useCallback(async () => {
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !enrolled) return false;
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquea Mis Finanzas',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Usar PIN',
      });
      return res.success;
    } catch {
      return false;
    }
  }, []);

  const boot = useCallback(async () => {
    const has = await isPinSet();
    if (!has) {
      setMode('onboard');
      return;
    }
    const ok = await tryBiometric();
    setMode(ok ? 'unlocked' : 'locked');
  }, [tryBiometric]);

  useEffect(() => {
    boot();
  }, [boot]);

  async function handleCreatePin() {
    setError(null);
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos.');
      return;
    }
    if (pin !== pin2) {
      setError('Los PIN no coinciden.');
      return;
    }
    await setPin(pin);
    setPinInput('');
    setPin2('');
    setMode('unlocked');
  }

  async function handleUnlock() {
    setError(null);
    const ok = await verifyPin(pin);
    if (ok) {
      setPinInput('');
      setMode('unlocked');
    } else {
      setError('PIN incorrecto.');
      setPinInput('');
    }
  }

  if (mode === 'unlocked') return <>{children}</>;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🔒</Text>
      <Text style={styles.title}>Mis Finanzas</Text>

      {mode === 'loading' && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}

      {mode === 'onboard' && (
        <View style={styles.box}>
          <Muted>Crea un PIN para proteger la app. Se usará junto a tu huella / Face ID.</Muted>
          <PinField value={pin} onChange={setPinInput} placeholder="Nuevo PIN" />
          <PinField value={pin2} onChange={setPin2} placeholder="Repite el PIN" />
          {error && <Text style={styles.err}>{error}</Text>}
          <View style={{ height: spacing.md }} />
          <Button title="Crear PIN" onPress={handleCreatePin} />
        </View>
      )}

      {mode === 'locked' && (
        <View style={styles.box}>
          <Muted>Ingresa tu PIN para continuar.</Muted>
          <PinField value={pin} onChange={setPinInput} placeholder="PIN" />
          {error && <Text style={styles.err}>{error}</Text>}
          <View style={{ height: spacing.md }} />
          <Button title="Desbloquear" onPress={handleUnlock} />
          <View style={{ height: spacing.sm }} />
          <Button title="Usar huella / Face ID" variant="ghost" onPress={boot} />
        </View>
      )}
    </View>
  );
}

function PinField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textDim}
      secureTextEntry
      keyboardType="number-pad"
      maxLength={12}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  logo: { fontSize: 44 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.sm },
  box: { width: '100%', maxWidth: 360, marginTop: spacing.xl },
  input: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
  },
  err: { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
});
