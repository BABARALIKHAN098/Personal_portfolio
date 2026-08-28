from fastapi import APIRouter, Request

from app.models.schemas import HealthResponse


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse, include_in_schema=False)
def health(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    embeddings = request.app.state.embeddings
    ready = settings.integrations_configured
    return HealthResponse(
        status="ok" if ready else "degraded",
        groq_configured=bool(settings.groq_api_key),
        pinecone_configured=bool(settings.pinecone_api_key),
        embedding_model_loaded=embeddings.loaded,
    )
