"""
Unit & Integration Tests for Upgraded Smart Contract Security Platform.
Tests:
1. Tool Integration Layer (Slither live execution, 10 adapter status reporting)
2. Upgraded Custom Scanner (CEI reentrancy, Solidity >=0.8.0 safe math, SafeMath, visibility)
3. Ground-Truth Benchmark Engine (16-contract test suite, confusion matrix, macro metrics)
4. Real-World Attack Incidents Repository (on-chain proofs, root cause separation)
5. FastAPI Endpoints (/tools-status, /analyze, /benchmark, /incidents)
"""

import pytest
from fastapi.testclient import TestClient
from main import app

from app.services.smart_contract_security.tool_adapters import (
    ToolOrchestrator,
    SlitherAdapter,
    ToolStatus
)
from app.services.smart_contract_security.analyzers import SmartContractSecurityEngine
from app.services.smart_contract_security.benchmark_engine import BenchmarkEngine
from app.services.smart_contract_security.incidents import IncidentRepository


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def engine():
    return SmartContractSecurityEngine()


@pytest.fixture
def orchestrator():
    return ToolOrchestrator()


@pytest.fixture
def benchmark():
    return BenchmarkEngine()


# ==========================================
# 1. TOOL INTEGRATION LAYER TESTS
# ==========================================
class TestToolAdapters:

    def test_all_10_tools_registered(self, orchestrator):
        statuses = orchestrator.get_all_adapters_status()
        assert len(statuses) == 10
        tool_names = {s["tool_name"] for s in statuses}
        expected_tools = {
            "Slither", "Mythril", "MythX", "Manticore", "Securify",
            "SmartCheck", "Echidna", "Oyente", "Vandal", "Zeus"
        }
        assert tool_names == expected_tools

    def test_slither_is_available(self, orchestrator):
        slither_status = next(s for s in orchestrator.get_all_adapters_status() if s["tool_name"] == "Slither")
        assert slither_status["is_available"] is True
        assert slither_status["status"] == ToolStatus.EXECUTED.value

    def test_mythril_is_available(self, orchestrator):
        mythril_status = next(s for s in orchestrator.get_all_adapters_status() if s["tool_name"] == "Mythril")
        assert mythril_status["is_available"] is True
        assert mythril_status["status"] == ToolStatus.EXECUTED.value

    def test_slither_live_execution(self, orchestrator):
        vulnerable_sol = """// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
contract ReentrancyTest {
    mapping(address => uint) public balances;
    function withdraw() public {
        (bool s, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(s);
        balances[msg.sender] = 0;
    }
}"""
        res = orchestrator.run_tool("Slither", vulnerable_sol, "ReentrancyTest")
        assert res.status == ToolStatus.EXECUTED
        assert res.is_live_execution is True
        assert res.total_findings > 0
        detector_checks = [f.title for f in res.findings]
        assert any("reentrancy-eth" in c for c in detector_checks)

    def test_unavailable_tools_report_honest_status(self, orchestrator):
        # MythX without key should be unavailable, not mock executed
        res = orchestrator.run_tool("MythX", "pragma solidity ^0.8.0;", "Test")
        assert res.status == ToolStatus.UNAVAILABLE
        assert res.is_live_execution is False
        assert "MYTHX_API_KEY" in res.error_message


# ==========================================
# 2. UPGRADED CUSTOM SCANNER TESTS
# ==========================================
class TestUpgradedCustomScanner:

    def test_reentrancy_cei_safe_pattern(self, engine):
        safe_cei = """// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
contract SafeVault {
    mapping(address => uint) balances;
    function withdraw() public {
        uint amt = balances[msg.sender];
        balances[msg.sender] = 0; // State effect applied FIRST
        (bool s, ) = msg.sender.call{value: amt}("");
        require(s);
    }
}"""
        res = engine.analyze_solidity(safe_cei)
        reentrancy_findings = [f for f in res["findings"] if f["technique"] == "Reentrancy"]
        assert len(reentrancy_findings) == 0

    def test_reentrancy_guard_suppression(self, engine):
        guarded = """// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
contract GuardedVault {
    mapping(address => uint) balances;
    function withdraw() public nonReentrant {
        (bool s, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(s);
        balances[msg.sender] = 0;
    }
}"""
        res = engine.analyze_solidity(guarded)
        reentrancy_findings = [f for f in res["findings"] if f["technique"] == "Reentrancy"]
        assert len(reentrancy_findings) == 0

    def test_solidity_08_built_in_overflow_protection(self, engine):
        safe_math = """// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
contract NativeMath {
    function calculate(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 total = a * b;
        return total;
    }
}"""
        res = engine.analyze_solidity(safe_math)
        overflow_findings = [f for f in res["findings"] if f["technique"] == "Integer Overflow and Underflow"]
        assert len(overflow_findings) == 0

    def test_bec_pattern_in_0424_detected(self, engine):
        bec_code = """// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;
contract VulnerableBEC {
    mapping(address => uint256) balances;
    function batchTransfer(address[] _acceptors, uint256 _value) public returns (bool) {
        uint cnt = _acceptors.length;
        uint256 total = uint256(cnt) * _value;
        require(balances[msg.sender] >= total);
        balances[msg.sender] -= total;
        return true;
    }
}"""
        res = engine.analyze_solidity(bec_code)
        overflow_findings = [f for f in res["findings"] if f["technique"] == "Integer Overflow and Underflow"]
        assert len(overflow_findings) >= 1

    def test_listing_3_default_visibility_in_0424(self, engine):
        listing3 = """// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;
contract GuessAddress {
    function _sendEther() {
        msg.sender.transfer(this.balance);
    }
}"""
        res = engine.analyze_solidity(listing3)
        visibility_findings = [f for f in res["findings"] if f["technique"] == "Default Visibilities"]
        assert len(visibility_findings) >= 1
        assert visibility_findings[0]["swc_id"] == "SWC-100"


# ==========================================
# 3. GROUND-TRUTH BENCHMARK ENGINE TESTS
# ==========================================
class TestBenchmarkEngine:

    def test_suite_has_16_samples(self, benchmark):
        assert len(benchmark.BENCHMARK_SUITE) == 16
        vulnerable_count = sum(1 for s in benchmark.BENCHMARK_SUITE if s.is_vulnerable)
        clean_count = sum(1 for s in benchmark.BENCHMARK_SUITE if not s.is_vulnerable)
        assert vulnerable_count == 10
        assert clean_count == 6

    def test_custom_scanner_benchmark_evaluation(self, benchmark):
        report = benchmark.evaluate_custom_scanner()
        assert report.total_samples == 16
        assert report.failed_samples == 0
        cm = report.contract_level_metrics
        assert cm["true_positives"] == 10
        assert cm["false_negatives"] == 0
        assert cm["recall"] == 1.0
        assert cm["accuracy"] >= 0.90
        assert cm["f1_score"] >= 0.90

    def test_per_technique_metrics_computed(self, benchmark):
        report = benchmark.evaluate_custom_scanner()
        tech_metrics = report.technique_level_metrics
        assert "Reentrancy" in tech_metrics
        assert "Integer Overflow and Underflow" in tech_metrics
        assert "Default Visibilities" in tech_metrics
        assert tech_metrics["Reentrancy"].f1_score == 1.0


# ==========================================
# 4. REAL-WORLD INCIDENT REPOSITORY TESTS
# ==========================================
class TestIncidentRepository:

    def test_incidents_count_and_keys(self):
        incidents = IncidentRepository.get_all_incidents()
        assert len(incidents) >= 6
        ids = {inc.incident_id for inc in incidents}
        assert "the-dao-2016" in ids
        assert "parity-multisig-1-2017" in ids
        assert "parity-multisig-2-2017" in ids
        assert "bec-token-2018" in ids

    def test_the_dao_incident_provenance(self):
        dao = IncidentRepository.get_incident_by_id("the-dao-2016")
        assert dao is not None
        assert dao.loss_amount_usd == 60000000.0
        assert dao.primary_vulnerability_technique == "Reentrancy"
        assert dao.validation.on_chain_confirmed is True
        assert dao.exploit_tx_hash.startswith("0x")


# ==========================================
# 5. FASTAPI REST ROUTE INTEGRATION TESTS
# ==========================================
class TestApiRoutes:

    def test_tools_status_endpoint(self, client):
        r = client.get("/api/v1/smart-contract/tools-status")
        assert r.status_code == 200
        data = r.json()
        assert data["total_tools"] == 10
        assert data["available_tools_count"] >= 1

    def test_analyze_endpoint_with_slither(self, client):
        sol = """// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
contract Test {
    function withdraw() public {
        (bool s, ) = msg.sender.call{value: 1}("");
        require(s);
    }
}"""
        r = client.post("/api/v1/smart-contract/analyze", json={
            "source_code": sol,
            "contract_name": "TestContract",
            "execute_external_tools": True
        })
        assert r.status_code == 200
        data = r.json()
        assert "custom_scanner" in data
        assert "external_tools" in data
        assert "Slither" in data["external_tools"]
        assert data["external_tools"]["Slither"]["status"] == "EXECUTED"
        assert "live_tools" in data
        assert "academic_reference_tools" in data
        assert len(data["academic_reference_tools"]) == 8
        assert "Slither" in data["live_tools"]

    def test_benchmark_endpoint(self, client):
        r = client.get("/api/v1/smart-contract/benchmark")
        assert r.status_code == 200
        data = r.json()
        assert "benchmark_report" in data
        assert data["benchmark_report"]["contract_level_metrics"]["accuracy"] >= 0.90

    def test_incidents_endpoints(self, client):
        r = client.get("/api/v1/smart-contract/incidents")
        assert r.status_code == 200
        data = r.json()
        assert data["total_incidents"] >= 6

        r_single = client.get("/api/v1/smart-contract/incidents/bec-token-2018")
        assert r_single.status_code == 200
        assert r_single.json()["incident"]["primary_vulnerability_technique"] == "Integer Overflow and Underflow"

    def test_gas_calculator_endpoint(self, client):
        r = client.post("/api/v1/smart-contract/gas-calc", json={
            "gas_limit": 21000,
            "gas_price_gwei": 30.0
        })
        assert r.status_code == 200
        assert r.json()["result"]["total_fee_eth"] == 0.00063
