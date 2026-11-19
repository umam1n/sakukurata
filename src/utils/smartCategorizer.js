// Smart Merchant-to-Bucket & Purpose-Wallet Auto-Classifier (Indonesian + English)
// Disambiguates specific phrases (e.g. "gofood"/"grabfood" before "gojek"/"grab").

export const SPENDING_INTENT_RULES = [
  {
    intent: 'food',
    label: 'Food & Dining',
    merchantKeywords: [
      'gofood', 'grabfood', 'shopeefood',
      'kantin', 'warteg', 'warung', 'rm ', 'rumah makan', 'padang', 'bakso', 'mie ', 'soto',
      'nasi ', 'ayam ', 'sate ', 'seblak', 'geprek', 'bebek', 'bubur', 'pecel', 'lalapan',
      'es teh', 'esteh', 'teh tarik', 'chatime', 'mixue', 'boba', 'haus!', 'xing fu tang',
      'kopi', 'coffee', 'starbucks', 'kenangan', 'janji jiwa', 'fore ', 'tuku', 'point coffee',
      'jump start', 'tomoro', 'flash coffee', 'kafe', 'cafe', 'bistro', 'resto', 'restaurant',
      'famima', 'familymart', 'lawson', 'circle k', '7-eleven',
      'mcd', 'mcdonald', 'kfc', 'burger king', 'hokben', 'pizza hut', 'domino', 'sushi',
      'ramen', 'marugame', 'yoshinoya', 'solaria', 'richeese', 'a&w', 'wendy', 'subway',
      'bakery', 'roti', 'jco', 'j.co', 'dunkin', 'breadtalk', 'holland bakery', 'mako',
      'foodcourt', 'food court', 'dining', 'makan', 'snack', 'jajan', 'minuman'
    ],
    targetBucketAliases: [
      'eat', 'eating', 'food', 'dining', 'makan', 'kuliner', 'jajan', 'f&b', 'fnB',
      'outgoing', 'hangout', 'nongkrong', 'lifestyle', 'essential', 'kebutuhan', 'needs', 'daily'
    ],
    targetWalletAliases: [
      'eat', 'eating', 'food', 'dining', 'makan', 'jajan', 'outgoing', 'hangout', 'daily', 'lunch'
    ]
  },
  {
    intent: 'transport',
    label: 'Transportation',
    merchantKeywords: [
      'mrt', 'lrt', 'transjakarta', 'trans jakarta', 'krl', 'commuter', 'kai ', 'kereta', 'whoosh',
      'taxi', 'taksi', 'bluebird', 'blue bird', 'silverbird',
      'grabcar', 'grabbike', 'grab ', 'gojek', 'goride', 'gocar', 'gobluebird', 'maxim', 'indrive',
      'bensin', 'pertamina', 'pertamax', 'pertalite', 'shell', 'bp akr', 'spbu', 'fuel', 'bbm',
      'tol ', 'e-toll', 'jasamarga', 'parkir', 'parking', 'secure parking', 'centre park',
      'flazz', 'e-money', 'emoney', 'brizzi', 'tapcash', 'jaklingko',
      'garuda', 'citilink', 'lion air', 'batik air', 'super air jet', 'airasia', 'pelita air',
      'tiket pesawat', 'transport', 'ojek', 'angkot', 'busway', 'damri'
    ],
    targetBucketAliases: [
      'transport', 'transportation', 'transportasi', 'commute', 'travel', 'mobility',
      'bensin', 'kendaraan', 'essential', 'kebutuhan', 'needs'
    ],
    targetWalletAliases: [
      'transport', 'transportation', 'transportasi', 'commute', 'travel', 'ojol', 'bensin', 'tol'
    ]
  },
  {
    intent: 'groceries',
    label: 'Groceries & Daily Needs',
    merchantKeywords: [
      'indomaret', 'alfamart', 'alfamidi', 'superindo', 'hypermart', 'transmart', 'lotte',
      'ranch market', 'farmers market', 'hero', 'grand lucky', 'aeon', 'hari hari', 'naga swalayan',
      'sayurbox', 'segari', 'astro', 'mart', 'supermarket', 'minimarket', 'pasar', 'sembako',
      'apotek', 'kimia farma', 'century', 'guardian', 'watsons', 'halodoc', 'k24'
    ],
    targetBucketAliases: [
      'grocer', 'belanja', 'mart', 'daily', 'essential', 'kebutuhan', 'needs', 'household', 'rumah tangga'
    ],
    targetWalletAliases: [
      'grocer', 'belanja', 'daily', 'essential', 'kebutuhan', 'household'
    ]
  },
  {
    intent: 'bills',
    label: 'Bills & Utilities',
    merchantKeywords: [
      'pln', 'listrik', 'token', 'pdam', 'air ', 'indihome', 'biznet', 'first media',
      'myrepublic', 'cbn', 'oxygen', 'iconnet', 'telkomsel', 'indosat', 'xl ', 'axis', 'tri ',
      'smartfren', 'by.u', 'pulsa', 'paket data',
      'kpr', 'cicilan', 'angsuran', 'kartu kredit', 'credit card', 'kredivo', 'akulaku',
      'spaylater', 'paylater', 'bpjs', 'asuransi', 'prudential', 'allianz', 'manulife', 'axa',
      'sewa', 'kos ', 'kost', 'apartemen', 'ipl', 'pajak', 'pbb', 'samsat'
    ],
    targetBucketAliases: [
      'bill', 'tagihan', 'utilit', 'cicilan', 'debt', 'utang', 'installment', 'fixed', 'rutin', 'essential', 'kebutuhan'
    ],
    targetWalletAliases: [
      'bill', 'tagihan', 'utilit', 'cicilan', 'debt', 'fixed', 'rutin'
    ]
  },
  {
    intent: 'lifestyle',
    label: 'Lifestyle & Outgoing',
    merchantKeywords: [
      'netflix', 'spotify', 'youtube', 'disney', 'vidio', 'viu', 'apple.com', 'itunes',
      'google play', 'steam', 'playstation', 'xbox', 'nintendo', 'roblox',
      'xxi', 'cinema', 'cgv', 'cinepolis', 'tix id', 'bioskop',
      'tokopedia', 'shopee', 'lazada', 'blibli', 'zalora', 'tiktok shop',
      'uniqlo', 'zara', 'h&m', 'pull&bear', 'nike', 'adidas', 'ikea', 'ace hardware', 'mr diy',
      'gramedia', 'gym', 'fitness', 'celebrity fitness', 'fithub', 'salon', 'barber',
      'karaoke', 'bowling', 'hotel', 'agoda', 'traveloka', 'tiket.com', 'airbnb', 'club', 'bar '
    ],
    targetBucketAliases: [
      'outgoing', 'lifestyle', 'fun', 'hiburan', 'reward', 'self reward', 'entertainment',
      'wants', 'shopping', 'belanja', 'hangout', 'personal'
    ],
    targetWalletAliases: [
      'outgoing', 'lifestyle', 'fun', 'hiburan', 'reward', 'shopping', 'hangout', 'entertainment', 'jajan'
    ]
  },
  {
    intent: 'savings',
    label: 'Savings & Investments',
    merchantKeywords: [
      'bibit', 'bareksa', 'ajaib', 'stockbit', 'pluang', 'ipot', 'indopremier', 'mirae',
      'reksadana', 'deposito', 'emas', 'pegadaian', 'treasury', 'tabungan', 'investasi', 'rdn', 'obligasi', 'sbn'
    ],
    targetBucketAliases: [
      'saving', 'tabungan', 'invest', 'darurat', 'emergency', 'wealth', 'dana'
    ],
    targetWalletAliases: [
      'saving', 'tabungan', 'invest', 'darurat', 'emergency', 'rdn'
    ]
  }
];

/**
 * Detects the spending intent from merchant + raw email text.
 */
export function detectSpendingIntent(merchant = '', rawText = '') {
  const merchantLower = (merchant || '').toLowerCase();
  const combinedLower = `${merchantLower} ${(rawText || '').slice(0, 500).toLowerCase()}`;

  // Pass 1: Check merchant name directly (highest accuracy)
  for (const rule of SPENDING_INTENT_RULES) {
    const matchedKw = rule.merchantKeywords.find((kw) => merchantLower.includes(kw));
    if (matchedKw) {
      return { intent: rule.intent, label: rule.label, matchedKeyword: matchedKw.trim(), rule };
    }
  }

  // Pass 2: Check combined text (subject + snippet + merchant)
  for (const rule of SPENDING_INTENT_RULES) {
    const matchedKw = rule.merchantKeywords.find((kw) => combinedLower.includes(kw));
    if (matchedKw) {
      return { intent: rule.intent, label: rule.label, matchedKeyword: matchedKw.trim(), rule };
    }
  }

  return null;
}

/**
 * Dynamically matches the best Bucket and Wallet from the user's actual fluid lists.
 * Priority for Wallet:
 *   1. Purpose-named wallet matching the intent (e.g. "Transportation Wallet", "Eating Wallet", "Outgoing")
 *   2. Bank/E-wallet matching the detected email sender (e.g. "Bank BCA", "GoPay")
 *   3. First available wallet
 */
export function autoAssignBucketAndWallet({
  merchant = '',
  rawText = '',
  detectedWalletName = '',
  buckets = [],
  wallets = []
}) {
  const detected = detectSpendingIntent(merchant, rawText);

  let matchedBucket = null;
  let matchedWallet = null;
  let walletMatchReason = '';

  if (detected) {
    // 1. Find best matching Budget Bucket by alias priority
    for (const alias of detected.rule.targetBucketAliases) {
      const found = buckets.find((b) => (b.name || '').toLowerCase().includes(alias.toLowerCase()));
      if (found) {
        matchedBucket = found;
        break;
      }
    }

    // 2. Check if user has a purpose-specific Wallet (e.g. "Transportation", "Eating Wallet", "Outgoing")
    for (const alias of detected.rule.targetWalletAliases) {
      const found = wallets.find((w) => (w.name || '').toLowerCase().includes(alias.toLowerCase()));
      if (found) {
        matchedWallet = found;
        walletMatchReason = `Matched "${found.name}"`;
        break;
      }
    }
  }

  // Fallback Wallet: match by detected bank/e-wallet name (e.g. "Bank BCA", "GoPay")
  if (!matchedWallet && detectedWalletName) {
    const lower = detectedWalletName.toLowerCase();
    const byBank = wallets.find(
      (w) => w.name.toLowerCase().includes(lower) || lower.includes(w.name.toLowerCase())
    );
    if (byBank) {
      matchedWallet = byBank;
      walletMatchReason = `Bank match "${byBank.name}"`;
    }
  }

  return {
    intent: detected?.intent || null,
    intentLabel: detected?.label || null,
    matchedKeyword: detected?.matchedKeyword || null,
    bucketId: matchedBucket?.id || buckets[0]?.id || '',
    bucketName: matchedBucket?.name || buckets[0]?.name || '',
    walletId: matchedWallet?.id || wallets[0]?.id || '',
    walletName: matchedWallet?.name || wallets[0]?.name || '',
    walletMatchReason
  };
}
