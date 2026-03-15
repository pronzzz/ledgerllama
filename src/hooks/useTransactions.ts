import { useState, useEffect } from 'react';
import { getDb } from '../lib/db';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category_id: string | null;
  type: 'income' | 'expense';
  ai_categorized: number;
  ai_confidence: number | null;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const db = getDb();
    try {
      const res = await db.exec<Transaction>(
        'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
      );
      setTransactions(res);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'ai_categorized' | 'ai_confidence'>) => {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.exec(
      `INSERT INTO transactions (id, amount, date, description, category_id, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, tx.amount, tx.date, tx.description, tx.category_id, tx.type]
    );
    await fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    const db = getDb();
    await db.exec('DELETE FROM transactions WHERE id = ?', [id]);
    await fetchTransactions();
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  };
}
