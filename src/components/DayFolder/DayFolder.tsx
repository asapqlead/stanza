import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSwipe } from '../../hooks/useSwipe';
import { TaskCard, TaskCardStacked } from '../TaskCard/TaskCard';
import { nextDay, prevDay, formatWeekday, formatDayNum, formatMonth } from '../../utils/date';
import { pendingTasks, completedTasks } from '../../utils/sort';
import type { Task } from '../../types/database.types';

interface TaskDetailSheetProps {
  task: Task;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const TaskDetailSheet = ({ task, onClose, onDelete, onEdit }: TaskDetailSheetProps) => {
  const CARD_COLORS: Record<string, string> = {
    Low: 'var(--color-green-card)',
    Medium: 'var(--color-amber-card)',
    High: 'var(--color-red-card)',
    Blocked: 'var(--color-purple-card)',
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        inset: 0,
        top: 'auto',
        bottom: 0,
        background: 'var(--color-card)',
        borderRadius: '20px 20px 0 0',
        padding: 'var(--space-xl)',
        paddingBottom: `calc(var(--safe-bottom) + 32px)`,
        zIndex: 200,
        maxHeight: '80dvh',
        overflowY: 'auto',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ width: 36, height: 4, background: 'var(--color-mid)', borderRadius: 2 }} />
      </div>

      {/* Priority badge */}
      <div style={{
        display: 'inline-block',
        background: task.completed ? 'var(--color-mid)' : CARD_COLORS[task.urgency],
        borderRadius: 'var(--radius-pill)',
        padding: '4px 12px',
        fontSize: 11,
        fontWeight: 700,
        color: task.completed ? 'var(--color-grey)' : 'var(--color-text-dark)',
        letterSpacing: 0.5,
        marginBottom: 12,
      }}>
        {task.urgency.toUpperCase()}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
        {task.title}
      </h2>

      <p style={{ fontSize: 14, color: 'var(--color-grey)', lineHeight: 1.6, marginBottom: 16 }}>
        {task.description || 'Add a description...'}
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {task.due_time && (
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-grey)', display: 'block', marginBottom: 2 }}>TIME</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{task.due_time.slice(0, 5)}</span>
          </div>
        )}
        <div>
          <span style={{ fontSize: 11, color: 'var(--color-grey)', display: 'block', marginBottom: 2 }}>STATUS</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{task.completed ? 'Completed' : 'Pending'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--color-mid)', border: 'none',
            color: 'var(--color-white)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Close
        </button>
        <button
          onClick={onEdit}
          style={{
            flex: 1, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--color-yellow)', border: 'none',
            color: 'var(--color-text-dark)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            flex: 1, height: 44, borderRadius: 'var(--radius-md)',
            background: 'rgba(240,80,80,0.15)', border: '1px solid rgba(240,80,80,0.3)',
            color: '#F05050', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

interface DayFolderProps {
  tasks: Task[];
  loading: boolean;
  /** Called immediately for on-the-fly UI updates; network call happens separately. */
  onToggleComplete: (taskId: string, completed: boolean) => void;
  /** Called immediately for on-the-fly UI updates; network call happens separately. */
  onRemove: (taskId: string) => void;
  /** Called if the delete actually fails, so the card can be restored. */
  onRemoveFailed: (task: Task) => void;
}

export const DayFolder = ({ tasks, loading, onToggleComplete, onRemove, onRemoveFailed }: DayFolderProps) => {
  const { activeDate, setActiveDate, folderExpanded, setFolderExpanded, setAddTaskOpen, setEditingTask } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [direction, setDirection] = useState(0);
  const folderRef = useRef<HTMLDivElement>(null);
  const [folderHeight, setFolderHeight] = useState(0);

  // Measure the available folder area height
  useEffect(() => {
    const measure = () => {
      if (folderRef.current) {
        setFolderHeight(folderRef.current.clientHeight);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const pending = pendingTasks(tasks);
  const completed = completedTasks(tasks);

  // Dynamically compute how many cards fit: reserve space for the expand
  // hint (~36px), the fixed bottom nav bar (52px + ~20px safe area), and padding.
  const PEEK_H = 64;
  const FRONT_H = 200;
  const NAV_BAR_RESERVE = 104; // nav bar (52) + safe area (~20) + ~30px margin
  const HINT_SPACE = 36;
  const availableForStack = folderHeight - HINT_SPACE - NAV_BAR_RESERVE;
  // maxPeeks = how many peek strips fit above the front card
  const maxPeeks = Math.max(0, Math.floor((availableForStack - FRONT_H) / PEEK_H));
  // total cards = front card + peek cards
  const maxCards = maxPeeks + 1;
  const stackVisible = pending.slice(0, maxCards);
  const overflowCount = Math.max(0, pending.length - maxCards);

  const goNext = () => {
    setDirection(1);
    setActiveDate(nextDay(activeDate));
    setFolderExpanded(false);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveDate(prevDay(activeDate));
    setFolderExpanded(false);
  };

  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    const taskToDelete = selectedTask;
    onRemove(taskToDelete.id); // instant local removal
    setSelectedTask(null);

    const { deleteTask } = await import('../../utils/taskMutations');
    const { error } = await deleteTask(taskToDelete.id);

    if (error) {
      console.error('Failed to delete task:', error);
      onRemoveFailed(taskToDelete); // restore the card on failure
    }
  };

  const handleEditTask = () => {
    if (!selectedTask) return;
    setEditingTask(selectedTask);
    setSelectedTask(null);
  };

  return (
    <>
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Large date display */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '20px var(--space-xl) 0',
        }}>
          <div>
            <div style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'var(--color-white)',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeDate + '-day'}
                  initial={{ x: direction * 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -40, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
                >
                  {formatDayNum(activeDate)}
                </motion.span>
              </AnimatePresence>
              {/* Yellow pill */}
              <div style={{
                background: 'var(--color-yellow)',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text-dark)',
                marginBottom: 8,
              }}>
                {formatMonth(activeDate)}
              </div>
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={activeDate + '-weekday'}
                initial={{ x: direction * 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -30, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
                style={{ fontSize: 14, color: 'var(--color-grey)', marginTop: 4, fontWeight: 500 }}
              >
                {formatWeekday(activeDate)}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Task count badge */}
          {pending.length > 0 && (
            <div style={{
              background: 'var(--color-mid)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-grey)' }}>
                {pending.length} task{pending.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Folder area */}
        <div ref={folderRef} style={{ flex: 1, padding: '20px var(--space-xl)', overflow: 'hidden', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
              <div style={{
                width: 24, height: 24, border: '2px solid var(--color-mid)',
                borderTopColor: 'var(--color-yellow)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 60,
                gap: 12,
              }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-md)',
                background: 'var(--color-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={28} color="var(--color-grey)" />
              </div>
              <p style={{ fontSize: 15, color: 'var(--color-grey)', fontWeight: 500 }}>No tasks for today</p>
              <button
                onClick={() => setAddTaskOpen(true)}
                style={{
                  background: 'var(--color-yellow)', border: 'none',
                  borderRadius: 'var(--radius-pill)', padding: '10px 20px',
                  fontSize: 14, fontWeight: 700, color: 'var(--color-text-dark)',
                  cursor: 'pointer', marginTop: 4,
                }}
              >
                Add a task
              </button>
            </motion.div>
          ) : !folderExpanded ? (
            /* Stacked view — reversed: front card at bottom, peeks stacked above */
            <motion.div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setFolderExpanded(true)}
              aria-label={`${formatWeekday(activeDate)}, ${formatDayNum(activeDate)}, ${pending.length} tasks. Tap to expand.`}
              role="button"
            >
              <TaskCardStacked
                tasks={stackVisible}
                overflowCount={overflowCount}
              />

            </motion.div>
          ) : (
            /* Expanded list view */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                overflowY: 'auto',
                maxHeight: 'calc(100dvh - 260px)',
                paddingBottom: 76,
              }}
            >
              {/* Collapse button */}
              <button
                onClick={() => setFolderExpanded(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-grey)', fontSize: 12, marginBottom: 4,
                  padding: '4px 0',
                }}
              >
                <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
                <span>collapse</span>
              </button>

              <AnimatePresence>
                {pending.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <TaskCard
                      task={task}
                      onTap={() => setSelectedTask(task)}
                      onToggleComplete={onToggleComplete}
                    />
                  </motion.div>
                ))}

                {completed.length > 0 && (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      margin: '8px 0 4px',
                    }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-mid)' }} />
                      <span style={{ fontSize: 11, color: 'var(--color-grey)', fontWeight: 500 }}>
                        COMPLETED
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-mid)' }} />
                    </div>
                    {completed.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                      >
                        <TaskCard
                          task={task}
                          onTap={() => setSelectedTask(task)}
                          onToggleComplete={onToggleComplete}
                        />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Task detail sheet */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199,
              }}
            />
            <TaskDetailSheet
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};