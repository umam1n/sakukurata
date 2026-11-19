import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Navbar } from './components/Navbar';
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
import { PieChart, BarChart3, CreditCard, SlidersHorizontal, Settings, Loader2 } from 'lucide-react';

function DashboardContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { onboardingCompleted, dataLoading } = useFinance();

  const [activeTab, setActiveTab] = useState('home');
  const [isEmailParserOpen, setIsEmailParserOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [initialCategoryId, setInitialCategoryId] = useState('');

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="mobile-app-frame mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs font-bold tracking-wide">Memuat Sakukurata...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!onboardingCompleted) {
    return <OnboardingWizard />;
  }

  const handleOpenAddForCategory = (catId) => {
    setInitialCategoryId(catId);
    setIsAddTransactionOpen(true);
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'wallets', label: 'Dompet', icon: CreditCard },
    { id: 'allocation', label: 'Alokasi', icon: SlidersHorizontal },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="mobile-app-frame mx-auto relative flex flex-col h-screen sm:h-[880px] overflow-hidden selection:bg-[#8ee4af] selection:text-slate-950">
      <Navbar />

      <div className="flex-1 overflow-hidden px-5 pt-3 pb-24 flex flex-col justify-between">
        {activeTab === 'home' && (
          <div className="h-full flex flex-col justify-between">
            <HomeEconomicOverview
              onOpenAddTransaction={() => {
                setInitialCategoryId('');
                setIsAddTransactionOpen(true);
              }}
              onViewAllTransactions={() => setActiveTab('settings')}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="h-full overflow-y-auto pr-1 space-y-4">
            <SummaryStats onViewAll={() => setActiveTab('settings')} />
            <AnalyticsCharts />
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="h-full overflow-y-auto pr-1 space-y-4">
            <MultiWalletCard
              onOpenAddTransaction={() => {
                setInitialCategoryId('');
                setIsAddTransactionOpen(true);
              }}
            />
            <SavingsGoalsCard />
            <RecurringBillsCard />
          </div>
        )}

        {activeTab === 'allocation' && (
          <div className="h-full overflow-y-auto pr-1 space-y-4">
            <SalaryAllocationCard />
            <BudgetProgressCards onOpenAddTransactionForCategory={handleOpenAddForCategory} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto pr-1 space-y-4">
            <SettingsScreen onOpenEmailParser={() => setIsEmailParserOpen(true)} />
            <TransactionList />
          </div>
        )}
      </div>

      {/* Pinned Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#090c10]/95 backdrop-blur-2xl border-t border-white/10 py-3 px-3 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
                active
                  ? 'bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] font-extrabold shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0 stroke-[2.3]" />
              {active && <span className="text-[11px] font-bold">{item.label}</span>}
            </button>
          );
        })}
      </div>

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

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
