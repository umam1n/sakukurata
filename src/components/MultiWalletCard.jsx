import React, { useState } from 'react';
import { Wallet, Landmark, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';
import { BUCKET_COLOR_SWATCHES } from '../utils/templates';

export const MultiWalletCard = ({ onOpenAddTransaction }) => {
  const { profile, wallets, addWallet, deleteWallet } = useFinance();

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
    <div className="space-y-4 mb-6">
      {/* Main Balance Card & Quick Action Tiles */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-8 dark-card p-5 rounded-[28px] flex flex-col justify-between min-h-[155px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {profile?.displayName || 'Dompet Saya'}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              {wallets.length} Akun
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Total Saldo Semua Dompet
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {formatRupiah(totalWalletBalance)}
            </h2>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="flex-1 bg-[#8ee4af] p-3 rounded-[22px] flex flex-col items-center justify-center text-slate-950 font-bold shadow-md hover:opacity-90 transition-all"
            title="Catat Transaksi"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-extrabold mt-0.5">Transaksi</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="flex-1 bg-[#fbe7c6] p-3 rounded-[22px] flex flex-col items-center justify-center text-slate-950 font-bold shadow-md hover:opacity-90 transition-all"
            title="Tambah Dompet Baru"
          >
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] font-extrabold mt-0.5">+ Dompet</span>
          </button>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <form onSubmit={handleAddWallet} className="dark-card p-4 rounded-[24px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">Tambah Dompet / Rekening</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nama (mis: SeaBank)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="bank">Bank</option>
              <option value="ewallet">E-Wallet</option>
              <option value="cash">Tunai</option>
              <option value="investment">Investasi</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Saldo Awal (Rp)"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-xl bg-transparent cursor-pointer border-0"
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

      {/* Wallets List */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-extrabold text-white uppercase tracking-wider block px-1">
          Daftar Rekening & Dompet
        </span>

        {wallets.length === 0 ? (
          <div className="dark-card p-6 rounded-[24px] text-center text-xs text-slate-400">
            Belum ada dompet. Tap <strong>+ Dompet</strong> di atas untuk menambahkan.
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className="dark-card p-4 rounded-[24px] flex items-center justify-between hover:bg-[#1a1e24] transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: w.color || '#3b82f6' }}
                >
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{w.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mt-0.5">
                    {w.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">{formatRupiah(w.balance)}</span>
                <button
                  type="button"
                  onClick={() => deleteWallet(w.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus Dompet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
