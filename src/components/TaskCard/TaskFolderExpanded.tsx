import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { Task } from '../../types/database.types';
import { TaskCard } from './TaskCard';
import { useHaptic } from '../../hooks/useHaptic';

interface TaskFolderExpandedProps {
  tasks: Task[];
  onClose: () => void;
  onTapTask: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

export const TaskFolderExpanded = ({ tasks, onClose, onTapTask, onToggleComplete }: TaskFolderExpandedProps) => {
  const { light } = useHaptic();

  const handleClose = () => {
    light();
    onClose();
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, pointerEvents: 'auto' }}>
      {/* Blurred backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />
      
      {/* Scrollable container for cards */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: 'var(--safe-top) var(--space-xl) calc(var(--safe-bottom) + 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingTop: 'calc(var(--safe-top) + 60px)',
          pointerEvents: 'none', // let clicks pass through to backdrop where empty
        }}
      >
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 100 }}>
          {tasks.map((task) => (
            <motion.div
              layoutId={`task-card-${task.id}`}
              key={task.id}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ width: '100%' }}
            >
              <TaskCard
                task={task}
                onTap={() => {
                  onTapTask(task);
                }}
                onToggleComplete={onToggleComplete}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
