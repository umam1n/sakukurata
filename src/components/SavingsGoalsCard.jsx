import React, { useState } from 'react';
import { Target, Calendar, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, calculatePercentage } from '../utils/formatters';

export const SavingsGoalsCard = () => {
  const { savingsGoals, addGoal, topUpGoal, deleteGoal } = useFinance();

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
    <div className="dark-card rounded-[28px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white tracking-tight">Target Tabungan</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Pantau wishlist & dana impianmu.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Batal' : 'Target'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0d1117] p-3.5 rounded-2xl border border-white/10 space-y-2.5">
          <input
            type="text"
            placeholder="Nama target (mis: Dana Darurat)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Target (Rp)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <input
              type="number"
              placeholder="Terkumpul (Rp)"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="flex-1 bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {savingsGoals.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 bg-[#0d1117] rounded-2xl border border-white/5">
          Belum ada target tabungan. Tap <strong>+ Target</strong> untuk mulai.
        </div>
      ) : (
        <div className="space-y-3">
          {savingsGoals.map((sg) => {
            const percent = calculatePercentage(sg.currentAmount, sg.targetAmount);
            return (
              <div
                key={sg.id}
                className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 space-y-3 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{sg.title}</h4>
                      {sg.targetDate && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {sg.targetDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      {percent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteGoal(sg.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">
                      <strong className="text-white">{formatRupiah(sg.currentAmount)}</strong>
                    </span>
                    <span className="text-slate-400">Target {formatRupiah(sg.targetAmount)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {[50000, 100000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => topUpGoal(sg.id, amt)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[10px] font-bold text-slate-300 hover:text-emerald-300 transition-colors"
                    >
                      + {amt / 1000}rb
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
