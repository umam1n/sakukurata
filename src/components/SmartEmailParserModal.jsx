import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  parseBankEmailText,
  connectGmailOAuth,
  fetchBankEmailsFromGmail,
  getStoredGmailToken
} from '../services/emailParserService';
import { BankLogo } from './BankLogo';
import { autoAssignBucketAndWallet } from '../utils/smartCategorizer';
import { inferBucketKind } from '../utils/templates';
import { formatRupiah, formatTanggal } from '../utils/formatters';

export const SmartEmailParserModal = ({ isOpen, onClose }) => {
  const { categories, wallets, transactions, addTransaction } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState('gmail'); // 'gmail' | 'paste'
  const [daysWindow, setDaysWindow] = useState(30);
  const [gmailToken, setGmailToken] = useState(() => getStoredGmailToken());
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rowOverrides, setRowOverrides] = useState({}); // { [id]: { txType, bucketId, walletId, intentLabel } }
  const [scanStats, setScanStats] = useState(null);

  // Paste tab state
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [pasteTxType, setPasteTxType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const existingGmailIds = useMemo(() => {
    const ids = new Set();
    transactions.forEach((tx) => {
      const m = (tx.notes || '').match(/\[gmail:([^\]]+)\]/);
      if (m && m[1]) ids.add(m[1]);
    });
    return ids;
  }, [transactions]);

  if (!isOpen) return null;

  const getBucketsForType = (txType) => {
    const targetKind = txType === 'saving' ? 'saving' : 'spending';
    const filtered = categories.filter((c) => inferBucketKind(c) === targetKind);
    return filtered.length > 0 ? filtered : categories;
  };

  const runScan = async (tokenToUse) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGmail(true);
    try {
      const { receipts: found, stats } = await fetchBankEmailsFromGmail(tokenToUse, {
        days: daysWindow,
        existingGmailIds
      });
      setReceipts(found);
      setScanStats(stats);
      setSelectedIds(new Set(found.map((r) => r.id)));

      const defaults = {};
      found.forEach((r) => {
        const smart = autoAssignBucketAndWallet({
          merchant: r.parsed.recipientOrMerchant,
          rawText: `${r.subject || ''} ${r.parsed.rawText || ''}`,
          detectedWalletName: r.parsed.walletName,
          buckets: categories,
          wallets
        });
        const txType = r.parsed.type === 'income' ? 'income' : smart.suggestedTxType || 'expense';
        defaults[r.id] = {
          txType,
          bucketId: smart.bucketId,
          walletId: smart.walletId,
          intentLabel: smart.intentLabel,
          matchedKeyword: smart.matchedKeyword
        };
      });
      setRowOverrides(defaults);

      if (found.length === 0) {
        setSuccessMsg(
          `Scanned ${stats.scanned} email(s) — 0 new receipts (${stats.promosFiltered} promos/alerts filtered, ${stats.duplicatesSkipped} already imported).`
        );
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to scan Gmail.');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleConnectGmail = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGmail(true);
    try {
      const token = await connectGmailOAuth();
      setGmailToken(token);
      await runScan(token);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to connect Gmail.');
      setIsLoadingGmail(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRowTypeChange = (id, nextType) => {
    const pool = getBucketsForType(nextType);
    setRowOverrides((prev) => {
      const cur = prev[id] || {};
      const validBucket = pool.some((b) => b.id === cur.bucketId) ? cur.bucketId : (pool[0]?.id || '');
      return {
        ...prev,
        [id]: { ...cur, txType: nextType, bucketId: validBucket }
      };
    });
  };

  const importReceiptItem = async (item) => {
    const override = rowOverrides[item.id] || {};
    const txType = override.txType || item.parsed.type || 'expense';
    const bucket = categories.find((c) => c.id === override.bucketId) || categories[0];
    const wallet = wallets.find((w) => w.id === override.walletId) || wallets[0];

    await addTransaction({
      type: txType,
      amount: item.parsed.amount,
      bucketId: txType === 'income' ? null : (bucket?.id || null),
      bucketName: txType === 'income' ? 'Income' : (bucket?.name || 'General'),
      walletId: wallet?.id || null,
      walletName: wallet?.name || item.parsed.walletName || 'Bank',
      merchant: item.parsed.recipientOrMerchant,
      notes: `Gmail Receipt (${item.parsed.transactionType}) [gmail:${item.id}]`,
      transactionDate: item.parsed.transactionDate
    });
  };

  const handleImportSelected = async () => {
    const toImport = receipts.filter((r) => selectedIds.has(r.id));
    if (toImport.length === 0) return;

    setIsLoadingGmail(true);
    try {
      for (const item of toImport) {
        await importReceiptItem(item);
      }
      const importedSet = new Set(toImport.map((r) => r.id));
      setReceipts((prev) => prev.filter((r) => !importedSet.has(r.id)));
      setSelectedIds(new Set());
      setSuccessMsg(`Imported ${toImport.length} verified bank receipt(s) into Sakukurata!`);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleParsePaste = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!pasteText.trim()) return;

    const result = parseBankEmailText(pasteText);
    if (result && result.isReceipt) {
      const smart = autoAssignBucketAndWallet({
        merchant: result.recipientOrMerchant,
        rawText: pasteText,
        detectedWalletName: result.walletName,
        buckets: categories,
        wallets
      });
      const resolvedType = result.type === 'income' ? 'income' : smart.suggestedTxType || 'expense';
      setParsedData({ ...result, intentLabel: smart.intentLabel });
      setPasteTxType(resolvedType);
      setSelectedCategoryId(smart.bucketId);
      setSelectedWalletId(smart.walletId);
    } else {
      setParsedData(null);
      setErrorMsg(
        result?.rejectReason
          ? `Skipped: ${result.rejectReason}. Only genuine transaction receipts are imported.`
          : 'Could not detect a valid transaction receipt from this text.'
      );
    }
  };

  const handleConfirmPasteAdd = async () => {
    if (!parsedData || parsedData.amount <= 0) return;
    const matchedBucket = categories.find((c) => c.id === selectedCategoryId);
    const matchedWallet = wallets.find((w) => w.id === selectedWalletId);

    await addTransaction({
      type: pasteTxType,
      amount: parsedData.amount,
      bucketId: pasteTxType === 'income' ? null : (selectedCategoryId || null),
      bucketName: pasteTxType === 'income' ? 'Income' : (matchedBucket?.name || 'General'),
      walletId: selectedWalletId || null,
      walletName: matchedWallet?.name || parsedData.walletName || 'Bank',
      merchant: parsedData.recipientOrMerchant,
      notes: `Email Receipt (${parsedData.transactionType})`,
      transactionDate: parsedData.transactionDate
    });

    setSuccessMsg(`Saved ${parsedData.recipientOrMerchant} (${formatRupiah(parsedData.amount)})!`);
    setParsedData(null);
    setPasteText('');
  };

  const pasteBuckets = getBucketsForType(pasteTxType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="y-card w-full max-w-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold">Smart Bank Receipt Importer</h2>
              <p className="text-[11px] text-muted">
                Filters out promos & OTPs — classifies Expenses vs. Savings/Investments automatically.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
          <button
            onClick={() => setActiveSubTab('gmail')}
            className={`py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'gmail' ? 'y-btn-accent' : 'text-muted hover:text-primary'
            }`}
          >
            Connect Gmail (Auto-Filter)
          </button>
          <button
            onClick={() => setActiveSubTab('paste')}
            className={`py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'paste' ? 'y-btn-accent' : 'text-muted hover:text-primary'
            }`}
          >
            Paste Receipt Text
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {activeSubTab === 'gmail' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={daysWindow}
                  onChange={(e) => setDaysWindow(Number(e.target.value))}
                  className="y-input px-2.5 py-2 text-xs font-semibold"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>

                <button
                  onClick={handleConnectGmail}
                  disabled={isLoadingGmail}
                  className="flex-1 py-2 px-3 rounded-lg y-btn-accent text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {isLoadingGmail ? 'Scanning...' : gmailToken ? 'Reconnect Gmail' : 'Connect Gmail'}
                </button>

                {gmailToken && (
                  <button
                    onClick={() => runScan(gmailToken)}
                    disabled={isLoadingGmail}
                    className="py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGmail ? 'animate-spin' : ''}`} />
                    Rescan
                  </button>
                )}
              </div>

              {scanStats && (
                <div
                  className="px-3 py-2 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <span className="flex items-center gap-1.5 text-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    Scanned <strong className="text-primary">{scanStats.scanned}</strong> emails →{' '}
                    <strong className="text-accent">{scanStats.receiptsFound}</strong> receipts •{' '}
                    <strong>{scanStats.promosFiltered}</strong> promos/alerts blocked •{' '}
                    <strong>{scanStats.duplicatesSkipped}</strong> duplicates skipped
                  </span>
                </div>
              )}

              {receipts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted">
                      {selectedIds.size} of {receipts.length} selected
                    </span>
                    <button
                      onClick={handleImportSelected}
                      disabled={selectedIds.size === 0 || isLoadingGmail}
                      className="px-3 py-1.5 rounded-md y-btn-accent text-xs disabled:opacity-40"
                    >
                      Import Selected ({selectedIds.size})
                    </button>
                  </div>

                  {receipts.map((item) => {
                    const checked = selectedIds.has(item.id);
                    const override = rowOverrides[item.id] || {};
                    const txType = override.txType || item.parsed.type || 'expense';
                    const isIncome = txType === 'income';
                    const isSaving = txType === 'saving';
                    const bucketPool = getBucketsForType(txType);

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg space-y-2 transition-all"
                        style={{
                          background: 'var(--bg-2)',
                          border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--border)'}`
                        }}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleSelect(item.id)}
                              className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                                checked ? 'y-btn-accent' : ''
                              }`}
                              style={!checked ? { border: '1px solid var(--border-strong)' } : undefined}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <BankLogo
                              institutionId={item.parsed.institutionId}
                              name={item.parsed.walletName}
                              size={32}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold truncate">{item.parsed.recipientOrMerchant}</p>
                                {override.intentLabel && (
                                  <span className="y-pill-accent text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                    {override.intentLabel}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted truncate">
                                {item.parsed.walletName} • {item.parsed.transactionType} •{' '}
                                {formatTanggal(item.parsed.transactionDate)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span
                              className={`text-xs font-extrabold block ${
                                isIncome ? 'text-emerald-400' : isSaving ? 'text-sky-400' : 'text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : isSaving ? '↗ ' : '-'}
                              {formatRupiah(item.parsed.amount)}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-dim">
                              {isIncome ? 'Income' : isSaving ? 'Save / Invest' : 'Expense'}
                            </span>
                          </div>
                        </div>

                        {/* Type, Bucket & Wallet Selectors */}
                        <div className="grid grid-cols-3 gap-2 pl-6">
                          <select
                            value={txType}
                            onChange={(e) => handleRowTypeChange(item.id, e.target.value)}
                            className="y-input px-2 py-1 text-[11px] font-semibold"
                          >
                            <option value="expense">Expense</option>
                            <option value="saving">Save / Invest</option>
                            <option value="income">Income</option>
                          </select>

                          {!isIncome && (
                            <select
                              value={override.bucketId || ''}
                              onChange={(e) =>
                                setRowOverrides((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], bucketId: e.target.value }
                                }))
                              }
                              className="y-input px-2 py-1 text-[11px]"
                            >
                              {bucketPool.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          )}

                          <select
                            value={override.walletId || ''}
                            onChange={(e) =>
                              setRowOverrides((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], walletId: e.target.value }
                              }))
                            }
                            className={`y-input px-2 py-1 text-[11px] ${isIncome ? 'col-span-2' : ''}`}
                          >
                            {wallets.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder="Paste bank receipt email text (myBCA, Livin' Mandiri, BRImo, BNI, Jago, SeaBank, GoPay, OVO, DANA, Bibit, QRIS)..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full y-input p-3 text-xs resize-none"
              />
              <button
                onClick={handleParsePaste}
                className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Verify & Parse Receipt
              </button>

              {parsedData && (
                <div
                  className="p-3.5 rounded-lg space-y-2.5"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BankLogo institutionId={parsedData.institutionId} name={parsedData.walletName} size={32} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{parsedData.recipientOrMerchant}</p>
                        <p className="text-[10px] text-muted">
                          {parsedData.walletName} • {parsedData.transactionType}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-accent">{formatRupiah(parsedData.amount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={pasteTxType}
                      onChange={(e) => {
                        const next = e.target.value;
                        setPasteTxType(next);
                        const pool = getBucketsForType(next);
                        if (pool[0]) setSelectedCategoryId(pool[0].id);
                      }}
                      className="y-input px-2 py-1.5 text-xs font-semibold"
                    >
                      <option value="expense">Expense</option>
                      <option value="saving">Save / Invest</option>
                      <option value="income">Income</option>
                    </select>
                    {pasteTxType !== 'income' && (
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="y-input px-2 py-1.5 text-xs"
                      >
                        {pasteBuckets.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className={`y-input px-2 py-1.5 text-xs ${pasteTxType === 'income' ? 'col-span-2' : ''}`}
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleConfirmPasteAdd} className="w-full py-2 rounded-lg y-btn-accent text-xs">
                    Save Transaction
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
