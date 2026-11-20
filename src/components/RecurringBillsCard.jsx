import React, { useState } from 'react';
import { CheckCircle2, Clock, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';

export const RecurringBillsCard = () => {
  const { recurringBills, addBill, toggleBillPaid, deleteBill } = useFinance();
  const { displayMoney } = usePrivacy();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    await addBill({
      title: title.trim(),
      amount: Number(amount) || 0,
      dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1))
    });
    setTitle('');
    setAmount('');
    setDueDay('10');
    setShowForm(false);
  };

  return (
    <div className="y-card p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight">Recurring Bills & Subscriptions</h3>
          <p className="text-[11px] text-muted">Click status pill to toggle Paid / Unpaid.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-2.5 py-1.5 rounded-lg y-pill-accent text-xs font-semibold flex items-center gap-1"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Bill'}
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
            placeholder="Bill name (e.g. Internet, Rent, Spotify)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full y-input px-2.5 py-1.5 text-xs"
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Amount (IDR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 y-input px-2.5 py-1.5 text-xs"
              required
            />
            <input
              type="number"
              min={1}
              max={31}
              placeholder="Day"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-16 y-input px-2 py-1.5 text-xs text-center"
              title="Due day of month"
            />
            <button type="submit" className="px-3.5 py-1.5 rounded-md y-btn-accent text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      {recurringBills.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted rounded-lg" style={{ background: 'var(--bg-2)' }}>
          No recurring bills added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recurringBills.map((rb) => (
            <div
              key={rb.id}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 group"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="min-w-0">
                <p className="font-semibold text-xs truncate">{rb.title}</p>
                <span className="text-[10px] text-muted block">Due day {rb.dueDay}</span>
                <span className="text-xs font-bold text-rose-400 block">{displayMoney(rb.amount, 'spending')}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleBillPaid(rb.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                    rb.isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {rb.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {rb.isPaid ? 'Paid' : 'Due'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteBill(rb.id)}
                  className="p-1 text-dim hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
