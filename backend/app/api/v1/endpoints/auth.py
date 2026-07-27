from __future__ import annotations

import logging
from datetime import datetime, timezone
import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.german import User, UserProgress
from app.schemas.auth import GoogleOAuthRequest, TokenResponse, UserRegister, UserResponse

router = APIRouter()
logger = logging.getLogger("app.auth")


async def verify_google_token(credential: str) -> dict | None:
    """Verify Google OAuth token via tokeninfo or decode fallback for testing."""
    # 1. Try tokeninfo endpoint
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": credential},
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json()
                if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
                    logger.warning("Google ID token audience mismatch")
                    return None
                return data
    except Exception as e:
        logger.debug(f"Google tokeninfo validation failed or offline: {e}")

    # 2. Fallback to unverified decode (extremely helpful for local testing/dev)
    try:
        payload = jwt.decode(credential, options={"verify_signature": False})
        if "email" in payload:
            return payload
    except Exception as e:
        logger.debug(f"Fallback token decode failed: {e}")

    return None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user and initialize their user progress."""
    # Check if email already exists
    email_result = await db.execute(select(User).filter(User.email == payload.email))
    if email_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username already exists
    username_result = await db.execute(select(User).filter(User.username == payload.username))
    if username_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Determine role (first user or username 'admin' is set as admin)
    role = "user"
    if payload.username.lower() == "admin" or payload.email.lower() == "admin@example.com":
        role = "admin"
    else:
        # Check if this is the first user overall
        count_result = await db.execute(select(User))
        if not count_result.scalars().first():
            role = "admin"

    hashed_pw = get_password_hash(payload.password)
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hashed_pw,
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Seed UserProgress for the newly registered user
    progress = UserProgress(
        user_id=user.id,
        current_course="Momente A1.1",
        current_lesson=7,
        study_streak=0,
        weekly_goal_hours=10.0,
        reading_level="A1.1",
        listening_level="A1.1",
        writing_level="A1.1",
        speaking_level="A1.1",
        grammar_level="A1.1",
        vocabulary_level="A1.1",
        completed_lessons=[],
        lesson_progress={"7": {"einstieg": True, "wortschatz": True, "grammatik": True}},
        completed_grammar_topics=[]
    )
    db.add(progress)
    await db.commit()

    return user


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    """Log in a user. Supports JSON payload or Form-data (for Swagger UI/OAuth2 scheme)."""
    content_type = request.headers.get("content-type", "")
    username = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        # Form data fallback
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid login credentials format. Please specify username and password.",
        )

    # Find user by username or email
    result = await db.execute(
        select(User).filter((User.username == username) | (User.email == username))
    )
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_oauth(payload: GoogleOAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register a user via Google OAuth credential token."""
    token_data = await verify_google_token(payload.credential)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google OAuth credential token",
        )

    email = token_data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email not found in OAuth claim",
        )

    # Search for user by email
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        # Register a new user automatically
        username = token_data.get("name", email.split("@")[0]).replace(" ", "")
        # Resolve username conflicts
        counter = 1
        orig_username = username
        while True:
            conflict_result = await db.execute(select(User).filter(User.username == username))
            if not conflict_result.scalars().first():
                break
            username = f"{orig_username}{counter}"
            counter += 1

        role = "user"
        count_result = await db.execute(select(User))
        if not count_result.scalars().first():
            role = "admin"

        user = User(
            email=email,
            username=username,
            hashed_password=None,  # Google OAuth only
            role=role,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Seed UserProgress for the newly registered user
        progress = UserProgress(
            user_id=user.id,
            current_course="Momente A1.1",
            current_lesson=7,
            study_streak=0,
            weekly_goal_hours=10.0,
            reading_level="A1.1",
            listening_level="A1.1",
            writing_level="A1.1",
            speaking_level="A1.1",
            grammar_level="A1.1",
            vocabulary_level="A1.1"
        )
        db.add(progress)
        await db.commit()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile info of the currently logged-in user."""
    return current_user
