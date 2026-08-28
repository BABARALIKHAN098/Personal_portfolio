from threading import Lock

import numpy as np

from app.core.config import Settings


class EmbeddingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._lock = Lock()

    @property
    def loaded(self) -> bool:
        return self._client is not None

    def load(self):
        if not self.settings.hf_token:
            raise RuntimeError("Hugging Face inference is not configured")
        if self._client is None:
            with self._lock:
                if self._client is None:
                    from huggingface_hub import InferenceClient
                    self._client = InferenceClient(
                        provider="hf-inference",
                        api_key=self.settings.hf_token,
                        timeout=self.settings.embedding_timeout_seconds,
                    )
        return self._client

    def encode(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        vectors = self.load().feature_extraction(
            texts,
            model=self.settings.embedding_model,
            normalize=True,
            truncate=True,
        )
        values = np.asarray(vectors, dtype=np.float32)
        if values.ndim == 1:
            values = values.reshape(1, -1)
        if values.ndim != 2 or values.shape[0] != len(texts) or values.shape[1] != self.settings.embedding_dimension:
            raise RuntimeError(
                f"Hosted embedding response shape {values.shape} does not match "
                f"({len(texts)}, {self.settings.embedding_dimension})"
            )
        return values.tolist()
