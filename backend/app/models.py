"""
Prophet Forecast Service - Pydantic Models

Defines request and response models for the Prophet forecast API.
"""

from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class HistoricalDataPoint(BaseModel):
    """Single historical data point."""
    month: str = Field(..., description="Month in YYYY-MM format")
    quantity: float = Field(..., ge=0, description="Quantity value")


class ProphetParameters(BaseModel):
    """Prophet algorithm parameters."""
    seasonality_mode: Literal['additive', 'multiplicative'] = Field(
        default='multiplicative',
        description="How seasonality combines with trend"
    )
    yearly_seasonality: bool = Field(
        default=True,
        description="Enable yearly seasonal component"
    )
    weekly_seasonality: bool = Field(
        default=False,
        description="Enable weekly seasonal component (for daily data)"
    )
    changepoint_prior_scale: float = Field(
        default=0.05,
        ge=0.001,
        le=0.5,
        description="Controls trend flexibility (higher = more flexible)"
    )
    seasonality_prior_scale: float = Field(
        default=10.0,
        ge=0.01,
        le=10.0,
        description="Controls seasonality flexibility"
    )
    interval_width: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Width of uncertainty interval"
    )
    growth: Literal['linear', 'logistic', 'flat'] = Field(
        default='linear',
        description="Trend growth model"
    )


class ForecastRequest(BaseModel):
    """Prophet forecast request."""
    product_id: str = Field(..., description="Product identifier")
    historical_data: List[HistoricalDataPoint] = Field(
        ...,
        min_length=2,
        description="Historical sales data"
    )
    forecast_periods: int = Field(
        default=12,
        ge=1,
        le=36,
        description="Number of periods to forecast"
    )
    parameters: Optional[ProphetParameters] = Field(
        default=None,
        description="Prophet algorithm parameters"
    )


class ConfidenceInterval(BaseModel):
    """Confidence interval for a forecast point."""
    lower: float = Field(..., description="Lower bound")
    upper: float = Field(..., description="Upper bound")


class ForecastMetrics(BaseModel):
    """Forecast accuracy metrics."""
    mape: Optional[float] = Field(None, description="Mean Absolute Percentage Error")
    rmse: Optional[float] = Field(None, description="Root Mean Square Error")
    mae: Optional[float] = Field(None, description="Mean Absolute Error")


class ForecastResponse(BaseModel):
    """Prophet forecast response."""
    product_id: str = Field(..., description="Product identifier")
    algorithm: str = Field(default='prophet', description="Algorithm used")
    forecast_values: List[float] = Field(..., description="Forecasted values")
    confidence_intervals: Optional[List[ConfidenceInterval]] = Field(
        None,
        description="Confidence intervals for each forecast"
    )
    metrics: Optional[ForecastMetrics] = Field(
        None,
        description="Forecast accuracy metrics"
    )
    generated_at: str = Field(
        default_factory=lambda: datetime.now().isoformat(),
        description="Timestamp when forecast was generated"
    )


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(default='healthy')
    service: str = Field(default='prophet-forecast')
    version: str = Field(default='1.0.0')
