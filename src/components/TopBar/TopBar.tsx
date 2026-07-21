import { Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatWeekday, formatDayNum, formatMonth } from '../../utils/date';

interface TopBarProps {
  onAvatarTap: () => void;
  onDateTap: () => void;
  displayName?: string;
  avatarUrl?: string | null;
}

export const TopBar = ({ onAvatarTap, onDateTap, displayName, avatarUrl }: TopBarProps) => {
  const { activeDate, setActiveNav } = useAppStore();

  const hour = new Date().getHours();
  let greeting = 'good evening';
  if (hour < 12) greeting = 'good morning';
  else if (hour < 18) greeting = 'good afternoon';

  const firstName = displayName ? displayName.split(' ')[0] : '';
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `calc(var(--safe-top) + 16px) var(--space-xl) 0`,
      position: 'relative',
      zIndex: 10,
    }}>
      <h1 style={{
        fontSize: 24,
        fontWeight: 700,
        color: 'var(--color-white)',
        letterSpacing: '0.2px'
      }}>
        {greetingText}
      </h1>

      {/* Settings button */}
      <button
        onClick={() => setActiveNav('settings')}
        aria-label="Settings"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Settings size={20} color="var(--color-white)" />
      </button>
    </div>
  );
};
