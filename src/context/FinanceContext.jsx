import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeUserProfile,
  subscribeSubcollection,
  saveOnboardingBatch,
  updateUserProfileDoc,
  replaceUserBuckets,
  addSubDoc,
  updateSubDoc,
  deleteSubDoc
} from '../services/firestoreService';

const FinanceContext = createContext();

const GUEST_DATA_KEY = 'sakukurata_guest_data_v2';

const EMPTY_GUEST_STATE = {
  profile: null,
  buckets: [],
  wallets: [],
  transactions: [],
  quickActions: [],
  goals: [],
  bills: []
};

function loadGuestState() {
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    return raw ? { ...EMPTY_GUEST_STATE, ...JSON.parse(raw) } : EMPTY_GUEST_STATE;
  } catch {
    return EMPTY_GUEST_STATE;
  }
}

function saveGuestState(state) {
  try {
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist guest data:', err);
  }
}

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const FinanceProvider = ({ children }) => {
  const { user, isGuest, isFirebaseConfigured } = useAuth();
  const isCloudMode = Boolean(user && isFirebaseConfigured);

  const [profile, setProfile] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Load either Firestore live subscriptions OR Guest localStorage
  useEffect(() => {
    if (isCloudMode && user?.uid) {
      setDataLoading(true);
      const unsubs = [
        subscribeUserProfile(user.uid, (p) => {
          setProfile(p);
          setDataLoading(false);
        }),
        subscribeSubcollection(user.uid, 'buckets', (items) => {
          setBuckets([...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        }),
        subscribeSubcollection(user.uid, 'wallets', setWallets),
        subscribeSubcollection(user.uid, 'transactions', setTransactions, 'transactionDate', 'desc'),
        subscribeSubcollection(user.uid, 'quickActions', setQuickActions),
        subscribeSubcollection(user.uid, 'goals', setGoals),
        subscribeSubcollection(user.uid, 'bills', setBills)
      ];
      return () => unsubs.forEach((u) => u && u());
    }

    if (isGuest) {
      const local = loadGuestState();
      setProfile(local.profile);
      setBuckets(local.buckets);
      setWallets(local.wallets);
      setTransactions(local.transactions);
      setQuickActions(local.quickActions);
      setGoals(local.goals);
      setBills(local.bills);
      setDataLoading(false);
      return;
    }

    // Signed out
    setProfile(null);
    setBuckets([]);
    setWallets([]);
    setTransactions([]);
    setQuickActions([]);
    setGoals([]);
    setBills([]);
    setDataLoading(false);
  }, [isCloudMode, user?.uid, isGuest]);

  // Persist guest changes automatically
  const persistGuest = (patch) => {
    const current = {
      profile,
      buckets,
      wallets,
      transactions,
      quickActions,
      goals,
      bills,
      ...patch
    };
    saveGuestState(current);
  };

  // --- MUTATORS ---

  const completeOnboarding = async ({ displayName, baseSalary, paydayDate, buckets: initBuckets, wallets: initWallets, quickActions: initQuickActions }) => {
    const profilePayload = {
      displayName: displayName?.trim() || user?.displayName || 'Pengguna',
      email: user?.email || '',
      baseSalary: Number(baseSalary) || 0,
      paydayDate: Number(paydayDate) || 25,
      currency: 'IDR',
      onboardingCompleted: true
    };

    if (isCloudMode) {
      await saveOnboardingBatch(user.uid, {
        profile: profilePayload,
        buckets: initBuckets,
        wallets: initWallets,
        quickActions: initQuickActions
      });
      return;
    }

    const mappedBuckets = initBuckets.map((b, idx) => ({
      id: makeId('bkt'),
      name: b.name,
      percentage: Number(b.percentage) || 0,
      color: b.color || '#10b981',
      icon: b.icon || 'Tag',
      sortOrder: idx
    }));

    const mappedWallets = initWallets.map((w) => ({
      id: makeId('wlt'),
      name: w.name,
      type: w.type || 'bank',
      balance: Number(w.balance) || 0,
      color: w.color || '#3b82f6'
    }));

    const mappedQA = initQuickActions.map((qa) => ({
      id: makeId('qa'),
      title: qa.title,
      amount: Number(qa.amount) || 0,
      bucketId: mappedBuckets[0]?.id || null,
      bucketName: mappedBuckets[0]?.name || 'Umum',
      walletId: mappedWallets[0]?.id || null,
      color: qa.color || '#10b981',
      icon: qa.icon || 'Coffee'
    }));

    setProfile(profilePayload);
    setBuckets(mappedBuckets);
    setWallets(mappedWallets);
    setQuickActions(mappedQA);
    persistGuest({
      profile: profilePayload,
      buckets: mappedBuckets,
      wallets: mappedWallets,
      quickActions: mappedQA
    });
  };

  const updateProfile = async (updates) => {
    const merged = { ...(profile || {}), ...updates };
    if (isCloudMode) {
      await updateUserProfileDoc(user.uid, updates);
      return;
    }
    setProfile(merged);
    persistGuest({ profile: merged });
  };

  const setBaseSalary = (amount) => updateProfile({ baseSalary: Number(amount) || 0 });

  const saveBuckets = async (newBuckets) => {
    if (isCloudMode) {
      await replaceUserBuckets(
        user.uid,
        buckets.map((b) => b.id),
        newBuckets
      );
      return;
    }
    const normalized = newBuckets.map((b, idx) => ({
      ...b,
      id: b.id && !String(b.id).startsWith('tmp_') ? b.id : makeId('bkt'),
      percentage: Number(b.percentage) || 0,
      sortOrder: idx
    }));
    setBuckets(normalized);
    persistGuest({ buckets: normalized });
  };

  // Wallets CRUD
  const addWallet = async (wallet) => {
    const payload = {
      name: wallet.name.trim(),
      type: wallet.type || 'bank',
      balance: Number(wallet.balance) || 0,
      color: wallet.color || '#3b82f6'
    };
    if (isCloudMode) {
      await addSubDoc(user.uid, 'wallets', payload);
      return;
    }
    const next = [...wallets, { id: makeId('wlt'), ...payload }];
    setWallets(next);
    persistGuest({ wallets: next });
  };

  const updateWallet = async (walletId, updates) => {
    if (isCloudMode) {
      await updateSubDoc(user.uid, 'wallets', walletId, updates);
      return;
    }
    const next = wallets.map((w) => (w.id === walletId ? { ...w, ...updates } : w));
    setWallets(next);
    persistGuest({ wallets: next });
  };

  const deleteWallet = async (walletId) => {
    if (isCloudMode) {
      await deleteSubDoc(user.uid, 'wallets', walletId);
      return;
    }
    const next = wallets.filter((w) => w.id !== walletId);
    setWallets(next);
    persistGuest({ wallets: next });
  };

  // Transactions CRUD
  const addTransaction = async (tx) => {
    const now = new Date().toISOString();
    const amount = Number(tx.amount) || 0;
    const payload = {
      type: tx.type || 'expense',
      amount,
      bucketId: tx.bucketId || tx.categoryId || null,
      bucketName: tx.bucketName || tx.categoryName || 'Umum',
      walletId: tx.walletId || null,
      walletName: tx.walletName || 'Dompet',
      merchant: tx.merchant || tx.recipientMerchant || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      notes: tx.notes || '',
      transactionDate: tx.transactionDate || now,
      createdAt: now
    };

    const targetWallet = wallets.find((w) => w.id === payload.walletId);
    const nextWalletBalance = targetWallet
      ? Math.max(0, Number(targetWallet.balance || 0) + (payload.type === 'income' ? amount : -amount))
      : null;

    if (isCloudMode) {
      await addSubDoc(user.uid, 'transactions', payload);
      if (targetWallet && nextWalletBalance !== null) {
        await updateSubDoc(user.uid, 'wallets', targetWallet.id, { balance: nextWalletBalance });
      }
      return;
    }

    const nextTx = [{ id: makeId('tx'), ...payload }, ...transactions];
    const nextWallets = targetWallet
      ? wallets.map((w) => (w.id === targetWallet.id ? { ...w, balance: nextWalletBalance } : w))
      : wallets;
    setTransactions(nextTx);
    setWallets(nextWallets);
    persistGuest({ transactions: nextTx, wallets: nextWallets });
  };

  const deleteTransaction = async (txId) => {
    const target = transactions.find((t) => t.id === txId);
    if (isCloudMode) {
      await deleteSubDoc(user.uid, 'transactions', txId);
      if (target?.walletId) {
        const w = wallets.find((x) => x.id === target.walletId);
        if (w) {
          const revertDiff = target.type === 'income' ? -Number(target.amount) : Number(target.amount);
          await updateSubDoc(user.uid, 'wallets', w.id, {
            balance: Math.max(0, Number(w.balance || 0) + revertDiff)
          });
        }
      }
      return;
    }

    const nextTx = transactions.filter((t) => t.id !== txId);
    let nextWallets = wallets;
    if (target?.walletId) {
      const revertDiff = target.type === 'income' ? -Number(target.amount) : Number(target.amount);
      nextWallets = wallets.map((w) =>
        w.id === target.walletId ? { ...w, balance: Math.max(0, Number(w.balance || 0) + revertDiff) } : w
      );
    }
    setTransactions(nextTx);
    setWallets(nextWallets);
    persistGuest({ transactions: nextTx, wallets: nextWallets });
  };

  // Quick Actions CRUD
  const addQuickAction = async (qa) => {
    const payload = {
      title: qa.title.trim(),
      amount: Number(qa.amount) || 0,
      bucketId: qa.bucketId || buckets[0]?.id || null,
      bucketName: qa.bucketName || buckets[0]?.name || 'Umum',
      walletId: qa.walletId || wallets[0]?.id || null,
      color: qa.color || '#10b981',
      icon: qa.icon || 'Zap'
    };
    if (isCloudMode) {
      await addSubDoc(user.uid, 'quickActions', payload);
      return;
    }
    const next = [...quickActions, { id: makeId('qa'), ...payload }];
    setQuickActions(next);
    persistGuest({ quickActions: next });
  };

  const deleteQuickAction = async (qaId) => {
    if (isCloudMode) {
      await deleteSubDoc(user.uid, 'quickActions', qaId);
      return;
    }
    const next = quickActions.filter((q) => q.id !== qaId);
    setQuickActions(next);
    persistGuest({ quickActions: next });
  };

  // Savings Goals CRUD
  const addGoal = async (goal) => {
    const payload = {
      title: goal.title.trim(),
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0,
      targetDate: goal.targetDate || '',
      color: goal.color || '#10b981'
    };
    if (isCloudMode) {
      await addSubDoc(user.uid, 'goals', payload);
      return;
    }
    const next = [...goals, { id: makeId('goal'), ...payload }];
    setGoals(next);
    persistGuest({ goals: next });
  };

  const topUpGoal = async (goalId, addAmount) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const nextAmount = Number(target.currentAmount || 0) + Number(addAmount || 0);
    if (isCloudMode) {
      await updateSubDoc(user.uid, 'goals', goalId, { currentAmount: nextAmount });
      return;
    }
    const next = goals.map((g) => (g.id === goalId ? { ...g, currentAmount: nextAmount } : g));
    setGoals(next);
    persistGuest({ goals: next });
  };

  const deleteGoal = async (goalId) => {
    if (isCloudMode) {
      await deleteSubDoc(user.uid, 'goals', goalId);
      return;
    }
    const next = goals.filter((g) => g.id !== goalId);
    setGoals(next);
    persistGuest({ goals: next });
  };

  // Recurring Bills CRUD
  const addBill = async (bill) => {
    const payload = {
      title: bill.title.trim(),
      amount: Number(bill.amount) || 0,
      dueDay: Number(bill.dueDay) || 1,
      bucketId: bill.bucketId || null,
      walletId: bill.walletId || null,
      isPaid: false
    };
    if (isCloudMode) {
      await addSubDoc(user.uid, 'bills', payload);
      return;
    }
    const next = [...bills, { id: makeId('bill'), ...payload }];
    setBills(next);
    persistGuest({ bills: next });
  };

  const toggleBillPaid = async (billId) => {
    const target = bills.find((b) => b.id === billId);
    if (!target) return;
    if (isCloudMode) {
      await updateSubDoc(user.uid, 'bills', billId, { isPaid: !target.isPaid });
      return;
    }
    const next = bills.map((b) => (b.id === billId ? { ...b, isPaid: !b.isPaid } : b));
    setBills(next);
    persistGuest({ bills: next });
  };

  const deleteBill = async (billId) => {
    if (isCloudMode) {
      await deleteSubDoc(user.uid, 'bills', billId);
      return;
    }
    const next = bills.filter((b) => b.id !== billId);
    setBills(next);
    persistGuest({ bills: next });
  };

  const resetGuestData = () => {
    localStorage.removeItem(GUEST_DATA_KEY);
    setProfile(null);
    setBuckets([]);
    setWallets([]);
    setTransactions([]);
    setQuickActions([]);
    setGoals([]);
    setBills([]);
  };

  // --- COMPUTED ANALYTICS ---
  const baseSalary = Number(profile?.baseSalary || 0);
  const paydayDate = Number(profile?.paydayDate || 25);
  const onboardingCompleted = Boolean(profile?.onboardingCompleted);

  const computed = useMemo(() => {
    const extraIncomeTotal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalIncome = baseSalary + extraIncomeTotal;

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const categoryStats = buckets.map((b) => {
      const allocatedAmount = Math.round(totalIncome * ((Number(b.percentage) || 0) / 100));
      const spentAmount = transactions
        .filter((t) => t.type === 'expense' && (t.bucketId === b.id || t.categoryId === b.id))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const remainingAmount = allocatedAmount - spentAmount;
      const usagePercent = allocatedAmount > 0 ? Math.round((spentAmount / allocatedAmount) * 100) : 0;

      return {
        ...b,
        allocatedAmount,
        spentAmount,
        remainingAmount,
        usagePercent
      };
    });

    const totalAllocated = categoryStats.reduce((sum, c) => sum + c.allocatedAmount, 0);
    const overallRemainingCash = totalIncome - totalExpenses;
    const totalPercentage = buckets.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0);

    return {
      extraIncomeTotal,
      totalIncome,
      totalExpenses,
      totalAllocated,
      overallRemainingCash,
      categoryStats,
      totalPercentage,
      isValidPercentageTotal: totalPercentage === 100
    };
  }, [baseSalary, buckets, transactions]);

  return (
    <FinanceContext.Provider
      value={{
        profile,
        baseSalary,
        paydayDate,
        onboardingCompleted,
        dataLoading,
        isCloudMode,
        isOnline,
        // Entities (expose categories alias for compatibility)
        buckets,
        categories: buckets,
        wallets,
        transactions,
        quickActions,
        savingsGoals: goals,
        recurringBills: bills,
        // Actions
        completeOnboarding,
        updateProfile,
        setBaseSalary,
        saveBuckets,
        updateCategories: saveBuckets,
        addWallet,
        updateWallet,
        deleteWallet,
        addTransaction,
        deleteTransaction,
        addQuickAction,
        deleteQuickAction,
        addGoal,
        topUpGoal,
        deleteGoal,
        addBill,
        toggleBillPaid,
        deleteBill,
        resetGuestData,
        // Computed
        ...computed
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
