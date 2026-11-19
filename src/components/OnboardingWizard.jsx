import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Wallet, Sliders, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import {
  BUDGET_TEMPLATES,
  STARTER_WALLET_SUGGESTIONS,
  STARTER_QUICK_ACTIONS
} from '../utils/templates';
import { parseRupiahInput } from '../utils/formatters';

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const { completeOnboarding } = useFinance();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [salaryDisplay, setSalaryDisplay] = useState('5.000.000');
  const [paydayDate, setPaydayDate] = useState(25);
  const [selectedTemplateId, setSelectedTemplateId] = useState('balanced');
  const [selectedWallets, setSelectedWallets] = useState([
    { name: 'Bank BCA', type: 'bank', color: '#005caa', balance: 0 },
    { name: 'Cash Wallet', type: 'cash', color: '#34d399', balance: 0 }
  ]);
  const [customWalletName, setCustomWalletName] = useState('');

  const formatThousands = (raw) => {
    const num = parseRupiahInput(raw);
    return num > 0 ? new Intl.NumberFormat('id-ID').format(num) : '';
  };

  const toggleWalletSuggestion = (suggestion) => {
    const exists = selectedWallets.some((w) => w.name === suggestion.name);
    if (exists) {
      if (selectedWallets.length <= 1) return;
      setSelectedWallets((prev) => prev.filter((w) => w.name !== suggestion.name));
    } else {
      setSelectedWallets((prev) => [...prev, { ...suggestion, balance: 0 }]);
    }
  };

  const handleAddCustomWallet = () => {
    const trimmed = customWalletName.trim();
    if (!trimmed) return;
    if (!selectedWallets.some((w) => w.name.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedWallets((prev) => [...prev, { name: trimmed, type: 'bank', color: '#818cf8', balance: 0 }]);
    }
    setCustomWalletName('');
  };

  const handleWalletBalanceChange = (name, rawVal) => {
    const num = parseRupiahInput(rawVal);
    setSelectedWallets((prev) => prev.map((w) => (w.name === name ? { ...w, balance: num } : w)));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const template = BUDGET_TEMPLATES.find((t) => t.id === selectedTemplateId) || BUDGET_TEMPLATES[0];
      await completeOnboarding({
        displayName: displayName.trim() || 'User',
        baseSalary: parseRupiahInput(salaryDisplay),
        paydayDate: Number(paydayDate) || 25,
        buckets: template.buckets,
        wallets: selectedWallets.length > 0 ? selectedWallets : [{ name: 'Main Wallet', type: 'cash', color: '#34d399', balance: 0 }],
        quickActions: STARTER_QUICK_ACTIONS
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="w-full max-w-xl y-card p-6 space-y-5">
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              Step {step} of 3
            </span>
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="text-xs font-semibold text-muted hover:text-primary"
            >
              Skip setup
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all"
                style={{ background: s <= step ? 'var(--color-accent)' : 'var(--bg-3)' }}
              />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Quick Profile Setup</h2>
                <p className="text-xs text-muted">Everything here is flexible and can be edited anytime.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full y-input px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted block mb-1">
                    Estimated Monthly Income (IDR, Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-accent">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="5.000.000"
                      value={salaryDisplay}
                      onChange={(e) => setSalaryDisplay(formatThousands(e.target.value))}
                      className="w-full y-input pl-9 pr-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Payday (1–31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={paydayDate}
                    onChange={(e) => setPaydayDate(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full y-input px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Choose a Starting Budget Style</h2>
                <p className="text-xs text-muted">Pick a preset or start blank—rename, add, or rebalance anytime.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUDGET_TEMPLATES.map((tpl) => {
                const active = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className="text-left p-3.5 rounded-xl transition-all space-y-2"
                    style={{
                      background: active ? 'rgba(var(--color-accent-rgb), 0.1)' : 'var(--bg-2)',
                      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--border)'}`
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-primary">{tpl.name}</span>
                      {active && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted">{tpl.subtitle}</p>
                    <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: 'var(--bg-3)' }}>
                      {tpl.buckets.map((b, i) => (
                        <div key={i} style={{ width: `${b.percentage}%`, backgroundColor: b.color }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Select Your Wallets</h2>
                <p className="text-xs text-muted">Choose the banks, e-wallets, or cash accounts you actively use.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STARTER_WALLET_SUGGESTIONS.map((w) => {
                const selected = selectedWallets.some((sw) => sw.name === w.name);
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => toggleWalletSuggestion(w)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                    style={{
                      background: selected ? 'rgba(var(--color-accent-rgb), 0.14)' : 'var(--bg-2)',
                      border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--border)'}`,
                      color: selected ? 'var(--color-accent)' : 'var(--text)'
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                    {w.name}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another bank or e-wallet..."
                value={customWalletName}
                onChange={(e) => setCustomWalletName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomWallet())}
                className="flex-1 y-input px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomWallet}
                className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {selectedWallets.map((w) => (
                <div
                  key={w.name}
                  className="px-3 py-2 rounded-lg flex items-center justify-between gap-3"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <span className="text-xs font-semibold truncate">{w.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={w.balance ? new Intl.NumberFormat('id-ID').format(w.balance) : ''}
                      onChange={(e) => handleWalletBalanceChange(w.name, e.target.value)}
                      className="w-24 y-input px-2 py-1 text-right text-xs font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-muted hover:text-primary"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-2.5 rounded-lg y-btn-accent text-xs flex items-center justify-center gap-1.5"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg y-btn-accent text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {saving ? 'Setting up workspace...' : 'Launch Sakukurata'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
