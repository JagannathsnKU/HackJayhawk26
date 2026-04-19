"""
Free translation via MyMemory API — no API key required.
Used to translate agent responses into the traveler's destination language.
"""
from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

MYMEMORY_URL = "https://api.mymemory.translated.net/get"

# Destination city → BCP-47 language code
# English-speaking cities are left out (no translation needed)
CITY_LANGUAGE: dict[str, str] = {
    # Europe
    "paris": "fr",
    "lyon": "fr",
    "marseille": "fr",
    "berlin": "de",
    "munich": "de",
    "hamburg": "de",
    "madrid": "es",
    "barcelona": "es",
    "rome": "it",
    "milan": "it",
    "amsterdam": "nl",
    "lisbon": "pt",
    "vienna": "de",
    "zurich": "de",
    "brussels": "fr",
    "prague": "cs",
    "warsaw": "pl",
    "budapest": "hu",
    "stockholm": "sv",
    "oslo": "no",
    "copenhagen": "da",
    "helsinki": "fi",
    "athens": "el",
    "istanbul": "tr",
    "moscow": "ru",
    "kiev": "uk",
    # Asia
    "tokyo": "ja",
    "osaka": "ja",
    "kyoto": "ja",
    "beijing": "zh",
    "shanghai": "zh",
    "shenzhen": "zh",
    "hong kong": "zh",
    "seoul": "ko",
    "busan": "ko",
    "bangkok": "th",
    "singapore": "en",
    "kuala lumpur": "ms",
    "jakarta": "id",
    "mumbai": "hi",
    "delhi": "hi",
    "bangalore": "hi",
    "dubai": "ar",
    "abu dhabi": "ar",
    "riyadh": "ar",
    "tel aviv": "he",
    "karachi": "ur",
    # Latin America
    "mexico city": "es",
    "guadalajara": "es",
    "bogota": "es",
    "lima": "es",
    "santiago": "es",
    "buenos aires": "es",
    "sao paulo": "pt",
    "rio de janeiro": "pt",
    # Africa
    "cairo": "ar",
    "casablanca": "ar",
    "nairobi": "sw",
}


def city_to_language(city: str) -> str | None:
    """Return BCP-47 language code for a city, or None if English-speaking."""
    return CITY_LANGUAGE.get(city.lower().strip())


async def translate(text: str, target_lang: str, source_lang: str = "en") -> str:
    """
    Translate text using MyMemory free API.
    Returns original text if translation fails.
    """
    if target_lang == source_lang or target_lang == "en":
        return text
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(MYMEMORY_URL, params={
                "q": text,
                "langpair": f"{source_lang}|{target_lang}",
            })
            resp.raise_for_status()
            data = resp.json()
            translated = data.get("responseData", {}).get("translatedText", "")
            if translated and data.get("responseStatus") == 200:
                return translated
    except Exception as exc:
        logger.warning("Translation failed (%s→%s): %s", source_lang, target_lang, exc)
    return text


async def translate_for_city(text: str, city: str) -> tuple[str, str | None]:
    """
    Translate text to the language of the destination city.
    Returns (translated_text, lang_code). lang_code is None if no translation needed.
    """
    lang = city_to_language(city)
    if not lang:
        return text, None
    translated = await translate(text, lang)
    return translated, lang
