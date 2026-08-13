import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCompletedTaskDates } from '../utils/taskMutations';
import { calculateStreak } from '../utils/streak';
import { today as getToday } from '../utils/date';

export const useStreak = () => {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    setLoading(true);
    const completedDates = await getCompletedTaskDates(90); // Last 90 days
    const currentStreak = calculateStreak(completedDates, getToday());
    setStreakCount(currentStreak);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStreak();

    // Subscribe to task updates to refresh streak if something changes
    const channel = supabase
      .channel('tasks-streak')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        fetchStreak();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStreak]);

  // Expose a way to optimistically update the streak from UI
  // e.g. when last task is completed, we might bump it if not already bumped
  const optimisticSetStreak = (newCount: number) => {
    setStreakCount(newCount);
  };

  return { streakCount, loading, optimisticSetStreak, fetchStreak };
};
