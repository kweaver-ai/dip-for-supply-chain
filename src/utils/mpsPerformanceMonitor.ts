/**
 * MPS Performance Monitor
 * 
 * 性能监控工具，用于验证MPS甘特图的性能目标（SC-001, SC-006, SC-007）
 */

interface PerformanceMetrics {
  loadTime: number;           // 数据加载时间（ms）
  calculationTime: number;    // 甘特图计算时间（ms）
  renderTime: number;         // 渲染时间（ms）
  tooltipDelay: number;       // Tooltip显示延迟（ms）
  taskCount: number;          // 任务数量
  meetsTargets: {
    loadTime: boolean;        // SC-001: < 30秒
    tooltipDelay: boolean;    // SC-006: < 200ms
    renderPerformance: boolean; // SC-007: 50任务流畅
  };
}

/**
 * 监控数据加载性能
 * @param startTime 开始时间（performance.now()）
 * @returns 加载时间（ms）
 */
export function monitorLoadTime(startTime: number): number {
  const loadTime = performance.now() - startTime;
  
  if (loadTime > 30000) {
    console.warn(`[Performance SC-001] 数据加载耗时 ${loadTime.toFixed(2)}ms，超过30秒目标`);
  } else {
    console.log(`[Performance SC-001] ✅ 数据加载耗时 ${loadTime.toFixed(2)}ms，符合目标`);
  }
  
  return loadTime;
}

/**
 * 监控甘特图计算性能
 * @param startTime 开始时间
 * @param taskCount 任务数量
 * @returns 计算时间（ms）
 */
export function monitorCalculationTime(startTime: number, taskCount: number): number {
  const calcTime = performance.now() - startTime;
  
  if (calcTime > 100) {
    console.warn(`[Performance] 甘特图计算耗时 ${calcTime.toFixed(2)}ms，任务数: ${taskCount}`);
  }
  
  if (taskCount > 50) {
    console.warn(`[Performance SC-007] 任务数量(${taskCount})超过50个，可能影响渲染性能`);
  }
  
  return calcTime;
}

/**
 * 监控Tooltip显示延迟
 * @param startTime 开始时间
 * @returns 延迟时间（ms）
 */
export function monitorTooltipDelay(startTime: number): number {
  const delay = performance.now() - startTime;
  
  if (delay > 200) {
    console.warn(`[Performance SC-006] Tooltip显示延迟 ${delay.toFixed(2)}ms，超过200ms目标`);
  } else {
    console.log(`[Performance SC-006] ✅ Tooltip显示延迟 ${delay.toFixed(2)}ms，符合目标`);
  }
  
  return delay;
}

/**
 * 监控渲染性能（使用PerformanceObserver）
 * @param callback 性能回调函数
 */
export function monitorRenderPerformance(callback: (metrics: PerformanceMetrics) => void): () => void {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[Performance] PerformanceObserver not supported');
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'measure') {
        console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['measure'] });
  } catch (e) {
    console.warn('[Performance] Failed to observe performance:', e);
  }

  return () => observer.disconnect();
}

/**
 * 标记性能测量点
 * @param name 测量点名称
 */
export function markPerformance(name: string): void {
  if (typeof performance.mark === 'function') {
    performance.mark(name);
  }
}

/**
 * 测量两个标记点之间的性能
 * @param startMark 开始标记点名称
 * @param endMark 结束标记点名称
 * @param measureName 测量名称
 * @returns 耗时（ms）
 */
export function measurePerformance(startMark: string, endMark: string, measureName: string): number {
  if (typeof performance.measure === 'function') {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName, 'measure')[0];
      return measure?.duration || 0;
    } catch (e) {
      console.warn(`[Performance] Failed to measure ${measureName}:`, e);
      return 0;
    }
  }
  return 0;
}

/**
 * 验证性能目标是否达成
 * @param metrics 性能指标
 * @returns 验证结果
 */
export function validatePerformanceTargets(metrics: Partial<PerformanceMetrics>): {
  passed: boolean;
  details: string[];
} {
  const details: string[] = [];
  let passed = true;

  // SC-001: 数据加载 < 30秒
  if (metrics.loadTime !== undefined) {
    const sc001Passed = metrics.loadTime < 30000;
    details.push(`SC-001 (加载时间): ${metrics.loadTime.toFixed(2)}ms ${sc001Passed ? '✅' : '❌'}`);
    if (!sc001Passed) passed = false;
  }

  // SC-006: Tooltip延迟 < 200ms
  if (metrics.tooltipDelay !== undefined) {
    const sc006Passed = metrics.tooltipDelay < 200;
    details.push(`SC-006 (Tooltip延迟): ${metrics.tooltipDelay.toFixed(2)}ms ${sc006Passed ? '✅' : '❌'}`);
    if (!sc006Passed) passed = false;
  }

  // SC-007: 50任务流畅渲染
  if (metrics.taskCount !== undefined && metrics.renderTime !== undefined) {
    const sc007Passed = metrics.taskCount <= 50 || metrics.renderTime < 1000;
    details.push(`SC-007 (渲染性能): ${metrics.taskCount}任务, ${metrics.renderTime.toFixed(2)}ms ${sc007Passed ? '✅' : '❌'}`);
    if (!sc007Passed) passed = false;
  }

  return { passed, details };
}
