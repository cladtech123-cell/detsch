from __future__ import annotations

import time
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai import get_ai_provider

router = APIRouter()


class ConnectionTestRequest(BaseModel):
    provider: str
    model: str | None = None


class ConnectionTestResponse(BaseModel):
    status: str
    response_time: float
    model_used: str
    error: str | None = None


@router.post("/ai/test-connection", response_model=ConnectionTestResponse, summary="Test AI provider connection and return latency")
async def test_ai_connection(payload: ConnectionTestRequest):
    provider_name = payload.provider.lower()
    
    # Instantiate provider without fallbacks for isolation test
    # We bypass Failover by extracting self.primary from the returned Failover provider
    from app.services.ai import get_ai_provider
    failover_provider = get_ai_provider(provider_name=provider_name, model_name=payload.model)
    target_provider = failover_provider.primary
    
    # Default model check
    model_used = getattr(target_provider, "configured_model", "default")
    
    start_time = time.perf_counter()
    try:
        # Send a quick greeting test prompt
        res = await target_provider.generate_content("Hallo!")
        elapsed = round(time.perf_counter() - start_time, 2)
        
        # Check if response returned an error signature
        if "Xatolik" in res or "Gemini API quota has been exceeded" in res or "error" in res.lower():
            return ConnectionTestResponse(
                status="failed",
                response_time=elapsed,
                model_used=model_used,
                error=res
            )
            
        return ConnectionTestResponse(
            status="connected",
            response_time=elapsed,
            model_used=model_used
        )
    except Exception as e:
        elapsed = round(time.perf_counter() - start_time, 2)
        return ConnectionTestResponse(
            status="failed",
            response_time=elapsed,
            model_used=model_used,
            error=str(e)
        )
