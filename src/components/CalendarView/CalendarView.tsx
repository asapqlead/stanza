import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isSameDay, parseISO, isBefore, isToday,
} from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';

interface DayMeta {
  hasTasks: boolean;
  allComplete: boolean;
  hasIncomplete: boolean;
}

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
}

export const CalendarView = ({ onDateSelect }: CalendarViewProps) => {
  const { activeDate } = useAppStore();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [dayMeta, setDayMeta] = useState<Record<string, DayMeta>>({});
  const [slideDir, setSlideDir] = useState(0);

  useEffect(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth() + 1;
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-31`;

    supabase
      .from('tasks')
      .select('due_date, completed')
      .gte('due_date', start)
      .lte('due_date', end)
      .then(({ data }) => {
        if (!data) return;
        const meta: Record<string, DayMeta> = {};
        for (const t of data) {
          const d = t.due_date;
          if (!meta[d]) meta[d] = { hasTasks: false, allComplete: true, hasIncomplete: false };
          meta[d].hasTasks = true;
          if (!t.completed) {
            meta[d].allComplete = false;
            meta[d].hasIncomplete = true;
          }
        }
        setDayMeta(meta);
      });
  }, [viewMonth]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = getDay(monthStart); // 0=Sun
  const blanks = Array(startDow).fill(null);

  const goNext = () => {
    setSlideDir(1);
    setViewMonth(addMonths(viewMonth, 1));
  };
  const goPrev = () => {
    setSlideDir(-1);
    setViewMonth(subMonths(viewMonth, 1));
  };

  const handleDayTap = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    onDateSelect(dateStr);
  };

  const activeD = parseISO(activeDate);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: `calc(var(--safe-top) + 24px) var(--space-xl) 0`,
      overflow: 'hidden',
    }}>
      {/* Pill Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '32px',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={goPrev}
            aria-label="Previous month"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-white)',
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronLeft size={22} />
          </motion.button>

          <div style={{ width: 160, textAlign: 'center', overflow: 'hidden', position: 'relative', height: 28 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={format(viewMonth, 'yyyy-MM')}
                initial={{ y: slideDir * 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: slideDir * -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{ 
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 600, letterSpacing: '0.5px' 
                }}
              >
                {format(viewMonth, 'MMMM yyyy')}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            aria-label="Next month"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-white)',
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronRight size={22} />
          </motion.button>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '28px',
        padding: '28px 20px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* Day of week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 20 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 13,
              fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={format(viewMonth, 'yyyy-MM')}
              initial={{ x: slideDir * 40, opacity: 0, scale: 0.98 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: slideDir * -40, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px 0' }}
            >
              {blanks.map((_, i) => <div key={`blank-${i}`} />)}
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const meta = dayMeta[dateStr];
                const isSelected = isSameDay(day, activeD);
                const isT = isToday(day);
                const isPast = isBefore(day, new Date()) && !isT;

                let dotColor: string | null = null;
                let dotShadow = 'none';
                if (meta?.hasTasks) {
                  if (isPast) {
                    dotColor = meta.allComplete ? '#10B981' : '#EF4444'; // slightly brighter green/red
                    dotShadow = `0 0 10px ${dotColor}80`;
                  } else {
                    dotColor = 'var(--color-yellow)';
                    dotShadow = `0 0 10px ${dotColor}80`;
                  }
                }

                return (
                  <div key={dateStr} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    {isSelected && (
                      <motion.div
                        layoutId="activeDay"
                        style={{
                          position: 'absolute',
                          inset: 2,
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '18px',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                          zIndex: 0
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleDayTap(day)}
                      aria-label={`${format(day, 'EEEE, MMMM d')}${meta?.hasTasks ? `, has tasks` : ''}`}
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 52,
                        width: '100%',
                        maxWidth: 52,
                        border: 'none',
                        borderRadius: '18px',
                        background: isT && !isSelected
                          ? 'rgba(245, 200, 66, 0.15)' 
                          : 'transparent',
                        boxShadow: isT && !isSelected ? 'inset 0 0 0 1px var(--color-yellow)' : 'none',
                        cursor: 'pointer',
                        gap: 6,
                      }}
                    >
                      <span style={{
                        fontSize: 16,
                        fontWeight: isT || isSelected ? 700 : 500,
                        color: isT
                          ? 'var(--color-yellow)'
                          : isSelected
                            ? 'var(--color-white)'
                            : isPast
                              ? 'rgba(255, 255, 255, 0.3)'
                              : 'var(--color-white)',
                        transition: 'color 0.2s',
                      }}>
                        {format(day, 'd')}
                      </span>
                      {dotColor && (
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: dotColor, flexShrink: 0,
                          boxShadow: dotShadow,
                        }} />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: 'auto',
        marginBottom: 24,
        padding: '18px 24px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        alignSelf: 'center',
      }}>
        {[
          { color: 'var(--color-yellow)', label: 'To do' },
          { color: '#10B981', label: 'Done' },
          { color: '#EF4444', label: 'Missed' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: item.color,
              boxShadow: `0 0 10px ${item.color}80`
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
