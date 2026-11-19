import React, { useState } from 'react';
import { X, Mail, Sparkles, CheckCircle2, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  parseBankEmailText,
  connectGmailOAuth,
  fetchBankEmailsFromGmail,
  getStoredGmailToken
} from '../services/emailParserService';
import { formatRupiah } from '../utils/formatters';

export const SmartEmailParserModal = ({ isOpen, onClose }) => {
  const { categories, wallets, addTransaction } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState('gmail'); // 'gmail' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const [gmailToken, setGmailToken] = useState(() => getStoredGmailToken());
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [gmailMessages, setGmailMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleParseText = (textToParse) => {
    setErrorMsg('');
    const raw = textToParse || pasteText;
    if (!raw.trim()) return;

    const result = parseBankEmailText(raw);
    if (result && result.isParsedSuccess) {
      setParsedData(result);
      setSelectedCategoryId(categories[0]?.id || '');
      const matchedWallet = wallets.find((w) =>
        w.name.toLowerCase().includes((result.walletName || '').toLowerCase())
      );
      setSelectedWalletId(matchedWallet ? matchedWallet.id : wallets[0]?.id || '');
    } else {
      setParsedData(null);
      setErrorMsg('Could not detect a valid transaction amount from this email text.');
    }
  };

  const handleConnectGmail = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGmail(true);
    try {
      const token = await connectGmailOAuth();
      setGmailToken(token);
      const msgs = await fetchBankEmailsFromGmail(token);
      setGmailMessages(msgs);
      setSuccessMsg(
        msgs.length > 0
          ? `Connected! Found ${msgs.length} bank receipt(s) in your inbox.`
          : 'Connected to Gmail, but no recent bank receipt emails were detected.'
      );
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to connect Gmail.');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleScanGmail = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGmail(true);
    try {
      const msgs = await fetchBankEmailsFromGmail(gmailToken);
      setGmailMessages(msgs);
      if (msgs.length === 0) {
        setSuccessMsg('Inbox scanned — no matching bank receipts found.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to scan Gmail inbox.');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleQuickImportGmailItem = async (item) => {
    const bucket = categories[0];
    const wallet =
      wallets.find((w) => w.name.toLowerCase().includes((item.parsed.walletName || '').toLowerCase())) ||
      wallets[0];

    await addTransaction({
      type: 'expense',
      amount: item.parsed.amount,
      bucketId: bucket?.id || null,
      bucketName: bucket?.name || 'General',
      walletId: wallet?.id || null,
      walletName: wallet?.name || item.parsed.walletName || 'Bank',
      merchant: item.parsed.recipientOrMerchant,
      notes: `Imported from Gmail (${item.parsed.transactionType})`,
      transactionDate: item.parsed.transactionDate
    });

    setGmailMessages((prev) => prev.filter((m) => m.id !== item.id));
    setSuccessMsg(`Imported "${item.parsed.recipientOrMerchant}" (${formatRupiah(item.parsed.amount)})!`);
  };

  const handleConfirmPasteAdd = async () => {
    if (!parsedData || parsedData.amount <= 0) return;
    const matchedBucket = categories.find((c) => c.id === selectedCategoryId);
    const matchedWallet = wallets.find((w) => w.id === selectedWalletId);

    await addTransaction({
      type: 'expense',
      amount: parsedData.amount,
      bucketId: selectedCategoryId || null,
      bucketName: matchedBucket ? matchedBucket.name : 'General',
      walletId: selectedWalletId || null,
      walletName: matchedWallet ? matchedWallet.name : 'Bank',
      merchant: parsedData.recipientOrMerchant,
      notes: `Email Receipt (${parsedData.transactionType})`,
      transactionDate: parsedData.transactionDate
    });

    setSuccessMsg(`Saved ${parsedData.recipientOrMerchant} (${formatRupiah(parsedData.amount)})!`);
    setParsedData(null);
    setPasteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="y-card w-full max-w-lg p-5 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg y-pill-accent flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold">Bank Receipt & Gmail Importer</h2>
              <p className="text-[11px] text-muted">
                Read bank notifications directly via Google OAuth or paste receipt text.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
          <button
            onClick={() => setActiveSubTab('gmail')}
            className={`py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'gmail' ? 'y-btn-accent' : 'text-muted hover:text-primary'
            }`}
          >
            Connect Gmail (Live)
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConnectGmail}
                  disabled={isLoadingGmail}
                  className="flex-1 py-2.5 px-3 rounded-lg y-btn-accent text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {isLoadingGmail ? 'Connecting...' : gmailToken ? 'Reconnect Gmail' : 'Connect Gmail'}
                </button>
                {gmailToken && (
                  <button
                    onClick={handleScanGmail}
                    disabled={isLoadingGmail}
                    className="py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-primary"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGmail ? 'animate-spin' : ''}`} />
                    Scan Inbox
                  </button>
                )}
              </div>

              {gmailMessages.length > 0 && (
                <div className="space-y-2">
                  {gmailMessages.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg flex items-center justify-between gap-3"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{item.parsed.recipientOrMerchant}</p>
                        <p className="text-[11px] text-muted truncate">
                          {item.parsed.walletName} • {formatRupiah(item.parsed.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickImportGmailItem(item)}
                        className="px-3 py-1.5 rounded-md y-btn-accent text-[11px] flex-shrink-0"
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder="Paste bank email notification text (myBCA, Mandiri, GoPay, OVO, BRI, BNI, QRIS)..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full y-input p-3 text-xs resize-none"
              />
              <button
                onClick={() => handleParseText()}
                className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Parse Email Text
              </button>

              {parsedData && (
                <div
                  className="p-3.5 rounded-lg space-y-2.5"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{parsedData.recipientOrMerchant}</span>
                    <span className="text-sm font-extrabold text-accent">{formatRupiah(parsedData.amount)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="y-input px-2.5 py-1.5 text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="y-input px-2.5 py-1.5 text-xs"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleConfirmPasteAdd}
                    className="w-full py-2 rounded-lg y-btn-accent text-xs"
                  >
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
