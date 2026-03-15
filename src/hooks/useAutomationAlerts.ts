import { useState, useEffect } from 'react';
import { getDb } from '../lib/db';

export function useAutomationAlerts() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const db = getDb();
        const newAlerts: string[] = [];
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // Rule 1: Single large transaction > $500
        const largeTx = await db.exec<{amount: number, description: string}>(`
          SELECT amount, description FROM transactions 
          WHERE type = 'expense' AND date >= ? AND amount > 500
        `, [firstDay]);
        
        if (largeTx.length > 0) {
          newAlerts.push(`Heads up! You have ${largeTx.length} transaction(s) over $500 this month.`);
        }

        // Rule 2: High spending category threshold (> $300)
        const catSpending = await db.exec<{category: string, total: number}>(`
          SELECT COALESCE(category_id, 'Uncategorized') as category, SUM(amount) as total FROM transactions
          WHERE type = 'expense' AND date >= ?
          GROUP BY category_id
        `, [firstDay]);
        
        catSpending.forEach(c => {
          if (c.total > 400 && c.category !== 'Rent' && c.category !== 'Mortgage') {
            newAlerts.push(`Alert: You've spent $${c.total.toFixed(2)} on ${c.category} this month. Consider budgeting!`);
          }
        });

        setAlerts(newAlerts);
      } catch (err) {
        console.error('Failed to run automation rules', err);
      }
    };
    fetchAlerts();
  }, []);

  return alerts;
}
