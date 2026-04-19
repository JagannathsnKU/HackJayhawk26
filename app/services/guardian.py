from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.hot_wallet import HotWalletService
from app.services.transactions import TripTransactionBuilder


@dataclass(slots=True)
class GuardianAgent:
    transaction_builder: TripTransactionBuilder
    hot_wallet: HotWalletService | None = None

    def prepare_trip_funding(self, *, account: str, amount_drops: str, travel_case_id: str, vault_id: str, memo: str | None = None) -> dict[str, dict[str, object]]:
        return {
            "loan_set": self.transaction_builder.prepare_loan_set(
                account=account,
                amount_drops=amount_drops,
                travel_case_id=travel_case_id,
                memo=memo,
            ),
            "vault_withdraw": self.transaction_builder.prepare_vault_withdraw(
                account=account,
                vault_id=vault_id,
                amount_drops=amount_drops,
                memo=memo,
            ),
        }

    async def fund_trip(
        self,
        *,
        loan_broker_id: str,
        principal_requested_drops: str,
        vault_id: str,
        vault_amount_drops: str,
        travel_case_id: str,
    ) -> dict[str, Any]:
        if not self.hot_wallet:
            raise ValueError("HotWalletService required to execute fund_trip")
        loan_result = await self.hot_wallet.submit_emergency_loan(
            loan_broker_id=loan_broker_id,
            principal_requested_drops=principal_requested_drops,
        )
        vault_result = await self.hot_wallet.submit_vault_withdraw(
            vault_id=vault_id,
            amount_drops=vault_amount_drops,
        )
        return {
            "loan": loan_result,
            "vault_withdraw": vault_result,
            "travel_case_id": travel_case_id,
        }
