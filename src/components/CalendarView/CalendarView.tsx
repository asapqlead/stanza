import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameDay, parseISO, isBefore, isToday,
  startOfWeek, endOfWeek, isSameMonth
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
    // Fetch tasks from previous, current, and next month to cover padding days
    const start = format(startOfMonth(subMonths(viewMonth, 1)), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(viewMonth, 1)), 'yyyy-MM-dd');

    supabase
      .from('tasks')
      .select('due_date, completed')
      .gte('due_date', start)
      .lte('due_date', end)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching tasks:', error);
          return;
        }
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
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

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
      <div style={{
        background: 'var(--color-bg)',
        borderRadius: '32px',
        padding: '28px 24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        // In the image, the container is blue. We can use var(--color-bg) for a clean dark look, 
        // or a tinted background. Let's stick to the app's dark theme aesthetic using color-card or bg.
        // Actually, the original design uses color-card for cards. We'll use color-card.
        backgroundColor: 'var(--color-card)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--color-white)',
            letterSpacing: '-0.5px'
          }}>
            Your Active Days
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              style={{
                background: 'transparent', border: 'none', color: 'var(--color-white)',
                cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              color: 'var(--color-white)', fontSize: 16, fontWeight: 500 
            }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={format(viewMonth, 'MMMM')}
                  initial={{ y: slideDir * 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: slideDir * -10, opacity: 0 }}
                  style={{ display: 'inline-block' }}
                >
                  {format(viewMonth, 'MMMM')}
                </motion.span>
              </AnimatePresence>
              <ChevronDown size={16} />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              style={{
                background: 'transparent', border: 'none', color: 'var(--color-white)',
                cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* Day of week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 13,
              fontWeight: 700, color: 'var(--color-white)',
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
              initial={{ x: slideDir * 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDir * -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px 8px' }}
            >
              {calendarDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const meta = dayMeta[dateStr];
                const isSelected = isSameDay(day, activeD);
                const isT = isToday(day);
                const isPast = isBefore(day, new Date()) && !isT;
                const inMonth = isSameMonth(day, viewMonth);

                let dotColor: string | null = null;
                if (meta?.hasTasks) {
                  if (isPast) {
                    dotColor = meta.allComplete ? '#10B981' : '#EF4444';
                  } else {
                    dotColor = 'var(--color-yellow)';
                  }
                }

                const isDashed = !inMonth;

                return (
                  <div key={`${dateStr}-${idx}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayTap(day)}
                      aria-label={`${format(day, 'EEEE, MMMM d')}${meta?.hasTasks ? `, has tasks` : ''}`}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1/1',
                        width: '100%',
                        maxWidth: 48,
                        border: isDashed && !isSelected ? '1.5px dashed rgba(255,255,255,0.2)' : 'none',
                        borderRadius: '50%',
                        background: isSelected
                          ? 'var(--color-yellow)'
                          : isDashed
                            ? 'transparent'
                            : 'var(--color-bg)',
                        cursor: 'pointer',
                        gap: 2,
                        boxShadow: isT && !isSelected ? 'inset 0 0 0 2px var(--color-yellow)' : 'none',
                      }}
                    >
                      <span style={{
                        fontSize: 15,
                        fontWeight: isSelected || isT ? 700 : 600,
                        color: isSelected
                          ? 'var(--color-text-dark)'
                          : isDashed
                            ? 'rgba(255, 255, 255, 0.4)'
                            : 'var(--color-white)',
                      }}>
                        {format(day, 'd')}
                      </span>
                      {dotColor && (
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: isSelected && dotColor === 'var(--color-yellow)' ? 'var(--color-text-dark)' : dotColor, 
                          flexShrink: 0,
                          marginTop: 1,
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
    </div>
  );
};

