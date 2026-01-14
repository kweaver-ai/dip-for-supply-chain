import type { OptimizationSuggestion } from '../types/ontology';
import { getProductSupplyAnalysis } from './productSupplyService';
import { calculateDemandForecast } from './demandForecastService';
import { productsData } from '../utils/entityConfigService';

/**
 * Get optimization suggestions for a product
 * Generates replenishment, clearance, and safety stock adjustment suggestions
 */
export const getOptimizationSuggestions = async (
  productId: string
): Promise<OptimizationSuggestion[]> => {
  const analysis = await getProductSupplyAnalysis(productId);
  const forecast = await calculateDemandForecast(productId, 30);

  if (!analysis || !forecast) return [];

  const suggestions: OptimizationSuggestion[] = [];
  const now = new Date().toISOString();

  // Configuration thresholds
  const safetyStock = 800; // Configurable safety stock level
  const maxStock = 2000; // Configurable maximum stock level

  // Replenishment suggestion
  if (analysis.currentInventoryLevel < safetyStock) {
    const suggestedQuantity = safetyStock + forecast.predictedDemand - analysis.currentInventoryLevel;
    suggestions.push({
      suggestionId: `SUG-${productId}-REPLENISH-${Date.now()}`,
      productId: analysis.productId,
      productName: analysis.productName,
      suggestionType: 'replenish',
      priority: analysis.stockoutRiskLevel === 'critical' || analysis.stockoutRiskLevel === 'high' ? 'high' : 'medium',
      reason: `当前库存${analysis.currentInventoryLevel}单位，低于安全库存${safetyStock}单位`,
      currentValue: analysis.currentInventoryLevel,
      suggestedValue: suggestedQuantity,
      unit: 'units',
      estimatedImpact: '降低缺货风险，提高供应稳定性',
      createdAt: now,
    });
  }

  // Clearance suggestion
  if (analysis.currentInventoryLevel > maxStock) {
    const clearanceQuantity = analysis.currentInventoryLevel - maxStock;
    suggestions.push({
      suggestionId: `SUG-${productId}-CLEARANCE-${Date.now()}`,
      productId: analysis.productId,
      productName: analysis.productName,
      suggestionType: 'clearance',
      priority: 'medium',
      reason: `当前库存${analysis.currentInventoryLevel}单位，超过最大库存${maxStock}单位`,
      currentValue: analysis.currentInventoryLevel,
      suggestedValue: clearanceQuantity,
      unit: 'units',
      estimatedImpact: '减少库存积压，释放资金',
      createdAt: now,
    });
  }

  // Safety stock adjustment suggestion
  if (analysis.stockoutRiskLevel === 'high' || analysis.stockoutRiskLevel === 'critical') {
    const recommendedSafetyStock = Math.max(safetyStock, forecast.predictedDemand * 1.5);
    if (recommendedSafetyStock > safetyStock) {
      suggestions.push({
        suggestionId: `SUG-${productId}-SAFETY-STOCK-${Date.now()}`,
        productId: analysis.productId,
        productName: analysis.productName,
        suggestionType: 'safety_stock_adjustment',
        priority: 'high',
        reason: `缺货风险等级为${analysis.stockoutRiskLevel}，建议调整安全库存`,
        currentValue: safetyStock,
        suggestedValue: recommendedSafetyStock,
        unit: 'units',
        estimatedImpact: '提高库存安全性，降低缺货风险',
        createdAt: now,
      });
    }
  }

  return suggestions;
};

/**
 * Get optimization suggestions for multiple products
 */
export const getAllProductsOptimizationSuggestions = async (): Promise<OptimizationSuggestion[]> => {
  const allProducts = productsData.map(p => p.productId);
  const suggestionsArrays = await Promise.all(
    allProducts.map(productId => getOptimizationSuggestions(productId))
  );
  return suggestionsArrays.flat();
};

/**
 * Handle optimization suggestion queries for AI assistant
 */
export const handleOptimizationSuggestionQuery = async (_query: string): Promise<string> => {
  const suggestions = await getAllProductsOptimizationSuggestions();

  if (suggestions.length === 0) {
    return '当前所有产品库存状态良好，暂无优化建议。';
  }

  // Group by priority
  const highPriority = suggestions.filter(s => s.priority === 'high');
  const mediumPriority = suggestions.filter(s => s.priority === 'medium');
  const lowPriority = suggestions.filter(s => s.priority === 'low');

  let response = `当前共有 ${suggestions.length} 条优化建议：\n\n`;

  if (highPriority.length > 0) {
    response += `🔴 高优先级建议 (${highPriority.length}条)：\n`;
    highPriority.slice(0, 3).forEach((s, idx) => {
      response += `${idx + 1}. ${s.productName} - ${s.suggestionType === 'replenish' ? '补货建议' : s.suggestionType === 'clearance' ? '清库存建议' : '安全库存调整'}\n   ${s.reason}\n`;
    });
    response += '\n';
  }

  if (mediumPriority.length > 0) {
    response += `🟡 中优先级建议 (${mediumPriority.length}条)：\n`;
    mediumPriority.slice(0, 2).forEach((s, idx) => {
      response += `${idx + 1}. ${s.productName} - ${s.suggestionType === 'replenish' ? '补货建议' : s.suggestionType === 'clearance' ? '清库存建议' : '安全库存调整'}\n   ${s.reason}\n`;
    });
    response += '\n';
  }

  if (lowPriority.length > 0 && highPriority.length === 0 && mediumPriority.length === 0) {
    response += `🔵 低优先级建议 (${lowPriority.length}条)：\n`;
    lowPriority.slice(0, 2).forEach((s, idx) => {
      response += `${idx + 1}. ${s.productName} - ${s.suggestionType === 'replenish' ? '补货建议' : s.suggestionType === 'clearance' ? '清库存建议' : '安全库存调整'}\n   ${s.reason}\n`;
    });
  }

  response += '\n建议优先处理高优先级建议，以降低缺货风险。';

  return response;
};
