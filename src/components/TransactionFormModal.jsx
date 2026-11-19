import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const TransactionFormModal = ({ isOpen, onClose, initialCategoryId }) => {
  const { categories, wallets, addTransaction } = useFinance();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [bucketId, setBucketId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (categories.length > 0) {
      setBucketId(initialCategoryId || categories[0].id);
    }
    if (wallets.length > 0) {
      setWalletId(wallets[0].id);
    }
  }, [isOpen, initialCategoryId, categories, wallets]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const matchedBucket = categories.find((c) => c.id === bucketId);
    const matchedWallet = wallets.find((w) => w.id === walletId);

    await addTransaction({
      type,
      amount: numAmount,
      bucketId: type === 'expense' ? bucketId || null : null,
      bucketName: type === 'expense' ? (matchedBucket ? matchedBucket.name : 'Umum') : 'Pemasukan',
      walletId: walletId || null,
      walletName: matchedWallet ? matchedWallet.name : 'Dompet',
      merchant: merchant.trim() || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      notes: notes.trim(),
      transactionDate: new Date(transactionDate).toISOString()
    });

    onClose();
    setAmount('');
    setMerchant('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-extrabold text-white tracking-tight mb-5">Tambah Transaksi</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              - Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              + Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nominal (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 text-sm font-bold">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-extrabold text-lg rounded-2xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
                required
                autoFocus
              />
            </div>
          </div>

          {type === 'expense' && categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pos Anggaran</label>
              <select
                value={bucketId}
                onChange={(e) => setBucketId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 text-xs focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {wallets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rekening / Dompet</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 text-xs focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {type === 'expense' ? 'Merchant / Keperluan' : 'Sumber Pemasukan'}
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'misal: Indomaret, Kopi, Listrik' : 'misal: Bonus, Freelance'}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all mt-2"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
};
