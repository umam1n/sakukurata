import React, { useState, useMemo } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';
import { INDONESIAN_INSTITUTIONS, INSTITUTION_TYPE_LABELS } from '../utils/indonesianBanks';
import { BankLogo } from './BankLogo';

export const MultiWalletCard = ({ onOpenAddTransaction }) => {
  const { wallets, addWallet, deleteWallet } = useFinance();

  const [showAddForm, setShowAddForm] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#005CAA');

  const totalWalletBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  const filteredInstitutions = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return INDONESIAN_INSTITUTIONS.slice(0, 12);
    return INDONESIAN_INSTITUTIONS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.short.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [bankSearch]);

  const handleSelectInstitution = (inst) => {
    setName(inst.name);
    setType(inst.type === 'digital_bank' || inst.type === 'syariah' ? 'bank' : inst.type);
    setColor(inst.color);
  };

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
    setBankSearch('');
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
          className="p-3 rounded-lg space-y-3"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          {/* Searchable Indonesian Banks & E-Wallets Picker */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Indonesian banks & e-wallets (BCA, Jago, BSI, SeaBank, GoPay...)"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full y-input pl-8 pr-3 py-1.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
              {filteredInstitutions.map((inst) => {
                const active = name === inst.name;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelectInstitution(inst)}
                    className="p-1.5 rounded-lg flex items-center gap-2 text-left transition-all"
                    style={{
                      background: active ? 'rgba(var(--color-accent-rgb), 0.14)' : 'var(--bg-card)',
                      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--border)'}`
                    }}
                  >
                    <BankLogo institutionId={inst.id} size={24} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold truncate">{inst.name}</p>
                      <span className="text-[9px] text-dim block">{INSTITUTION_TYPE_LABELS[inst.type]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Wallet name"
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
            <button type="submit" className="px-3.5 py-1.5 rounded-md y-btn-accent text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Wallets List with Branded SVG Logos */}
      <div className="space-y-2">
        {wallets.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted rounded-lg" style={{ background: 'var(--bg-2)' }}>
            No wallets yet. Click <strong>+ Wallet</strong> to choose from 40+ Indonesian banks & e-wallets.
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 group"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BankLogo name={w.name} color={w.color} size={34} />
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
