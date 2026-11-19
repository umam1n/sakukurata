import React from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const BudgetProgressCards = ({ onOpenAddTransactionForCategory }) => {
  const { categoryStats, totalIncome } = useFinance();

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const slices = categoryStats.map((cat) => {
    const frac = (Number(cat.percentage) || 0) / 100;
    const strokeDasharray = `${frac * circumference} ${circumference}`;
    const strokeDashoffset = -offset;
    offset += frac * circumference;
    return { ...cat, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="dark-card p-5 rounded-[28px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">Ringkasan Alokasi</h3>
            <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
              Distribusi Dana Masuk Bulanan
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-[#1e2229] text-emerald-400 text-[11px] font-bold">
            100%
          </div>
        </div>

        <div className="relative py-2 flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="#0d1117" strokeWidth="11" fill="transparent" />
            {slices.map((s) => (
              <circle
                key={s.id}
                cx="50"
                cy="50"
                r={radius}
                stroke={s.color || '#10b981'}
                strokeWidth="11"
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Alokasi</span>
            <span className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              {formatRupiah(totalIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Per-Bucket Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">Rincian Pos Anggaran</span>
          <span className="text-[11px] text-slate-400 font-semibold">Sisa Saldo</span>
        </div>

        {categoryStats.map((cat) => (
          <div
            key={cat.id}
            className="dark-card p-4 rounded-[22px] flex items-center justify-between gap-3 hover:bg-[#1a1e24] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0"
                style={{ backgroundColor: cat.color || '#10b981' }}
              >
                {cat.percentage}%
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{cat.name}</h4>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Terpakai: {formatRupiah(cat.spentAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="text-right">
                <span
                  className={`text-sm font-extrabold block ${
                    cat.remainingAmount >= 0 ? 'text-[#8ee4af]' : 'text-[#ffaaa5]'
                  }`}
                >
                  {formatRupiah(cat.remainingAmount)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold block">{cat.usagePercent}% dipakai</span>
              </div>

              <button
                onClick={() => onOpenAddTransactionForCategory(cat.id)}
                className="w-8 h-8 rounded-xl bg-[#1e2229] hover:bg-[#282d36] text-white flex items-center justify-center border border-white/5"
                title="Tambah Transaksi"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
