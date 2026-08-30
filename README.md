# Gemini Growth Journal 🚀

> **Tagline:** *"Reflect. Understand. Grow."*

Gemini Growth Journal is a production-grade AI Life & Career Copilot and personal reflection workspace. It converts unstructured thoughts, dilemmas, and retrospectives into structured, measurable goals, providing intelligent tagging, authentic growth analytics, and on-demand weekly reviews.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (React 19 + Vite)                  │
│  - Google Sign-In with verified User Identity Context                       │
│  - Multi-Turn Reflection Dialogue with Gemini                               │
│  - Feature 1: AI Reflection → Action Plan (Structured Extraction)          │
│  - Feature 2: Personal Growth Dashboard (Authentic Domain Metrics)          │
│  - Feature 3: Weekly AI Review (Executive Reflection Synthesis)             │
│  - Feature 4: Smart Contextual Tagging (#leadership, #deepwork)             │
│  - Partitioned User Storage with JSON Backup Export & Import                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (HTTPS API Requests with Bearer Auth)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SERVER LAYER (Express + TypeScript)                   │
│  - Auth Verification: Validates Bearer token & derives user identity        │
│  - Strict ABAC: Enforces per-user data partition isolation                  │
│  - Zero Client Secrets: Exposes NO Gemini credentials in frontend JS        │
│  - System Prompt Hardening: Rigid role boundaries & injection resistance    │
│  - JSON Schema Enforcement via `@google/genai` Type Schema                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             GOOGLE GEMINI API                               │
│  - Model: `gemini-3.7-flash`                                                │
│  - Server-side invocation via Google Cloud Secret Manager / Env             │
│  - Telemetry: AI Studio User-Agent telemetry headers enabled                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Model & Threat Summary

| Domain | Threat Vector | Mitigation Strategy |
| :--- | :--- | :--- |
| **Authentication** | Spoofed / unverified user identity | Identity derived strictly from authenticated Google/Firebase sessions. Tokens verified on all `/api/*` endpoints. |
| **Authorization & BOLA** | Cross-tenant data snooping (IDOR) | User identity is derived from verified token context, never from client-provided query parameters. |
| **Prompt Injection** | Jailbreak attempts trying to hijack instructions | Server-side prompt encapsulation with explicit boundary delimiters, structured JSON schemas, and anti-tamper system instructions. |
| **Gemini API Security** | `GEMINI_API_KEY` leakage in browser bundle | API keys are kept 100% server-side in Node.js runtime. Frontend communicates only via proxy endpoints. |
| **Secret Management** | Accidental credential commits | Injected securely via Google Cloud Secret Manager or container environment variables. |
| **Data Isolation** | Accidental cross-user query contamination | Every stored reflection, conversation, goal, and review is keyed strictly under `gemini_growth_user_{userId}`. Switching users instantaneously rebinds and isolates storage partitions. |

---

## 🚀 Core Features

### 1. AI Reflection → Action Plan
- Extracts the **Core Reflection**, **Key Bottleneck**, **Goal Title**, and **3–5 Actionable Steps** with estimated durations.
- The user can review, customize, and choose which action items to save into their private Goals pipeline.

### 2. Personal Growth Dashboard
- **Never Fabricates Data**: Visual metrics (Goal Completion %, Active Action Items, Recurring Themes Tag Cloud, Domain Breakdown) are calculated directly from user activity.
- Covers 7 primary life and career domains:
  - *Career*, *Leadership*, *Technical Skills*, *Communication*, *Productivity*, *Personal Development*, *Learning*.

### 3. Weekly AI Review
- Analyzes historical reflections for a selected period (7, 14, or 30 days).
- Generates an executive summary, top wins, friction points, progressed goals, attention areas, and strategic focus for next week.

### 4. Smart Auto-Tagging
- Contextual taxonomy suggestion (#leadership, #deepwork, #communication, #architecture) for easy filtering and discovery.

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- A Google Gemini API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://0.0.0.0:3000` with full backend API support and Vite client bundling.

---

## ☁️ Google Cloud Run Deployment

### Build Command
```bash
npm run build
```
This builds the Vite frontend into `dist/` and compiles `server.ts` into a self-contained CommonJS bundle at `dist/server.cjs` via `esbuild`.

### Start Command
```bash
npm start
```

### Deploy to Cloud Run
```bash
gcloud run deploy gemini-growth-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --allow-unauthenticated
```

---

## 🧪 How to Test & Demo (3-Minute Tour)

1. **Sign In**: Click **"Sign in with Google"** on the landing page (or choose a pre-configured persona like **Alex Chen - Eng Lead**).
2. **Start a Reflection**: In the **Reflection Chat**, click a reflection starter (e.g. *"Presentation Confidence"*).
3. **Multi-Turn Chat**: Converse with Gemini, examine the Socratic response and suggested tag pills.
4. **Action Plan Extraction**: Click **"Turn into Action Plan"**. Review the extracted diagnosis, select action steps, and click **"Save to My Goals"**.
5. **Goal Tracking**: Switch to **Action Plans & Goals**, check off a milestone step, and observe the live progress bar and confetti.
6. **Growth Dashboard**: Switch to **Growth Dashboard** to see live domain distributions and recurring theme clouds.
7. **Weekly AI Review**: Go to **Weekly AI Review**, click **"Generate Review"**, inspect the executive synthesis, and save it.
8. **Multi-Tenant Isolation**: Use the **"Test Identity"** menu in the header to switch to *Jordan Taylor (Fresh User)*. Verify that Jordan sees a completely isolated blank journal with zero data bleed from Alex Chen.
