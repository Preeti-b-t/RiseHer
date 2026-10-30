# IMPLEMENTATION PLAN & TRACEABILITY MATRIX: NEUROMIND

**Document Version:** 1.0.0  
**Date:** October 22, 2026  
**Architect:** Senior ML Engineer, Healthcare Data Scientist & Dashboard Architect  
**Project:** NeuroMind: Emotion-to-Cognitive Mapping and Recommendation System  
**Reference Document:** *“4th SEM REPORT FINAL”* (DSCE Dept. of CSE Data Science, 2025–2026)  
**Target Repository:** `/Users/preetitevaramani/NeuroMind`  

---

## 1. Master Requirements Traceability Table

This traceability matrix maps every technical specification, algorithmic stage, mathematical formulation, and visual artifact from the report to its concrete data input, codebase module, validation test, and current remediation status.

| Req ID | Report Section & Description | Dataset Column / Physical Input | Target Implementation Module | Validation Test & Acceptance Metric | Current Code Status | Remediation Action Required |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **REQ-01** | **DEAP Dataset Ingestion (Sec 4.1)**<br>Load 32-channel EEG signals & SAM emotional ratings. | `data` tensor `(40, 40, 8064)` and `labels` `(40, 4)` from `sXX.dat` | `preprocessing/load_data.py` | Load all 12 participants (480 trials) without unpickling errors. Shape verification test. | ❌ Broken (Disk corrupted; zip intact) | Restore clean binary `.dat` files from ZIP archive; implement batch multi-subject loader. |
| **REQ-02** | **EEG Signal Preprocessing (Sec 4.2)**<br>Zero-phase 5th-order Butterworth bandpass filter ($0.5 - 45\text{ Hz}$). | Raw scalp potentials ($V(t)$ in $\mu\text{V}$, $f_s = 128\text{ Hz}$) | `preprocessing/filter.py` | Frequency response verification: $-3\text{ dB}$ cutoff at $0.5\text{ Hz}$ and $45\text{ Hz}$; zero phase distortion. | ⚠️ Incomplete (Single-channel only) | Generalize to multichannel arrays $(C, N)$ and add baseline subtraction (first 3s). |
| **REQ-03** | **Spectral Feature Extraction (Sec 4.3–4.5)**<br>Extract $\delta, \theta, \alpha, \beta, \gamma$ band powers via Welch PSD + moments. | Filtered signal array ($128\text{ Hz}$) across 32 EEG electrodes | `feature_engineering/features.py` | Energy conservation test: sum of band powers $\approx$ total PSD area. Output vector shape $(N_{\text{channels}} \times 9)$. | ⚠️ Incomplete (Channel 0 only) | Implement multichannel spatial extraction, band power ratios ($\alpha/\beta, \theta/\beta$), and Frontal Alpha Asymmetry. |
| **REQ-04** | **5-Class Emotion Classification (Sec 4.6)**<br>Classify Happy, Sad, Anxious, Angry, Normal/Neutral using Random Forest. | Extracted EEG feature matrix ($480 \times D$) | `models/train_emotion_model.py` | 5-fold Stratified Cross-Validation; Macro F1-score $> 0.70$; Multiclass Confusion Matrix. | ❌ Broken (1 subject, 4 classes, not loaded in UI) | Train across all 12 subjects (480 trials); implement 5-class Russell circumplex ground truth; persist model. |
| **REQ-05** | **Multi-Label Distortion Prediction (Sec 4.7)**<br>Predict probabilities of multiple co-occurring cognitive distortions. | Affective prediction vector + EEG features | `models/train_distortion_model.py` & `models/distortion_engine.py` | Output probabilities $\in [0, 1]$; clinically verified correlation with emotional states. | 🚫 Unacceptable (Pure random synthetic noise) | Replace synthetic noise with a scientifically grounded CBT distortion vulnerability ontology (Beck/Burns). |
| **REQ-06** | **Explainable AI Integration (Sec 4.8)**<br>Compute SHAP feature importances to explain emotion predictions. | Trained Random Forest model + test feature vectors | `xai/shap_explainer.py` | TreeExplainer generates valid local Shapley values $\sum \phi_i = f(x) - E[f(x)]$ and summary beeswarm plot. | ❌ Missing (Directory empty; 0 calls) | Implement real `shap.TreeExplainer`; generate feature importance bar and waterfall plots. |
| **REQ-07** | **Personalized CBT Engine (Sec 4.9)**<br>Synthesize 4-tier intervention (Awareness, Insight, Action, Reflection). | Identified cognitive distortions and emotional state | `recommendation/recommendation_engine.py` | All 10 cognitive distortions have complete, validated 4-tier clinical guidance; dynamic matching. | ⚠️ Broken (Standalone mock app with random choice) | Remove duplicate Streamlit UI; export pure functional recommendation API bound to real predictions. |
| **REQ-08** | **Interactive Web Application (Ch 5 & 6)**<br>Upload EEG, display emotion, dominant wave, distortions (Fig 4), CBT (Fig 5). | User CSV/EEG file input | `app/streamlit_app.py` | End-to-end integration test: Upload CSV $\rightarrow$ Real Feature Extraction $\rightarrow$ Model Inference $\rightarrow$ SHAP $\rightarrow$ CBT. | ⚠️ Facade (Heuristics & random number generator) | Wire Streamlit frontend directly to trained model pipelines, real SHAP visualizer, and add clinical disclaimers. |
| **REQ-09** | **Model Evaluation & Reporting (Sec 4.10)**<br>Report Accuracy, Precision, Recall, and F1-score. | Out-of-fold test predictions and ground truth | `models/evaluate.py` | Automated evaluation script generating tabular metrics, classification report, and ROC curves. | ❌ Missing (Single 8-sample test split report only) | Implement comprehensive evaluation reporting on held-out subject test set. |

---

## 2. Phased Engineering Remediation Roadmap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NEUROMIND REMEDIATION ROADMAP (6 PHASES)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: Data Integrity & Archive Restoration                                         │
│   ├── Decompress pristine binary .dat files from ZIP archive to dataset/deap/          │
│   ├── Verify 12 subjects (s01.dat to s25.dat) with SHA-256 and pickle test             │
│   └── Implement robust multi-subject batch ingestion module                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Advanced Signal Processing & Feature Engineering                             │
│   ├── Multichannel Butterworth 0.5-45 Hz filtering with baseline removal               │
│   ├── Welch PSD band power extraction (Delta, Theta, Alpha, Beta, Gamma)               │
│   ├── Frontal Alpha Asymmetry (FAA: F4 - F3) and Arousal Ratios (Alpha/Beta)          │
│   └── Export unified 480-trial clean feature matrix (REAL OBSERVATIONS)                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Authentic 5-Class Emotion Model Training                                     │
│   ├── Map continuous DEAP Valence-Arousal-Dominance to 5 Russell classes               │
│   ├── Train Random Forest Classifier (100 trees, balanced class weights)               │
│   ├── Evaluate via Stratified 5-Fold Cross-Validation (Accuracy, Precision, Recall, F1)│
│   └── Persist serialized pipeline artifact: saved_models/emotion_model.pkl             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Grounded Cognitive Distortion Engine & Real SHAP Explainer                    │
│   ├── Replace synthetic noise with Beck/Burns CBT distortion vulnerability ontology    │
│   ├── Implement SHAP TreeExplainer for feature importance attributions                 │
│   └── Generate local waterfall attributions and global feature importance charts       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Full-Stack Dashboard Integration & Clinical Safeguards                        │
│   ├── Connect app/streamlit_app.py directly to emotion_model.pkl and SHAP explainer   │
│   ├── Replace heuristic if/else & random generators with real model inferences         │
│   ├── Render dynamic Plotly charts for spectral density, distortions, and SHAP        │
│   └── Prominently display clinical wellness disclaimers and data provenance badges     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Automated Verification & Audit Certification                                  │
│   ├── Unit test suite (filtering, extraction, inference, recommendation)              │
│   ├── Reproducibility script generating report figures and performance tables          │
│   └── Deliver final certified codebase to /Users/preetitevaramani/NeuroMind            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Phase Specifications

### Phase 1: Data Integrity & Dataset Restoration
1. **Target:** Eliminate the `_pickle.UnpicklingError` caused by UTF-8 text corruption.
2. **Implementation:**
   - Extract `s01.dat` through `s25.dat` (12 files) directly from `/Users/preetitevaramani/Downloads/DEAP dataset.zip` using Python's `zipfile` in binary mode.
   - Overwrite corrupted files in `/Users/preetitevaramani/NeuroMind/dataset/deap/`.
   - Validate each file with an automated checksum and shape verification script (`(40, 40, 8064)` data, `(40, 4)` labels).
   - Create a clean batch loader in `preprocessing/load_data.py` supporting `load_all_subjects(deap_dir)`.

### Phase 2: Signal Processing & Multichannel Feature Pipeline
1. **Target:** Implement signal processing conforming to Section 4.2–4.5 of the report.
2. **Implementation:**
   - Preprocessing: 5th-order Butterworth bandpass filter ($0.5 - 45.0\text{ Hz}$) at $f_s = 128\text{ Hz}$.
   - Baseline Correction: Subtract the mean signal of the 3-second pre-trial baseline ($t = 0 \dots 384$) from the 60-second trial ($t = 384 \dots 8064$).
   - Channel Selection & Grouping: Focus on standard 10-20 frontal/temporal/parietal channels (`F3`, `F4`, `Fp1`, `Fp2`, `T7`, `T8`, `P3`, `P4`, `Oz`, `Cz`).
   - Spectral Features: Welch PSD ($128$-sample Hamming window, $50\%$ overlap) extracting Delta ($0.5-4\text{ Hz}$), Theta ($4-8\text{ Hz}$), Alpha ($8-12\text{ Hz}$), Beta ($12-30\text{ Hz}$), Gamma ($30-45\text{ Hz}$).
   - Neuro-Affective Ratios: Frontal Alpha Asymmetry ($\text{FAA} = \ln(\alpha_{F4}) - \ln(\alpha_{F3})$), Theta/Beta ratio ($\text{TBR}$), Alpha/Beta ratio ($\text{ABR}$).
   - Statistical Moments: Signal Mean ($\mu$), Standard Deviation ($\sigma$), Max, Min.

### Phase 3: Authentic Emotion Classification Training
1. **Target:** Eliminate the 1-subject / 4-class limitation and train an authentic 5-class model on the full cohort.
2. **Implementation:**
   - Circumplex Ground Truth:
     - **Happy:** $\text{Valence} \ge 5.0 \land \text{Arousal} \ge 5.0$
     - **Anxious:** $\text{Valence} < 5.0 \land \text{Arousal} \ge 5.0 \land \text{Dominance} < 5.0$
     - **Angry:** $\text{Valence} < 5.0 \land \text{Arousal} \ge 5.0 \land \text{Dominance} \ge 5.0$
     - **Sad:** $\text{Valence} < 5.0 \land \text{Arousal} < 5.0$
     - **Normal / Neutral:** $\text{Valence} \in [4.0, 6.0] \land \text{Arousal} \in [4.0, 6.0]$
   - Model Architecture: `RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight='balanced')`.
   - Evaluation: Stratified 5-Fold Cross-Validation across all 480 trials. Report Macro Precision, Recall, and F1-score.
   - Persistence: Dump calibrated model to `saved_models/emotion_model.pkl` with embedded feature names.

### Phase 4: Grounded Cognitive Distortion Engine & Real SHAP
1. **Target:** Expunge synthetic noise (`np.random.rand`) and activate true Explainable AI.
2. **Implementation:**
   - Cognitive Distortion Risk Modeling: Develop `models/distortion_engine.py` mapping emotional state, arousal level, and Frontal Alpha Asymmetry to distortion vulnerability profiles:
     - High Anxious State $\rightarrow$ High risk for *Catastrophizing* ($0.75-0.90$), *Emotional Reasoning* ($0.70-0.85$).
     - High Angry State $\rightarrow$ High risk for *Personalization* ($0.75-0.85$), *Should Statements* ($0.70-0.80$).
     - High Sad State $\rightarrow$ High risk for *Mental Filter* ($0.70-0.85$), *Labeling* ($0.65-0.80$), *Catastrophizing* ($0.60-0.75$).
     - Neutral / Calm State $\rightarrow$ Baseline low risk across all distortions ($0.10-0.30$).
   - SHAP Explainability: In `xai/shap_explainer.py`, initialize `shap.TreeExplainer(emotion_model)` and compute local Shapley values $\phi_i$ for input samples. Generate Plotly horizontal bar charts displaying feature importance.

### Phase 5: Full-Stack Streamlit App Integration
1. **Target:** Transform `streamlit_app.py` from a visual mockup into a functioning clinical dashboard.
2. **Implementation:**
   - Load `saved_models/emotion_model.pkl` via `joblib`.
   - When a user uploads a CSV:
     - Check format: If raw timeseries, apply `preprocessing.filter` and `feature_engineering.features`. If pre-extracted features, validate columns.
     - Execute `model.predict_proba()` to compute genuine class probabilities.
     - Call `xai/shap_explainer.py` to display real SHAP contributions for the detected emotion.
     - Evaluate cognitive distortion vulnerability through `distortion_engine.py`.
     - Render personalized CBT recommendations from `recommendation/recommendation_engine.py`.
   - Add clinical wellness banners and data provenance badges (`[ REAL DEAP OBSERVATION ]`, `[ DERIVED FEATURE ]`, `[ ML INFERENCE ]`).

### Phase 6: Automated Testing & Deliverable Packaging
1. **Target:** Verify software stability and document reproducibility.
2. **Implementation:**
   - Write unit tests in `tests/test_neuromind_pipeline.py`.
   - Validate inference latency ($< 500\text{ ms}$ per sample).
   - Replicate documentation and audit reports into the project directory.

---

## 4. Risk Assessment & Mitigation Matrix

| Risk ID | Identified Technical / Clinical Risk | Likelihood | Impact | Mitigation Strategy |
| :---: | :--- | :---: | :---: | :--- |
| **RSK-01** | **Inter-Subject EEG Variability:** High domain variance across 12 participants causing low generalized accuracy. | High | High | Implement z-score baseline normalization per subject and incorporate robust aggregate spectral band ratios. |
| **RSK-02** | **Class Imbalance in Affective Space:** Neutral or Happy samples outnumbering Angry or Anxious samples in DEAP. | Medium | Medium | Use `class_weight='balanced'` in Random Forest and evaluate with Macro F1 rather than raw accuracy. |
| **RSK-03** | **SHAP Computation Overhead:** `TreeExplainer` slowing down interactive dashboard response. | Low | Medium | Pre-calculate baseline background distribution; compute local SHAP values on single uploaded sample ($< 150\text{ ms}$). |
| **RSK-04** | **Regulatory Misuse (SaMD):** Users misinterpreting recommendations as psychiatric diagnosis. | High | Critical | Prominently display explicit clinical disclaimers in the application header and before recommendation output. |
| **RSK-05** | **Input Data Heterogeneity:** Users uploading incompatible CSV formats (varying channel counts or column names). | High | Medium | Implement robust schema validation with informative error banners and provide downloadable sample CSVs. |

---

## 5. Execution Philosophy & Preservation Mandate

- **Preservation First:** Do not delete existing frontend styling, layouts, or static content in `app/streamlit_app.py` that the user has carefully designed. Enhance and connect the backend without dismantling the UI.
- **Zero Fabrication:** Expunge all calls to `np.random.rand`, `random.uniform`, and `np.random.choice` in prediction paths. Replace with genuine scientific pipelines.
- **Complete Transparency:** Clearly demarcate where machine learning ends (EEG $\rightarrow$ Emotion) and where clinical knowledge engineering begins (Emotion $\rightarrow$ CBT Distortion Mapping).
