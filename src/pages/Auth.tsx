import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'signin' | 'signup' | 'magic' | 'check-email';

export const Auth = () => {
  const { signInWithEmail, signUp, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-card)',
    border: '1.5px solid var(--color-mid)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    fontSize: 16,
    color: 'var(--color-white)',
    outline: 'none',
    fontFamily: 'var(--font-family)',
    transition: 'border-color 200ms ease-out',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
      } else if (mode === 'magic') {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setMode('check-email');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'check-email') {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)',
        background: 'var(--color-bg)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
        <p style={{ color: 'var(--color-grey)', fontSize: 15, lineHeight: 1.6 }}>
          We sent a magic link to <strong style={{ color: 'var(--color-white)' }}>{email}</strong>.<br />
          Tap the link to sign in.
        </p>
        <button
          onClick={() => setMode('signin')}
          style={{
            marginTop: 24, background: 'none', border: 'none',
            color: 'var(--color-yellow)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: `calc(var(--safe-top) + 60px) var(--space-xl) calc(var(--safe-bottom) + 32px)`,
      background: 'var(--color-bg)',
    }}>
      {/* Logo / wordmark */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          Stanza
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-yellow)',
            marginLeft: 4,
            verticalAlign: 'super',
          }} />
        </h1>
        <p style={{ color: 'var(--color-grey)', fontSize: 15, marginTop: 6 }}>
          Your day, in folders.
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--color-card)',
        borderRadius: 'var(--radius-md)',
        padding: 4,
        marginBottom: 24,
        gap: 4,
      }}>
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            style={{
              flex: 1, height: 36, borderRadius: 10,
              background: mode === m ? 'var(--color-yellow)' : 'transparent',
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 700,
              color: mode === m ? 'var(--color-text-dark)' : 'var(--color-grey)',
              transition: 'background 200ms ease-out, color 200ms ease-out',
            }}
          >
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <div>
            <label htmlFor="display-name" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              DISPLAY NAME
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-mid)'}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-mid)'}
          />
        </div>

        {mode !== 'magic' && (
          <div>
            <label htmlFor="password" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-mid)'}
            />
          </div>
        )}

        {error && (
          <p role="alert" style={{ fontSize: 13, color: '#F05050', padding: '10px 14px', background: 'rgba(240,80,80,0.1)', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{
            height: 52,
            background: 'var(--color-yellow)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            fontSize: 16, fontWeight: 700,
            color: 'var(--color-text-dark)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {loading ? '…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
        </motion.button>
      </form>

      {/* Magic link toggle */}
      {mode === 'signin' && (
        <button
          onClick={() => setMode('magic')}
          style={{
            marginTop: 16, background: 'none', border: 'none',
            color: 'var(--color-grey)', fontSize: 14, cursor: 'pointer',
          }}
        >
          Or sign in with a{' '}
          <span style={{ color: 'var(--color-yellow)', fontWeight: 600 }}>magic link</span>
        </button>
      )}
    </div>
  );
};
