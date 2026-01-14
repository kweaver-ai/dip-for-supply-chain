/**
 * 指标数据 Hook
 *
 * 用于在组件中获取指标模型的真实数据
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { metricModelApi, createCurrentYearRange, createLastDaysRange } from '../api';
import type { MetricQueryResult, MetricQueryRequest } from '../api';

// ============================================================================
// 类型定义
// ============================================================================

/** 指标数据状态 */
export interface MetricDataState<T = number | null> {
  /** 数据值 */
  value: T;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 原始响应 */
  rawData?: MetricQueryResult;
  /** 刷新数据 */
  refresh: () => void;
}

/** Hook 配置选项 */
export interface UseMetricDataOptions {
  /** 是否立即加载 */
  immediate?: boolean;
  /** 是否使用即时查询（默认范围查询） */
  instant?: boolean;
  /** 开始时间（毫秒时间戳） */
  start?: number;
  /** 结束时间（毫秒时间戳） */
  end?: number;
  /** 步长（如 1M, 1d） */
  step?: string;
  /** 分析维度（用于分组查询） */
  analysisDimensions?: string[];
  /** 数据转换函数 */
  transform?: (result: MetricQueryResult) => number | null;
}

/** 带维度的数据项 */
export interface DimensionDataItem {
  labels: Record<string, string>;
  value: number | null;
}

/** 带维度的数据状态 */
export interface DimensionDataState {
  /** 数据列表 */
  items: DimensionDataItem[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 原始响应 */
  rawData?: MetricQueryResult;
  /** 刷新数据 */
  refresh: () => void;
}

// ============================================================================
// 默认转换函数
// ============================================================================

/**
 * 默认数据转换：取最新一个值
 */
function defaultTransform(result: MetricQueryResult): number | null {
  if (!result.datas || result.datas.length === 0) {
    return null;
  }

  // 获取第一个数据系列的最后一个值
  const firstSeries = result.datas[0];
  if (!firstSeries.values || firstSeries.values.length === 0) {
    return null;
  }

  // 返回最后一个非空值
  for (let i = firstSeries.values.length - 1; i >= 0; i--) {
    if (firstSeries.values[i] !== null) {
      return firstSeries.values[i];
    }
  }

  return null;
}

/**
 * 求和转换：将所有系列的所有值求和
 */
export function sumTransform(result: MetricQueryResult): number | null {
  if (!result.datas || result.datas.length === 0) {
    return null;
  }

  let sum = 0;
  let hasValue = false;

  for (const series of result.datas) {
    if (series.values) {
      for (const value of series.values) {
        if (value !== null) {
          sum += value;
          hasValue = true;
        }
      }
    }
  }

  return hasValue ? sum : null;
}

/**
 * 最新值转换：取所有系列中时间最新的值
 */
export function latestValueTransform(result: MetricQueryResult): number | null {
  if (!result.datas || result.datas.length === 0) {
    return null;
  }

  let latestTime = -Infinity;  // 修复：使用负无穷大作为初始值
  let latestValue: number | null = null;

  for (const series of result.datas) {
    if (series.times && series.values) {
      for (let i = 0; i < series.times.length; i++) {
        const time = series.times[i];
        const value = series.values[i];
        if (value !== null && time >= latestTime) {  // 修复：使用 >= 而不是 >
          latestTime = time;
          latestValue = value;
        }
      }
    }
  }

  return latestValue;
}

/**
 * 计数转换：统计所有数据点的个数
 */
export function countTransform(result: MetricQueryResult): number | null {
  if (!result.datas || result.datas.length === 0) {
    return null;
  }

  let count = 0;
  for (const series of result.datas) {
    if (series.values) {
      count += series.values.filter(v => v !== null).length;
    }
  }

  return count;
}

// ============================================================================
// Hook 实现
// ============================================================================

/**
 * 获取单个指标模型数据
 *
 * @param modelId - 指标模型 ID
 * @param options - 配置选项
 */
export function useMetricData(
  modelId: string,
  options: UseMetricDataOptions = {}
): MetricDataState {
  const {
    immediate = true,
    instant = true,
    start,
    end,
    step = '1M',
    transform = defaultTransform,
  } = options;

  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<MetricQueryResult | undefined>();

  // 使用 ref 存储 transform 函数，避免引用变化导致的无限循环
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const fetchData = useCallback(async () => {
    if (!modelId) {
      setError('指标模型 ID 不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 默认时间范围：最近1天（避免长跨度查询导致500错误）
      const defaultRange = createLastDaysRange(1);
      const queryStart = start ?? defaultRange.start;
      const queryEnd = end ?? defaultRange.end;

      const request: MetricQueryRequest = {
        instant,
        start: queryStart,
        end: queryEnd,
      };

      // 范围查询需要 step
      if (!instant) {
        request.step = step;
      }

      const result = await metricModelApi.queryByModelId(modelId, request, {
        includeModel: true,
      });

      setRawData(result);
      const transformedValue = transformRef.current(result);
      setValue(transformedValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取指标数据失败';
      setError(errorMessage);
      console.error(`[useMetricData] 获取指标 ${modelId} 失败:`, err);
    } finally {
      setLoading(false);
    }
  }, [modelId, instant, start, end, step]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    value,
    loading,
    error,
    rawData,
    refresh: fetchData,
  };
}

/**
 * 批量获取多个指标模型数据
 *
 * @param modelIds - 指标模型 ID 数组
 * @param options - 配置选项
 */
export function useMultipleMetricData(
  modelIds: string[],
  options: UseMetricDataOptions = {}
): {
  data: Map<string, number | null>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const {
    immediate = true,
    instant = true,
    start,
    end,
    step = '1M',
    transform = defaultTransform,
  } = options;

  const [data, setData] = useState<Map<string, number | null>>(new Map());
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!modelIds || modelIds.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const defaultRange = createLastDaysRange(1);
      const queryStart = start ?? defaultRange.start;
      const queryEnd = end ?? defaultRange.end;

      const baseRequest: MetricQueryRequest = {
        instant,
        start: queryStart,
        end: queryEnd,
      };

      if (!instant) {
        baseRequest.step = step;
      }

      const requests = modelIds.map(() => ({ ...baseRequest }));
      const results = await metricModelApi.queryByModelIds(modelIds, requests, {
        includeModel: true,
      });

      const newData = new Map<string, number | null>();
      results.forEach((result, index) => {
        const transformedValue = transform(result);
        newData.set(modelIds[index], transformedValue);
      });

      setData(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取指标数据失败';
      setError(errorMessage);
      console.error('[useMultipleMetricData] 获取指标失败:', err);
    } finally {
      setLoading(false);
    }
  }, [modelIds, instant, start, end, step, transform]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

/**
 * 获取带维度分组的指标数据
 * 
 * 用于查询按某个维度分组的数据，如按产品名称分组的库存量
 *
 * @param modelId - 指标模型 ID
 * @param dimensions - 分组维度字段名数组
 * @param options - 配置选项
 */
export function useDimensionMetricData(
  modelId: string,
  dimensions: string[],
  options: Omit<UseMetricDataOptions, 'transform' | 'analysisDimensions'> = {}
): DimensionDataState {
  const {
    immediate = true,
    instant = true,
    start,
    end,
    step = '1M',
  } = options;

  const [items, setItems] = useState<DimensionDataItem[]>([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<MetricQueryResult | undefined>();

  // 将 dimensions 数组序列化为字符串，避免引用变化导致的无限循环
  const dimensionsKey = JSON.stringify(dimensions);

  const fetchData = useCallback(async () => {
    if (!modelId) {
      setError('指标模型 ID 不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const defaultRange = createLastDaysRange(1);
      const queryStart = start ?? defaultRange.start;
      const queryEnd = end ?? defaultRange.end;

      // 从序列化的字符串恢复 dimensions
      const parsedDimensions = JSON.parse(dimensionsKey) as string[];

      const request: MetricQueryRequest = {
        instant,
        start: queryStart,
        end: queryEnd,
        analysis_dimensions: parsedDimensions,
      };

      if (!instant) {
        request.step = step;
      }

      const result = await metricModelApi.queryByModelId(modelId, request, {
        includeModel: true,
      });

      setRawData(result);

      // 转换数据：提取每个系列的标签和最新值
      const transformedItems: DimensionDataItem[] = [];

      if (result.datas && result.datas.length > 0) {
        for (const series of result.datas) {
          // 获取最新的值（最后一个非空值）
          let latestValue: number | null = null;
          if (series.values && series.values.length > 0) {
            for (let i = series.values.length - 1; i >= 0; i--) {
              if (series.values[i] !== null) {
                latestValue = series.values[i];
                break;
              }
            }
          }

          transformedItems.push({
            labels: series.labels || {},
            value: latestValue,
          });
        }
      }

      // 按值降序排序
      transformedItems.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

      setItems(transformedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取指标数据失败';
      setError(errorMessage);
      console.error(`[useDimensionMetricData] 获取指标 ${modelId} 失败:`, err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, dimensionsKey, instant, start, end, step]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    items,
    loading,
    error,
    rawData,
    refresh: fetchData,
  };
}

export default useMetricData;

