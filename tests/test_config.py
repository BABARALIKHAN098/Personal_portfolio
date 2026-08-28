import pytest

from app.core.config import Settings


def test_origins_parse_from_csv():
    settings = Settings(ALLOWED_ORIGINS="https://one.example, https://two.example/")
    assert settings.allowed_origins == ["https://one.example", "https://two.example"]


def test_secrets_are_not_in_repr():
    settings = Settings(GROQ_API_KEY="secret-one", PINECONE_API_KEY="secret-two")
    rendered = repr(settings)
    assert "secret-one" not in rendered
    assert "secret-two" not in rendered


def test_production_requires_https_public_origins():
    with pytest.raises(ValueError):
        Settings(APP_ENVIRONMENT="production", GROQ_API_KEY="x", PINECONE_API_KEY="y", ALLOWED_ORIGINS="http://localhost:8000", ALLOWED_HOSTS="example.com")


def test_valid_production_configuration():
    settings = Settings(APP_ENVIRONMENT="production", GROQ_API_KEY="x", PINECONE_API_KEY="y", ALLOWED_ORIGINS="https://portfolio.example", ALLOWED_HOSTS="api.example")
    assert settings.production
