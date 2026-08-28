import re
from dataclasses import dataclass

from app.core.config import Settings
from app.services.embeddings import EmbeddingService
from app.services.pinecone_store import PineconeStore


ALIASES = {
    "who is babar": "Babar Ali Khan Professional Profile AI Engineer Peshawar Pakistan professional summary",
    "tell me about babar": "Babar Ali Khan Professional Profile AI Engineer Peshawar Pakistan professional summary",
    "education level": "Education Bachelor's degree Artificial Intelligence Iqra National University Peshawar 2024 2028 in progress",
    "what degree": "Education Bachelor's degree Artificial Intelligence Iqra National University Peshawar 2024 2028 in progress",
    "where is babar studying": "Education Iqra National University Peshawar Bachelor's degree Artificial Intelligence",
    "mindsight": "mindsignal mental health score predictor",
    "delivery prediction": "deliveryguard ai late delivery shipment risk",
    "resume screener": "ai-powered resume screening system",
    "fake news": "fake news detection system",
    "invoice portal": "vendor invoice intelligence portal",
    "potato disease": "potato leaf disease classifier",
}


@dataclass(frozen=True)
class RetrievedChunk:
    text: str
    score: float
    project_name: str
    section: str
    public_url: str


class Retriever:
    def __init__(self, settings: Settings, embeddings: EmbeddingService, store: PineconeStore):
        self.settings = settings
        self.embeddings = embeddings
        self.store = store

    def expand_query(self, query: str) -> str:
        lowered = query.lower()
        additions = [value for key, value in ALIASES.items() if key in lowered]
        return " ".join([query, *additions])

    def retrieve(self, query: str) -> list[RetrievedChunk]:
        vector = self.embeddings.encode([self.expand_query(query)])[0]
        response = self.store.query(vector, max(self.settings.retrieval_top_k * 2, self.settings.retrieval_top_k))
        matches = getattr(response, "matches", None) or response.get("matches", [])
        seen, results, word_budget = set(), [], self.settings.retrieval_context_tokens
        exact_terms = {word for word in re.findall(r"[a-z0-9]+", query.lower()) if len(word) > 3}
        sortable = []
        for match in matches:
            metadata = getattr(match, "metadata", None) or match.get("metadata", {})
            score = float(getattr(match, "score", None) or match.get("score", 0))
            text = str(metadata.get("text", "")).strip()
            if not text or score < self.settings.retrieval_score_threshold:
                continue
            haystack = f"{metadata.get('project_name', '')} {metadata.get('section', '')}".lower()
            boost = min(sum(term in haystack for term in exact_terms) * 0.015, 0.06)
            sortable.append((score + boost, score, metadata, text))
        for _, score, metadata, text in sorted(sortable, reverse=True, key=lambda item: item[0]):
            fingerprint = re.sub(r"\W+", " ", text.lower())[:240]
            if fingerprint in seen:
                continue
            words = len(text.split())
            if results and words > word_budget:
                continue
            seen.add(fingerprint)
            word_budget -= words
            results.append(RetrievedChunk(text, score, metadata.get("project_name", ""), metadata.get("section", ""), metadata.get("public_url", "")))
            if len(results) >= self.settings.retrieval_top_k or word_budget <= 0:
                break
        return results
