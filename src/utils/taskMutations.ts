import { supabase } from '../lib/supabase';
import type { Task, UrgencyLevel } from '../types/database.types';

export const createTask = (task: Omit<Task, 'id' | 'created_at' | 'completed' | 'completed_at'>) =>
  supabase.from('tasks').insert({ ...task, completed: false }).select().single();

export const completeTask = async (taskId: string, date: string) => {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('due_date', date);
  const maxOrder = tasks && tasks.length > 0
    ? Math.max(...tasks.map((t: { sort_order: number }) => t.sort_order))
    : 0;
  return supabase.from('tasks').update({
    completed: true,
    completed_at: new Date().toISOString(),
    sort_order: maxOrder + 1,
  }).eq('id', taskId);
};

export const uncompleteTask = (taskId: string) =>
  supabase.from('tasks').update({
    completed: false,
    completed_at: null,
  }).eq('id', taskId);

export const reorderTasks = async (orderedIds: string[]) => {
  const updates = orderedIds.map((id, i) => ({ id, sort_order: i }));
  return supabase.from('tasks').upsert(updates, { onConflict: 'id' });
};

export const deleteTask = (taskId: string) =>
  supabase.from('tasks').delete().eq('id', taskId);

export const updateTask = (taskId: string, patch: Partial<Task>) =>
  supabase.from('tasks').update(patch).eq('id', taskId).select().single();

export const getTaskCountsByDate = async (year: number, month: number) => {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  return supabase
    .from('tasks')
    .select('due_date, completed')
    .gte('due_date', start)
    .lte('due_date', end);
};

export const getCompletedTaskDates = async (limit: number = 90) => {
  // To get distinct dates, we can just fetch due_date where completed=true 
  // and deduplicate client-side, since there shouldn't be thousands of tasks.
  // We'll limit the query to recent tasks (e.g. last N days).
  const d = new Date();
  d.setDate(d.getDate() - limit);
  const start = d.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('tasks')
    .select('due_date')
    .eq('completed', true)
    .gte('due_date', start)
    .order('due_date', { ascending: false });
    
  if (error || !data) return [];
  
  return [...new Set(data.map(t => t.due_date))];
};

export type { UrgencyLevel };
