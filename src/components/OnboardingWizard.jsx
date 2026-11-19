import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Wallet, Sliders, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import {
  BUDGET_TEMPLATES,
  STARTER_WALLET_SUGGESTIONS,
  STARTER_QUICK_ACTIONS
} from '../utils/templates';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const { completeOnboarding } = useFinance();

  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [saving, setSaving] = useState(false);

  // Step 1: Profile & Income
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [salaryDisplay, setSalaryDisplay] = useState('5.000.000');
  const [paydayDate, setPaydayDate] = useState(25);

  // Step 2: Budget Style
  const [selectedTemplateId, setSelectedTemplateId] = useState('balanced');

  // Step 3: Wallets
  const [selectedWallets, setSelectedWallets] = useState([
    { name: 'Bank BCA', type: 'bank', color: '#005caa', balance: 0 },
    { name: 'Dompet Tunai', type: 'cash', color: '#10b981', balance: 0 }
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
      setSelectedWallets((prev) => [
        ...prev,
        { name: trimmed, type: 'bank', color: '#8b5cf6', balance: 0 }
      ]);
    }
    setCustomWalletName('');
  };

  const handleWalletBalanceChange = (name, rawVal) => {
    const num = parseRupiahInput(rawVal);
    setSelectedWallets((prev) =>
      prev.map((w) => (w.name === name ? { ...w, balance: num } : w))
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const template = BUDGET_TEMPLATES.find((t) => t.id === selectedTemplateId) || BUDGET_TEMPLATES[0];
      await completeOnboarding({
        displayName: displayName.trim() || 'Pengguna',
        baseSalary: parseRupiahInput(salaryDisplay),
        paydayDate: Number(paydayDate) || 25,
        buckets: template.buckets,
        wallets: selectedWallets.length > 0 ? selectedWallets : [{ name: 'Dompet Utama', type: 'cash', color: '#10b981', balance: 0 }],
        quickActions: STARTER_QUICK_ACTIONS
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mobile-app-frame mx-auto relative flex flex-col justify-between p-6 overflow-y-auto">
      {/* Progress Header */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
            Langkah {step} dari 3
          </span>
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            Lewati & Masuk
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-emerald-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 py-6 space-y-5 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Kenalan dulu yuk!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Semua angka ini fleksibel—bisa kamu ubah kapan saja di dalam aplikasi.
              </p>
            </div>

            <div className="modern-glass-card rounded-3xl p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Nama Panggilan</label>
                <input
                  type="text"
                  placeholder="misal: Rahman"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Estimasi Pemasukan / Gaji Bulanan (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-extrabold text-emerald-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="5.000.000"
                    value={salaryDisplay}
                    onChange={(e) => setSalaryDisplay(formatThousands(e.target.value))}
                    className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-base font-black text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Tanggal Gajian / Reset Siklus (1–31)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={paydayDate}
                  onChange={(e) => setPaydayDate(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Pilih Gaya Alokasi</h2>
              <p className="text-xs text-slate-400 mt-1">
                Pilih template awal biar cepat, lalu kamu bebas tambah, hapus, atau ubah persennya kapan pun.
              </p>
            </div>

            <div className="space-y-3">
              {BUDGET_TEMPLATES.map((tpl) => {
                const active = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-4 rounded-3xl border transition-all space-y-2.5 ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#16191f] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{tpl.name}</span>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{tpl.subtitle}</p>
                    <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800">
                      {tpl.buckets.map((b, i) => (
                        <div
                          key={i}
                          style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
                          className="h-full"
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {tpl.buckets.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/30 text-slate-300"
                        >
                          {b.name} {b.percentage}%
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Pilih Dompet & Rekening</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tap rekening/e-wallet yang kamu pakai, lalu isi saldo awal jika mau.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {STARTER_WALLET_SUGGESTIONS.map((w) => {
                const selected = selectedWallets.some((sw) => sw.name === w.name);
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => toggleWalletSuggestion(w)}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        : 'bg-[#16191f] border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                    {w.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Wallet Quick Add */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah bank / e-wallet lain..."
                value={customWalletName}
                onChange={(e) => setCustomWalletName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomWallet())}
                className="flex-1 bg-[#0d1117] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleAddCustomWallet}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            {/* Selected Wallets Optional Starting Balance */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Saldo Awal (Opsional)
              </span>
              {selectedWallets.map((w) => (
                <div
                  key={w.name}
                  className="bg-[#16191f] border border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: w.color }} />
                    <span className="text-xs font-bold text-white truncate">{w.name}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0d1117] border border-white/10 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={w.balance ? new Intl.NumberFormat('id-ID').format(w.balance) : ''}
                      onChange={(e) => handleWalletBalanceChange(w.name, e.target.value)}
                      className="w-24 bg-transparent text-right text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 pb-2 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Lanjut <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {saving ? 'Menyiapkan Ruangmu...' : 'Mulai Gunakan Sakukurata'}
          </button>
        )}
      </div>
    </div>
  );
};
