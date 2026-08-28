from types import SimpleNamespace

from app.core.config import Settings
from app.services.retriever import Retriever


class FakeEmbeddings:
    def encode(self, texts):
        return [[0.1] * 384]


class FakeStore:
    def query(self, vector, top_k):
        return SimpleNamespace(matches=[SimpleNamespace(score=.9, metadata={"text":"DeliveryGuard uses FastAPI.","project_name":"DeliveryGuard AI","section":"Backend","public_url":"https://github.com/example/delivery"})])


def test_retriever_returns_grounded_metadata():
    service = Retriever(Settings(), FakeEmbeddings(), FakeStore())
    results = service.retrieve("Which project uses FastAPI?")
    assert results[0].project_name == "DeliveryGuard AI"
    assert results[0].score == .9


def test_alias_expansion():
    service = Retriever(Settings(), FakeEmbeddings(), FakeStore())
    assert "mindsignal" in service.expand_query("Tell me about Mindsight").lower()
