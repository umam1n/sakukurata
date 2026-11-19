import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, ArrowRight, Sparkles, CloudOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthScreen = () => {
  const {
    isFirebaseConfigured,
    authError,
    setAuthError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    continueAsGuest
  } = useAuth();
  const { themeMode, toggleThemeMode } = useTheme();

  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch {
      // handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!isFirebaseConfigured) return;
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      // handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center p-4 relative"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <button
        type="button"
        onClick={toggleThemeMode}
        className="fixed top-4 right-4 p-2 rounded-lg text-muted hover:text-primary"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        title="Toggle Theme"
      >
        {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-md space-y-5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl y-btn-accent flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">
                Saku<span className="text-accent">kurata</span>
              </h1>
              <span className="y-pill-accent text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                Cloud
              </span>
            </div>
            <p className="text-xs text-muted">
              Personal finance, fluid salary budgeting & multi-wallet workspace.
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="y-card p-5 space-y-4">
          {!isFirebaseConfigured && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs flex items-start gap-2">
              <CloudOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Firebase environment keys are not configured yet. You can try <strong>Local Guest Mode</strong> below.
              </span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className={`py-2 rounded-md text-xs font-bold transition-all ${
                mode === 'login' ? 'y-btn-accent' : 'text-muted hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setAuthError('');
              }}
              className={`py-2 rounded-md text-xs font-bold transition-all ${
                mode === 'register' ? 'y-btn-accent' : 'text-muted hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full y-input pl-9 pr-3 py-2 text-xs"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full y-input pl-9 pr-3 py-2 text-xs"
                required
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full y-input pl-9 pr-3 py-2 text-xs"
                minLength={6}
                required
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !isFirebaseConfigured}
              className="w-full py-2.5 rounded-lg y-btn-accent disabled:opacity-40 text-xs flex items-center justify-center gap-2"
            >
              {submitting ? 'Please wait...' : mode === 'register' ? 'Create Account & Continue' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 text-[10px] text-dim uppercase font-bold">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            or
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || !isFirebaseConfigured}
            className="w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 text-primary hover:opacity-90"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            Continue with Google
          </button>
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-2.5 rounded-lg text-xs font-semibold text-muted hover:text-primary transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          Try Without Account (Local Mode)
        </button>
      </div>
    </div>
  );
};
