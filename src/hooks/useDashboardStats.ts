import { useState, useEffect } from 'react';
import { getDb } from '../lib/db';

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  dailyTrend: { date: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const db = getDb();
    try {
      // Get current month dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      const balanceRes = await db.exec<{ total: number }>(`
        SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as total 
        FROM transactions
      `);
      
      const monthlyRes = await db.exec<{ income: number, expense: number }>(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE date >= ?
      `, [firstDay]);

      const trendRes = await db.exec<{ date: string; amount: number }>(`
        SELECT date, SUM(amount) as amount
        FROM transactions
        WHERE type = 'expense'
        GROUP BY date
        ORDER BY date DESC
        LIMIT 30
      `);

      const catRes = await db.exec<{ category: string; amount: number }>(`
        SELECT COALESCE(category_id, 'Uncategorized') as category, SUM(amount) as amount
        FROM transactions
        WHERE type = 'expense' AND date >= ?
        GROUP BY category_id
        ORDER BY amount DESC
      `, [firstDay]);

      setStats({
        totalBalance: balanceRes[0]?.total || 0,
        monthlyIncome: monthlyRes[0]?.income || 0,
        monthlyExpense: monthlyRes[0]?.expense || 0,
        dailyTrend: trendRes.reverse(),
        categoryBreakdown: catRes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refresh: fetchStats };
}
