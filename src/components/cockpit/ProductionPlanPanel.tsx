/**
 * Production Plan Panel
 * 
 * Displays production efficiency analysis including:
 * 1. Production efficiency by production line and product
 * 2. Product mix analysis (distribution, priority ratio, series comparison)
 * 3. Production line optimization (order distribution, product type matching)
 */

import { useMemo, useState, useEffect } from 'react';
import { Factory, Loader2, Clock, Package, BarChart3 } from 'lucide-react';
import { useDimensionMetricData } from '../../hooks/useMetricData';
import { metricModelApi, createCurrentYearRange } from '../../api';
import type { Label } from '../../api';
import { useDataMode } from '../../contexts/DataModeContext';
import ProductionPlanAgent from '../agents/ProductionPlanAgent';

// 生产计划指标模型 ID
const PRODUCTION_PLAN_METRIC_ID = 'd51p56dg5lk40hvh48j0';

interface Props {
  onNavigate?: (view: string) => void;
}

const ProductionPlanPanel = ({ onNavigate: _onNavigate }: Props) => {
  // 获取当前数据模式
  const { mode } = useDataMode();

  // 大脑模式：使用智能计算
  if (mode === 'api') {
    return <ProductionPlanAgent />;
  }

  // Mock模式：使用现有API逻辑
  // 获取指标模型信息，以获取可用的分析维度
  const [availableDimensions, setAvailableDimensions] = useState<string[]>([]);
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const range = createCurrentYearRange();
        const result = await metricModelApi.queryByModelId(
          PRODUCTION_PLAN_METRIC_ID,
          {
            instant: true,
            start: range.start,
            end: range.end,
          },
          { includeModel: true }
        );

        if (result.model?.analysis_dimensions) {
          // 处理分析维度：可能是 Label[] 对象数组或 string[] 字符串数组
          const dimensions = result.model.analysis_dimensions.map((dim: Label | string) => {
            if (typeof dim === 'string') {
              return dim;
            } else {
              return dim.name;
            }
          });
          setAvailableDimensions(dimensions);

          if (import.meta.env.DEV) {
            console.log('[ProductionPlanPanel] 指标模型可用的分析维度:', dimensions);
          }
        } else {
          // 如果没有定义分析维度，使用常见的生产相关维度
          setAvailableDimensions(['production_line', 'output_name', 'priority', 'factory_name']);
        }
      } catch (err) {
        console.error('[ProductionPlanPanel] 获取指标模型信息失败:', err);
        // 失败时使用默认维度
        setAvailableDimensions(['production_line', 'output_name', 'priority', 'factory_name']);
      } finally {
        setModelLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  // 根据业务需求选择分析维度
  const dimensionsToUse = useMemo(() => {
    if (availableDimensions.length === 0) {
      return [];
    }

    // 优先选择生产相关的维度：生产线、产品名称、优先级
    const preferredDimensions = ['production_line', 'output_name', 'priority', 'factory_name'];
    const selectedDimensions = preferredDimensions.filter(dim =>
      availableDimensions.some(avail =>
        avail.toLowerCase().includes(dim.toLowerCase()) ||
        dim.toLowerCase().includes(avail.toLowerCase())
      )
    );

    // 如果找到了优先维度，使用它们；否则使用所有可用维度（最多前5个）
    return selectedDimensions.length > 0
      ? selectedDimensions.slice(0, 5)
      : availableDimensions.slice(0, 5);
  }, [availableDimensions]);

  // 1. 按生产线分析生产效率
  const {
    items: productionLineItems,
    loading: productionLineLoading,
    error: productionLineError,
  } = useDimensionMetricData(
    PRODUCTION_PLAN_METRIC_ID,
    dimensionsToUse.filter(d => d.includes('production_line') || d.includes('生产线')),
    { instant: true }
  );

  // 2. 按产品型号分析生产效率
  const {
    items: productItems,
    loading: productLoading,
    error: productError,
  } = useDimensionMetricData(
    PRODUCTION_PLAN_METRIC_ID,
    dimensionsToUse.filter(d => d.includes('output_name') || d.includes('product') || d.includes('产品')),
    { instant: true }
  );

  // 3. 按优先级分析产品组合
  const {
    items: priorityItems,
    loading: priorityLoading,
    error: priorityError,
  } = useDimensionMetricData(
    PRODUCTION_PLAN_METRIC_ID,
    dimensionsToUse.filter(d => d.includes('priority') || d.includes('优先级')),
    { instant: true }
  );

  // 处理生产线效率数据
  const productionLineAnalysis = useMemo(() => {
    if (!productionLineItems || productionLineItems.length === 0) {
      return [];
    }

    if (import.meta.env.DEV) {
      console.log('[ProductionPlanPanel] 生产线分析数据:', productionLineItems);
    }

    return productionLineItems.map((item) => {
      const labels = item.labels || {};
      const value = item.value ?? 0;

      const productionLine = labels.production_line || labels.productionLine || labels.line || '';
      const factoryName = labels.factory_name || labels.factoryName || '';

      // 从 labels 中提取生产周期相关字段（如果 API 返回）
      const plannedStartDate = labels.planned_start_date || labels.plannedStartDate;
      const plannedFinishDate = labels.planned_finish_date || labels.plannedFinishDate;

      // 计算生产周期（天数）
      let productionCycleDays: number | undefined;
      if (plannedStartDate && plannedFinishDate) {
        try {
          const start = new Date(plannedStartDate);
          const finish = new Date(plannedFinishDate);
          productionCycleDays = Math.ceil((finish.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        } catch (e) {
          // 日期解析失败，忽略
        }
      }

      return {
        productionLine: productionLine || `生产线 ${productionLineItems.indexOf(item) + 1}`,
        factoryName,
        productionQuantity: value,
        productionCycleDays,
        orderCount: 1, // 每个 item 代表一个订单或汇总
      };
    });
  }, [productionLineItems]);

  // 处理产品型号效率数据
  const productAnalysis = useMemo(() => {
    if (!productItems || productItems.length === 0) {
      return [];
    }

    if (import.meta.env.DEV) {
      console.log('[ProductionPlanPanel] 产品分析数据:', productItems);
    }

    return productItems.map((item) => {
      const labels = item.labels || {};
      const value = item.value ?? 0;

      const productName = labels.output_name || labels.product_name || labels.productName || labels.name || '';
      const productionLine = labels.production_line || labels.productionLine || '';

      // 计算生产周期
      const plannedStartDate = labels.planned_start_date || labels.plannedStartDate;
      const plannedFinishDate = labels.planned_finish_date || labels.plannedFinishDate;

      let avgProductionCycleDays: number | undefined;
      if (plannedStartDate && plannedFinishDate) {
        try {
          const start = new Date(plannedStartDate);
          const finish = new Date(plannedFinishDate);
          avgProductionCycleDays = Math.ceil((finish.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        } catch (e) {
          // 日期解析失败，忽略
        }
      }

      // 提取产品系列（从产品名称中提取，如 "旋风"、"巡风"、"极风"、"霸风"）
      const productSeries = productName.match(/^(旋风|巡风|极风|霸风)/)?.[1] || '其他';

      return {
        productName: productName || `产品 ${productItems.indexOf(item) + 1}`,
        productionLine,
        productionQuantity: value,
        avgProductionCycleDays,
        productSeries,
      };
    });
  }, [productItems]);

  // 处理优先级分析数据
  const priorityAnalysis = useMemo(() => {
    if (!priorityItems || priorityItems.length === 0) {
      return [];
    }

    if (import.meta.env.DEV) {
      console.log('[ProductionPlanPanel] 优先级分析数据:', priorityItems);
    }

    const totalQuantity = priorityItems.reduce((sum, item) => sum + (item.value ?? 0), 0);

    return priorityItems.map((item) => {
      const labels = item.labels || {};
      const value = item.value ?? 0;

      const priority = labels.priority || labels.priorityLevel || '未知';
      const percentage = totalQuantity > 0 ? (value / totalQuantity) * 100 : 0;

      return {
        priority,
        quantity: value,
        percentage: Math.round(percentage * 10) / 10,
      };
    });
  }, [priorityItems]);

  // 计算产品系列分布
  const productSeriesDistribution = useMemo(() => {
    const seriesMap = new Map<string, number>();
    productAnalysis.forEach(product => {
      const current = seriesMap.get(product.productSeries) || 0;
      seriesMap.set(product.productSeries, current + product.productionQuantity);
    });

    const total = Array.from(seriesMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(seriesMap.entries()).map(([series, quantity]) => ({
      series,
      quantity,
      percentage: total > 0 ? Math.round((quantity / total) * 100 * 10) / 10 : 0,
    })).sort((a, b) => b.quantity - a.quantity);
  }, [productAnalysis]);

  // 计算生产线订单分布
  const productionLineDistribution = useMemo(() => {
    const lineMap = new Map<string, { quantity: number; orderCount: number; products: Set<string> }>();

    productionLineAnalysis.forEach(item => {
      const existing = lineMap.get(item.productionLine) || { quantity: 0, orderCount: 0, products: new Set<string>() };
      existing.quantity += item.productionQuantity;
      existing.orderCount += item.orderCount;
      lineMap.set(item.productionLine, existing);
    });

    // 添加产品信息
    productAnalysis.forEach(product => {
      if (product.productionLine) {
        const existing = lineMap.get(product.productionLine);
        if (existing) {
          existing.products.add(product.productName);
        }
      }
    });

    const total = Array.from(lineMap.values()).reduce((sum, val) => sum + val.quantity, 0);

    return Array.from(lineMap.entries()).map(([line, data]) => ({
      productionLine: line,
      quantity: data.quantity,
      orderCount: data.orderCount,
      productCount: data.products.size,
      percentage: total > 0 ? Math.round((data.quantity / total) * 100 * 10) / 10 : 0,
      avgCycleDays: productionLineAnalysis
        .filter(item => item.productionLine === line && item.productionCycleDays)
        .reduce((sum, item, _, arr) => sum + (item.productionCycleDays || 0) / arr.length, 0),
    })).sort((a, b) => b.quantity - a.quantity);
  }, [productionLineAnalysis, productAnalysis]);

  const isLoading = modelLoading || productionLineLoading || productLoading || priorityLoading;
  const hasError = productionLineError || productError || priorityError;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">生产计划面板</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Loading/Error State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <span className="ml-2 text-slate-600">加载生产计划数据...</span>
          </div>
        )}
        {hasError && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              加载生产计划数据失败，部分数据可能无法显示
            </p>
          </div>
        )}

        {/* 1. 生产效率分析 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="text-indigo-500" size={18} />
            生产效率分析
          </h3>

          {/* 按生产线分析 */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-600 mb-2">各生产线生产效率</h4>
            <div className="space-y-3">
              {productionLineDistribution.map((line, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Factory className="text-slate-600" size={14} />
                      <span className="text-sm font-medium text-slate-800">{line.productionLine}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>产量: {line.quantity.toLocaleString()}</span>
                      <span>订单数: {line.orderCount}</span>
                      <span>产品种类: {line.productCount}</span>
                      {line.avgCycleDays > 0 && (
                        <span className="font-semibold text-indigo-600">
                          平均周期: {line.avgCycleDays.toFixed(1)}天
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-4 bg-slate-200 rounded overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-indigo-500"
                      style={{ width: `${line.percentage}%` }}
                    />
                    <span className="absolute right-2 top-0.5 text-xs text-slate-600">
                      {line.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按产品型号分析 */}
          <div>
            <h4 className="text-xs font-medium text-slate-600 mb-2">各产品型号平均生产周期</h4>
            <div className="space-y-2">
              {productAnalysis.slice(0, 10).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm text-slate-800">{product.productName}</span>
                    {product.productionLine && (
                      <span className="text-xs text-slate-500 ml-2">({product.productionLine})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>产量: {product.productionQuantity.toLocaleString()}</span>
                    {product.avgProductionCycleDays !== undefined && (
                      <span className="font-semibold text-indigo-600">
                        {product.avgProductionCycleDays}天
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 产品组合分析 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Package className="text-indigo-500" size={18} />
            产品组合分析
          </h3>

          {/* 产品系列分布 */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-600 mb-2">产品系列产量分布</h4>
            <div className="space-y-2">
              {productSeriesDistribution.map((series, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-800">{series.series}系列</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">{series.quantity.toLocaleString()}</span>
                    <div className="w-24 h-2 bg-slate-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${series.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 w-12 text-right">
                      {series.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 优先级分布 */}
          <div>
            <h4 className="text-xs font-medium text-slate-600 mb-2">订单优先级分布</h4>
            <div className="space-y-2">
              {priorityAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className={`text-sm font-medium ${item.priority === '高' ? 'text-red-600' :
                      item.priority === '中' ? 'text-yellow-600' :
                        'text-slate-600'
                    }`}>
                    {item.priority}优先级
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">{item.quantity.toLocaleString()}</span>
                    <div className="w-24 h-2 bg-slate-200 rounded overflow-hidden">
                      <div
                        className={`h-full ${item.priority === '高' ? 'bg-red-500' :
                            item.priority === '中' ? 'bg-yellow-500' :
                              'bg-slate-400'
                          }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 生产线优化分析 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="text-indigo-500" size={18} />
            生产线优化分析
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">生产线</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">产量</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">订单数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">产品种类</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">平均周期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">占比</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {productionLineDistribution.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                      {line.productionLine}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {line.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {line.orderCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {line.productCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {line.avgCycleDays > 0 ? `${line.avgCycleDays.toFixed(1)}天` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${line.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-indigo-600">
                          {line.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanPanel;

