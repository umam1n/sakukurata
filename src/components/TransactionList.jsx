import React, { useState } from 'react';
import { Search, Download, Trash2, ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { usePrivacy } from '../context/PrivacyContext';
import { formatTanggal } from '../utils/formatters';

export const TransactionList = ({ maxItems = null, onViewAll = null }) => {
  const { transactions, deleteTransaction, isSavingTransaction } = useFinance();
  const { displayMoney } = usePrivacy();

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
      matchesDate = txDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === 'month') {
      matchesDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesDate;
  });

  const visibleList = maxItems ? filteredTransactions.slice(0, maxItems) : filteredTransactions;

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Amount', 'Bucket', 'From Wallet', 'To Wallet', 'Merchant', 'Notes'];
    const rows = transactions.map((t) => {
      const typeLabel = t.type === 'income' ? 'Income' : isSavingTransaction(t) ? 'Saving / Investment' : 'Expense';
      return [
        `"${formatTanggal(t.transactionDate)}"`,
        `"${typeLabel}"`,
        t.amount,
        `"${t.bucketName || t.categoryName || ''}"`,
        `"${t.walletName || ''}"`,
        `"${t.toWalletName || ''}"`,
        `"${t.merchant || t.recipientMerchant || ''}"`,
        `"${t.notes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Sakukurata_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="y-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-sm tracking-tight">
          {maxItems ? 'Recent Transactions' : `Transaction History (${filteredTransactions.length})`}
        </h3>
        <div className="flex items-center gap-2">
          {onViewAll && maxItems && (
            <button onClick={onViewAll} className="text-xs font-semibold text-accent hover:underline">
              View All
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted hover:text-primary"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <Download className="w-3 h-3 text-accent" /> CSV
          </button>
        </div>
      </div>

      {!maxItems && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Search merchant or bucket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full y-input pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: '7D' },
              { key: 'month', label: 'Month' }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setDateFilter(btn.key)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                  dateFilter === btn.key ? 'y-pill-accent' : 'text-muted hover:text-primary'
                }`}
                style={dateFilter !== btn.key ? { background: 'var(--bg-2)', border: '1px solid var(--border)' } : undefined}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {visibleList.length === 0 ? (
          <div
            className="text-center py-6 text-xs text-muted rounded-lg"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            No transactions recorded yet.
          </div>
        ) : (
          visibleList.map((tx) => {
            const isIncome = tx.type === 'income';
            const isSaving = !isIncome && isSavingTransaction(tx);
            const title = tx.merchant || tx.recipientMerchant || 'Transaction';
            const bucketLabel = tx.bucketName || tx.categoryName || '';
            const walletFlow = tx.toWalletName
              ? `${tx.walletName || 'Wallet'} → ${tx.toWalletName}`
              : tx.walletName || 'Wallet';

            return (
              <div
                key={tx.id}
                className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 group transition-colors"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isSaving
                          ? 'bg-sky-500/15 text-sky-400'
                          : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : isSaving ? (
                      <PiggyBank className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-xs truncate">{title}</p>
                      {isSaving && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 flex-shrink-0">
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted truncate">
                      {bucketLabel && (
                        <span className={`font-medium ${isSaving ? 'text-sky-400' : 'text-accent'}`}>
                          {bucketLabel}
                        </span>
                      )}
                      {bucketLabel && ' • '}
                      {walletFlow} • {formatTanggal(tx.transactionDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isIncome ? 'text-emerald-400' : isSaving ? 'text-sky-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : isSaving ? '↗ ' : '-'}
                    {displayMoney(tx.amount, 'transactions')}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1 text-dim hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
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
