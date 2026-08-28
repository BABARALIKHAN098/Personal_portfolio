from app.services.rag import UNKNOWN, RagService
from app.services.retriever import RetrievedChunk


class EmptyRetriever:
    def retrieve(self, query):
        return []


class GoodRetriever:
    def retrieve(self, query):
        return [RetrievedChunk("Verified evidence", .9, "DeliveryGuard AI", "Overview", "https://github.com/example/repo")]


class FakeGenerator:
    def generate(self, question, evidence, history):
        return "A grounded answer."


def test_unknown_without_context_skips_generation():
    result = RagService(EmptyRetriever(), FakeGenerator()).answer("Unknown?", [])
    assert result.answer == UNKNOWN
    assert not result.grounded


def test_sources_come_from_retrieval_metadata():
    result = RagService(GoodRetriever(), FakeGenerator()).answer("Tell me", [])
    assert result.grounded
    assert result.sources == [{"title":"DeliveryGuard AI","url":"https://github.com/example/repo"}]
