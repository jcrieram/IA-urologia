import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Muted, SectionTitle } from '../../components/ui';
import { colors, radius, spacing } from '../../theme/colors';
import { useData } from '../../state/DataContext';
import { BankId, BANKS, Debt, DebtType } from '../../models/types';
import { formatCLP, parseCLP } from '../../utils/currency';

const BANK_OPTS: BankId[] = ['bancoestado', 'bancochile', 'scotiabank', 'itau', 'otro'];

export default function DebtsScreen() {
  const insets = useSafeAreaInsets();
  const { debts, addDebt, removeDebt } = useData();

  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState<BankId>('bancoestado');
  const [type, setType] = useState<DebtType>('tarjeta');
  const [product, setProduct] = useState('');
  const [total, setTotal] = useState('');
  const [min, setMin] = useState('');
  const [due, setDue] = useState('');

  const totalDebt = debts.reduce((s, d) => s + d.totalOwed, 0);

  async function save() {
    const totalNum = parseCLP(total);
    if (!totalNum || totalNum <= 0) {
      Alert.alert('Falta el monto', 'Ingresa la deuda total (mayor a 0).');
      return;
    }
    const id = (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${bank}${product}${total}${Date.now?.() ?? ''}${Math.random()}`)).slice(0, 16);
    const debt: Debt = {
      id,
      bank,
      type,
      product: product.trim() || (type === 'tarjeta' ? 'Tarjeta de crédito' : 'Crédito'),
      totalOwed: Math.abs(totalNum),
      minPayment: parseCLP(min) ?? undefined,
      dueDate: due.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await addDebt(debt);
    setOpen(false);
    setProduct('');
    setTotal('');
    setMin('');
    setDue('');
  }

  function confirmRemove(d: Debt) {
    Alert.alert('Eliminar deuda', `¿Eliminar "${d.product}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeDebt(d.id) },
    ]);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.h1}>Deudas</Text>
      <Muted>Tarjetas de crédito y créditos de consumo</Muted>

      <Card style={{ marginTop: spacing.lg }}>
        <SectionTitle>Deuda total</SectionTitle>
        <Text style={[styles.big, { color: colors.warning }]}>{formatCLP(totalDebt)}</Text>
        <Muted>{debts.length} productos</Muted>
      </Card>

      {debts.map((d) => (
        <Card key={d.id}>
          <View style={styles.between}>
            <View style={styles.rowCenter}>
              <View style={[styles.dot, { backgroundColor: BANKS[d.bank].color }]} />
              <Text style={styles.itemLabel}>{d.product}</Text>
            </View>
            <Pressable onPress={() => confirmRemove(d)}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Eliminar</Text>
            </Pressable>
          </View>
          <Text style={[styles.big, { color: colors.text, fontSize: 20 }]}>{formatCLP(d.totalOwed)}</Text>
          <Muted>
            {BANKS[d.bank].label} · {d.type === 'tarjeta' ? 'Tarjeta' : 'Crédito'}
            {d.minPayment ? ` · Mínimo ${formatCLP(d.minPayment)}` : ''}
            {d.dueDate ? ` · Vence ${d.dueDate}` : ''}
          </Muted>
        </Card>
      ))}

      {!open ? (
        <Button title="+ Agregar deuda" onPress={() => setOpen(true)} variant="ghost" />
      ) : (
        <Card>
          <SectionTitle>Nueva deuda</SectionTitle>
          <Muted>Banco</Muted>
          <View style={styles.chips}>
            {BANK_OPTS.map((b) => (
              <Chip key={b} label={BANKS[b].label} active={bank === b} onPress={() => setBank(b)} />
            ))}
          </View>
          <View style={{ height: spacing.md }} />
          <Muted>Tipo</Muted>
          <View style={styles.chips}>
            <Chip label="Tarjeta de crédito" active={type === 'tarjeta'} onPress={() => setType('tarjeta')} />
            <Chip label="Crédito de consumo" active={type === 'credito'} onPress={() => setType('credito')} />
          </View>

          <Field label="Nombre del producto (opcional)" value={product} onChange={setProduct} placeholder="Visa Falabella" />
          <Field label="Deuda total (CLP)" value={total} onChange={setTotal} placeholder="1.250.000" keyboard="numeric" />
          <Field label="Pago mínimo (opcional)" value={min} onChange={setMin} placeholder="85.000" keyboard="numeric" />
          <Field label="Vencimiento (opcional, yyyy-mm-dd)" value={due} onChange={setDue} placeholder="2026-08-15" />

          <View style={{ height: spacing.sm }} />
          <Button title="Guardar deuda" onPress={save} />
          <View style={{ height: spacing.sm }} />
          <Button title="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
        </Card>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: 'default' | 'numeric';
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Muted>{label}</Muted>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={keyboard ?? 'default'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 2 },
  big: { fontSize: 24, fontWeight: '800', marginVertical: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  itemLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, rowGap: spacing.sm, marginTop: 6 },
  input: {
    marginTop: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
});
