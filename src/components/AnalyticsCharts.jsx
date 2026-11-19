import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as ChartIcon, Activity } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const AnalyticsCharts = () => {
  const { categoryStats, totalExpenses, totalIncome, isValidPercentageTotal } = useFinance();

  const pieData = categoryStats
    .map((c) => ({
      name: c.name,
      value: c.spentAmount,
      color: c.color || '#10b981'
    }))
    .filter((c) => c.value > 0);

  const overallSpentRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

  let healthScore = 95;
  if (overallSpentRatio > 0.7) healthScore -= 15;
  if (overallSpentRatio > 0.85) healthScore -= 20;
  if (overallSpentRatio > 1.0) healthScore -= 35;
  if (!isValidPercentageTotal) healthScore -= 10;
  healthScore = Math.max(10, Math.min(100, healthScore));

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Pie Chart - Distribution of Expenses */}
      <div className="dark-card rounded-[28px] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-emerald-400" /> Proporsi Pengeluaran
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Realisasi per pos anggaranmu.</p>
          </div>
          <span className="text-[11px] font-bold text-slate-200 bg-white/5 px-2.5 py-1 rounded-xl">
            {formatRupiah(totalExpenses)}
          </span>
        </div>

        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-500 bg-[#0d1117] rounded-2xl border border-white/5">
            Belum ada pengeluaran untuk ditampilkan.
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatRupiah(value), 'Pengeluaran']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '1rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Financial Health Score */}
      <div className="dark-card rounded-[28px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" /> Financial Health Score
            </div>
            <h3 className="font-extrabold text-white text-base mt-0.5">Kesehatan Keuangan</h3>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <span className="text-xl font-black text-emerald-400">{healthScore}</span>
          </div>
        </div>

        <p className={`text-xs font-bold ${healthScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {healthScore >= 75
            ? 'Kondisi keuangan sehat & terkendali.'
            : 'Pengeluaran mulai tinggi—cek ulang pos anggaranmu.'}
        </p>

        <div className="bg-[#0d1117] p-3.5 rounded-2xl border border-white/5 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex justify-between">
            <span>Rasio Pengeluaran / Pemasukan:</span>
            <strong className="text-white">{Math.round(overallSpentRatio * 100)}%</strong>
          </div>
          <div className="flex justify-between">
            <span>Status Alokasi 100%:</span>
            <strong className={isValidPercentageTotal ? 'text-emerald-400' : 'text-amber-400'}>
              {isValidPercentageTotal ? 'Valid (100%)' : 'Perlu Disesuaikan'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
