import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as ChartIcon, Activity } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';

export const AnalyticsCharts = () => {
  const {
    spendingCategoryStats,
    totalSpending,
    spendableBudget,
    totalIncome,
    totalSaved,
    savingsTarget,
    savingsRatePercent,
    savingsProgressPercent,
    isValidPercentageTotal
  } = useFinance();
  const { displayMoney } = usePrivacy();

  // Plot true spending buckets only (never treat savings/investments as expenses)
  const pieData = spendingCategoryStats
    .map((c) => ({ name: c.name, value: c.spentAmount, color: c.color || '#34d399' }))
    .filter((c) => c.value > 0);

  const spendRatio =
    spendableBudget > 0
      ? totalSpending / spendableBudget
      : totalIncome > 0
        ? totalSpending / totalIncome
        : 0;

  let healthScore = 85;
  if (spendRatio <= 0.8) healthScore += 5;
  if (spendRatio > 0.9) healthScore -= 15;
  if (spendRatio > 1.0) healthScore -= 30;
  if (savingsTarget > 0 && totalSaved >= savingsTarget) healthScore += 10;
  else if (savingsRatePercent >= 15) healthScore += 5;
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
            <p className="text-[11px] text-muted">Actual spending only (savings & investments excluded)</p>
          </div>
          <span className="text-xs font-bold text-accent">{displayMoney(totalSpending, 'spending')}</span>
        </div>

        {pieData.length === 0 ? (
          <div
            className="h-48 flex items-center justify-center text-xs text-muted rounded-lg"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            No spending data to chart yet.
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
                  formatter={(value) => [displayMoney(value, 'spending'), 'Spent']}
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
            ? 'Spendable budget is under control and savings are on track.'
            : 'Spendable budget usage is running high — review spending buckets.'}
        </p>

        <div
          className="p-3 rounded-lg text-[11px] text-muted space-y-1.5"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between">
            <span>Spendable Budget Used</span>
            <strong className="text-primary">{Math.round(spendRatio * 100)}%</strong>
          </div>
          <div className="flex justify-between">
            <span>Savings & Investment Rate</span>
            <strong className="text-sky-400">
              {savingsRatePercent}% of income ({savingsProgressPercent}% goal)
            </strong>
          </div>
          <div className="flex justify-between">
            <span>100% Budget Split</span>
            <strong className={isValidPercentageTotal ? 'text-accent' : 'text-amber-400'}>
              {isValidPercentageTotal ? 'Balanced' : 'Needs Review'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
