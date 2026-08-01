import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Muted, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme/colors';
import { BankId, BANKS } from '../../models/types';
import { parseCartolaCsv } from '../../providers/import/parseCartola';
import { useData } from '../../state/DataContext';
import { formatCLP } from '../../utils/currency';

const SELECTABLE: BankId[] = ['bancoestado', 'bancochile', 'scotiabank', 'itau', 'otro'];

export default function ImportScreen() {
  const insets = useSafeAreaInsets();
  const { addTransactions } = useData();
  const [bank, setBank] = useState<BankId>('bancoestado');
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  async function pickAndImport() {
    try {
      setBusy(true);
      setLastResult(null);
      setWarnings([]);

      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) {
        setBusy(false);
        return;
      }
      const asset = res.assets[0];
      let content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      // Muchas cartolas chilenas vienen en Latin-1; si hay caracteres corruptos,
      // reintentamos como cadena base64 -> utf8 no siempre ayuda, pero limpiamos BOM.
      content = content.replace(/^﻿/, '');

      const parsed = await parseCartolaCsv(content, bank, asset.name);
      setWarnings(parsed.warnings);

      if (parsed.txns.length === 0) {
        setLastResult('No se importó ningún movimiento.');
        setBusy(false);
        return;
      }
      const added = await addTransactions(parsed.txns);
      const dupes = parsed.txns.length - added;
      const totalGasto = parsed.txns.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
      setLastResult(
        `✅ ${added} movimientos nuevos importados` +
          (dupes > 0 ? ` (${dupes} ya existían)` : '') +
          `.\nGasto detectado en el archivo: ${formatCLP(totalGasto)}.`
      );
    } catch (e: any) {
      Alert.alert('Error al importar', e?.message ?? 'No se pudo leer el archivo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.h1}>Importar cartola</Text>
      <Muted>Descarga el movimiento de tu banco en CSV y cárgalo aquí.</Muted>

      <Card style={{ marginTop: spacing.lg }}>
        <SectionTitle>1 · Elige el banco</SectionTitle>
        <View style={styles.chips}>
          {SELECTABLE.map((b) => (
            <Chip key={b} label={BANKS[b].label} active={bank === b} onPress={() => setBank(b)} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>2 · Selecciona el archivo</SectionTitle>
        <Muted>Formato CSV (exporta desde la web/app del banco → "Descargar cartola").</Muted>
        <View style={{ height: spacing.md }} />
        <Button title={busy ? 'Procesando…' : 'Elegir archivo CSV'} onPress={pickAndImport} disabled={busy} />
      </Card>

      {lastResult && (
        <Card>
          <SectionTitle>Resultado</SectionTitle>
          <Text style={styles.result}>{lastResult}</Text>
          {warnings.map((w, i) => (
            <Text key={i} style={styles.warn}>
              • {w}
            </Text>
          ))}
        </Card>
      )}

      <Card>
        <SectionTitle>Privacidad</SectionTitle>
        <Muted>
          El archivo se procesa en tu teléfono y los movimientos se guardan cifrados localmente. No se
          envían a ningún servidor. No se guarda ninguna clave de tu banco.
        </Muted>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, rowGap: spacing.sm },
  result: { color: colors.text, fontSize: 15, lineHeight: 22 },
  warn: { color: colors.warning, fontSize: 13, marginTop: 6 },
});
