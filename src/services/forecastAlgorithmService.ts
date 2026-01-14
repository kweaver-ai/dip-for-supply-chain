/**
 * Forecast Algorithm Service
 * 
 * Frontend implementation of exponential smoothing algorithms for demand forecasting.
 * These algorithms can also be implemented on the backend via API calls.
 */

import type { ProductSalesHistory } from '../types/ontology';

/**
 * Simple Exponential Smoothing
 * 
 * Formula: F(t+1) = α * Y(t) + (1 - α) * F(t)
 * where α is the smoothing parameter (typically 0.1 to 0.3)
 * 
 * @param history Historical sales data
 * @param periods Number of periods to forecast
 * @returns Array of forecasted values
 */
export function simpleExponentialSmoothing(
  history: ProductSalesHistory[],
  periods: number = 13
): number[] {
  if (history.length === 0) {
    return new Array(periods).fill(0);
  }

  // Sort history by month
  const sortedHistory = [...history].sort((a, b) => a.month.localeCompare(b.month));
  const values = sortedHistory.map((h) => h.quantity);

  // Smoothing parameter (alpha) - can be optimized, default to 0.2
  const alpha = 0.2;

  // Initialize forecast array
  const forecasts: number[] = [];

  // Calculate initial forecast (use average of first few values)
  let lastForecast = values.length > 0 ? values[0] : 0;
  if (values.length > 1) {
    lastForecast = values.slice(0, Math.min(3, values.length)).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
  }

  // Apply exponential smoothing to historical data
  for (let i = 0; i < values.length; i++) {
    lastForecast = alpha * values[i] + (1 - alpha) * lastForecast;
  }

  // Generate forecasts for future periods
  for (let i = 0; i < periods; i++) {
    forecasts.push(lastForecast);
    // For future periods, forecast remains constant (simple exponential smoothing)
  }

  return forecasts;
}

/**
 * Holt Linear Exponential Smoothing
 * 
 * Handles data with trend but no seasonality.
 * Uses two smoothing parameters: α (level) and β (trend)
 * 
 * @param history Historical sales data
 * @param periods Number of periods to forecast
 * @returns Array of forecasted values
 */
export function holtLinearSmoothing(
  history: ProductSalesHistory[],
  periods: number = 13
): number[] {
  if (history.length === 0) {
    return new Array(periods).fill(0);
  }

  // Sort history by month
  const sortedHistory = [...history].sort((a, b) => a.month.localeCompare(b.month));
  const values = sortedHistory.map((h) => h.quantity);

  // Smoothing parameters
  const alpha = 0.3; // Level smoothing
  const beta = 0.1;  // Trend smoothing

  // Initialize level and trend
  let level = values.length > 0 ? values[0] : 0;
  let trend = values.length > 1 ? values[1] - values[0] : 0;

  // Apply Holt's method to historical data
  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    level = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  // Generate forecasts for future periods
  const forecasts: number[] = [];
  for (let i = 0; i < periods; i++) {
    forecasts.push(level + trend * (i + 1));
  }

  return forecasts;
}

/**
 * Holt-Winters Triple Exponential Smoothing
 * 
 * Handles data with both trend and seasonality.
 * Uses three smoothing parameters: α (level), β (trend), γ (seasonal)
 * 
 * @param history Historical sales data
 * @param periods Number of periods to forecast
 * @param seasonLength Length of seasonal cycle (default: 12 for monthly data)
 * @returns Array of forecasted values
 */
export function holtWintersSmoothing(
  history: ProductSalesHistory[],
  periods: number = 13,
  seasonLength: number = 12
): number[] {
  if (history.length === 0) {
    return new Array(periods).fill(0);
  }

  // Sort history by month
  const sortedHistory = [...history].sort((a, b) => a.month.localeCompare(b.month));
  const values = sortedHistory.map((h) => h.quantity);

  // Need at least 2 seasons of data for proper initialization
  if (values.length < seasonLength * 2) {
    // Fallback to Holt Linear if insufficient data
    return holtLinearSmoothing(history, periods);
  }

  // Smoothing parameters
  const alpha = 0.3; // Level smoothing
  const beta = 0.1;  // Trend smoothing
  const gamma = 0.2; // Seasonal smoothing

  // Initialize seasonal components
  const seasonal: number[] = [];
  for (let i = 0; i < seasonLength; i++) {
    // Use average of corresponding seasonal periods
    let sum = 0;
    let count = 0;
    for (let j = i; j < values.length; j += seasonLength) {
      sum += values[j];
      count++;
    }
    seasonal[i] = count > 0 ? sum / count : 1;
  }

  // Normalize seasonal components
  const avgSeasonal = seasonal.reduce((a, b) => a + b, 0) / seasonLength;
  for (let i = 0; i < seasonLength; i++) {
    seasonal[i] /= avgSeasonal;
  }

  // Initialize level and trend
  let level = values[0] / seasonal[0];
  let trend = 0;
  if (values.length >= seasonLength) {
    trend = (values[seasonLength] / seasonal[seasonLength % seasonLength] - level) / seasonLength;
  }

  // Apply Holt-Winters method to historical data
  for (let i = 1; i < values.length; i++) {
    const prevLevel = level;
    const seasonalIndex = i % seasonLength;
    level = alpha * (values[i] / seasonal[seasonalIndex]) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[seasonalIndex] = gamma * (values[i] / level) + (1 - gamma) * seasonal[seasonalIndex];
  }

  // Generate forecasts for future periods
  const forecasts: number[] = [];
  for (let i = 0; i < periods; i++) {
    const seasonalIndex = (values.length + i) % seasonLength;
    forecasts.push((level + trend * (i + 1)) * seasonal[seasonalIndex]);
  }

  return forecasts;
}

