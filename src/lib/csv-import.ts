import Papa from 'papaparse';
import { getDb } from './db';

export async function parseAndImportCsv(file: File) {
  return new Promise<{ success: number; failed: number }>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let success = 0;
        let failed = 0;
        const db = getDb();
        const queries: { sql: string; bind: any[] }[] = [];

        for (const row of results.data as any[]) {
          try {
            // Very naive auto-detection of common bank columns
            const dateStr = row.Date || row.date || row['Posting Date'] || row['Transaction Date'];
            const _amountStr = row.Amount || row.amount || row['Amount (USD)'] || row.Credit || row.Debit;
            const desc = row.Description || row.description || row.Payee || row.Name;

            if (!dateStr || !_amountStr || !desc) {
              failed++;
              continue;
            }

            const parsedDate = new Date(dateStr);
            if (isNaN(parsedDate.getTime())) {
              failed++;
              continue;
            }

            let amount = parseFloat(_amountStr.toString().replace(/[^0-9.-]+/g, ""));
            
            // If some banks use credit/debit columns
            if (row.Debit) { amount = -Math.abs(amount); }
            if (row.Credit) { amount = Math.abs(amount); }

            const type = amount < 0 ? 'expense' : 'income';
            
            queries.push({
              sql: 'INSERT INTO transactions (id, amount, date, description, type) VALUES (?, ?, ?, ?, ?)',
              bind: [crypto.randomUUID(), amount, parsedDate.toISOString().split('T')[0], desc.trim(), type]
            });
            success++;
          } catch (err) {
            console.error(err);
            failed++;
          }
        }
        
        try {
           await db.execMany(queries);
           resolve({ success, failed });
        } catch (dbErr) {
           reject(dbErr);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
