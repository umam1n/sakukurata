# Sakukurata — Personal Finance & Flexible Budget Workspace

A modern, cross-platform personal finance manager with a **compact desktop-first Web App (Vercel)** and a **Native Android App (Kotlin + Jetpack Compose)**—both synced in real time through a single free **Firebase Spark** backend.

Built for everyday public use with **zero manual SQL setup**: users sign up with Email or Google (or try Local Guest Mode immediately), complete a 3-step skippable onboarding, and customize every budget bucket, wallet, and shortcut anytime.

---

## Key Features

- **Compact Desktop Workspace & Responsive Mobile UI**: Slim icon-rail sidebar, 4-card KPI strip, multi-column bento dashboard, and clean mobile navigation.
- **Theme & Color Palette Customizer**: Dark / Light mode toggle, 8 accent presets (*Emerald, Lavender, Cyan, Rose, Amber, Indigo, Peach, Mint*), plus a custom hex color picker.
- **Fluid 100% Budget Allocator**: Start from a template (*40-20-20-10-10*, *50-30-20*, *60-25-15*, or *Blank*), rename/add/remove buckets anytime, use the **Auto-Fit 100%** balancer, and preview splits with an interactive Income Simulator.
- **40+ Indonesian Banks & E-Wallets with Branded SVG Emblems**: Searchable directory covering national, private, digital (*Bank Jago, SeaBank, blu, Jenius, Neo, Allo, Superbank, Krom, LINE Bank, Bank Saqu*), Syariah (*BSI, Muamalat, BCA Syariah, Aladin*), regional BPDs, and e-wallets (*GoPay, OVO, DANA, ShopeePay, LinkAja, AstraPay, Flip*)—with inline editing and live thousands formatting.
- **Serverless Gmail Bank Receipt Importer**: Connects directly in the browser via Google OAuth (`gmail.readonly`) with **strict promo/newsletter/OTP filtering**, expense vs. income detection, duplicate prevention, and **smart merchant auto-assignment** (e.g. *MRT, TransJakarta, Grab, Gojek* → Transportation; *GoFood, GrabFood, Famima, Kantin, Es Teh* → Food & Dining; undecided receipts default to Food & Dining).
- **Savings Goals, Recurring Bills & CSV Export**: Track wishlist milestones with quick top-ups, toggle monthly bill status (*Paid / Due*), and export transaction history to CSV.
- **Multi-Tenant Privacy**: Strict per-user Firestore Security Rules (`users/{uid}/**`) + built-in offline caching.

---

## Architecture

```text
[Vercel Web App (React + Vite + Tailwind)] ──┐
                                              ├──► [Firebase Auth + Cloud Firestore (Spark Free)]
[Native Android (Kotlin + Jetpack Compose)] ──┘
```

### Repository Layout
- `src/` — React 18 + Vite + Tailwind CSS + Recharts + Firebase Web SDK (deployed on Vercel)
- `android/` — Standalone Kotlin + Jetpack Compose + Material 3 + Firebase Android SDK
- `firestore.rules` — Per-user Firestore security rules (`request.auth.uid == userId`)
- `FIREBASE_SETUP.md` — Step-by-step Firebase Spark ($0) + Vercel setup checklist
- `.github/workflows/build.yml` — Automated Web build & Android Debug APK CI workflow

---

## Quick Start

### 1. Firebase Setup ($0 Spark Plan)
Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
1. Create a Firebase project and enable **Email/Password** & **Google** sign-in.
2. Create **Cloud Firestore** and publish [`firestore.rules`](./firestore.rules).
3. *(Optional for live Gmail scanning)* Enable **Gmail API** in Google Cloud Console for your Firebase project.

### 2. Run Web App Locally / Deploy to Vercel
```bash
cp .env.example .env.local   # fill in your VITE_FIREBASE_* values
npm install
npm run dev                  # local dev server
npm run build                # production build for Vercel
```
To deploy on **Vercel**, import this repository, add the `VITE_FIREBASE_*` keys under **Project Settings → Environment Variables**, and whitelist your Vercel domain under **Firebase → Authentication → Settings → Authorized domains**.

### 3. Build Native Android APK
1. Download `google-services.json` for package `com.financialapp.manager` from Firebase Console and place it in `android/app/google-services.json` *(or build without it to test in Local Mode)*.
2. Build the debug APK:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Credits
- Forked and redesigned by **@umam1n** from the original personal finance concept by **@Dexiusss** (`Personal_Financial_App`), with desktop UI & theme palette inspiration from [yukinon](https://github.com/umam1n/yukinon).
