import { useEffect, useState, lazy, Suspense } from 'react';
import { getDb } from './lib/db';
import { runMigrations } from './lib/schema';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Activity, Brain, Settings as SettingsIcon } from 'lucide-react';
import { LockScreen } from './components/LockScreen';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Habits = lazy(() => import('./pages/Habits'));
const Intelligence = lazy(() => import('./pages/Intelligence'));
const Settings = lazy(() => import('./pages/Settings'));

function NavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}

function App() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const initDb = async () => {
      try {
        const db = getDb();
        await db.ready;
        await runMigrations(db);
        setDbStatus('ready');
      } catch (err) {
        console.error('DB init error', err);
        setDbStatus('error');
      }
    };
    initDb();
  }, []);

  if (dbStatus === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><p>Initializing Local OS...</p></div>;
  }

  if (dbStatus === 'error') {
    return <div className="min-h-screen flex items-center justify-center bg-background text-destructive"><p>Fatal Error: Could not initialize OPFS database.</p></div>;
  }

  return (
    <BrowserRouter>
      <LockScreen>
        <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
        <aside className="w-64 border-r border-border bg-card shadow-sm z-10 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
              <span className="text-2xl">🦙</span> LedgerLlama
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Local Finance OS</p>
          </div>
          <nav className="space-y-1 px-3 flex-1">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/transactions" icon={Receipt}>Transactions</NavLink>
            <NavLink to="/habits" icon={Activity}>Habits</NavLink>
            <NavLink to="/intelligence" icon={Brain}>Intelligence</NavLink>
            <NavLink to="/settings" icon={SettingsIcon}>Settings</NavLink>
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="max-w-6xl mx-auto p-8">
            <Suspense fallback={<div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">Loading View...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
      </LockScreen>
    </BrowserRouter>
  );
}

export default App;
