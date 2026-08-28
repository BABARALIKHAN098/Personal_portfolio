from fastapi import APIRouter, Request

from app.models.schemas import HealthResponse


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    embeddings = request.app.state.embeddings
    ready = bool(settings.groq_api_key and settings.pinecone_api_key)
    return HealthResponse(
        status="ok" if ready else "degraded",
        groq_configured=bool(settings.groq_api_key),
        pinecone_configured=bool(settings.pinecone_api_key),
        embedding_model_loaded=embeddings.loaded,
    )
