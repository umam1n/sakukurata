import React, { useState } from 'react';
import { CheckCircle2, Clock, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const RecurringBillsCard = () => {
  const { recurringBills, addBill, toggleBillPaid, deleteBill } = useFinance();

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
    <div className="dark-card rounded-[28px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white tracking-tight">Tagihan Rutin</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Tap status untuk tandai sudah/belum dibayar.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Batal' : 'Tagihan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0d1117] p-3.5 rounded-2xl border border-white/10 space-y-2.5">
          <input
            type="text"
            placeholder="Nama tagihan (mis: Wi-Fi, Listrik)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Nominal (Rp)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-[#16191f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <input
              type="number"
              min={1}
              max={31}
              placeholder="Tgl"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-16 bg-[#16191f] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white text-center"
              title="Tanggal jatuh tempo"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {recurringBills.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 bg-[#0d1117] rounded-2xl border border-white/5">
          Belum ada tagihan rutin bulanan.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recurringBills.map((rb) => (
            <div
              key={rb.id}
              className="bg-[#0d1117] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-2 group"
            >
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{rb.title}</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">Jatuh tempo tgl {rb.dueDay}</span>
                <span className="text-xs font-extrabold text-rose-400 block mt-0.5">
                  {formatRupiah(rb.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleBillPaid(rb.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    rb.isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {rb.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {rb.isPaid ? 'Lunas' : 'Belum'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteBill(rb.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus Tagihan"
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
