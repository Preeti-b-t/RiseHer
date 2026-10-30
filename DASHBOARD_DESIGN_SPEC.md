# HEALTHCARE DECISION-SUPPORT & EEG EMOTION ANALYTICS DASHBOARD SPECIFICATION

**Document Version:** 1.0.0  
**Date:** October 24, 2026  
**Author:** Senior Healthcare Data Scientist, Biomedical Systems Engineer & Full-Stack Clinical Dashboard Architect  
**Project Reference:** *“4th SEM REPORT FINAL — NeuroMind: Emotion-to-Cognitive Mapping and Recommendation System”*  
**Clinical & Industry Reference Interfaces:**
1. **Epic Systems (Hyperspace / Nebula / Cogito Analytics):** Clinical decision support (CDS) hierarchies, alert severity banners, patient longitudinal telemetry, structured care plans.
2. **Microsoft Cloud for Healthcare & Power BI Clinical Analytics:** Slate/teal healthcare color system, card container typography, operational status KPIs, FHIR data model structures.
3. **FHIR (Fast Healthcare Interoperability Resources - HL7 v4.0.1):** Observation resource modeling for electrophysiological telemetry (`Observation.component` for EEG frequency bands, `Observation.interpretation` for affective states).
4. **Weights & Biases / MLflow Healthcare Edition:** Real-time inference latency tracking, feature drift detection, confusion matrix visualization, artifact lineage.

---

## 1. Clinical Context & Ethical Classification

### Intended Use Statement:
> [!IMPORTANT]
> The **NeuroMind EEG Emotion Intelligence System** is an investigational decision-support research application designed to assist researchers and clinicians in monitoring neuro-affective correlates from multi-channel EEG and peripheral autonomic signals. It is **NOT** an automated diagnostic medical device and does not substitute for psychiatric evaluation or DSM-5 clinical criteria.

### Design Principles:
1. **High Visual Hierarchy & Information Scent:** Clear distinction between raw physiologic telemetry, derived feature representations, and probabilistic machine learning predictions.
2. **Accessible, Restrained Healthcare Aesthetic:** Medical slate/deep navy navigation (`#0F172A`), surgical teal accents (`#0EA5E9`, `#14B8A6`), neutral white/light-gray content surfaces (`#F8FAFC`, `#FFFFFF`), accessible dark-mode support (`#1E293B`), and strict contrast ratios complying with WCAG 2.1 AA (minimum 4.5:1).
3. **Zero Fabricated Patient Telemetry:** Every trace, channel, spectrogram, and prediction is rendered directly from verified local DEAP recordings or genuine inference pipelines.

---

## 2. Information Architecture & Navigation

The dashboard is structured into 8 dedicated functional views accessible via a persistent clinical sidebar:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          NEUROMIND NAVIGATION HIERARCHY                                │
├────┬─────────────────────────────┬─────────────────────────────────────────────────────┤
│ #  │ Navigation Page             │ Primary Clinical & Operational Purpose              │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
│ 1  │ 🏥 Executive Overview       │ Clinical KPIs, dataset provenance, active model     │
│    │                             │ version, calibration status, and system notices     │
│ 2  │ 🧠 Emotion Analysis & State │ Real-time inference on uploaded EEG, Russell       │
│    │                             │ Circumplex coordinates, class probabilities, and CBT│
│ 3  │ 📈 EEG Signal Explorer      │ Multi-channel raw waveform inspection, bandpass     │
│    │                             │ filtering, Welch PSD spectrum, electrode topography │
│ 4  │ 📊 Model Performance        │ Stratified cross-trial vs unseen-subject matrices,  │
│    │                             │ ROC-AUC, precision-recall, literature comparisons   │
│ 5  │ 🔍 Explainability (SHAP)    │ Game-theoretic SHAP feature attributions, regional  │
│    │                             │ band importance, Frontal Alpha Asymmetry analysis   │
│ 6  │ 🧪 Experiment Tracking      │ Versioned model repository, hyperparameter logs,     │
│    │                             │ reproducibility benchmarks, leakage verification    │
│ 7  │ 🛡️ Data Quality & Monitor   │ Channel impedance, missing signal checks, SNR,      │
│    │                             │ baseline drift, inference latency benchmarks        │
│ 8  │ 📑 Clinical Research Reports│ Automated report generator, patient telemetry export,│
│    │                             │ Markdown/PDF audit logs, regulatory disclaimers     │
└────┴─────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 3. Detailed Page Specifications & Component Wireframes

### Page 1: 🏥 Executive Overview
- **Header Banner:** Subject Context Banner displaying Active Participant ID, Trial ID, Recording Date, Sampling Rate (128 Hz), Channel Count (32 EEG + 8 ANS), and Model Status (`Active - v2.1.0-RF-Tuned`).
- **Telemetry Metric Cards (4 Grid):**
  - Card A: **Active Dataset:** DEAP Benchmark (12 Local Subjects, 480 Discrete 60s Trials).
  - Card B: **Primary Metric:** Balanced Macro F1 ($28.12\% - 30.94\%$ vs $9.13\%$ zero-rule).
  - Card C: **Binary Valence / Arousal:** $58.96\% / 62.08\%$ Generalization.
  - Card D: **Pipeline Latency:** $10.92 \text{ ms}$ (Real-time compatible $< 50 \text{ ms}$).
- **Data Quality Alerts:** Warning callout on class imbalance (`Happy` 29.6% vs `Angry` 9.8%) and explicit notice that whole trials are held out to eliminate window leakage.
- **Workflow Action Bar:** Quick links to Upload EEG file, Run Diagnostic, or View CBT Recommendations.

### Page 2: 🧠 Emotion Analysis & Affective Mapping
- **Input Modality Selector:**
  - Option 1: Select genuine trial from authorized local DEAP participant (`s01` to `s25`).
  - Option 2: Upload custom CSV/BDF/EDF physiological timeseries.
  - Option 3: Manual neuro-biomarker parameter sliders (Delta, Theta, Alpha, Beta, Gamma, FAA).
- **Russell Circumplex Coordinate Plane:** Interactive Plotly scatter plot rendering the 2D Affective Space:
  - X-Axis: Valence ($1.0 \dots 9.0$) — Unpleasant to Pleasant.
  - Y-Axis: Arousal ($1.0 \dots 9.0$) — Calm to Activated.
  - Quadrant overlays: High-Valence/High-Arousal (HVHA - Happy), Low-Valence/High-Arousal (LVHA - Anxious/Stress), Low-Valence/Low-Arousal (LVLA - Sad/Depressive), High-Valence/Low-Arousal (HVLA - Calm/Content).
  - Overlay marker: Real participant ground-truth rating vs Model predicted coordinate.
- **Predicted Class Distribution:** Horizontal bar chart showing calibrated posterior probabilities for all 5 emotion states (`Happy`, `Neutral`, `Sad`, `Anxious`, `Angry`).
- **Cognitive Distortion & CBT Recommendation Panel:** Deterministic behavioral coping interventions based on the identified emotion pattern (e.g., Catastrophizing, Overgeneralization, All-or-Nothing Thinking).

### Page 3: 📈 EEG Signal Explorer
- **Interactive Multi-Channel Oscilloscope:**
  - Channel selector allowing selection of specific 10–20 electrodes ($F_3, F_4, F_z, C_3, C_4, P_3, P_4, O_1, O_2$, etc.).
  - Time window slider (0 to 60 seconds).
  - Toggle for Raw vs 0.5–45 Hz Bandpass Filtered signal.
- **Spectral Power Density (PSD) Spectrum:** Plotly frequency plot ($0.5 \dots 45 \text{ Hz}$) displaying Welch PSD with shaded clinical frequency bands (Delta, Theta, Alpha, Beta, Gamma).
- **Frontal Asymmetry Gauge:** Visual dial indicating Frontal Alpha Asymmetry:
  $$\text{FAA} = \ln \alpha_{F4} - \ln \alpha_{F3}$$
  (Right prefrontal dominance indicates negative withdrawal affect; Left prefrontal dominance indicates positive approach affect).
- **Autonomic Channel Viewer:** Simultaneous display of Galvanic Skin Response (GSR in $\mu\text{S}$) and Blood Volume Pulse (BVP photoplethysmogram).

### Page 4: 📊 Model Performance & Clinical Validation
- **Confusion Matrix:** 5x5 interactive heatmap displaying true vs predicted emotion classes with normalized row recall and raw trial counts.
- **Multi-Protocol Evaluation Comparison Table:**
  - Protocol 1: Cross-Trial Stratified 5-Fold (Trial-Independent).
  - Protocol 2: GroupKFold 6-Fold (Subject-Independent / Unseen Participants).
  - Protocol 3: Binary Valence / Binary Arousal benchmarks.
- **Literature Baseline Comparison:** Side-by-side comparison with published baselines (Koelstra et al. 2012, Zheng & Lu 2015, Mert & Akan 2018), including an explicit scientific warning dissecting the ">90% window leakage artifact".

### Page 5: 🔍 Explainability & Biometrical Attributions (SHAP)
- **SHAP Summary Waterfall / Bar Chart:** Ranks the top neuro-features driving the predicted emotion for the current trial.
- **Band & Regional Importance Decomposition:** Grouped contributions showing whether Frontal, Central, Temporal, or Parietal electrodes had the highest predictive impact.
- **Clinical Interpretability Limitations:** Prominent notice stating that SHAP attributions represent statistical model dependencies, not direct causal neurophysiology.

### Page 6: 🧪 Experiment Management & Model Registry
- **Experiment Log Table:** Tabular browser reading [`MODEL_EXPERIMENTS.csv`](file:///Users/preetitevaramani/NeuroMind/MODEL_EXPERIMENTS.csv) with columns for Experiment ID, Method, Target Task, Classifier, Accuracy, Macro F1, Runtime, and Leakage Audit status.
- **Model Artifact Inspector:** Shows metadata for the active model loaded from [`saved_models/emotion_model.pkl`](file:///Users/preetitevaramani/NeuroMind/saved_models/emotion_model.pkl).

### Page 7: 🛡️ Data Quality & Telemetry Health Monitoring
- **Electrode Impedance & Signal Integrity Check:** Detects flatline channels, excessive 50/60 Hz line noise, and clipping artifacts across the 32 scalp channels.
- **Signal-to-Noise Ratio (SNR) Meter:** Estimates EEG signal quality.
- **Inference Latency Monitor:** Tracks preprocessing time, feature extraction time, and inference time against the 50 ms clinical SLA.

### Page 8: 📑 Clinical Research Reports & Export
- **Report Generation Engine:** Generates comprehensive PDF-ready or Markdown audit reports summarizing patient session telemetry, predicted affective states, CBT recommendations, and model confidence scores.
- **Anonymization & Privacy Guard:** Strips direct participant identifiers before export in accordance with HIPAA / GDPR research guidelines.

---

## 4. Design System & CSS Styling Palette

```css
:root {
  /* Primary Clinical Palette */
  --color-navy-dark: #0F172A;    /* Slate 900 - Sidebar & Deep Headers */
  --color-navy-card: #1E293B;    /* Slate 800 - Cards in Dark Mode */
  --color-surface-light: #F8FAFC;/* Slate 50 - Background Surface */
  --color-surface-white: #FFFFFF;/* Pure White - Container Background */
  
  /* Clinical Accents */
  --color-teal-primary: #0EA5E9; /* Sky 500 - Active Highlights & Waves */
  --color-teal-clinical: #14B8A6;/* Teal 500 - Certified Status & Good SNR */
  --color-purple-eeg: #8B5CF6;   /* Violet 500 - EEG Spectral Plots */
  --color-amber-alert: #F59E0B;  /* Amber 500 - Caution & Imbalance */
  --color-rose-negative: #F43F5E;/* Rose 500 - High Arousal Stress / Artifact */
  
  /* Typography */
  --font-clinical: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 5. Verification & Implementation Roadmap

1. Implement the updated multi-page dashboard in [`app/streamlit_app.py`](file:///Users/preetitevaramani/NeuroMind/app/streamlit_app.py) leveraging Streamlit's native layout engine, Plotly interactive charts, and genuine local DEAP dataset connections.
2. Connect every page directly to backend modules:
   - Data loading: [`preprocessing/load_data.py`](file:///Users/preetitevaramani/NeuroMind/preprocessing/load_data.py)
   - Features: [`feature_engineering/features.py`](file:///Users/preetitevaramani/NeuroMind/feature_engineering/features.py)
   - Inference & Model: [`saved_models/emotion_model.pkl`](file:///Users/preetitevaramani/NeuroMind/saved_models/emotion_model.pkl)
   - Explainability: [`xai/shap_explainer.py`](file:///Users/preetitevaramani/NeuroMind/xai/shap_explainer.py)
   - Cognitive Distortions & CBT: [`models/distortion_engine.py`](file:///Users/preetitevaramani/NeuroMind/models/distortion_engine.py) and [`recommendation/recommendation_engine.py`](file:///Users/preetitevaramani/NeuroMind/recommendation/recommendation_engine.py)
3. Ensure automated unit tests in [`tests/test_neuromind_pipeline.py`](file:///Users/preetitevaramani/NeuroMind/tests/test_neuromind_pipeline.py) execute cleanly against the new dashboard components.
