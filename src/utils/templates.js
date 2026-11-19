// Fluid Onboarding Templates (UI-only starting points — never hardcoded into the database)

export const BUDGET_TEMPLATES = [
  {
    id: 'balanced',
    name: 'Balanced (40-20-20-10-10)',
    subtitle: 'Great for fixed salaries with installments & emergency reserves',
    buckets: [
      { name: 'Essentials', percentage: 40, color: '#34d399', icon: 'ShoppingCart' },
      { name: 'Savings & Investments', percentage: 20, color: '#60a5fa', icon: 'PiggyBank' },
      { name: 'Bills & Debt', percentage: 20, color: '#fb7185', icon: 'CreditCard' },
      { name: 'Lifestyle & Fun', percentage: 10, color: '#fbbf24', icon: 'Gift' },
      { name: 'Emergency Fund', percentage: 10, color: '#c084fc', icon: 'ShieldAlert' }
    ]
  },
  {
    id: 'classic',
    name: 'Classic (50-30-20)',
    subtitle: 'Simple rule: 50% needs, 30% wants, 20% savings',
    buckets: [
      { name: 'Needs', percentage: 50, color: '#34d399', icon: 'ShoppingCart' },
      { name: 'Wants & Lifestyle', percentage: 30, color: '#fb7185', icon: 'Gift' },
      { name: 'Savings & Investments', percentage: 20, color: '#60a5fa', icon: 'PiggyBank' }
    ]
  },
  {
    id: 'debt_free',
    name: 'Debt-Free Focus (60-25-15)',
    subtitle: 'Daily living focus with accelerated savings',
    buckets: [
      { name: 'Living Essentials', percentage: 60, color: '#34d399', icon: 'ShoppingCart' },
      { name: 'Savings & Investments', percentage: 25, color: '#60a5fa', icon: 'PiggyBank' },
      { name: 'Personal & Fun', percentage: 15, color: '#fbbf24', icon: 'Gift' }
    ]
  },
  {
    id: 'blank',
    name: 'Start Blank (Custom)',
    subtitle: 'Create your own budget buckets from scratch',
    buckets: [
      { name: 'General Budget', percentage: 100, color: '#34d399', icon: 'Tag' }
    ]
  }
];

export const STARTER_WALLET_SUGGESTIONS = [
  { name: 'Bank BCA', type: 'bank', color: '#005caa' },
  { name: 'Bank Mandiri', type: 'bank', color: '#003d79' },
  { name: 'Bank BRI', type: 'bank', color: '#00529c' },
  { name: 'Bank BNI', type: 'bank', color: '#f15a23' },
  { name: 'GoPay', type: 'ewallet', color: '#00aa13' },
  { name: 'OVO', type: 'ewallet', color: '#4c2a86' },
  { name: 'DANA', type: 'ewallet', color: '#118eea' },
  { name: 'ShopeePay', type: 'ewallet', color: '#ee4d2d' },
  { name: 'Cash Wallet', type: 'cash', color: '#34d399' }
];

export const STARTER_QUICK_ACTIONS = [
  { title: 'Coffee', amount: 18000, color: '#fb7185', icon: 'Coffee' },
  { title: 'Lunch', amount: 35000, color: '#34d399', icon: 'Utensils' },
  { title: 'Transport', amount: 25000, color: '#60a5fa', icon: 'Bus' }
];

export const BUCKET_COLOR_SWATCHES = [
  '#34d399',
  '#60a5fa',
  '#fb7185',
  '#fbbf24',
  '#c084fc',
  '#67e8f9',
  '#818cf8',
  '#fdba74'
];
