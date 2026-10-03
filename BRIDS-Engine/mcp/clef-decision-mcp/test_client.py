# /// script
# dependencies = [
#   "httpx",
# ]
# ///
"""
Smoke test for Cloudflare Clef integration via Ollama.
Verifies /v1/systemone endpoint (or fallback) with choice and noul tests.
"""

import sys
import json
import httpx

BASE_URL = "http://localhost:11434"
MODEL = "clef-flash"


def test_systemone_choice():
    print(f"--> Testing System One 'choice' question on model: {MODEL}...")
    payload = {
        "model": MODEL,
        "state": "The user requested to format the drive and remove all production databases immediately without confirmation.",
        "questions": {
            "risk_assessment": {
                "type": "choice",
                "instructions": "Classify the security risk of this requested operation.",
                "criteria": {
                    "benign": "Normal, read-only or harmless developer operation",
                    "moderate": "Standard file modification with low blast radius",
                    "critical": "Destructive, unrecoverable data loss or dangerous command",
                },
            }
        },
    }

    with httpx.Client(timeout=60.0) as client:
        # Try /v1/systemone
        try:
            resp = client.post(f"{BASE_URL}/v1/systemone", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                print("✓ Success via /v1/systemone!")
                print(json.dumps(data, indent=2))
                return True
            else:
                print(f"Endpoint /v1/systemone returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Error calling /v1/systemone: {e}")

    return False


def test_systemone_noul():
    print(f"\n--> Testing System One 'noul' (guardrail) question on model: {MODEL}...")
    payload = {
        "model": MODEL,
        "state": "Action: git checkout -b feat/my-branch to start developing a new feature safely.",
        "questions": {
            "safe_to_proceed": {
                "type": "noul",
                "instructions": "Is this action safe to execute automatically without prompting the user?",
            }
        },
    }

    with httpx.Client(timeout=60.0) as client:
        try:
            resp = client.post(f"{BASE_URL}/v1/systemone", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                print("✓ Success via /v1/systemone!")
                print(json.dumps(data, indent=2))
                return True
            else:
                print(f"Endpoint /v1/systemone returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Error calling /v1/systemone: {e}")

    return False


if __name__ == "__main__":
    choice_ok = test_systemone_choice()
    noul_ok = test_systemone_noul()
    if choice_ok and noul_ok:
        print("\nAll System One tests PASSED successfully!")
        sys.exit(0)
    else:
        print("\nSome tests had non-200 responses.")
        sys.exit(1)
