# REVIVE™ — An Explainable Autonomous Revenue Recovery Engine

> **Hackathon Edition • AI-Native Fintech Revenue Recovery Platform**

REVIVE™ is an enterprise-grade autonomous revenue recovery engine. Unlike generic payment reminder apps or naive retry scripts, REVIVE™ instantiates a **Revenue Rescue Twin** for every revenue-at-risk event, simulates multiple recovery pathways, computes deterministic **Expected Net Recovery Scores (ENRS)**, enforces merchant **Safety Gates** and **Recovery Fatigue Guard™**, executes or simulates bounded interventions via **Razorpay Test Mode**, and produces immutable **Explainable Decision Receipts™**.

---

## Central Innovation: The Revenue Rescue Twin

**Do not blindly chase every failed payment. Simulate recovery paths and rescue the right revenue, using the right intervention, at the right time.**

REVIVE™ follows a unique 8-stage intelligence loop:

```text
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  DETECT  │───►│   TWIN   │───►│ SIMULATE │───►│  DECIDE  │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
  ┌──────────┐    ┌──────────┐    ┌──────────┐         ▼
  │  LEARN   │◄───│  VERIFY  │◄───│   ACT    │◄───┌──────────┐
  └──────────┘    └──────────┘    └──────────┘    │  GUARD   │
                                                  └──────────┘
```

1. **DETECT**: Ingests payment failures, abandoned checkouts, and overdue invoices.
2. **TWIN**: Instantiates a contextual Revenue Rescue Twin (history score, engagement level, fatigue score).
3. **SIMULATE**: Evaluates 7 candidate strategies (`RETRY_NOW`, `RETRY_OPTIMAL_TIME`, `PAYMENT_LINK`, `ALTERNATE_PAYMENT`, `PERSONALIZED_REMINDER`, `MANUAL_ESCALATION`, `STOP_INTERVENTION`).
4. **DECIDE**: Computes Expected Net Recovery Score:  
   $$\text{ENRS} = (\text{Predicted Recovery Prob} \times \text{Revenue Amount}) - \text{Cost} - \text{Fatigue Penalty}$$
5. **GUARD**: Checks Recovery Fatigue Guard™ & Merchant Safety Gates.
6. **ACT**: Executes bounded recovery via Razorpay Test Mode or Simulation with Idempotency Key protection.
7. **VERIFY**: Validates outcome and issues an Explainable Recovery Receipt™.
8. **LEARN**: Updates historical strategy accuracy telemetry.

---

## 🚀 Key Features & Architectural Highlights

- **8 Core Operation Pages**:
  1. **Executive Dashboard**: High-level KPIs, live case stream, velocity charts.
  2. **Revenue Radar**: Stream of all detected events with search and filters.
  3. **Recovery Twin Lab**: Signature visual node graph & strategy matrix.
  4. **Decision Receipt**: Audit-ready receipt modal with root cause & safety breakdown.
  5. **Control Center**: Queues for high-value manual approvals and pending actions.
  6. **Audit Trail**: Append-only chronological system event log.
  7. **Batch Analytics**: Empirical performance metrics across 100+ synthetic events.
  8. **Settings & Safety**: Configurable merchant limits & stopping rules.

- **Mandatory Demo Scenario (Graceful Failure)**:
  Simulates a gateway response timeout during execution. System detects the failure, preserves the audit trail, locks idempotency to prevent duplicate charges, and alerts operator cleanly:  
  `Action Failed Gracefully → No duplicate charge → Case safely preserved for review`

- **Dual Mode Resiliency**:
  - Payment Execution: Razorpay Test Mode API & Simulation Mode.
  - AI Explanations: Google Gemini 1.5 API & Deterministic Fallback Engine.
  - Database: Prisma PostgreSQL (Supabase / Postgres) & Dual In-Memory Store.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6.
- **Backend**: Node.js, Express.js, Prisma ORM.
- **Database**: PostgreSQL / Supabase PostgreSQL.
- **AI Layer**: Google Gemini API & Deterministic Evidence Model.
- **Payments**: Razorpay Test Mode API.

---

## 📦 Monorepo Directory Structure

```text
REVIVE_Razorpay/
├── client/                      # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/          # TwinVisualizer, StrategyMatrix, DecisionReceiptModal, etc.
│   │   ├── pages/               # 8 Core Operation Pages
│   │   ├── services/            # Centralized API Client (VITE_API_URL)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express + Prisma Backend
│   ├── src/
│   │   ├── config/              # Env & Prisma Client
│   │   ├── engines/             # Detection, Diagnosis, Twin, Scoring, Safety, AI, Learning
│   │   ├── integrations/        # Razorpay Test Mode Client & Fallback Simulation
│   │   ├── repositories/        # Dual Prisma & Memory Database Adapter
│   │   ├── controllers/         # Events, Cases, Twin, Strategy, Action, Safety, Audit, Analytics
│   │   ├── routes/              # REST Endpoints
│   │   └── app.js               # Express Entry & Health Endpoint
│   ├── prisma/
│   │   ├── schema.prisma        # 9 Core Relational Models
│   │   └── seed.js              # Seeds 100+ Realistic Synthetic Events
│   ├── .env.example
│   └── package.json
│
├── package.json                 # Monorepo Workspace Scripts
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Variables

Create `server/.env` based on `server/.env.example`:

```env
NODE_ENV=development
PORT=5000

# Optional: Supabase / PostgreSQL Connection String
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:xxx@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

FRONTEND_URL=http://localhost:5173

# Optional: Razorpay Test Mode Credentials
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
PAYMENT_MODE=simulation

# Optional: Google Gemini API Key
AI_API_KEY=your_gemini_key_here
AI_MODE=enabled
```

Create `client/.env` based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Initialize Prisma Database & Seed 100+ Events

```bash
npm run prisma:generate
npm run prisma:seed
```

*(Note: If DATABASE_URL is not set, REVIVE™ automatically utilizes its Dual Memory Store pre-seeded with 100+ events out of the box!)*

### 4. Run Development Servers

Run backend and frontend concurrently:

```bash
# Terminal 1: Express Server (Port 5000)
npm run dev:server

# Terminal 2: React Client (Port 5173)
npm run dev:client
```

Open `http://localhost:5173` in your browser.

---

## 📡 REST API Endpoint Summary

### Health Check
- `GET /health` — Cloud deployment health check (`{ status: "ok", service: "REVIVE API" }`)

### Revenue Events
- `GET /api/events` — Retrieve all detected events
- `GET /api/events/:id` — Get event details
- `POST /api/events/ingest` — Ingest custom revenue event

### Recovery Cases & Twins
- `GET /api/recovery-cases` — List all recovery cases
- `GET /api/recovery-cases/:id` — Get case details
- `POST /api/recovery-cases/:id/analyze` — Run AI diagnosis & reasoning
- `GET /api/recovery-cases/:id/twin` — Get Revenue Rescue Twin
- `POST /api/recovery-cases/:id/simulate` — Re-run 7 strategy pathways simulation

### Actions & Safety
- `POST /api/recovery-cases/:id/execute` — Execute optimal strategy (with Idempotency Key)
- `POST /api/recovery-cases/:id/approve` — Merchant manual approval
- `POST /api/recovery-cases/:id/stop` — Stop recovery workflow
- `GET /api/recovery-policy/policy` — Get merchant policy
- `PUT /api/recovery-policy/policy` — Update safety gate thresholds

### Analytics & Audit
- `GET /api/analytics/dashboard` — Executive summary KPIs
- `GET /api/analytics/batch-performance` — 100+ events batch metrics
- `POST /api/demo/reset-seed` — Reload 100+ synthetic demo events
- `GET /api/audit` — Get chronological audit logs

---

## ☁️ Deployment Architecture

- **Frontend**: Deploy `client/` to **Vercel** (`npm run build` -> `dist/`).
- **Backend**: Deploy `server/` to **Render** / **Railway** (`npm start`).
- **Database**: Managed **Supabase PostgreSQL** via Prisma ORM.

Set `VITE_API_URL` on Vercel and `FRONTEND_URL` + `DATABASE_URL` on Render/Railway.

---
