from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class TripTransactionBuilder:
    def prepare_loan_set(self, *, account: str, amount_drops: str, travel_case_id: str, memo: str | None = None) -> dict[str, Any]:
        tx = {
            "TransactionType": "LoanSet",
            "Account": account,
            "Amount": amount_drops,
            "TravelCaseId": travel_case_id,
        }
        if memo:
            tx["Memo"] = memo
        return tx

    def prepare_vault_withdraw(self, *, account: str, vault_id: str, amount_drops: str, memo: str | None = None) -> dict[str, Any]:
        tx = {
            "TransactionType": "VaultWithdraw",
            "Account": account,
            "VaultID": vault_id,
            "Amount": amount_drops,
        }
        if memo:
            tx["Memo"] = memo
        return tx
