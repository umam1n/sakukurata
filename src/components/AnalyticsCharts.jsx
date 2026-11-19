import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as ChartIcon, Activity } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const AnalyticsCharts = () => {
  const { categoryStats, totalExpenses, totalIncome, isValidPercentageTotal } = useFinance();

  const pieData = categoryStats
    .map((c) => ({ name: c.name, value: c.spentAmount, color: c.color || '#34d399' }))
    .filter((c) => c.value > 0);

  const overallSpentRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

  let healthScore = 95;
  if (overallSpentRatio > 0.7) healthScore -= 15;
  if (overallSpentRatio > 0.85) healthScore -= 20;
  if (overallSpentRatio > 1.0) healthScore -= 35;
  if (!isValidPercentageTotal) healthScore -= 10;
  healthScore = Math.max(10, Math.min(100, healthScore));

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-7 y-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <ChartIcon className="w-4 h-4 text-accent" /> Expense Distribution
            </h3>
            <p className="text-[11px] text-muted">Actual spending by budget bucket</p>
          </div>
          <span className="text-xs font-bold text-accent">{formatRupiah(totalExpenses)}</span>
        </div>

        {pieData.length === 0 ? (
          <div
            className="h-48 flex items-center justify-center text-xs text-muted rounded-lg"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            No expense data to chart yet.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={46} outerRadius={74} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatRupiah(value), 'Spent']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="md:col-span-5 y-card p-4 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-accent font-bold text-[10px] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" /> Health Score
            </div>
            <h3 className="font-bold text-sm mt-0.5">Financial Health</h3>
          </div>
          <div className="w-12 h-12 rounded-xl y-pill-accent flex items-center justify-center">
            <span className="text-lg font-extrabold">{healthScore}</span>
          </div>
        </div>

        <p className={`text-xs font-semibold ${healthScore >= 75 ? 'text-accent' : 'text-amber-400'}`}>
          {healthScore >= 75
            ? 'Your spending ratio is healthy and balanced.'
            : 'Spending is trending high — review your buckets.'}
        </p>

        <div
          className="p-3 rounded-lg text-[11px] text-muted space-y-1.5"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between">
            <span>Expense-to-Income Ratio</span>
            <strong className="text-primary">{Math.round(overallSpentRatio * 100)}%</strong>
          </div>
          <div className="flex justify-between">
            <span>100% Budget Discipline</span>
            <strong className={isValidPercentageTotal ? 'text-accent' : 'text-amber-400'}>
              {isValidPercentageTotal ? 'Balanced' : 'Needs Review'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
