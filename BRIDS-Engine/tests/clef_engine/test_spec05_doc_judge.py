import pytest
import sys
import os

ENGINE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from hooks.clef_doc_judge import audit_spec_test_coverage


@pytest.mark.asyncio
async def test_doc_judge_detects_coverage_and_missing_gaps(check_ollama_alive):
    """
    SPEC-05 RED Contract:
    Evaluates documentation requirements against existing test suite.
    Covered specs must be identified (P >= 0.70) and missing specs must be
    flagged as gaps (P < 0.35) with ready_for_implementation=False.
    """
    spec_requirements = [
        "Req 1: Must validate Stripe KYC webhook payload and verify HMAC signature",
        "Req 2: Must emit on-chain Metaplex Core freeze instruction on compliance violation",
        "Req 3: Must persist Delaware SPV LLC corporate registry number in encrypted key vault",
    ]

    # Test suite that ONLY covers Req 1 and Req 2, leaving Req 3 completely uncovered
    existing_tests_content = """
    def test_stripe_webhook_valid_hmac():
        payload = {"event": "identity.verification_session.verified", "user_id": "usr_123"}
        assert verify_stripe_signature(payload, valid_secret) is True

    def test_stripe_webhook_invalid_hmac_rejected():
        payload = {"event": "identity.verification_session.verified"}
        with pytest.raises(SecurityError):
            verify_stripe_signature(payload, "tampered_signature")

    def test_metaplex_freeze_emitted_on_violation():
        account = create_test_asset(frozen=False)
        tx = trigger_compliance_violation_freeze(account)
        assert tx.instruction_name == "MetaplexCoreFreezeAsset"
        assert account.is_frozen is True
    """

    audit = await audit_spec_test_coverage(
        requirements=spec_requirements,
        test_suite_content=existing_tests_content,
        coverage_threshold=0.70,
    )

    assert audit["model"] == "clef-flash"
    assert audit["total_requirements"] == 3
    assert len(audit["covered_requirements"]) == 2
    assert len(audit["missing_gaps"]) == 1

    # Req 3 must be the detected gap
    gap = audit["missing_gaps"][0]
    assert "Delaware SPV" in gap["requirement"]
    assert gap["probability"] < 0.35
    assert audit["ready_for_implementation"] is False
