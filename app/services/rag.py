from dataclasses import dataclass

from app.core.security import safe_public_url, sanitize_answer
from app.services.generator import GroqGenerator
from app.services.retriever import Retriever


UNKNOWN = "I don't have verified information about that in Babar's portfolio yet."


@dataclass(frozen=True)
class RagAnswer:
    answer: str
    sources: list[dict[str, str]]
    grounded: bool


class RagService:
    def __init__(self, retriever: Retriever, generator: GroqGenerator):
        self.retriever = retriever
        self.generator = generator

    def answer(self, question: str, history: list[dict[str, str]]) -> RagAnswer:
        retrieval_query = question
        if len(question.split()) < 8 and history:
            retrieval_query = f"{history[-1]['content']} {question}"
        chunks = self.retriever.retrieve(retrieval_query)
        if not chunks:
            return RagAnswer(UNKNOWN, [], False)
        evidence = "\n\n---\n\n".join(chunk.text for chunk in chunks)
        answer = sanitize_answer(self.generator.generate(question, evidence, history)) or UNKNOWN
        sources, seen = [], set()
        for chunk in chunks:
            if not safe_public_url(chunk.public_url) or chunk.public_url in seen:
                continue
            seen.add(chunk.public_url)
            sources.append({"title": chunk.project_name or chunk.section or "Babar Ali Khan Portfolio", "url": chunk.public_url})
        return RagAnswer(answer, sources, answer != UNKNOWN)
