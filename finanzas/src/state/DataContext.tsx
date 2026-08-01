import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Debt, Txn, Vault, EMPTY_VAULT } from '../models/types';
import { loadVault, saveVault, wipeVault } from '../storage/db';

interface DataContextValue {
  loading: boolean;
  transactions: Txn[];
  debts: Debt[];
  /** Agrega movimientos deduplicando por id. Devuelve cuántos eran nuevos. */
  addTransactions: (incoming: Txn[]) => Promise<number>;
  addDebt: (debt: Debt) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  removeDebt: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<Vault>(EMPTY_VAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const v = await loadVault();
      setVault(v);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: Vault) => {
    setVault(next);
    await saveVault(next);
  }, []);

  const addTransactions = useCallback(
    async (incoming: Txn[]) => {
      const existing = new Set(vault.transactions.map((t) => t.id));
      const fresh = incoming.filter((t) => !existing.has(t.id));
      if (fresh.length === 0) return 0;
      const merged = [...vault.transactions, ...fresh].sort((a, b) => (a.date < b.date ? 1 : -1));
      await persist({ ...vault, transactions: merged });
      return fresh.length;
    },
    [vault, persist]
  );

  const addDebt = useCallback(
    async (debt: Debt) => {
      await persist({ ...vault, debts: [...vault.debts, debt] });
    },
    [vault, persist]
  );

  const updateDebt = useCallback(
    async (debt: Debt) => {
      await persist({ ...vault, debts: vault.debts.map((d) => (d.id === debt.id ? debt : d)) });
    },
    [vault, persist]
  );

  const removeDebt = useCallback(
    async (id: string) => {
      await persist({ ...vault, debts: vault.debts.filter((d) => d.id !== id) });
    },
    [vault, persist]
  );

  const clearAll = useCallback(async () => {
    await wipeVault();
    setVault({ ...EMPTY_VAULT });
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      transactions: vault.transactions,
      debts: vault.debts,
      addTransactions,
      addDebt,
      updateDebt,
      removeDebt,
      clearAll,
    }),
    [loading, vault, addTransactions, addDebt, updateDebt, removeDebt, clearAll]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
