# Nexus Ledger — Intelligent Travel Companion

Built for HackJayhawk 2026.

Nexus Ledger is an AI-powered travel companion for business travelers. It combines an autonomous blockchain wallet, voice AI, and cross-chain payments so travelers can book trips, access emergency loans, verify their identity, and manage expenses — all from a single mobile app.

---

## What It Does

- Book travel (hotels, flights, trains) with real XRP payments on XRPL Devnet
- Access emergency loans via the XLS-66 lending protocol, enforced by on-chain Hooks
- Verify employment identity at check-in using XLS-40 DIDs and Verifiable Presentations — no personal data shared
- Mint Solana NFT receipts per destination (Token-2022, fully on-chain metadata)
- Talk to a voice assistant for hands-free trip management, powered by ElevenLabs ConvAI
- Track budget and spend in XRP
- Get real-time translations into the local language of any destination city

---

## Stack

**Mobile** — Expo + React Native (TypeScript), React Navigation, Three.js + Cobe 3D globe, Tailwind CSS, ElevenLabs ConvAI WebView

**Backend** — FastAPI (Python), xrpl-py, solana-py + solders, ElevenLabs STT/TTS, MyMemory translation, MCP server for AI agent integration

**Blockchain** — XRPL Devnet (Payment, LoanSet XLS-66, VaultWithdraw, XLS-40 DID) · Solana Devnet (Token-2022 dynamic NFTs)

**Web dashboard** — Next.js 15, React 19, Tailwind CSS, Framer Motion

**Auth server** — Express.js, MongoDB, JWT

---

## Setup

### Backend

```
uv sync
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

For voice assistant: expose the backend over HTTPS with localtunnel (`npx localtunnel --port 8000 --subdomain nexusledger`) and set `EXPO_PUBLIC_CONVAI_EMBED_URL` in `mobile/.env`.

### Mobile

```
cd mobile
npm install
npm start
```

Set `EXPO_PUBLIC_BACKEND_URL` in `mobile/.env` to your machine's LAN IP so physical devices can reach the backend.

---

## Environment Variables

Backend `.env` — `XRPL_PAYMENT_URL`, `XRPL_LENDING_URL`, `AGENT_SECRET`, `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID`, `SOLANA_RPC_URL`

Mobile `mobile/.env` — `EXPO_PUBLIC_BACKEND_URL`, `EXPO_PUBLIC_ELEVENLABS_AGENT_ID`, `EXPO_PUBLIC_CONVAI_EMBED_URL`

See `.env.example` for the full list.
