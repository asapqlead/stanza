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
            {task.description || 'Add a description...'}
          </p>

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
 * Wallet-style card stack (iOS-inspired).
 * Cards stack vertically — peek cards sit ABOVE the front card, each
 * showing a strip with the task title visible. The front (fully-detailed)
 * card is at the BOTTOM of the stack, fully expanded.
 * All cards share the same width (no horizontal inset).
 * Only 3 slots are shown. If there are more than 3 pending tasks a
 * grey "+N" card takes the topmost peek slot.
 * ---------------------------------------------------------------------- */
const PEEK_HEIGHT = 64;       // how much of each peeking card is visible
const FRONT_HEIGHT = 200;     // full front card height

export const TaskCardStacked = ({
  tasks,
  overflowCount = 0,
}: {
  tasks: Task[];
  overflowCount?: number;
}) => {
  if (tasks.length === 0) return null;

  const hasOverflow = overflowCount > 0;
  const peekTasks = tasks.slice(1);      // everything except the front card

  // Build peek slots — furthest-back first (top of visual stack),
  // nearest to front last (just above the front card).
  // If overflow exists it's the very top slot.
  const peekSlots: { type: 'overflow' | 'task'; task?: Task }[] = [
    ...(hasOverflow ? [{ type: 'overflow' as const }] : []),
    ...[...peekTasks].reverse().map(t => ({ type: 'task' as const, task: t })),
  ];

  const totalPeeks = peekSlots.length;
  const containerHeight = FRONT_HEIGHT + totalPeeks * PEEK_HEIGHT;

  return (
    <div style={{
      position: 'relative',
      height: containerHeight,
      width: '100%',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
    }}>
      {peekSlots.map((slot, i) => {
        const top = i * PEEK_HEIGHT;
        const zIndex = i + 1;
        return slot.type === 'overflow' ? (
          <OverflowPeek
            key="overflow"
            top={top}
            zIndex={zIndex}
            count={overflowCount}
            depth={totalPeeks - i}
          />
        ) : (
          <TaskPeek
            key={slot.task!.id}
            task={slot.task!}
            top={top}
            zIndex={zIndex}
            depth={totalPeeks - i}
          />
        );
      })}

      {/* Front card — at the bottom, highest zIndex, fully expanded */}
      <FrontCard
        task={tasks[0]}
        top={totalPeeks * PEEK_HEIGHT}
        zIndex={totalPeeks + 1}
      />
    </div>
  );
};

const FrontCard = ({ task, top, zIndex }: { task: Task; top: number; zIndex: number }) => {
  const bg = CARD_COLORS[task.urgency] ?? 'var(--color-amber-card)';
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height: FRONT_HEIGHT,
        borderRadius: 'var(--radius-lg)',
        background: bg,
        overflow: 'hidden',
        zIndex,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.25), 0 -1px 3px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ padding: '20px var(--space-xl)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -4 }}>
          <div style={{
            background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-pill)',
            padding: '5px 14px', fontSize: 11, fontWeight: 700,
            color: 'var(--color-text-dark)', letterSpacing: 0.4,
          }}>
            {task.urgency.toUpperCase()}
          </div>
        </div>

        <p style={{
          fontSize: 30, fontWeight: 700, color: 'var(--color-text-dark)',
          lineHeight: 1.25, marginTop: 4, overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.title}
        </p>

        <p style={{
          fontSize: 14, color: 'rgba(28,28,30,0.65)', marginTop: 8, lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.description || 'Add a description...'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
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


      </div>
    </div>
  );
};

/**
 * Peek card — sits above the front card showing a visible strip with the
 * task title and priority badge. Full-height card behind, only the top
 * PEEK_HEIGHT is visible before the next card covers the rest.
 */
const TaskPeek = ({
  task, top, zIndex, depth
}: { task: Task; top: number; zIndex: number; depth: number }) => {
  const bg = CARD_COLORS[task.urgency] ?? 'var(--color-amber-card)';
  const inset = depth * 4;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: inset,
        right: inset,
        bottom: 0,
        borderRadius: 'var(--radius-lg)',
        background: bg,
        zIndex,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.25), 0 -1px 3px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Title row — visible in the peek strip */}
      <div style={{
        height: PEEK_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <p style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          marginRight: 12,
        }}>
          {task.title}
        </p>
        <div style={{
          flexShrink: 0,
          background: 'rgba(0,0,0,0.1)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          letterSpacing: 0.5,
        }}>
          {task.urgency.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

/**
 * Grey "+N more" card — topmost peek slot, shown only when there are
 * more than 3 pending tasks.
 */
const OverflowPeek = ({
  top, zIndex, count, depth
}: { top: number; zIndex: number; count: number; depth: number }) => {
  const inset = depth * 4;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: inset,
        right: inset,
        bottom: 0,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-mid)',
        zIndex,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.25), 0 -1px 3px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        height: PEEK_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--color-grey)',
          letterSpacing: 0.3,
        }}>
          +{count} more
        </span>
      </div>
    </div>
  );
};

