from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_german_service
from app.schemas.german import DashboardData
from app.services.german_service import GermanService

router = APIRouter()


@router.get("/dashboard", response_model=DashboardData, summary="Get main dashboard data")
async def get_dashboard_data(service: GermanService = Depends(get_german_service)):
    data = await service.get_dashboard_data()
    return data
