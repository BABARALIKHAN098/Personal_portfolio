from threading import Lock

import numpy as np

from app.core.config import Settings


class EmbeddingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._model = None
        self._lock = Lock()

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def load(self):
        if self._model is None:
            with self._lock:
                if self._model is None:
                    from sentence_transformers import SentenceTransformer
                    model = SentenceTransformer(self.settings.embedding_model)
                    dimension = model.get_embedding_dimension()
                    if dimension != self.settings.embedding_dimension:
                        raise RuntimeError(f"Embedding dimension {dimension} does not match configured dimension {self.settings.embedding_dimension}")
                    self._model = model
        return self._model

    def encode(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        vectors = self.load().encode(texts, normalize_embeddings=True, show_progress_bar=False)
        values = np.asarray(vectors, dtype=np.float32)
        return values.tolist()
