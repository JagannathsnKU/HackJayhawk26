from app.core.config import get_settings
from app.services.hooks import explain_hook_result
from app.services.identity import PresentationBuilder, format_xls40_did


def test_did_format_uses_configured_method() -> None:
    settings = get_settings()
    assert format_xls40_did(settings.did_method, "rABC123") == f"{settings.did_method}:rABC123"


def test_vp_does_not_expose_raw_identity_fields() -> None:
    vp = PresentationBuilder("did:xls-40:ripple").build_lockton_employee_vp(
        account="rABC123",
        challenge="nonce-1",
        domain="nexus-ledger.local",
        credential_issuer_did="did:example:lockton",
        employee_label="Lockton Employee",
    )
    credential_subject = vp["verifiableCredential"][0]["credentialSubject"]
    assert credential_subject["status"] == "Lockton Employee"
    assert "account" not in credential_subject


def test_hook_explainer_maps_rejection_code() -> None:
    message = explain_hook_result("tecHOOK_REJECTED", "LoanSet")
    assert "rejected" in message.lower()
