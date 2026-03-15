import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Modal } from '../components/ui/Modal';
import { Activity, Plus, Check, Trash2 } from 'lucide-react';

export default function Habits() {
  const { habits, logs, loading, addHabit, deleteHabit, toggleLog } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDays, setTargetDays] = useState('7');

  const today = new Date();
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await addHabit(name, description, parseInt(targetDays, 10) || 7);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setTargetDays('7');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Habit Tracker</h2>
          <p className="text-muted-foreground mt-1">Build consistencies stored locally.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading from OPFS...</div>
        ) : habits.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <p>No habits tracked yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-primary hover:underline text-sm font-medium"
            >
              Start tracking a habit →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-6">
            <div className="grid grid-cols-[200px_repeat(7,_1fr)_auto] gap-4 mb-4 items-center">
              <div className="font-medium text-sm text-muted-foreground">Habit</div>
              {pastDays.map(date => {
                const d = new Date(date);
                return (
                  <div key={date} className="text-center">
                    <div className="text-xs text-muted-foreground uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-sm font-medium">{d.getDate()}</div>
                  </div>
                );
              })}
              <div className="w-8"></div>
            </div>

            <div className="space-y-3">
              {habits.map(habit => (
                <div key={habit.id} className="grid grid-cols-[200px_repeat(7,_1fr)_auto] gap-4 items-center py-2 group border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-2 -mx-2">
                  <div>
                    <div className="font-medium text-foreground">{habit.name}</div>
                    <div className="text-xs text-muted-foreground truncate" title={habit.description}>{habit.description}</div>
                  </div>
                  
                  {pastDays.map(date => {
                    const isCompleted = logs[habit.id]?.[date]?.status === 'completed';
                    return (
                      <div key={date} className="flex justify-center">
                        <button
                          onClick={() => toggleLog(habit.id, date)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                              : 'bg-accent/50 text-accent-foreground hover:bg-accent border border-border/50'
                          }`}
                        >
                          {isCompleted && <Check className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-md hover:bg-destructive/10"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Habit">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Read 10 pages, Workout, etc."
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Why are you building this habit?"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Target Days per Week</label>
            <input
              type="number"
              min="1"
              max="7"
              value={targetDays}
              onChange={e => setTargetDays(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create Habit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
