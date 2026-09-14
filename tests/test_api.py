from fastapi.testclient import TestClient

from app.main import app


def test_health_is_safe_without_credentials():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {
            "status": "degraded",
            "groq_configured": False,
            "pinecone_configured": False,
            "huggingface_configured": False,
            "embedding_model_loaded": False,
        }


def test_chat_requires_configuration():
    with TestClient(app) as client:
        response = client.post("/chat", json={"message": "Who is Babar?", "session_id": "session_123", "history": []})
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"]


def test_chat_rejects_blank_message():
    with TestClient(app) as client:
        response = client.post("/chat", json={"message": "  ", "session_id": "session_123", "history": []})
        assert response.status_code == 422


def test_missing_huggingface_token_blocks_chat(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test-groq")
    monkeypatch.setenv("PINECONE_API_KEY", "test-pinecone")
    with TestClient(app) as client:
        health = client.get("/api/health").json()
        assert health["status"] == "degraded"
        assert health["groq_configured"] is True
        assert health["pinecone_configured"] is True
        assert health["huggingface_configured"] is False

        def unexpected_answer(*args):
            raise AssertionError("Unconfigured chat must not call external services")

        monkeypatch.setattr(app.state.rag, "answer", unexpected_answer)
        response = client.post("/api/chat", json={"message": "Who is Babar?", "session_id": "session_123", "history": []})
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"]


def test_long_history_is_trimmed_instead_of_rejected():
    from app.models.schemas import ChatRequest
    request = ChatRequest(
        message="What is Babar's education level?",
        session_id="session_123",
        history=[{"role":"assistant","content":"x" * 5000} for _ in range(10)],
    )
    assert len(request.history) <= 6
    assert sum(len(item.content) for item in request.history) <= 4000
    assert all(len(item.content) <= 2000 for item in request.history)
