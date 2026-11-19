// Comprehensive Catalog of Indonesian Banks (BUMN, Private, Digital, Syariah, BPD) & E-Wallets

export const INDONESIAN_INSTITUTIONS = [
  // --- Major National & Private Banks ---
  {
    id: 'bca',
    name: 'Bank BCA',
    short: 'BCA',
    type: 'bank',
    color: '#005CAA',
    accent: '#0084D4',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['bca.co.id', 'klikbca.com'],
    keywords: ['mybca', 'klikbca', 'bank bca', 'bca mobile', 'sakuku']
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    short: 'MDR',
    type: 'bank',
    color: '#003D79',
    accent: '#FFB700',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['bankmandiri.co.id', 'livin.bankmandiri.co.id'],
    keywords: ['mandiri', 'livin']
  },
  {
    id: 'bri',
    name: 'Bank BRI',
    short: 'BRI',
    type: 'bank',
    color: '#00529C',
    accent: '#F37021',
    textColor: '#FFFFFF',
    motif: 'grid',
    domains: ['bri.co.id'],
    keywords: ['brimo', 'bank bri', 'bri ']
  },
  {
    id: 'bni',
    name: 'Bank BNI',
    short: 'BNI',
    type: 'bank',
    color: '#F15A23',
    accent: '#006677',
    textColor: '#FFFFFF',
    motif: 'chevron',
    domains: ['bni.co.id'],
    keywords: ['bni', 'wondr']
  },
  {
    id: 'btn',
    name: 'Bank BTN',
    short: 'BTN',
    type: 'bank',
    color: '#004A98',
    accent: '#FDB913',
    textColor: '#FFFFFF',
    motif: 'hexagon',
    domains: ['btn.co.id'],
    keywords: ['bank btn', 'btn mobile', 'bale by btn']
  },
  {
    id: 'cimb',
    name: 'CIMB Niaga',
    short: 'CIMB',
    type: 'bank',
    color: '#790008',
    accent: '#DC143C',
    textColor: '#FFFFFF',
    motif: 'chevron',
    domains: ['cimbniaga.co.id'],
    keywords: ['cimb', 'octo mobile', 'octo clicks']
  },
  {
    id: 'danamon',
    name: 'Bank Danamon',
    short: 'BDMN',
    type: 'bank',
    color: '#F58220',
    accent: '#FFB81C',
    textColor: '#111827',
    motif: 'diamond',
    domains: ['danamon.co.id'],
    keywords: ['danamon', 'd-bank']
  },
  {
    id: 'permata',
    name: 'PermataBank',
    short: 'BNLI',
    type: 'bank',
    color: '#008A45',
    accent: '#78BE20',
    textColor: '#FFFFFF',
    motif: 'diamond',
    domains: ['permatabank.co.id'],
    keywords: ['permata', 'permata me']
  },
  {
    id: 'ocbc',
    name: 'OCBC Indonesia',
    short: 'OCBC',
    type: 'bank',
    color: '#D71920',
    accent: '#9E1B20',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['ocbc.id', 'ocbcnisp.com'],
    keywords: ['ocbc', 'nyala']
  },
  {
    id: 'panin',
    name: 'PaninBank',
    short: 'PNBN',
    type: 'bank',
    color: '#004B8D',
    accent: '#00AEEF',
    textColor: '#FFFFFF',
    motif: 'grid',
    domains: ['panin.co.id'],
    keywords: ['panin']
  },
  {
    id: 'mega',
    name: 'Bank Mega',
    short: 'MEGA',
    type: 'bank',
    color: '#F58220',
    accent: '#004A8F',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['bankmega.com'],
    keywords: ['bank mega', 'm-smile']
  },
  {
    id: 'maybank',
    name: 'Maybank Indonesia',
    short: 'MAY',
    type: 'bank',
    color: '#FFC72C',
    accent: '#111827',
    textColor: '#111827',
    motif: 'hexagon',
    domains: ['maybank.co.id'],
    keywords: ['maybank', 'm2u']
  },
  {
    id: 'sinarmas',
    name: 'Bank Sinarmas',
    short: 'BSIM',
    type: 'bank',
    color: '#E31837',
    accent: '#9B111E',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['banksinarmas.com'],
    keywords: ['sinarmas', 'simobi']
  },
  {
    id: 'uob',
    name: 'UOB Indonesia',
    short: 'UOB',
    type: 'bank',
    color: '#0033A0',
    accent: '#E4002B',
    textColor: '#FFFFFF',
    motif: 'grid',
    domains: ['uob.co.id'],
    keywords: ['uob', 'tmrw']
  },
  {
    id: 'dbs',
    name: 'Digibank by DBS',
    short: 'DBS',
    type: 'bank',
    color: '#E1251B',
    accent: '#1E293B',
    textColor: '#FFFFFF',
    motif: 'diamond',
    domains: ['dbs.com', 'dbs.id'],
    keywords: ['digibank', 'dbs']
  },
  {
    id: 'hsbc',
    name: 'HSBC Indonesia',
    short: 'HSBC',
    type: 'bank',
    color: '#DB0011',
    accent: '#111827',
    textColor: '#FFFFFF',
    motif: 'hexagon',
    domains: ['hsbc.co.id'],
    keywords: ['hsbc']
  },
  {
    id: 'scb',
    name: 'Standard Chartered',
    short: 'SCB',
    type: 'bank',
    color: '#0072AA',
    accent: '#21AA47',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['sc.com'],
    keywords: ['standard chartered']
  },

  // --- Digital Banks ---
  {
    id: 'jago',
    name: 'Bank Jago',
    short: 'JAGO',
    type: 'digital_bank',
    color: '#FDB913',
    accent: '#6B21A8',
    textColor: '#111827',
    motif: 'circle',
    domains: ['jago.com'],
    keywords: ['bank jago', 'jago']
  },
  {
    id: 'seabank',
    name: 'SeaBank',
    short: 'SEA',
    type: 'digital_bank',
    color: '#F26522',
    accent: '#FF9E1B',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['seabank.co.id'],
    keywords: ['seabank']
  },
  {
    id: 'blu',
    name: 'blu by BCA Digital',
    short: 'blu',
    type: 'digital_bank',
    color: '#00B4D8',
    accent: '#0077B6',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['bcadigital.co.id'],
    keywords: ['blu by bca', 'bca digital']
  },
  {
    id: 'jenius',
    name: 'Jenius (SMBC/BTPN)',
    short: 'JNS',
    type: 'digital_bank',
    color: '#00A3E0',
    accent: '#005EB8',
    textColor: '#FFFFFF',
    motif: 'diamond',
    domains: ['jenius.com', 'btpn.com', 'smbci.com'],
    keywords: ['jenius', 'btpn', 'smbc']
  },
  {
    id: 'neobank',
    name: 'Bank Neo Commerce',
    short: 'BNC',
    type: 'digital_bank',
    color: '#FFD100',
    accent: '#111827',
    textColor: '#111827',
    motif: 'chevron',
    domains: ['bankneo.co.id'],
    keywords: ['neobank', 'bank neo']
  },
  {
    id: 'allobank',
    name: 'Allo Bank',
    short: 'ALLO',
    type: 'digital_bank',
    color: '#00C2A8',
    accent: '#008B74',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['allobank.com'],
    keywords: ['allo bank', 'allobank']
  },
  {
    id: 'superbank',
    name: 'Superbank',
    short: 'SUP',
    type: 'digital_bank',
    color: '#A3E635',
    accent: '#15803D',
    textColor: '#111827',
    motif: 'chevron',
    domains: ['superbank.id'],
    keywords: ['superbank']
  },
  {
    id: 'krom',
    name: 'Krom Bank',
    short: 'KROM',
    type: 'digital_bank',
    color: '#FACC15',
    accent: '#18181B',
    textColor: '#111827',
    motif: 'diamond',
    domains: ['krom.id'],
    keywords: ['krom bank', 'krom']
  },
  {
    id: 'linebank',
    name: 'LINE Bank (Hana)',
    short: 'LINE',
    type: 'digital_bank',
    color: '#06C755',
    accent: '#009944',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['linebank.co.id', 'hanabank.co.id'],
    keywords: ['line bank', 'hana bank']
  },
  {
    id: 'banksaqu',
    name: 'Bank Saqu',
    short: 'SAQU',
    type: 'digital_bank',
    color: '#FF5722',
    accent: '#7C3AED',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['banksaqu.co.id'],
    keywords: ['bank saqu', 'banksaqu']
  },

  // --- Syariah Banks ---
  {
    id: 'bsi',
    name: 'Bank Syariah Indonesia (BSI)',
    short: 'BSI',
    type: 'syariah',
    color: '#00A39D',
    accent: '#F7941D',
    textColor: '#FFFFFF',
    motif: 'hexagon',
    domains: ['bankbsi.co.id'],
    keywords: ['bsi', 'byond', 'bank syariah indonesia']
  },
  {
    id: 'muamalat',
    name: 'Bank Muamalat',
    short: 'BMI',
    type: 'syariah',
    color: '#5B2C6F',
    accent: '#9B59B6',
    textColor: '#FFFFFF',
    motif: 'diamond',
    domains: ['bankmuamalat.co.id'],
    keywords: ['muamalat']
  },
  {
    id: 'bcasyariah',
    name: 'BCA Syariah',
    short: 'BCAS',
    type: 'syariah',
    color: '#0066B3',
    accent: '#00A651',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['bcasyariah.co.id'],
    keywords: ['bca syariah']
  },
  {
    id: 'aladin',
    name: 'Bank Aladin Syariah',
    short: 'ALDN',
    type: 'syariah',
    color: '#7C3AED',
    accent: '#10B981',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['aladinbank.id'],
    keywords: ['aladin']
  },

  // --- Regional Banks (BPD) ---
  {
    id: 'bankdki',
    name: 'Bank DKI',
    short: 'DKI',
    type: 'bank',
    color: '#D32F2F',
    accent: '#F57C00',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['bankdki.co.id'],
    keywords: ['bank dki', 'jakone']
  },
  {
    id: 'bjb',
    name: 'Bank BJB',
    short: 'BJB',
    type: 'bank',
    color: '#005596',
    accent: '#FDB913',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['bankbjb.co.id'],
    keywords: ['bank bjb', 'digi by bank bjb']
  },
  {
    id: 'bankjateng',
    name: 'Bank Jateng',
    short: 'JTG',
    type: 'bank',
    color: '#005BAC',
    accent: '#ED1C24',
    textColor: '#FFFFFF',
    motif: 'grid',
    domains: ['bankjateng.co.id'],
    keywords: ['bank jateng', 'bima mobile']
  },
  {
    id: 'bankjatim',
    name: 'Bank Jatim',
    short: 'JTM',
    type: 'bank',
    color: '#E31E24',
    accent: '#111827',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['bankjatim.co.id'],
    keywords: ['bank jatim', 'jconnect']
  },

  // --- E-Wallets & Payment Apps ---
  {
    id: 'gopay',
    name: 'GoPay',
    short: 'GP',
    type: 'ewallet',
    color: '#00AA13',
    accent: '#00AED6',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['gojek.com', 'gopay.co.id', 'goto.com'],
    keywords: ['gopay', 'gojek']
  },
  {
    id: 'ovo',
    name: 'OVO',
    short: 'OVO',
    type: 'ewallet',
    color: '#4C2A86',
    accent: '#7E57C2',
    textColor: '#FFFFFF',
    motif: 'circle',
    domains: ['ovo.id'],
    keywords: ['ovo']
  },
  {
    id: 'dana',
    name: 'DANA',
    short: 'DANA',
    type: 'ewallet',
    color: '#118EEA',
    accent: '#38BDF8',
    textColor: '#FFFFFF',
    motif: 'wave',
    domains: ['dana.id'],
    keywords: ['dana']
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    short: 'SPay',
    type: 'ewallet',
    color: '#EE4D2D',
    accent: '#FB923C',
    textColor: '#FFFFFF',
    motif: 'chevron',
    domains: ['shopee.co.id', 'shopeepay.co.id'],
    keywords: ['shopeepay', 'shopee']
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    short: 'LA',
    type: 'ewallet',
    color: '#E82529',
    accent: '#991B1B',
    textColor: '#FFFFFF',
    motif: 'hexagon',
    domains: ['linkaja.id'],
    keywords: ['linkaja']
  },
  {
    id: 'astrapay',
    name: 'AstraPay',
    short: 'APay',
    type: 'ewallet',
    color: '#0047AB',
    accent: '#00A3E0',
    textColor: '#FFFFFF',
    motif: 'diamond',
    domains: ['astrapay.com'],
    keywords: ['astrapay']
  },
  {
    id: 'flip',
    name: 'Flip',
    short: 'FLIP',
    type: 'ewallet',
    color: '#FD6542',
    accent: '#FF9A76',
    textColor: '#FFFFFF',
    motif: 'ribbon',
    domains: ['flip.id'],
    keywords: ['flip']
  },

  // --- Cash ---
  {
    id: 'cash',
    name: 'Cash Wallet',
    short: 'CASH',
    type: 'cash',
    color: '#10B981',
    accent: '#34D399',
    textColor: '#052E16',
    motif: 'grid',
    domains: [],
    keywords: ['cash', 'tunai', 'dompet tunai']
  }
];

export const INSTITUTION_TYPE_LABELS = {
  bank: 'Bank',
  digital_bank: 'Digital Bank',
  syariah: 'Syariah',
  ewallet: 'E-Wallet',
  cash: 'Cash'
};

export function findInstitution({ name = '', sender = '', body = '' } = {}) {
  const senderLower = sender.toLowerCase();
  const nameLower = name.toLowerCase();
  const bodyHead = body.slice(0, 600).toLowerCase();

  // 1. Exact domain match (highest reliability for Gmail)
  if (senderLower) {
    const byDomain = INDONESIAN_INSTITUTIONS.find((inst) =>
      inst.domains.some((d) => senderLower.includes(d))
    );
    if (byDomain) return byDomain;
  }

  // 2. Exact or partial wallet/bank name match
  if (nameLower) {
    const byName = INDONESIAN_INSTITUTIONS.find(
      (inst) =>
        inst.name.toLowerCase() === nameLower ||
        inst.id === nameLower ||
        nameLower.includes(inst.name.toLowerCase()) ||
        inst.keywords.some((kw) => nameLower.includes(kw))
    );
    if (byName) return byName;
  }

  // 3. Body keyword fallback
  if (bodyHead) {
    const byBody = INDONESIAN_INSTITUTIONS.find((inst) =>
      inst.keywords.some((kw) => bodyHead.includes(kw))
    );
    if (byBody) return byBody;
  }

  return null;
}
