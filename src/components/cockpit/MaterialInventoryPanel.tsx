/**
 * Material Inventory Panel
 * 
 * Displays material inventory summary including total count, stagnant materials,
 * top 10 materials by stock, and optimization recommendations.
 */

import { useMemo } from 'react';
import { Box, ArrowRight, Loader2 } from 'lucide-react';
import { getMaterialInventorySummary } from '../../utils/cockpitDataService';
import { materialsData, materialStocksData } from '../../utils/entityConfigService';
import { calculateMaterialLogicRules } from '../../utils/logicRuleService';
import { generateMaterialRecommendations } from '../../utils/recommendationService';
import { useMetricData, useDimensionMetricData, latestValueTransform } from '../../hooks/useMetricData';
import { useDataMode } from '../../contexts/DataModeContext';

// 指标模型 ID 配置 - 根据数据模式使用不同的指标
const METRIC_IDS = {
  // Mock 数据模式：对接原有整套 API
  mock: {
    /** 物料总种类数 - count(*) 统计 item_type=Material 的数量 */
    TOTAL_MATERIAL_TYPES: 'd516r9lg5lk40hvh48cg',
    /** 物料总库存量 - sum(quantity) 物料库存总量 */
    TOTAL_MATERIAL_STOCK: 'd516uvdg5lk40hvh48d0',
    /** 呆滞物料情况 - max_storage_age 库龄超过115天的物料 */
    STAGNANT_MATERIALS: 'd517hidg5lk40hvh48e0',
  },
  // 惠达供应链大脑模式：对接新的惠达数据 API
  api: {
    /** 物料库存总量 - 新的惠达数据API */
    TOTAL_MATERIAL_STOCK: 'd58je8lg5lk40hvh48n0',
    // 其他指标暂时使用相同的ID，后续可以更新
    TOTAL_MATERIAL_TYPES: 'd58ihclg5lk40hvh48mg',
    /** 呆滞物料情况 - 新的惠达数据API */
    STAGNANT_MATERIALS: 'd58jomlg5lk40hvh48o0',
  }
};

interface Props {
  onNavigate?: (view: string) => void;
}

const MaterialInventoryPanel = ({ onNavigate }: Props) => {
  // 获取当前数据模式
  const { mode } = useDataMode();

  const summary = useMemo(() => {
    // API模式下不加载CSV数据
    if (mode === 'api') {
      return {
        totalTypes: 0,
        totalStock: 0,
        top10ByStock: [],
        stagnantCount: 0,
        stagnantPercentage: 0,
        stagnantDetails: [],
      };
    }
    return getMaterialInventorySummary();
  }, [mode]);



  // 根据当前模式选择对应的指标 ID
  const currentMetricIds = METRIC_IDS[mode];

  // 从真实 API 获取物料总种类数（item_type=Material 的数量）
  const {
    value: totalMaterialTypesFromApi,
    loading: totalMaterialTypesLoading,
    error: totalMaterialTypesError,
  } = useMetricData(currentMetricIds.TOTAL_MATERIAL_TYPES, {
    instant: true,  // 即时查询，获取最新值
    transform: latestValueTransform,
  });

  // 调试：打印API调用结果
  if (import.meta.env.DEV) {
    console.log('[MaterialInventoryPanel] API调用结果:', {
      mode,
      totalMaterialTypes: totalMaterialTypesFromApi,
      loading: totalMaterialTypesLoading,
      error: totalMaterialTypesError,
      modelId: currentMetricIds.TOTAL_MATERIAL_TYPES,
    });
  }

  // 使用 API 数据，如果失败则回退到 mock 数据
  const totalMaterialTypes = totalMaterialTypesFromApi ?? summary.totalTypes;

  // 在惠达供应链大脑模式下，直接获取总库存量（API不支持维度分析）
  // 在Mock模式下，通过维度分析获取详细数据
  const {
    value: totalMaterialStockFromApi,
    loading: totalMaterialStockLoading,
    error: totalMaterialStockError,
  } = useMetricData(
    mode === 'api' ? currentMetricIds.TOTAL_MATERIAL_STOCK : '',  // 大脑模式：直接查询总量
    {
      instant: true,
      transform: latestValueTransform,
    }
  );

  // 从真实 API 获取物料库存排名
  // Mock模式：按 item_name 分组
  // 大脑模式：按 material_name 和 inventory_data 分组
  const {
    items: materialStockRankingItems,
    loading: materialStockRankingLoading,
    error: materialStockRankingError,
  } = useDimensionMetricData(
    currentMetricIds.TOTAL_MATERIAL_STOCK,
    mode === 'api' ? ['material_code', 'material_name', 'inventory_data'] : ['item_name'],  // 大脑模式请求三个字段：物料编码、物料名称、库存数据
    { instant: true }
  );

  // 计算总库存量
  const totalMaterialStock = useMemo(() => {
    if (mode === 'api') {
      // 大脑模式：直接使用API返回的总量
      return totalMaterialStockFromApi ?? summary.totalStock;
    } else {
      // Mock模式：通过维度数据求和（保留原有逻辑）
      if (materialStockRankingLoading) {
        return summary.totalStock;
      }
      if (materialStockRankingError || materialStockRankingItems.length === 0) {
        return summary.totalStock;
      }
      const total = materialStockRankingItems.reduce((sum, item) => sum + (item.value ?? 0), 0);
      console.log('[MaterialInventoryPanel] Mock模式 - 通过维度数据计算总库存:', {
        itemCount: materialStockRankingItems.length,
        totalStock: total,
      });
      return total;
    }
  }, [mode, totalMaterialStockFromApi, materialStockRankingItems, materialStockRankingLoading, materialStockRankingError, summary.totalStock]);

  // 取前10名
  const top10MaterialStockItems = materialStockRankingItems.slice(0, 10);


  // 从真实 API 获取呆滞物料详细情况（只在Mock模式下）
  const {
    items: stagnantMaterialItems,
    loading: stagnantMaterialLoading,
    error: stagnantMaterialError,
  } = useDimensionMetricData(
    mode === 'mock' ? currentMetricIds.STAGNANT_MATERIALS : '',  // 只在Mock模式下查询
    ['item_name', 'warehouse_name'],  // 按物料名称和仓库名称分组
    { instant: true }
  );

  // 过滤出库龄超过115天的物料，并按库龄降序排序
  const stagnantMaterials = useMemo(() => {
    if (mode === 'api') {
      // 大脑模式：没有详细数据，返回空数组
      return [];
    } else {
      // Mock模式：使用维度数据
      return stagnantMaterialItems
        .filter(item => (item.value ?? 0) > 115)  // 过滤库龄超过115天
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))  // 按库龄降序排序
        .slice(0, 10);  // 取前10个
    }
  }, [mode, stagnantMaterialItems]);

  // 计算呆滞物料统计
  const stagnantStats = useMemo(() => {
    if (mode === 'api') {
      // 大脑模式：直接返回0
      return { count: 0, percentage: 0 };
    } else {
      // Mock模式：使用计算的数量
      const count = stagnantMaterials.length;
      const percentage = totalMaterialTypes > 0 ? (count / totalMaterialTypes) * 100 : 0;
      return { count, percentage };
    }
  }, [mode, stagnantMaterials.length, totalMaterialTypes]);

  // Calculate recommendations for all materials
  const allRecommendations = useMemo(() => {
    const recommendations = new Set<string>();
    materialsData.forEach(material => {
      const stock = materialStocksData.find(ms => ms.materialCode === material.materialCode);
      const rules = calculateMaterialLogicRules(material, stock);
      const materialRecs = generateMaterialRecommendations(rules);
      materialRecs.forEach(rec => recommendations.add(rec));
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
        <h2 className="text-lg font-semibold text-slate-800">物料库存智能体</h2>
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
              <Box className="text-slate-600" size={20} />
              <span className="text-sm text-slate-600">总种类数</span>
            </div>
            {totalMaterialTypesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : totalMaterialTypesError ? (
              <div>
                <p className="text-2xl font-bold text-red-600">Error</p>
                <p className="text-xs text-red-500 mt-1">加载失败</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{totalMaterialTypes}</p>
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Box className="text-slate-600" size={20} />
              <span className="text-sm text-slate-600">总库存量</span>
            </div>
            {(mode === 'api' ? totalMaterialStockLoading : materialStockRankingLoading) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : (mode === 'api' ? totalMaterialStockError : materialStockRankingError) ? (
              <div>
                <p className="text-2xl font-bold text-red-600">Error</p>
                <p className="text-xs text-red-500 mt-1">
                  {(mode === 'api' ? totalMaterialStockError : materialStockRankingError)?.message || '加载失败'}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-slate-800">{totalMaterialStock?.toLocaleString() ?? 0}个</p>
            )}
          </div>
        </div>

        {/* Stagnant Materials - 使用真实 API 数据 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">呆滞物料情况</h3>
            <div className="flex items-center gap-2">
              {mode === 'api' ? (
                // 大脑模式：直接显示0，不显示loading
                <span className="text-sm text-red-600 font-medium">
                  0种 (0.0%)
                </span>
              ) : stagnantMaterialLoading ? (
                <Loader2 className="animate-spin text-slate-400" size={16} />
              ) : stagnantMaterialError ? (
                <span className="text-sm text-red-600 font-medium">
                  加载失败
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">
                  {stagnantStats.count}种 ({stagnantStats.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {mode === 'api' ? (
              // 大脑模式：直接显示提示，不调用API
              <div className="text-sm text-slate-400 p-2">
                暂无详细数据
              </div>
            ) : stagnantMaterialLoading ? (
              <div className="flex items-center gap-2 p-4">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : stagnantMaterialError ? (
              // 错误时显示错误信息
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
                加载失败: {stagnantMaterialError.message || '未知错误'}
              </div>
            ) : stagnantMaterials.length > 0 ? (
              // 使用真实 API 数据
              stagnantMaterials.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm text-slate-700">{item.labels.item_name || '未知物料'}</span>
                    <span className="text-xs text-slate-500 ml-2">库龄: {item.value ?? 0}天</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.labels.warehouse_name || '未知仓库'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-400 p-2">暂无呆滞物料</div>
            )}
          </div>
        </div>

        {/* Top 10 by Stock - 使用真实 API 数据 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">库存量排名前十</h3>
          <div className="space-y-2">
            {materialStockRankingLoading ? (
              <div className="flex items-center gap-2 p-4">
                <Loader2 className="animate-spin text-slate-400" size={20} />
                <span className="text-sm text-slate-400">加载中...</span>
              </div>
            ) : materialStockRankingError ? (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
                数据加载失败: {materialStockRankingError.message || '未知错误'}
              </div>
            ) : top10MaterialStockItems.length > 0 ? (
              // 使用真实 API 数据
              top10MaterialStockItems.map((item, index) => {
                // 尝试多个可能的字段名
                const materialCode = item.labels.material_code
                  || item.labels.item_code
                  || item.labels.code
                  || '';

                const materialName = item.labels.material_name
                  || item.labels.inventory_data
                  || item.labels.item_name
                  || '未知物料';

                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-mono">{materialCode}</div>
                      <div className="text-sm text-slate-700">{materialName}</div>
                    </div>
                    <span className="text-sm font-medium text-slate-800">{item.value ?? 0}个</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-400 p-2">暂无数据</div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default MaterialInventoryPanel;



