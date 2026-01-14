import React, { useState, useEffect, useRef } from 'react';
import { ProductSupplyAnalysisPanel } from './ProductSupplyAnalysisPanel';
import { getAllProductsSupplyAnalysis, getProductLifecycleAssessment } from '../../services/productSupplyService';
import { calculateMultipleForecastModels } from '../../services/demandForecastService';
import type { ProductSupplyAnalysis, DemandForecast, Product, ProductLifecycleAssessment } from '../../types/ontology';
import { productsData } from '../../utils/entityConfigService';
import { loadProductEntities, loadBOMEvents, loadInventoryEvents } from '../../services/ontologyDataService';
import { Filter, Download, Layers, MessageSquare } from 'lucide-react';
import { useDataMode } from '../../contexts/DataModeContext';

export const ProductSupplyOptimizationPage: React.FC<{ toggleCopilot?: () => void }> = ({ toggleCopilot }) => {
  const { mode } = useDataMode();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<ProductSupplyAnalysis[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<Map<string, DemandForecast>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 使用ref来跟踪当前mode，避免闭包问题
  const currentModeRef = useRef(mode);
  currentModeRef.current = mode;

  // 唯一的数据加载useEffect - 同时处理两种模式的所有数据
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      // 关键修复：模式切换时重置selectedProductId，避免跨模式ID不一致
      setSelectedProductId(null);
      const currentMode = currentModeRef.current;
      console.log(`[数据加载] 开始加载，当前模式: ${currentMode}`);

      try {
        let analysisData: ProductSupplyAnalysis[] = [];
        let forecastsMap = new Map<string, DemandForecast>();

        if (currentMode === 'api') {
          // ===== 大脑模式 =====
          console.log('[大脑模式] 开始加载智能计算数据...');
          const { calculateAllProductsSupplyAnalysis } = await import('../../services/productSupplyCalculator');
          const smartAnalyses = await calculateAllProductsSupplyAnalysis();

          // 转换分析数据
          analysisData = smartAnalyses.map(analysis => ({
            productId: analysis.productId,
            productName: `${analysis.productId} ${analysis.productName}`,
            currentStock: analysis.inventoryStatus.currentStock,
            safetyStock: Math.ceil(analysis.demandTrend.averageDailyDemand * 30),
            stockDays: analysis.inventoryStatus.stockDays,
            demandTrend: analysis.demandTrend.demandGrowthRate > 0 ? 'increasing' as const : 'decreasing' as const,
            supplyRisk: analysis.supplyRisk.riskLevel,
            recommendation: analysis.inventoryOptimization.reason,
            supplierCount: Math.min(10, Math.max(1, Math.ceil(analysis.demandTrend.last90DaysDemand / 2000))),
            averageDeliveryCycle: 30 + (analysis.demandTrend.demandGrowthRate > 50 ? 10 : 0),
            supplyStabilityScore: Math.round(100 - analysis.supplyRisk.riskScore),
            currentInventoryLevel: analysis.inventoryStatus.currentStock,
            stockoutRiskLevel: analysis.inventoryStatus.stockStatus === 'sufficient' ? 'low' as const :
              analysis.inventoryStatus.stockStatus === 'warning' ? 'medium' as const : 'high' as const,
            lastUpdated: new Date().toISOString(),
            leadTime: 30,
            reorderPoint: Math.ceil(analysis.demandTrend.averageDailyDemand * 30),
            economicOrderQuantity: Math.ceil(analysis.demandTrend.averageDailyDemand * 60),
          }));

          // 生成预测数据
          smartAnalyses.forEach(analysis => {
            const smartForecast = analysis.demandForecast;
            const models = [
              { method: 'moving_average' as const, name: '移动平均', predictions: smartForecast.predictions.movingAverage },
              { method: 'exponential_smoothing' as const, name: '指数平滑', predictions: smartForecast.predictions.exponentialSmoothing },
              { method: 'linear_regression' as const, name: '线性回归', predictions: smartForecast.predictions.linearRegression },
            ];

            models.forEach(model => {
              const avgPrediction = model.predictions.reduce((sum, val) => sum + val, 0) / model.predictions.length;
              forecastsMap.set(`${analysis.productId}-${model.method}`, {
                productId: analysis.productId,
                productName: analysis.productName,
                forecastPeriod: smartForecast.forecastPeriod,
                predictedDemand: Math.round(avgPrediction),
                confidenceLevel: smartForecast.confidence >= 80 ? 'high' : smartForecast.confidence >= 60 ? 'medium' : 'low',
                calculationMethod: model.method,
                forecastModel: model.name,
                historicalDataPoints: analysis.demandTrend.demandHistory.length,
                lastUpdated: new Date().toISOString(),
              });
            });
          });
          console.log('[大脑模式] 数据加载完成, 分析数据:', analysisData.length, '预测数据:', forecastsMap.size);
        } else {
          // ===== Mock模式 =====
          console.log('[Mock模式] 开始加载Mock数据...');
          analysisData = await getAllProductsSupplyAnalysis();
          console.log('[Mock模式] 分析数据已加载:', analysisData.length);
        }

        // 设置分析数据
        setAnalyses(analysisData);

        // 关键修复：模式切换时总是选择第一个产品，不使用旧的selectedProductId
        // 因为旧的ID可能在新模式中不存在
        let productIdToSelect: string | null = null;
        if (analysisData.length > 0) {
          productIdToSelect = analysisData[0].productId;
          setSelectedProductId(productIdToSelect);
          console.log(`[数据加载] 自动选择第一个产品: ${productIdToSelect}`);
        }

        // Mock模式：加载选中产品的预测数据
        if (currentMode !== 'api' && productIdToSelect) {
          console.log('[Mock模式] 加载产品预测:', productIdToSelect);
          const multipleForecasts = await calculateMultipleForecastModels(productIdToSelect, 30);
          multipleForecasts.forEach((forecast, index) => {
            forecastsMap.set(`${productIdToSelect}-${index}`, forecast);
          });
          console.log('[Mock模式] 预测数据加载完成, size:', forecastsMap.size);
        }

        // 设置预测数据
        setDemandForecasts(forecastsMap);
        console.log(`[数据加载] 完成，模式: ${currentMode}, 预测数据size: ${forecastsMap.size}`);
      } catch (error) {
        console.error('Failed to load product supply optimization data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [mode]); // 只依赖mode

  // 当用户切换产品时，加载对应的预测数据（仅Mock模式需要）
  useEffect(() => {
    if (!selectedProductId) return;

    // 只有Mock模式需要在产品切换时重新加载预测
    if (mode !== 'api') {
      const loadMockForecasts = async () => {
        console.log('[Mock模式-产品切换] 加载产品预测:', selectedProductId);
        const multipleForecasts = await calculateMultipleForecastModels(selectedProductId, 30);
        const forecasts = new Map<string, DemandForecast>();
        multipleForecasts.forEach((forecast, index) => {
          forecasts.set(`${selectedProductId}-${index}`, forecast);
        });
        setDemandForecasts(forecasts);
        console.log('[Mock模式-产品切换] 预测数据加载完成, size:', forecasts.size);
      };
      loadMockForecasts();
    }
    // 大脑模式不需要重新加载，因为所有产品的预测数据已经在第一个useEffect中加载了

    // 加载产品详细信息
    const loadProductDetails = async () => {
      try {
        const [productEntities, bomEvents, inventoryEvents] = await Promise.all([
          loadProductEntities(),
          loadBOMEvents(),
          loadInventoryEvents()
        ]);

        const productEntity = productEntities.find(p => p.product_id === selectedProductId);
        if (productEntity) {
          const productBOMs = bomEvents.filter(bom =>
            bom.parent_id === selectedProductId &&
            bom.parent_type === 'Product' &&
            bom.status === 'Active'
          );
          const materialCodes = productBOMs.map(bom => bom.child_code);

          const productInventories = inventoryEvents
            .filter(inv =>
              inv.item_id === selectedProductId &&
              inv.item_type === 'Product' &&
              inv.status === 'Active'
            )
            .sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month));

          const latestInventory = productInventories[0];
          const stockQuantity = latestInventory ? parseInt(latestInventory.quantity) : 0;

          const product: Product = {
            productId: productEntity.product_id,
            productName: productEntity.product_name,
            materialCodes,
            status: productEntity.status as any,
            stockQuantity: stockQuantity,
            stockUnit: productEntity.main_unit,
          };
          setSelectedProduct(product);
        } else {
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Failed to load product info:', error);
        setSelectedProduct(null);
      }
    };
    loadProductDetails();
  }, [selectedProductId, mode]);

  const selectedAnalysis = analyses.find(a => a.productId === selectedProductId);
  const selectedProductLifecycleAssessment = selectedProductId ? getProductLifecycleAssessment(selectedProductId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            产品供应优化
          </h1>
          <p className="text-slate-500 mt-1">NPI 选型、EOL 决策与供应链风险评估</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            筛选
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={16} />
            导出
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Data loading failed in strict mode.</p>
          </div>
        ) : (
          <ProductSupplyAnalysisPanel
            analysis={selectedAnalysis || null}
            loading={loading}
            allProducts={analyses}
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
            demandForecasts={demandForecasts}
            product={selectedProduct}
            productLifecycleAssessment={selectedProductLifecycleAssessment}
          />
        )}
      </div>

      {/* Floating Chat Bubble Button */}
      {toggleCopilot && (
        <button
          onClick={toggleCopilot}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
          aria-label="打开AI助手"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};
