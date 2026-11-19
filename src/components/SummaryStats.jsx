import React, { useState, useMemo } from 'react';
import { Edit2, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const SummaryStats = ({ onViewAll }) => {
  const {
    baseSalary,
    setBaseSalary,
    totalExpenses,
    overallRemainingCash,
    transactions
  } = useFinance();

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(baseSalary || 0));

  const handleSaveSalary = () => {
    setBaseSalary(Number(salaryInput) || 0);
    setIsEditingSalary(false);
  };

  // Real last-7-days spending bars
  const weeklyBars = useMemo(() => {
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    const buckets = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toDateString();
      const total = transactions
        .filter((t) => t.type === 'expense' && new Date(t.transactionDate).toDateString() === dateKey)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      buckets.push({
        day: dayLabels[d.getDay()],
        total,
        isToday: i === 0
      });
    }

    const maxVal = Math.max(...buckets.map((b) => b.total), 1);
    const peakIndex = buckets.reduce((best, cur, idx, arr) => (cur.total > arr[best].total ? idx : best), 0);

    return buckets.map((b, idx) => ({
      ...b,
      heightPercent: b.total > 0 ? Math.max(12, Math.round((b.total / maxVal) * 100)) : 8,
      isPeak: b.total > 0 && idx === peakIndex
    }));
  }, [transactions]);

  const last7DaysTotal = weeklyBars.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-4">
      {/* Mint Green Featured Balance Card */}
      <div className="mint-card p-5 rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[155px]">
        <div className="flex items-center justify-between">
          <div className="bg-emerald-950/15 px-3 py-1 rounded-full text-[11px] font-extrabold text-emerald-950">
            Gaji Pokok: {formatRupiah(baseSalary)}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-emerald-950/75 uppercase tracking-wider block">
            Sisa Dana Bulan Ini
          </span>
          {isEditingSalary ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                className="w-full bg-emerald-950/20 border border-emerald-950/30 text-emerald-950 font-extrabold rounded-xl px-3 py-1 text-lg focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveSalary}
                className="p-2 bg-emerald-950 text-white rounded-xl"
                title="Simpan Gaji"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-baseline justify-between mt-0.5">
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
                {formatRupiah(overallRemainingCash)}
              </h1>
              <button
                onClick={() => {
                  setSalaryInput(String(baseSalary || 0));
                  setIsEditingSalary(true);
                }}
                className="p-1.5 rounded-xl bg-emerald-950/15 hover:bg-emerald-950/25 text-emerald-950 transition-all"
                title="Ubah Gaji Bulanan"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real 7-Day Spending Bar Chart */}
      <div className="dark-card p-5 rounded-[28px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Pengeluaran 7 Hari Terakhir</span>
            <span className="text-xl font-extrabold text-white tracking-tight mt-0.5 block">
              {formatRupiah(last7DaysTotal)}
            </span>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs text-emerald-400 font-bold hover:underline"
            >
              Riwayat
            </button>
          )}
        </div>

        <div className="pt-7 pb-1 flex items-end justify-between gap-2 h-36 px-1">
          {weeklyBars.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group">
              {item.isPeak && (
                <div className="absolute -top-6 bg-[#ffaaa5] text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow whitespace-nowrap">
                  {formatRupiah(item.total)}
                </div>
              )}
              <div className="w-full bg-[#1c2026] rounded-full h-full flex items-end overflow-hidden p-0.5">
                <div
                  className={`w-full rounded-full transition-all duration-500 ${
                    item.isPeak
                      ? 'bg-[#ffaaa5]'
                      : item.total > 0
                        ? 'bg-[#8ee4af]/60 group-hover:bg-[#8ee4af]'
                        : 'bg-slate-800'
                  }`}
                  style={{ height: `${item.heightPercent}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${item.isToday ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
