from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


@dataclass
class TripMemory:
    """Single in-process store for all agent context across conversations."""
    bookings: list[dict[str, Any]] = field(default_factory=list)
    loans: list[dict[str, Any]] = field(default_factory=list)
    preferences: dict[str, str] = field(default_factory=dict)
    budget_used_drops: int = 0
    current_trip: dict[str, Any] | None = None
    # city.lower() → NFT mint info — one NFT per destination
    destination_nfts: dict[str, dict[str, Any]] = field(default_factory=dict)

    def nft_for_city(self, city: str) -> dict[str, Any] | None:
        return self.destination_nfts.get(city.lower())

    def record_destination_nft(self, city: str, mint_address: str, explorer_url: str, first_tx_hash: str) -> None:
        self.destination_nfts[city.lower()] = {
            "city": city,
            "mint_address": mint_address,
            "explorer_url": explorer_url,
            "first_tx_hash": first_tx_hash,
            "minted_at": datetime.now(UTC).isoformat(),
        }

    def record_booking(self, booking_id: str, booking_type: str, city: str, date: str, amount_drops: str, tx_hash: str, solana_mint: str | None = None, solana_explorer: str | None = None) -> None:
        self.bookings.append({
            "booking_id": booking_id,
            "type": booking_type,
            "city": city,
            "date": date,
            "amount_drops": amount_drops,
            "amount_xrp": int(amount_drops) / 1_000_000,
            "xrpl_tx_hash": tx_hash,
            "solana_mint": solana_mint,
            "solana_explorer": solana_explorer,
            "timestamp": datetime.now(UTC).isoformat(),
        })
        self.budget_used_drops += int(amount_drops)

    def record_loan(self, amount_drops: str, loan_broker_id: str, tx_hash: str) -> None:
        self.loans.append({
            "amount_drops": amount_drops,
            "loan_broker_id": loan_broker_id,
            "tx_hash": tx_hash,
            "timestamp": datetime.now(UTC).isoformat(),
        })

    def set_trip(self, destination: str, start_date: str, budget_drops: str) -> None:
        self.current_trip = {
            "destination": destination,
            "start_date": start_date,
            "budget_drops": budget_drops,
            "started_at": datetime.now(UTC).isoformat(),
        }
        self.budget_used_drops = 0

    def summary(self) -> dict[str, Any]:
        return {
            "current_trip": self.current_trip,
            "total_bookings": len(self.bookings),
            "total_loans": len(self.loans),
            "budget_used_drops": self.budget_used_drops,
            "budget_used_xrp": self.budget_used_drops / 1_000_000,
            "recent_bookings": self.bookings[-3:],
            "preferences": self.preferences,
            "destination_nfts": list(self.destination_nfts.values()),
            "cities_visited": list(self.destination_nfts.keys()),
        }


_store = TripMemory()


def get_memory() -> TripMemory:
    return _store
