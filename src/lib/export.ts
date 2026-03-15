import { getDb } from './db';

export async function exportDatabase() {
  try {
    // In @sqlite.org/sqlite-wasm with OPFS, getting the raw DB file from OPFS requires using the File System Access API
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle('ledgerllama.sqlite3', { create: false });
    const file = await fileHandle.getFile();
    
    // Trigger download
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerllama_backup_${new Date().toISOString().split('T')[0]}.sqlite3`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Failed to export DB', err);
    throw err;
  }
}

export async function exportCsvData() {
  const db = getDb();
  try {
    const transactions = await db.exec('SELECT * FROM transactions ORDER BY date DESC');
    if (!transactions.length) return;
    
    const header = Object.keys(transactions[0]).join(',');
    const rows = transactions.map((row: any) => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = [header, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerllama_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Failed to export CSV', err);
    throw err;
  }
}

export async function exportJsonData() {
  const db = getDb();
  try {
    const transactions = await db.exec('SELECT * FROM transactions');
    const categories = await db.exec('SELECT * FROM categories');
    const habits = await db.exec('SELECT * FROM habits');
    const habit_logs = await db.exec('SELECT * FROM habit_logs');
    const budgets = await db.exec('SELECT * FROM budgets');
    const goals = await db.exec('SELECT * FROM goals');

    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      transactions,
      categories,
      habits,
      habit_logs,
      budgets,
      goals
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerllama_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Failed to export JSON', err);
    throw err;
  }
}

async function encryptData(data: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );
  
  const result = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedContent), salt.length + iv.length);
  
  return result.buffer;
}

export async function exportEncryptedDatabase(password: string) {
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle('ledgerllama.sqlite3', { create: false });
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();

    const encryptedBuffer = await encryptData(arrayBuffer, password);

    const blob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerllama_backup_${new Date().toISOString().split('T')[0]}.sqlite3.enc`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Failed to export encrypted DB', err);
    throw err;
  }
}
