// Serverless Bank Email Receipt Parser & Direct Browser Gmail API Client (No Backend Server Needed)
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const GMAIL_TOKEN_KEY = 'sakukurata_gmail_access_token';

const PROMO_KEYWORDS = [
  'promo', 'discount', 'voucher', 'cashback', 'newsletter', 'unsubscribe',
  'penawaran', 'undangan', 'kupon', 'hadiah', 'gratis', 'syarat & ketentuan'
];

export const parseBankEmailText = (rawText, subject = '') => {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = `${subject}\n${rawText}`.trim();
  const lowerHead = text.slice(0, 260).toLowerCase();
  if (PROMO_KEYWORDS.some((kw) => lowerHead.includes(kw))) {
    return null;
  }

  let amount = 0;
  let recipientOrMerchant = '';
  let transactionType = '';
  let walletName = '';
  let transactionDate = new Date().toISOString();

  // 1. myBCA
  if (/myBCA|Customer PAN|Merchant Location|Payment to\s*:/i.test(text)) {
    walletName = 'Bank BCA';
    const typeMatch = text.match(/Transaction Type\s*:\s*(.+)/i);
    if (typeMatch) transactionType = typeMatch[1].trim();

    const merchantMatch = text.match(/Payment to\s*:\s*(.+)/i);
    if (merchantMatch) recipientOrMerchant = merchantMatch[1].trim();

    const amountMatch = text.match(/Total Payment\s*:\s*(?:IDR|Rp)?\s*([\d.,]+)/i);
    if (amountMatch) amount = parseAmountString(amountMatch[1]);

    const dateMatch = text.match(/Transaction Date\s*:\s*(.+)/i);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1].trim());
      if (!Number.isNaN(parsedDate.getTime())) transactionDate = parsedDate.toISOString();
    }
  }
  // 2. Bank Mandiri
  else if (/Bank Mandiri|Transfer Berhasil|Rekening Sumber|Pembayaran Berhasil/i.test(text)) {
    walletName = 'Bank Mandiri';
    transactionType = 'Bank Transfer';

    const amountMatch = text.match(/(?:Jumlah Transfer|Nominal|Total)\s*(?::\s*)?(?:Rp|IDR)?\s*([\d.,]+)/i);
    if (amountMatch) amount = parseAmountString(amountMatch[1]);

    const penerimaMatch = text.match(/Penerima\s*(?::\s*)?([^\n\r]+)/i);
    if (penerimaMatch) recipientOrMerchant = penerimaMatch[1].trim();
  }
  // 3. Generic / E-Wallet / Other Banks
  else {
    if (/gopay/i.test(text)) walletName = 'GoPay';
    else if (/ovo/i.test(text)) walletName = 'OVO';
    else if (/dana/i.test(text)) walletName = 'DANA';
    else if (/shopeepay/i.test(text)) walletName = 'ShopeePay';
    else if (/bri/i.test(text)) walletName = 'Bank BRI';
    else if (/bni/i.test(text)) walletName = 'Bank BNI';

    const amountMatch =
      text.match(/(?:Jumlah|Total|Nominal|Amount|Paid|Payment|Bayar)\s*(?::\s*)?(?:Rp|IDR)?\s*([\d.,]+)/i) ||
      text.match(/(?:Rp|IDR)\s*([\d.,]+)/i);
    if (amountMatch) amount = parseAmountString(amountMatch[1]);

    const merchantMatch = text.match(/(?:Penerima|Payment to|Merchant|Kepada|Store|To)\s*(?::\s*)?([^\n\r]+)/i);
    if (merchantMatch) recipientOrMerchant = merchantMatch[1].trim();

    const typeMatch = text.match(/(?:Jenis Transaksi|Transaction Type|Type)\s*(?::\s*)?([^\n\r]+)/i);
    if (typeMatch) transactionType = typeMatch[1].trim();
  }

  return {
    rawText,
    amount,
    recipientOrMerchant: recipientOrMerchant || subject || 'Email Transaction',
    transactionType: transactionType || 'Bank Notification',
    walletName: walletName || 'Bank Account',
    transactionDate,
    isParsedSuccess: amount > 0
  };
};

const parseAmountString = (str) => {
  if (!str) return 0;
  let cleaned = str.trim();
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
    return decodeBase64Url(payload.body.data).replace(/<[^>]*>/g, ' ');
  }
  if (Array.isArray(payload.parts)) {
    const plain = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    return payload.parts
      .map((p) => extractEmailBody(p))
      .filter(Boolean)
      .join('\n');
  }
  return '';
};

export const getStoredGmailToken = () => sessionStorage.getItem(GMAIL_TOKEN_KEY) || '';

/**
 * Connects Gmail directly in the browser via Firebase Google OAuth + gmail.readonly scope.
 * Works 100% serverless on Vercel ($0, no backend needed).
 */
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
    throw new Error('Google did not return a Gmail access token. Please allow Gmail read access and try again.');
  }

  sessionStorage.setItem(GMAIL_TOKEN_KEY, accessToken);
  return accessToken;
};

/**
 * Fetches recent bank notification emails directly from Gmail REST API v1.
 */
export const fetchBankEmailsFromGmail = async (accessToken) => {
  const token = accessToken || getStoredGmailToken();
  if (!token) {
    throw new Error('Gmail is not connected yet. Click "Connect Gmail" first.');
  }

  const query = encodeURIComponent(
    '(myBCA OR "Bank Mandiri" OR "Transfer Berhasil" OR "Payment to" OR QRIS OR GoPay OR OVO OR DANA OR "Bank BRI" OR "Bank BNI")'
  );

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12&q=${query}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (listRes.status === 401) {
    sessionStorage.removeItem(GMAIL_TOKEN_KEY);
    throw new Error('Gmail session expired. Please click "Connect Gmail" again.');
  }

  if (listRes.status === 403) {
    throw new Error(
      'Gmail API is not enabled on your Google Cloud project yet. Enable "Gmail API" in Google Cloud Console for project sakukurata-67, then retry.'
    );
  }

  if (!listRes.ok) {
    throw new Error(`Gmail API error (${listRes.status}). Please try again.`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];
  if (messages.length === 0) return [];

  const detailed = await Promise.all(
    messages.map(async (m) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();
      const headers = detail.payload?.headers || [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || 'Bank Notification';
      const from = headers.find((h) => h.name === 'From')?.value || '';
      const rawBody = `${detail.snippet || ''}\n${extractEmailBody(detail.payload)}`;
      const parsed = parseBankEmailText(rawBody, subject);
      if (!parsed || !parsed.isParsedSuccess) return null;

      return {
        id: m.id,
        subject,
        from,
        rawBody,
        parsed
      };
    })
  );

  return detailed.filter(Boolean);
};
