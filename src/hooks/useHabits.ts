import { useState, useEffect } from 'react';
import { getDb } from '../lib/db';

export interface Habit {
  id: string;
  name: string;
  description: string;
  target_days_per_week: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  status: 'completed' | 'skipped' | 'failed';
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, Record<string, HabitLog>>>({});
  const [loading, setLoading] = useState(true);

  const fetchHabitsAndLogs = async () => {
    setLoading(true);
    const db = getDb();
    try {
      const dbHabits = await db.exec<Habit>('SELECT * FROM habits ORDER BY created_at DESC');
      const dbLogs = await db.exec<HabitLog>('SELECT * FROM habit_logs');
      
      const logMap: Record<string, Record<string, HabitLog>> = {};
      dbHabits.forEach(h => logMap[h.id] = {});
      
      dbLogs.forEach(log => {
        if (!logMap[log.habit_id]) logMap[log.habit_id] = {};
        logMap[log.habit_id][log.date] = log;
      });

      setHabits(dbHabits);
      setLogs(logMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndLogs();
  }, []);

  const addHabit = async (name: string, description: string, targetDays: number) => {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.exec(
      'INSERT INTO habits (id, name, description, target_days_per_week) VALUES (?, ?, ?, ?)',
      [id, name, description, targetDays]
    );
    await fetchHabitsAndLogs();
  };

  const deleteHabit = async (id: string) => {
    const db = getDb();
    await db.exec('DELETE FROM habits WHERE id = ?', [id]);
    await fetchHabitsAndLogs();
  };

  const toggleLog = async (habitId: string, date: string) => {
    const db = getDb();
    const currentLog = logs[habitId]?.[date];
    
    if (currentLog?.status === 'completed') {
      await db.exec('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', [habitId, date]);
    } else {
      const id = crypto.randomUUID();
      // If skipped/failed or nothing, mark as completed (simple toggle)
      if (currentLog) {
         await db.exec('UPDATE habit_logs SET status = ? WHERE id = ?', ['completed', currentLog.id]);
      } else {
         await db.exec(
           'INSERT INTO habit_logs (id, habit_id, date, status) VALUES (?, ?, ?, ?)',
           [id, habitId, date, 'completed']
         );
      }
    }
    await fetchHabitsAndLogs();
  };

  return { habits, logs, loading, addHabit, deleteHabit, toggleLog };
}
