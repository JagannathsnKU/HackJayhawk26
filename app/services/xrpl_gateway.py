from __future__ import annotations

from typing import Any

from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.asyncio.clients import AsyncWebsocketClient
from xrpl.models.requests import AccountInfo
from xrpl.models.requests import Submit


class XrplGateway:
    def __init__(self, ws_url: str) -> None:
        self._ws_url = ws_url

    async def submit_signed_blob(self, signed_blob: str) -> dict[str, Any]:
        async with AsyncWebsocketClient(self._ws_url) as client:
            response = await client.request(Submit(tx_blob=signed_blob))
            return response.result

    async def check_account_on_network(self, *, address: str, rpc_url: str, network_name: str) -> dict[str, Any]:
        try:
            client = AsyncJsonRpcClient(rpc_url)
            response = await client.request(
                AccountInfo(account=address, ledger_index="validated", strict=True)
            )
        except Exception as exc:
            return {
                "network": network_name,
                "rpc_url": rpc_url,
                "exists": False,
                "reachable": False,
                "error": f"{type(exc).__name__}: {exc}",
            }

        result = response.result
        account_data = result.get("account_data")
        status = result.get("status")

        if account_data:
            return {
                "network": network_name,
                "rpc_url": rpc_url,
                "exists": True,
                "reachable": True,
                "balance_drops": account_data.get("Balance"),
                "sequence": account_data.get("Sequence"),
                "ledger_index": result.get("ledger_index"),
            }

        return {
            "network": network_name,
            "rpc_url": rpc_url,
            "exists": False,
            "reachable": True,
            "status": status,
            "error": result.get("error"),
            "error_message": result.get("error_message"),
        }

    async def check_account_across_networks(self, *, address: str) -> dict[str, Any]:
        networks = [
            ("XRPL Testnet", "https://s.altnet.rippletest.net:51234/"),
            ("XRPL Devnet", "https://s.devnet.rippletest.net:51234/"),
            ("XRPL Lending Devnet", "https://lend.devnet.rippletest.net:51234/"),
        ]
        checks: list[dict[str, Any]] = []
        for network_name, rpc_url in networks:
            checks.append(
                await self.check_account_on_network(
                    address=address,
                    rpc_url=rpc_url,
                    network_name=network_name,
                )
            )

        present_on = [entry["network"] for entry in checks if entry.get("exists")]
        return {
            "address": address,
            "present_on": present_on,
            "checks": checks,
        }
