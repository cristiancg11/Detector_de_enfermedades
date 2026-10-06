"""
AgroScan AI - Andean Crop Phytosanitary Diagnostic API.
Built with FastAPI, Pydantic, and Google Gemini 2.5 Flash Vision.
"""

import logging
from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import (
    CropType,
    DiagnosticListResponse,
    DiagnosticResponse,
    HealthCheckResponse,
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
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for diagnostic history persistence across API sessions
in_memory_history: List[DiagnosticResponse] = []


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
