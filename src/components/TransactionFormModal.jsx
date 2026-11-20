import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { autoAssignBucketAndWallet } from '../utils/smartCategorizer';
import { inferBucketKind } from '../utils/templates';
import { formatRupiah } from '../utils/formatters';

export const TransactionFormModal = ({ isOpen, onClose, initialCategoryId, initialType = 'expense' }) => {
  const { categories, wallets, addTransaction } = useFinance();

  const [type, setType] = useState(initialType || 'expense'); // 'expense' | 'saving' | 'income'
  const [amount, setAmount] = useState('');
  const [bucketId, setBucketId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [manualTypeOverride, setManualTypeOverride] = useState(false);
  const [manualBucketOverride, setManualBucketOverride] = useState(false);
  const [manualWalletOverride, setManualWalletOverride] = useState(false);
  const [autoTag, setAutoTag] = useState('');

  const availableBuckets = useMemo(() => {
    if (type === 'income') return [];
    const targetKind = type === 'saving' ? 'saving' : 'spending';
    const filtered = categories.filter((c) => inferBucketKind(c) === targetKind);
    return filtered.length > 0 ? filtered : categories;
  }, [categories, type]);

  useEffect(() => {
    if (!isOpen) return;
    const startType = initialType || 'expense';
    setType(startType);
    setManualTypeOverride(Boolean(initialCategoryId || initialType !== 'expense'));
    setManualBucketOverride(Boolean(initialCategoryId));
    setManualWalletOverride(false);
    setToWalletId('');
    setAutoTag('');

    const defaultMatch = autoAssignBucketAndWallet({
      merchant: '',
      buckets: categories,
      wallets,
      defaultToFood: startType === 'expense'
    });

    if (initialCategoryId) {
      setBucketId(initialCategoryId);
    } else if (startType === 'saving') {
      const firstSaving = categories.find((c) => inferBucketKind(c) === 'saving') || categories[0];
      setBucketId(firstSaving?.id || '');
    } else {
      setBucketId(defaultMatch.bucketId || categories[0]?.id || '');
    }

    if (wallets.length > 0) {
      setWalletId(defaultMatch.walletId || wallets[0].id);
    }
  }, [isOpen, initialCategoryId, initialType, categories, wallets]);

  // Keep bucket selection valid when user switches between Expense <-> Save / Invest
  useEffect(() => {
    if (type === 'income' || availableBuckets.length === 0) return;
    if (!availableBuckets.some((b) => b.id === bucketId)) {
      setBucketId(availableBuckets[0].id);
    }
  }, [type, availableBuckets, bucketId]);

  const handleTypeSwitch = (nextType) => {
    setType(nextType);
    setManualTypeOverride(true);
    setManualBucketOverride(false);
    if (nextType === 'saving') {
      const firstSaving = categories.find((c) => inferBucketKind(c) === 'saving') || categories[0];
      if (firstSaving) setBucketId(firstSaving.id);
    } else if (nextType === 'expense') {
      const firstSpending = categories.find((c) => inferBucketKind(c) === 'spending') || categories[0];
      if (firstSpending) setBucketId(firstSpending.id);
    }
  };

  const handleMerchantChange = (val) => {
    setMerchant(val);
    if (type === 'income' || !val.trim()) {
      setAutoTag('');
      return;
    }
    const match = autoAssignBucketAndWallet({
      merchant: val,
      buckets: categories,
      wallets,
      defaultToFood: true
    });

    if (!manualTypeOverride && match.suggestedTxType === 'saving' && type !== 'saving') {
      setType('saving');
    } else if (!manualTypeOverride && match.suggestedTxType === 'expense' && !match.isDefaultFallback && type === 'saving') {
      setType('expense');
    }

    if (!manualBucketOverride && match.bucketId) setBucketId(match.bucketId);
    if (!manualWalletOverride && match.walletId) setWalletId(match.walletId);
    setAutoTag(match.isDefaultFallback ? '' : (match.intentLabel || ''));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const matchedBucket = categories.find((c) => c.id === bucketId);
    const matchedWallet = wallets.find((w) => w.id === walletId);
    const matchedDestWallet =
      type === 'saving' && toWalletId && toWalletId !== walletId
        ? wallets.find((w) => w.id === toWalletId)
        : null;

    await addTransaction({
      type,
      amount: numAmount,
      bucketId: type === 'income' ? null : (bucketId || null),
      bucketName:
        type === 'income'
          ? 'Income'
          : matchedBucket
            ? matchedBucket.name
            : type === 'saving'
              ? 'Savings'
              : 'General',
      walletId: walletId || null,
      walletName: matchedWallet ? matchedWallet.name : 'Wallet',
      toWalletId: matchedDestWallet ? matchedDestWallet.id : null,
      toWalletName: matchedDestWallet ? matchedDestWallet.name : '',
      merchant:
        merchant.trim() ||
        (type === 'income' ? 'Extra Income' : type === 'saving' ? 'Savings / Investment' : 'Expense'),
      notes: notes.trim(),
      transactionDate: new Date(transactionDate).toISOString()
    });

    onClose();
    setAmount('');
    setMerchant('');
    setNotes('');
    setToWalletId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="y-card w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">Add Entry</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 3-Way Type Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`py-1.5 rounded-md text-[11px] font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white' : 'text-muted hover:text-primary'
              }`}
            >
              - Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('saving')}
              className={`py-1.5 rounded-md text-[11px] font-bold transition-all ${
                type === 'saving' ? 'bg-sky-500 text-slate-950' : 'text-muted hover:text-primary'
              }`}
            >
              ↗ Save / Invest
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`py-1.5 rounded-md text-[11px] font-bold transition-all ${
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
            {type !== 'income' && availableBuckets.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">
                  {type === 'saving' ? 'Savings / Invest Bucket' : 'Spending Bucket'}
                </label>
                <select
                  value={bucketId}
                  onChange={(e) => {
                    setBucketId(e.target.value);
                    setManualBucketOverride(true);
                  }}
                  className="w-full y-input px-2.5 py-2 text-xs"
                >
                  {availableBuckets.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.percentage}%)</option>
                  ))}
                </select>
              </div>
            )}

            {wallets.length > 0 && (
              <div className={type === 'income' ? 'sm:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-muted mb-1">
                  {type === 'saving' ? 'From Wallet' : type === 'income' ? 'Deposit To Wallet' : 'Wallet / Account'}
                </label>
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

          {/* Optional Destination Wallet for Save / Invest transfers */}
          {type === 'saving' && wallets.length > 1 && (
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">
                To Savings / Investment Wallet (Optional)
              </label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full y-input px-2.5 py-2 text-xs"
              >
                <option value="">External app (Bibit, Stockbit, etc. — deduct source only)</option>
                {wallets
                  .filter((w) => w.id !== walletId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-muted">
                {type === 'income'
                  ? 'Income Source'
                  : type === 'saving'
                    ? 'Platform / Target (e.g. Bibit, RDN, Gold)'
                    : 'Merchant / Description'}
              </label>
              {autoTag && (
                <span className="y-pill-accent text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Auto: {autoTag}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder={
                type === 'income'
                  ? 'e.g. Freelance, Bonus'
                  : type === 'saving'
                    ? 'e.g. Bibit Reksadana, Stockbit, Emergency Pocket'
                    : 'e.g. MRT Jakarta, Famima, GoFood, Bibit'
              }
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
            {type === 'saving' ? 'Save Contribution' : type === 'income' ? 'Save Income' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};
