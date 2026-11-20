import React, { useState, useMemo } from 'react';
import { Edit2, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';
import { parseRupiahInput } from '../utils/formatters';

export const SummaryStats = ({ onViewAll, compact = false }) => {
  const { baseSalary, setBaseSalary, transactions, isSpendingTransaction } = useFinance();
  const { displayMoney } = usePrivacy();

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(
    baseSalary ? new Intl.NumberFormat('id-ID').format(baseSalary) : ''
  );

  const handleSaveSalary = () => {
    setBaseSalary(parseRupiahInput(salaryInput));
    setIsEditingSalary(false);
  };

  const weeklyBars = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const list = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toDateString();
      const total = transactions
        .filter((t) => isSpendingTransaction(t) && new Date(t.transactionDate).toDateString() === dateKey)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      list.push({ day: dayLabels[d.getDay()], total, isToday: i === 0 });
    }

    const maxVal = Math.max(...list.map((b) => b.total), 1);
    const peakIdx = list.reduce((best, cur, idx, arr) => (cur.total > arr[best].total ? idx : best), 0);

    return list.map((b, idx) => ({
      ...b,
      heightPercent: b.total > 0 ? Math.max(14, Math.round((b.total / maxVal) * 100)) : 8,
      isPeak: b.total > 0 && idx === peakIdx
    }));
  }, [transactions, isSpendingTransaction]);

  const last7DaysTotal = weeklyBars.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="y-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium text-muted block">Last 7 Days Spending</span>
          <span className="text-lg font-extrabold tracking-tight block">
            {displayMoney(last7DaysTotal, 'spending')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!compact && (
            isEditingSalary ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryInput}
                  onChange={(e) => {
                    const num = parseRupiahInput(e.target.value);
                    setSalaryInput(num > 0 ? new Intl.NumberFormat('id-ID').format(num) : '');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSalary();
                    if (e.key === 'Escape') setIsEditingSalary(false);
                  }}
                  className="w-28 y-input px-2.5 py-1 text-xs font-bold text-right"
                  autoFocus
                />
                <button onClick={handleSaveSalary} className="p-1.5 rounded-md y-btn-accent" title="Save Base Salary">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSalaryInput(baseSalary ? new Intl.NumberFormat('id-ID').format(baseSalary) : '');
                  setIsEditingSalary(true);
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 text-muted hover:text-primary"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                title="Edit Base Salary"
              >
                Base: {displayMoney(baseSalary, 'income')} <Edit2 className="w-3 h-3" />
              </button>
            )
          )}
          {onViewAll && (
            <button onClick={onViewAll} className="text-xs font-semibold text-accent hover:underline">
              Full History
            </button>
          )}
        </div>
      </div>

      <div className="pt-5 pb-1 flex items-end justify-between gap-2 h-32 px-1">
        {weeklyBars.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative">
            {item.isPeak && (
              <div className="absolute -top-5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 whitespace-nowrap">
                {displayMoney(item.total, 'spending')}
              </div>
            )}
            <div className="w-full max-w-[28px] rounded-md h-full flex items-end overflow-hidden p-0.5" style={{ background: 'var(--bg-2)' }}>
              <div
                className="w-full rounded transition-all duration-500"
                style={{
                  height: `${item.heightPercent}%`,
                  backgroundColor: item.isPeak
                    ? '#fb7185'
                    : item.total > 0
                      ? 'var(--color-accent)'
                      : 'var(--bg-3)',
                  opacity: item.total > 0 && !item.isPeak ? 0.65 : 1
                }}
              />
            </div>
            <span className={`text-[10px] font-semibold ${item.isToday ? 'text-accent' : 'text-dim'}`}>
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
