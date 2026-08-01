import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bar, Card, Chip, Muted, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme/colors';
import { useData } from '../../state/DataContext';
import { formatCLP } from '../../utils/currency';
import { BANKS, BankId } from '../../models/types';
import { byCategory, byMerchant, filterByRange, presetRange, totals, Bucket } from './aggregate';

const TODAY = new Date().toISOString().slice(0, 10);
type Preset = 'mes' | '30d' | '90d' | 'todo';
const PRESETS: { key: Preset; label: string }[] = [
  { key: 'mes', label: 'Este mes' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'todo', label: 'Todo' },
];
type GroupBy = 'categoria' | 'comercio';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions } = useData();
  const [preset, setPreset] = useState<Preset>('mes');
  const [groupBy, setGroupBy] = useState<GroupBy>('categoria');

  const filtered = useMemo(
    () => filterByRange(transactions, presetRange(preset, TODAY)),
    [transactions, preset]
  );
  const t = useMemo(() => totals(filtered), [filtered]);
  const buckets: Bucket[] = useMemo(
    () => (groupBy === 'categoria' ? byCategory(filtered) : byMerchant(filtered, 20)),
    [filtered, groupBy]
  );
  const max = buckets[0]?.total ?? 1;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.h1}>Informes</Text>
      <Muted>Gastos por fecha, comercio y categoría</Muted>

      <View style={[styles.chips, { marginTop: spacing.lg }]}>
        {PRESETS.map((p) => (
          <Chip key={p.key} label={p.label} active={preset === p.key} onPress={() => setPreset(p.key)} />
        ))}
      </View>

      <View style={styles.row}>
        <Card style={styles.third}>
          <SectionTitle>Gastos</SectionTitle>
          <Text style={[styles.mid, { color: colors.danger }]}>{formatCLP(t.gastos)}</Text>
        </Card>
        <Card style={styles.third}>
          <SectionTitle>Ingresos</SectionTitle>
          <Text style={[styles.mid, { color: colors.success }]}>{formatCLP(t.ingresos)}</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.chips}>
          <Chip label="Por categoría" active={groupBy === 'categoria'} onPress={() => setGroupBy('categoria')} />
          <Chip label="Por comercio" active={groupBy === 'comercio'} onPress={() => setGroupBy('comercio')} />
        </View>
        <View style={{ height: spacing.md }} />
        {buckets.length === 0 ? (
          <Muted>No hay gastos en este período.</Muted>
        ) : (
          buckets.map((b) => (
            <View key={b.key} style={{ marginBottom: spacing.md }}>
              <View style={styles.between}>
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {b.key}
                </Text>
                <Text style={styles.itemValue}>{formatCLP(b.total)}</Text>
              </View>
              <Bar ratio={b.total / max} />
              <Muted>{b.count} movs</Muted>
            </View>
          ))
        )}
      </Card>

      <Card>
        <SectionTitle>Últimos movimientos</SectionTitle>
        {filtered.length === 0 ? (
          <Muted>Sin movimientos en el período.</Muted>
        ) : (
          filtered.slice(0, 40).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {tx.merchant || tx.description}
                </Text>
                <Muted>
                  {tx.date} · {BANKS[tx.bank as BankId]?.label ?? tx.bank} · {tx.category}
                </Muted>
              </View>
              <Text style={[styles.itemValue, { color: tx.amount < 0 ? colors.text : colors.success }]}>
                {formatCLP(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, rowGap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  third: { flex: 1 },
  mid: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  itemValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
