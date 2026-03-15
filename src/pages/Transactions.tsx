import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionModal } from '../components/TransactionModal';
import { Plus, Trash2, ArrowDownRight, ArrowUpRight, Receipt, Upload } from 'lucide-react';
import { parseAndImportCsv } from '../lib/csv-import';

export default function Transactions() {
  const { transactions, loading, addTransaction, deleteTransaction, refresh } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.category_id && tx.category_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground mt-1">Manage your local financial records.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import CSV'}
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              disabled={importing}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImporting(true);
                try {
                  const result = await parseAndImportCsv(file);
                  alert(`Import complete: ${result.success} succeeded, ${result.failed} failed.`);
                  refresh();
                } catch (err) {
                  console.error(err);
                  alert('Import failed.');
                } finally {
                  setImporting(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading from OPFS...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <p>No transactions found.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-primary hover:underline text-sm font-medium"
            >
              Add your first transaction →
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-4 border-b border-border">
              <input
                type="text"
                placeholder="Search description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:max-w-sm h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      {tx.category_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                          {tx.category_id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium">
                      <div className="flex items-center justify-end gap-1">
                        {tx.type === 'expense' ? (
                          <ArrowDownRight className="w-3 h-3 text-destructive" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                        )}
                        <span className={tx.type === 'expense' ? 'text-foreground' : 'text-green-500'}>
                          ${Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No matching transactions found.
              </div>
            )}
          </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addTransaction}
      />
    </div>
  );
}

// Ensure Receipt is imported or just use generic text if not
// Ah I forgot to import Receipt. Let me add it.
