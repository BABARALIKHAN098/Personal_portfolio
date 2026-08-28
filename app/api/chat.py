import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.concurrency import run_in_threadpool

from app.core.security import client_key
from app.models.schemas import ChatRequest, ChatResponse, SourceLink


logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    request_id = uuid4().hex[:16]
    request.app.state.rate_limiter.check(client_key(request, payload.session_id))
    settings = request.app.state.settings
    if not settings.integrations_configured:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="The portfolio assistant is not configured yet.")
    try:
        history = [item.model_dump() for item in payload.history]
        result = await run_in_threadpool(request.app.state.rag.answer, payload.message, history)
        return ChatResponse(
            answer=result.answer,
            sources=[SourceLink(**source) for source in result.sources],
            grounded=result.grounded,
            request_id=request_id,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Chat dependency failure request_id=%s type=%s", request_id, type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="I couldn't retrieve that information right now. Please try again or use the portfolio contact section.",
        ) from None
