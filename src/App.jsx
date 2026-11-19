import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HomeEconomicOverview } from './components/HomeEconomicOverview';
import { SummaryStats } from './components/SummaryStats';
import { SalaryAllocationCard } from './components/SalaryAllocationCard';
import { BudgetProgressCards } from './components/BudgetProgressCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { MultiWalletCard } from './components/MultiWalletCard';
import { SavingsGoalsCard } from './components/SavingsGoalsCard';
import { RecurringBillsCard } from './components/RecurringBillsCard';
import { SettingsScreen } from './components/SettingsScreen';
import { SmartEmailParserModal } from './components/SmartEmailParserModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { formatRupiah } from './utils/formatters';
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  SlidersHorizontal,
  Settings,
  Plus,
  Mail,
  Sun,
  Moon,
  Cloud,
  HardDrive,
  Wallet,
  Loader2,
  TrendingUp,
  TrendingDown,
  PiggyBank
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'wallets', label: 'Wallets', icon: CreditCard },
  { id: 'allocation', label: 'Budget', icon: SlidersHorizontal },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function WorkspaceShell() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    profile,
    onboardingCompleted,
    dataLoading,
    isCloudMode,
    isOnline,
    totalIncome,
    totalExpenses,
    overallRemainingCash,
    wallets
  } = useFinance();
  const { themeMode, toggleThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState('home');
  const [isEmailParserOpen, setIsEmailParserOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [initialCategoryId, setInitialCategoryId] = useState('');

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-2.5 text-muted">
          <Loader2 className="w-7 h-7 text-accent animate-spin" />
          <span className="text-xs font-semibold">Loading Sakukurata...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthScreen />;
  if (!onboardingCompleted) return <OnboardingWizard />;

  const totalWalletBalance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);

  const handleOpenAddForCategory = (catId) => {
    setInitialCategoryId(catId);
    setIsAddTransactionOpen(true);
  };

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Yukinon-style Slim Left Rail Sidebar (Desktop) */}
      <aside
        className="hidden md:flex flex-col items-center justify-between py-3 px-2 flex-shrink-0 select-none"
        style={{
          width: 72,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border)'
        }}
      >
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl y-btn-accent flex items-center justify-center shadow-sm"
            title="Sakukurata"
          >
            <Wallet className="w-5 h-5" />
          </button>

          <div className="w-6 h-px" style={{ background: 'var(--border)' }} />

          {/* Nav Buttons */}
          <nav className="flex flex-col items-center gap-1.5 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`relative w-12 py-2 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                    active ? 'y-pill-accent' : 'text-muted hover:text-primary hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Theme Toggle */}
        <button
          onClick={toggleThemeMode}
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-primary transition-colors"
          style={{ border: '1px solid var(--border)' }}
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Desktop Top Header */}
        <header
          className="h-14 px-4 md:px-6 flex items-center justify-between gap-3 flex-shrink-0"
          style={{
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden w-8 h-8 rounded-lg y-btn-accent flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight truncate">{activeNav.label}</h1>
                <span className="hidden sm:inline text-[11px] text-muted">
                  • Welcome back, <strong className="text-primary">{profile?.displayName || 'User'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Status Pill */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
            >
              {isCloudMode ? (
                <Cloud className="w-3.5 h-3.5 text-accent" />
              ) : (
                <HardDrive className="w-3.5 h-3.5 text-muted" />
              )}
              <span className="text-muted">
                {isCloudMode ? (isOnline ? 'Cloud Sync' : 'Offline') : 'Local Mode'}
              </span>
            </div>

            {/* Import Email Button */}
            <button
              onClick={() => setIsEmailParserOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-primary hover:opacity-90 transition-all"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
              title="Import Bank Receipts / Connect Gmail"
            >
              <Mail className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Import Gmail</span>
            </button>

            {/* Quick Add Transaction */}
            <button
              onClick={() => {
                setInitialCategoryId('');
                setIsAddTransactionOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs y-btn-accent flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Entry</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* OVERVIEW: Compact Desktop Bento Dashboard */}
            {activeTab === 'home' && (
              <>
                {/* 4-Card KPI Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiTile
                    label="Monthly Income"
                    value={formatRupiah(totalIncome)}
                    icon={<TrendingUp className="w-4 h-4 text-accent" />}
                  />
                  <KpiTile
                    label="Total Spending"
                    value={formatRupiah(totalExpenses)}
                    icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
                  />
                  <KpiTile
                    label="Remaining Cash"
                    value={formatRupiah(overallRemainingCash)}
                    icon={<PiggyBank className="w-4 h-4 text-accent" />}
                    highlight
                  />
                  <KpiTile
                    label={`All Wallets (${wallets.length})`}
                    value={formatRupiah(totalWalletBalance)}
                    icon={<CreditCard className="w-4 h-4 text-blue-400" />}
                  />
                </div>

                {/* 2-Column Main Desktop Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <HomeEconomicOverview
                      onOpenAddTransaction={() => {
                        setInitialCategoryId('');
                        setIsAddTransactionOpen(true);
                      }}
                    />
                  </div>
                  <div className="lg:col-span-7 space-y-4">
                    <SummaryStats onViewAll={() => setActiveTab('settings')} compact />
                    <TransactionList maxItems={6} onViewAll={() => setActiveTab('settings')} />
                  </div>
                </div>
              </>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <SummaryStats onViewAll={() => setActiveTab('settings')} />
                  <AnalyticsCharts />
                </div>
                <div className="lg:col-span-5">
                  <BudgetProgressCards onOpenAddTransactionForCategory={handleOpenAddForCategory} />
                </div>
              </div>
            )}

            {/* WALLETS & GOALS */}
            {activeTab === 'wallets' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-5">
                  <MultiWalletCard
                    onOpenAddTransaction={() => {
                      setInitialCategoryId('');
                      setIsAddTransactionOpen(true);
                    }}
                  />
                </div>
                <div className="lg:col-span-7 space-y-4">
                  <SavingsGoalsCard />
                  <RecurringBillsCard />
                </div>
              </div>
            )}

            {/* BUDGET ALLOCATION */}
            {activeTab === 'allocation' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <SalaryAllocationCard />
                </div>
                <div className="lg:col-span-5">
                  <BudgetProgressCards onOpenAddTransactionForCategory={handleOpenAddForCategory} />
                </div>
              </div>
            )}

            {/* SETTINGS & FULL HISTORY */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <SettingsScreen onOpenEmailParser={() => setIsEmailParserOpen(true)} />
                </div>
                <div className="lg:col-span-5">
                  <TransactionList />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav (< md only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 px-2 flex items-center justify-around"
        style={{
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border)'
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg flex flex-col items-center gap-0.5 ${
                active ? 'y-pill-accent' : 'text-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <SmartEmailParserModal
        isOpen={isEmailParserOpen}
        onClose={() => setIsEmailParserOpen(false)}
      />

      <TransactionFormModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        initialCategoryId={initialCategoryId}
      />
    </div>
  );
}

function KpiTile({ label, value, icon, highlight = false }) {
  return (
    <div className="y-card p-3.5 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[11px] font-medium text-muted block truncate">{label}</span>
        <span className={`text-base font-extrabold tracking-tight block mt-0.5 truncate ${highlight ? 'text-accent' : 'text-primary'}`}>
          {value}
        </span>
      </div>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      >
        {icon}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <WorkspaceShell />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
