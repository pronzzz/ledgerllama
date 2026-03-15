import { useState } from 'react';
import { exportDatabase, exportCsvData, exportJsonData, exportEncryptedDatabase } from '../lib/export';
import { Download, Database, FileText, Lock, FileJson } from 'lucide-react';

export default function Settings() {
  const [exportingDb, setExportingDb] = useState(false);

  const [encryptionPassword, setEncryptionPassword] = useState('');

  const handleExportDb = async () => {
    setExportingDb(true);
    try {
      if (encryptionPassword) {
        await exportEncryptedDatabase(encryptionPassword);
      } else {
        await exportDatabase();
      }
    } catch {
      alert("Failed to export database. OPFS might not be accessible.");
    } finally {
      setExportingDb(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsvData();
    } catch {
      alert("Failed to export CSV.");
    }
  };
  const handleExportJson = async () => {
    try {
      await exportJsonData();
    } catch {
      alert("Failed to export JSON.");
    }
  };
  const [pin, setPin] = useState('');
  const [isPinSet, setIsPinSet] = useState(!!localStorage.getItem('ledger_pin'));

  const handleSetPin = () => {
    if (pin.length >= 4) {
      localStorage.setItem('ledger_pin', pin);
      setIsPinSet(true);
      setPin('');
    } else {
      alert("PIN must be at least 4 characters.");
    }
  };

  const handleClearPin = () => {
    localStorage.removeItem('ledger_pin');
    setIsPinSet(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Settings & Export</h2>
        <p className="text-muted-foreground mt-1">Manage your local data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Export Database</h3>
              <p className="text-sm text-muted-foreground">Download your raw SQLite DB</p>
            </div>
          </div>
          <p className="text-sm mt-2">
            LedgerLlama stores everything in standard SQLite format in your browser. You can download this file and open it with any standard SQLite viewer.
          </p>
          <div className="mt-auto space-y-3">
            <input
              type="password"
              placeholder="Optional backup password"
              value={encryptionPassword}
              onChange={e => setEncryptionPassword(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={handleExportDb}
              disabled={exportingDb}
              className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              <Download className="w-4 h-4" /> {exportingDb ? 'Exporting...' : (encryptionPassword ? 'Download Encrypted (.enc)' : 'Download .sqlite3')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Export JSON</h3>
              <p className="text-sm text-muted-foreground">Download all data as JSON</p>
            </div>
          </div>
          <p className="text-sm mt-2">
            Get a single file containing all your transactions, habits, budgets, and goals in standard JSON format.
          </p>
          <button
            onClick={handleExportJson}
            className="mt-auto inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Export CSV</h3>
              <p className="text-sm text-muted-foreground">Download transactions as CSV</p>
            </div>
          </div>
          <p className="text-sm mt-2">
            Need a spreadsheet? Export all your transactions to a CSV file.
          </p>
          <button
            onClick={handleExportCsv}
            className="mt-auto inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">App Security</h3>
              <p className="text-sm text-muted-foreground">Idle-timeout lock screen</p>
            </div>
          </div>
          <p className="text-sm mt-2">
            Set a PIN to lock the app after 5 minutes of inactivity. This adds a local privacy layer if you leave your browser open.
          </p>
          <div className="mt-auto flex flex-col gap-3">
            {isPinSet ? (
              <button
                onClick={handleClearPin}
                className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium border border-destructive text-destructive hover:bg-destructive/10 h-10 px-4 py-2 w-full"
              >
                Disable PIN Lock
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter new PIN"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  onClick={handleSetPin}
                  className="rounded-md bg-primary text-primary-foreground h-10 px-4 hover:bg-primary/90 font-medium text-sm"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
