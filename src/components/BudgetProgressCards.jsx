import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';

export const BudgetProgressCards = ({ onOpenAddTransactionForCategory }) => {
  const {
    categoryStats,
    spendingCategoryStats,
    savingCategoryStats,
    totalIncome
  } = useFinance();
  const { displayMoney } = usePrivacy();

  const radius = 36;
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
    <div className="y-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight">Bucket Progress</h3>
          <span className="text-[11px] text-muted">Separated spending limits vs. saving targets</span>
        </div>
        <span className="y-pill-accent text-[10px] font-bold px-2 py-0.5 rounded-md">
          {displayMoney(totalIncome, 'income')}
        </span>
      </div>

      <div className="relative flex items-center justify-center py-1">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="var(--bg-3)" strokeWidth="10" fill="transparent" />
          {slices.map((s) => (
            <circle
              key={s.id}
              cx="50"
              cy="50"
              r={radius}
              stroke={s.color || '#34d399'}
              strokeWidth="10"
              strokeDasharray={s.strokeDasharray}
              strokeDashoffset={s.strokeDashoffset}
              fill="transparent"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[9px] font-bold uppercase text-muted">Allocated</span>
          <span className="text-sm font-extrabold">{displayMoney(totalIncome, 'income')}</span>
        </div>
      </div>

      {/* Group 1: Spending Buckets */}
      {spendingCategoryStats.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
            Spending Buckets
          </span>
          {spendingCategoryStats.map((cat) => (
            <div
              key={cat.id}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-slate-950 font-extrabold text-[11px] flex-shrink-0"
                  style={{ backgroundColor: cat.color || '#34d399' }}
                >
                  {cat.percentage}%
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs truncate">{cat.name}</p>
                  <span className="text-[10px] text-muted block">
                    Spent: {displayMoney(cat.spentAmount, 'spending')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <span
                    className={`text-xs font-bold block ${
                      cat.remainingAmount >= 0 ? 'text-accent' : 'text-rose-400'
                    }`}
                  >
                    {displayMoney(cat.remainingAmount, 'remainingBudget')}
                  </span>
                  <span className="text-[10px] text-dim block">{cat.usagePercent}% used</span>
                </div>
                <button
                  onClick={() => onOpenAddTransactionForCategory(cat.id, 'expense')}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-primary"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  title="Add expense to bucket"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group 2: Savings & Investments */}
      {savingCategoryStats.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
            Savings & Investments
          </span>
          {savingCategoryStats.map((cat) => {
            const targetMet = cat.usagePercent >= 100;
            return (
              <div
                key={cat.id}
                className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-950 font-extrabold text-[11px] flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#60a5fa' }}
                  >
                    {cat.percentage}%
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">{cat.name}</p>
                    <span className="text-[10px] text-muted block">
                      Target: {displayMoney(cat.allocatedAmount, 'savings')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold block text-sky-400">
                      {displayMoney(cat.contributedAmount, 'savings')}
                    </span>
                    <span className={`text-[10px] font-semibold flex items-center justify-end gap-1 ${targetMet ? 'text-accent' : 'text-dim'}`}>
                      {targetMet && <CheckCircle2 className="w-3 h-3" />}
                      {targetMet ? 'Target Met' : `${cat.usagePercent}% of goal`}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenAddTransactionForCategory(cat.id, 'saving')}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-sky-400 hover:text-primary"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    title="Log saving / investment contribution"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
