export class LocalDB {
  private worker: Worker;
  private messageId = 0;
  private requests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();
  public ready: Promise<void>;

  constructor() {
    this.worker = new Worker(new URL('./db-worker.ts', import.meta.url), { type: 'module' });
    
    this.ready = new Promise((resolve, reject) => {
      const handleReady = (e: MessageEvent) => {
        if (e.data.type === 'ready') {
          resolve();
          this.worker.removeEventListener('message', handleReady);
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.error));
          this.worker.removeEventListener('message', handleReady);
        }
      };
      this.worker.addEventListener('message', handleReady);
    });

    this.worker.postMessage({ type: 'init' });

    this.worker.onmessage = (e: MessageEvent) => {
      const { type, result, error, messageId } = e.data;
      if (messageId !== undefined && this.requests.has(messageId)) {
        const { resolve, reject } = this.requests.get(messageId)!;
        if (type === 'result') {
          resolve(result);
        } else if (type === 'error') {
          reject(new Error(error));
        }
        this.requests.delete(messageId);
      }
    };
  }

  async exec<T = any>(query: string, params: any[] = []): Promise<T[]> {
    await this.ready;
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.requests.set(id, { resolve, reject });
      this.worker.postMessage({
        type: 'exec',
        query,
        params,
        messageId: id,
      });
    });
  }

  async execMany(queries: { sql: string; bind?: any[] }[]): Promise<void> {
    await this.ready;
    // For simplicity, we execute them sequentially via worker. In a real app we might add batch processing.
    for (const q of queries) {
      await this.exec(q.sql, q.bind || []);
    }
  }
}

// Singleton pattern
let dbInstance: LocalDB | null = null;
export const getDb = () => {
  if (!dbInstance) {
    dbInstance = new LocalDB();
  }
  return dbInstance;
};
