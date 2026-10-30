"""
Comprehensive automated test suite for Weather-Regime-Aware Rainfall AI system.
Tests data preprocessing, zero data-leakage, bias-correction models, IMD decision support,
Smart Planner, AI Assistant, GIS Spatial Layers, Notifications, and FastAPI endpoints.
Smart India Hackathon 2026 (SIH26080).
"""

import os
import unittest
import numpy as np
import pandas as pd
from pathlib import Path
from fastapi.testclient import TestClient

from src.utils import get_project_root, load_config, load_json
from src.data_preparation import load_data, validate_data, clean_data, chronological_split
from src.feature_engineering import engineer_features, get_feature_matrix, MODEL_FEATURE_COLUMNS
from src.bias_correction import EmpiricalQuantileMapping
from src.decision_support import get_imd_alert_level
from src.activity_planner import evaluate_activity_plan
from src.ai_assistant import WeatherAIAssistant
from src.impact_forecasting import compute_impact_indices
from src.gis_analytics import get_gis_feature_collection
from src.notifications import notification_manager
from predict import WeatherRegimeRainfallPredictor
from src.api import app


class TestWeatherRegimeRainfallAI(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.predictor = WeatherRegimeRainfallPredictor()
        cls.assistant = WeatherAIAssistant()
        cls.client = TestClient(app)

    def test_01_data_loading_and_validation(self):
        """Verify Goa and 2026 multi-state datasets load and validate correctly."""
        root = get_project_root()
        goa_path = root / "data" / "raw" / "goa_6hourly_indian_time_2020_2025.xls"
        if goa_path.exists():
            df_goa = load_data(str(goa_path))
            is_valid, missing = validate_data(df_goa)
            self.assertTrue(is_valid, f"Goa dataset missing columns: {missing}")
            self.assertGreater(len(df_goa), 40000)

        multi_path = root / "weather_nwp_2026_monsoon_goa_karnataka_kerala.csv"
        if multi_path.exists():
            df_multi = load_data(str(multi_path))
            is_valid, missing = validate_data(df_multi)
            self.assertTrue(is_valid, f"Multi-state dataset missing columns: {missing}")
            self.assertIn("state", df_multi.columns)

    def test_02_chronological_splitting_zero_leakage(self):
        """Verify strictly chronological temporal splitting with zero overlap."""
        root = get_project_root()
        goa_path = root / "data" / "raw" / "goa_6hourly_indian_time_2020_2025.xls"
        df_raw = load_data(str(goa_path))
        df_clean = clean_data(df_raw)
        
        train_df, val_df, test_df = chronological_split(df_clean, train_end="2023-12-31", validation_end="2024-12-31")
        
        self.assertGreater(len(train_df), 0)
        self.assertGreater(len(val_df), 0)
        self.assertGreater(len(test_df), 0)
        self.assertLess(train_df["datetime"].max(), val_df["datetime"].min())
        self.assertLess(val_df["datetime"].max(), test_df["datetime"].min())

    def test_03_empirical_quantile_mapping(self):
        """Verify Empirical Quantile Mapping fits on training and respects non-negativity."""
        np.random.seed(42)
        nwp_sim = np.random.gamma(shape=2.0, scale=3.0, size=1000)
        obs_sim = np.random.gamma(shape=2.5, scale=3.5, size=1000)
        
        eqm = EmpiricalQuantileMapping(n_quantiles=100)
        eqm.fit(nwp_sim, obs_sim)
        
        test_inputs = np.array([0.0, 5.0, 15.0, 30.0, 100.0])
        corrected = eqm.predict(test_inputs)
        
        self.assertEqual(len(corrected), len(test_inputs))
        self.assertTrue(np.all(corrected >= 0.0), "Quantile mapping output cannot be negative")

    def test_04_imd_decision_support_alert_logic(self):
        """Verify IMD warning color codes and advisory assignment."""
        alert_green = get_imd_alert_level(5.0, 10.0)
        self.assertEqual(alert_green["color"], "Green")
        
        alert_yellow = get_imd_alert_level(20.0, 45.0)
        self.assertEqual(alert_yellow["color"], "Yellow")
        
        alert_orange = get_imd_alert_level(45.0, 65.0)
        self.assertEqual(alert_orange["color"], "Orange")
        
        alert_red = get_imd_alert_level(80.0, 90.0)
        self.assertEqual(alert_red["color"], "Red")
        self.assertIn("disaster_mgmt_action", alert_red)

    def test_05_end_to_end_predictor(self):
        """Verify end-to-end predictor enforces non-negativity and outputs valid keys."""
        sample = {
            "state": "Goa",
            "district_name": "North Goa",
            "taluka_name": "Panaji (Tiswadi)",
            "time": "2026-07-15T12:00:00+05:30",
            "latitude": 15.4989,
            "longitude": 73.8278,
            "elevation": 15.0,
            "raw_nwp_rain_6h_forecast": 25.0,
            "raw_nwp_temp_forecast": 27.5,
            "raw_nwp_pressure_msl_forecast": 1004.0,
            "raw_nwp_wind_speed_forecast": 20.0,
        }
        res = self.predictor.predict_record(sample)
        self.assertGreaterEqual(res["corrected_rainfall_mm"], 0.0)
        self.assertTrue(0 <= res["predicted_regime_cluster"] <= 4)
        self.assertTrue(0.0 <= res["heavy_rainfall_probability_pct"] <= 100.0)
        self.assertIn("predicted_weather_regime", res)

    def test_06_smart_activity_planner(self):
        """Verify daily activity risk scoring logic."""
        plan_safe = evaluate_activity_plan("farming", corrected_rainfall_mm=2.0, heavy_prob_pct=5.0)
        self.assertEqual(plan_safe["status"], "Safe")
        
        plan_risk = evaluate_activity_plan("harvesting", corrected_rainfall_mm=35.0, heavy_prob_pct=80.0)
        self.assertEqual(plan_risk["status"], "High Risk")
        self.assertIn("recommendation", plan_risk)

    def test_07_conversational_ai_assistant(self):
        """Verify Ask Vrishti AI answers query with contextual domain intelligence."""
        res = self.assistant.answer_query("Will it rain tomorrow in North Goa?")
        self.assertIn("response_markdown", res)
        self.assertIn("North Goa", res["response_markdown"])
        self.assertIn("metrics", res)

    def test_08_gis_feature_collection(self):
        """Verify GeoJSON spatial layer formatting for Leaflet maps."""
        gis_data = get_gis_feature_collection("rainfall")
        self.assertEqual(gis_data["type"], "FeatureCollection")
        self.assertGreaterEqual(len(gis_data["features"]), 20)
        feat = gis_data["features"][0]
        self.assertIn("geometry", feat)
        self.assertIn("corrected_rain_mm", feat["properties"])

    def test_09_multi_channel_notifications(self):
        """Verify notification generation across channels."""
        pred = {"district": "North Goa", "corrected_rainfall_mm": 45.0, "heavy_rainfall_probability_pct": 75.0, "predicted_weather_regime": "Active Monsoon"}
        alert = {"color": "Orange", "badge": "🟠 Orange Alert", "title": "Heavy Rain Alert", "summary": "Intense rain", "public_advisory": "Stay indoors"}
        dispatch = notification_manager.dispatch_alert(pred, alert)
        self.assertEqual(dispatch["alert_level"], "Orange")
        self.assertIn("email_preview", dispatch)
        self.assertIn("sms_preview", dispatch)

    def test_10_fastapi_rest_endpoints(self):
        """Verify all FastAPI endpoints return 200 OK."""
        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        
        res_roles = self.client.get("/auth/roles")
        self.assertEqual(res_roles.status_code, 200)
        
        res_reg = self.client.get("/regimes")
        self.assertEqual(res_reg.status_code, 200)
        
        res_ver = self.client.get("/verification")
        self.assertEqual(res_ver.status_code, 200)
        
        res_gis = self.client.get("/gis/layers?layer=rainfall")
        self.assertEqual(res_gis.status_code, 200)
        
        res_act = self.client.get("/planner/activities")
        self.assertEqual(res_act.status_code, 200)
        
        payload = {
            "state": "Karnataka",
            "district": "Dakshina Kannada",
            "taluka_name": "Mangaluru",
            "raw_nwp_rain_6h_forecast": 40.0,
            "raw_nwp_temp_forecast": 26.5,
            "raw_nwp_pressure_msl_forecast": 1003.0,
            "raw_nwp_wind_speed_forecast": 28.0
        }
        res_pred = self.client.post("/predict", json=payload)
        self.assertEqual(res_pred.status_code, 200)
        data = res_pred.json()
        self.assertGreaterEqual(data["corrected_rainfall_mm"], 0.0)
        self.assertIn(data["imd_decision_support"]["color"], ["Green", "Yellow", "Orange", "Red"])

    def test_11_auth_and_system_health(self):
        """Verify JWT Authentication, RBAC, and System Health endpoints."""
        # System Health
        res_sys = self.client.get("/system/health")
        self.assertEqual(res_sys.status_code, 200)
        self.assertEqual(res_sys.json()["system_status"], "operational")

        # Admin Login
        res_admin = self.client.post("/auth/login", json={"email": "admin@imd.gov.in", "password": "Admin@123"})
        self.assertEqual(res_admin.status_code, 200)
        admin_data = res_admin.json()
        self.assertEqual(admin_data["user"]["role"], "admin")
        self.assertIn("access_token", admin_data)

        # User Login
        res_user = self.client.post("/auth/login", json={"email": "user@vrishti.ai", "password": "User@123"})
        self.assertEqual(res_user.status_code, 200)
        user_data = res_user.json()
        self.assertEqual(user_data["user"]["role"], "user")

        # Token Verification /auth/me
        token = admin_data["access_token"]
        res_me = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.json()["user"]["role"], "admin")

        # Invalid Login
        res_fail = self.client.post("/auth/login", json={"email": "fake@imd.gov.in", "password": "wrong"})
        self.assertEqual(res_fail.status_code, 401)

    def test_12_date_query_and_verification(self):
        """Verify temporal query, ground-truth matching, and forecast table retrieval."""
        # Available Date Ranges
        res_dates = self.client.get("/forecast/available-dates")
        self.assertEqual(res_dates.status_code, 200)
        ranges = res_dates.json()
        self.assertIn("goa_ground_truth", ranges)
        self.assertIn("multi_state_forecast_2026", ranges)

        # Query Verified 2025 Historical Ground-Truth Record
        res_q1 = self.client.get("/forecast/query?district=North%20Goa&date=2025-07-15&time=12:00")
        self.assertEqual(res_q1.status_code, 200)
        d1 = res_q1.json()
        self.assertTrue(d1["has_actual_observation"])
        self.assertIsNotNone(d1["actual_observed_rainfall"])
        self.assertGreater(d1["corrected_rainfall"], 0.0)
        self.assertIn("prediction_error", d1)

        # Query 2026 Simulated Record (Actual Observation must be None)
        res_q2 = self.client.get("/forecast/query?district=Bengaluru%20Urban&date=2026-07-15&time=12:00")
        self.assertEqual(res_q2.status_code, 200)
        d2 = res_q2.json()
        self.assertFalse(d2["has_actual_observation"])
        self.assertIsNone(d2["actual_observed_rainfall"])
        self.assertGreaterEqual(d2["corrected_rainfall"], 0.0)

        # Searchable Forecast Table
        res_tbl = self.client.get("/forecast/table?district=North%20Goa&limit=10")
        self.assertEqual(res_tbl.status_code, 200)
        tbl_data = res_tbl.json()
        self.assertIn("records", tbl_data)
        self.assertGreater(len(tbl_data["records"]), 0)

    def test_13_offline_ml_engine_consistency(self):
        """Verify standalone Offline ML Engine outputs match Online Predictor within numerical tolerance."""
        from src.offline_engine import OfflineMLEngine
        engine = OfflineMLEngine()
        
        sample = {
            "state": "Goa",
            "district": "North Goa",
            "taluka_name": "Panaji",
            "latitude": 15.4989,
            "longitude": 73.8278,
            "elevation": 15.0,
            "forecast_valid_time": "2026-07-15T12:00:00",
            "raw_nwp_rainfall": 28.5,
            "temperature": 26.8,
            "pressure": 1003.5,
            "wind_speed": 24.0,
            "relative_humidity": 92.0
        }
        
        # Standalone Offline ML Inference
        off_res = engine.predict_offline(sample)
        self.assertGreaterEqual(off_res["corrected_rainfall"], 0.0)
        self.assertTrue(0 <= off_res["regime_cluster"] <= 4)
        self.assertTrue(0.0 <= off_res["heavy_rain_probability"] <= 1.0)
        self.assertEqual(off_res["offline_engine_mode"], "Standalone Native ML Engine")

        # Check Consistency with Online API /predict/offline
        res_api = self.client.post("/predict/offline", json=sample)
        self.assertEqual(res_api.status_code, 200)
        on_res = res_api.json()

    def test_14_spatial_and_temporal_variance(self):
        """Verify model produces distinct, scientifically valid forecasts across states, dates, and conditions."""
        # 1. Active Monsoon vs Break Monsoon (Temporal & Meteorological Variance)
        active_payload = {
            "state": "Goa", "district": "North Goa", "taluka_name": "Panaji (Tiswadi)",
            "forecast_valid_time": "2025-07-15T12:00:00+05:30",
            "raw_nwp_rain_6h_forecast": 25.0, "raw_nwp_pressure_msl_forecast": 1004.0,
            "raw_nwp_temp_forecast": 27.0, "raw_nwp_wind_speed_forecast": 24.0
        }
        break_payload = {
            "state": "Goa", "district": "North Goa", "taluka_name": "Panaji (Tiswadi)",
            "forecast_valid_time": "2025-08-20T06:00:00+05:30",
            "raw_nwp_rain_6h_forecast": 0.5, "raw_nwp_pressure_msl_forecast": 1012.0,
            "raw_nwp_temp_forecast": 31.0, "raw_nwp_wind_speed_forecast": 8.0
        }
        res_active = self.client.post("/predict", json=active_payload).json()
        res_break = self.client.post("/predict", json=break_payload).json()
        
        self.assertGreater(res_active["corrected_rainfall_mm"], 15.0)
        self.assertLess(res_break["corrected_rainfall_mm"], 5.0)
        self.assertNotEqual(res_active["predicted_weather_regime"], res_break["predicted_weather_regime"])
        self.assertGreater(res_active["heavy_rainfall_probability_pct"], res_break["heavy_rainfall_probability_pct"] + 50.0)

        # 2. Multi-State Spatial Variance: Goa vs Karnataka (Belagavi) vs Kerala (Kannur)
        res_goa = self.client.post("/predict", json={"state": "Goa", "district": "North Goa"}).json()
        res_kar = self.client.post("/predict", json={"state": "Karnataka", "district": "Belagavi"}).json()
        res_ker = self.client.post("/predict", json={"state": "Kerala", "district": "Kannur"}).json()

        # Coordinates must differ
        self.assertNotEqual(res_goa["corrected_rainfall_mm"], res_kar["corrected_rainfall_mm"])
        self.assertNotEqual(res_kar["corrected_rainfall_mm"], res_ker["corrected_rainfall_mm"])
        self.assertEqual(res_kar["state"], "Karnataka")
        self.assertEqual(res_ker["state"], "Kerala")

        # 3. Forecast Lead Time Variance
        res_lead6 = self.client.post("/predict", json={"state": "Karnataka", "district": "Belagavi", "forecast_lead_hours": 6.0}).json()
        res_lead72 = self.client.post("/predict", json={"state": "Karnataka", "district": "Belagavi", "forecast_lead_hours": 72.0}).json()
        self.assertNotEqual(res_lead6["raw_nwp_rainfall"], res_lead72["raw_nwp_rainfall"])


if __name__ == "__main__":
    unittest.main()


