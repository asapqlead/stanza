import { motion, useReducedMotion } from 'framer-motion';

interface DaySummaryCardProps {
  pendingCount: number;
  completedCount: number;
  streakCount: number;
}

export const DaySummaryCard = ({ pendingCount, completedCount, streakCount }: DaySummaryCardProps) => {
  const total = pendingCount + completedCount;
  const isComplete = total > 0 && pendingCount === 0;
  const isEmpty = total === 0;
  const percent = total > 0 ? completedCount / total : 0;
  const shouldReduceMotion = useReducedMotion();

  let message = "";
  if (isEmpty) {
    message = "nothing planned yet — add your first task.";
  } else if (isComplete) {
    message = streakCount > 1 
      ? `${streakCount} days clear — don't break it tomorrow.` 
      : `day complete — see you tomorrow.`;
  } else {
    message = `${completedCount} of ${total} done — keep going.`;
  }

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent * circumference);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        background: 'var(--color-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="var(--color-mid)"
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            stroke={isComplete ? "var(--color-green-card)" : "var(--color-yellow)"}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        {isComplete && !shouldReduceMotion && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'var(--color-green-card)',
              mixBlendMode: 'screen',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <p style={{
        fontSize: 15,
        fontWeight: 600,
        color: isComplete ? 'var(--color-white)' : 'var(--color-grey)',
        textAlign: 'center',
        lineHeight: 1.4
      }}>
        {message}
      </p>

      {streakCount > 0 && (
        <motion.div
          key={streakCount} // Re-animate if streak updates while viewing
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            background: 'var(--color-mid)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 14px',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-grey)' }}>
            {streakCount} day streak
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
