import React, { useState, useMemo } from 'react';
import { Plus, Trash2, X, Search, Pencil, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { INDONESIAN_INSTITUTIONS, INSTITUTION_TYPE_LABELS } from '../utils/indonesianBanks';
import { BankLogo } from './BankLogo';

const formatThousands = (raw) => {
  const num = parseRupiahInput(raw);
  return num > 0 ? new Intl.NumberFormat('id-ID').format(num) : '';
};

export const MultiWalletCard = ({ onOpenAddTransaction }) => {
  const { wallets, addWallet, updateWallet, deleteWallet } = useFinance();

  // Add wallet state
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balanceDisplay, setBalanceDisplay] = useState('');
  const [color, setColor] = useState('#005CAA');

  // Inline edit wallet state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('bank');
  const [editBalanceDisplay, setEditBalanceDisplay] = useState('');

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
      balance: parseRupiahInput(balanceDisplay),
      color
    });
    setName('');
    setBalanceDisplay('');
    setBankSearch('');
    setShowAddForm(false);
  };

  const startEditing = (w) => {
    setEditingId(w.id);
    setEditName(w.name || '');
    setEditType(w.type || 'bank');
    setEditBalanceDisplay(w.balance ? new Intl.NumberFormat('id-ID').format(Number(w.balance)) : '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditBalanceDisplay('');
  };

  const handleSaveEdit = async (e, walletId) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateWallet(walletId, {
      name: editName.trim(),
      type: editType,
      balance: parseRupiahInput(editBalanceDisplay)
    });
    cancelEditing();
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
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-[11px] font-bold text-muted">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={balanceDisplay}
                onChange={(e) => setBalanceDisplay(formatThousands(e.target.value))}
                className="w-full y-input pl-8 pr-2.5 py-1.5 text-xs font-semibold"
              />
            </div>
            <button type="submit" className="px-3.5 py-1.5 rounded-md y-btn-accent text-xs">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Wallets List with Inline Edit & Branded SVG Logos */}
      <div className="space-y-2">
        {wallets.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted rounded-lg" style={{ background: 'var(--bg-2)' }}>
            No wallets yet. Click <strong>+ Wallet</strong> to choose from 40+ Indonesian banks & e-wallets.
          </div>
        ) : (
          wallets.map((w) => {
            const isEditing = editingId === w.id;

            if (isEditing) {
              return (
                <form
                  key={w.id}
                  onSubmit={(e) => handleSaveEdit(e, w.id)}
                  className="p-3 rounded-lg space-y-2.5"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--color-accent)'
                  }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Wallet name"
                      className="col-span-2 y-input px-2.5 py-1.5 text-xs font-semibold"
                      required
                      autoFocus
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="y-input px-2 py-1.5 text-xs"
                    >
                      <option value="bank">Bank</option>
                      <option value="ewallet">E-Wallet</option>
                      <option value="cash">Cash</option>
                      <option value="investment">Investment</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-[11px] font-bold text-accent">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={editBalanceDisplay}
                        onChange={(e) => setEditBalanceDisplay(formatThousands(e.target.value))}
                        onKeyDown={(e) => e.key === 'Escape' && cancelEditing()}
                        className="w-full y-input pl-8 pr-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md y-btn-accent text-xs flex items-center gap-1"
                      title="Save changes"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-1.5 rounded-md text-muted hover:text-primary"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              );
            }

            return (
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

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold mr-1">{formatRupiah(w.balance)}</span>
                  <button
                    type="button"
                    onClick={() => startEditing(w)}
                    className="p-1.5 rounded-md text-muted hover:text-accent opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Edit Wallet & Balance"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWallet(w.id)}
                    className="p-1.5 rounded-md text-dim hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Wallet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
