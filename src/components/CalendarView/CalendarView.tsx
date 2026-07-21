import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
      {/* Month header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goPrev}
          aria-label="Previous month"
          style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ChevronLeft size={20} color="var(--color-white)" />
        </motion.button>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h2
            key={format(viewMonth, 'yyyy-MM')}
            initial={{ x: slideDir * 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDir * -30, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.5px' }}
          >
            {format(viewMonth, 'MMMM yyyy')}
          </motion.h2>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goNext}
          aria-label="Next month"
          style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ChevronRight size={20} color="var(--color-white)" />
        </motion.button>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        padding: '24px 16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}>
        {/* Day of week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 16 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 12,
              fontWeight: 600, color: 'var(--color-grey)',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={format(viewMonth, 'yyyy-MM')}
            initial={{ x: slideDir * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDir * -40, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 0' }}
          >
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const meta = dayMeta[dateStr];
              const isSelected = isSameDay(day, activeD);
              const isT = isToday(day);
              const isPast = isBefore(day, new Date()) && !isT;

              let dotColor: string | null = null;
              if (meta?.hasTasks) {
                if (isPast) {
                  dotColor = meta.allComplete ? '#4CAF50' : '#F05050';
                } else {
                  dotColor = 'var(--color-yellow)';
                }
              }

              return (
                <motion.button
                  key={dateStr}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDayTap(day)}
                  aria-label={`${format(day, 'EEEE, MMMM d')}${meta?.hasTasks ? `, has tasks` : ''}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    width: '100%',
                    border: 'none',
                    borderRadius: '16px',
                    background: isT 
                      ? 'var(--color-yellow)' 
                      : isSelected 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'transparent',
                    boxShadow: isT ? '0 4px 12px rgba(245, 200, 66, 0.3)' : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    gap: 4,
                  }}
                >
                  <span style={{
                    fontSize: 16,
                    fontWeight: isT || isSelected ? 700 : 500,
                    color: isT
                      ? 'var(--color-text-dark)'
                      : isSelected
                        ? 'var(--color-white)'
                        : isPast
                          ? 'rgba(142, 142, 147, 0.5)'
                          : 'var(--color-white)',
                    transition: 'color 0.2s',
                  }}>
                    {format(day, 'd')}
                  </span>
                  {dotColor && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: dotColor, flexShrink: 0,
                      boxShadow: `0 0 6px ${dotColor}`,
                    }} />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        marginTop: 'auto',
        marginBottom: 20,
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {[
          { color: 'var(--color-yellow)', label: 'Has tasks' },
          { color: '#4CAF50', label: 'All complete' },
          { color: '#F05050', label: 'Incomplete' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: item.color,
              boxShadow: `0 0 8px ${item.color}`
            }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-grey)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
