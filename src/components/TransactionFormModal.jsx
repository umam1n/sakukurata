import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { autoAssignBucketAndWallet } from '../utils/smartCategorizer';
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
  const [manualBucketOverride, setManualBucketOverride] = useState(false);
  const [manualWalletOverride, setManualWalletOverride] = useState(false);
  const [autoTag, setAutoTag] = useState('');

  useEffect(() => {
    if (categories.length > 0) setBucketId(initialCategoryId || categories[0].id);
    if (wallets.length > 0) setWalletId(wallets[0].id);
    setManualBucketOverride(Boolean(initialCategoryId));
    setManualWalletOverride(false);
    setAutoTag('');
  }, [isOpen, initialCategoryId, categories, wallets]);

  const handleMerchantChange = (val) => {
    setMerchant(val);
    if (type !== 'expense' || !val.trim()) {
      setAutoTag('');
      return;
    }
    const match = autoAssignBucketAndWallet({
      merchant: val,
      buckets: categories,
      wallets
    });
    if (match.intentLabel) {
      setAutoTag(match.intentLabel);
      if (!manualBucketOverride && match.bucketId) setBucketId(match.bucketId);
      if (!manualWalletOverride && match.walletId) setWalletId(match.walletId);
    } else {
      setAutoTag('');
    }
  };

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
      bucketName: type === 'expense' ? (matchedBucket ? matchedBucket.name : 'General') : 'Income',
      walletId: walletId || null,
      walletName: matchedWallet ? matchedWallet.name : 'Wallet',
      merchant: merchant.trim() || (type === 'income' ? 'Extra Income' : 'Expense'),
      notes: notes.trim(),
      transactionDate: new Date(transactionDate).toISOString()
    });

    onClose();
    setAmount('');
    setMerchant('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="y-card w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">Add Transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white' : 'text-muted hover:text-primary'
              }`}
            >
              - Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                type === 'income' ? 'y-btn-accent' : 'text-muted hover:text-primary'
              }`}
            >
              + Income
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1">Amount (IDR)</label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full y-input px-3 py-2 text-base font-extrabold"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {type === 'expense' && categories.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Budget Bucket</label>
                <select
                  value={bucketId}
                  onChange={(e) => {
                    setBucketId(e.target.value);
                    setManualBucketOverride(true);
                  }}
                  className="w-full y-input px-2.5 py-2 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.percentage}%)</option>
                  ))}
                </select>
              </div>
            )}

            {wallets.length > 0 && (
              <div className={type === 'income' ? 'sm:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-muted mb-1">Wallet / Account</label>
                <select
                  value={walletId}
                  onChange={(e) => {
                    setWalletId(e.target.value);
                    setManualWalletOverride(true);
                  }}
                  className="w-full y-input px-2.5 py-2 text-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-muted">
                {type === 'expense' ? 'Merchant / Description' : 'Income Source'}
              </label>
              {autoTag && (
                <span className="y-pill-accent text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Auto: {autoTag}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. MRT Jakarta, Famima, GoFood, Grab' : 'e.g. Freelance, Bonus'}
              value={merchant}
              onChange={(e) => handleMerchantChange(e.target.value)}
              className="w-full y-input px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full y-input px-3 py-2 text-xs"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-lg y-btn-accent text-xs mt-1">
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};
