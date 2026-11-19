// Fluid Onboarding Templates (UI-only starting points — never hardcoded into the database)

export const BUDGET_TEMPLATES = [
  {
    id: 'balanced',
    name: 'Seimbang (40-20-20-10-10)',
    subtitle: 'Cocok untuk gaji tetap dengan cicilan & dana darurat',
    buckets: [
      { name: 'Kebutuhan Pokok', percentage: 40, color: '#10b981', icon: 'ShoppingCart' },
      { name: 'Tabungan & Investasi', percentage: 20, color: '#3b82f6', icon: 'PiggyBank' },
      { name: 'Cicilan & Utang', percentage: 20, color: '#f43f5e', icon: 'CreditCard' },
      { name: 'Self Reward & Hiburan', percentage: 10, color: '#f59e0b', icon: 'Gift' },
      { name: 'Dana Darurat', percentage: 10, color: '#8b5cf6', icon: 'ShieldAlert' }
    ]
  },
  {
    id: 'classic',
    name: 'Klasik (50-30-20)',
    subtitle: 'Simpel: 50% kebutuhan, 30% gaya hidup, 20% tabungan',
    buckets: [
      { name: 'Kebutuhan Utama', percentage: 50, color: '#10b981', icon: 'ShoppingCart' },
      { name: 'Keinginan & Gaya Hidup', percentage: 30, color: '#f43f5e', icon: 'Gift' },
      { name: 'Tabungan & Investasi', percentage: 20, color: '#3b82f6', icon: 'PiggyBank' }
    ]
  },
  {
    id: 'debt_free',
    name: 'Bebas Cicilan (60-25-15)',
    subtitle: 'Fokus kebutuhan harian & percepat tabungan',
    buckets: [
      { name: 'Kebutuhan Pokok', percentage: 60, color: '#10b981', icon: 'ShoppingCart' },
      { name: 'Tabungan & Investasi', percentage: 25, color: '#3b82f6', icon: 'PiggyBank' },
      { name: 'Self Reward', percentage: 15, color: '#f59e0b', icon: 'Gift' }
    ]
  },
  {
    id: 'blank',
    name: 'Mulai Kosong (Custom)',
    subtitle: 'Buat pos anggaran sendiri sesuai gaya hidupmu',
    buckets: [
      { name: 'Pengeluaran Umum', percentage: 100, color: '#10b981', icon: 'Tag' }
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
  { name: 'Dompet Tunai', type: 'cash', color: '#10b981' }
];

export const STARTER_QUICK_ACTIONS = [
  { title: 'Kopi', amount: 18000, color: '#f43f5e', icon: 'Coffee' },
  { title: 'Makan', amount: 35000, color: '#10b981', icon: 'Utensils' },
  { title: 'Transport', amount: 25000, color: '#3b82f6', icon: 'Bus' }
];

export const BUCKET_COLOR_SWATCHES = [
  '#10b981',
  '#3b82f6',
  '#f43f5e',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16'
];
