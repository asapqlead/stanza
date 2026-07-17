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

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `calc(var(--safe-top) + 16px) var(--space-xl) 0`,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Avatar */}
      <button
        onClick={onAvatarTap}
        aria-label={`Open profile for ${displayName ?? 'user'}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: avatarUrl ? 'transparent' : 'var(--color-yellow)',
          border: '2px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName ?? 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-dark)' }}>{initials}</span>
        )}
      </button>

      {/* Date info */}
      <button
        onClick={onDateTap}
        aria-label={`${formatWeekday(activeDate)} ${formatDayNum(activeDate)}, double-tap to open calendar`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 2,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-grey)', letterSpacing: 0.5 }}>
          {formatWeekday(activeDate).toUpperCase()}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-white)' }}>
          {formatDayNum(activeDate)} {formatMonth(activeDate)}
        </span>
      </button>

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
