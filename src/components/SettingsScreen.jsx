import React, { useState } from 'react';
import {
  Mail,
  Cloud,
  HardDrive,
  Sparkles,
  Sliders,
  LogOut,
  User,
  Check,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

export const SettingsScreen = ({ onOpenEmailParser }) => {
  const { user, isGuest, logout } = useAuth();
  const { profile, isCloudMode, isOnline, updateProfile, resetGuestData } = useFinance();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [paydayDate, setPaydayDate] = useState(String(profile?.paydayDate || 25));
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      displayName: displayName.trim() || 'Pengguna',
      paydayDate: Math.min(31, Math.max(1, Number(paydayDate) || 25))
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider mb-0.5">
          <Sliders className="w-3.5 h-3.5" /> Akun & Pengaturan
        </div>
        <h1 className="font-extrabold text-white text-xl tracking-tight">Pengaturan</h1>
      </div>

      {/* Account & Firebase Cloud Status */}
      <div className="modern-glass-card p-5 rounded-[28px] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
              {isCloudMode ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-white text-sm truncate">
                {isCloudMode ? user?.email || 'Firebase Cloud' : 'Mode Lokal (Tamu)'}
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                {isCloudMode
                  ? isOnline
                    ? 'Sinkronisasi real-time Web & Android aktif'
                    : 'Offline — perubahan tersimpan lokal & sync otomatis'
                  : 'Tersimpan di browser ini. Masuk akun untuk sync cloud.'}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex-shrink-0 ${
              isCloudMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            {isCloudMode ? 'Firebase' : 'Lokal'}
          </span>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-2.5 pt-2 border-t border-white/5">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Nama Panggilan</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Tgl Gajian</label>
              <input
                type="number"
                min={1}
                max={31}
                value={paydayDate}
                onChange={(e) => setPaydayDate(e.target.value)}
                className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {saved ? 'Profil Tersimpan!' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Bank Email Receipt Parser */}
      <div className="modern-glass-card p-5 rounded-[28px] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">Import Struk Email Bank</h4>
            <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
              Tempel notifikasi myBCA, Mandiri, BRI, GoPay, QRIS
            </span>
          </div>
        </div>

        <button
          onClick={onOpenEmailParser}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Buka Parser Email Bank
        </button>
      </div>

      {/* Logout / Reset Actions */}
      <div className="flex gap-2">
        {isGuest && (
          <button
            type="button"
            onClick={resetGuestData}
            className="flex-1 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ulangi Onboarding
          </button>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex-1 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/20 flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> {isGuest ? 'Keluar Mode Lokal' : 'Keluar Akun'}
        </button>
      </div>
    </div>
  );
};
