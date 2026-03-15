import { useState } from 'react';
import { CreateWebWorkerMLCEngine, type InitProgressReport, WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import { getDb } from '../lib/db';
import type { Transaction } from './useTransactions';

// Use a smaller model for fast local inference like Llama-3-8B-Instruct-q4f32_1-MLC or similar
const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC';

export function useIntelligence() {
  const [engine, setEngine] = useState<WebWorkerMLCEngine | null>(null);
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [categorizing, setCategorizing] = useState(false);

  const initEngine = async () => {
    if (engine || isLoading) return;
    setIsLoading(true);
    
    try {
      const newEngine = await CreateWebWorkerMLCEngine(
        new Worker(new URL('../lib/ai-worker.js', import.meta.url), { type: 'module' }),
        SELECTED_MODEL,
        {
          initProgressCallback: (progress) => {
            setProgress(progress);
          }
        }
      );
      setEngine(newEngine);
      setIsReady(true);
    } catch (err) {
      console.error('Failed to init WebLLM', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeTransactions = async () => {
    if (!engine || !isReady) return;
    setCategorizing(true);
    const db = getDb();
    
    try {
      // Fetch uncategorized transactions
      const uncategorized = await db.exec<Transaction>(
        "SELECT * FROM transactions WHERE category_id IS NULL AND type = 'expense' LIMIT 10"
      );

      if (uncategorized.length === 0) {
        setCategorizing(false);
        return 0;
      }

      // Fetch user's existing categories to provide as context
      const dbCategories = await db.exec<{ name: string }>("SELECT name FROM categories WHERE type = 'expense'");
      const categoryNames = dbCategories.map(c => c.name).join(', ') || 'Groceries, Utilities, Rent, Dining, Entertainment, Transport, Health, Software';

      let categorizedCount = 0;

      for (const tx of uncategorized) {
        const prompt = `
You are a financial categorization AI.
Assign exactly one category to the following transaction.
Choose from exactly these categories: ${categoryNames}.
If none fit, invent a single concise word for the category.
Respond with ONLY the category name. No explanations.

Transaction Description: "${tx.description}"
Amount: ${tx.amount}
`;

        const reply = await engine.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 10,
        });

        const suggestedCategory = reply.choices[0].message.content?.trim();
        if (suggestedCategory) {
          // Ensure category exists
          await db.exec('INSERT OR IGNORE INTO categories (id, name, type) VALUES (?, ?, ?)', [
            crypto.randomUUID(), suggestedCategory, 'expense'
          ]);
          
          // Update transaction
          await db.exec('UPDATE transactions SET category_id = ?, ai_categorized = 1 WHERE id = ?', [
            suggestedCategory, tx.id
          ]);
          categorizedCount++;
        }
      }
      
      return categorizedCount;
    } catch (err) {
      console.error(err);
      return 0;
    } finally {
      setCategorizing(false);
    }
  };

  const generateInsight = async (): Promise<string | null> => {
    if (!engine || !isReady) return null;
    try {
      const db = getDb();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const expenses = await db.exec<{ category: string, total: number }>(`
        SELECT COALESCE(category_id, 'Uncategorized') as category, SUM(amount) as total
        FROM transactions
        WHERE type = 'expense' AND date >= ?
        GROUP BY category_id
        ORDER BY total ASC
      `, [thirtyDaysAgo]);

      if (expenses.length === 0) return "Not enough data from the last 30 days to generate insights.";

      const dataStr = expenses.map(e => `${e.category}: $${Math.abs(e.total).toFixed(2)}`).join(', ');

      const prompt = `
You are a sharp, concise financial advisor AI. The user had the following expenses over the last 30 days:
${dataStr}

Write a very short (1-2 sentences) insight. Point out their biggest expense and offer one quick actionable tip. No fluff.
`;
      const reply = await engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
      });

      return reply.choices[0].message.content?.trim() || "No insights generated.";
    } catch (err) {
      console.error(err);
      return "Failed to generate insight.";
    }
  };

  const sendChatMessage = async (messages: {role: 'user'|'assistant'|'system', content: string}[]): Promise<string | null> => {
    if (!engine || !isReady) return null;
    try {
      const reply = await engine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });
      return reply.choices[0].message.content?.trim() || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return { isReady, progress, isLoading, initEngine, categorizeTransactions, categorizing, generateInsight, sendChatMessage };
}
