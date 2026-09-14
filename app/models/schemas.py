import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.config import get_settings


class HistoryMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)

    @field_validator("content")
    @classmethod
    def content_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("History content cannot be blank")
        # History is supporting context, so trim it instead of rejecting the
        # visitor's next question when a previous model answer was long.
        return value[:2000]


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str
    session_id: str = Field(min_length=8, max_length=100)
    history: list[HistoryMessage] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def valid_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be blank")
        if len(value) > get_settings().max_message_chars:
            raise ValueError("Message is too long")
        return value

    @field_validator("session_id")
    @classmethod
    def valid_session(cls, value: str) -> str:
        if not re.fullmatch(r"[A-Za-z0-9_-]+", value):
            raise ValueError("Invalid session ID")
        return value

    @model_validator(mode="after")
    def valid_history(self):
        settings = get_settings()
        if len(self.history) > settings.max_history_messages:
            self.history = self.history[-settings.max_history_messages:]
        remaining = settings.max_history_chars
        trimmed: list[HistoryMessage] = []
        for item in reversed(self.history):
            if remaining <= 0:
                break
            content = item.content[:remaining]
            if content:
                trimmed.append(HistoryMessage(role=item.role, content=content))
                remaining -= len(content)
        self.history = list(reversed(trimmed))
        return self


class SourceLink(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceLink] = Field(default_factory=list)
    grounded: bool
    request_id: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    groq_configured: bool
    pinecone_configured: bool
    huggingface_configured: bool
    embedding_model_loaded: bool
