"""
Test Suite: Exact Methodology Verification of "Smart Contract: Attacks and Protections".
Paper Citation: Sayeed et al., IEEE Access 2020 (DOI: 10.1109/ACCESS.2020.2970495).
Validates:
1. 4-Tier Exploitation Taxonomy (Section III & Table 1)
2. 7 Core Attack Techniques (Section IV & Listings 1, 2, 3)
3. 10-Tool Benchmark Matrix & False Sense of Security (Section V & VI)
4. Gas Fee Formula & 256-bit Modulo Overflow Simulator (Section II-C & IV-B)
5. FastAPI End-to-End API Integration
"""

import pytest
from fastapi.testclient import TestClient

from app.services.smart_contract_security.taxonomy import BlockchainExploitTaxonomy, ExploitTier
from app.services.smart_contract_security.analyzers import SmartContractSecurityEngine
from app.services.smart_contract_security.benchmark_matrix import ToolsBenchmarkMatrix, get_benchmark_comparison_matrix
from app.services.smart_contract_security.gas_engine import GasAndArithmeticEngine
from app.services.smart_contract_security.contract_repository import ContractRepository
from main import app

client = TestClient(app)
engine = SmartContractSecurityEngine()


# =====================================================================
# 1. TAXONOMY VERIFICATION (Section III, Figure 3 & Table 1)
# =====================================================================
def test_taxonomy_tiers_completeness():
    """Verify that all 4 exploitation tiers from Section III and Table 1 are implemented."""
    tiers = BlockchainExploitTaxonomy.get_all_tiers()
    tier_names = [t["tier"] for t in tiers]

    assert ExploitTier.MALICIOUS_ACTS.value in tier_names
    assert ExploitTier.WEAK_PROTOCOL.value in tier_names
    assert ExploitTier.DEFRAUD.value in tier_names
    assert ExploitTier.APPLICATION_BUGS.value in tier_names

    # Verify specific vectors mentioned in Table 1
    malicious_vectors = [v["name"] for t in tiers if t["tier"] == ExploitTier.MALICIOUS_ACTS.value for v in t["attack_vectors"]]
    assert "Mining Malware" in malicious_vectors
    assert "Cryptojacking" in malicious_vectors
    assert "Slack and Forums Social Engineering" in malicious_vectors

    weak_proto_vectors = [v["name"] for t in tiers if t["tier"] == ExploitTier.WEAK_PROTOCOL.value for v in t["attack_vectors"]]
    assert any("51%" in v for v in weak_proto_vectors)
    assert any("34%" in v for v in weak_proto_vectors)
    assert any("Sybil" in v for v in weak_proto_vectors)

    defraud_vectors = [v["name"] for t in tiers if t["tier"] == ExploitTier.DEFRAUD.value for v in t["attack_vectors"]]
    assert "Double Spending" in defraud_vectors
    assert any("1 Confirmation" in v for v in defraud_vectors)


# =====================================================================
# 2. VULNERABILITY DETECTORS (Section IV & Listings 1, 2, 3)
# =====================================================================
def test_listing_1_reentrancy_detection():
    """Verify exact Listing 1 from paper is flagged as CRITICAL Reentrancy."""
    contract = ContractRepository.get_contract_by_id("listing-1-reentrancy")
    assert contract is not None

    result = engine.analyze_solidity(contract.source_code)
    assert result["status"] == "CRITICAL_VULNERABLE"
    assert result["severity_breakdown"]["critical"] >= 1

    reentrancy_findings = [f for f in result["findings"] if f["technique"] == "Reentrancy"]
    assert len(reentrancy_findings) >= 1
    f = reentrancy_findings[0]
    assert f["paper_section"] == "Section IV-A"
    assert f["paper_listing"] == "Listing 1"
    assert f["severity"] == "CRITICAL"


def test_listing_2_overflow_detection():
    """Verify exact Listing 2 from paper (batchTransfer overflow) is detected."""
    contract = ContractRepository.get_contract_by_id("listing-2-overflow")
    assert contract is not None

    result = engine.analyze_solidity(contract.source_code)
    assert result["status"] == "CRITICAL_VULNERABLE"

    overflow_findings = [f for f in result["findings"] if f["technique"] == "Integer Overflow and Underflow"]
    assert len(overflow_findings) >= 1
    f = overflow_findings[0]
    assert f["paper_section"] == "Section IV-B"
    assert f["paper_listing"] == "Listing 2"
    assert f["severity"] == "CRITICAL"


def test_listing_3_default_visibility_detection():
    """Verify exact Listing 3 from paper (GuessAddress _sendEther visibility) is detected."""
    contract = ContractRepository.get_contract_by_id("listing-3-visibility")
    assert contract is not None

    result = engine.analyze_solidity(contract.source_code)
    assert result["status"] == "CRITICAL_VULNERABLE"

    vis_findings = [f for f in result["findings"] if f["technique"] == "Default Visibilities"]
    assert len(vis_findings) >= 1
    # Check that _sendEther or gainEther is caught
    titles = [f["title"] for f in vis_findings]
    assert any("_sendEther" in t or "gainEther" in t for t in titles)


def test_parity_multisig_delegatecall_detection():
    """Verify Parity Multisig delegatecall and initWallet visibility vulnerabilities are flagged."""
    contract = ContractRepository.get_contract_by_id("parity-multisig-delegatecall")
    assert contract is not None

    result = engine.analyze_solidity(contract.source_code)
    assert result["status"] == "CRITICAL_VULNERABLE"

    techniques = [f["technique"] for f in result["findings"]]
    assert "DELEGATECALL" in techniques
    assert "Default Visibilities" in techniques


def test_remediated_safe_contract_passes():
    """Verify clean remediated contract (Checks-Effects-Interactions + SafeMath) yields ZERO critical findings."""
    contract = ContractRepository.get_contract_by_id("safe-reentrancy-cei")
    assert contract is not None

    result = engine.analyze_solidity(contract.source_code)
    assert result["status"] == "SECURE"
    assert result["total_findings"] == 0
    assert result["risk_score"] == 0.0


# =====================================================================
# 3. 10-TOOL BENCHMARK & FALSE SENSE OF SECURITY (Section V & VI)
# =====================================================================
def test_10_tools_benchmark_integrity():
    """Verify all 10 tools cited in paper are included with reported experimental parameters."""
    matrix = get_benchmark_comparison_matrix()
    tools = matrix["tools"]
    assert len(tools) == 10

    tool_names = [t["name"] for t in tools]
    expected_tools = ["Slither", "MythX", "Mythril", "Manticore", "Securify", "SmartCheck", "Echidna", "Oyente", "Vandal", "Zeus"]
    for expected in expected_tools:
        assert expected in tool_names

    # Check paper-reported facts:
    securify = next(t for t in tools if t["name"] == "Securify")
    assert securify["overflow_supported"] is False  # Securify misses overflows (no numerical analysis)

    smartcheck = next(t for t in tools if t["name"] == "SmartCheck")
    assert smartcheck["reentrancy_supported"] is False  # SmartCheck misses reentrancy

    oyente = next(t for t in tools if t["name"] == "Oyente")
    assert oyente["tod_supported"] is False  # Oyente misses 72.9% of TOD


def test_false_sense_of_security_calculation():
    """Verify computation of false sense of security for tools missing active vulnerabilities."""
    active_vulns = ["Reentrancy", "Integer Overflow and Underflow", "Transaction Ordering Dependence(TOD)"]
    eval_result = ToolsBenchmarkMatrix.compute_false_sense_of_security(["Securify", "SmartCheck", "Oyente"], active_vulns)

    evals = {e["tool"]: e for e in eval_result["tool_evaluations"]}
    
    # Securify misses Overflow
    assert evals["Securify"]["missed"] >= 1
    # SmartCheck misses Reentrancy and TOD
    assert evals["SmartCheck"]["missed"] >= 2
    # Oyente misses TOD and Overflow
    assert evals["Oyente"]["missed"] >= 2


# =====================================================================
# 4. MATHEMATICAL FORMULAS & MODULO SIMULATION (Section II-C & IV-B)
# =====================================================================
def test_gas_fee_formula():
    """Verify Ether = Gas Limit * Gas Price formula from Section II-C."""
    # 21,000 gas * 30 Gwei = 630,000 Gwei = 0.00063 ETH
    res = GasAndArithmeticEngine.calculate_gas_fee(21000, 30.0)
    assert res["total_fee_eth"] == 0.00063
    assert res["total_fee_wei"] == 630000000000000


def test_batch_transfer_modulo_256_overflow():
    """Verify 2^256 modulo overflow wraps to 0 in Listing 2 simulation."""
    # cnt = 2, value = 2^255 => 2 * 2^255 = 2^256 = 0 (mod 2^256)
    value_2_255 = 2 ** 255
    res = GasAndArithmeticEngine.simulate_batch_transfer_overflow(2, value_2_255)
    assert res["is_overflow"] is True
    assert res["evm_stored_total"] == "0"
    assert res["bypass_exploit_active"] is True


def test_timestamp_drift_30s_rule():
    """Verify the 30-second drift tolerance rule from Section IV-G."""
    # Drift within 30s is manipulable
    res_vulnerable = GasAndArithmeticEngine.evaluate_timestamp_drift(1700000020, 1700000000)
    assert res_vulnerable["miner_manipulable"] is True

    # Drift over 30s is not manipulable
    res_safe = GasAndArithmeticEngine.evaluate_timestamp_drift(1700000100, 1700000000)
    assert res_safe["miner_manipulable"] is False


# =====================================================================
# 5. FASTAPI REST API INTEGRATION
# =====================================================================
def test_api_taxonomy_endpoint():
    """Verify /api/v1/smart-contract/taxonomy returns 200 with full 4 tiers."""
    resp = client.get("/api/v1/smart-contract/taxonomy")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["total_tiers"] == 4


def test_api_benchmark_endpoint():
    """Verify /api/v1/smart-contract/benchmark returns 200 with 10 tools."""
    resp = client.get("/api/v1/smart-contract/benchmark")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["benchmark"]["total_tools"] == 10


def test_api_contracts_endpoint():
    """Verify /api/v1/smart-contract/contracts returns benchmark contracts."""
    resp = client.get("/api/v1/smart-contract/contracts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert len(data["contracts"]) >= 7


def test_api_analyze_listing_1():
    """Verify /api/v1/smart-contract/analyze successfully processes Listing 1."""
    contract = ContractRepository.get_contract_by_id("listing-1-reentrancy")
    resp = client.post("/api/v1/smart-contract/analyze", json={
        "source_code": contract.source_code,
        "contract_name": "Listing1Revoke"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["overall_status"] == "CRITICAL_VULNERABLE"
    assert len(data["findings"]) >= 1
    assert data["findings"][0]["technique"] == "Reentrancy"


def test_api_metrics_endpoint():
    """Verify /api/v1/smart-contract/metrics runs full ground truth evaluation."""
    resp = client.get("/api/v1/smart-contract/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    summary = data["benchmark_summary"]
    assert summary["accuracy"] >= 0.90  # Honest empirical evaluation on held-out benchmark suite
    assert summary["precision"] >= 0.90
    assert summary["recall"] == 1.0
