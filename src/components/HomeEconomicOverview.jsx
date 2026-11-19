import React, { useState } from 'react';
import { Coffee, Utensils, Bus, Zap, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

const ICON_MAP = { Coffee, Utensils, Bus, Zap };

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
  const displayCategories = categoriesWithSpending.length > 0 ? categoriesWithSpending : categoryStats.slice(0, 4);

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
      strokeDasharray,
      strokeDashoffset,
      sharePercent,
      color: cat.color || '#34d399'
    };
  });

  const handleQuickAdd = (qa) => {
    const matchedCat = categories.find((c) => c.id === qa.bucketId) || categories[0];
    const matchedWallet = wallets.find((w) => w.id === qa.walletId) || wallets[0];

    confetti({
      particleCount: 18,
      spread: 50,
      origin: { y: 0.75 }
    });

    addTransaction({
      type: 'expense',
      amount: Number(qa.amount) || 0,
      bucketId: matchedCat?.id || null,
      bucketName: matchedCat?.name || qa.bucketName || 'General',
      walletId: matchedWallet?.id || null,
      walletName: matchedWallet?.name || 'Wallet',
      merchant: qa.title,
      notes: '1-Click Quick Entry',
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
      bucketName: categories[0]?.name || 'General',
      walletId: wallets[0]?.id || null,
      color: '#34d399',
      icon: 'Zap'
    });
    setQaTitle('');
    setQaAmount('');
    setShowAddQuick(false);
  };

  return (
    <div className="space-y-4">
      {/* Compact Spending Donut Card */}
      <div className="y-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm tracking-tight">Spending Overview</h2>
            <span className="text-[11px] text-muted">Current cycle breakdown</span>
          </div>
          <button
            onClick={onOpenAddTransaction}
            className="w-7 h-7 rounded-md y-btn-accent flex items-center justify-center"
            title="Add Entry"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="relative flex items-center justify-center py-1">
          <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" stroke="var(--bg-3)" strokeWidth="10" fill="transparent" />
            {donutSlices.map((slice) => (
              <circle
                key={slice.id}
                cx="50"
                cy="50"
                r="36"
                stroke={slice.color}
                strokeWidth="10"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Spent</span>
            <span className="text-base font-extrabold tracking-tight">{formatRupiah(totalExpenses)}</span>
            <span className="text-[10px] font-semibold text-accent mt-0.5">
              of {formatRupiah(totalIncome)}
            </span>
          </div>
        </div>

        {/* Compact Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          {donutSlices.slice(0, 3).map((slice) => (
            <div key={slice.id} className="space-y-1">
              <span className="text-[10px] text-muted truncate block">{slice.name}</span>
              <span className="text-sm font-extrabold block leading-none">{slice.sharePercent}%</span>
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: slice.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Compact Quick Expense Shortcuts */}
      <div className="y-card p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold">Quick Expense Shortcuts</span>
          <button
            onClick={() => setShowAddQuick((v) => !v)}
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            {showAddQuick ? 'Cancel' : '+ Add Shortcut'}
          </button>
        </div>

        {showAddQuick && (
          <form onSubmit={handleCreateQuickAction} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Label (e.g. Parking)"
              value={qaTitle}
              onChange={(e) => setQaTitle(e.target.value)}
              className="flex-1 min-w-0 y-input px-2.5 py-1.5 text-xs"
              required
            />
            <input
              type="number"
              placeholder="IDR"
              value={qaAmount}
              onChange={(e) => setQaAmount(e.target.value)}
              className="w-20 y-input px-2.5 py-1.5 text-xs"
              required
            />
            <button type="submit" className="px-3 py-1.5 rounded-md y-btn-accent text-xs">
              Add
            </button>
          </form>
        )}

        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((qa) => {
            const IconComp = ICON_MAP[qa.icon] || Zap;
            return (
              <div key={qa.id} className="relative group">
                <button
                  onClick={() => handleQuickAdd(qa)}
                  className="w-full p-2.5 rounded-lg text-left transition-all active:scale-95"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold truncate pr-3">
                    <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: qa.color || 'var(--color-accent)' }} />
                    <span className="truncate">{qa.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent block mt-0.5">
                    + {formatRupiah(qa.amount)}
                  </span>
                </button>
                <button
                  onClick={() => deleteQuickAction(qa.id)}
                  title="Remove shortcut"
                  className="absolute top-1 right-1 p-0.5 rounded bg-black/40 text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
