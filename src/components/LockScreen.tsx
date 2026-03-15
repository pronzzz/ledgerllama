import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useIdleLock() {
  const [isLocked, setIsLocked] = useState(false);
  
  useEffect(() => {
    const pin = localStorage.getItem('ledger_pin');
    if (!pin) return; // Feature disabled if no PIN
    
    let timeout: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      if (!isLocked) {
        timeout = setTimeout(() => setIsLocked(true), IDLE_TIMEOUT);
      }
    };

    resetTimer();

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timeout);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isLocked]);

  return { isLocked, setIsLocked };
}

export function LockScreen({ children }: { children: React.ReactNode }) {
  const { isLocked, setIsLocked } = useIdleLock();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  // If no pin is set at all, we never lock.
  const storedPin = localStorage.getItem('ledger_pin');
  
  // Actually, wait! The hook locks state. On first page load after being closed, if there's a PIN, we should lock it immediately.
  useEffect(() => {
    if (storedPin && !sessionStorage.getItem('ledger_unlocked_this_session')) {
      setIsLocked(true);
    }
  }, [storedPin, setIsLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === storedPin) {
      setIsLocked(false);
      setPinInput('');
      setError(false);
      sessionStorage.setItem('ledger_unlocked_this_session', 'true');
    } else {
      setError(true);
      setPinInput('');
    }
  };

  return (
    <>
      {children}
      {isLocked && storedPin && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">App Locked</h2>
          <p className="text-sm text-muted-foreground mt-2">Enter your PIN to unlock</p>
        </div>

        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
          <input
            type="password"
            autoFocus
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className={`w-full text-center tracking-[0.5em] text-2xl h-14 rounded-xl border ${error ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'} bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2`}
            placeholder="••••"
          />
          {error && <p className="text-xs text-destructive text-center">Incorrect PIN</p>}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors mt-2"
          >
            Unlock
          </button>
        </form>
      </div>
        </div>
      )}
    </>
  );
}
