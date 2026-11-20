import React, { useState } from 'react';
import {
  Mail,
  Cloud,
  HardDrive,
  Sparkles,
  Sliders,
  LogOut,
  User,
  Check,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  EyeOff,
  Eye,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { usePrivacy } from '../context/PrivacyContext';

export const SettingsScreen = ({ onOpenEmailParser }) => {
  const { user, isGuest, logout } = useAuth();
  const { profile, isCloudMode, isOnline, updateProfile, resetGuestData } = useFinance();
  const { themeMode, setThemeMode, accentColor, setAccentColor, accentPresets } = useTheme();
  const {
    hideAll,
    toggleHideAll,
    hiddenScopes,
    toggleScope,
    hiddenKpiCards,
    toggleKpiCard,
    resetPrivacy
  } = usePrivacy();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'privacy' | 'general' | 'import'
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [paydayDate, setPaydayDate] = useState(String(profile?.paydayDate || 25));
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      displayName: displayName.trim() || 'User',
      paydayDate: Math.min(31, Math.max(1, Number(paydayDate) || 25))
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Hide', icon: Shield },
    { id: 'general', label: 'Account & Profile', icon: Sliders },
    { id: 'import', label: 'Gmail & Import', icon: Mail }
  ];

  const scopeControls = [
    { key: 'wallets', label: 'All-Time Wallet Balances', desc: 'Mask total & per-account wallet balances' },
    { key: 'remainingBudget', label: 'Monthly Remaining Budget', desc: 'Mask spendable budget left this cycle' },
    { key: 'income', label: 'Monthly Income & Base Salary', desc: 'Mask salary & extra income figures' },
    { key: 'spending', label: 'Total Spending & 7D Trend', desc: 'Mask expense totals & quick shortcut amounts' },
    { key: 'savings', label: 'Savings & Investments', desc: 'Mask saved/invested amounts & savings goals' },
    { key: 'transactions', label: 'Transaction Amounts', desc: 'Mask amounts inside transaction history' }
  ];

  const cardVisibilityControls = [
    { key: 'income', label: 'Hide "Monthly Income" Card on Overview' },
    { key: 'spending', label: 'Hide "Total Spending" Card on Overview' },
    { key: 'savings', label: 'Hide "Saved & Invested" Card on Overview' },
    { key: 'remaining', label: 'Hide "Remaining Budget" Card on Overview' },
    { key: 'walletsBanner', label: 'Hide "All-Time Wallet Balance" Total on Wallets Tab' }
  ];

  return (
    <div className="y-card p-5 space-y-5">
      {/* Horizontal Settings Sub-Tabs */}
      <div className="flex items-center gap-1.5 pb-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                active ? 'y-pill-accent' : 'text-muted hover:text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold block">Theme Mode</label>
            <div className="grid grid-cols-2 gap-2.5 max-w-xs">
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  themeMode === 'dark' ? 'y-pill-accent' : 'text-muted hover:text-primary'
                }`}
                style={themeMode !== 'dark' ? { background: 'var(--bg-2)', border: '1px solid var(--border)' } : undefined}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  themeMode === 'light' ? 'y-pill-accent' : 'text-muted hover:text-primary'
                }`}
                style={themeMode !== 'light' ? { background: 'var(--bg-2)', border: '1px solid var(--border)' } : undefined}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold">Accent Color Palette</label>
              <span className="text-[11px] font-mono text-muted uppercase">{accentColor}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {accentPresets.map((preset) => {
                const selected = accentColor.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAccentColor(preset.color)}
                    className="px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all"
                    style={{
                      background: selected ? 'rgba(var(--color-accent-rgb), 0.14)' : 'var(--bg-2)',
                      border: `1px solid ${selected ? preset.color : 'var(--border)'}`
                    }}
                  >
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: preset.color }} />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="p-3 rounded-lg flex items-center justify-between gap-3"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-xs font-semibold">Custom Accent Color</p>
                <p className="text-[11px] text-muted">Pick any hex color to personalize your workspace.</p>
              </div>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-9 h-8 rounded-md border-0 cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVACY & HIDE CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="space-y-5">
          {/* Master Toggle */}
          <div
            className="p-3.5 rounded-lg flex items-center justify-between gap-3"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg y-pill-accent flex items-center justify-center">
                {hideAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold">Master Privacy Mode</p>
                <p className="text-[11px] text-muted">Mask all monetary values across the workspace (Rp ••••••).</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHideAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                hideAll ? 'y-btn-accent' : 'text-muted hover:text-primary'
              }`}
              style={!hideAll ? { background: 'var(--bg-card)', border: '1px solid var(--border)' } : undefined}
            >
              {hideAll ? 'Hidden' : 'Visible'}
            </button>
          </div>

          {/* Granular Number Masking */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Mask Specific Numbers (Rp ••••••)
            </span>
            <div className="space-y-1.5">
              {scopeControls.map((item) => {
                const masked = Boolean(hiddenScopes[item.key]);
                return (
                  <div
                    key={item.key}
                    className="px-3 py-2.5 rounded-lg flex items-center justify-between gap-3"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleScope(item.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 flex-shrink-0 ${
                        masked ? 'y-pill-accent' : 'text-muted'
                      }`}
                      style={!masked ? { background: 'var(--bg-card)', border: '1px solid var(--border)' } : undefined}
                    >
                      {masked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {masked ? 'Hidden' : 'Visible'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hide Entire Cards Completely */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Hide Entire Cards from Dashboard
            </span>
            <div className="space-y-1.5">
              {cardVisibilityControls.map((c) => {
                const hidden = Boolean(hiddenKpiCards[c.key]);
                return (
                  <div
                    key={c.key}
                    className="px-3 py-2 rounded-lg flex items-center justify-between gap-3"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-xs font-semibold">{c.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleKpiCard(c.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        hidden ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-muted'
                      }`}
                      style={!hidden ? { background: 'var(--bg-card)', border: '1px solid var(--border)' } : undefined}
                    >
                      {hidden ? 'Card Hidden' : 'Shown'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={resetPrivacy}
            className="text-xs font-semibold text-muted hover:text-primary flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset all privacy & visibility defaults
          </button>
        </div>
      )}

      {/* TAB 3: ACCOUNT & PROFILE */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div
            className="p-3.5 rounded-lg flex items-center justify-between gap-3"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center flex-shrink-0">
                {isCloudMode ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {isCloudMode ? user?.email || 'Firebase Cloud' : 'Local Guest Mode'}
                </p>
                <p className="text-[11px] text-muted">
                  {isCloudMode
                    ? isOnline
                      ? 'Real-time sync active across Web & Android'
                      : 'Offline — changes cached locally until reconnected'
                    : 'Stored in this browser. Sign in to enable cloud sync.'}
                </p>
              </div>
            </div>
            <span className="y-pill-accent text-[10px] font-bold px-2 py-0.5 rounded-md">
              {isCloudMode ? 'Firebase' : 'Local'}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted block mb-1">Display Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full y-input pl-8 pr-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">Payday (1–31)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={paydayDate}
                  onChange={(e) => setPaydayDate(e.target.value)}
                  className="w-full y-input px-3 py-2 text-xs text-center"
                />
              </div>
            </div>

            <button type="submit" className="px-4 py-2 rounded-lg y-btn-accent text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            {isGuest && (
              <button
                type="button"
                onClick={resetGuestData}
                className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/20 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Onboarding
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> {isGuest ? 'Exit Local Mode' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: GMAIL & EMAIL IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-3">
          <div
            className="p-4 rounded-lg space-y-3"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg y-pill-accent flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Connect Gmail & Bank Receipt Parser</h4>
                <p className="text-[11px] text-muted">
                  Scan myBCA, Mandiri, BRI, BNI, GoPay, OVO, Bibit & QRIS notifications directly via Google OAuth.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenEmailParser}
              className="px-4 py-2 rounded-lg y-btn-accent text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Gmail & Receipt Importer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
