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
  const [localCompleted, setLocalCompleted] = useState<boolean | null>(null);
  const [completing, setCompleting] = useState(false);
  const { heavy } = useHaptic();

  const isCompleted = localCompleted !== null ? localCompleted : task.completed;
  const bg = isCompleted ? 'var(--color-mid)' : CARD_COLORS[task.urgency] ?? 'var(--color-amber-card)';
  const textColor = isCompleted ? 'var(--color-grey)' : 'var(--color-text-dark)';

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCompleted = !isCompleted;
    setLocalCompleted(nextCompleted);
    setCompleting(true);
    heavy();

    // Delay removing the card from the stack so the user sees the completion
    setTimeout(() => {
      onToggleComplete?.(task.id, nextCompleted);
    }, 600);

    const request = nextCompleted
      ? completeTask(task.id, task.due_date)
      : uncompleteTask(task.id);

    Promise.resolve(request).finally(() => {
      setCompleting(false);
      // We don't reset localCompleted here because optimistic update will take over
    });
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
      {!isCompleted && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(0, 0, 0, 0.08)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          letterSpacing: '0.5px',
        }}>
          {task.urgency}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Complete button */}
        <motion.button
          onClick={handleComplete}
          animate={completing ? { scale: [0.9, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          aria-label={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: isCompleted
              ? 'none'
              : '2px solid rgba(0,0,0,0.3)',
            background: isCompleted ? 'rgba(0,0,0,0.25)' : 'transparent',
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
            {isCompleted && (
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
            textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.6 : 1,
            paddingRight: isCompleted ? 0 : 66,
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
 * Swipeable Deck (Premium feel)
 * Cards stack with the front card fully visible and interactive.
 * Swiping the front card cycles it to the back of the deck.
 * ---------------------------------------------------------------------- */

export const TaskCardStacked = ({
  tasks,
  onTap,
  onToggleComplete
}: {
  tasks: Task[];
  onTap?: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}) => {
  const [deckOffset, setDeckOffset] = useState(0);

  if (tasks.length === 0) return null;

  // We rotate the tasks array based on deckOffset so the "front" card changes
  const visibleTasks = [...tasks];
  for (let i = 0; i < deckOffset % tasks.length; i++) {
    visibleTasks.push(visibleTasks.shift()!);
  }

  // Render up to 3 cards for performance and visual clarity
  const renderCards = visibleTasks.slice(0, 3).reverse();

  return (
    <div style={{
      position: 'relative',
      height: 220,
      width: '100%',
      perspective: 1000,
    }}>
      <AnimatePresence>
        {renderCards.map((task, i) => {
          const isFront = i === renderCards.length - 1;
          const indexFromFront = renderCards.length - 1 - i;
          
          return (
            <DeckCard
              key={task.id}
              task={task}
              isFront={isFront}
              indexFromFront={indexFromFront}
              onSwipe={() => setDeckOffset(prev => prev + 1)}
              onTap={() => onTap?.(task)}
              onToggleComplete={onToggleComplete}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const DeckCard = ({
  task,
  isFront,
  indexFromFront,
  onSwipe,
  onTap,
  onToggleComplete
}: {
  task: Task;
  isFront: boolean;
  indexFromFront: number;
  onSwipe: () => void;
  onTap: () => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}) => {
  const handleDragEnd = (e: any, info: any) => {
    const threshold = 100;
    if (Math.abs(info.offset.y) > threshold) {
      onSwipe();
    }
  };

  return (
    <motion.div
      layoutId={`task-card-${task.id}`}
      drag={isFront ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 200,
        zIndex: isFront ? 10 : 10 - indexFromFront,
      }}
      initial={{ 
        y: indexFromFront * 15, 
        scale: 1 - indexFromFront * 0.05,
        opacity: 0
      }}
      animate={{
        y: indexFromFront * 15,
        scale: 1 - indexFromFront * 0.05,
        opacity: 1 - indexFromFront * 0.2,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div 
        onClick={() => { if (isFront) onTap(); }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: isFront ? 'auto' : 'none'
        }}
      >
        <TaskCard
          task={task}
          onToggleComplete={onToggleComplete}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        />
      </div>
    </motion.div>
  );
};

