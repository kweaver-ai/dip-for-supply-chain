/**
 * Gantt Chart Section Component
 * 
 * 甘特图部分组件，包含甘特图和图例
 */

import { TrendingUp, Clock } from 'lucide-react';
import type { GanttTask } from '../../types/ontology';
import { GanttBOMTree } from './GanttBOMTree';
import { GanttTooltip } from './GanttTooltip';
import { monitorTooltipDelay } from '../../utils/mpsPerformanceMonitor';

interface GanttChartSectionProps {
  tasks: GanttTask[];
  totalCycle: number;
  hoveredTask: GanttTask | null;
  tooltipPosition: { x: number; y: number } | null;
  onTaskHover: (task: GanttTask, position: { x: number; y: number }) => void;
  onTaskLeave: () => void;
}

export const GanttChartSection = ({
  tasks,
  totalCycle,
  hoveredTask,
  tooltipPosition,
  onTaskHover,
  onTaskLeave
}: GanttChartSectionProps) => {
  // 性能监控：验证SC-006（Tooltip延迟 < 200ms）
  const handleTaskHover = (task: GanttTask, position: { x: number; y: number }) => {
    const hoverStartTime = performance.now();
    onTaskHover(task, position);
    
    // 使用requestAnimationFrame确保DOM更新后测量
    requestAnimationFrame(() => {
      monitorTooltipDelay(hoverStartTime);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <TrendingUp className="text-indigo-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-800">生产计划甘特图</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} />
          <span>预计出货周期：<strong className="text-indigo-600">{totalCycle}</strong> 天</span>
        </div>
      </div>

      {/* Tree-structured BOM Gantt Chart */}
      <GanttBOMTree
        tasks={tasks}
        onTaskHover={handleTaskHover}
        onTaskLeave={onTaskLeave}
      />

      {/* Tooltip */}
      <GanttTooltip task={hoveredTask} position={tooltipPosition} />

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded"></div>
          <span>产品</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>一级组件（模块）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>二级组件（构件）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>物料</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>警告</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>严重</span>
        </div>
      </div>
    </div>
  );
};
