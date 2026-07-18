import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/database.types';

export const useTasks = (date: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    supabase
      .from('tasks')
      .select('*')
      .eq('due_date', date)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setTasks(data ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`tasks:${date}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `due_date=eq.${date}`,
      }, payload => {
        // Realtime just reconciles the source of truth — the UI has already
        // updated optimistically, so these handlers should never cause a
        // visible re-render/flicker for the action that triggered them.
        if (payload.eventType === 'INSERT') {
          setTasks(prev => {
            // Drop any temp optimistic row(s) waiting to be replaced by the real one
            const withoutTemp = prev.filter(t => !t.id.startsWith('temp-'));
            if (withoutTemp.some(t => t.id === (payload.new as Task).id)) {
              return withoutTemp;
            }
            return [...withoutTemp, payload.new as Task].sort(
              (a, b) => a.sort_order - b.sort_order
            );
          });
        }
        if (payload.eventType === 'UPDATE') {
          setTasks(prev =>
            prev
              .map(t => (t.id === payload.new.id ? { ...t, ...(payload.new as Task) } : t))
              .sort((a, b) => a.sort_order - b.sort_order)
          );
        }
        if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  /** Instantly flip a task's completed state in local state; network call happens separately. */
  const optimisticComplete = useCallback((taskId: string, completed: boolean) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      )
    );
  }, []);

  /** Instantly insert a (possibly temporary) task into local state. */
  const optimisticAdd = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  /** Instantly remove a task from local state. */
  const optimisticRemove = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  /** Instantly update a task in local state. */
  const optimisticUpdate = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, ...patch }
          : t
      )
    );
  }, []);

  return { tasks, loading, optimisticComplete, optimisticAdd, optimisticRemove, optimisticUpdate };
};
