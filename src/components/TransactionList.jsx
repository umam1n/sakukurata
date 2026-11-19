import React, { useState } from 'react';
import { Search, Download, Trash2, Coffee, ShoppingBag, CreditCard, Music } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, formatTanggal } from '../utils/formatters';

const ICON_PASTELS = [
  { bg: 'bg-[#ffaaa5]/20', text: 'text-[#ffaaa5]', icon: Coffee },
  { bg: 'bg-[#8ee4af]/20', text: 'text-[#8ee4af]', icon: ShoppingBag },
  { bg: 'bg-[#fbe7c6]/20', text: 'text-[#fbe7c6]', icon: CreditCard },
  { bg: 'bg-[#90cdf4]/20', text: 'text-[#90cdf4]', icon: Music }
];

export const TransactionList = () => {
  const { transactions, deleteTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredTransactions = transactions.filter((t) => {
    const label = (t.merchant || t.recipientMerchant || '').toLowerCase();
    const bucket = (t.bucketName || t.categoryName || '').toLowerCase();
    const notes = (t.notes || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = label.includes(q) || bucket.includes(q) || notes.includes(q);

    let matchesDate = true;
    const txDate = new Date(t.transactionDate);
    const now = new Date();

    if (dateFilter === 'today') {
      matchesDate = txDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = txDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      matchesDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Tanggal', 'Tipe', 'Nominal', 'Pos Anggaran', 'Dompet', 'Merchant', 'Catatan'];
    const rows = transactions.map((t) => [
      `"${formatTanggal(t.transactionDate)}"`,
      `"${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
      t.amount,
      `"${t.bucketName || t.categoryName || ''}"`,
      `"${t.walletName || ''}"`,
      `"${t.merchant || t.recipientMerchant || ''}"`,
      `"${t.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Sakukurata_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 mb-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-extrabold text-white text-base tracking-tight">Riwayat Transaksi</h3>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e2229] hover:bg-[#282d36] text-slate-300 text-xs font-bold border border-white/5"
        >
          <Download className="w-3.5 h-3.5 text-[#8ee4af]" /> CSV
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'today', label: 'Hari Ini' },
          { key: 'week', label: '7 Hari' },
          { key: 'month', label: 'Bulan Ini' }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setDateFilter(btn.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dateFilter === btn.key
                ? 'bg-[#8ee4af] text-slate-950 shadow-md'
                : 'bg-[#16191f] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Cari merchant, pos anggaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#16191f] border border-white/5 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#8ee4af]"
        />
      </div>

      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-medium dark-card rounded-[24px]">
            Belum ada transaksi.
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => {
            const styleObj = ICON_PASTELS[idx % ICON_PASTELS.length];
            const IconComponent = styleObj.icon;
            const title = tx.merchant || tx.recipientMerchant || 'Transaksi';
            const bucketLabel = tx.bucketName || tx.categoryName || '';

            return (
              <div
                key={tx.id}
                className="dark-card p-3.5 rounded-[22px] flex items-center justify-between gap-3 hover:bg-[#1a1e24] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${styleObj.bg} ${styleObj.text} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-400">
                      {bucketLabel && <span className="text-emerald-400/90 truncate">{bucketLabel}</span>}
                      <span>•</span>
                      <span>{formatTanggal(tx.transactionDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-extrabold ${
                      tx.type === 'income' ? 'text-[#8ee4af]' : 'text-[#ffaaa5]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 text-slate-600 hover:text-[#ffaaa5] opacity-0 group-hover:opacity-100 transition-all"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
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
