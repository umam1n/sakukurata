# Sakukurata — Free Firebase + Vercel Setup Guide

Sakukurata uses **one shared Firebase Spark ($0) project** for both the **Vercel Web App** and the **Native Kotlin Android App**. End-users never run SQL or configure a database—they just register, complete the 3-step onboarding, and their data is isolated under `users/{uid}/`.

---

## 1. Create a Free Firebase Project (2 Minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project** → name it `sakukurata` (Spark Free plan, no credit card needed).
2. **Enable Authentication**:
   - Left menu → **Build → Authentication → Get Started**
   - Enable **Email/Password**
   - Enable **Google** (pick your support email)
3. **Create Firestore Database**:
   - Left menu → **Build → Firestore Database → Create database**
   - Choose a region close to your users (e.g., `asia-southeast2` Jakarta or `asia-southeast1` Singapore)
   - Start in **Production mode**
   - Open the **Rules** tab and paste the contents of [`firestore.rules`](./firestore.rules), then click **Publish**.

---

## 2. Connect the Vercel Web App

1. In Firebase Console → **Project Settings (gear icon) → Your apps → Web (`</>`)** → register `sakukurata-web`.
2. Copy the config values into **Vercel → Project Settings → Environment Variables** (or `.env.local` for local dev):
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. In Firebase Console → **Authentication → Settings → Authorized domains**, add your Vercel domain (e.g., `sakukurata.vercel.app`) so Google Sign-In works in production.
4. Push to GitHub (`umam1n/sakukurata`) and import the repo in [Vercel](https://vercel.com/new) — `vercel.json` is already configured.

---

## 3. Unified Firestore Schema (Shared by Web & Kotlin Android)

All documents live under `users/{uid}` and are protected by `request.auth.uid == userId`:

| Path | Fields |
| :--- | :--- |
| `users/{uid}` | `displayName`, `email`, `baseSalary`, `paydayDate`, `currency`, `onboardingCompleted`, `createdAt`, `updatedAt` |
| `users/{uid}/buckets/{id}` | `name`, `percentage`, `color`, `icon`, `sortOrder` |
| `users/{uid}/wallets/{id}` | `name`, `type`, `balance`, `color` |
| `users/{uid}/transactions/{id}` | `type` (`expense`\|`income`), `amount`, `bucketId`, `bucketName`, `walletId`, `walletName`, `merchant`, `notes`, `transactionDate`, `createdAt` |
| `users/{uid}/quickActions/{id}` | `title`, `amount`, `bucketId`, `bucketName`, `walletId`, `color`, `icon` |
| `users/{uid}/goals/{id}` | `title`, `targetAmount`, `currentAmount`, `targetDate`, `color` |
| `users/{uid}/bills/{id}` | `title`, `amount`, `dueDay`, `bucketId`, `walletId`, `isPaid` |

---

## 4. Connect the Kotlin Android App (Phase 2)

1. In Firebase Console → **Project Settings → Your apps → Android**
2. Package name: `com.financialapp.manager`
3. Download `google-services.json` and place it in `android/app/google-services.json` (this file is gitignored or kept private).
