from __future__ import annotations

HOOK_ERROR_MAP = {
    "tecHOOK_REJECTED": "A governance hook rejected the transaction because it violated policy rules on-chain.",
    "temMALFORMED": "The transaction payload is malformed and needs to be rebuilt before signing.",
    "temBAD_AMOUNT": "The amount field is invalid or out of range.",
    "tefPAST_SEQ": "The transaction sequence is stale. Refresh the account sequence and try again.",
    "tecNO_PERMISSION": "The account does not have the required permission for this on-chain action.",
    "tecNO_ENTRY": "The referenced ledger object does not exist on the current network.",
}


def explain_hook_result(result_code: str, transaction_type: str | None = None) -> str:
    base_message = HOOK_ERROR_MAP.get(result_code, f"The network returned {result_code}.")
    if transaction_type:
        return f"{transaction_type} was rejected: {base_message}"
    return base_message
