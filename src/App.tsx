import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAppStore } from './store/useAppStore';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { NavBar } from './components/NavBar/NavBar';
import { SplashScreen } from './components/common/SplashScreen';
import type { NavTab } from './types/database.types';

export default function App() {
  const { user, loading } = useAuth();
  const { activeNav, setActiveNav } = useAppStore();
  const [calendarVisible, setCalendarVisible] = useState(false);

  if (loading) return <SplashScreen />;
  if (!user) return <Auth />;

  const handleTabChange = (tab: NavTab) => {
    setCalendarVisible(false);
  };

  const handleDateTap = () => {
    setCalendarVisible(true);
    setActiveNav('calendar');
  };

  const handleDateSelect = (date: string) => {
    setCalendarVisible(false);
    setActiveNav('home');
  };

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="popLayout">
        {activeNav === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Home
              onAvatarTap={() => setActiveNav('settings')}
              onDateTap={handleDateTap}
            />
          </motion.div>
        )}

        {activeNav === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Calendar onDateSelect={handleDateSelect} />
          </motion.div>
        )}

        {activeNav === 'settings' && (
          <motion.div
            key="settings"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          >
            <Settings />
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar onTabChange={handleTabChange} />
    </div>
  );
}
