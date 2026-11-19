import React, { useState } from 'react';
import { Landmark, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';
import { BUCKET_COLOR_SWATCHES } from '../utils/templates';

export const MultiWalletCard = ({ onOpenAddTransaction }) => {
  const { wallets, addWallet, deleteWallet } = useFinance();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(BUCKET_COLOR_SWATCHES[1]);

  const totalWalletBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addWallet({
      name: name.trim(),
      type,
      balance: Number(balance) || 0,
      color
    });
    setName('');
    setBalance('');
    setShowAddForm(false);
  };

  return (
    <div className="y-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-muted font-medium block">Total Balance Across Wallets</span>
          <h2 className="text-xl font-extrabold tracking-tight text-accent">{formatRupiah(totalWalletBalance)}</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-accent" />}
            Wallet
          </button>
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="px-2.5 py-1.5 rounded-lg y-btn-accent text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Entry
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddWallet}
          className="p-3 rounded-lg space-y-2.5"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Name (e.g. SeaBank)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="y-input px-2.5 py-1.5 text-xs"
              required
            />
            <select value={type} onChange={(e) => setType(e.target.value)} className="y-input px-2.5 py-1.5 text-xs">
              <option value="bank">Bank</option>
              <option value="ewallet">E-Wallet</option>
              <option value="cash">Cash</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Starting balance (IDR)"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="flex-1 y-input px-2.5 py-1.5 text-xs"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded bg-transparent cursor-pointer border-0"
            />
            <button type="submit" className="px-3 py-1.5 rounded-md y-btn-accent text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {wallets.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted rounded-lg" style={{ background: 'var(--bg-2)' }}>
            No wallets yet. Click <strong>+ Wallet</strong> to add one.
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 group"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: w.color || '#3b82f6' }}
                >
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs truncate">{w.name}</p>
                  <span className="text-[10px] text-muted uppercase">{w.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{formatRupiah(w.balance)}</span>
                <button
                  type="button"
                  onClick={() => deleteWallet(w.id)}
                  className="p-1 text-dim hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Wallet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
