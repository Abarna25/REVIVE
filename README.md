# REVIVE™ — An Explainable Autonomous Revenue Recovery Engine

> **Do not blindly chase every failed payment. Simulate recovery paths and rescue the right revenue, using the right intervention, at the right time.**

REVIVE™ is an enterprise-grade AI SaaS application that detects revenue at risk, creates a temporary **Revenue Rescue Twin** for each recovery event, simulates candidate recovery strategies in parallel, ranks them using the **Expected Net Recovery Score (ENRS)** formula, enforces safety boundaries via **Recovery Fatigue Guard™**, and manages the full payment lifecycle with explicit financial accuracy.

---

## ⚡ Core Autonomous Intelligence Loop

```text
  ┌─────────┐      ┌─────────┐      ┌──────────┐      ┌─────────┐
  │ DETECT  │ ───► │  TWIN   │ ───► │ SIMULATE │ ───► │ DECIDE  │
  └─────────┘      └─────────┘      └──────────┘      └─────────┘
                                                           │
  ┌─────────┐      ┌─────────┐      ┌──────────┐      ┌────▼────┐
  │  LEARN  │ ◄─── │ VERIFY  │ ◄─── │   ACT    │ ◄─── │  GUARD  │
  └─────────┘      └─────────┘      └──────────┘      └─────────┘
```

1. **DETECT**: Ingests payment failures, overdue invoices, and abandoned checkouts in real-time.
2. **TWIN**: Constructs an ephemeral **Revenue Rescue Twin** contextualizing payment history, engagement score, and fatigue level.
3. **SIMULATE**: Runs multi-path simulations across candidate recovery strategies (`RETRY_OPTIMAL_TIME`, `PAYMENT_LINK`, `ALTERNATE_PAYMENT`, `DISCOUNT_INCENTIVE`, `STOP_INTERVENTION`).
4. **DECIDE**: Ranks strategies deterministically using Expected Net Recovery Score (ENRS).
5. **GUARD**: Evaluates deterministic safety gates (Fatigue Guard™, max retries, minimum ENRS, manual approval threshold).
6. **ACT**: Executes payment retry or sends payment link via Razorpay / Simulation API.
7. **VERIFY**: Enforces explicit payment confirmation (`POST /confirm-payment`) before revenue is counted as `RECOVERED`.
8. **LEARN**: Records outcome telemetry to tune future recovery probability predictions.

---

## 🛡️ Recovery Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> DETECTED
    DETECTED --> ANALYZING: Risk Ingestion
    ANALYZING --> SIMULATED: Rescue Twin Created
    SIMULATED --> DECIDED: ENRS Ranking
    DECIDED --> AWAITING_APPROVAL: Approval Threshold (> ₹10k)
    AWAITING_APPROVAL --> READY_TO_EXECUTE: Merchant Approves
    DECIDED --> READY_TO_EXECUTE: Autonomous Approved
    DECIDED --> STOPPED: STOP_INTERVENTION
    READY_TO_EXECUTE --> EXECUTING: Trigger Payment Call
    EXECUTING --> AWAITING_PAYMENT_CONFIRMATION: Link / Retry Created
    AWAITING_PAYMENT_CONFIRMATION --> RECOVERED: Payment Confirmed (POST /confirm-payment)
    AWAITING_PAYMENT_CONFIRMATION --> FAILED_GRACEFULLY: Link Expired / Timeout
    EXECUTING --> FAILED_GRACEFULLY: Gateway Error
```

---

## 🧮 Expected Net Recovery Score (ENRS) Formula

The engine evaluates candidate recovery pathways using a deterministic financial equation:

$$\text{ENRS} = \left(\text{Predicted Recovery Probability} \times \text{Revenue Amount}\right) - \text{Intervention Cost} - \text{Recovery Fatigue Penalty}$$

- **High-probability, low-cost pathways win.**
- If all strategies produce negative ENRS or exceed customer fatigue limits, the system selects **`STOP_INTERVENTION`** to protect customer lifetime value.

---

## 💳 Financial Accuracy Guarantee

> **Creating a payment link is NOT the same as recovering money.**

1. Triggering an action moves the recovery case to **`AWAITING_PAYMENT_CONFIRMATION`** with `recoveredAmount = ₹0` and `netRevenueSaved = ₹0`.
2. Revenue is counted as **`RECOVERED` ONLY** when explicitly confirmed via the backend verification endpoint:
   `POST /api/recovery-cases/:id/confirm-payment`
3. Prevents duplicate charges and eliminates fake financial telemetry.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router v6
- **Backend API**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL (Supabase / Render) with automatic fallback to REVIVE™ Dual In-Memory Database Adapter
- **Payment Gateway**: Razorpay Test Mode API & Simulation Mode
- **Testing**: Node.js Built-in Test Runner (`node:test`)

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
# Clone repository
git clone https://github.com/Abarna25/REVIVE.git
cd REVIVE

# Install server & client dependencies
npm --prefix server install
npm --prefix client install
```

### 2. Environment Setup
Create a `.env` file in `server/` (or copy `.env.example`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PAYMENT_MODE=simulation
DEMO_MODE=true
```

### 3. Run Automated Tests
```bash
npm --prefix server test
```

### 4. Launch Application
```bash
# Terminal 1: Backend Express API (Port 5000)
npm --prefix server run dev

# Terminal 2: Vite React Frontend (Port 5173)
npm --prefix client run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Cloud Deployment Instructions

### Backend (Render / Railway / Heroku)
1. Set Root Directory to `server`.
2. Build Command: `npm install && npx prisma generate`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `DATABASE_URL=postgresql://postgres:...@db.supabase.co:5432/postgres`

### Database (Supabase PostgreSQL)
```bash
cd server
npx prisma db push
```

### Frontend (Vercel / Netlify)
1. Set Root Directory to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variable:
   - `VITE_API_URL=https://your-backend.onrender.com`

---

## 📄 License
MIT © REVIVE™ Team
