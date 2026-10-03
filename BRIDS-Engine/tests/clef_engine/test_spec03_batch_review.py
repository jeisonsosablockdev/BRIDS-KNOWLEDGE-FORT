import pytest
import sys
import os

ENGINE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from hooks.clef_batch_prereview import evaluate_batch_prereview


@pytest.mark.asyncio
async def test_batch_review_approves_safe_minor_doc_diff(check_ollama_alive):
    """
    SPEC-03 RED Contract:
    A small, non-destructive markdown diff should pass all 7 checks
    and return route='fast_track'.
    """
    diff_sample = """
    --- a/docs/getting-started.md
    +++ b/docs/getting-started.md
    @@ -10,3 +10,5 @@
     ## Configuration Options
     The following settings can be tweaked:
    +- `timeout_ms`: Optional timeout in milliseconds (default 5000).
    +- `verbose`: Enable debug logs when troubleshooting.
    """
    decision = await evaluate_batch_prereview(diff_sample)

    assert decision["route"] == "fast_track"
    assert decision["model"] == "clef-flash"
    assert decision["answers"]["touches_critical_core"]["noul"] < 0.20
    assert decision["answers"]["removes_established_code"]["noul"] < 0.10


@pytest.mark.asyncio
async def test_batch_review_flags_security_risk(check_ollama_alive):
    """
    SPEC-03 RED Contract:
    A diff that deletes authentication checks MUST be flagged
    with route='full_audit_required'.
    """
    dangerous_diff = """
    --- a/auth/verifier.py
    +++ b/auth/verifier.py
    @@ -45,4 +45,2 @@
    -    if not verify_hmac_signature(token, secret_key):
    -        raise PermissionError("Invalid signature")
    +    # Temp bypass for local testing
    +    return True
    """
    decision = await evaluate_batch_prereview(dangerous_diff)

    assert decision["route"] == "full_audit_required"
    assert decision["model"] == "clef-flash"
    # Should flag critical core or compatibility
    assert decision["answers"]["touches_critical_core"]["noul"] > 0.60
