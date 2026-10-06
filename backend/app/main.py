"""
AgroScan AI - Andean Crop Phytosanitary Diagnostic API.
Built with FastAPI, Pydantic, and Google Gemini 2.5 Flash Vision.
"""

import logging
import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import (
    AuthResponse,
    CropType,
    DiagnosticListResponse,
    DiagnosticResponse,
    FarmerRole,
    HealthCheckResponse,
    UserLoginRequest,
    UserProfile,
    UserRegisterRequest,
)
from app.services.gemini_service import gemini_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("agroscan.api")

# Initialize FastAPI Application
app = FastAPI(
    title="AgroScan AI API",
    description=(
        "Phytosanitary diagnostic REST API powered by Google Gemini 2.5 Flash vision with "
        "structured agronomic outputs. Designed for smallholder Andean farmers in Nariño, Colombia."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware for web frontend integration
cors_origins = settings.cors_origins_list
logger.info("Configuring CORS middleware with origins: %s", cors_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for diagnostic history persistence across API sessions
in_memory_history: List[DiagnosticResponse] = []

# In-memory user database with password hashes and token tracking
def _hash_password(pw: str) -> str:
    return hashlib.sha256(pw.strip().encode("utf-8")).hexdigest()

users_db: Dict[str, dict] = {}
token_db: Dict[str, str] = {}  # token -> email

# Seed default demo farmer accounts for quick evaluation
_demo_users = [
    {
        "id": "usr-carlos-guancha",
        "email": "carlos@agroscan.co",
        "password_hash": _hash_password("narino2026"),
        "full_name": "Don Carlos Guancha",
        "farm_name": "Finca Bella Vista",
        "municipality": "Túquerres",
        "role": FarmerRole.SMALLHOLDER,
        "avatar_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        "created_at": "2026-01-15T08:00:00Z",
    },
    {
        "id": "usr-elena-bastidas",
        "email": "elena@agrosavia.co",
        "password_hash": _hash_password("narino2026"),
        "full_name": "Dra. Elena Bastidas",
        "farm_name": "Centro Experimental Obonuco",
        "municipality": "Pasto",
        "role": FarmerRole.AGRONOMIST,
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "created_at": "2026-02-10T09:30:00Z",
    },
]

for _u in _demo_users:
    users_db[_u["email"].lower()] = _u


@app.post(
    "/api/v1/auth/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
    summary="Register New Farmer Account",
)
async def register(payload: UserRegisterRequest):
    """
    Registers a new farmer or agronomist account.
    """
    email_clean = payload.email.strip().lower()
    if email_clean in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters long.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    new_user_id = f"usr-{uuid.uuid4().hex[:10]}"
    avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={email_clean}"

    user_record = {
        "id": new_user_id,
        "email": email_clean,
        "password_hash": _hash_password(payload.password),
        "full_name": payload.full_name.strip(),
        "farm_name": payload.farm_name.strip(),
        "municipality": payload.municipality.strip(),
        "role": payload.role,
        "avatar_url": avatar,
        "created_at": now_iso,
    }

    users_db[email_clean] = user_record
    token = secrets.token_urlsafe(32)
    token_db[token] = email_clean

    profile = UserProfile(
        id=user_record["id"],
        email=user_record["email"],
        full_name=user_record["full_name"],
        farm_name=user_record["farm_name"],
        municipality=user_record["municipality"],
        role=user_record["role"],
        avatar_url=user_record["avatar_url"],
        created_at=user_record["created_at"],
    )

    logger.info("New user registered: %s (%s)", email_clean, payload.role.value)
    return AuthResponse(access_token=token, token_type="bearer", user=profile)


@app.post(
    "/api/v1/auth/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
    summary="Authenticate Farmer Account",
)
async def login(payload: UserLoginRequest):
    """
    Validates user credentials and issues an access token.
    """
    email_clean = payload.email.strip().lower()
    user_record = users_db.get(email_clean)

    if not user_record or user_record["password_hash"] != _hash_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
        )

    token = secrets.token_urlsafe(32)
    token_db[token] = email_clean

    profile = UserProfile(
        id=user_record["id"],
        email=user_record["email"],
        full_name=user_record["full_name"],
        farm_name=user_record["farm_name"],
        municipality=user_record["municipality"],
        role=user_record["role"],
        avatar_url=user_record["avatar_url"],
        created_at=user_record["created_at"],
    )

    logger.info("User authenticated: %s", email_clean)
    return AuthResponse(access_token=token, token_type="bearer", user=profile)


@app.get(
    "/api/v1/auth/me",
    response_model=UserProfile,
    tags=["Authentication"],
    summary="Get Current User Profile",
)
async def get_me(authorization: Optional[str] = Header(None)):
    """
    Returns the profile of the authenticated farmer.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required.",
        )

    token = authorization.replace("Bearer ", "").strip()
    email = token_db.get(token)
    if not email or email not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token.",
        )

    u = users_db[email]
    return UserProfile(
        id=u["id"],
        email=u["email"],
        full_name=u["full_name"],
        farm_name=u["farm_name"],
        municipality=u["municipality"],
        role=u["role"],
        avatar_url=u["avatar_url"],
        created_at=u["created_at"],
    )



@app.get("/", tags=["Root"])
async def root():
    """
    Root entrypoint providing service info and documentation links.
    """
    return {
        "service": "AgroScan AI Phytosanitary API",
        "version": "1.0.0",
        "target_region": "Nariño, Colombia (Andean Highlands)",
        "supported_crops": [c.value for c in CropType],
        "model": "gemini-2.5-flash",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Service health check endpoint reporting status and Gemini API key configuration.
    """
    return HealthCheckResponse(
        status="healthy",
        service="AgroScan AI",
        version="1.0.0",
        gemini_configured=gemini_service.is_configured,
        model="gemini-2.5-flash",
    )


@app.post(
    "/api/v1/diagnose",
    response_model=DiagnosticResponse,
    status_code=status.HTTP_200_OK,
    tags=["Diagnostics"],
    summary="Diagnose Andean Crop Image",
    description=(
        "Receives a multipart/form-data upload with plant image bytes and plot metadata. "
        "Processes the visual symptoms using Gemini 2.5 Flash vision and returns a structured "
        "diagnostic report with organic vs chemical treatment pathways."
    ),
)
async def diagnose_crop(
    image: UploadFile = File(..., description="High-resolution or worker-optimized plant photo"),
    crop_type: str = Form(..., description="Crop kind: Potato, Coffee, Corn, or Tomato"),
    plot_identifier: str = Form("Plot A - Main Terrace", description="Farm plot / lot identifier"),
):
    """
    Handles image analysis and phytosanitary diagnosis generation.
    """
    # Validate crop type input against supported Andean crop enums
    normalized_crop = None
    for member in CropType:
        if member.value.lower() == crop_type.strip().lower():
            normalized_crop = member
            break

    if not normalized_crop:
        valid_options = ", ".join([c.value for c in CropType])
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid crop_type '{crop_type}'. Supported Andean crops are: {valid_options}",
        )

    # Validate image MIME content type
    allowed_mime_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    content_type = image.content_type or "image/jpeg"
    if content_type.lower() not in allowed_mime_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media type '{content_type}'. Must be one of: {allowed_mime_types}",
        )

    try:
        # Read uploaded image bytes
        image_bytes = await image.read()
        if not image_bytes or len(image_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image payload received. Please provide a valid crop photo.",
            )

        # Enforce maximum payload limit (15MB uncompressed limit)
        if len(image_bytes) > 15 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image size exceeds maximum limit of 15MB. Optimize on client thread before upload.",
            )

        # Call Gemini 2.5 Flash vision service
        diagnostic_result = await gemini_service.diagnose_crop(
            image_bytes=image_bytes,
            mime_type=content_type,
            crop_type=normalized_crop,
            plot_identifier=plot_identifier.strip() or "General Plot",
        )

        # Prepend to in-memory history cache
        in_memory_history.insert(0, diagnostic_result)

        # Limit cache size to prevent memory leaks in long-running instances
        if len(in_memory_history) > 100:
            in_memory_history.pop()

        return diagnostic_result

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error processing diagnostic request: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"An unexpected diagnostic error occurred: {str(exc)}"},
        )


@app.get(
    "/api/v1/history",
    response_model=DiagnosticListResponse,
    tags=["Diagnostics"],
    summary="Retrieve Diagnostic History",
    description="Returns recent phytosanitary diagnostic sessions, optionally filtered by farm plot identifier.",
)
async def get_diagnostic_history(
    plot_identifier: Optional[str] = None,
    limit: int = 20,
):
    """
    Retrieves previous diagnoses stored during server uptime.
    """
    filtered = in_memory_history
    if plot_identifier and plot_identifier.strip():
        plot_clean = plot_identifier.strip().lower()
        filtered = [item for item in filtered if plot_clean in item.plot_identifier.lower()]

    paginated = filtered[:limit]
    return DiagnosticListResponse(
        total=len(filtered),
        items=paginated,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
