from functools import lru_cache
from typing import Annotated

from pydantic import BeforeValidator, Field, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _origins(value: object) -> list[str]:
    if isinstance(value, str):
        return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]
    return list(value or [])


Origins = Annotated[list[str], NoDecode, BeforeValidator(_origins)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Babar Ali Khan Portfolio Assistant"
    app_environment: str = "development"
    groq_api_key: str | None = Field(default=None, repr=False)
    groq_model: str = "qwen/qwen3.8-27b"
    pinecone_api_key: str | None = Field(default=None, repr=False)
    pinecone_index_name: str = "personal-portfolio-chatbot"
    pinecone_namespace: str = "portfolio-production"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"
    hf_token: str | None = Field(default=None, repr=False)
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    embedding_timeout_seconds: float = Field(default=20, ge=2, le=60)
    retrieval_top_k: int = Field(default=5, ge=1, le=20)
    retrieval_score_threshold: float = Field(default=0.30, ge=0, le=1)
    retrieval_context_tokens: int = Field(default=1400, ge=300, le=5000)
    allowed_origins: Origins = ["http://127.0.0.1:8000", "http://localhost:8000"]
    allowed_hosts: Origins = ["127.0.0.1", "localhost", "testserver"]
    expose_api_docs: bool = True
    preload_embedding_model: bool = False
    validate_pinecone_on_startup: bool = False
    max_message_chars: int = Field(default=1000, ge=100, le=5000)
    max_history_messages: int = Field(default=6, ge=0, le=20)
    max_history_chars: int = Field(default=4000, ge=0, le=20000)
    rate_limit_requests: int = Field(default=20, ge=1, le=500)
    rate_limit_window_seconds: int = Field(default=60, ge=1, le=3600)
    groq_timeout_seconds: float = Field(default=20, ge=2, le=60)

    @property
    def integrations_configured(self) -> bool:
        return bool(self.groq_api_key and self.pinecone_api_key and self.hf_token)

    @property
    def production(self) -> bool:
        return self.app_environment.lower() == "production"

    @model_validator(mode="after")
    def validate_production(self):
        if self.production:
            if not self.integrations_configured:
                raise ValueError("Production requires Groq, Pinecone, and Hugging Face credentials")
            if not self.allowed_origins or any("localhost" in origin or "127.0.0.1" in origin for origin in self.allowed_origins):
                raise ValueError("Production ALLOWED_ORIGINS must contain only public HTTPS origins")
            if any(not origin.startswith("https://") for origin in self.allowed_origins):
                raise ValueError("Production ALLOWED_ORIGINS must use HTTPS")
            if not self.allowed_hosts or "*" in self.allowed_hosts:
                raise ValueError("Production ALLOWED_HOSTS must be explicit")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
