import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { createTask } from '../../utils/taskMutations';
import { supabase } from '../../lib/supabase';
import type { Task, UrgencyLevel } from '../../types/database.types';
import { useHaptic } from '../../hooks/useHaptic';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  description: z.string().max(500).optional(),
  due_date: z.string(),
  due_time: z.string().optional(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Blocked']),
});

type FormData = z.infer<typeof schema>;

const URGENCY_OPTIONS: UrgencyLevel[] = ['Low', 'Medium', 'High', 'Blocked'];
const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  Low: 'var(--color-green-card)',
  Medium: 'var(--color-amber-card)',
  High: 'var(--color-red-card)',
  Blocked: 'var(--color-purple-card)',
};

interface AddTaskSheetProps {
  /** Called immediately with a temp task so the card appears on the fly, before the insert resolves. */
  onOptimisticAdd: (task: Task) => void;
  /** Called if the insert actually fails, so the temp card can be removed again. */
  onAddFailed: (tempId: string) => void;
}

export const AddTaskSheet = ({ onOptimisticAdd, onAddFailed }: AddTaskSheetProps) => {
  const { addTaskOpen, setAddTaskOpen, activeDate } = useAppStore();
  const { light } = useHaptic();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      urgency: 'Medium',
      due_date: activeDate,
    },
  });

  const selectedUrgency = watch('urgency');

  const onSubmit = async (data: FormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Instant local card so the sheet closes and the new task appears immediately.
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      urgency: data.urgency as UrgencyLevel,
      due_date: data.due_date,
      due_time: data.due_time ?? null,
      completed: false,
      completed_at: null,
      sort_order: 9999,
      created_at: new Date().toISOString(),
    };

    onOptimisticAdd(tempTask);
    light();
    reset({ urgency: 'Medium', due_date: activeDate });
    setAddTaskOpen(false);

    // Await the real insert — if it fails, roll back the optimistic card
    // instead of silently losing the task on next reload.
    const { error } = await createTask({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      urgency: data.urgency as UrgencyLevel,
      due_date: data.due_date,
      due_time: data.due_time ?? null,
      sort_order: 0,
    });

    if (error) {
      console.error('Failed to save task:', error);
      onAddFailed(tempTask.id);
    }
  };

  const handleClose = () => {
    reset({ urgency: 'Medium', due_date: activeDate });
    setAddTaskOpen(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-mid)',
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontSize: 15,
    color: 'var(--color-white)',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-family)',
  };

  return createPortal(
    <AnimatePresence>
      {addTaskOpen && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 150,
            }}
          />

          {/* Sheet */}
          <motion.div
            layoutId="add-task-sheet"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--color-card)',
              borderRadius: '20px 20px 0 0',
              zIndex: 200,
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              background: '#F05050',
              borderRadius: '20px 20px 0 0',
              padding: '16px var(--space-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-white)' }}>New Task</h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="white" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                padding: 'var(--space-xl)',
                paddingBottom: `calc(var(--safe-bottom) + 24px)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
              }}
            >
              {/* Title */}
              <div>
                <label htmlFor="task-title" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  TASK TITLE *
                </label>
                <input
                  id="task-title"
                  {...register('title')}
                  placeholder="e.g. Design Review"
                  autoFocus
                  style={{
                    ...inputStyle,
                    borderColor: errors.title ? 'var(--color-red-card)' : 'transparent',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
                  onBlur={e => e.target.style.borderColor = errors.title ? 'var(--color-red-card)' : 'transparent'}
                />
                {errors.title && (
                  <p role="alert" style={{ fontSize: 12, color: '#F05050', marginTop: 4 }}>{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="task-desc" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <textarea
                  id="task-desc"
                  {...register('description')}
                  placeholder="Add description…"
                  rows={3}
                  style={{ ...inputStyle }}
                  onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-yellow)'}
                  onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'transparent'}
                />
              </div>

              {/* Due date + time row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label htmlFor="task-date" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                    DATE *
                  </label>
                  <input
                    id="task-date"
                    type="date"
                    {...register('due_date')}
                    style={{
                      ...inputStyle,
                      colorScheme: 'dark',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </div>
                <div>
                  <label htmlFor="task-time" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                    TIME
                  </label>
                  <input
                    id="task-time"
                    type="time"
                    {...register('due_time')}
                    style={{
                      ...inputStyle,
                      colorScheme: 'dark',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                  PRIORITY
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {URGENCY_OPTIONS.map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setValue('urgency', u)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 'var(--radius-pill)',
                        border: selectedUrgency === u
                          ? '2px solid var(--color-white)'
                          : '2px solid transparent',
                        background: URGENCY_COLORS[u],
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--color-text-dark)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                        letterSpacing: 0.3,
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: 52,
                  background: isSubmitting ? 'var(--color-mid)' : 'var(--color-yellow)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-text-dark)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                  transition: 'background 0.2s',
                }}
              >
                {isSubmitting ? 'Creating…' : 'Create Task'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};