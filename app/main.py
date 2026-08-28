from contextlib import asynccontextmanager

from anyio import to_thread
from app.core.tls import use_system_trust_store

use_system_trust_store()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.core.config import get_settings
from app.core.middleware import SecurityHeadersMiddleware
from app.core.security import InMemoryRateLimiter
from app.services.embeddings import EmbeddingService
from app.services.generator import GroqGenerator
from app.services.pinecone_store import PineconeStore
from app.services.rag import RagService
from app.services.retriever import Retriever


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    embeddings = EmbeddingService(settings)
    store = PineconeStore(settings)
    if settings.preload_embedding_model:
        await to_thread.run_sync(embeddings.load)
    if settings.validate_pinecone_on_startup:
        await to_thread.run_sync(store.ensure_index, False)
    app.state.settings = settings
    app.state.embeddings = embeddings
    app.state.rate_limiter = InMemoryRateLimiter(settings.rate_limit_requests, settings.rate_limit_window_seconds)
    app.state.rag = RagService(Retriever(settings, embeddings, store), GroqGenerator(settings))
    yield


settings = get_settings()
docs_url = "/docs" if settings.expose_api_docs and not settings.production else None
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan, docs_url=docs_url, redoc_url=None, openapi_url="/openapi.json" if docs_url else None)
app.add_middleware(SecurityHeadersMiddleware, production=settings.production)
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(health_router)
app.include_router(chat_router)
