/**
 * Gantt Task Bar Component
 *
 * Renders a single task bar in the Gantt chart with appropriate styling based on task type and status.
 *
 * 齐套模式V2颜色编码：
 * - 绿色 (#52C41A): 就绪（库存充足）
 * - 黄色 (#FAAD14): 未就绪（需采购/生产）
 * - 红色 (#FF4D4F): 超期（超出计划结束时间）
 * - 蓝色 (#1890FF): 正常
 */

import { memo } from 'react';
import type { GanttTask, MaterialReadyGanttTask } from '../../types/ontology';

interface GanttTaskBarProps {
  task: GanttTask | MaterialReadyGanttTask;
  startColumn: number;
  spanColumns: number;
  showTimeInfo?: boolean; // If true, show start/end dates; if false, show duration only
  onHover?: (e: React.MouseEvent) => void;
  onLeave?: () => void;
  mode?: 'default' | 'material-ready-v2';  // 渲染模式
}

/**
 * 判断是否为MaterialReadyGanttTask
 */
function isMaterialReadyTask(task: GanttTask | MaterialReadyGanttTask): task is MaterialReadyGanttTask {
  return 'isReady' in task;
}

function GanttTaskBarComponent({
  task,
  startColumn,
  spanColumns,
  showTimeInfo = false,
  onHover,
  onLeave,
  mode = 'default'
}: GanttTaskBarProps) {
  // Determine color class based on task status and type
  const getColorClass = (): string => {
    // 齐套模式V2专用颜色
    if (mode === 'material-ready-v2' && isMaterialReadyTask(task)) {
      switch (task.status) {
        case 'ready':
          return 'bg-green-500';  // #52C41A 就绪
        case 'not-ready':
          return 'bg-yellow-500'; // #FAAD14 未就绪
        case 'overdue':
          return 'bg-red-500';    // #FF4D4F 超期
        case 'normal':
        default:
          // 产品使用蓝色
          if (task.type === 'product') {
            return 'bg-blue-500';
          }
          return 'bg-blue-400';
      }
    }

    // 默认模式颜色逻辑
    if (task.status === 'critical') {
      return 'bg-red-500';
    }
    if (task.status === 'warning') {
      return 'bg-yellow-500';
    }
    // Default colors based on task type
    switch (task.type) {
      case 'product':
        return 'bg-indigo-600';
      case 'module':
        return 'bg-blue-500';
      case 'component':
        return 'bg-purple-500';
      case 'material':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  // 获取边框样式（齐套模式V2）
  const getBorderClass = (): string => {
    if (mode === 'material-ready-v2' && isMaterialReadyTask(task)) {
      if (task.status === 'overdue') {
        return 'border-2 border-red-300';
      }
      if (task.status === 'ready') {
        return 'border border-green-300';
      }
    }
    return '';
  };

  const colorClass = getColorClass();
  const borderClass = getBorderClass();

  // 齐套模式V2显示内容
  const renderContent = () => {
    if (mode === 'material-ready-v2' && isMaterialReadyTask(task)) {
      // 就绪物料显示勾号
      if (task.status === 'ready' && task.duration === 1) {
        return <span className="text-xs">✓</span>;
      }
      // 超期显示警告
      if (task.status === 'overdue') {
        return (
          <span className="text-xs whitespace-nowrap">
            {task.duration}天
          </span>
        );
      }
    }

    // 默认显示逻辑
    if (showTimeInfo) {
      return (
        <div className="text-xs opacity-90 whitespace-nowrap text-center">
          <div>{task.startDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</div>
          <div>-</div>
          <div>{task.endDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</div>
        </div>
      );
    }

    if (task.duration > 0) {
      return <span className="text-xs opacity-90 whitespace-nowrap">{task.duration}天</span>;
    }

    return null;
  };

  return (
    <div
      className={`${colorClass} ${borderClass} text-white text-xs px-2 py-1 rounded flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
      style={{
        height: '1.5rem',
        width: `${spanColumns * 60}px`,
        minWidth: spanColumns > 0 ? '60px' : '0px',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {renderContent()}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const GanttTaskBar = memo(GanttTaskBarComponent, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.startColumn === nextProps.startColumn &&
    prevProps.spanColumns === nextProps.spanColumns &&
    prevProps.showTimeInfo === nextProps.showTimeInfo
  );
});
