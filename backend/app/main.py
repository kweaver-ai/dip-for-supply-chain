"""
Prophet Forecast Service - FastAPI Application

Provides REST API endpoints for Prophet-based demand forecasting.
"""

import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    ForecastRequest,
    ForecastResponse,
    HealthResponse,
    ProphetParameters,
)
from .prophet_service import prophet_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Prophet Forecast Service starting...")
    yield
    logger.info("Prophet Forecast Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Prophet Forecast Service",
    description="Time series forecasting service using Meta's Prophet algorithm",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="prophet-forecast",
        version="1.0.0"
    )


@app.get("/api/forecast/health", response_model=HealthResponse)
async def api_health_check():
    """Alternative health check endpoint for API path."""
    return HealthResponse(
        status="healthy",
        service="prophet-forecast",
        version="1.0.0"
    )


@app.post("/api/v1/forecast/prophet", response_model=ForecastResponse)
async def prophet_forecast(request: ForecastRequest):
    """
    Generate demand forecast using Prophet algorithm.

    Prophet is a forecasting procedure developed by Meta that works well with
    time series that have strong seasonal effects and several seasons of
    historical data.
    """
    try:
        logger.info(f"Received forecast request for product: {request.product_id}")
        logger.info(f"Historical data points: {len(request.historical_data)}")
        logger.info(f"Forecast periods: {request.forecast_periods}")

        # Use default parameters if not provided
        params = request.parameters or ProphetParameters()

        # Generate forecast
        forecast_values, confidence_intervals, metrics = prophet_service.forecast(
            historical_data=request.historical_data,
            forecast_periods=request.forecast_periods,
            parameters=params
        )

        response = ForecastResponse(
            product_id=request.product_id,
            algorithm="prophet",
            forecast_values=forecast_values,
            confidence_intervals=confidence_intervals,
            metrics=metrics,
            generated_at=datetime.now().isoformat()
        )

        logger.info(f"Forecast generated successfully for product: {request.product_id}")
        return response

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Forecast error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Prophet Forecast Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "api_health": "/api/forecast/health",
            "prophet_forecast": "/api/v1/forecast/prophet"
        },
        "documentation": "/docs"
    }
