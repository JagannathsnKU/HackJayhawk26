from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


class DidResolutionRequest(BaseModel):
    account: str = Field(..., description="XRPL account address held on the Ledger device")


class VerifiablePresentationRequest(BaseModel):
    account: str
    challenge: str
    domain: str = "nexus-ledger.local"
    credential_issuer_did: str = "did:example:lockton"
    credential_id: str | None = None
    employee_label: str = "Lockton Employee"


class IdentityVerifyRequest(BaseModel):
    challenge: str
    domain: str = "nexus-ledger.local"
    credential_issuer_did: str = "did:example:lockton"
    credential_id: str | None = None
    employee_label: str = "Lockton Employee"


class EmergencyLoanRequest(BaseModel):
    loan_broker_id: str
    principal_requested_drops: str = Field(default="50000000", description="Requested principal in drops")
    payment_interval: int | None = None
    payment_total: int | None = None
    grace_period: int | None = None
    memo: str | None = None


class MockBookingRequest(BaseModel):
    booking_type: str = Field(..., description="hotel, flight, train, or rental")
    destination_city: str
    travel_date: str
    amount_drops: str | None = Field(default=None, description="Override payment amount in drops (integer string, e.g. 1000000)")
    pay_to_address: str | None = Field(default=None, description="XRPL destination account for demo payout")
    note: str | None = None

    @field_validator("amount_drops")
    @classmethod
    def must_be_numeric(cls, v: str | None) -> str | None:
        if v is not None and not v.strip().lstrip("-").isdigit():
            raise ValueError(f"amount_drops must be an integer string (drops), got: {v!r}")
        return v


class HashSignRequest(BaseModel):
    message: str
    domain: str = "nexus-ledger.local"


class TripFundingRequest(BaseModel):
    account: str
    amount_drops: str = Field(..., description="Amount in drops")
    travel_case_id: str
    memo: str | None = None


class GuardianFundingRequest(BaseModel):
    account: str
    amount_drops: str = Field(..., description="Amount in drops")
    travel_case_id: str
    vault_id: str
    memo: str | None = None


class VaultWithdrawRequest(BaseModel):
    account: str
    vault_id: str
    amount_drops: str = Field(..., description="Amount in drops")
    memo: str | None = None


class GuardianExecuteRequest(BaseModel):
    loan_broker_id: str
    principal_requested_drops: str = Field(default="50000000", description="Loan amount in drops")
    vault_id: str
    vault_amount_drops: str = Field(..., description="Vault withdrawal amount in drops")
    travel_case_id: str
    memo: str | None = None


class SignedBlobRequest(BaseModel):
    signed_blob: str


class HookInterpretRequest(BaseModel):
    result_code: str
    transaction_type: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)
    speak: bool = False


class TranscriptRequest(BaseModel):
    text: str
    voice_id: str | None = None


class TerminalCommand(BaseModel):
    action: str
    payload: dict[str, Any] = Field(default_factory=dict)
