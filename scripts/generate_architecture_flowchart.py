#!/usr/bin/env python3
"""
RiseHer System Architecture & Workflow Flowchart Generator
Generates a professional 16:9 high-resolution PNG (3840x2160 / 300 DPI)
and standalone vector SVG representing the complete production-verified
architecture of the RiseHer Women Entrepreneurship Platform.
"""

import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Polygon

# Ensure output directory exists
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "architecture")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PNG_PATH = os.path.join(OUTPUT_DIR, "riseher_system_architecture_flowchart.png")
SVG_PATH = os.path.join(OUTPUT_DIR, "riseher_system_architecture_flowchart.svg")

def draw_flowchart():
    fig = plt.figure(figsize=(24, 13.5), dpi=200) # 4800 x 2700 pixels (16:9 4K crisp)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 240)
    ax.set_ylim(0, 135)
    ax.axis('off')

    # Background canvas
    bg = patches.Rectangle((0, 0), 240, 135, facecolor="#F8FAFC", edgecolor="none")
    ax.add_patch(bg)

    # -------------------------------------------------------------
    # HEADER BANNER
    # -------------------------------------------------------------
    header_box = FancyBboxPatch((4, 121), 232, 10, boxstyle="round,pad=0.5,rounding_size=1.5",
                                facecolor="#54245F", edgecolor="#3B1842", linewidth=2)
    ax.add_patch(header_box)

    ax.text(120, 127.5, "RISEHER PLATFORM ARCHITECTURE & SYSTEM WORKFLOW",
            ha="center", va="center", fontsize=18, fontweight="bold", color="#FFFFFF", family="sans-serif")
    ax.text(120, 123.5, "AI-Powered Women Entrepreneurship Intelligence & Empowerment Platform  •  Production-Verified System Architecture",
            ha="center", va="center", fontsize=11, fontweight="medium", color="#F9E8ED", family="sans-serif")

    # -------------------------------------------------------------
    # HELPER FUNCTIONS FOR DRAWING CARDS AND BOXES
    # -------------------------------------------------------------
    def draw_card(x, y, w, h, title, subtitle, items, bg_color, border_color, title_color="#1E293B", badge="✓ Implemented"):
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=1.0",
                             facecolor=bg_color, edgecolor=border_color, linewidth=1.5)
        ax.add_patch(box)
        
        # Header bar for card
        ax.text(x + 1.5, y + h - 2.0, title, fontsize=10.5, fontweight="bold", color=title_color, va="center")
        if badge:
            badge_bg = "#DCFCE7" if "Implemented" in badge else "#FEF3C7"
            badge_fg = "#166534" if "Implemented" in badge else "#92400E"
            bb = FancyBboxPatch((x + w - 7.5, y + h - 2.8), 6.5, 1.8, boxstyle="round,pad=0.2,rounding_size=0.4",
                                facecolor=badge_bg, edgecolor=badge_fg, linewidth=0.8)
            ax.add_patch(bb)
            ax.text(x + w - 4.25, y + h - 1.9, badge, fontsize=7.0, fontweight="bold", color=badge_fg, ha="center", va="center")
        
        if subtitle:
            ax.text(x + 1.5, y + h - 3.8, subtitle, fontsize=8.0, fontstyle="italic", color="#64748B", va="center")
            curr_y = y + h - 5.5
        else:
            curr_y = y + h - 4.2

        for item in items:
            ax.text(x + 1.8, curr_y, f"• {item}", fontsize=8.2, color="#334155", va="center")
            curr_y -= 1.8

    def draw_arrow(x1, y1, x2, y2, color="#475569", label="", label_pos=(0, 0), connectionstyle="arc3,rad=0"):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=1.8, mutation_scale=14,
                                    connectionstyle=connectionstyle))
        if label:
            lx = (x1 + x2) / 2 + label_pos[0]
            ly = (y1 + y2) / 2 + label_pos[1]
            ax.text(lx, ly, label, fontsize=7.5, fontweight="bold", color=color,
                    bbox=dict(boxstyle="round,pad=0.2", facecolor="#FFFFFF", edgecolor=color, lw=0.8),
                    ha="center", va="center")

    # -------------------------------------------------------------
    # COLUMN 1: USER ENTRY & CLIENT LAYER (x: 6 to 44)
    # -------------------------------------------------------------
    col1_bg = FancyBboxPatch((5, 14), 40, 103, boxstyle="round,pad=0.6,rounding_size=1.5",
                             facecolor="#F8FAFC", edgecolor="#CBD5E1", linewidth=1.2, linestyle="--")
    ax.add_patch(col1_bg)
    ax.text(25, 114.5, "1. USER ENTRY & CLIENT TIERS", fontsize=12, fontweight="bold", color="#0F172A", ha="center")
    ax.text(25, 112.2, "React 18 + Vite SPA Client Architecture", fontsize=8.5, color="#64748B", ha="center")

    draw_card(7, 95, 36, 14, "User Personas & Entry", "Entry Points into Platform", [
        "New Entrepreneur (First-time signup)",
        "Existing Founder / Returning User",
        "Empanelled Mentor & Advisor",
        "System Administrator"
    ], bg_color="#FFFFFF", border_color="#94A3B8")

    draw_card(7, 72, 36, 19, "Public Landing Page", "Route: / (LandingPage.tsx)", [
        "Hero Section with Vision & Mission",
        "Women Entrepreneur Success Stories",
        "Daily Inspirational Quotes Carousel",
        "Feature Discovery & Core Modules",
        "CTA: 'Get Started' / 'Member Sign-In'",
        "Live Pre-configured Demo Switcher"
    ], bg_color="#FFFFFF", border_color="#94A3B8")

    draw_card(7, 43, 36, 25, "Onboarding & Auth Modal", "Component: AuthModal.tsx", [
        "Full Name, Email & Phone (+91)",
        "Role: Entrepreneur / Mentor / Admin",
        "Dispatch OTP Challenge Trigger",
        "6-Digit Interactive OTP Input",
        "60s Anti-Spam Cooldown Timer",
        "Real-Time Delivery Status Feedback",
        "Passwordless OTP Sign-In Mode",
        "Password Login + JWT Fallback"
    ], bg_color="#FFFFFF", border_color="#6366F1")

    draw_card(7, 17, 36, 22, "Interactive Onboarding Wizard", "Component: OnboardingWizard.tsx", [
        "5-Step Guided Venture Profiling",
        "Business Idea Title & Concept Summary",
        "Sector/Domain (Fashion, Food, Agri, etc.)",
        "Operating Stage (Idea, Startup, Growth)",
        "Location: Urban / Semi-Urban / Rural",
        "Capital Available vs Capital Needed",
        "Skills Matrix & Growth Challenges"
    ], bg_color="#FFFFFF", border_color="#94A3B8")

    # Connect Col 1 items
    draw_arrow(25, 95, 25, 91, label="Visits")
    draw_arrow(25, 72, 25, 68, label="Clicks Sign Up / Login")
    draw_arrow(25, 43, 25, 39, label="Profile Setup")

    # -------------------------------------------------------------
    # COLUMN 2: AUTHENTICATION & SECURITY GATEWAY (x: 50 to 90)
    # -------------------------------------------------------------
    col2_bg = FancyBboxPatch((49, 14), 42, 103, boxstyle="round,pad=0.6,rounding_size=1.5",
                             facecolor="#FFFBEB", edgecolor="#FCD34D", linewidth=1.2, linestyle="--")
    ax.add_patch(col2_bg)
    ax.text(70, 114.5, "2. AUTHENTICATION & SECURITY GATE", fontsize=12, fontweight="bold", color="#92400E", ha="center")
    ax.text(70, 112.2, "Zero-Trust OTP Verification & Access Guard", fontsize=8.5, color="#B45309", ha="center")

    draw_card(52, 92, 36, 17, "OTP Generation & Dispatch", "Endpoint: POST /api/auth/send-otp", [
        "Cryptographic 6-digit OTP (secrets API)",
        "Rate Limit: 60s cooldown per target",
        "Validity Window: 5-minute expiry",
        "Salted SHA-256 hash stored in DB",
        "Invalidates prior unconsumed OTPs",
        "Target masked in logs for privacy"
    ], bg_color="#FFFFFF", border_color="#F59E0B", title_color="#B45309")

    draw_card(52, 69, 36, 19, "Dual-Channel Gateways", "Carrier-Grade Message Delivery", [
        "Twilio SMS Gateway (+91 E.164 format)",
        "Fast2SMS / MSG91 Fallback Routers",
        "SMTP Server (Gmail App Pass / Brevo / SES)",
        "Resend & SendGrid REST API Gateways",
        "Branded HTML Email Template",
        "Local Dev Mailbox: /tmp/dev_mailbox.jsonl"
    ], bg_color="#FFFFFF", border_color="#F59E0B", title_color="#B45309")

    # Decision Diamond for OTP Verification
    # Diamond center at (70, 48), width=32, height=14
    diamond_pts = [[70, 56], [87, 48], [70, 40], [53, 48]]
    diamond = Polygon(diamond_pts, closed=True, facecolor="#FEF3C7", edgecolor="#D97706", linewidth=2.0)
    ax.add_patch(diamond)
    ax.text(70, 49.5, "Is OTP Code Valid,", fontsize=9.0, fontweight="bold", color="#78350F", ha="center")
    ax.text(70, 47.0, "Unexpired & Correct Hash?", fontsize=8.5, fontweight="bold", color="#78350F", ha="center")
    ax.text(70, 44.5, "(POST /api/auth/verify-otp)", fontsize=7.2, color="#92400E", ha="center")

    # Failure box
    fail_box = FancyBboxPatch((52, 23), 16, 13, boxstyle="round,pad=0.3,rounding_size=0.8",
                              facecolor="#FEE2E2", edgecolor="#EF4444", linewidth=1.2)
    ax.add_patch(fail_box)
    ax.text(60, 33.5, "REJECT & LOCK", fontsize=8.5, fontweight="bold", color="#991B1B", ha="center")
    ax.text(60, 30.5, "• Increment attempts (Max 5)", fontsize=7.0, color="#7F1D1D", ha="center")
    ax.text(60, 28.0, "• 400 Invalid OTP Error", fontsize=7.0, color="#7F1D1D", ha="center")
    ax.text(60, 25.5, "• Enforce rate-limit wait", fontsize=7.0, color="#7F1D1D", ha="center")

    # Success Session box
    success_box = FancyBboxPatch((72, 17), 17, 19, boxstyle="round,pad=0.3,rounding_size=0.8",
                                 facecolor="#DCFCE7", edgecolor="#10B981", linewidth=1.5)
    ax.add_patch(success_box)
    ax.text(80.5, 33.5, "VERIFIED SESSION", fontsize=8.5, fontweight="bold", color="#065F46", ha="center")
    ax.text(80.5, 30.8, "• Consume OTP in DB", fontsize=7.2, color="#047857", ha="center")
    ax.text(80.5, 28.3, "• Issue JWT Bearer Token", fontsize=7.2, color="#047857", ha="center")
    ax.text(80.5, 25.8, "• Save to localStorage", fontsize=7.2, color="#047857", ha="center")
    ax.text(80.5, 23.3, "• AuthContext State = TRUE", fontsize=7.2, color="#047857", ha="center")
    ax.text(80.5, 20.0, "✓ DASHBOARD UNLOCKED", fontsize=7.5, fontweight="bold", color="#065F46", ha="center")

    # Arrows for Column 2
    draw_arrow(43, 55, 52, 98, color="#D97706", label="Send OTP Request", connectionstyle="arc3,rad=-0.1")
    draw_arrow(70, 92, 70, 88, color="#D97706", label="Dispatches To")
    draw_arrow(70, 69, 70, 56, color="#D97706", label="Enters 6-Digit Code")
    draw_arrow(57, 44, 60, 36, color="#DC2626", label="NO (Invalid/Expired)", label_pos=(-2, 0))
    draw_arrow(82, 43, 82, 36, color="#059669", label="YES (Valid Hash)", label_pos=(2, 0))

    # -------------------------------------------------------------
    # COLUMN 3: MAIN DASHBOARD & STRATEGY INTELLIGENCE (x: 95 to 142)
    # -------------------------------------------------------------
    col3_bg = FancyBboxPatch((94, 14), 48, 103, boxstyle="round,pad=0.6,rounding_size=1.5",
                             facecolor="#FDF4FF", edgecolor="#E879F9", linewidth=1.2, linestyle="--")
    ax.add_patch(col3_bg)
    ax.text(118, 114.5, "3. PROTECTED DASHBOARD & INTELLIGENCE", fontsize=12, fontweight="bold", color="#54245F", ha="center")
    ax.text(118, 112.2, "Enterprise Analytical Views & Strategic Modules", fontsize=8.5, color="#7542A6", ha="center")

    draw_card(96, 92, 44, 17, "Main Dashboard Hub", "OverviewDashboard.tsx (Protected Route)", [
        "Women Entrepreneur Success Stories Showcase",
        "Daily Motivational Quotes Carousel for Founders",
        "Live Venture Viability & Risk Gauge Cards",
        "Eligible Government Schemes Quick-Launcher",
        "Active Mentorship Session Notifications",
        "Venture Milestone Progress Tracker"
    ], bg_color="#FFFFFF", border_color="#A855F7", title_color="#54245F")

    draw_card(96, 44, 44, 45, "Business Strategy Intelligence", "Core Module: AnalysisView.tsx (CentralAIEngine)", [
        "1. Strategic Pricing Intelligence:",
        "   • Direct/Indirect Competitor Price Tiers",
        "   • Gross Margin Benchmark Analysis (28% - 65%)",
        "   • Optimal Strategic Sweet-Spot Price Discovery",
        "2. Recommended Differentiation Strategies:",
        "   • Clean-Label & Preservative-Free Transparency",
        "   • Artisanal Craft & Custom Tailoring Flexibility",
        "   • Digital Packaging & Direct Farm Sourcing Narrative",
        "3. Precision Customer Segmentation:",
        "   • Primary, Secondary & Tertiary Personas",
        "   • Demographics, Pain Points & Willingness to Pay",
        "   • CAC & Organic Channel Acquisition Roadmap",
        "4. Competitive Moat & Defense Matrix:",
        "   • Defensibility Index & Switching Cost Barriers",
        "   • Local Supplier Networks & Intellectual Asset Moat",
        "5. Dynamic Revenue Channel Discovery:",
        "   • D2C Webstore, B2B Bulk, Hyperlocal & Subscriptions"
    ], bg_color="#FFFFFF", border_color="#7C3AED", title_color="#54245F")

    draw_card(96, 17, 44, 24, "Integrated Founder Workspaces", "Operational Modules Suite", [
        "• Comprehensive Risk Radar (Financial, Ops, Legal)",
        "• What-If Risk Recalculator & Mitigation Simulator",
        "• SmartGov 100-Pt SchemeFit (PMEGP, Mudra, StandUp)",
        "• Adaptive 19-Section Business Plan Generator & Editor",
        "• Domain/Stage-Aware Mentor Matching & Direct Chat",
        "• UN SDG Impact Accounting (SDG 5, 8, 9, 10, 12)"
    ], bg_color="#FFFFFF", border_color="#A855F7", title_color="#54245F")

    # Connect Col 2 to Col 3 (ONLY after verification)
    draw_arrow(89, 26, 96, 26, color="#059669", label="Bearer Token Authorized", connectionstyle="arc3,rad=-0.15")
    draw_arrow(89, 26, 96, 100, color="#059669", label="Grants Dashboard Access", connectionstyle="arc3,rad=0.2")
    draw_arrow(118, 92, 118, 89, color="#7C3AED", label="Navigates To")
    draw_arrow(118, 44, 118, 41, color="#7C3AED", label="Accesses Tools")

    # -------------------------------------------------------------
    # COLUMN 4: FASTAPI BACKEND & AI ENGINES (x: 146 to 192)
    # -------------------------------------------------------------
    col4_bg = FancyBboxPatch((145, 14), 46, 103, boxstyle="round,pad=0.6,rounding_size=1.5",
                             facecolor="#F0F9FF", edgecolor="#7DD3FC", linewidth=1.2, linestyle="--")
    ax.add_patch(col4_bg)
    ax.text(168, 114.5, "4. BACKEND API & CENTRAL AI ENGINE", fontsize=12, fontweight="bold", color="#0369A1", ha="center")
    ax.text(168, 112.2, "FastAPI Serverless Core & Decision Models", fontsize=8.5, color="#0284C7", ha="center")

    draw_card(147, 85, 42, 24, "FastAPI High-Speed Service", "Framework: FastAPI 0.110+ & Pydantic V2", [
        "14 Modular Specialized Routers:",
        " • /api/auth (OTP, tokens, passwordless)",
        " • /api/profile (Venture profile & versioning)",
        " • /api/analysis (Viability, pricing, moat, SWOT)",
        " • /api/risk (Risk radar, what-if recalculator)",
        " • /api/schemes (100-pt SchemeFit ranking)",
        " • /api/mentors & /api/messages (Consultation)",
        " • /api/business-plan (19-section synthesis)",
        " • /api/roadmap, /api/progress, /api/sdg, /api/admin",
        "OAuth2 Bearer Security & Full CORS Handlers"
    ], bg_color="#FFFFFF", border_color="#0284C7", title_color="#0369A1")

    draw_card(147, 33, 42, 49, "CentralAIEngine Architecture", "Core File: backend/ai_engine.py (1,394 Lines)", [
        "1. Multi-Factor Viability Scoring Engine:",
        "   • Profile Fit (20%), Market Demand (25%)",
        "   • Operational Feasibility (25%), Capital Fit (15%)",
        "   • Risk Penalty Subtraction (-15%)",
        "2. Strategic Pricing & Competitor Engine:",
        "   • Dynamic Tier Benchmark Analysis",
        "   • Cost-Plus, Value-Based & Sweet Spot Calc",
        "3. Customer Persona & Segmentation Model:",
        "   • 3-Tier Persona Generation with WTP analysis",
        "4. Competitive Moat & Defensibility Matrix:",
        "   • Barrier-to-entry & differentiation scoring",
        "5. Explainable AI (XAI) Engine:",
        "   • Factor attribution & Missing info detector",
        "6. Weighted 100-Pt SchemeFit Algorithm:",
        "   • Gender (20), Stage (20), Investment (25)",
        "   • Sector (20), Location/Social Category (15)",
        "7. Adaptive 19-Section Business Plan Generator",
        "8. Dynamic Milestone Roadmap Generator",
        "9. Progress Variance Diagnostics & Alerts"
    ], bg_color="#FFFFFF", border_color="#7C3AED", title_color="#4C1D95")

    draw_card(147, 17, 42, 13, "Data Formatting & Validation", "Pydantic Schemas (backend/schemas.py)", [
        "• Strict Type Safety & Pydantic Serialization",
        "• Request Validation & Sanitization Guards",
        "• JSON Evidence & Explainability Structure",
        "• OpenAPI 3.0 / Swagger Interactive Auto-Docs"
    ], bg_color="#FFFFFF", border_color="#0284C7", title_color="#0369A1")

    # Connect Col 3 to Col 4 (REST API Calls)
    draw_arrow(140, 70, 147, 95, color="#0284C7", label="REST / JSON (Bearer Token)", connectionstyle="arc3,rad=-0.1")
    draw_arrow(168, 85, 168, 82, color="#0284C7", label="Invokes AI Logic")
    draw_arrow(168, 33, 168, 30, color="#0284C7", label="Validates Output")

    # -------------------------------------------------------------
    # COLUMN 5: PERSISTENCE, EXTERNAL & CLOUD (x: 196 to 236)
    # -------------------------------------------------------------
    col5_bg = FancyBboxPatch((194, 14), 42, 103, boxstyle="round,pad=0.6,rounding_size=1.5",
                             facecolor="#F0FDF4", edgecolor="#86EFAC", linewidth=1.2, linestyle="--")
    ax.add_patch(col5_bg)
    ax.text(215, 114.5, "5. DATA, SERVICES & DEPLOYMENT", fontsize=12, fontweight="bold", color="#166534", ha="center")
    ax.text(215, 112.2, "Persistence, External APIs & Vercel Cloud", fontsize=8.5, color="#15803D", ha="center")

    draw_card(196, 77, 38, 32, "Database Persistence Layer", "SQLAlchemy 2.0 ORM (backend/models.py)", [
        "14 Relational Entity Tables:",
        " • users (Auth credentials & role)",
        " • otp_verifications (Salted hash, expiry)",
        " • entrepreneur_profiles (5-stage data)",
        " • business_analyses (Viability & SWOT)",
        " • risk_assessments (Risk radar scores)",
        " • schemes & scheme_matches (100-pt fit)",
        " • mentor_profiles & mentorship_requests",
        " • conversations & direct messages",
        " • business_plans (19 JSON sections)",
        " • roadmap_tasks, progress_records",
        " • sdg_impact_records, community_posts",
        "Storage Engine: SQLite (/tmp/riseher.db)",
        "PostgreSQL / Supabase Ready (DATABASE_URL)"
    ], bg_color="#FFFFFF", border_color="#10B981", title_color="#065F46")

    draw_card(196, 45, 38, 29, "External Third-Party APIs", "Integrated Cloud Communications", [
        "1. Twilio SMS Messaging Gateway:",
        "   • Official Twilio REST SDK v9.0+",
        "   • +91 Indian Mobile E.164 Normalizer",
        "2. SMTP & Email Gateway Services:",
        "   • Standard SMTP (Gmail App Pass, Brevo)",
        "   • Resend & SendGrid REST HTTP APIs",
        "   • Custom RiseHer Responsive HTML Mailer",
        "3. National Enterprise Portals:",
        "   • PMEGP (KVIC Online Portal)",
        "   • Stand-Up India (SIDBI)",
        "   • Pradhan Mantri Mudra Yojana (PMMY)",
        "   • Udyam MSME Registration"
    ], bg_color="#FFFFFF", border_color="#10B981", title_color="#065F46")

    draw_card(196, 17, 38, 25, "Production Cloud Hosting", "Vercel Full-Stack Serverless Fabric", [
        "GitHub Sync: Preeti-b-t/Rise_Her (main)",
        "Frontend Hosting: Vercel Edge CDN",
        " • React 18 + Vite SPA (frontend/dist)",
        " • Global Edge CDN caching & SPA rewrites",
        "Backend Hosting: Vercel Python Lambda",
        " • ASGI Handler (api/index.py)",
        " • Native packaging via vercel.json",
        " • Automated CI/CD git push triggers",
        "Live Production URL:",
        " https://rise-her-app-lilac.vercel.app"
    ], bg_color="#FFFFFF", border_color="#334155", title_color="#0F172A")

    # Connect Col 4 to Col 5
    draw_arrow(189, 92, 196, 92, color="#059669", label="SQLAlchemy ORM")
    draw_arrow(189, 58, 196, 58, color="#059669", label="API Dispatch")
    draw_arrow(189, 26, 196, 26, color="#334155", label="ASGI / Lambda")

    # -------------------------------------------------------------
    # FOOTER & LEGEND (y: 2 to 11)
    # -------------------------------------------------------------
    footer_box = FancyBboxPatch((4, 2), 232, 9, boxstyle="round,pad=0.4,rounding_size=1.0",
                                facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=1.2)
    ax.add_patch(footer_box)

    ax.text(7, 6.5, "SYSTEM ARCHITECTURE LEGEND & CONVENTIONS:", fontsize=9.0, fontweight="bold", color="#1E293B", va="center")

    legend_items = [
        ("#DCFCE7", "#166534", "✓ Live & Implemented (Tested in Production)"),
        ("#FDF4FF", "#701A75", "Frontend View (React 18 / Vite / Tailwind)"),
        ("#FFFBEB", "#92400E", "Security Gate / Decision Point (OTP & JWT)"),
        ("#F0F9FF", "#0369A1", "Backend Engine (FastAPI 0.110+ / Python)"),
        ("#F0FDF4", "#166534", "Database & External Cloud Gateways"),
        ("#F1F5F9", "#334155", "Vercel Edge & Serverless Deployment")
    ]

    leg_x = 52
    for bg_c, fg_c, text in legend_items:
        patch = FancyBboxPatch((leg_x, 4.2), 27, 4.5, boxstyle="round,pad=0.2,rounding_size=0.4",
                               facecolor=bg_c, edgecolor=fg_c, linewidth=1.0)
        ax.add_patch(patch)
        ax.text(leg_x + 13.5, 6.5, text, fontsize=7.2, fontweight="bold", color=fg_c, ha="center", va="center")
        leg_x += 31

    # Save outputs
    print(f"Saving high-resolution PNG to: {PNG_PATH}")
    plt.savefig(PNG_PATH, dpi=200, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print(f"Saving vector SVG to: {SVG_PATH}")
    plt.savefig(SVG_PATH, format='svg', bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print("✓ Successfully generated architecture flowchart image (PNG & SVG)!")

if __name__ == "__main__":
    draw_flowchart()
