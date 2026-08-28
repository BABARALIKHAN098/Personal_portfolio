import time
from collections.abc import Iterable

from app.core.config import Settings
from app.services.chunking import Chunk


class PineconeStore:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._index = None

    def _connect(self):
        if not self.settings.pinecone_api_key:
            raise RuntimeError("Pinecone is not configured")
        if self._client is None:
            from pinecone import Pinecone
            self._client = Pinecone(api_key=self.settings.pinecone_api_key)
        return self._client

    def ensure_index(self, create: bool = False) -> None:
        client = self._connect()
        names = {item.name for item in client.list_indexes()}
        if self.settings.pinecone_index_name not in names:
            if not create:
                raise RuntimeError("Configured Pinecone index does not exist")
            from pinecone import ServerlessSpec
            client.create_index(
                name=self.settings.pinecone_index_name,
                dimension=self.settings.embedding_dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud=self.settings.pinecone_cloud, region=self.settings.pinecone_region),
            )
            deadline = time.monotonic() + 120
            while time.monotonic() < deadline:
                if client.describe_index(self.settings.pinecone_index_name).status.get("ready"):
                    break
                time.sleep(2)
            else:
                raise TimeoutError("Pinecone index did not become ready")
        description = client.describe_index(self.settings.pinecone_index_name)
        if description.dimension != self.settings.embedding_dimension or description.metric != "cosine":
            raise RuntimeError("Pinecone index must use 384 dimensions and cosine similarity")
        self._index = client.Index(self.settings.pinecone_index_name)

    @property
    def index(self):
        if self._index is None:
            self.ensure_index(create=False)
        return self._index

    def upsert(self, chunks: list[Chunk], vectors: list[list[float]], namespace: str | None = None) -> int:
        target = namespace or self.settings.pinecone_namespace
        records = [{"id": chunk.chunk_id, "values": vector, "metadata": chunk.metadata()} for chunk, vector in zip(chunks, vectors, strict=True)]
        count = 0
        for start in range(0, len(records), 100):
            batch = records[start:start + 100]
            self.index.upsert(vectors=batch, namespace=target)
            count += len(batch)
        return count

    def query(self, vector: list[float], top_k: int):
        return self.index.query(vector=vector, top_k=top_k, include_metadata=True, namespace=self.settings.pinecone_namespace)

    def delete_ids(self, ids: Iterable[str], namespace: str | None = None) -> None:
        values = list(ids)
        if values:
            self.index.delete(ids=values, namespace=namespace or self.settings.pinecone_namespace)
