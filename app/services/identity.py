from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Any


def format_xls40_did(method: str, account: str) -> str:
    return f"{method}:{account}"


def commitment_for_account(account: str, challenge: str) -> str:
    digest = hashlib.sha256(f"{account}:{challenge}".encode("utf-8")).hexdigest()
    return f"urn:sha256:{digest}"


@dataclass(slots=True)
class PresentationBuilder:
    did_method: str

    def build_lockton_employee_vp(
        self,
        *,
        account: str,
        challenge: str,
        domain: str,
        credential_issuer_did: str,
        employee_label: str,
        credential_id: str | None = None,
    ) -> dict[str, Any]:
        holder_did = format_xls40_did(self.did_method, account)
        subject_commitment = commitment_for_account(account, challenge)

        credential: dict[str, Any] = {
            "issuer": credential_issuer_did,
            "type": ["VerifiableCredential", "EmploymentCredential"],
            "credentialSubject": {
                "status": employee_label,
                "subjectCommitment": subject_commitment,
            },
        }

        if credential_id is not None:
            credential["id"] = credential_id

        return {
            "type": ["VerifiablePresentation"],
            "holder": holder_did,
            "verifiableCredential": [credential],
            "proofRequest": {
                "challenge": challenge,
                "domain": domain,
                "disclosure": ["status"],
            },
        }
