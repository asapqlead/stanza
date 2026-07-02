import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Calendar, Clock, Check, Share2 } from 'lucide-react';
import type { Task } from '../../types/database.types';
import { formatShortDate, formatTime } from '../../utils/date';
import { completeTask, uncompleteTask } from '../../utils/taskMutations';
import { useHaptic } from '../../hooks/useHaptic';

interface TaskCardProps {
  task: Task;
  onTap?: () => void;
  /** Called immediately (before the network call resolves) so the UI updates on the fly. */
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  style?: React.CSSProperties;
}

const CARD_COLORS: Record<string, string> = {
  Low: 'var(--color-green-card)',
  Medium: 'var(--color-amber-card)',
  High: 'var(--color-red-card)',
  Blocked: 'var(--color-purple-card)',
};

export const TaskCard = ({ task, onTap, onToggleComplete, style }: TaskCardProps) => {
  const [completing, setCompleting] = useState(false);
  const { heavy } = useHaptic();

  const bg = task.completed ? 'var(--color-mid)' : CARD_COLORS[task.urgency] ?? 'var(--color-amber-card)';
  const textColor = task.completed ? 'var(--color-grey)' : 'var(--color-text-dark)';

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleting(true);
    heavy();

    const nextCompleted = !task.completed;

    // Update local state instantly — no waiting on the network/Realtime round trip.
    onToggleComplete?.(task.id, nextCompleted);

    const request = nextCompleted
      ? completeTask(task.id, task.due_date)
      : uncompleteTask(task.id);

    // Supabase's PostgrestFilterBuilder is thenable but not typed as a real
    // Promise, so .finally() isn't on its type — wrap it to get one.
    Promise.resolve(request).finally(() => setCompleting(false));
  };

  return (
    <motion.div
      layout
      onClick={onTap}
      style={{
        background: bg,
        borderRadius: 'var(--radius-lg)',
        padding: '20px var(--space-xl)',
        position: 'relative',
        cursor: 'pointer',
        minHeight: 108,
        ...style,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Urgency badge */}
      {!task.completed && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: bg,
          border: '1.5px solid rgba(0,0,0,0.12)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          letterSpacing: '0.5px',
        }}>
          {task.urgency.toUpperCase()}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Complete button */}
        <motion.button
          onClick={handleComplete}
          animate={completing ? { scale: [0.9, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: task.completed
              ? 'none'
              : '2px solid rgba(0,0,0,0.3)',
            background: task.completed ? 'rgba(0,0,0,0.25)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 3,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check size={16} color="var(--color-grey)" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <p style={{
            fontSize: 19,
            fontWeight: 700,
            color: textColor,
            lineHeight: 1.28,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textDecoration: task.completed ? 'line-through' : 'none',
            opacity: task.completed ? 0.6 : 1,
            paddingRight: task.completed ? 0 : 66,
            transition: 'opacity 0.2s',
          }}>
            {task.title}
          </p>

          {/* Description */}
          {task.description && (
            <p style={{
              fontSize: 14.5,
              color: 'rgba(28,28,30,0.6)',
              marginTop: 6,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </p>
          )}

          {/* Meta row */}
          {task.due_time && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
            }}>
              <Clock size={12} color="rgba(28,28,30,0.5)" />
              <span style={{ fontSize: 12.5, color: 'rgba(28,28,30,0.5)', fontWeight: 500 }}>
                {formatTime(task.due_time)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------------
 * Stacked folder-tab card.
 * index 0 = front card, shown fully expanded with title/desc/date/avatars/badge.
 * index 1..n = peeking cards behind it, showing a visible colored strip.
 * When there are more pending tasks than fit in the stack, the last visible
 * peeking card shows a "+N" badge for the remaining hidden count.
 * ---------------------------------------------------------------------- */
export const TaskCardStacked = ({
  task,
  index,
  total,
  overflowCount = 0,
}: {
  task: Task;
  index: number;
  total: number;
  overflowCount?: number;
}) => {
  const bg = CARD_COLORS[task.urgency] ?? 'var(--color-amber-card)';
  const isFront = index === 0;
  const offset = index * 14;

  return (
    <div
      style={{
        position: 'absolute',
        top: offset,
        left: offset / 2,
        right: offset / 2,
        borderRadius: 'var(--radius-lg)',
        background: bg,
        overflow: 'hidden',
        zIndex: total - index,
        height: isFront ? 'auto' : `calc(100% - ${offset}px)`,
        minHeight: isFront ? 200 : 40,
        boxShadow: isFront
          ? '0 8px 20px rgba(0,0,0,0.35)'
          : `0 ${2 + index}px 8px rgba(0,0,0,0.22)`,
      }}
    >
      {isFront ? (
        <div style={{ padding: '20px var(--space-xl)', width: '100%' }}>
          {/* Share icon, top-right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -4 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Share2 size={15} color="var(--color-text-dark)" />
            </div>
          </div>

          <p style={{
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--color-text-dark)',
            lineHeight: 1.25,
            marginTop: 4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {task.title}
          </p>

          {task.description && (
            <p style={{
              fontSize: 14,
              color: 'rgba(28,28,30,0.65)',
              marginTop: 8,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={15} color="rgba(28,28,30,0.55)" />
              <span style={{ fontSize: 15, color: 'rgba(28,28,30,0.55)', fontWeight: 500 }}>
                {formatShortDate(task.due_date)}
              </span>
            </div>
            {task.due_time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={15} color="rgba(28,28,30,0.55)" />
                <span style={{ fontSize: 15, color: 'rgba(28,28,30,0.55)', fontWeight: 500 }}>
                  {formatTime(task.due_time)}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            {/* Assignee avatar stack placeholder — wire up to real assignees when available */}
            <div style={{ display: 'flex' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.2)',
                  marginLeft: i === 0 ? 0 : -10,
                  border: `2px solid ${bg}`,
                }} />
              ))}
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.15)',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-text-dark)',
              letterSpacing: 0.4,
            }}>
              {task.urgency}
            </div>
          </div>
        </div>
      ) : (
        // Peeking card — just a visible colored strip behind the front card
        <div style={{ width: '100%', height: 34 }} />
      )}

      {/* Overflow badge on the last visible peeking card */}
      {overflowCount > 0 && index === total - 1 && (
        <div style={{
          position: 'absolute',
          bottom: 6,
          right: 14,
          background: 'var(--color-bg)',
          border: '2px solid var(--color-card)',
          borderRadius: 'var(--radius-pill)',
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--color-white)',
        }}>
          +{overflowCount}
        </div>
      )}
    </div>
  );
};
