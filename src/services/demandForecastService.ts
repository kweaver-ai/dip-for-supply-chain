import type { DemandForecast, Order } from '../types/ontology';

import { loadProductEntities, loadMonthlySalesByProduct } from './ontologyDataService';

// Flag to enable/disable CSV data source


/**
 * Calculate demand forecast using CSV data from monthly_sales_by_product
 */
async function calculateMultipleForecastModelsFromCSV(
  productId: string,
  forecastPeriod: number = 30
): Promise<DemandForecast[]> {
  try {
    const [productEntities, monthlySales] = await Promise.all([
      loadProductEntities(),
      loadMonthlySalesByProduct()
    ]);

    const product = productEntities.find(p => p.product_id === productId);
    if (!product) return [];

    // Get historical sales data for this product
    const productSales = monthlySales.filter(sale => sale.product_id === productId);

    if (productSales.length === 0) {
      return [];
    }

    // Sort by month (descending to get latest first)
    const sortedSales = productSales.sort((a, b) => b.month.localeCompare(a.month));

    // Calculate quantities
    const quantities = sortedSales.map(sale => parseInt(sale.quantity));
    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);
    const avgQuantity = totalQuantity / quantities.length;

    // Determine confidence level based on data points
    const confidenceLevel: DemandForecast['confidenceLevel'] =
      quantities.length >= 12 ? 'high' :
        quantities.length >= 6 ? 'medium' : 'low';

    // Model 1: Moving Average (移动平均)
    // Simple average of historical data
    const movingAvgDemand = Math.round(avgQuantity);

    // Model 2: Exponential Smoothing (指数平滑)
    // Weight recent data more heavily
    let exponentialSmoothingDemand = quantities[0]; // Start with most recent
    const alpha = 0.3; // Smoothing factor
    for (let i = 1; i < Math.min(6, quantities.length); i++) {
      exponentialSmoothingDemand = alpha * quantities[i] + (1 - alpha) * exponentialSmoothingDemand;
    }
    exponentialSmoothingDemand = Math.round(exponentialSmoothingDemand);

    // Model 3: Linear Regression (线性回归)
    // Calculate trend from recent vs older data
    const recentCount = Math.min(6, quantities.length);
    const recentQuantities = quantities.slice(0, recentCount);
    const recentAvg = recentQuantities.reduce((sum, q) => sum + q, 0) / recentCount;

    let trend = 0;
    if (quantities.length > recentCount) {
      const olderQuantities = quantities.slice(recentCount);
      const olderAvg = olderQuantities.reduce((sum, q) => sum + q, 0) / olderQuantities.length;
      trend = recentAvg - olderAvg;
    }

    const linearRegressionDemand = Math.round(recentAvg + trend * 0.5);

    return [
      {
        productId: product.product_id,
        productName: product.product_name,
        forecastPeriod,
        predictedDemand: movingAvgDemand,
        confidenceLevel,
        calculationMethod: 'moving_average',
        forecastModel: '移动平均',
        historicalDataPoints: quantities.length,
        lastUpdated: new Date().toISOString(),
      },
      {
        productId: product.product_id,
        productName: product.product_name,
        forecastPeriod,
        predictedDemand: exponentialSmoothingDemand,
        confidenceLevel,
        calculationMethod: 'exponential_smoothing',
        forecastModel: '指数平滑',
        historicalDataPoints: quantities.length,
        lastUpdated: new Date().toISOString(),
      },
      {
        productId: product.product_id,
        productName: product.product_name,
        forecastPeriod,
        predictedDemand: linearRegressionDemand,
        confidenceLevel,
        calculationMethod: 'linear_regression',
        forecastModel: '线性回归',
        historicalDataPoints: quantities.length,
        lastUpdated: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error(`Failed to calculate forecast models from CSV for ${productId}:`, error);
    return [];
  }
}

/**
 * Calculate multiple forecast models for a product
 * Uses ontology CSV data
 */
export const calculateMultipleForecastModels = async (
  productId: string,
  forecastPeriod: number = 30
): Promise<DemandForecast[]> => {
  return await calculateMultipleForecastModelsFromCSV(productId, forecastPeriod);
};

/**
 * Calculate demand forecast for a product using moving average algorithm
 * @param productId Product ID
 * @param forecastPeriod Forecast period in days (30, 60, or 90)
 * @returns DemandForecast or null if product not found
 */
export const calculateDemandForecast = async (
  productId: string,
  forecastPeriod: number
): Promise<DemandForecast | null> => {
  if (![30, 60, 90].includes(forecastPeriod)) {
    throw new Error('Forecast period must be 30, 60, or 90 days');
  }

  const forecasts = await calculateMultipleForecastModels(productId, forecastPeriod);

  // Return the moving average model (first one)
  return forecasts.length > 0 ? forecasts[0] : null;
};

/**
 * Calculate demand forecasts for multiple products
 */
export const calculateMultipleProductsForecast = async (
  productIds: string[],
  forecastPeriod: number
): Promise<DemandForecast[]> => {
  const forecasts = await Promise.all(
    productIds.map(productId => calculateDemandForecast(productId, forecastPeriod))
  );
  return forecasts.filter((forecast): forecast is DemandForecast => forecast !== null);
};
