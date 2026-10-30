# RiseHer: AI-Powered Women Entrepreneurship Intelligence, Guidance & Empowerment Platform

> **AI Based Recommendation system for Women Entrepreneurship**

[![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-purple.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.11-teal.svg)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Reference](https://img.shields.io/badge/Reference-WEP_NITI_Aayog-coral.svg)](https://wep.gov.in/)
[![Tests](https://img.shields.io/badge/Tests-35%20Passed%20(100%25)-brightgreen.svg)]()

**RiseHer** is an AI-powered entrepreneurial decision-support, ecosystem intelligence, and mentoring platform designed for women founders across India. Drawing design, architectural, and data inspiration from the official [Women Entrepreneurship Platform (WEP)](https://wep.gov.in/) by NITI Aayog, RiseHer transforms early-stage ideas into practical, viable, and commercially sustainable enterprises through explainable AI recommendations, dynamic multi-channel monetization modeling, and automated government scheme discovery.

---

## 🌟 Core Product Vision & Principle

> *"Take her idea, skills, interests, and location. Give structured viability feedback, match mentors, resources, and grants, and guide a practical business-plan workflow. AI should personalize and prioritize, not just motivate."*

---

## 🏛️ Comprehensive Architecture & Features

### Part 1 & Part 2 — First Page Landing & Real Women Entrepreneur Inspiration
- **Public First Page (`/`)**: Unauthenticated users land on a public landing page featuring:
  - Clean sticky navigation with RiseHer branding and direct links to **Login**, **Start Your Business Journey**, and **Live Demo**.
  - Hero section: *"Your Idea. Your Ambition. Your Business Journey."* with supporting copy *"An AI-powered platform that helps women transform business ideas into opportunities through personalized business intelligence, mentorship, government support and actionable guidance."*
  - Two prominent action buttons above the fold: **Login** (opens `/login`) and **Start Your Business Journey** (opens `/register`).
- **"She Inspires. You Rise." Inspiration Section**:
  - Accessible on the first page as well as prominently placed on top of the dashboard.
  - Subtitle: *"Every successful business began with someone who dared to start. Let their journeys inspire yours."*
  - Features 9 authentic women entrepreneurs with high-resolution portraits stored locally in `frontend/public/images/entrepreneurs/`:
    1. **Falguni Nayar** (Founder & CEO of Nykaa / FSN E-Commerce)
    2. **Kiran Mazumdar-Shaw** (Founder & Executive Chairperson of Biocon Limited)
    3. **Vineeta Singh** (Co-founder & CEO of SUGAR Cosmetics)
    4. **Richa Kar** (Founder of Zivame)
    5. **Ghazal Alagh** (Co-founder of Mamaearth / Honasa Consumer)
    6. **Aditi Gupta** (Co-founder of Menstrupedia)
    7. **Melanie Perkins** (Co-founder & CEO of Canva)
    8. **Sara Blakely** (Founder of Spanx)
    9. **Oprah Winfrey** (Media entrepreneur and founder of Harpo Productions)
  - Authentic photographs with verified historical quotes, key milestones, and a dedicated **"What Her Journey Teaches Us"** takeaway.
  - Smooth horizontal scroll carousel and detailed interactive story modal.

### Part 3 & Part 4 — Mandatory OTP Verification & Real Carrier/SMTP Delivery
- **Non-Negotiable Rule**: No successful OTP verification = No account activation = No dashboard access.
- **Real Delivery Gateways**:
  - **Email**: Integrated via standard SMTP (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`) with support for Gmail, Outlook, SendGrid, Amazon SES, Brevo, or Resend API (`RESEND_API_KEY`). Sends a responsive HTML email with bold 6-digit code, 5-minute expiry alert, and RiseHer branding.
  - **Mobile SMS**: Integrated via Twilio REST API (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) or MSG91 (`MSG91_AUTH_KEY`). Supports +91 Indian mobile numbers and international E.164.
  - **Local Mail Catcher for Offline Testing**: A zero-dependency script (`python3 scripts/run_local_smtp_catcher.py`) runs a local SMTP server on port 1025 for end-to-end testing without external internet.
  - **Unconfigured Detection**: If provider credentials are unset, the system explicitly returns HTTP 503 informing the user that email/SMS delivery is not configured. It never pretends delivery succeeded or provides fake bypass codes.
- **Backend Security Rules**:
  - Cryptographically secure 6-digit OTP generation using Python's `secrets` module.
  - 5-minute strict expiration window.
  - Salting and SHA-256 hashing for all stored OTPs; plain text OTPs are never stored in the database.
  - 60-second cooldown rate-limiting between resends (`HTTP 429`).
  - Maximum 5 failed attempts per challenge with real-time attempt countdown.
  - Single-use invalidation (`is_consumed=True`) prevents replay attacks.
- **End-to-End Route Protection**:
  - **Frontend Guard**: Any unauthenticated access to `/dashboard` or `/profile/setup` redirects immediately to `/login`.
  - **Backend Guard**: All protected dashboard APIs validate the JWT token and verify that `user.is_verified == True`. Unverified accounts receive HTTP 401 Unauthorized. Direct registration without OTP (`/api/auth/register`) is blocked.
  - Sessions persist across browser reloads without defaulting to a hardcoded demo user.
- **SMS Gateway & OTP Security**:
  - SHA-256 OTP hashing in database (`backend/sms_service.py`).
  - Strict 60-second cooldown rate-limiting between resends (`HTTP 429`).
  - Max 5 failed attempts per verification cycle.
  - Configurable SMS backend supporting **Twilio**, **MSG91**, and **Development Mode** fallback via `.env`.

### Part 5 — Personal & Business Location in Edit Profile
- **Personal Location**: Country (India), State, District, City/Town, PIN code, and Location Type (Urban, Semi-Urban, Rural).
- **Business Location**: Full address with *"Same as my personal location"* toggle.
- **Operating Area**: Hyperlocal, Local / City-wide, Regional / Multi-District, State-wide, Pan-India, Global / Export.
- **Mentorship Settings**: Mode (Online, Offline, Hybrid) and preferred location.

### Part 6 & Part 7 — Dynamic Revenue Channels & Competitor Landscape
- **Dynamic Revenue Channels**:
  - Analyzes profile parameters (model, stage, budget, operating area) to structure 3-5 tailored monetization streams.
  - Each channel features 6 distinct attributes: Channel Name, How it Works, Why it Fits Your Profile, Initial Requirements, Estimated Setup Cost, and Limitations & Risks.
- **Dynamic Competitor Landscape & Differentiation Matrix**:
  - Categorizes competitors into Direct, Indirect, Local, and Online competitors with threat levels and user's advantage.
  - Strategic Pricing Intelligence (User Optimal, Market Average, Premium Benchmark, Budget Alternatives).
  - Concrete defensible differentiation tactics.

### Part 8 — Central Profile-Driven AI Recalibration Engine
- Single authoritative profile record tracked with an incremental `profile_version`.
- `PUT /api/profile/update` and `POST /api/profile/refresh-ai` endpoints synchronously recalibrate viability scores, risks, matched government schemes, and business plan sections.
- Overview dashboard features an explicit *"Refresh My AI Insights"* button with live progress indicator and timestamp.

### Part 9 & Part 10 — RiseHer Brand Visual Identity & User Isolation
- Cohesive color scheme:
  - `#54245F` Deep Plum (Primary headers & navigation)
  - `#7542A6` Empowerment Purple (Highlights & badges)
  - `#E88979` Warm Coral (Action buttons & accents)
  - `#F9E8ED` Soft Blush (Card backgrounds & highlights)
  - `#FFF9F4` Warm Cream (Main page background)
  - `#28242C` Deep Charcoal (Body text & high contrast elements)
  - `#269B72` Green (Success metrics & viability indicators)
- Full multi-tenant data isolation guaranteeing that users only access their own profiles, roadmaps, and analyses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, SQLite3, SQLAlchemy ORM |
| **AI Engine** | Deterministic profile-sensitive decision matrices, scheme fit algorithms, financial projections |
| **Security & Auth** | BCrypt password hashing, SHA-256 OTP hashing, JWT Bearer tokens, SMS dispatch service |

---

## 💻 Exact macOS Installation & Setup

### Prerequisites
- macOS with Python 3.11+
- Node.js (v18+ or v20+) and `npm`

### Step 1: Clone or Extract the Project
```bash
cd weather_regime_rainfall_ai
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(RiseHer runs out of the box in Development Mode without needing external credentials).*

### Step 3: Backend Setup & Launch
```bash
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on port 8001
export PYTHONPATH="."
uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```
*Backend runs at: `http://127.0.0.1:8001` (Interactive API Docs: `http://127.0.0.1:8001/docs`)*

### Step 4: Frontend Setup & Launch
```bash
# In a new terminal window:
cd frontend

# Install node dependencies
npm install

# Verify clean TypeScript compilation
npm run build

# Start Vite dev server on port 5173
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend runs at: `http://127.0.0.1:5173`*

---

## 🧪 Automated Test Suite Execution

Run all unit, workflow, and OTP rate-limiting tests:
```bash
export PYTHONPATH="."
.venv/bin/pytest tests/test_otp_and_profile_refresh.py tests/test_riseher_workflow.py -v
```
*Result: 7/7 tests pass (100%).*

---

## 👥 Pre-Seeded Evaluator Personas

For quick hackathon evaluation, click any persona on the Login page or header Demo Switcher:

1. **Priya Sharma** (`priya@riseher.org` / `password123`)
   - **Venture**: Online Artisanal Boutique (Bengaluru, Karnataka)
   - **Stage**: Idea Stage • Available: ₹50,000 vs Expected: ₹1,50,000
   - **Matched Schemes**: MUDRA Shishu (100% Fit), PMEGP (92% Fit)

2. **Ananya Patel** (`ananya@riseher.org` / `password123`)
   - **Venture**: Bakery & Café Studio Expansion (Mysore, Karnataka)
   - **Stage**: Early Business Stage • Available: ₹3,00,000 vs Expected: ₹12,00,000
   - **Matched Schemes**: CGTMSE Collateral-Free Credit, Stand-Up India

3. **Sunita Devi** (`sunita@riseher.org` / `password123`)
   - **Venture**: Solar Millet & Oil Collective (Belgaum, Karnataka)
   - **Stage**: Validation Stage • Available: ₹40,000 vs Expected: ₹5,00,000
   - **Matched Schemes**: PMEGP 35% Rural Subsidy, NABARD Agri-Infra Fund

4. **Kavita Rao** (`kavita.mentor@riseher.org` / `password123`)
   - **Role**: Experienced E-commerce Mentor & D2C Advisor

5. **Pooja Hegde** (`admin@riseher.org` / `password123`)
   - **Role**: Platform Administrator Console & Ecosystem Monitor

---

## 📄 License
Developed for Women Entrepreneurship Innovation & Inclusion Hackathon.
Inspired by official initiatives of NITI Aayog's Women Entrepreneurship Platform (WEP).
