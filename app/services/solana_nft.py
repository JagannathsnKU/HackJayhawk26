"""
Solana Dynamic NFT Receipt Minter (Token-2022)
----------------------------------------------
Mints an NFT using the Token-2022 program with the on-chain MetadataPointer
+ TokenMetadata extensions. Metadata (name, symbol, uri, status, city) lives
entirely on the Solana ledger — no IPFS, no external service.

Status lifecycle stored on-chain:
  BOOKED → IN_TRANSIT → COMPLETED

No private key set? A fresh keypair is auto-generated and funded via devnet
airdrop — zero config for the demo.
"""
from __future__ import annotations

import logging
import struct
from typing import Any

from solders.hash import Hash
from solders.instruction import AccountMeta, Instruction
from solders.keypair import Keypair
from solders.message import Message
from solders.pubkey import Pubkey
from solders.system_program import CreateAccountParams, create_account
from solders.transaction import Transaction
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
from spl.token.constants import TOKEN_2022_PROGRAM_ID
from spl.token.instructions import (
    InitializeMintParams,
    MintToParams,
    initialize_mint2,
    mint_to,
)

logger = logging.getLogger(__name__)

SOLANA_DEVNET = "https://api.devnet.solana.com"
EXPLORER = "https://explorer.solana.com"
ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bJ")
SYSTEM_PROGRAM_ID = Pubkey.from_string("11111111111111111111111111111111")
SYSVAR_RENT_PUBKEY = Pubkey.from_string("SysvarRent111111111111111111111111111111111")

# SPL Token Metadata Interface discriminators
# sha256("spl-token-metadata-interface:initialize")[:8]
_INIT_DISCRIMINATOR = bytes([69, 214, 119, 68, 135, 103, 152, 186])
# sha256("spl-token-metadata-interface:update_field")[:8]
_UPDATE_DISCRIMINATOR = bytes([252, 37, 151, 249, 38, 226, 151, 21])

# Token-2022 extension type for MetadataPointer = 18
_METADATA_POINTER_EXT_TYPE = struct.pack("<H", 18)

# Token-2022 instruction indices
_IX_INITIALIZE_METADATA_POINTER = bytes([39, 0])  # MetadataPointerInstruction::Initialize
_IX_TOKEN_METADATA = bytes([42])                   # TokenMetadataInstruction wrapper

# Mint account layout sizes
_MINT_BASE_LEN = 82
_ACCOUNT_TYPE_LEN = 1        # Token-2022 account type discriminator
_METADATA_POINTER_LEN = 2 + 2 + 64  # type(2) + len(2) + authority(32) + metadata_address(32)
_MINT_ACCOUNT_LEN = _MINT_BASE_LEN + _ACCOUNT_TYPE_LEN + _METADATA_POINTER_LEN  # = 149

_wallet: Keypair | None = None


def _get_or_create_wallet(private_key_b58: str | None = None) -> Keypair:
    global _wallet
    if _wallet is not None:
        return _wallet
    if private_key_b58:
        try:
            import base58
            _wallet = Keypair.from_bytes(base58.b58decode(private_key_b58))
            return _wallet
        except Exception:
            pass
    _wallet = Keypair()
    return _wallet


async def _ensure_funded(client: AsyncClient, pubkey: Pubkey, min_lamports: int = 20_000_000) -> None:
    try:
        resp = await client.get_balance(pubkey, commitment=Confirmed)
        if resp.value < min_lamports:
            logger.info("Airdropping SOL to %s ...", pubkey)
            await client.request_airdrop(pubkey, 2_000_000_000, commitment=Confirmed)
    except Exception as exc:
        logger.warning("Airdrop skipped (rate-limited or offline): %s", exc)


def _borsh_str(s: str) -> bytes:
    b = s.encode("utf-8")
    return struct.pack("<I", len(b)) + b


def _borsh_option_pubkey(pk: Pubkey | None) -> bytes:
    if pk is None:
        return b"\x00"
    return b"\x01" + bytes(pk)


def _ix_initialize_metadata_pointer(mint: Pubkey, payer: Pubkey) -> Instruction:
    """Token-2022: initialize MetadataPointer extension pointing to the mint itself."""
    data = (
        _IX_INITIALIZE_METADATA_POINTER
        + _borsh_option_pubkey(payer)   # update authority
        + bytes(mint)                   # metadata address = the mint itself
    )
    return Instruction(
        accounts=[AccountMeta(mint, is_signer=False, is_writable=True)],
        data=data,
        program_id=TOKEN_2022_PROGRAM_ID,
    )


def _ix_initialize_metadata(
    mint: Pubkey,
    update_authority: Pubkey,
    name: str,
    symbol: str,
    uri: str,
) -> Instruction:
    """Token-2022: initialize on-chain metadata (name, symbol, uri)."""
    data = (
        _IX_TOKEN_METADATA
        + _INIT_DISCRIMINATOR
        + _borsh_option_pubkey(update_authority)
        + bytes(mint)
        + _borsh_str(name)
        + _borsh_str(symbol)
        + _borsh_str(uri)
    )
    return Instruction(
        accounts=[
            AccountMeta(mint, is_signer=False, is_writable=True),
            AccountMeta(update_authority, is_signer=True, is_writable=False),
            AccountMeta(mint, is_signer=False, is_writable=True),
            AccountMeta(update_authority, is_signer=True, is_writable=False),
            AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ],
        data=data,
        program_id=TOKEN_2022_PROGRAM_ID,
    )


def _ix_update_field(mint: Pubkey, update_authority: Pubkey, key: str, value: str) -> Instruction:
    """Token-2022: update a custom metadata field on-chain."""
    # Field enum: 0=Name, 1=Symbol, 2=Uri, 3=Key(String) — we use Key variant
    field_data = b"\x03" + _borsh_str(key)
    data = (
        _IX_TOKEN_METADATA
        + _UPDATE_DISCRIMINATOR
        + field_data
        + _borsh_str(value)
    )
    return Instruction(
        accounts=[
            AccountMeta(mint, is_signer=False, is_writable=True),
            AccountMeta(update_authority, is_signer=True, is_writable=False),
        ],
        data=data,
        program_id=TOKEN_2022_PROGRAM_ID,
    )


def _derive_ata(owner: Pubkey, mint: Pubkey) -> Pubkey:
    seeds = [bytes(owner), bytes(TOKEN_2022_PROGRAM_ID), bytes(mint)]
    ata, _ = Pubkey.find_program_address(
        [bytes(owner), bytes(TOKEN_2022_PROGRAM_ID), bytes(mint)],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    return ata


async def _send_tx(client: AsyncClient, instructions: list[Instruction], signers: list[Keypair]) -> str:
    recent = (await client.get_latest_blockhash(commitment=Confirmed)).value.blockhash
    msg = Message.new_with_blockhash(instructions, signers[0].pubkey(), recent)
    tx = Transaction.new_unsigned(msg)
    tx.sign(signers, recent)
    resp = await client.send_transaction(
        tx, opts=TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
    )
    await client.confirm_transaction(resp.value, commitment=Confirmed)
    return str(resp.value)


async def mint_booking_nft(
    *,
    booking_id: str,
    city: str,
    booking_type: str,
    amount_xrp: float,
    xrpl_tx_hash: str,
    private_key_b58: str | None = None,
    rpc_url: str = SOLANA_DEVNET,
) -> dict[str, Any]:
    """
    Mint a Token-2022 NFT with fully on-chain dynamic metadata.
    Initial status = BOOKED. Call update_nft_status() to evolve it.
    """
    payer = _get_or_create_wallet(private_key_b58)
    mint_kp = Keypair()
    mint_pk = mint_kp.pubkey()
    client = AsyncClient(rpc_url, commitment=Confirmed)

    try:
        await _ensure_funded(client, payer.pubkey())

        rent_resp = await client.get_minimum_balance_for_rent_exemption(_MINT_ACCOUNT_LEN)
        lamports = rent_resp.value

        # 1. Create mint account
        ix_create = create_account(CreateAccountParams(
            from_pubkey=payer.pubkey(),
            to_pubkey=mint_pk,
            lamports=lamports,
            space=_MINT_ACCOUNT_LEN,
            owner=TOKEN_2022_PROGRAM_ID,
        ))

        # 2. Initialize MetadataPointer extension (must come before InitializeMint2)
        ix_meta_ptr = _ix_initialize_metadata_pointer(mint_pk, payer.pubkey())

        # 3. Initialize mint (0 decimals = NFT)
        ix_init_mint = initialize_mint2(InitializeMintParams(
            decimals=0,
            program_id=TOKEN_2022_PROGRAM_ID,
            mint=mint_pk,
            mint_authority=payer.pubkey(),
            freeze_authority=payer.pubkey(),
        ))

        # 4. Initialize on-chain metadata
        nft_name = f"Nexus: {city.title()}"
        ix_init_meta = _ix_initialize_metadata(
            mint=mint_pk,
            update_authority=payer.pubkey(),
            name=nft_name,
            symbol="NXLD",
            uri="",
        )

        # 5. Set custom fields: status, city, booking_id, xrpl_tx_hash
        ix_field_status = _ix_update_field(mint_pk, payer.pubkey(), "status", "BOOKED")
        ix_field_city = _ix_update_field(mint_pk, payer.pubkey(), "city", city.title())
        ix_field_type = _ix_update_field(mint_pk, payer.pubkey(), "booking_type", booking_type)
        ix_field_id = _ix_update_field(mint_pk, payer.pubkey(), "booking_id", booking_id)
        ix_field_xrpl = _ix_update_field(mint_pk, payer.pubkey(), "xrpl_tx_hash", xrpl_tx_hash)
        ix_field_xrp = _ix_update_field(mint_pk, payer.pubkey(), "amount_xrp", str(round(amount_xrp, 6)))

        first_tx = await _send_tx(client, [
            ix_create, ix_meta_ptr, ix_init_mint, ix_init_meta,
            ix_field_status, ix_field_city, ix_field_type,
            ix_field_id, ix_field_xrpl, ix_field_xrp,
        ], [payer, mint_kp])

        # 6. Create ATA and mint exactly 1 token
        ata = _derive_ata(payer.pubkey(), mint_pk)
        ix_create_ata = Instruction(
            accounts=[
                AccountMeta(payer.pubkey(), is_signer=True, is_writable=True),
                AccountMeta(ata, is_signer=False, is_writable=True),
                AccountMeta(payer.pubkey(), is_signer=False, is_writable=False),
                AccountMeta(mint_pk, is_signer=False, is_writable=False),
                AccountMeta(SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
                AccountMeta(TOKEN_2022_PROGRAM_ID, is_signer=False, is_writable=False),
            ],
            data=b"",
            program_id=ASSOCIATED_TOKEN_PROGRAM_ID,
        )
        ix_mint_to = mint_to(MintToParams(
            program_id=TOKEN_2022_PROGRAM_ID,
            mint=mint_pk,
            dest=ata,
            mint_authority=payer.pubkey(),
            amount=1,
            signers=[],
        ))
        await _send_tx(client, [ix_create_ata, ix_mint_to], [payer])

        mint_address = str(mint_pk)
        explorer_url = f"{EXPLORER}/address/{mint_address}?cluster=devnet"
        logger.info("Minted Token-2022 dynamic NFT: %s", mint_address)

        return {
            "ok": True,
            "chain": "solana-devnet",
            "standard": "token-2022",
            "mint_address": mint_address,
            "owner": str(payer.pubkey()),
            "explorer_url": explorer_url,
            "first_tx_hash": first_tx,
            "on_chain_metadata": {
                "name": nft_name,
                "symbol": "NXLD",
                "status": "BOOKED",
                "city": city.title(),
                "booking_type": booking_type,
                "booking_id": booking_id,
                "xrpl_tx_hash": xrpl_tx_hash,
                "amount_xrp": amount_xrp,
            },
        }

    except Exception as exc:
        logger.error("Token-2022 NFT mint failed: %s", exc, exc_info=True)
        return {"ok": False, "error": str(exc)}
    finally:
        await client.close()


async def update_nft_status(
    mint_address: str,
    status: str,
    private_key_b58: str | None = None,
    rpc_url: str = SOLANA_DEVNET,
) -> dict[str, Any]:
    """
    Update the on-chain 'status' field of an existing Token-2022 NFT.
    Valid statuses: BOOKED → IN_TRANSIT → COMPLETED
    """
    payer = _get_or_create_wallet(private_key_b58)
    mint_pk = Pubkey.from_string(mint_address)
    client = AsyncClient(rpc_url, commitment=Confirmed)
    try:
        ix = _ix_update_field(mint_pk, payer.pubkey(), "status", status)
        tx_hash = await _send_tx(client, [ix], [payer])
        return {"ok": True, "mint_address": mint_address, "status": status, "tx_hash": tx_hash}
    except Exception as exc:
        logger.error("NFT status update failed: %s", exc)
        return {"ok": False, "error": str(exc)}
    finally:
        await client.close()


def get_wallet_address(private_key_b58: str | None = None) -> str:
    return str(_get_or_create_wallet(private_key_b58).pubkey())
