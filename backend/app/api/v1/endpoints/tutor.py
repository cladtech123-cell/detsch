from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_german_repo, get_german_service
from app.repositories.german import GermanRepository
from app.schemas.german import ChatMessageCreate, ChatMessageSchema
from app.services.german_service import GermanService

router = APIRouter()


@router.get("/tutor/messages", response_model=list[ChatMessageSchema], summary="Get chat messages")
async def get_chat_messages(repo: GermanRepository = Depends(get_german_repo)):
    messages = await repo.get_chat_messages(limit=50)
    return [ChatMessageSchema.from_orm(m) for m in messages]


@router.post("/tutor/chat", response_model=ChatMessageSchema, summary="Send message to AI Tutor")
async def post_chat_message(
    payload: ChatMessageCreate,
    service: GermanService = Depends(get_german_service)
):
    tutor_reply, provider_info = await service.process_chat(payload.content)
    return ChatMessageSchema(
        id=tutor_reply.id,
        role=tutor_reply.role,
        content=tutor_reply.content,
        timestamp=tutor_reply.timestamp,
        provider_info=provider_info
    )


@router.delete("/tutor/clear", summary="Clear chat history")
async def clear_chat_history(repo: GermanRepository = Depends(get_german_repo)):
    await repo.clear_chat_history()
    return {"status": "cleared"}
