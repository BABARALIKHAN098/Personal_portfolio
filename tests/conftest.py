import os

import pytest


@pytest.fixture(autouse=True)
def clean_environment(monkeypatch):
    # Explicit empty environment values override any developer .env file so
    # unit tests never contact paid or external services.
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("PINECONE_API_KEY", "")
    monkeypatch.setenv("HF_TOKEN", "")
    from app.core.config import get_settings
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
