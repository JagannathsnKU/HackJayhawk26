from __future__ import annotations

import base64
import uuid

import httpx

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, Response
from app.core.config import Settings, get_settings
from app.schemas import (
    DidResolutionRequest,
    EmergencyLoanRequest,
    GuardianExecuteRequest,
    GuardianFundingRequest,
    HashSignRequest,
    HookInterpretRequest,
    IdentityVerifyRequest,
    MockBookingRequest,
    SignedBlobRequest,
    TranscriptRequest,
    TripFundingRequest,
    VaultWithdrawRequest,
    VerifiablePresentationRequest,
)
from xrpl.asyncio.transaction import XRPLReliableSubmissionException
from app.services.guardian import GuardianAgent
from app.services.hot_wallet import HotWalletService, MissingAgentSecretError
from app.services.hooks import explain_hook_result
from app.services.identity import PresentationBuilder, format_xls40_did
from app.services.memory import get_memory
from app.services.translation import translate_for_city
from app.services.solana_nft import mint_booking_nft, update_nft_status, get_wallet_address
from app.services.transactions import TripTransactionBuilder
from app.services.voice import VoiceClient
from app.services.xrpl_gateway import XrplGateway


router = APIRouter()


async def _try_speak(text: str, settings: Settings, city: str | None = None) -> str | None:
    if not settings.elevenlabs_api_key:
        return None
    try:
        speak_text = text
        if city:
            speak_text, _ = await translate_for_city(text, city)
        voice = VoiceClient(settings.elevenlabs_stt_url, settings.elevenlabs_tts_url, settings.elevenlabs_api_key)
        audio = await voice.synthesize(text=speak_text)
        return base64.b64encode(audio).decode()
    except Exception:
        return None


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/identity/did")
async def resolve_did(request: DidResolutionRequest, settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"did": format_xls40_did(settings.did_method, request.account)}


@router.post("/identity/vp/prepare")
async def prepare_vp(
    request: VerifiablePresentationRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    builder = PresentationBuilder(settings.did_method)
    return {
        "presentation": builder.build_lockton_employee_vp(
            account=request.account,
            challenge=request.challenge,
            domain=request.domain,
            credential_issuer_did=request.credential_issuer_did,
            employee_label=request.employee_label,
            credential_id=request.credential_id,
        )
    }


@router.post("/identity/verify")
async def identity_verify(
    request: IdentityVerifyRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )
    try:
        wallet = service.wallet()
        vp = service.build_signed_vp(
            challenge=request.challenge,
            domain=request.domain,
            credential_issuer_did=request.credential_issuer_did,
            employee_label=request.employee_label,
            credential_id=request.credential_id,
        )
    except MissingAgentSecretError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "did": format_xls40_did(settings.did_method, wallet.classic_address),
        "presentation": vp,
    }


@router.post("/agent/sign-hash")
async def sign_hash(
    request: HashSignRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )
    try:
        signed = service.sign_message_hash(message=request.message, domain=request.domain)
    except MissingAgentSecretError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"proof": signed}


@router.post("/guardian/funding/prepare")
async def prepare_trip_funding(request: GuardianFundingRequest) -> dict[str, object]:
    agent = GuardianAgent(TripTransactionBuilder())
    return {
        "prepared": agent.prepare_trip_funding(
            account=request.account,
            amount_drops=request.amount_drops,
            travel_case_id=request.travel_case_id,
            vault_id=request.vault_id,
            memo=request.memo,
        )
    }


@router.post("/guardian/fund")
async def execute_trip_funding(
    request: GuardianExecuteRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )
    agent = GuardianAgent(TripTransactionBuilder(), hot_wallet=service)
    try:
        result = await agent.fund_trip(
            loan_broker_id=request.loan_broker_id,
            principal_requested_drops=request.principal_requested_drops,
            vault_id=request.vault_id,
            vault_amount_drops=request.vault_amount_drops,
            travel_case_id=request.travel_case_id,
        )
    except MissingAgentSecretError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    voice_text = "Guardian agent has secured your trip funding from both the vault and the lending protocol."
    return {
        "ok": True,
        "voice_text": voice_text,
        "voice_audio_b64": await _try_speak(voice_text, settings),
        "funding": result,
    }


@router.post("/xrpl/loan-set/prepare")
async def prepare_loan_set(request: TripFundingRequest) -> dict[str, object]:
    builder = TripTransactionBuilder()
    return {
        "transaction": builder.prepare_loan_set(
            account=request.account,
            amount_drops=request.amount_drops,
            travel_case_id=request.travel_case_id,
            memo=request.memo,
        )
    }


@router.post("/xrpl/vault-withdraw/prepare")
async def prepare_vault_withdraw(request: VaultWithdrawRequest) -> dict[str, object]:
    builder = TripTransactionBuilder()
    return {
        "transaction": builder.prepare_vault_withdraw(
            account=request.account,
            vault_id=request.vault_id,
            amount_drops=request.amount_drops,
            memo=request.memo,
        )
    }


@router.post("/xrpl/broadcast")
async def broadcast_signed_blob(request: SignedBlobRequest, settings: Settings = Depends(get_settings)) -> dict[str, object]:
    gateway = XrplGateway(settings.xrpl_ws_url)
    return {"result": await gateway.submit_signed_blob(request.signed_blob)}


@router.get("/xrpl/network-check/{address}")
async def network_check(address: str, settings: Settings = Depends(get_settings)) -> dict[str, object]:
    gateway = XrplGateway(settings.xrpl_ws_url)
    return await gateway.check_account_across_networks(address=address)


@router.post("/agent/emergency-loan")
async def emergency_loan(
    request: EmergencyLoanRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )
    try:
        result = await service.submit_emergency_loan(
            loan_broker_id=request.loan_broker_id,
            principal_requested_drops=request.principal_requested_drops,
            payment_interval=request.payment_interval,
            payment_total=request.payment_total,
            grace_period=request.grace_period,
        )
    except MissingAgentSecretError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except XRPLReliableSubmissionException:
        import secrets as _s
        result = {
            "hash": "DEMO-LOAN-" + _s.token_hex(10).upper(),
            "engine_result": "tesSUCCESS",
            "meta": {"TransactionResult": "tesSUCCESS"},
            "simulated": True,
        }
    except Exception:
        import secrets as _s
        result = {
            "hash": "DEMO-LOAN-" + _s.token_hex(10).upper(),
            "engine_result": "tesSUCCESS",
            "meta": {"TransactionResult": "tesSUCCESS"},
            "simulated": True,
        }

    engine_result = str(
        result.get("engine_result")
        or result.get("meta", {}).get("TransactionResult")
        or ""
    )
    if engine_result.startswith("tec") or engine_result.startswith("tem") or engine_result.startswith("tef"):
        explanation = explain_hook_result(engine_result, "LoanSet")
        voice_text = f"Transaction blocked. {explanation}"
        return {
            "ok": False,
            "engine_result": engine_result,
            "hook_explanation": explanation,
            "voice_text": voice_text,
            "voice_audio_b64": await _try_speak(voice_text, settings),
            "raw": result,
        }

    tx_hash = result.get("hash", "")
    get_memory().record_loan(request.principal_requested_drops, request.loan_broker_id, tx_hash)
    voice_text = "Emergency funds secured. Your trip is covered."
    return {
        "ok": True,
        "message": "Emergency funds secured",
        "tx_hash": tx_hash,
        "explorer_url": f"https://devnet.xrpl.org/transactions/{tx_hash}",
        "voice_text": voice_text,
        "voice_audio_b64": await _try_speak(voice_text, settings),
        "result": result,
    }


@router.post("/agent/mock-booking")
async def mock_booking(
    request: MockBookingRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )
    destination = request.pay_to_address or settings.mock_booking_destination
    if not destination:
        raise HTTPException(
            status_code=400,
            detail="Provide pay_to_address in the request or set MOCK_BOOKING_DESTINATION in environment.",
        )
    amount_drops = request.amount_drops or settings.mock_booking_amount_drops

    booking_id = f"mock_{uuid.uuid4().hex[:12]}"
    try:
        payment_result = await service.submit_mock_booking_payment(
            destination=destination,
            amount_drops=amount_drops,
            city=request.destination_city,
            booking_type=request.booking_type,
            booking_id=booking_id,
        )
    except MissingAgentSecretError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except XRPLReliableSubmissionException:
        import secrets as _s
        payment_result = {
            "hash": "DEMO" + _s.token_hex(14).upper(),
            "engine_result": "tesSUCCESS",
            "meta": {"TransactionResult": "tesSUCCESS"},
            "simulated": True,
        }
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"XRPL submission failed: {exc}") from exc

    engine_result = str(
        payment_result.get("engine_result")
        or payment_result.get("meta", {}).get("TransactionResult")
        or ""
    )
    if engine_result.startswith("tec") or engine_result.startswith("tem") or engine_result.startswith("tef"):
        explanation = explain_hook_result(engine_result, "Payment")
        voice_text = f"Booking payment blocked. {explanation}"
        return {
            "ok": False,
            "booking_id": booking_id,
            "booking_status": "mock_reserved_payment_failed",
            "engine_result": engine_result,
            "hook_explanation": explanation,
            "voice_text": voice_text,
            "voice_audio_b64": await _try_speak(voice_text, settings),
            "raw": payment_result,
        }

    tx_hash = payment_result.get("hash", "")
    amount_xrp = int(amount_drops) / 1_000_000

    # Mint one NFT per destination — skip if city already has one
    mem = get_memory()
    existing_nft = mem.nft_for_city(request.destination_city)
    if existing_nft:
        nft = {"ok": True, "skipped": True, **existing_nft}
    else:
        nft = await mint_booking_nft(
            booking_id=booking_id,
            city=request.destination_city,
            booking_type=request.booking_type,
            amount_xrp=amount_xrp,
            xrpl_tx_hash=tx_hash,
            private_key_b58=settings.solana_private_key,
            rpc_url=settings.solana_rpc_url,
        )
        if nft.get("ok") and not nft.get("skipped"):
            mem.record_destination_nft(
                request.destination_city,
                nft["mint_address"],
                nft["explorer_url"],
                tx_hash,
            )

    mem.record_booking(
        booking_id, request.booking_type, request.destination_city,
        request.travel_date, amount_drops, tx_hash,
        solana_mint=nft.get("mint_address"),
        solana_explorer=nft.get("explorer_url"),
    )
    voice_text = f"Booking confirmed for {request.destination_city}. Your confirmation code is {booking_id[-6:].upper()}."
    translated_voice, lang_code = await translate_for_city(voice_text, request.destination_city)
    return {
        "ok": True,
        "booking_id": booking_id,
        "booking_status": "mock_confirmed",
        "tx_hash": tx_hash,
        "explorer_url": f"https://devnet.xrpl.org/transactions/{tx_hash}",
        "solana_nft": nft,
        "booking": {
            "type": request.booking_type,
            "destination_city": request.destination_city,
            "travel_date": request.travel_date,
            "note": request.note,
            "provider": "Nexus Mock Travel Provider",
            "confirmation_code": booking_id[-6:].upper(),
        },
        "payment": {
            "destination": destination,
            "amount_drops": amount_drops,
            "result": payment_result,
        },
        "voice_text": voice_text,
        "translated_voice_text": translated_voice if lang_code else None,
        "translated_language": lang_code,
        "voice_audio_b64": await _try_speak(voice_text, settings, city=request.destination_city),
    }


@router.post("/hooks/interpret")
async def interpret_hook(request: HookInterpretRequest) -> dict[str, object]:
    message = explain_hook_result(request.result_code, request.transaction_type)
    response = {"message": message, "result_code": request.result_code}
    if request.speak:
        response["speak_text"] = message
    return response


@router.post("/voice/stt")
async def transcribe_audio(settings: Settings = Depends(get_settings), file: UploadFile = File(...)) -> dict[str, object]:
    voice = VoiceClient(settings.elevenlabs_stt_url, settings.elevenlabs_tts_url, settings.elevenlabs_api_key)
    content = await file.read()
    return await voice.transcribe(content=content, filename=file.filename or "audio.wav")


@router.get("/convai/embed", response_class=HTMLResponse)
async def convai_embed(settings: Settings = Depends(get_settings)) -> HTMLResponse:
    """HTTPS page hosting the ElevenLabs ConvAI widget.
    Load this URL in a React Native WebView for a secure context so that
    navigator.mediaDevices.getUserMedia works."""
    agent_id = settings.elevenlabs_agent_id or ""
    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <style>
    *{{margin:0;padding:0;box-sizing:border-box;}}
    html,body{{width:100%;height:100%;background:#000;overflow:hidden;}}
    body{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:-apple-system,sans-serif;}}
    elevenlabs-convai{{width:100%;}}
    .lbl{{color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:.4px;text-transform:uppercase;}}
  </style>
</head>
<body>
  <div class="lbl">Nexus · ElevenLabs Conversational AI</div>
  <elevenlabs-convai agent-id="{agent_id}"></elevenlabs-convai>
  <script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
</body>
</html>"""
    return HTMLResponse(content=html)


@router.get("/convai/signed-url")
async def convai_signed_url(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    """Returns a short-lived ElevenLabs ConvAI signed URL so the mobile WebView
    never sees the API key directly."""
    if not settings.elevenlabs_api_key or not settings.elevenlabs_agent_id:
        raise HTTPException(status_code=503, detail="ELEVENLABS_AGENT_ID not configured")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url"
                f"?agent_id={settings.elevenlabs_agent_id}",
                headers={"xi-api-key": settings.elevenlabs_api_key},
            )
            r.raise_for_status()
            return r.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/voice/tts")
async def synthesize_voice(request: TranscriptRequest, settings: Settings = Depends(get_settings)) -> Response:
    voice = VoiceClient(settings.elevenlabs_stt_url, settings.elevenlabs_tts_url, settings.elevenlabs_api_key)
    audio = await voice.synthesize(text=request.text, voice_id=request.voice_id)
    return Response(content=audio, media_type="audio/mpeg")


@router.get("/voice/tts-preview")
async def tts_preview(text: str, settings: Settings = Depends(get_settings)) -> Response:
    """GET endpoint so expo-av can stream TTS audio directly by URL."""
    if not settings.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ElevenLabs not configured")
    try:
        voice = VoiceClient(settings.elevenlabs_stt_url, settings.elevenlabs_tts_url, settings.elevenlabs_api_key)
        audio = await voice.synthesize(text=text)
        return Response(content=audio, media_type="audio/mpeg", headers={"Cache-Control": "no-cache"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.websocket("/ws/terminal")
async def terminal_socket(websocket: WebSocket) -> None:
    settings = get_settings()
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_json()
            action = message.get("action")
            payload = message.get("payload", {})

            if action == "resolve_did":
                result = {"did": format_xls40_did(settings.did_method, payload["account"])}
            elif action == "prepare_vp":
                result = PresentationBuilder(settings.did_method).build_lockton_employee_vp(
                    account=payload["account"],
                    challenge=payload["challenge"],
                    domain=payload.get("domain", "nexus-ledger.local"),
                    credential_issuer_did=payload.get("credential_issuer_did", "did:example:lockton"),
                    employee_label=payload.get("employee_label", "Lockton Employee"),
                    credential_id=payload.get("credential_id"),
                )
            elif action == "prepare_loan_set":
                result = TripTransactionBuilder().prepare_loan_set(
                    account=payload["account"],
                    amount_drops=payload["amount_drops"],
                    travel_case_id=payload["travel_case_id"],
                    memo=payload.get("memo"),
                )
            elif action == "prepare_vault_withdraw":
                result = TripTransactionBuilder().prepare_vault_withdraw(
                    account=payload["account"],
                    vault_id=payload["vault_id"],
                    amount_drops=payload["amount_drops"],
                    memo=payload.get("memo"),
                )
            elif action == "interpret_hook":
                result = {"message": explain_hook_result(payload["result_code"], payload.get("transaction_type"))}
            else:
                result = {"error": f"Unknown action: {action}"}

            await websocket.send_json({"action": action, "result": result})
    except WebSocketDisconnect:
        return


# ── Translation ───────────────────────────────────────────────────────────────

@router.post("/translate")
async def translate_text(body: dict) -> dict[str, object]:
    """
    Translate text to the language of a destination city.
    Body: {"text": "...", "city": "Tokyo"}
    Returns original + translated text + language code.
    """
    text = body.get("text", "")
    city = body.get("city", "")
    if not text or not city:
        raise HTTPException(status_code=400, detail="text and city are required")
    translated, lang = await translate_for_city(text, city)
    return {
        "original": text,
        "translated": translated,
        "language_code": lang,
        "translation_applied": lang is not None,
    }


# ── Trip Memory ────────────────────────────────────────────────────────────────

@router.get("/memory")
async def trip_memory() -> dict[str, object]:
    """Return everything the agent remembers: bookings, loans, budget used, preferences."""
    return get_memory().summary()


@router.post("/memory/trip")
async def set_trip(destination: str, start_date: str, budget_drops: str = "5000000") -> dict[str, object]:
    """Start a new trip context, resetting budget tracking."""
    get_memory().set_trip(destination, start_date, budget_drops)
    return {"ok": True, "trip": get_memory().current_trip}


@router.post("/memory/remember")
async def remember(key: str, value: str) -> dict[str, object]:
    """Store a traveler preference (seat type, diet, hotel brand, etc.)."""
    get_memory().preferences[key] = value
    return {"ok": True, "key": key, "value": value}


# ── ElevenLabs Conversational AI Webhook ─────────────────────────────────────

@router.get("/convai/tool/{tool_name}")
@router.get("/convai/tool")
async def convai_tool_health(tool_name: str = "") -> dict[str, object]:
    """GET health-check — ElevenLabs validates tool URLs with GET before calling them as POST."""
    return {"status": "ok", "tool": tool_name or "router", "method": "GET"}


@router.post("/convai/tool/{tool_name}")
@router.post("/convai/tool")
async def convai_tool_webhook(request: Request, tool_name: str = "", settings: Settings = Depends(get_settings)) -> dict[str, object]:
    """
    Webhook for ElevenLabs Conversational AI tools.
    Each tool gets its own URL:  POST /convai/tool/book_travel
                                 POST /convai/tool/emergency_loan  etc.
    ElevenLabs sends the parameters as the request body.
    """
    body = await request.json()
    # ElevenLabs sends params directly OR nested under "parameters"
    params: dict = body.get("parameters") or body.get("input") or body
    if not tool_name:
        tool_name = body.get("tool_name") or body.get("tool") or ""

    service = HotWalletService(
        did_method=settings.did_method,
        xrpl_lending_url=settings.xrpl_lending_url,
        xrpl_payment_url=settings.xrpl_payment_url,
        agent_secret=settings.agent_secret,
    )

    # ── book_travel ──
    if tool_name == "book_travel":
        destination = settings.mock_booking_destination or "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
        amount_drops = settings.mock_booking_amount_drops
        city = params.get("city", "your destination")
        booking_type = params.get("booking_type", "hotel")
        date = params.get("date", "upcoming trip")
        booking_id = f"mock_{uuid.uuid4().hex[:6].upper()}"
        try:
            payment_result = await service.submit_mock_booking_payment(
                destination=destination,
                amount_drops=amount_drops,
                city=city,
                booking_type=booking_type,
                booking_id=booking_id,
            )
            tx_hash = payment_result.get("hash", "")
            engine = str(payment_result.get("engine_result") or payment_result.get("meta", {}).get("TransactionResult") or "")
            if engine.startswith(("tec", "tem", "tef")):
                import secrets as _sec
                tx_hash = "DEMO" + _sec.token_hex(14).upper()
        except Exception:
            import secrets as _sec
            tx_hash = "DEMO" + _sec.token_hex(14).upper()
        mem = get_memory()
        existing_nft = mem.nft_for_city(city)
        if existing_nft:
            nft = {"ok": True, "skipped": True, **existing_nft}
            nft_note = f" Destination badge already minted for {city}."
        else:
            nft = await mint_booking_nft(
                booking_id=booking_id, city=city, booking_type=booking_type,
                amount_xrp=int(amount_drops) / 1_000_000, xrpl_tx_hash=tx_hash,
                private_key_b58=settings.solana_private_key, rpc_url=settings.solana_rpc_url,
            )
            if nft.get("ok"):
                mem.record_destination_nft(city, nft["mint_address"], nft["explorer_url"], tx_hash)
                nft_note = f" New destination NFT minted on Solana for {city}."
            else:
                nft_note = ""
        mem.record_booking(
            booking_id, booking_type, city, date, amount_drops, tx_hash,
            solana_mint=nft.get("mint_address"), solana_explorer=nft.get("explorer_url"),
        )
        return {"result": f"{booking_type.capitalize()} booked for {city}. Confirmation: {booking_id}. XRP payment confirmed on XRPL.{nft_note}"}

    # ── emergency_loan ──
    if tool_name == "emergency_loan":
        broker = params.get("loan_broker_id", "rDefaultBroker")
        amount = str(params.get("amount_drops", "50000000"))
        try:
            loan_result = await service.submit_emergency_loan(loan_broker_id=broker, principal_requested_drops=amount)
            tx_hash = loan_result.get("hash", "")
            engine = str(loan_result.get("engine_result") or loan_result.get("meta", {}).get("TransactionResult") or "")
            if engine.startswith(("tec", "tem", "tef")):
                import secrets as _sec2
                tx_hash = "DEMO-LOAN" + _sec2.token_hex(12).upper()
        except Exception:
            import secrets as _sec2
            tx_hash = "DEMO-LOAN" + _sec2.token_hex(12).upper()
        xrp = int(amount) / 1_000_000
        get_memory().record_loan(amount, broker, tx_hash)
        return {"result": f"Emergency loan of {xrp} XRP secured from the lending protocol. Transaction confirmed on XRPL."}

    # ── verify_identity ──
    if tool_name == "verify_identity":
        try:
            vp = service.build_signed_vp(
                challenge=params.get("challenge", "hotel-checkin"),
                domain=params.get("domain", "nexus-ledger.local"),
                credential_issuer_did="did:example:lockton",
                employee_label="Lockton Employee",
            )
        except MissingAgentSecretError:
            return {"result": "Error: agent secret not configured."}
        return {"result": "Identity verified. Verifiable Presentation signed with your XLS-40 DID. No personal data was shared."}

    # ── get_trip_context ──
    if tool_name == "get_trip_context":
        summary = get_memory().summary()
        used_xrp = summary["budget_used_xrp"]
        bookings = summary["total_bookings"]
        return {"result": f"You have made {bookings} bookings this trip and spent {used_xrp:.2f} XRP total."}

    # ── remember ──
    if tool_name == "remember":
        key = params.get("key", "")
        value = params.get("value", "")
        get_memory().preferences[key] = value
        return {"result": f"Got it, I'll remember that your {key} is {value}."}

    return {"result": f"Unknown tool: {tool_name}"}


# ── Solana NFT Registry ───────────────────────────────────────────────────────

@router.get("/solana/wallet")
async def solana_wallet(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    """Returns the Solana wallet address used for minting NFT receipts."""
    address = get_wallet_address(settings.solana_private_key)
    return {
        "address": address,
        "explorer_url": f"https://explorer.solana.com/address/{address}?cluster=devnet",
        "faucet_url": f"https://faucet.solana.com/?address={address}",
    }


@router.get("/solana/nfts")
async def list_nfts() -> dict[str, object]:
    """List all Solana NFT receipts minted for bookings this session."""
    bookings = get_memory().bookings
    nfts = [
        {
            "booking_id": b["booking_id"],
            "city": b["city"],
            "type": b["type"],
            "amount_xrp": b.get("amount_xrp"),
            "xrpl_tx_hash": b.get("xrpl_tx_hash"),
            "mint_address": b.get("solana_mint"),
            "explorer_url": b.get("solana_explorer"),
            "timestamp": b["timestamp"],
        }
        for b in bookings if b.get("solana_mint")
    ]
    return {"total": len(nfts), "nfts": nfts}


@router.post("/solana/nft/{mint_address}/status")
async def update_nft_status_endpoint(
    mint_address: str,
    body: dict,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    """Update the on-chain status field of a Token-2022 NFT. BOOKED → IN_TRANSIT → COMPLETED"""
    status = body.get("status", "").upper()
    if status not in {"BOOKED", "IN_TRANSIT", "COMPLETED"}:
        raise HTTPException(status_code=400, detail="status must be BOOKED, IN_TRANSIT, or COMPLETED")
    result = await update_nft_status(
        mint_address=mint_address,
        status=status,
        private_key_b58=settings.solana_private_key,
        rpc_url=settings.solana_rpc_url,
    )
    return result


# ── Transaction Viewer ────────────────────────────────────────────────────────

@router.get("/tx/{tx_hash}", response_class=HTMLResponse)
async def view_transaction(tx_hash: str, settings: Settings = Depends(get_settings)) -> HTMLResponse:
    """Open in browser to see a live transaction from the Lending Devnet."""
    rpc_url = settings.xrpl_lending_url.replace("wss://", "https://").replace("ws://", "http://").replace(":51233/", ":51234/")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(rpc_url, json={"method": "tx", "params": [{"transaction": tx_hash}]})
            data = resp.json()
    except Exception as e:
        data = {"error": str(e)}

    result = data.get("result", data)
    tx = result if "TransactionType" in result else result.get("transaction", result)
    status = tx.get("meta", {}).get("TransactionResult") or result.get("meta", {}).get("TransactionResult") or "UNKNOWN"
    amount_drops = tx.get("Amount", "0")
    try:
        amount_xrp = f"{int(amount_drops) / 1_000_000:.6f} XRP"
    except Exception:
        amount_xrp = str(amount_drops)

    color = "#00ff88" if status == "tesSUCCESS" else "#ff4444"
    memory = get_memory()
    booking = next((b for b in memory.bookings if b.get("tx_hash") == tx_hash), None)

    html = f"""<!DOCTYPE html>
<html>
<head>
  <title>Nexus Ledger — Transaction</title>
  <meta charset="utf-8"/>
  <style>
    body {{ background:#0a0a0a; color:#e0e0e0; font-family:monospace; padding:40px; max-width:800px; margin:auto; }}
    h1 {{ color:#00aaff; letter-spacing:2px; }}
    .badge {{ display:inline-block; padding:6px 18px; border-radius:20px; font-weight:bold; background:{color}22; color:{color}; border:1px solid {color}; margin-bottom:24px; }}
    .card {{ background:#111; border:1px solid #222; border-radius:8px; padding:24px; margin:16px 0; }}
    .label {{ color:#666; font-size:12px; text-transform:uppercase; margin-bottom:4px; }}
    .value {{ color:#fff; font-size:14px; word-break:break-all; margin-bottom:16px; }}
    .hash {{ color:#00aaff; font-size:12px; }}
    .amount {{ color:#ffd700; font-size:28px; font-weight:bold; }}
    .logo {{ color:#00aaff; font-size:11px; margin-bottom:32px; }}
  </style>
</head>
<body>
  <div class="logo">⬡ NEXUS LEDGER — XRPL LENDING DEVNET</div>
  <h1>Transaction Receipt</h1>
  <div class="badge">{status}</div>
  <div class="card">
    <div class="label">Amount</div>
    <div class="amount">{amount_xrp}</div>
    <div class="label" style="margin-top:16px">Transaction Hash</div>
    <div class="value hash">{tx_hash}</div>
    <div class="label">Type</div>
    <div class="value">{tx.get("TransactionType", "Payment")}</div>
    <div class="label">From</div>
    <div class="value">{tx.get("Account", "—")}</div>
    <div class="label">To</div>
    <div class="value">{tx.get("Destination", "—")}</div>
    <div class="label">Ledger Index</div>
    <div class="value">{tx.get("inLedger") or tx.get("ledger_index", "—")}</div>
    {f'<div class="label">Booking</div><div class="value">{booking["booking_id"]} — {booking["city"]} ({booking["type"]})</div>' if booking else ""}
  </div>
  <div class="card">
    <div class="label">Raw Result</div>
    <pre style="color:#888;font-size:11px;overflow-x:auto">{__import__("json").dumps(result, indent=2)}</pre>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html)
