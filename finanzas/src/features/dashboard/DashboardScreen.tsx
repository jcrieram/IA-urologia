import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../state/DataContext';
import { Bar, Card, Muted, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme/colors';
import { formatCLP } from '../../utils/currency';
import { byCategory, filterByRange, presetRange, totals } from '../reports/aggregate';
import { BANKS } from '../../models/types';

const TODAY = new Date().toISOString().slice(0, 10);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, debts } = useData();

  const monthTxns = useMemo(
    () => filterByRange(transactions, presetRange('mes', TODAY)),
    [transactions]
  );
  const t = useMemo(() => totals(monthTxns), [monthTxns]);
  const cats = useMemo(() => byCategory(monthTxns).slice(0, 5), [monthTxns]);
  const totalDebt = useMemo(() => debts.reduce((s, d) => s + d.totalOwed, 0), [debts]);
  const maxCat = cats[0]?.total ?? 1;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.h1}>Mis Finanzas</Text>
      <Muted>Resumen del mes en curso</Muted>

      <View style={styles.row}>
        <Card style={styles.half}>
          <SectionTitle>Gastos del mes</SectionTitle>
          <Text style={[styles.big, { color: colors.danger }]}>{formatCLP(t.gastos)}</Text>
        </Card>
        <Card style={styles.half}>
          <SectionTitle>Ingresos</SectionTitle>
          <Text style={[styles.big, { color: colors.success }]}>{formatCLP(t.ingresos)}</Text>
        </Card>
      </View>

      <Card>
        <SectionTitle>Balance neto del mes</SectionTitle>
        <Text style={[styles.big, { color: t.neto >= 0 ? colors.success : colors.danger }]}>
          {formatCLP(t.neto)}
        </Text>
        <Muted>{t.count} movimientos</Muted>
      </Card>

      <Card>
        <SectionTitle>Deuda total (tarjetas + créditos)</SectionTitle>
        <Text style={[styles.big, { color: colors.warning }]}>{formatCLP(totalDebt)}</Text>
        <Muted>{debts.length} productos registrados</Muted>
      </Card>

      <Card>
        <SectionTitle>Top categorías del mes</SectionTitle>
        {cats.length === 0 ? (
          <Muted>Aún no hay gastos. Importa una cartola para empezar.</Muted>
        ) : (
          cats.map((c) => (
            <View key={c.key} style={{ marginBottom: spacing.md }}>
              <View style={styles.between}>
                <Text style={styles.itemLabel}>{c.key}</Text>
                <Text style={styles.itemValue}>{formatCLP(c.total)}</Text>
              </View>
              <Bar ratio={c.total / maxCat} />
            </View>
          ))
        )}
      </Card>

      {debts.length === 0 && transactions.length === 0 && (
        <Card>
          <Text style={styles.itemLabel}>👋 Empieza aquí</Text>
          <Muted>
            Ve a la pestaña "Importar", descarga la cartola de tu banco ({Object.values(BANKS)
              .filter((b) => b.label !== 'Otro')
              .map((b) => b.label)
              .join(', ')}) en CSV y cárgala. Tus datos quedan cifrados solo en este teléfono.
          </Muted>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 2 },
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  half: { flex: 1 },
  big: { fontSize: 24, fontWeight: '800', marginVertical: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  itemValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
