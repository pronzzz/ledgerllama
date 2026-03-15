import { LocalDB } from './db';

export interface Migration {
  version: number;
  name: string;
  up: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        ai_categorized INTEGER DEFAULT 0,
        ai_confidence REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        color TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        target_days_per_week INTEGER DEFAULT 7,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('completed', 'skipped', 'failed')),
        notes TEXT,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL CHECK(period IN ('monthly', 'weekly', 'yearly')),
        start_date TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        target_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_analysis_logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('weekly_summary', 'monthly_pattern', 'anomaly')),
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    version: 2,
    name: 'add_indexes',
    up: `
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_date ON habit_logs(habit_id, date);
    `
  }
];

export const runMigrations = async (db: LocalDB) => {
  // Create migrations table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get current version
  const res = await db.exec('SELECT COALESCE(MAX(version), 0) as current_version FROM schema_migrations;');
  const currentVersion = res[0]?.current_version || 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration: ${migration.name}`);
      await db.exec(migration.up);
      await db.exec('INSERT INTO schema_migrations (version, name) VALUES (?, ?)', [
        migration.version,
        migration.name,
      ]);
      console.log(`Migration ${migration.name} complete.`);
    }
  }
};
