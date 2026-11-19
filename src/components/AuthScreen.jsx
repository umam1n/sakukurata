import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, ArrowRight, Sparkles, CloudOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
    <div className="mobile-app-frame mx-auto relative flex flex-col justify-between p-6 overflow-y-auto">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="pt-8 space-y-4 relative z-10">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20">
          <Wallet className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Saku<span className="text-emerald-400">kurata</span>
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Cloud
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Atur alokasi gaji, dompet, & pengeluaran harian dengan bebas. Sinkron otomatis antara Web & Android.
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="modern-glass-card rounded-[32px] p-5 space-y-4 my-6 relative z-10">
        {!isFirebaseConfigured && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-start gap-2">
            <CloudOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Firebase belum dihubungkan (`.env.local` / Vercel Env). Kamu tetap bisa langsung mencoba <strong>Mode Tamu (Lokal)</strong> di bawah.
            </span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#090c10] p-1 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthError('');
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setAuthError('');
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'register' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Nama panggilan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              placeholder="Password (min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
              minLength={6}
              required
            />
          </div>

          {authError && (
            <p className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !isFirebaseConfigured}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {submitting ? 'Memproses...' : mode === 'register' ? 'Buat Akun & Mulai' : 'Masuk ke Akun'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase font-bold">
          <div className="h-px flex-1 bg-white/10" />
          atau
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting || !isFirebaseConfigured}
          className="w-full py-3 rounded-2xl bg-[#161b22] hover:bg-[#1f2630] disabled:opacity-40 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Lanjutkan dengan Google
        </button>
      </div>

      {/* Guest / Local First Option */}
      <div className="pb-4 text-center space-y-2 relative z-10">
        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs border border-white/10 transition-all"
        >
          Coba Tanpa Akun (Mode Lokal)
        </button>
        <p className="text-[10px] text-slate-500">
          Data tersimpan aman di perangkatmu & bisa disinkronkan ke cloud kapan saja.
        </p>
      </div>
    </div>
  );
};
