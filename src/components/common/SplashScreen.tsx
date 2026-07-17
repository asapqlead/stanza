import { motion } from 'framer-motion';

export const SplashScreen = () => (
  <div style={{
    height: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg)',
    flexDirection: 'column',
    gap: 12,
  }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/icons/stanza-logo.png" alt="" style={{ height: 48, objectFit: 'contain' }} />
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
          Stanza
        </h1>
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{
        width: 24,
        height: 24,
        border: '2.5px solid var(--color-mid)',
        borderTopColor: 'var(--color-yellow)',
        borderRadius: '50%',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        div[style*="borderTopColor"] { animation: spin 0.8s linear infinite; }
      `}</style>
    </motion.div>
  </div>
);
