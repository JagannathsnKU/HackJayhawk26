"""
Nexus Ledger MCP Server
-----------------------
Exposes every backend capability as an MCP tool so any AI assistant
(Claude, etc.) can control the entire system: book travel, run loans,
verify identities, query chain state, and read/write trip memory.

Run standalone:
    python -m app.mcp_server

Or mount alongside FastAPI by importing nexus_mcp in main.py.
"""
from __future__ import annotations

import asyncio
from typing import Any

from mcp.server.fastmcp import FastMCP

from app.core.config import get_settings
from app.services.hooks import explain_hook_result
from app.services.hot_wallet import HotWalletService, MissingAgentSecretError
from app.services.identity import PresentationBuilder, format_xls40_did
from app.services.memory import TripMemory, get_memory
from app.services.xrpl_gateway import XrplGateway

nexus_mcp = FastMCP("Nexus Ledger")


def _wallet_service() -> HotWalletService:
    s = get_settings()
    return HotWalletService(
        did_method=s.did_method,
        xrpl_lending_url=s.xrpl_lending_url,
        agent_secret=s.agent_secret,
    )


# ── Memory tools ──────────────────────────────────────────────────────────────

@nexus_mcp.tool()
def get_trip_context() -> dict[str, Any]:
    """Return everything the agent remembers: current trip, bookings, loans, budget used."""
    return get_memory().summary()


@nexus_mcp.tool()
def start_trip(destination: str, start_date: str, budget_drops: str = "5000000") -> str:
    """Begin a new trip, resetting the budget counter and recording destination."""
    get_memory().set_trip(destination, start_date, budget_drops)
    budget_xrp = int(budget_drops) / 1_000_000
    return f"Trip to {destination} started. Budget: {budget_xrp} XRP."


@nexus_mcp.tool()
def remember(key: str, value: str) -> str:
    """Store any traveler preference or context (e.g. seat='aisle', diet='vegan')."""
    get_memory().preferences[key] = value
    return f"Remembered: {key} = {value}"


@nexus_mcp.tool()
def recall(key: str) -> str:
    """Retrieve a stored preference or context value."""
    val = get_memory().preferences.get(key)
    return val if val is not None else f"Nothing stored for '{key}'"


# ── Identity tools ─────────────────────────────────────────────────────────────

@nexus_mcp.tool()
def get_agent_did() -> str:
    """Return the agent's on-chain DID (XLS-40)."""
    svc = _wallet_service()
    wallet = svc.wallet()
    return format_xls40_did(get_settings().did_method, wallet.classic_address)


@nexus_mcp.tool()
def verify_identity(challenge: str, domain: str = "nexus-ledger.local") -> dict[str, Any]:
    """Build and sign a Verifiable Presentation proving Lockton employment. Used for hotel check-in."""
    svc = _wallet_service()
    vp = svc.build_signed_vp(
        challenge=challenge,
        domain=domain,
        credential_issuer_did="did:example:lockton",
        employee_label="Lockton Employee",
    )
    wallet = svc.wallet()
    return {
        "did": format_xls40_did(get_settings().did_method, wallet.classic_address),
        "presentation": vp,
        "verified": True,
    }


# ── Finance tools ──────────────────────────────────────────────────────────────

@nexus_mcp.tool()
async def book_travel(booking_type: str, city: str, date: str, amount_drops: str = "1000000") -> dict[str, Any]:
    """
    Book travel (hotel / flight / train / rental) and execute a real XRPL Payment.
    amount_drops: cost in XRP drops (1 XRP = 1_000_000 drops).
    """
    settings = get_settings()
    svc = _wallet_service()
    destination = settings.mock_booking_destination
    if not destination:
        return {"ok": False, "error": "MOCK_BOOKING_DESTINATION not configured"}

    result = await svc.submit_mock_booking_payment(destination=destination, amount_drops=amount_drops)
    tx_hash = result.get("hash", "")
    engine = str(result.get("engine_result") or result.get("meta", {}).get("TransactionResult") or "")

    if engine.startswith(("tec", "tem", "tef")):
        return {"ok": False, "engine_result": engine, "hook_explanation": explain_hook_result(engine, "Payment")}

    import uuid
    booking_id = f"mock_{uuid.uuid4().hex[:12]}"
    get_memory().record_booking(booking_id, booking_type, city, date, amount_drops, tx_hash)

    return {
        "ok": True,
        "booking_id": booking_id,
        "tx_hash": tx_hash,
        "explorer_url": f"https://devnet.xrpl.org/transactions/{tx_hash}",
        "city": city,
        "date": date,
        "amount_xrp": int(amount_drops) / 1_000_000,
    }


@nexus_mcp.tool()
async def emergency_loan(loan_broker_id: str, amount_drops: str = "50000000") -> dict[str, Any]:
    """
    Flash-borrow XRP from the XLS-66 Lending Protocol when the primary budget is exhausted.
    Hooks on the lending devnet validate corporate policy before releasing funds.
    """
    svc = _wallet_service()
    result = await svc.submit_emergency_loan(
        loan_broker_id=loan_broker_id,
        principal_requested_drops=amount_drops,
    )
    tx_hash = result.get("hash", "")
    engine = str(result.get("engine_result") or result.get("meta", {}).get("TransactionResult") or "")

    if engine.startswith(("tec", "tem", "tef")):
        return {"ok": False, "engine_result": engine, "hook_explanation": explain_hook_result(engine, "LoanSet")}

    get_memory().record_loan(amount_drops, loan_broker_id, tx_hash)
    return {
        "ok": True,
        "tx_hash": tx_hash,
        "amount_xrp": int(amount_drops) / 1_000_000,
        "explorer_url": f"https://devnet.xrpl.org/transactions/{tx_hash}",
    }


@nexus_mcp.tool()
async def check_balance(address: str | None = None) -> dict[str, Any]:
    """Check XRP balance across Testnet, Devnet, and Lending Devnet."""
    settings = get_settings()
    if not address:
        svc = _wallet_service()
        address = svc.wallet().classic_address
    gateway = XrplGateway(settings.xrpl_ws_url)
    return await gateway.check_account_across_networks(address=address)


@nexus_mcp.tool()
def explain_hook(result_code: str, transaction_type: str = "Payment") -> str:
    """Translate an XRPL Hook rejection code into plain English."""
    return explain_hook_result(result_code, transaction_type)


# ── Entry point (stdio transport for Claude Desktop / MCP clients) ─────────────

if __name__ == "__main__":
    nexus_mcp.run(transport="stdio")
