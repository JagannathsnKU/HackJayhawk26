from __future__ import annotations

from typing import Any

import httpx


class VoiceClient:
    def __init__(self, stt_url: str, tts_url: str, api_key: str | None) -> None:
        self._stt_url = stt_url
        self._tts_url = tts_url
        self._api_key = api_key

    def _headers(self) -> dict[str, str]:
        headers: dict[str, str] = {}
        if self._api_key:
            headers["xi-api-key"] = self._api_key
        return headers

    async def transcribe(self, *, content: bytes, filename: str) -> dict[str, Any]:
        files = {"file": (filename, content)}
        data = {"model_id": "scribe_v1"}
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                self._stt_url, headers=self._headers(), files=files, data=data
            )
            response.raise_for_status()
            return response.json()

    async def synthesize(self, *, text: str, voice_id: str | None = None) -> bytes:
        # ElevenLabs requires voice_id in the URL path, not the body
        vid = voice_id or "JBFqnCBsd6RMkjVDRZzb"  # default: "George" voice
        url = self._tts_url.rstrip("/") + f"/{vid}"
        payload = {"text": text, "model_id": "eleven_flash_v2_5"}
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return response.content
