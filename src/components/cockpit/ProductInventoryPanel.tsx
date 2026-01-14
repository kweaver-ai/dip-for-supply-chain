/**
 * Product Inventory Panel
 * 
 * Displays product inventory summary including total count, stagnant products,
 * top 10 products by stock and order count, and optimization recommendations.
 * 
 * 对接真实指标模型 API：
 * - 库存产品总量：d51398lg5lk40hvh48a0
 */

import { useMemo } from 'react';
import { Package, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { getProductInventorySummary } from '../../utils/cockpitDataService';
import { productsData } from '../../utils/entityConfigService';
import { calculateProductLogicRules } from '../../utils/logicRuleService';
import { generateProductRecommendations } from '../../utils/recommendationService';
import { useMetricData, useDimensionMetricData, latestValueTransform } from '../../hooks/useMetricData';
import { useDataMode } from '../../contexts/DataModeContext';
import ProductInventoryAgent from '../agents/ProductInventoryAgent';

// 指标模型 ID 配置
const METRIC_IDS = {
  /** 库存产品总量 - sum(quantity) 产品库存总量 */
  TOTAL_PRODUCTS: 'd5167ptg5lk40hvh48b0',
  /** 产品库存数量明细 - sum(quantity) 按产品分组的库存量 */
  PRODUCT_STOCK_QUANTITY: 'd5167ptg5lk40hvh48b0',
  /** 产品库龄排名 - max_storage_age 按产品分组的最大库龄 */
  PRODUCT_STORAGE_AGE: 'd516ee5g5lk40hvh48bg',
};

interface Props {
  onNavigate?: (view: string) => void;
}

const ProductInventoryPanel = ({ onNavigate }: Props) => {
  // 获取当前数据模式
  const { mode } = useDataMode();

  // 在惠达供应链大脑模式下，使用智能计算组件
  if (mode === 'api') {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">产品库存智能体</h2>
          <button
            onClick={() => onNavigate?.('inventory')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            查看详情
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="p-6">
          <ProductInventoryAgent onNavigate={onNavigate} />
        </div>
      </div>
    );
  }

  // Mock模式：使用原有的API数据展示
  const summary = useMemo(() => getProductInventorySummary(), []);

  // 从真实 API 获取库存产品总量
  const {
    value: totalProductsFromApi,
    loading: totalProductsLoading,
    error: totalProductsError,
  } = useMetricData(METRIC_IDS.TOTAL_PRODUCTS, {
    instant: true,  // 即时查询，获取最新值
    transform: latestValueTransform,
  });

  // 调试：打印API调用结果
  if (import.meta.env.DEV) {
    console.log('[ProductInventoryPanel] API调用结果:', {
      totalProducts: totalProductsFromApi,
      loading: totalProductsLoading,
      error: totalProductsError,
      modelId: METRIC_IDS.TOTAL_PRODUCTS,
    });
  }

  // 使用 API 数据，如果失败则回退到 mock 数据
  const totalProducts = totalProductsFromApi ?? summary.totalProducts;

  // 从真实 API 获取产品库存排名（按 item_name 分组，显示 quantity 总和）
  const {
    items: stockRankingItems,
    loading: stockRankingLoading,
    error: stockRankingError,
  } = useDimensionMetricData(
    METRIC_IDS.PRODUCT_STOCK_QUANTITY,
    ['item_name'],  // 按产品名称分组
    { instant: true }
  );

  // 取前5名
  const top5StockItems = stockRankingItems.slice(0, 5);

  // 从真实 API 获取产品库龄排名（按 item_name 分组，显示 max_storage_age）
  const {
    items: storageAgeItems,
    loading: storageAgeLoading,
    error: storageAgeError,
  } = useDimensionMetricData(
    METRIC_IDS.PRODUCT_STORAGE_AGE,
    ['item_name'],  // 按产品名称分组
    { instant: true }
  );

  // 取库龄最大的前5名（按 value 降序排序，useDimensionMetricData 已经排序了）
  const top5StorageAgeItems = storageAgeItems.slice(0, 5);

  // Calculate recommendations for all products
  const allRecommendations = useMemo(() => {
    const recommendations = new Set<string>();
    productsData.forEach(product => {
      const rules = calculateProductLogicRules(product);
      const productRecs = generateProductRecommendations(rules);
      productRecs.forEach(rec => recommendations.add(rec));
    });
    return Array.from(recommendations);
  }, []);

  const handleViewDetails = () => {
    if (onNavigate) {
      onNavigate('inventory');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">产品库存智能体</h2>
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          查看详情
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-slate-600" size={20} />
              <span className="text-sm text-slate-600">库存产品总量</span>
            </div>
            {totalProductsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : totalProductsError ? (
              <div>
                <p className="text-2xl font-bold text-slate-800">{summary.totalProducts}</p>
                <p className="text-xs text-amber-500 mt-1">使用缓存数据</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            )}
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-green-600" size={20} />
              <span className="text-sm text-green-600">正常数量</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalProducts}</p>
          </div>
        </div>

        {/* Top 5 by Stock - 使用真实 API 数据 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">库存量排名前五</h3>
          <div className="space-y-2">
            {stockRankingLoading ? (
              <div className="flex items-center gap-2 p-4">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : stockRankingError ? (
              // 错误时回退到 mock 数据
              summary.top10ByStock.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{item.productName}</span>
                  <span className="text-sm font-medium text-slate-800">{item.stock} 套</span>
                </div>
              ))
            ) : top5StockItems.length > 0 ? (
              // 使用真实 API 数据
              top5StockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{item.labels.item_name || '未知产品'}</span>
                  <span className="text-sm font-medium text-slate-800">{item.value ?? 0} 个</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-400 p-2">暂无数据</div>
            )}
          </div>
        </div>


        {/* Recommendations */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">库存优化建议</h3>
          <div className="space-y-2">
            {allRecommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInventoryPanel;

