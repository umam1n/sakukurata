import React from 'react';
import { Wallet, Cloud, HardDrive } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Navbar = () => {
  const { profile, isCloudMode, isOnline } = useFinance();

  return (
    <div className="px-5 pt-5 pb-3.5 flex items-center justify-between bg-[#090c10]/95 backdrop-blur-xl sticky top-0 z-30 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-base tracking-tight">
              Saku<span className="text-emerald-400">kurata</span>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block">
            Halo, {profile?.displayName || 'Pengguna'}
          </span>
        </div>
      </div>

      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
          isCloudMode
            ? isOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-slate-800/80 text-slate-300 border-white/10'
        }`}
      >
        {isCloudMode ? <Cloud className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
        {isCloudMode ? (isOnline ? 'Cloud Sync' : 'Offline') : 'Lokal'}
      </div>
    </div>
  );
};
