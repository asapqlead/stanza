import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Profile } from '../types/database.types';

export const Settings = () => {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setDisplayName(data.display_name ?? '');
        }
      });
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account and all tasks? This cannot be undone.')) return;
    await signOut();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-mid)',
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-md)',
    padding: '13px 14px',
    fontSize: 15,
    color: 'var(--color-white)',
    outline: 'none',
    fontFamily: 'var(--font-family)',
    transition: 'border-color 200ms ease-out',
  };

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: `calc(var(--safe-top) + 20px) var(--space-xl) calc(var(--safe-bottom) + 76px)`,
      overflowY: 'auto',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>Settings</h1>

      {/* Profile section */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, marginBottom: 12 }}>
          PROFILE
        </h2>
        <div style={{
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--color-yellow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={20} color="var(--color-text-dark)" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{displayName || 'No name set'}</p>
                <p style={{ fontSize: 13, color: 'var(--color-grey)' }}>{user?.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="display-name-setting" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                DISPLAY NAME
              </label>
              <input
                id="display-name-setting"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-yellow)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <motion.button
              onClick={handleSaveName}
              disabled={saving}
              whileTap={{ scale: 0.97 }}
              style={{
                height: 44,
                background: saved ? 'rgba(72,199,116,0.2)' : 'var(--color-yellow)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 700,
                color: saved ? '#48C774' : 'var(--color-text-dark)',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 200ms ease-out, color 200ms ease-out',
              }}
            >
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save Name'}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Account section */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-grey)', letterSpacing: 0.5, marginBottom: 12 }}>
          ACCOUNT
        </h2>
        <div style={{
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <button
            onClick={signOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: 'var(--space-lg)', background: 'none', border: 'none',
              cursor: 'pointer', borderBottom: '1px solid var(--color-mid)',
            }}
          >
            <LogOut size={18} color="var(--color-white)" />
            <span style={{ fontSize: 15, color: 'var(--color-white)' }}>Sign Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: 'var(--space-lg)', background: 'none', border: 'none',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={18} color="#F05050" />
            <span style={{ fontSize: 15, color: '#F05050' }}>Delete Account</span>
          </button>
        </div>
      </section>

      {/* App info */}
      <div style={{ textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: 12, color: 'var(--color-mid)', fontWeight: 600, letterSpacing: 0.5 }}>
          STANZA v1.0
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-grey)', marginTop: 4 }}>
          Your day, in folders.
        </p>
      </div>
    </div>
  );
};
