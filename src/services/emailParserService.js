// Serverless Indonesian Bank Receipt Parser & Strict Gmail Receipt Classifier
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { INDONESIAN_INSTITUTIONS, findInstitution } from '../utils/indonesianBanks';

const GMAIL_TOKEN_KEY = 'sakukurata_gmail_access_token';

// 1. Hard Reject Patterns (Promotions, Newsletters, OTPs, Security Alerts, Monthly Statements)
const PROMO_AND_NON_RECEIPT_PATTERNS = [
  /\b(promo|promosi|diskon|discount|cashback|voucher|kupon|coupon|hadiah|giveaway|undian)\b/i,
  /\b(penawaran|special offer|newsletter|unsubscribe|berhenti berlangganan|iklan|banner)\b/i,
  /\b(syarat\s*(&|dan)\s*ketentuan|terms\s*(and|&)\s*conditions|klaim sekarang|claim now|beli sekarang)\b/i,
  /\b(otp|kode verifikasi|verification code|one-time password|login alert|perangkat baru|new device)\b/i,
  /\b(reset password|ubah kata sandi|ganti pin|aktivasi kartu|e-statement|billing statement|ringkasan bulanan)\b/i,
  /\b(selamat ulang tahun|happy birthday|survei|survey|undang teman|referral|invite friends)\b/i,
  /\b(cicilan 0%|bunga 0%|limit kredit|ajukan sekarang|apply now|upgrade sekarang|fitur baru)\b/i
];

// 2. Positive Transactional Receipt Proof (at least ONE must match to be considered a real receipt)
const RECEIPT_PROOF_PATTERNS = [
  /\b(transaksi berhasil|transfer berhasil|pembayaran berhasil|top[- ]?up berhasil|transaksi sukses)\b/i,
  /\b(status\s*:\s*(successful|berhasil|sukses|completed|paid))\b/i,
  /\b(payment to|total payment|jumlah transfer|total pembayaran|nominal transaksi|nominal top[- ]?up)\b/i,
  /\b(bukti transaksi|bukti pembayaran|bukti transfer|payment receipt|transaction receipt|e-receipt)\b/i,
  /\b(no\.?\s*referensi|ref\.?\s*no|reference number|rrn|retrieval reference)\b/i,
  /\b(qris payment|pembayaran qris|virtual account|bi-fast|bifast|debit card transaction)\b/i,
  /\b(anda telah melakukan transaksi|you just made a transaction|dana masuk|uang masuk)\b/i
];

// 3. Income / Credit Indicators
const INCOME_PATTERNS = [
  /\b(dana masuk|uang masuk|transfer masuk|credit notification|incoming transfer|telah diterima|saldo bertambah)\b/i,
  /\b(refund berhasil|pengembalian dana|gaji masuk|payroll)\b/i
];

const parseAmountString = (str) => {
  if (!str) return 0;
  let cleaned = str.trim().replace(/\s+/g, '');
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    cleaned = parts[parts.length - 1].length === 2 ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    cleaned = parts[parts.length - 1].length === 2 ? cleaned : cleaned.replace(/\./g, '');
  }
  return Math.round(parseFloat(cleaned)) || 0;
};

/**
 * Classifies whether an email is a genuine transaction receipt vs. promo/newsletter/OTP,
 * then extracts bank, merchant, amount, type (expense/income), and date.
 */
export const parseBankEmailText = (rawText, meta = {}) => {
  const { subject = '', from = '', listUnsubscribe = '', labelIds = [] } = meta;
  if (!rawText || typeof rawText !== 'string') return null;

  // Reject Gmail Promotions/Social/Spam labels immediately
  if (
    labelIds.includes('CATEGORY_PROMOTIONS') ||
    labelIds.includes('CATEGORY_SOCIAL') ||
    labelIds.includes('CATEGORY_FORUMS') ||
    labelIds.includes('SPAM')
  ) {
    return { isReceipt: false, rejectReason: 'Gmail Promo/Social category' };
  }

  // Reject marketing emails with List-Unsubscribe header UNLESS subject explicitly proves transaction receipt
  const subjectHasReceiptProof = RECEIPT_PROOF_PATTERNS.some((rx) => rx.test(subject));
  if (listUnsubscribe && !subjectHasReceiptProof) {
    return { isReceipt: false, rejectReason: 'Marketing newsletter (List-Unsubscribe)' };
  }

  const fullText = `${subject}\n${rawText}`.replace(/\s+/g, ' ').trim();
  const rawMultiline = `${subject}\n${rawText}`.trim();

  // Reject Promo / OTP / Security Alert / Statement emails
  const subjectAndHead = `${subject} ${rawText.slice(0, 320)}`;
  for (const rx of PROMO_AND_NON_RECEIPT_PATTERNS) {
    if (rx.test(subject) || (rx.test(subjectAndHead) && !subjectHasReceiptProof)) {
      return { isReceipt: false, rejectReason: 'Promo / Non-receipt alert' };
    }
  }

  // Require at least one positive transactional receipt signal
  const hasReceiptProof = RECEIPT_PROOF_PATTERNS.some((rx) => rx.test(fullText));
  if (!hasReceiptProof) {
    return { isReceipt: false, rejectReason: 'No transactional receipt proof' };
  }

  // Detect Indonesian Bank / E-Wallet
  const institution = findInstitution({ sender: from, body: rawMultiline });
  const walletName = institution?.name || 'Bank Account';
  const institutionId = institution?.id || null;

  // Detect Income vs Expense
  const txType = INCOME_PATTERNS.some((rx) => rx.test(fullText)) ? 'income' : 'expense';

  // Extract Amount (prioritize labeled totals over random numbers)
  let amount = 0;
  const amountRegexes = [
    /(?:Total Payment|Total Pembayaran|Jumlah Transfer|Nominal Transfer|Nominal Top[- ]?up|Total Tagihan|Total Bayar|Total Transaksi|Amount Paid|Jumlah Pembayaran)\s*(?::\s*)?(?:IDR|Rp\.?)?\s*([\d.,]+)/i,
    /(?:Nominal|Jumlah|Total|Amount|Sebesar)\s*(?::\s*)?(?:IDR|Rp\.?)\s*([\d.,]+)/i,
    /(?:IDR|Rp\.?)\s*([\d.,]{3,})/i
  ];
  for (const rx of amountRegexes) {
    const m = rawMultiline.match(rx);
    if (m && m[1]) {
      const parsedAmt = parseAmountString(m[1]);
      if (parsedAmt >= 100 && parsedAmt < 10_000_000_000) {
        amount = parsedAmt;
        break;
      }
    }
  }

  if (amount < 100) {
    return { isReceipt: false, rejectReason: 'No valid transaction amount detected' };
  }

  // Extract Merchant / Recipient
  let merchant = '';
  const merchantRegexes = [
    /(?:Payment to|Merchant Name|Nama Merchant|Merchant|Pembayaran ke|Bayar ke)\s*:\s*([^\n\r]+)/i,
    /(?:Penerima|Kepada|Beneficiary|Tujuan Transfer|Nama Penerima)\s*:\s*([^\n\r]+)/i,
    /(?:Penyedia Jasa|Biller|Produk)\s*:\s*([^\n\r]+)/i,
    /Penerima\s+([A-Z0-9][A-Za-z0-9\s.&'-]{2,45})/
  ];
  for (const rx of merchantRegexes) {
    const m = rawMultiline.match(rx);
    if (m && m[1]) {
      const cleaned = m[1]
        .replace(/\s+-\s+ID.*$/i, '')
        .replace(/\s+(?:Tanggal|Jam|Waktu|Status|Total|Nominal|No\.?\s*Ref).*$/i, '')
        .trim();
      if (cleaned.length >= 2 && !/^halo|^hello|^dear/i.test(cleaned)) {
        merchant = cleaned.slice(0, 60);
        break;
      }
    }
  }

  // Extract Transaction Method / Type Label
  let methodLabel = 'Bank Receipt';
  const typeMatch = rawMultiline.match(/(?:Transaction Type|Jenis Transaksi|Metode Pembayaran)\s*:\s*([^\n\r]+)/i);
  if (typeMatch) methodLabel = typeMatch[1].trim().slice(0, 40);
  else if (/qris/i.test(fullText)) methodLabel = 'QRIS Payment';
  else if (/bi-?fast/i.test(fullText)) methodLabel = 'BI-FAST Transfer';
  else if (/virtual account|va\b/i.test(fullText)) methodLabel = 'Virtual Account';
  else if (/top[- ]?up/i.test(fullText)) methodLabel = 'Top-Up';
  else if (/transfer/i.test(fullText)) methodLabel = 'Bank Transfer';

  // Extract Date
  let transactionDate = new Date().toISOString();
  const dateMatch = rawMultiline.match(
    /(?:Transaction Date|Tanggal Transaksi|Tanggal|Date)\s*(?::\s*)?([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4}(?:\s+[0-9]{2}:[0-9]{2}(?::[0-9]{2})?)?)/i
  );
  if (dateMatch) {
    const parsedDate = new Date(dateMatch[1].replace(/\bWIB|WITA|WIT\b/gi, '').trim());
    if (!Number.isNaN(parsedDate.getTime())) {
      transactionDate = parsedDate.toISOString();
    }
  }

  return {
    isReceipt: true,
    isParsedSuccess: true,
    type: txType,
    amount,
    recipientOrMerchant: merchant || `${walletName} ${methodLabel}`,
    transactionType: methodLabel,
    walletName,
    institutionId,
    transactionDate,
    rawText
  };
};

const decodeBase64Url = (data) => {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
};

const extractEmailBody = (payload) => {
  if (!payload) return '';
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ');
  }
  if (Array.isArray(payload.parts)) {
    const plain = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    return payload.parts.map((p) => extractEmailBody(p)).filter(Boolean).join('\n');
  }
  return '';
};

export const getStoredGmailToken = () => sessionStorage.getItem(GMAIL_TOKEN_KEY) || '';

export const connectGmailOAuth = async () => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please sign in with Firebase first.');
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.setCustomParameters({ prompt: 'consent' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error('Google did not grant Gmail read access. Please check the Gmail permission box and retry.');
  }

  sessionStorage.setItem(GMAIL_TOKEN_KEY, accessToken);
  return accessToken;
};

/**
 * Fetches & strictly classifies Indonesian bank/e-wallet receipts from Gmail,
 * filtering out promotions, newsletters, OTPs, and already-imported emails.
 */
export const fetchBankEmailsFromGmail = async (accessToken, { days = 30, existingGmailIds = new Set() } = {}) => {
  const token = accessToken || getStoredGmailToken();
  if (!token) {
    throw new Error('Gmail is not connected yet. Click "Connect Gmail" first.');
  }

  // Build strict server-side Gmail search query: exclude Promotions/Social/Forums + promo subjects
  const topDomains = INDONESIAN_INSTITUTIONS.flatMap((i) => i.domains).slice(0, 28);
  const domainQuery = topDomains.map((d) => `from:${d}`).join(' OR ');
  const rawQuery = [
    `newer_than:${days}d`,
    '-category:promotions',
    '-category:social',
    '-category:forums',
    '-subject:(promo OR diskon OR cashback OR voucher OR kupon OR OTP OR verifikasi OR newsletter OR penawaran OR "e-statement")',
    `((${domainQuery}) OR ("Transfer Berhasil" OR "Transaksi Berhasil" OR "Pembayaran Berhasil" OR "Payment to" OR "Bukti Transaksi" OR "QRIS Payment" OR "Your Grab E-Receipt" OR "Gojek Receipt" OR "GoFood" OR "GrabFood" OR "Bluebird"))`
  ].join(' ');

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${encodeURIComponent(rawQuery)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (listRes.status === 401) {
    sessionStorage.removeItem(GMAIL_TOKEN_KEY);
    throw new Error('Gmail session expired. Please click "Connect Gmail" again.');
  }

  if (listRes.status === 403) {
    throw new Error(
      'Gmail API is not enabled on Google Cloud project sakukurata-67 yet. Enable "Gmail API" in Google Cloud Console, then retry.'
    );
  }

  if (!listRes.ok) {
    throw new Error(`Gmail API error (${listRes.status}). Please try again.`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];
  if (messages.length === 0) {
    return { receipts: [], stats: { scanned: 0, receiptsFound: 0, promosFiltered: 0, duplicatesSkipped: 0 } };
  }

  let promosFiltered = 0;
  let duplicatesSkipped = 0;
  const receipts = [];

  const details = await Promise.all(
    messages.map(async (m) => {
      if (existingGmailIds.has(m.id)) {
        duplicatesSkipped += 1;
        return null;
      }
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      return res.json();
    })
  );

  for (const detail of details) {
    if (!detail) continue;
    const headers = detail.payload?.headers || [];
    const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const listUnsubscribe = getHeader('List-Unsubscribe');
    const internalDate = detail.internalDate ? new Date(Number(detail.internalDate)).toISOString() : null;
    const rawBody = `${detail.snippet || ''}\n${extractEmailBody(detail.payload)}`;

    const parsed = parseBankEmailText(rawBody, {
      subject,
      from,
      listUnsubscribe,
      labelIds: detail.labelIds || []
    });

    if (!parsed || !parsed.isReceipt) {
      promosFiltered += 1;
      continue;
    }

    receipts.push({
      id: detail.id,
      subject,
      from,
      parsed: {
        ...parsed,
        transactionDate: internalDate || parsed.transactionDate
      }
    });
  }

  return {
    receipts,
    stats: {
      scanned: messages.length,
      receiptsFound: receipts.length,
      promosFiltered,
      duplicatesSkipped
    }
  };
};
