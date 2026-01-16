/**
 * Gantt Chart Section Component
 *
 * 甘特图部分组件，包含甘特图和图例
 * 支持默认模式和齐套模式V2
 */

import { TrendingUp, Clock } from 'lucide-react';
import type { GanttTask, MaterialReadyGanttTask, ProductionPlanMode } from '../../types/ontology';
import { GanttBOMTree } from './GanttBOMTree';
import { GanttTooltip } from './GanttTooltip';
import { LegendPanel } from './LegendPanel';
import { monitorTooltipDelay } from '../../utils/mpsPerformanceMonitor';

interface GanttChartSectionProps {
  tasks: GanttTask[] | MaterialReadyGanttTask[];
  totalCycle: number;
  hoveredTask: GanttTask | MaterialReadyGanttTask | null;
  tooltipPosition: { x: number; y: number } | null;
  onTaskHover: (task: GanttTask | MaterialReadyGanttTask, position: { x: number; y: number }) => void;
  onTaskLeave: () => void;
  mode?: ProductionPlanMode;
}

export const GanttChartSection = ({
  tasks,
  totalCycle,
  hoveredTask,
  tooltipPosition,
  onTaskHover,
  onTaskLeave,
  mode = 'default'
}: GanttChartSectionProps) => {
  // 性能监控：验证SC-006（Tooltip延迟 < 200ms）
  const handleTaskHover = (task: GanttTask | MaterialReadyGanttTask, position: { x: number; y: number }) => {
    const hoverStartTime = performance.now();
    onTaskHover(task, position);

    // 使用requestAnimationFrame确保DOM更新后测量
    requestAnimationFrame(() => {
      monitorTooltipDelay(hoverStartTime);
    });
  };

  const isV2Mode = mode === 'material-ready-v2';
  const tooltipMode = isV2Mode ? 'material-ready-v2' : 'default';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <TrendingUp className="text-indigo-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-800">
            生产计划甘特图
            {isV2Mode && <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded">齐套模式</span>}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} />
          <span>预计出货周期：<strong className="text-indigo-600">{totalCycle}</strong> 天</span>
        </div>
      </div>

      {/* Tree-structured BOM Gantt Chart */}
      <GanttBOMTree
        tasks={tasks as GanttTask[]}
        onTaskHover={handleTaskHover as (task: GanttTask, position: { x: number; y: number }) => void}
        onTaskLeave={onTaskLeave}
        mode={isV2Mode ? 'material-ready-v2' : 'default'}
      />

      {/* Tooltip */}
      <GanttTooltip task={hoveredTask} position={tooltipPosition} mode={tooltipMode} />

      {/* 图例 */}
      <div className="mt-6">
        <LegendPanel mode={isV2Mode ? 'material-ready-v2' : 'default'} />
      </div>
    </div>
  );
};
