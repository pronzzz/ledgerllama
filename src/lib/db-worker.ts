import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = console.log;
const error = console.error;

let db: any = null;

const start = async (workerId: string) => {
  log(`Initializing SQLite worker ${workerId}...`);
  try {
    // @ts-ignore
    const sqlite3 = await sqlite3InitModule({
      print: log,
      printErr: error,
    });
    
    log('Running SQLite3 version', sqlite3.version.libVersion);
    
    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/ledgerllama.sqlite3');
      log('OPFS database ready, transient?', db.isTransient);
    } else {
      db = new sqlite3.oo1.DB('/ledgerllama.sqlite3', 'ct');
      log('OPFS is not available, using volatile memory DB');
    }

    self.postMessage({ type: 'ready' });
  } catch (err: any) {
    error('SQLite initialization failed', err.name, err.message);
    self.postMessage({ type: 'error', error: err.message });
  }
};

self.onmessage = async (e: MessageEvent) => {
  const { type, query, params, messageId } = e.data;
  
  if (type === 'init') {
    start('worker-1');
    return;
  }
  
  if (!db) {
    self.postMessage({ type: 'error', error: 'Database not initialized', messageId });
    return;
  }

  try {
    if (type === 'exec') {
      const results: any[] = [];
      db.exec({
        sql: query,
        bind: params,
        rowMode: 'object',
        callback: (row: any) => {
          results.push(row);
        }
      });
      self.postMessage({ type: 'result', result: results, messageId });
    }
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message, messageId });
  }
};
