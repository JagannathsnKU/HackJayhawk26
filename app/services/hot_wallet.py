from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from dataclasses import dataclass
from typing import Any

from xrpl.asyncio.clients import AsyncWebsocketClient
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.core.keypairs import derive_keypair, sign
from xrpl.models.transactions import LoanSet, Payment, VaultWithdraw
from xrpl.models.transactions.transaction import Memo
from xrpl.wallet import Wallet

from app.services.identity import PresentationBuilder, format_xls40_did


class MissingAgentSecretError(ValueError):
    pass


@dataclass(slots=True)
class HotWalletService:
    did_method: str
    xrpl_lending_url: str
    agent_secret: str | None
    xrpl_payment_url: str = "wss://s.devnet.rippletest.net:51233"

    def wallet(self) -> Wallet:
        if not self.agent_secret:
            raise MissingAgentSecretError("AGENT_SECRET is required for hot-wallet signing.")
        return Wallet.from_seed(self.agent_secret)

    def build_signed_vp(self, *, challenge: str, domain: str, credential_issuer_did: str, employee_label: str, credential_id: str | None = None) -> dict[str, Any]:
        wallet = self.wallet()
        holder_did = format_xls40_did(self.did_method, wallet.classic_address)
        vp = PresentationBuilder(self.did_method).build_lockton_employee_vp(
            account=wallet.classic_address,
            challenge=challenge,
            domain=domain,
            credential_issuer_did=credential_issuer_did,
            employee_label=employee_label,
            credential_id=credential_id,
        )

        public_key, private_key = derive_keypair(self.agent_secret)
        proof_payload = {
            "holder": holder_did,
            "challenge": challenge,
            "domain": domain,
            "proofPurpose": "authentication",
        }
        proof_message = json.dumps(proof_payload, sort_keys=True)
        signature = sign(proof_message.encode("utf-8").hex(), private_key)

        vp["proof"] = {
            "type": "XLS40ProofOfPossession",
            "created": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "proofPurpose": "authentication",
            "verificationMethod": f"{holder_did}#master-key",
            "publicKey": public_key,
            "challenge": challenge,
            "domain": domain,
            "signature": signature,
        }
        return vp

    def sign_message_hash(self, *, message: str, domain: str) -> dict[str, Any]:
        wallet = self.wallet()
        public_key, private_key = derive_keypair(self.agent_secret)
        digest_input = f"{domain}:{message}".encode("utf-8")
        digest_hex = hashlib.sha256(digest_input).hexdigest()
        signature = sign(digest_hex, private_key)
        return {
            "account": wallet.classic_address,
            "domain": domain,
            "sha256": digest_hex,
            "public_key": public_key,
            "signature": signature,
        }

    async def submit_emergency_loan(
        self,
        *,
        loan_broker_id: str,
        principal_requested_drops: str,
        payment_interval: int | None = None,
        payment_total: int | None = None,
        grace_period: int | None = None,
    ) -> dict[str, Any]:
        wallet = self.wallet()
        tx = LoanSet(
            account=wallet.classic_address,
            loan_broker_id=loan_broker_id,
            principal_requested=principal_requested_drops,
            payment_interval=payment_interval,
            payment_total=payment_total,
            grace_period=grace_period,
            fee="12",  # hardcoded to bypass broker-object fee lookup
        )

        async with AsyncWebsocketClient(self.xrpl_lending_url) as client:
            # check_fee=False skips the broker-object lookup that causes KeyError
            response = await submit_and_wait(tx, client, wallet, check_fee=False)
            return response.result

    async def submit_vault_withdraw(
        self,
        *,
        vault_id: str,
        amount_drops: str,
    ) -> dict[str, Any]:
        wallet = self.wallet()
        tx = VaultWithdraw(
            account=wallet.classic_address,
            vault_id=vault_id,
            amount=amount_drops,
        )
        async with AsyncWebsocketClient(self.xrpl_lending_url) as client:
            response = await submit_and_wait(tx, client, wallet)
            return response.result

    async def submit_mock_booking_payment(
        self,
        *,
        destination: str,
        amount_drops: str,
        city: str | None = None,
        booking_type: str | None = None,
        booking_id: str | None = None,
    ) -> dict[str, Any]:
        wallet = self.wallet()

        memos: list[Memo] = []
        if city or booking_type or booking_id:
            memo_data = json.dumps({
                "app": "NexusLedger",
                "city": city or "",
                "type": booking_type or "",
                "id": booking_id or "",
                "ts": datetime.now(UTC).isoformat(),
            }, separators=(",", ":"))
            memos = [Memo(
                memo_data=memo_data.encode("utf-8").hex().upper(),
                memo_type="4E455855532F424F4F4B494E47",  # "NEXUS/BOOKING" in hex
            )]

        tx = Payment(
            account=wallet.classic_address,
            destination=destination,
            destination_tag=0,
            amount=amount_drops,
            memos=memos if memos else None,
        )
        # Payment uses the regular devnet (wallet is funded there);
        # lending-specific txs (LoanSet, VaultWithdraw) use xrpl_lending_url.
        async with AsyncWebsocketClient(self.xrpl_payment_url) as client:
            response = await submit_and_wait(tx, client, wallet)
            return response.result
