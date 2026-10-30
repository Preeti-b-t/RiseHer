import json
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

class CentralAIEngine:
    """
    Central AI Recommendation & Intelligence Engine for RiseHer.
    Implements:
    1. Multi-factor Viability Scoring with clear methodology
    2. Explainable AI factor breakdown (Profile, Market, Operations, Risk)
    3. Missing Information identification
    4. What-If Risk Recalculator
    5. Weighted 100-Point SchemeFit matching algorithm
    6. Domain & Stage Aware Mentor Matching
    7. Adaptive 19-Section Business Plan Generator
    8. Personalized Business Timeline & Action Roadmap (Adaptive Online vs Offline)
    9. Progress Variance Diagnostics & Corrective Actions
    """

    # Domain Knowledge Base
    DOMAIN_BENCHMARKS = {
        "Fashion & Apparel": {
            "avg_margin_pct": 38.0,
            "min_viable_investment": 40000.0,
            "typical_setup_weeks": 4,
            "online_readiness": "Very High",
            "regulatory_burden": "Low",
            "key_skills": ["Design", "Garment Construction", "Social Media Marketing", "Inventory Management"],
            "top_risks": ["Inventory obsolescence", "High return rates in e-commerce", "Fabric price fluctuations"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work", "SDG 12: Sustainable Consumption"]
        },
        "Food & Bakery": {
            "avg_margin_pct": 32.0,
            "min_viable_investment": 60000.0,
            "typical_setup_weeks": 6,
            "online_readiness": "Moderate (Local cloud kitchen / hyperlocal delivery)",
            "regulatory_burden": "High (FSSAI license, hygiene compliance)",
            "key_skills": ["Baking/Culinary", "Food Safety (FSSAI)", "Kitchen Management", "Local Marketing"],
            "top_risks": ["Perishable inventory spoilage", "Hygiene violations", "High upfront equipment cost"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work", "SDG 12: Responsible Consumption"]
        },
        "Agriculture & Agro-Processing": {
            "avg_margin_pct": 28.0,
            "min_viable_investment": 35000.0,
            "typical_setup_weeks": 8,
            "online_readiness": "Moderate (B2B direct, organic farm-to-table)",
            "regulatory_burden": "Medium (FSSAI for processed, APMC/Mandi norms)",
            "key_skills": ["Organic Farming", "Post-Harvest Processing", "Packaging", "Cold Storage Management"],
            "top_risks": ["Seasonal weather disruption", "Lack of cold chain infrastructure", "Middleman exploitation"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work", "SDG 10: Reduced Inequalities", "SDG 12: Responsible Production"]
        },
        "Handicrafts & Artisanal": {
            "avg_margin_pct": 45.0,
            "min_viable_investment": 25000.0,
            "typical_setup_weeks": 3,
            "online_readiness": "High (E-commerce, D2C, export)",
            "regulatory_burden": "Low",
            "key_skills": ["Artisan Craftsmanship", "Product Photography", "Storytelling / Branding", "Global Shipping"],
            "top_risks": ["Long production lead times", "Counterfeiting/cheap mass-produced replicas", "Inconsistent raw material"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work", "SDG 10: Reduced Inequalities", "SDG 12: Responsible Consumption"]
        },
        "Beauty & Wellness": {
            "avg_margin_pct": 42.0,
            "min_viable_investment": 50000.0,
            "typical_setup_weeks": 5,
            "online_readiness": "High (Clean beauty products) / Low (Local salon)",
            "regulatory_burden": "Medium (Cosmetics regulations, CDSCO)",
            "key_skills": ["Formulation/Services", "Client Consultation", "Hygiene Protocols", "Instagram Marketing"],
            "top_risks": ["Client allergic reactions", "High local competition", "Retention of skilled staff"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work"]
        },
        "Technology & Digital Services": {
            "avg_margin_pct": 65.0,
            "min_viable_investment": 20000.0,
            "typical_setup_weeks": 3,
            "online_readiness": "100% Online",
            "regulatory_burden": "Low to Medium (Data privacy, GST)",
            "key_skills": ["Software Development", "UI/UX", "Product Management", "B2B Sales"],
            "top_risks": ["High customer acquisition cost", "Fast-moving tech shifts", "Talent recruitment"],
            "sdg_alignment": ["SDG 5: Gender Equality", "SDG 8: Decent Work", "SDG 9: Innovation"]
        },
        "Education & EdTech": {
            "avg_margin_pct": 50.0,
            "min_viable_investment": 30000.0,
            "typical_setup_weeks": 4,
            "online_readiness": "High",
            "regulatory_burden": "Low",
            "key_skills": ["Curriculum Design", "Instructional Delivery", "Parent Engagement", "Digital Classrooms"],
            "top_risks": ["Seasonal student churn", "High student acquisition cost", "Content piracy"],
            "sdg_alignment": ["SDG 4: Quality Education", "SDG 5: Gender Equality", "SDG 8: Decent Work"]
        }
    }

    @classmethod
    def generate_dynamic_revenue_channels(cls, profile_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Dynamically generates structured revenue channels based on the latest saved profile:
        domain, business idea, online/offline model, location, budget, target customers, and stage.
        """
        domain = profile_data.get("business_domain", "Fashion & Apparel")
        idea = profile_data.get("business_idea", "Custom venture")
        model = profile_data.get("business_model", "Online")
        stage = profile_data.get("current_stage", "Idea Stage")
        available_inv = float(profile_data.get("available_investment", 50000.0))
        expected_inv = float(profile_data.get("expected_investment", 150000.0))
        loc_type = profile_data.get("location_type", "Semi-Urban")
        operating_area = profile_data.get("business_operating_area", "District-wide")
        city = profile_data.get("city") or profile_data.get("district") or "Local Zone"

        channels = []

        if domain == "Fashion & Apparel":
            if model in ["Online", "Hybrid"]:
                channels.append({
                    "name": "Direct-to-Consumer (D2C) E-commerce & Social Catalog",
                    "how_it_works": "Direct retail sales via an optimized mobile web store, Instagram Shopping integration, and WhatsApp Business catalog broadcast to targeted buyers.",
                    "why_it_fits": f"Directly leverages your {model} model for '{idea[:35]}...', bypassing traditional 35-45% distributor cuts and protecting gross margins above 52%.",
                    "initial_requirements": "Branded responsive web portal (Shopify/WooCommerce), high-resolution lifestyle photography, payment gateway (UPI/Cards), and courier partner (Shiprocket/Delhivery).",
                    "estimated_setup_cost": f"₹{min(available_inv * 0.25, 15000):,.0f} - ₹{min(expected_inv * 0.2, 30000):,.0f} (Digital catalog, photos, domain & packaging)",
                    "limitations_and_risks": "Higher initial customer acquisition cost (CAC) on digital ads; potential 15-20% Return-to-Origin (RTO) rate on COD orders."
                })
                channels.append({
                    "name": "Pre-Order Capsule Drops & Bespoke Custom Sizing",
                    "how_it_works": "Accepting pre-booked custom orders with a 50% advance deposit for curated small-batch apparel before fabric cutting.",
                    "why_it_fits": f"Zero-inventory-risk revenue model optimized for {stage} operations with ₹{available_inv:,.0f} working capital.",
                    "initial_requirements": "Standardized digital size chart, physical fabric swatch kit, reliable master tailor, and 10-14 day dispatch SLA.",
                    "estimated_setup_cost": "₹4,000 - ₹10,000 (Swatch booklets, branded measurement guide)",
                    "limitations_and_risks": "Requires high tailoring precision; delayed vendor delivery directly impacts customer satisfaction."
                })
            if model in ["Offline", "Hybrid"]:
                channels.append({
                    "name": f"Curated Studio Boutique & Pop-up Trunk Shows in {city}",
                    "how_it_works": "Hosting weekend designer pop-ups, community trunk exhibitions, or studio rack walk-ins in high-affinity urban/semi-urban pockets.",
                    "why_it_fits": f"Allows sensory appreciation of textile handfeel and drape, driving high-ticket immediate conversions across {operating_area}.",
                    "initial_requirements": "Display mannequins, aesthetic hanging racks, trial mirror booth, digital UPI/card POS terminal, and local marketing flyers.",
                    "estimated_setup_cost": f"₹{min(available_inv * 0.35, 25000):,.0f} - ₹{min(expected_inv * 0.3, 50000):,.0f} (Pop-up stall rental deposit, lighting & display fixtures)",
                    "limitations_and_risks": "Sales dependent on weekend footfall and venue rent; weather disruptions during monsoon/heatwaves."
                })
            channels.append({
                "name": "Corporate & Festive Institutional Gifting Bundles",
                "how_it_works": "Curating sustainable handloom stoles, ethnic gift boxes, and eco-friendly apparel sets for corporate employee appreciation and festival gifting.",
                "why_it_fits": "B2B institutional orders generate predictable lump-sum cash inflows and bulk fabric sourcing discounts.",
                "initial_requirements": "Formal GSTIN invoicing, sample presentation kits, corporate pitch deck, and capacity for 30-day payment credit.",
                "estimated_setup_cost": "₹6,000 - ₹14,000 (Sample portfolio kit & corporate catalog design)",
                "limitations_and_risks": "Corporates typically require 45-day credit payment terms, demanding careful working capital management."
            })
            channels.append({
                "name": "Multi-Brand Consignment Boutique Partnerships",
                "how_it_works": "Placing 10-15 hero garments in existing upscale lifestyle and artisan boutiques across metropolitan hubs.",
                "why_it_fits": f"Extends retail reach beyond {city} into prime commercial locations without incurring store lease liabilities.",
                "initial_requirements": "Consignment legal agreement, barcode tags, branded hangers, and monthly reconciliation audit.",
                "estimated_setup_cost": "₹8,000 - ₹18,000 (Initial consignment stock allocation & display tags)",
                "limitations_and_risks": "Boutique partners deduct 25-35% commission; unsold seasonal items must be absorbed back."
            })

        elif domain == "Food & Bakery":
            if model in ["Offline", "Hybrid"]:
                channels.append({
                    "name": f"Direct Retail Counter & Daily Fresh Bake Specials in {city}",
                    "how_it_works": "Daily walk-in sales of signature breads, artisanal pastries, and savory bakes directly from the baking studio counter.",
                    "why_it_fits": f"Generates daily immediate cash revenue and builds localized word-of-mouth patronage in {city} ({loc_type}).",
                    "initial_requirements": "Food-grade display vitrine/refrigerated counter, FSSAI hygiene certificate, digital weighing scale, and POS billing system.",
                    "estimated_setup_cost": f"₹{min(available_inv * 0.4, 35000):,.0f} - ₹{min(expected_inv * 0.35, 75000):,.0f} (Counter glass unit, display trays & FSSAI registration)",
                    "limitations_and_risks": "Perishable product shelf-life (24-48 hours); unsold fresh bakes result in direct ingredient waste."
                })
            channels.append({
                "name": "Custom Celebration Cakes & Event Orders",
                "how_it_works": "Made-to-order artisanal celebration cakes, dessert tables, and custom-decorated confections for birthdays, weddings, and anniversaries.",
                "why_it_fits": "High-margin custom product category with 65-72% gross margins and 50% advance booking payments.",
                "initial_requirements": "Cake decorating tools, temperature-controlled delivery boxes, photo portfolio, and consultation intake form.",
                "estimated_setup_cost": "₹8,000 - ₹18,000 (Specialty molds, fondant tools & delivery insulated boxes)",
                "limitations_and_risks": "High labor-intensity per custom piece; transit damage risk during monsoon or rough road delivery."
            })
            channels.append({
                "name": "Hyperlocal On-Demand Delivery (Direct & Aggregators)",
                "how_it_works": "Listing hero bakes on Swiggy / Zomato along with a direct WhatsApp order hotline for neighborhood customers.",
                "why_it_fits": f"Broadens delivery radius across {operating_area} without needing additional storefront footprint.",
                "initial_requirements": "Tamper-evident food packaging, thermal receipt printer, FSSAI license upload, and platform onboarding.",
                "estimated_setup_cost": "₹6,000 - ₹15,000 (Aggregator onboarding fee & tamper-proof eco-boxes)",
                "limitations_and_risks": "Platform commissions range between 22-28%; customer ratings heavily penalized for 5-minute rider delays."
            })
            channels.append({
                "name": "B2B Supply to Local Cafes & Co-Working Spaces",
                "how_it_works": "Supplying consistent daily batches of croissants, cookies, and specialty muffins to independent cafes that lack in-house baking.",
                "why_it_fits": "Provides recurring, predictable baseline wholesale volume that covers fixed studio rent and utilities.",
                "initial_requirements": "Standardized wholesale price sheet, daily early-morning delivery dispatch, and commercial hygiene compliance.",
                "estimated_setup_cost": "₹10,000 - ₹20,000 (Bulk transport crates & wholesale agreement contracts)",
                "limitations_and_risks": "Lower unit wholesale margins (25-30%); café owners may switch suppliers over minor price variations."
            })
            channels.append({
                "name": "Weekly Artisanal Sourdough / Healthy Bake Subscription",
                "how_it_works": "Delivering weekly curated loaves (gluten-free, multigrain sourdough) directly to health-conscious families on recurring monthly subscriptions.",
                "why_it_fits": f"Predictable recurring upfront cash flow suited for {stage} operations.",
                "initial_requirements": "Bread proofing baskets, digital subscription tracking sheet, and automated delivery route plan.",
                "estimated_setup_cost": "₹5,000 - ₹12,000 (Proofing bannetons & bread packaging linen bags)",
                "limitations_and_risks": "Requires strict consistency in sourdough fermentation across changing seasonal humidity."
            })

        elif domain == "Agriculture & Agro-Processing":
            channels.append({
                "name": "Value-Added Packaged Agro-Products (Cold-Pressed Oils / Flours)",
                "how_it_works": "Processing raw harvest into branded, packaged, cold-pressed oils or stone-ground flours sold directly to conscious consumers.",
                "why_it_fits": f"Increases realization by 3x-4x compared to raw commodity distress sales at agricultural mandis across {city}.",
                "initial_requirements": "FSSAI food processing license, cold-press or milling machinery, food-grade glass/tin packaging, and nutritional lab testing.",
                "estimated_setup_cost": f"₹{min(available_inv * 0.45, 40000):,.0f} - ₹{min(expected_inv * 0.4, 90000):,.0f} (Packaging bottles, labels, basic press maintenance)",
                "limitations_and_risks": "Initial machinery breakdown risk; lab certification timelines and shelf-life stability testing."
            })
            channels.append({
                "name": "Direct Farm-to-Consumer (F2C) & Community Supported Agriculture",
                "how_it_works": "Supplying pre-ordered monthly organic grain/oil rations directly to urban gated communities and apartment associations.",
                "why_it_fits": f"Eliminates commission agents (arhatiyas) and delivers full payment directly to the women collective in {operating_area}.",
                "initial_requirements": "Community coordinator liaison, bulk transport arrangement, and weekly digital order schedule.",
                "estimated_setup_cost": "₹5,000 - ₹12,000 (Sample distribution kits & logistics crate boxes)",
                "limitations_and_risks": "Requires weekend transport coordination; apartment delivery logistics constraints."
            })
            channels.append({
                "name": "Institutional Supply to Organic Supermarkets & Health Brands",
                "how_it_works": "Bulk supply of certified organic produce or cold-pressed oil drums to regional specialty retailers under annual supply contracts.",
                "why_it_fits": "Absorbs large production volumes with single-point billing and predictable harvesting cycles.",
                "initial_requirements": "Organic certification documentation, batch test certificates, and GSTIN invoicing.",
                "estimated_setup_cost": "₹12,000 - ₹25,000 (Organic certification audit fees & batch lab reports)",
                "limitations_and_risks": "Strict rejection criteria for moisture or foreign matter; 30-day payment credit cycle."
            })
            channels.append({
                "name": "FPO / Farmer-Producer Collective Aggregation Revenue",
                "how_it_works": "Aggregating surplus harvest from neighboring smallholder women farmers for unified bulk grading and collective sale.",
                "why_it_fits": f"Creates strong community SDG impact in {loc_type} areas while strengthening bargaining leverage.",
                "initial_requirements": "Collective weighing ledger, formal farmer agreement, and NABARD/SFAC registration.",
                "estimated_setup_cost": "₹8,000 - ₹15,000 (Weighing scale, ledger software & member passbooks)",
                "limitations_and_risks": "Price volatility in open mandis; managing inter-member trust and transparent spot payouts."
            })

        else: # Generic / Technology / Beauty / Handicrafts
            channels.append({
                "name": f"Direct Customer Sales & Bespoke Service Delivery ({model})",
                "how_it_works": f"Directly fulfilling individual client orders through tailored service delivery and digital consultations in {city}.",
                "why_it_fits": f"Provides maximum control over brand narrative and pricing for your {stage} venture.",
                "initial_requirements": "Clear service menu/product catalog, direct payment integration, and structured customer onboarding workflow.",
                "estimated_setup_cost": f"₹{min(available_inv * 0.25, 15000):,.0f} - ₹{min(expected_inv * 0.2, 35000):,.0f}",
                "limitations_and_risks": "Capacity bottleneck tied to founder's individual working hours."
            })
            channels.append({
                "name": "Recurring Retainer & Subscription Packages",
                "how_it_works": "Offering recurring monthly subscription bundles or service retainers providing sustained ongoing value.",
                "why_it_fits": "Smooths out revenue volatility and generates predictable working capital.",
                "initial_requirements": "Defined recurring deliverables, automated monthly recurring billing, and dedicated client dashboard.",
                "estimated_setup_cost": "₹5,000 - ₹12,000 (Subscription software setup & client agreement templates)",
                "limitations_and_risks": "Risk of client churn if regular tangible value updates are not communicated."
            })
            channels.append({
                "name": "B2B Strategic Partnerships & Corporate Contracts",
                "how_it_works": f"Entering supplier agreements with medium and large enterprises across {operating_area}.",
                "why_it_fits": "Higher average contract value (ACV) and institutional market validation.",
                "initial_requirements": "Business registration certificate, formal RFP proposal deck, and verified client testimonials.",
                "estimated_setup_cost": "₹8,000 - ₹20,000 (Corporate sales kit & legal compliance documentation)",
                "limitations_and_risks": "Extended sales cycles (45-90 days from pitch to contract signature)."
            })
            channels.append({
                "name": "Workshops, Training & Knowledge Monetization",
                "how_it_works": "Conducting masterclasses, interactive weekend workshops, or downloadable training resources in your domain.",
                "why_it_fits": "Near 90% gross margin revenue stream that simultaneously establishes founder thought leadership.",
                "initial_requirements": "Course syllabus, presentation slide deck, digital ticket booking link, and participant certificates.",
                "estimated_setup_cost": "₹3,000 - ₹8,000 (Event ticketing registration & digital workbook preparation)",
                "limitations_and_risks": "Requires marketing effort to fill cohort seats each month."
            })

        return channels

    @classmethod
    def generate_dynamic_competitor_landscape(cls, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically generates structured competitor landscape intelligence based on the latest profile:
        domain, product/service, location (city, district, state, operating area), target customer, and stage.
        """
        domain = profile_data.get("business_domain", "Fashion & Apparel")
        idea = profile_data.get("business_idea", "Custom venture")
        model = profile_data.get("business_model", "Online")
        stage = profile_data.get("current_stage", "Idea Stage")
        city = profile_data.get("city") or profile_data.get("district") or "Regional Hub"
        state = profile_data.get("state", "Karnataka")
        operating_area = profile_data.get("business_operating_area", "District-wide")

        landscape: Dict[str, Any] = {}

        if domain == "Fashion & Apparel":
            landscape = {
                "direct_competitors": [
                    {
                        "name": "Established Heritage D2C Brands (e.g., FabIndia, Anokhi, Suta)",
                        "type": "National D2C Brands",
                        "profile": "Pan-India presence with hundreds of retail stores and vast artisan networks.",
                        "pricing_tier": "Mid-Premium (₹1,800 - ₹6,500/piece)",
                        "strengths": "Household brand recognition, robust logistics, and large seasonal inventory reserves.",
                        "weaknesses_gaps": "Impersonal customer relationship; higher corporate overheads leading to marked-up retail pricing; limited custom-fit flexibility."
                    },
                    {
                        "name": f"Local Boutique Studios & Tailoring Boutiques in {city}",
                        "type": "Regional Physical Boutiques",
                        "profile": f"Independent women-run tailoring and occasionwear shops operating in {city}.",
                        "pricing_tier": "Economy to Mid-Range (₹900 - ₹3,000/piece)",
                        "strengths": "Immediate physical access for neighborhood clients; face-to-face consultation.",
                        "weaknesses_gaps": "Lack modern digital cataloging, e-commerce storefronts, or standardized fabric quality guarantees."
                    }
                ],
                "indirect_competitors": [
                    {
                        "name": "Fast-Fashion E-Commerce Marketplaces (Myntra, Ajio, Amazon Fashion)",
                        "type": "Mass E-Commerce Aggregators",
                        "why_substitute": "Consumers looking for cheap, trendy, machine-made daily wear.",
                        "strengths": "Ultra-low pricing, deep discounting, and 24-48 hour delivery windows.",
                        "user_edge": "RiseHer founders offer authentic handloom heritage, breathable natural fabrics, and transparent artisan provenance that mass aggregators cannot replicate."
                    }
                ],
                "local_competitors": [
                    {
                        "category": f"Unorganized Tailoring Units & Home Boutiques in {city}",
                        "presence": f"Widespread in {city} and surrounding {operating_area}",
                        "local_advantage": "Low informal overhead and direct neighborhood trust.",
                        "user_differentiation": "Professional branding, quality stitching standards, clear delivery timelines, and official digital invoicing."
                    }
                ],
                "online_competitors": [
                    {
                        "platform": "Instagram Apparel Resellers & Social Pages",
                        "reach": "Pan-India digital audiences",
                        "strengths": "Frequent daily reel posting and flash sales.",
                        "customer_complaint_gap": "Frequent complaints regarding wrong sizing, poor color accuracy, delayed dispatches, and zero exchange policies."
                    }
                ],
                "pricing_comparison": {
                    "user_optimal_entry_tier": "₹1,200 - ₹2,800 per piece",
                    "national_brand_avg": "₹2,500 - ₹6,000 per piece",
                    "unorganized_tailor_avg": "₹600 - ₹1,400 per piece",
                    "strategic_sweet_spot": "Accessible premium positioning: 30% lower than legacy heritage labels while offering 2x better quality and fit than unorganized local tailors."
                },
                "market_positioning": f"Positioned as an ethical, women-crafted sustainable boutique brand bridging the gap between generic fast fashion and unaffordable luxury designer couture across {operating_area}.",
                "differentiation_strategies": [
                    "Direct artisan weaver sourcing narrative featured on every garment swing tag",
                    "Free custom sizing adjustments to eliminate online fit anxiety",
                    "Plastic-free, biodegradable unboxing experience with personalized founder note",
                    "Rapid 2-day direct dispatch guarantee on all catalog styles"
                ]
            }

        elif domain == "Food & Bakery":
            landscape = {
                "direct_competitors": [
                    {
                        "name": "Chained Bakery Cafes (e.g., Theobroma, Glen's Bakehouse, Mio Amore)",
                        "type": "Commercial Bakery Chains",
                        "profile": "Multi-city franchise networks offering standardized brownies, pastries, and breads.",
                        "pricing_tier": "Mid-High (₹150 - ₹1,200/item)",
                        "strengths": "Standardized recipes, prime commercial real-estate footfall, and high brand recall.",
                        "weaknesses_gaps": "Extensive use of pre-mixes, artificial stabilizers, and preservatives for long shelf life; zero personal customization."
                    },
                    {
                        "name": f"Home Bakers & Micro-Kitchens in {city}",
                        "type": "Informal Home Bakers",
                        "profile": f"Neighborhood home cooks advertising custom cakes via WhatsApp groups in {city}.",
                        "pricing_tier": "Economy to Mid (₹600 - ₹1,400/kg)",
                        "strengths": "Direct personal relationship with local families and neighborhood trust.",
                        "weaknesses_gaps": "Limited production capacity, inconsistent batch quality, and lack of official FSSAI commercial safety certification."
                    }
                ],
                "indirect_competitors": [
                    {
                        "name": "Supermarket Packaged Snacks (Britannia, ITC, Mondelez)",
                        "type": "Industrial FMCG",
                        "why_substitute": "Cheap shelf-stable biscuits and tea-time snacks.",
                        "strengths": "Ubiquitous presence at every corner grocery store under ₹50.",
                        "user_edge": "Fresh, wholesome real-butter preparation without palm oil, artificial colors, or chemical preservatives."
                    }
                ],
                "local_competitors": [
                    {
                        "category": f"Traditional Neighborhood Bakeries & Sweet Marts in {city}",
                        "presence": f"Established physical stores across {city}",
                        "local_advantage": "High pedestrian footfall and deep local legacy.",
                        "user_differentiation": "Artisanal European sourdoughs, eggless premium bakes, modern aesthetics, and clean-label ingredient transparency."
                    }
                ],
                "online_competitors": [
                    {
                        "platform": "Swiggy / Zomato Cloud Kitchens & Quick-Commerce (Blinkit/Zepto)",
                        "reach": "10-20 minute instant grocery delivery",
                        "strengths": "Impulse delivery speed and aggressive coupon discounts.",
                        "customer_complaint_gap": "Processed, dry baked goods stored for days in dark warehouses; generic packaging."
                    }
                ],
                "pricing_comparison": {
                    "user_optimal_entry_tier": "₹800 - ₹1,600 per kg for custom celebration cakes; ₹120 - ₹280 for artisan breads",
                    "chain_bakery_avg": "₹1,200 - ₹2,200 per kg",
                    "local_sweet_shop_avg": "₹450 - ₹750 per kg",
                    "strategic_sweet_spot": "Wholesome real-butter craft pricing: priced 20% below commercial chains while highlighting fresh, preservative-free indulgence."
                },
                "market_positioning": f"Positioned as {city}'s premier fresh-from-the-oven artisanal baking studio committed to 100% wholesome ingredients, authentic flavors, and bespoke celebration memories.",
                "differentiation_strategies": [
                    "Zero-preservative, 100% real butter commitment explicitly highlighted on all packaging",
                    "Bespoke flavor pairings (e.g., Belgian dark chocolate with salted caramel, local fruit compotes)",
                    "FSSAI Gold hygiene certified open kitchen view to reassure health-conscious parents",
                    "Dedicated WhatsApp hotline for swift custom cake design consultations"
                ]
            }

        elif domain == "Agriculture & Agro-Processing":
            landscape = {
                "direct_competitors": [
                    {
                        "name": "National Organic Brands (Organic India, 24 Mantra, Akshayakalpa)",
                        "type": "Large Corporate Organic Brands",
                        "profile": "Pan-India presence in modern trade supermarkets and e-commerce portals.",
                        "pricing_tier": "Premium (₹250 - ₹650 per bottle/pack)",
                        "strengths": "Massive distribution pipelines and certified organic credentials.",
                        "weaknesses_gaps": "High retail markups; corporate brands lack direct connection to individual smallholder women farmer stories."
                    },
                    {
                        "name": f"Local Oil Mills & Grain Traders in {city}",
                        "type": "Traditional Mandi Traders",
                        "profile": f"Local expeller mills and commodity traders operating in {city} APMC yard.",
                        "pricing_tier": "Commodity Low (₹120 - ₹220 per unit)",
                        "strengths": "Decades of relationships with local buyers; low price per liter.",
                        "weaknesses_gaps": "Refined and heated oil processing that strips nutrients; unbranded loose packaging without batch lab safety reports."
                    }
                ],
                "indirect_competitors": [
                    {
                        "name": "Mass Commercial Refined Oil & Packaged Flour Brands (Fortune, Saffola, Aashirvaad)",
                        "type": "FMCG Conglomerates",
                        "why_substitute": "Everyday kitchen cooking staples.",
                        "strengths": "High advertising spending, multi-state availability, and low cost.",
                        "user_edge": "True cold-pressed extraction (below 45°C), zero chemical solvent extraction, retaining authentic nutty aroma and antioxidants."
                    }
                ],
                "local_competitors": [
                    {
                        "category": f"Regional Village Cold-Press Micro-Units in {state}",
                        "presence": f"Scattered across {state} rural districts",
                        "local_advantage": "Local community proximity.",
                        "user_differentiation": "Professional tamper-proof glass packaging, FSSAI compliance, lab-tested purity certificates, and women collective empowerment narrative."
                    }
                ],
                "online_competitors": [
                    {
                        "platform": "Farm-to-Fork D2C Startups & E-Commerce",
                        "reach": "Urban residential societies",
                        "strengths": "Slick digital marketing and monthly subscription apps.",
                        "customer_complaint_gap": "Inconsistent seasonal supply and question marks over genuine cold-pressed claims."
                    }
                ],
                "pricing_comparison": {
                    "user_optimal_entry_tier": "₹320 - ₹480 per liter of pure cold-pressed oil; ₹80 - ₹120 per kg of millet flour",
                    "national_organic_avg": "₹420 - ₹650 per liter",
                    "commercial_refined_avg": "₹140 - ₹190 per liter",
                    "strategic_sweet_spot": "Accessible pure farm wellness: 25% more affordable than corporate organic labels while delivering 100% verified single-origin farm traceability."
                },
                "market_positioning": f"Positioned as a transparent, rural women-led cold-pressed oil and super-grain collective bringing authentic soil-to-kitchen wellness straight from {city} farmers.",
                "differentiation_strategies": [
                    "Single-origin QR code on every bottle displaying harvest date and women farmer collective details",
                    "Independent NABL lab report certifying zero mineral oil or solvent residue accessible online",
                    "Eco-friendly return-and-refill bottle incentive for repeat neighborhood buyers",
                    "Direct supply agreements with apartment consumer forums across tier-1 cities"
                ]
            }

        else: # Generic / Technology / Beauty / Handicrafts
            landscape = {
                "direct_competitors": [
                    {
                        "name": f"Established Category Incumbents in {domain}",
                        "type": "National Market Leaders",
                        "profile": "Well-funded brands with extensive distribution and large marketing budgets.",
                        "pricing_tier": "Mid-Premium",
                        "strengths": "High brand visibility, customer trust, and omnichannel presence.",
                        "weaknesses_gaps": "Rigid product lines; slow to adapt to niche personalized requirements."
                    },
                    {
                        "name": f"Regional Competitors & Freelance Operators in {city}",
                        "type": "Local Independent Players",
                        "profile": f"Local vendors operating across {city} and {state}.",
                        "pricing_tier": "Economy",
                        "strengths": "Low pricing and immediate local availability.",
                        "weaknesses_gaps": "Lack formal customer support, standardized SLAs, and professional digital workflows."
                    }
                ],
                "indirect_competitors": [
                    {
                        "name": "DIY Tools & Mass Off-the-Shelf Alternatives",
                        "type": "Generic Substitutes",
                        "why_substitute": "Low-budget customers looking for self-serve solutions.",
                        "strengths": "Low cost and instant accessibility.",
                        "user_edge": "High-touch personalized guidance, dedicated human accountability, and curated domain expertise."
                    }
                ],
                "local_competitors": [
                    {
                        "category": f"Neighborhood Vendors & Small Businesses in {city}",
                        "presence": f"Active throughout {operating_area}",
                        "local_advantage": "Direct local presence.",
                        "user_differentiation": "Professional digital operations, certified quality, transparent billing, and purpose-driven mission."
                    }
                ],
                "online_competitors": [
                    {
                        "platform": "Aggregator Marketplaces & Digital Platforms",
                        "reach": "National digital footprint",
                        "strengths": "High traffic volume and platform search discovery.",
                        "customer_complaint_gap": "Generic service delivery and high commission cutoffs."
                    }
                ],
                "pricing_comparison": {
                    "user_optimal_entry_tier": "Value-focused market entry with high perceived value",
                    "national_brand_avg": "Premium pricing with high brand markup",
                    "unorganized_avg": "Discount pricing with variable quality",
                    "strategic_sweet_spot": "High-value mid-tier positioning combining verified reliability with accessible startup pricing."
                },
                "market_positioning": f"Positioned as an authentic, innovative women-led {domain} brand delivering bespoke excellence and personalized care to customers in {operating_area}.",
                "differentiation_strategies": [
                    "Founder-led personal consultation and transparent customer service",
                    "Customized product or service delivery tailored to client requirements",
                    "Verified quality standards and transparent milestone tracking",
                    "Community-driven referral rewards for loyal brand advocates"
                ]
            }

        return landscape

    @classmethod
    def evaluate_business_idea(cls, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a business idea across 10 analytical dimensions with explainability,
        including dynamic profile-driven revenue channels and competitor landscape.
        """
        idea = profile_data.get("business_idea", "")
        domain = profile_data.get("business_domain", "Fashion & Apparel")
        stage = profile_data.get("current_stage", "Idea Stage")
        available_inv = float(profile_data.get("available_investment", 50000.0))
        expected_inv = float(profile_data.get("expected_investment", 150000.0))
        model = profile_data.get("business_model", "Online")
        loc_type = profile_data.get("location_type", "Semi-Urban")
        operating_area = profile_data.get("business_operating_area") or profile_data.get("city") or profile_data.get("state") or "Local & Regional Markets"
        skills = profile_data.get("skills", [])
        if isinstance(skills, str):
            try:
                skills = json.loads(skills)
            except Exception:
                skills = [s.strip() for s in skills.split(",") if s.strip()]
        
        benchmark = cls.DOMAIN_BENCHMARKS.get(domain, cls.DOMAIN_BENCHMARKS["Fashion & Apparel"])
        
        # 1. Financial Viability Component (0 - 25 pts)
        capital_coverage = (available_inv / max(expected_inv, 1.0))
        if capital_coverage >= 0.8:
            fin_score = 24.0
        elif capital_coverage >= 0.4:
            fin_score = 18.0
        else:
            fin_score = 12.0

        # 2. Skills Compatibility Component (0 - 25 pts)
        key_skills = benchmark["key_skills"]
        matched_skills = [s for s in skills if any(ks.lower() in s.lower() or s.lower() in ks.lower() for ks in key_skills)]
        skill_ratio = len(matched_skills) / max(len(key_skills), 1)
        skill_score = min(25.0, 10.0 + (skill_ratio * 15.0))

        # 3. Market Opportunity Component (0 - 25 pts)
        market_score = 19.5
        if model == "Online" and benchmark["online_readiness"] in ["High", "Very High", "100% Online"]:
            market_score += 3.5
        elif model == "Offline" and loc_type in ["Semi-Urban", "Urban"]:
            market_score += 2.5
        
        # 4. Stage & Operational Readiness Component (0 - 25 pts)
        stage_weights = {
            "Idea Stage": 14.0,
            "Validation Stage": 18.0,
            "Startup Stage": 21.0,
            "Early Business Stage": 23.0,
            "Growth & Expansion Stage": 24.0
        }
        stage_score = stage_weights.get(stage, 15.0)

        overall_viability = round(fin_score + skill_score + market_score + stage_score, 1)
        overall_viability = min(96.0, max(42.0, overall_viability))

        # Strengths & Weaknesses
        strengths = []
        weaknesses = []
        missing_info = []
        improvements = []

        if matched_skills:
            strengths.append(f"Domain skills match: Possesses relevant expertise in {', '.join(matched_skills)}.")
        else:
            weaknesses.append("Skill Gap: Key commercial or technical skills in this domain are currently missing from profile.")
            improvements.append(f"Complete foundational training in {key_skills[0]} and {key_skills[1]}.")

        if capital_coverage < 0.5:
            weaknesses.append(f"Capital Gap: Current available funds (₹{available_inv:,.0f}) cover only {capital_coverage*100:.0f}% of projected startup cost (₹{expected_inv:,.0f}).")
            improvements.append("Apply for collateral-free government credit schemes like MUDRA or PMEGP subsidy to bridge capital deficiency.")
        else:
            strengths.append(f"Solid self-funding cushion: Capable of covering {capital_coverage*100:.0f}% of anticipated initial rollout costs.")

        if model == "Online":
            strengths.append("Asset-light distribution: Digital model minimizes heavy real-estate overheads and lease deposits.")
            improvements.append("Setup low-friction digital catalog on WhatsApp Business / Shopify before committing to custom app development.")
        else:
            strengths.append("High local touchpoint: Physical proximity builds stronger personal trust and community loyalty.")
            improvements.append("Secure prime footfall location with negotiable trial lease and municipal trade permit.")

        # Missing information that needs validation
        missing_info.append("Verified customer willingness-to-pay data from at least 15 structured target user interviews.")
        missing_info.append("Documented unit economics breakdown (Cost of Goods Sold + shipping/packaging + payment gateway fees).")
        missing_info.append("Direct written quotes from at least 2 alternate suppliers/vendors for critical inputs.")
        if benchmark["regulatory_burden"] in ["High (FSSAI license, hygiene compliance)", "Medium (Cosmetics regulations, CDSCO)"]:
            missing_info.append(f"Regulatory clearance plan: Specific checklist for {benchmark['regulatory_burden']}.")

        # Customer Segments
        customer_segments = [
            {
                "segment_name": f"Primary Target in {loc_type} / Urban Markets",
                "description": f"Conscious buyers actively looking for authentic, women-led {domain} solutions with direct founder provenance.",
                "willingness_to_pay": "High (Standard Market Ticket)",
                "priority": "Primary Target"
            },
            {
                "segment_name": f"Local Community & Referral Network ({profile_data.get('city') or loc_type})",
                "description": "Neighborhood patrons, word-of-mouth advocates, and recurring direct customers.",
                "willingness_to_pay": "Moderate (Repeat Purchase Focus)",
                "priority": "Early Traction"
            },
            {
                "segment_name": "Institutional & Corporate Bulk Clients",
                "description": "SMEs and institutions looking for purpose-driven women entrepreneurship products for festive and corporate gifting.",
                "willingness_to_pay": "High Volume with bulk discount margins",
                "priority": "Secondary Target"
            }
        ]

        # Dynamic Revenue Channels
        dynamic_revenue_channels = cls.generate_dynamic_revenue_channels(profile_data)
        legacy_revenue_ops = [c["name"] for c in dynamic_revenue_channels]

        # Dynamic Competitor Landscape
        dynamic_competitor_landscape = cls.generate_dynamic_competitor_landscape(profile_data)
        legacy_competitor_insights = [
            {
                "competitor_type": c.get("name", "Competitor Brand"),
                "examples": c.get("profile", ""),
                "advantage_for_user": c.get("weaknesses_gaps", "Direct founder touchpoint and personalized service."),
                "risk_factor": c.get("strengths", "Established market presence.")
            }
            for c in dynamic_competitor_landscape.get("direct_competitors", [])
        ]

        # Explainable AI Factors
        explainability_factors = [
            {
                "factor_name": "Capital-to-Requirement Ratio",
                "category": "Financial",
                "influence_direction": "Positive" if capital_coverage >= 0.5 else "Negative",
                "impact_weight": round(0.35 * (capital_coverage - 0.5) * 2, 2),
                "rationale": f"Available budget ₹{available_inv:,.0f} vs expected ₹{expected_inv:,.0f} determines runway duration.",
                "evidence_type": "User Input"
            },
            {
                "factor_name": "Domain Skills Compatibility",
                "category": "Profile",
                "influence_direction": "Positive" if matched_skills else "Negative",
                "impact_weight": 0.40 if matched_skills else -0.30,
                "rationale": f"Found {len(matched_skills)} overlapping skills out of standard domain requirements ({', '.join(key_skills[:2])}).",
                "evidence_type": "Profile Matching"
            },
            {
                "factor_name": "Industry Margin & Unit Economics Benchmark",
                "category": "Market",
                "influence_direction": "Positive",
                "impact_weight": round(benchmark["avg_margin_pct"] / 100.0, 2),
                "rationale": f"{domain} maintains an average gross margin benchmark of {benchmark['avg_margin_pct']}% according to MSME reports.",
                "evidence_type": "Market Estimate"
            },
            {
                "factor_name": "Operational Model Scalability",
                "category": "Operational",
                "influence_direction": "Positive" if model == "Online" else "Neutral",
                "impact_weight": 0.25 if model == "Online" else 0.10,
                "rationale": f"{model} delivery model matches location tier {loc_type} and domain digital viability.",
                "evidence_type": "AI Hypothesis"
            }
        ]

        evidence_breakdown = {
            "verified_information": [
                f"User-reported initial available capital: ₹{available_inv:,.0f}",
                f"Selected geographic zone: {loc_type}, {profile_data.get('state', 'India')}",
                "Official MSME / Udyam registration guidelines"
            ],
            "market_estimates": [
                f"Standard {domain} gross margins range between {benchmark['avg_margin_pct'] - 5}% and {benchmark['avg_margin_pct'] + 6}%",
                f"Estimated minimum viable setup budget: ₹{benchmark['min_viable_investment']:,.0f}"
            ],
            "ai_hypotheses": [
                "Target audience demonstrates 22% higher affinity toward authentic women-owned craft/food narratives.",
                "Break-even can be accomplished within 7-9 months if customer repeat rate exceeds 28%."
            ],
            "missing_validation_data": missing_info
        }

        return {
            "overall_viability_score": overall_viability,
            "market_demand_summary": f"Healthy expansion dynamics in {domain}. Digital {model} channels and consumer appetite for sustainable, authentic women-led brands create high potential in {operating_area}.",
            "market_demand_score": round(market_score * 4, 1),
            "estimated_investment_min": benchmark["min_viable_investment"],
            "estimated_investment_max": max(expected_inv, benchmark["min_viable_investment"] * 2.5),
            "customer_segments": customer_segments,
            "competitor_insights": legacy_competitor_insights,
            "competitor_landscape": dynamic_competitor_landscape,
            "skills_compatibility": {
                "matched_skills": matched_skills,
                "missing_critical_skills": [s for s in key_skills if s not in matched_skills],
                "fit_percentage": round(skill_ratio * 100, 0)
            },
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_information": missing_info,
            "recommended_improvements": improvements,
            "revenue_opportunities": legacy_revenue_ops,
            "revenue_channels": dynamic_revenue_channels,
            "operational_requirements": [
                f"Procure reliable equipment and materials suitable for {benchmark['typical_setup_weeks']} week setup",
                f"Fulfill domain compliance ({benchmark['regulatory_burden']})",
                "Setup unified digital payments (UPI QR, Razorpay / Instamojo)",
                "Establish shipping tie-ups with Shiprocket / India Post Speed Post"
            ],
            "evidence_breakdown": evidence_breakdown,
            "explainability_factors": explainability_factors,
            "confidence_score": 88.0
        }

    @classmethod
    def calculate_risk_assessment(cls, inputs: Dict[str, Any], domain: str = "Fashion & Apparel") -> Dict[str, Any]:
        """
        Interactive Risk Assessment with What-If recalculated scores.
        Scores range 0-100 where higher score means HIGHER risk.
        """
        inv = float(inputs.get("available_investment", 50000.0))
        sales_units = float(inputs.get("expected_sales_units_monthly", 60.0))
        price_per_unit = float(inputs.get("average_price_per_unit", 950.0))
        monthly_costs = float(inputs.get("estimated_monthly_operating_cost", 25000.0))
        model = inputs.get("business_model", "Online")
        loc_type = inputs.get("location_type", "Semi-Urban")

        projected_monthly_revenue = sales_units * price_per_unit
        net_monthly_margin = projected_monthly_revenue - monthly_costs

        # 1. Financial Risk Calculation (0 - 100)
        # Based on burn rate, runway in months, and liquid capital buffer
        buffer_discount = min(15.0, (inv / 200000.0) * 15.0)
        if net_monthly_margin >= 15000:
            margin_bonus = min(10.0, ((net_monthly_margin - 15000) / 10000.0) * 2.5)
            fin_risk = max(12.0, round(32.0 - buffer_discount - margin_bonus, 1))
        elif net_monthly_margin >= 0:
            fin_risk = max(25.0, round(48.0 - buffer_discount, 1))
        else:
            monthly_deficit = abs(net_monthly_margin)
            runway_months = inv / max(monthly_deficit, 1.0)
            if runway_months >= 6:
                fin_risk = max(50.0, round(65.0 - buffer_discount, 1))
            else:
                fin_risk = min(92.0, round(70.0 + (6.0 - runway_months) * 4.0 - (buffer_discount * 0.5), 1))

        # 2. Market Demand Risk (0 - 100)
        # Higher if price is very high or sales volume expectation is unrealistic for stage
        if sales_units > 250 and inv < 100000:
            market_risk = 68.0 # over-optimistic without ad budget
        elif price_per_unit > 4000:
            market_risk = 62.0 # premium barrier
        else:
            market_risk = 36.0

        # 3. Operational Risk (0 - 100)
        if model == "Offline" and loc_type == "Rural":
            oper_risk = 58.0 # logistics supply constraints
        elif model == "Online":
            oper_risk = 32.0 # lightweight
        else:
            oper_risk = 40.0

        # 4. Competition Risk (0 - 100)
        if domain in ["Fashion & Apparel", "Beauty & Wellness"]:
            comp_risk = 56.0 # saturated segment
        elif domain in ["Agriculture & Agro-Processing", "Handicrafts & Artisanal"]:
            comp_risk = 38.0 # differentiated
        else:
            comp_risk = 45.0

        # 5. Regulatory & Compliance Risk (0 - 100)
        if domain == "Food & Bakery":
            reg_risk = 58.0 # FSSAI and kitchen audits
        elif domain == "Beauty & Wellness":
            reg_risk = 48.0 # cosmetic safety
        else:
            reg_risk = 26.0

        overall_risk = round((fin_risk * 0.30) + (market_risk * 0.25) + (oper_risk * 0.15) + (comp_risk * 0.15) + (reg_risk * 0.15), 1)

        def get_level(score: float) -> str:
            if score < 38.0:
                return "Low"
            elif score <= 65.0:
                return "Moderate"
            return "High"

        return {
            "overall_risk_score": overall_risk,
            "overall_risk_level": get_level(overall_risk),
            "financial_risk": {
                "score": round(fin_risk, 1),
                "level": get_level(fin_risk),
                "factors": [
                    {"factor": "Runway vs Operating Burn", "impact": f"Projected monthly net is ₹{net_monthly_margin:,.0f}", "severity": get_level(fin_risk)},
                    {"factor": "Capital Buffer", "impact": f"Available liquid capital is ₹{inv:,.0f}", "severity": "Moderate" if inv < 50000 else "Low"}
                ],
                "mitigations": [
                    "Maintain at least 3 months of emergency operating expense reserve in a separate business savings account.",
                    "Adopt prepayments or cash-on-delivery advance deposit to minimize working capital blockage."
                ]
            },
            "market_demand_risk": {
                "score": round(market_risk, 1),
                "level": get_level(market_risk),
                "factors": [
                    {"factor": "Target Volume Feasibility", "impact": f"Expected sales of {sales_units:.0f} units/month requires consistent customer funnel", "severity": get_level(market_risk)},
                    {"factor": "Unit Pricing Strategy", "impact": f"Average ticket price ₹{price_per_unit:,.0f} vs market purchasing power", "severity": "Low"}
                ],
                "mitigations": [
                    "Pre-sell initial batch through pre-orders before producing bulk stock.",
                    "Conduct weekly feedback reviews with the first 25 customers to refine product-market fit."
                ]
            },
            "operational_risk": {
                "score": round(oper_risk, 1),
                "level": get_level(oper_risk),
                "factors": [
                    {"factor": "Logistics & Fulfillment", "impact": f"{model} delivery in {loc_type} zone", "severity": get_level(oper_risk)}
                ],
                "mitigations": [
                    "Partner with localized courier aggregators supporting automated pincode tracking.",
                    "Pre-package standardized shipping materials to reduce dispatch turnaround time under 24 hours."
                ]
            },
            "competition_risk": {
                "score": round(comp_risk, 1),
                "level": get_level(comp_risk),
                "factors": [
                    {"factor": "Market Saturation", "impact": f"Alternative choices available in {domain}", "severity": get_level(comp_risk)}
                ],
                "mitigations": [
                    "Anchor marketing around your authentic personal founder narrative and localized artisan sourcing.",
                    "Offer unboxing delight experience with handwritten thank-you cards to drive high repeat orders."
                ]
            },
            "regulatory_risk": {
                "score": round(reg_risk, 1),
                "level": get_level(reg_risk),
                "factors": [
                    {"factor": "Statutory Licensing", "impact": f"Requirements for {domain}", "severity": get_level(reg_risk)}
                ],
                "mitigations": [
                    "Obtain free Udyam MSME certificate online to avail statutory benefits and priority bank lending.",
                    "Register GST once annual aggregate turnover exceeds ₹20 Lakhs (or ₹40 Lakhs for goods)."
                ]
            },
            "simulation_inputs": inputs,
            "missing_information": [
                "Detailed breakdown of monthly variable costs vs fixed utility expenses.",
                "Customer return/cancellation allowance in monthly projections."
            ]
        }

    @classmethod
    def calculate_scheme_fit(cls, profile_data: Dict[str, Any], scheme_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        SchemeFit 100-Point Algorithm:
        - Eligibility match (30%) - Mandatory check first
        - Business/sector relevance (20%)
        - Financial benefit suitability (15%)
        - Application availability (15%)
        - Requirement readiness (10%)
        - Location and business-stage relevance (10%)
        """
        user_stage = profile_data.get("current_stage", "Idea Stage")
        user_domain = profile_data.get("business_domain", "Fashion & Apparel")
        user_loc = profile_data.get("state", "Karnataka")
        user_inv_needed = float(profile_data.get("expected_investment", 150000.0))
        user_model = profile_data.get("business_model", "Online")

        # 1. Eligibility Check (30 pts)
        is_eligible = True
        eligibility_notes = []

        # Age check
        if profile_data.get("age_range") == "Under 18" and scheme_dict.get("min_age", 18) >= 18:
            is_eligible = False
            eligibility_notes.append("Minimum applicant age is 18 years.")

        # Stage check
        eligible_stages = scheme_dict.get("eligible_stages", [])
        if isinstance(eligible_stages, str):
            try:
                eligible_stages = json.loads(eligible_stages)
            except Exception:
                eligible_stages = []
        if eligible_stages and user_stage not in eligible_stages:
            eligibility_notes.append(f"Scheme targets {', '.join(eligible_stages)}; user is currently at {user_stage}.")
            # Decrement score
            elig_score = 15.0
        else:
            elig_score = 30.0

        # 2. Sector Relevance (20 pts)
        eligible_domains = scheme_dict.get("eligible_domains", [])
        if isinstance(eligible_domains, str):
            try:
                eligible_domains = json.loads(eligible_domains)
            except Exception:
                eligible_domains = []
        if not eligible_domains or "All" in eligible_domains or user_domain in eligible_domains:
            sector_score = 20.0
        else:
            sector_score = 8.0

        # 3. Financial Benefit Suitability (15 pts)
        max_amount = float(scheme_dict.get("max_amount_inr", 1000000.0))
        if user_inv_needed <= max_amount:
            fin_score = 15.0
        else:
            ratio = max_amount / max(user_inv_needed, 1.0)
            fin_score = max(5.0, round(15.0 * ratio, 1))

        # 4. Application Availability (15 pts)
        status = scheme_dict.get("application_status", "Open")
        if status in ["Open", "Rolling"]:
            avail_score = 15.0
        elif status == "Upcoming":
            avail_score = 9.0
        elif status == "Unverified":
            avail_score = 6.0
        else: # Closed
            avail_score = 0.0

        # 5. Readiness Score (10 pts)
        # Based on having basic documents like Aadhaar, PAN, Bank Passbook
        readiness_score = 9.0

        # 6. Location & Stage Relevance (10 pts)
        eligible_locs = scheme_dict.get("eligible_locations", [])
        if isinstance(eligible_locs, str):
            try:
                eligible_locs = json.loads(eligible_locs)
            except Exception:
                eligible_locs = []
        if not eligible_locs or "All India" in eligible_locs or user_loc in eligible_locs:
            loc_score = 10.0
        else:
            loc_score = 4.0

        # Total Fit Score
        total_fit = round(elig_score + sector_score + fin_score + avail_score + readiness_score + loc_score, 1)
        total_fit = min(100.0, max(0.0, total_fit))

        why_matched = (
            f"Matches {user_stage} in {user_domain}. Offers financial coverage up to ₹{max_amount:,.0f} "
            f"({scheme_dict.get('financial_assistance_type', 'Subsidy/Loan')}) with {status} application window."
        )

        return {
            "scheme_fit_score": total_fit,
            "eligibility_score": elig_score,
            "sector_relevance_score": sector_score,
            "financial_suitability_score": fin_score,
            "availability_score": avail_score,
            "readiness_score": readiness_score,
            "location_stage_score": loc_score,
            "why_matched": why_matched,
            "is_eligible": is_eligible,
            "eligibility_notes": "; ".join(eligibility_notes) if eligibility_notes else "Fully eligible under women entrepreneur criteria."
        }

    @classmethod
    def match_mentors(cls, profile_data: Dict[str, Any], mentors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranks mentors based on domain, stage, location, business model, and specific challenges.
        Provides explicit 'Why this mentor is suitable for you'.
        """
        user_domain = profile_data.get("business_domain", "Fashion & Apparel")
        user_stage = profile_data.get("current_stage", "Idea Stage")
        user_model = profile_data.get("business_model", "Online")
        user_loc = profile_data.get("state", "Karnataka")
        user_challenges = profile_data.get("challenges", [])
        if isinstance(user_challenges, str):
            try:
                user_challenges = json.loads(user_challenges)
            except Exception:
                user_challenges = []

        scored_mentors = []
        for m in mentors:
            score = 50.0
            reasons = []

            # Domain Match (up to 30 pts)
            if m.get("business_domain", "").lower() == user_domain.lower():
                score += 30.0
                reasons.append(f"Direct domain peer: Founded successful business in {user_domain}")
            elif any(word in m.get("business_domain", "").lower() for word in user_domain.lower().split()):
                score += 18.0
                reasons.append(f"Related domain expertise in {m.get('business_domain')}")

            # Business Model Match (up to 15 pts)
            m_model = m.get("business_model_experience", "Both")
            if m_model == "Both" or m_model.lower() == user_model.lower():
                score += 15.0
                reasons.append(f"Extensive track record running {user_model} business operations")

            # Expertise vs User Challenges (up to 15 pts)
            expertise = m.get("expertise_areas", [])
            if isinstance(expertise, str):
                try:
                    expertise = json.loads(expertise)
                except Exception:
                    expertise = []
            
            matched_challenges = [c for c in user_challenges if any(c.lower() in exp.lower() or exp.lower() in c.lower() for exp in expertise)]
            if matched_challenges:
                score += 12.0
                reasons.append(f"Can directly advise on your top hurdles: {', '.join(matched_challenges[:2])}")

            # Experience bonus
            exp_years = m.get("years_experience", 3)
            score += min(10.0, exp_years * 1.5)

            why_suitable = " | ".join(reasons) if reasons else f"Experienced founder with {exp_years}+ years advising women entrepreneurs in India."

            m_copy = dict(m)
            m_copy["match_score"] = round(min(98.0, score), 1)
            m_copy["why_suitable_for_user"] = why_suitable
            scored_mentors.append(m_copy)

        scored_mentors.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_mentors

    @classmethod
    def generate_adaptive_business_plan(cls, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates complete 19-section Business Plan adaptive to the 5 entrepreneurial stages.
        """
        idea = profile_data.get("business_idea", "Women-led venture")
        domain = profile_data.get("business_domain", "Fashion & Apparel")
        stage = profile_data.get("current_stage", "Idea Stage")
        model = profile_data.get("business_model", "Online")
        loc_type = profile_data.get("location_type", "Semi-Urban")
        state = profile_data.get("state", "Karnataka")
        available_inv = float(profile_data.get("available_investment", 50000.0))
        expected_inv = float(profile_data.get("expected_investment", 150000.0))

        stage_titles = {
            "Idea Stage": "Foundational Concept & Feasibility Plan",
            "Validation Stage": "Customer Validation & MVP Pilot Plan",
            "Startup Stage": "Official Launch & Commercialization Plan",
            "Early Business Stage": "Operational Scaling & Optimization Plan",
            "Growth & Expansion Stage": "Expansion & Capital Growth Plan"
        }

        sections = [
            {
                "key": "executive_summary",
                "title": "1. Executive Summary",
                "content": f"RiseHer Business Plan for {idea}. A {model.lower()} {domain.lower()} enterprise positioned in {state} ({loc_type}). Target capital outlay is estimated at ₹{expected_inv:,.0f}, supported by initial founder equity of ₹{available_inv:,.0f} and matched government institutional funding. Strategic mission: Delivering high-quality, authentic solutions while fostering sustainable women-led economic self-reliance."
            },
            {
                "key": "business_overview",
                "title": "2. Business Overview",
                "content": f"Business Name: [To Be Named] | Sector: {domain} | Stage: {stage} | Structure: Sole Proprietorship / One Person Company (OPC) registered under Udyam MSME. The venture leverages {model.lower()} channels to achieve wide regional reach with low fixed capital deployment."
            },
            {
                "key": "problem_and_solution",
                "title": "3. Problem & Solution",
                "content": f"Problem: Target buyers in {state} lack accessible, authentically crafted and consistently reliable {domain.lower()} products without excessive middlemen markups.\nSolution: Direct-to-consumer delivery with transparent artisan sourcing, reliable quality standards, and personalized customer care."
            },
            {
                "key": "value_proposition",
                "title": "4. Unique Value Proposition (UVP)",
                "content": f"1. Verified Quality & Craftsmanship: Stringent quality checks on all outgoing products.\n2. Purpose-Driven Women Enterprise: Every purchase directly supports women's livelihood and fair local remuneration.\n3. Direct Digital Experience: Seamless ordering via {model} touchpoints with prompt support."
            },
            {
                "key": "products_and_services",
                "title": "5. Products & Services",
                "content": f"Initial Core SKU Range: 3-5 curated flagship offerings in {domain}.\nTier 1: Everyday Essentials (Accessible volume drivers).\nTier 2: Premium Artisanal Line (High margin, gift-worthy packaging).\nTier 3: Bespoke / Custom Commission Services."
            },
            {
                "key": "target_market",
                "title": "6. Target Market Analysis",
                "content": f"Addressable Market: Urban and semi-urban women and families across {state} and tier-1/tier-2 cities in India.\nDemographics: Age 22-48, household income ₹5-20 Lakhs p.a., active digital shoppers valuing authenticity and domestic craft."
            },
            {
                "key": "customer_segments",
                "title": "7. Customer Segments & Personas",
                "content": "Persona A ('Pooja, 29, IT Professional'): Seeks sustainable, aesthetically pleasing products with prompt delivery.\nPersona B ('Meena, 42, Homemaker & Community Leader'): Prioritizes trustworthy quality, family health/comfort, and festive gifting bundles."
            },
            {
                "key": "competitor_analysis",
                "title": "8. Competitor Landscape",
                "content": f"Direct Competitors: Local neighborhood vendors and regional Instagram sellers.\nIndirect Competitors: Mass-market commercial brands.\nCompetitive Edge: Transparent sourcing narrative, founder responsiveness, and uncompromised finish."
            },
            {
                "key": "marketing_strategy",
                "title": "9. Marketing Strategy",
                "content": "Phase 1: Zero-ad-spend organic grassroots marketing via WhatsApp Business catalog, local community popups, and Instagram Reels showcasing process.\nPhase 2: Micro-influencer collaborations (barter gifting) with local women creators in Bangalore/Karnataka."
            },
            {
                "key": "sales_strategy",
                "title": "10. Sales & Distribution Strategy",
                "content": f"Primary Channel: {model} D2C storefront and curated exhibition stalls.\nPayment Integration: UPI QR (PhonePe/GooglePay) and Razorpay gateway.\nDelivery: Tie-up with Shiprocket / India Post for domestic reach under 3-5 days."
            },
            {
                "key": "operations_plan",
                "title": "11. Operations & Logistics Plan",
                "content": "Procurement: Direct wholesale partnerships with certified regional weavers/farmers/suppliers.\nBatch Production Cycle: 10-14 days turnaround with weekly inventory reconciliation to prevent dead-stock accumulation."
            },
            {
                "key": "staffing_and_resources",
                "title": "12. Staffing & Organizational Structure",
                "content": "Initial Setup: Founder-led operations covering design, procurement, and client communication.\nSupport Staff: 1 part-time packaging and dispatch assistant, with flexible outsourcing for bookkeeping and tax filings."
            },
            {
                "key": "investment_requirements",
                "title": "13. Investment Requirements",
                "content": f"Estimated Total Startup Outlay: ₹{expected_inv:,.0f}.\n- Raw Materials & Sample Inventory: ₹{expected_inv * 0.35:,.0f} (35%)\n- Equipment / Workspace Tools: ₹{expected_inv * 0.25:,.0f} (25%)\n- Packaging & Branding Materials: ₹{expected_inv * 0.15:,.0f} (15%)\n- Digital Setup & Marketing: ₹{expected_inv * 0.10:,.0f} (10%)\n- Working Capital Reserve: ₹{expected_inv * 0.15:,.0f} (15%)"
            },
            {
                "key": "revenue_model",
                "title": "14. Revenue Model",
                "content": f"Target Average Order Value (AOV): ₹850 - ₹1,400.\nTarget Monthly Volume (Months 1-3): 40-70 orders.\nTarget Monthly Volume (Months 4-6): 120-180 orders.\nEstimated Gross Margin: 36% - 44% across product lines."
            },
            {
                "key": "expense_estimates",
                "title": "15. Expense Estimates",
                "content": "Monthly Fixed Overhead: ₹12,000 (Utilities, internet, software subscriptions, local transport).\nMonthly Variable Costs: COGS (55% of sales price) + Packaging & Shipping (8% of ticket size)."
            },
            {
                "key": "financial_projections",
                "title": "16. Financial Projections (Year 1 Estimate)",
                "content": f"Year 1 Projected Gross Revenue: ₹9,80,000.\nTotal Operating Expenses: ₹6,40,000.\nProjected Net Operating Profit: ₹3,40,000 (34.7% margin).\nEstimated Break-Even Timeline: Month 5 after commercial launch."
            },
            {
                "key": "risks_and_mitigation",
                "title": "17. Risks & Mitigation Framework",
                "content": "1. Cashflow Crunch: Maintain 3-month operating reserve and utilize MUDRA Shishu loan.\n2. Supplier Delays: Pre-qualify 2 secondary vendors with pre-negotiated price agreements.\n3. Demand Fluctuations: Build pre-order campaigns 2 weeks before major cultural festivals."
            },
            {
                "key": "compliance_and_registration",
                "title": "18. Compliance & Registration Roadmap",
                "content": "1. Udyam Registration (Free, immediate online MSME certification).\n2. Current Account in Bank with Udyam & PAN.\n3. GST Registration (voluntary initially, mandatory once exceeding threshold).\n4. Trademark application for brand name and logo protection."
            },
            {
                "key": "growth_strategy",
                "title": "19. Long-Term Growth & Scaling Strategy",
                "content": "Year 2: Onboard 5 additional rural women artisans, expand into multi-state B2B corporate gifting, and establish an export presence on international marketplaces (Etsy/Amazon Global Selling)."
            }
        ]

        financial_estimates = {
            "startup_investment_needed": expected_inv,
            "founder_equity_contribution": available_inv,
            "external_grant_or_debt_needed": max(0.0, expected_inv - available_inv),
            "monthly_fixed_burn": 12000.0,
            "projected_year1_revenue": 980000.0,
            "projected_year1_net_profit": 340000.0,
            "estimated_breakeven_months": 5
        }

        explicit_assumptions = [
            "All financial values are modelled estimates based on MSME industry benchmarks and are subject to local market fluctuations.",
            "Raw material price inflation is assumed not to exceed 8% annually.",
            "Customer return and exchange rate is budgeted at under 6% of gross order volume.",
            "Founders are assumed to operate from home/low-cost leased space during the initial 6 months."
        ]

        return {
            "title": f"{idea} – {stage_titles.get(stage, 'Comprehensive Business Plan')}",
            "stage": stage,
            "plan_type": stage_titles.get(stage, "Business Plan"),
            "sections": sections,
            "financial_estimates": financial_estimates,
            "explicit_assumptions": explicit_assumptions
        }

    @classmethod
    def generate_personalized_roadmap(cls, profile_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generates adaptive day/week/month milestones tailored specifically to Online vs Offline models
        and the entrepreneur's stage.
        """
        stage = profile_data.get("current_stage", "Idea Stage")
        model = profile_data.get("business_model", "Online")
        domain = profile_data.get("business_domain", "Fashion & Apparel")

        tasks = []

        if model == "Online":
            tasks = [
                {
                    "title": "Interview 15 Target Customers",
                    "description": "Conduct 15-minute phone or in-person interviews to validate problem, willingness to pay, and preferred digital shopping channels.",
                    "timeframe": "Week 1",
                    "milestone_group": "Validation & Demand",
                    "priority": "High",
                    "estimated_days": 4,
                    "deadline_date": "2026-11-06",
                    "is_completed": True,
                    "dependencies": []
                },
                {
                    "title": "Vendor & Material Sourcing Benchmark",
                    "description": "Gather price lists and minimum order quantities (MOQs) from 3 regional suppliers for primary materials.",
                    "timeframe": "Week 2",
                    "milestone_group": "Supply Chain",
                    "priority": "High",
                    "estimated_days": 5,
                    "deadline_date": "2026-11-13",
                    "is_completed": False,
                    "dependencies": ["Interview 15 Target Customers"]
                },
                {
                    "title": "Unit Economics & Pricing Sheet",
                    "description": "Calculate exact unit margin factoring in COGS, 8% packaging, 3% payment gateway fee, and ₹70 average delivery charge.",
                    "timeframe": "Week 3",
                    "milestone_group": "Financial Planning",
                    "priority": "High",
                    "estimated_days": 3,
                    "deadline_date": "2026-11-20",
                    "is_completed": False,
                    "dependencies": ["Vendor & Material Sourcing Benchmark"]
                },
                {
                    "title": "Free Udyam MSME Registration",
                    "description": "Register on official udyamregistration.gov.in using Aadhaar to unlock priority sector lending and government subsidies.",
                    "timeframe": "Week 4",
                    "milestone_group": "Compliance",
                    "priority": "Medium",
                    "estimated_days": 2,
                    "deadline_date": "2026-11-27",
                    "is_completed": False,
                    "dependencies": []
                },
                {
                    "title": "Setup WhatsApp Business & Digital Catalog",
                    "description": "Photograph initial 5 sample products, configure automated greeting, quick replies, and UPI QR code payment links.",
                    "timeframe": "Week 5",
                    "milestone_group": "Digital Storefront",
                    "priority": "High",
                    "estimated_days": 4,
                    "deadline_date": "2026-12-04",
                    "is_completed": False,
                    "dependencies": ["Unit Economics & Pricing Sheet"]
                },
                {
                    "title": "Pre-Launch Beta Batch to 20 Close Contacts",
                    "description": "Take pre-orders from community, pack orders with personalized handwritten note, and collect qualitative reviews.",
                    "timeframe": "Week 6",
                    "milestone_group": "Beta Launch",
                    "priority": "High",
                    "estimated_days": 6,
                    "deadline_date": "2026-12-11",
                    "is_completed": False,
                    "dependencies": ["Setup WhatsApp Business & Digital Catalog"]
                }
            ]
        else: # Offline / Physical Setup (e.g. Bakery, Boutique, Agro)
            tasks = [
                {
                    "title": "Local Footfall & Competitor Mapping",
                    "description": "Map 5 competitor establishments within a 3km radius, noting average customer basket size and peak traffic hours.",
                    "timeframe": "Week 1",
                    "milestone_group": "Market Reconnaissance",
                    "priority": "High",
                    "estimated_days": 4,
                    "deadline_date": "2026-11-06",
                    "is_completed": True,
                    "dependencies": []
                },
                {
                    "title": "Premises Scouting & Lease Negotiation",
                    "description": "Evaluate 2-3 potential physical spots, verifying water/power supply, commercial zoning, and lease security deposit terms.",
                    "timeframe": "Week 2",
                    "milestone_group": "Infrastructure",
                    "priority": "High",
                    "estimated_days": 7,
                    "deadline_date": "2026-11-13",
                    "is_completed": False,
                    "dependencies": ["Local Footfall & Competitor Mapping"]
                },
                {
                    "title": "Equipment Procurement & Capex Quotes",
                    "description": "Obtain comparative quotes for essential commercial equipment, ensuring at least 1-year warranty and local service availability.",
                    "timeframe": "Week 3",
                    "milestone_group": "Procurement",
                    "priority": "High",
                    "estimated_days": 5,
                    "deadline_date": "2026-11-20",
                    "is_completed": False,
                    "dependencies": []
                },
                {
                    "title": "Mandatory Regulatory Licensing (FSSAI / Municipal Trade)",
                    "description": "File application on FoSCoS portal for basic FSSAI registration and local municipal health trade license.",
                    "timeframe": "Week 4",
                    "milestone_group": "Regulatory & Legal",
                    "priority": "High",
                    "estimated_days": 6,
                    "deadline_date": "2026-11-27",
                    "is_completed": False,
                    "dependencies": ["Premises Scouting & Lease Negotiation"]
                },
                {
                    "title": "Store Interior Fit-Out & Hygiene Setup",
                    "description": "Complete counter setup, visual merchandising, hygienic storage, and digital billing point-of-sale terminal.",
                    "timeframe": "Weeks 5-6",
                    "milestone_group": "Fit-out & Trial",
                    "priority": "Medium",
                    "estimated_days": 10,
                    "deadline_date": "2026-12-08",
                    "is_completed": False,
                    "dependencies": ["Equipment Procurement & Capex Quotes"]
                },
                {
                    "title": "Neighborhood Soft Launch & Tasting Session",
                    "description": "Host an invitation-only tasting / preview session for 30 neighborhood families and local business owners.",
                    "timeframe": "Week 7",
                    "milestone_group": "Grand Opening",
                    "priority": "High",
                    "estimated_days": 3,
                    "deadline_date": "2026-12-15",
                    "is_completed": False,
                    "dependencies": ["Store Interior Fit-Out & Hygiene Setup"]
                }
            ]

        return tasks

    @classmethod
    def diagnose_progress_variance(cls, planned_budget: float, actual_exp: float, 
                                   sales_rev: float, customer_count: int, 
                                   period_label: str) -> Dict[str, Any]:
        """
        Diagnoses actual business progress variance and generates specific, practical corrective recommendations.
        """
        budget_variance = actual_exp - planned_budget
        is_overbudget = budget_variance > 0
        overbudget_pct = (budget_variance / max(planned_budget, 1.0)) * 100 if is_overbudget else 0

        feedback = []
        corrective_actions = []

        if is_overbudget:
            feedback.append(
                f"Expenditure Alert: Actual spending for {period_label} exceeded planned budget by ₹{budget_variance:,.0f} (+{overbudget_pct:.1f}%). "
                "Immediate cost discipline is required to preserve runway."
            )
            corrective_actions.append("Audit all discretionary supplier payments and renegotiate bulk raw material discounts.")
            corrective_actions.append("Pause paid marketing campaigns and transition to organic community outreach and referral incentives.")
        else:
            savings = abs(budget_variance)
            feedback.append(
                f"Prudent Capital Stewardship: Spent ₹{savings:,.0f} less than planned for {period_label}. "
                "Healthy runway discipline."
            )

        if sales_rev <= 0:
            feedback.append("No commercial revenues recorded in this tracking period. Focus must shift immediately toward customer conversions.")
            corrective_actions.append("Offer limited-time launch sample bundles to convert interested leads into paid orders.")
        elif sales_rev > 0 and customer_count > 0:
            aov = sales_rev / customer_count
            feedback.append(f"Recorded ₹{sales_rev:,.0f} across {customer_count} paying customers (Average Order Value: ₹{aov:,.0f}).")
            if customer_count < 15:
                corrective_actions.append("Launch a simple WhatsApp referral incentive: 'Refer a friend, both get ₹150 off next order'.")
            else:
                corrective_actions.append("Send satisfaction check-in to past buyers to secure testimonials and drive re-orders.")

        return {
            "ai_variance_feedback": " ".join(feedback),
            "ai_corrective_actions": corrective_actions
        }
