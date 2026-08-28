from app.core.config import Settings
from app.core.prompts import build_messages


class GroqGenerator:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None

    def _connect(self):
        if not self.settings.groq_api_key:
            raise RuntimeError("Groq is not configured")
        if self._client is None:
            from groq import Groq
            self._client = Groq(api_key=self.settings.groq_api_key, timeout=self.settings.groq_timeout_seconds, max_retries=1)
        return self._client

    def generate(self, question: str, evidence: str, history: list[dict[str, str]]) -> str:
        response = self._connect().chat.completions.create(
            model=self.settings.groq_model,
            messages=build_messages(question, evidence, history),
            temperature=0.1,
            max_tokens=500,
        )
        return response.choices[0].message.content or ""
