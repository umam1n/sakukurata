import React, { useState } from 'react';
import { Target, Calendar, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';
import { calculatePercentage } from '../utils/formatters';

export const SavingsGoalsCard = () => {
  const { savingsGoals, addGoal, topUpGoal, deleteGoal } = useFinance();
  const { displayMoney } = usePrivacy();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;
    await addGoal({
      title: title.trim(),
      targetAmount: Number(targetAmount) || 0,
      currentAmount: Number(currentAmount) || 0,
      targetDate
    });
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setShowForm(false);
  };

  return (
    <div className="y-card p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight">Savings Goals & Wishlists</h3>
          <p className="text-[11px] text-muted">Track milestones and top up anytime.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-2.5 py-1.5 rounded-lg y-pill-accent text-xs font-semibold flex items-center gap-1"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3 rounded-lg space-y-2"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <input
            type="text"
            placeholder="Goal title (e.g. Emergency Fund)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full y-input px-2.5 py-1.5 text-xs"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Target (IDR)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="y-input px-2.5 py-1.5 text-xs"
              required
            />
            <input
              type="number"
              placeholder="Saved so far (IDR)"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="y-input px-2.5 py-1.5 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="flex-1 y-input px-2.5 py-1.5 text-xs"
            />
            <button type="submit" className="px-3.5 py-1.5 rounded-md y-btn-accent text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      {savingsGoals.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted rounded-lg" style={{ background: 'var(--bg-2)' }}>
          No savings goals yet. Click <strong>+ Add Goal</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {savingsGoals.map((sg) => {
            const percent = calculatePercentage(sg.currentAmount, sg.targetAmount);
            return (
              <div
                key={sg.id}
                className="p-3.5 rounded-lg space-y-2.5 group"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg y-pill-accent flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{sg.title}</p>
                      {sg.targetDate && (
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {sg.targetDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-accent">{percent}%</span>
                    <button
                      type="button"
                      onClick={() => deleteGoal(sg.id)}
                      className="p-1 text-dim hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted mb-1">
                    <strong className="text-primary">{displayMoney(sg.currentAmount, 'savings')}</strong>
                    <span>{displayMoney(sg.targetAmount, 'savings')}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[50000, 100000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => topUpGoal(sg.id, amt)}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold text-muted hover:text-accent transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
