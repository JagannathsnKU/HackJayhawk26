from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Nexus Ledger"
    environment: str = "development"
    xrpl_ws_url: str = "wss://lend.devnet.rippletest.net:51233/"
    xrpl_lending_url: str = Field(default="wss://lend.devnet.rippletest.net:51233/", validation_alias="XRPL_LENDING_URL")
    xrpl_payment_url: str = Field(default="wss://s.devnet.rippletest.net:51233", validation_alias="XRPL_PAYMENT_URL")
    agent_secret: str | None = Field(default=None, validation_alias="AGENT_SECRET")
    mock_booking_destination: str | None = Field(default=None, validation_alias="MOCK_BOOKING_DESTINATION")
    mock_booking_amount_drops: str = Field(default="1000000", validation_alias="MOCK_BOOKING_AMOUNT_DROPS")
    elevenlabs_stt_url: str = Field(default="https://api.elevenlabs.io/v1/speech-to-text", validation_alias="ELEVENLABS_STT_URL")
    elevenlabs_tts_url: str = Field(default="https://api.elevenlabs.io/v1/text-to-speech", validation_alias="ELEVENLABS_TTS_URL")
    elevenlabs_api_key: str | None = Field(default=None, validation_alias="ELEVENLABS_API_KEY")
    elevenlabs_agent_id: str | None = Field(default=None, validation_alias="ELEVENLABS_AGENT_ID")
    did_method: str = "did:xls-40:ripple"
    solana_rpc_url: str = Field(default="https://api.devnet.solana.com", validation_alias="SOLANA_RPC_URL")
    solana_private_key: str | None = Field(default=None, validation_alias="SOLANA_PRIVATE_KEY")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
