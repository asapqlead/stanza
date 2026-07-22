import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { updateTask } from '../../utils/taskMutations';
import type { Task, UrgencyLevel } from '../../types/database.types';
import { useHaptic } from '../../hooks/useHaptic';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  description: z.string().max(500).optional().nullable(),
  due_date: z.string(),
  due_time: z.string().optional().nullable(),
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

interface EditTaskSheetProps {
  onOptimisticUpdate: (taskId: string, patch: Partial<Task>) => void;
  onUpdateFailed: (taskId: string, originalTask: Task) => void;
}

export const EditTaskSheet = ({ onOptimisticUpdate, onUpdateFailed }: EditTaskSheetProps) => {
  const { editingTask, setEditingTask } = useAppStore();
  const { light } = useHaptic();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date,
        due_time: editingTask.due_time,
        urgency: editingTask.urgency,
      });
    }
  }, [editingTask, reset]);

  const selectedUrgency = watch('urgency');

  const onSubmit = async (data: FormData) => {
    if (!editingTask) return;

    const patch: Partial<Task> = {
      title: data.title,
      description: data.description ?? null,
      urgency: data.urgency as UrgencyLevel,
      due_date: data.due_date,
      due_time: data.due_time ?? null,
    };

    onOptimisticUpdate(editingTask.id, patch);
    light();
    setEditingTask(null);

    const { error } = await updateTask(editingTask.id, patch);

    if (error) {
      console.error('Failed to update task:', error);
      onUpdateFailed(editingTask.id, editingTask);
    }
  };

  const handleClose = () => {
    setEditingTask(null);
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
      {editingTask && (
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
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
            }}
          >
            {/* Header */}
            <div style={{
              background: 'var(--color-yellow)',
              borderRadius: '20px 20px 0 0',
              padding: '16px var(--space-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-dark)' }}>Edit Task</h2>
              <button
                onClick={handleClose}
                type="button"
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.1)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="var(--color-text-dark)" />
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
                <label htmlFor="edit-task-title" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  TASK TITLE *
                </label>
                <input
                  id="edit-task-title"
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
                <label htmlFor="edit-task-desc" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <textarea
                  id="edit-task-desc"
                  {...register('description')}
                  value={watch('description') ?? ''}
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
                  <label htmlFor="edit-task-date" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                    DATE *
                  </label>
                  <input
                    id="edit-task-date"
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
                  <label htmlFor="edit-task-time" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                    TIME
                  </label>
                  <input
                    id="edit-task-time"
                    type="time"
                    {...register('due_time')}
                    value={watch('due_time') ?? ''}
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
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
