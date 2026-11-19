import React, { useState } from 'react';
import { Coffee, Utensils, Bus, Zap, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

const ICON_MAP = {
  Coffee,
  Utensils,
  Bus,
  Zap
};

export const HomeEconomicOverview = ({ onOpenAddTransaction }) => {
  const {
    categoryStats,
    totalExpenses,
    totalIncome,
    addTransaction,
    categories,
    wallets,
    quickActions,
    addQuickAction,
    deleteQuickAction
  } = useFinance();

  const [showAddQuick, setShowAddQuick] = useState(false);
  const [qaTitle, setQaTitle] = useState('');
  const [qaAmount, setQaAmount] = useState('');

  const categoriesWithSpending = categoryStats.filter((c) => c.spentAmount > 0);
  const displayCategories = categoriesWithSpending.length > 0 ? categoriesWithSpending : categoryStats.slice(0, 3);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const totalRef = totalExpenses > 0 ? totalExpenses : 1;

  let currentOffset = 0;
  const donutSlices = displayCategories.map((cat) => {
    const fraction = totalExpenses > 0 ? cat.spentAmount / totalRef : (Number(cat.percentage) || 0) / 100;
    const strokeDasharray = `${Math.max(0, fraction * circumference)} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += fraction * circumference;
    const sharePercent = totalExpenses > 0 ? Math.round(fraction * 100) : Number(cat.percentage) || 0;

    return {
      ...cat,
      fraction,
      strokeDasharray,
      strokeDashoffset,
      sharePercent,
      color: cat.color || '#10b981'
    };
  });

  const handleQuickAdd = (qa) => {
    const matchedCat = categories.find((c) => c.id === qa.bucketId) || categories[0];
    const matchedWallet = wallets.find((w) => w.id === qa.walletId) || wallets[0];

    confetti({
      particleCount: 22,
      spread: 55,
      origin: { y: 0.8 },
      colors: [qa.color || '#10b981', '#10b981', '#3b82f6']
    });

    addTransaction({
      type: 'expense',
      amount: Number(qa.amount) || 0,
      bucketId: matchedCat?.id || null,
      bucketName: matchedCat?.name || qa.bucketName || 'Umum',
      walletId: matchedWallet?.id || null,
      walletName: matchedWallet?.name || 'Dompet',
      merchant: qa.title,
      notes: 'Catat Cepat 1-Klik',
      transactionDate: new Date().toISOString()
    });
  };

  const handleCreateQuickAction = async (e) => {
    e.preventDefault();
    const amt = parseRupiahInput(qaAmount);
    if (!qaTitle.trim() || amt <= 0) return;
    await addQuickAction({
      title: qaTitle.trim(),
      amount: amt,
      bucketId: categories[0]?.id || null,
      bucketName: categories[0]?.name || 'Umum',
      walletId: wallets[0]?.id || null,
      color: '#10b981',
      icon: 'Zap'
    });
    setQaTitle('');
    setQaAmount('');
    setShowAddQuick(false);
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-3.5">
      {/* 1. Economic Overview Donut Card */}
      <div className="modern-glass-card p-5 rounded-[32px] space-y-3 relative overflow-hidden flex-1 flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="font-black text-white text-lg tracking-tight">Economic Overview</h1>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
              Total Pengeluaran Bulan Ini
            </span>
          </div>
          <button
            onClick={onOpenAddTransaction}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-md active:scale-95 transition-all"
            title="Tambah Transaksi"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Central Donut Chart */}
        <div className="relative py-1 flex items-center justify-center">
          <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" stroke="#161b22" strokeWidth="11" fill="transparent" />
            {donutSlices.map((slice) => (
              <circle
                key={slice.id}
                cx="50"
                cy="50"
                r="36"
                stroke={slice.color}
                strokeWidth="11"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Total Spending
            </span>
            <span className="text-lg font-black text-white tracking-tight mt-0.5">
              {formatRupiah(totalExpenses)}
            </span>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
              Dari Dana Masuk
            </span>
            <span className="text-xs font-black text-emerald-400 mt-0.5">
              {formatRupiah(totalIncome)}
            </span>
          </div>

          {donutSlices.slice(0, 3).map((slice, idx) => {
            const positions = ['top-1 right-2', 'bottom-4 left-3', 'right-1 top-1/2'];
            return (
              <div
                key={slice.id}
                className={`absolute ${positions[idx % positions.length]} bg-[#161b22]/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 shadow-lg text-[9px] font-black text-slate-100 flex items-center gap-1`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slice.color }} />
                {formatRupiah(slice.spentAmount > 0 ? slice.spentAmount : slice.allocatedAmount)}
              </div>
            );
          })}
        </div>

        {/* Legend Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
          {donutSlices.slice(0, 3).map((slice) => (
            <div key={slice.id} className="text-left space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 truncate block">
                {slice.name}
              </span>
              <span className="text-base font-black text-white block leading-none">
                {slice.sharePercent}%
              </span>
              <div
                className="h-1 w-full rounded-full mt-1"
                style={{ backgroundColor: slice.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fluid 1-Click Quick Expense Chips */}
      <div className="space-y-2">
        {showAddQuick ? (
          <form
            onSubmit={handleCreateQuickAction}
            className="p-2.5 rounded-2xl bg-[#161b22] border border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nama (mis: Parkir)"
              value={qaTitle}
              onChange={(e) => setQaTitle(e.target.value)}
              className="flex-1 min-w-0 bg-[#0d1117] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <input
              type="number"
              placeholder="Rp"
              value={qaAmount}
              onChange={(e) => setQaAmount(e.target.value)}
              className="w-20 bg-[#0d1117] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setShowAddQuick(false)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {quickActions.map((qa) => {
              const IconComp = ICON_MAP[qa.icon] || Zap;
              return (
                <div
                  key={qa.id}
                  className="relative group flex-shrink-0 min-w-[108px]"
                >
                  <button
                    onClick={() => handleQuickAdd(qa)}
                    className="w-full p-2.5 rounded-2xl bg-[#161b22]/90 border border-white/10 text-left hover:bg-[#21262d] transition-all active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 truncate pr-3">
                      <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: qa.color || '#10b981' }} />
                      <span className="truncate">{qa.title}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 block mt-0.5">
                      + {formatRupiah(qa.amount)}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteQuickAction(qa.id)}
                    title="Hapus Shortcut"
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => setShowAddQuick(true)}
              className="flex-shrink-0 p-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-slate-400 hover:text-white flex flex-col items-center justify-center transition-all"
              title="Tambah Shortcut Catat Cepat"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Shortcut</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
