/**
 * Gantt Task Bar Component
 * 
 * Renders a single task bar in the Gantt chart with appropriate styling based on task type and status.
 */

import { memo } from 'react';
import type { GanttTask } from '../../types/ontology';

interface GanttTaskBarProps {
  task: GanttTask;
  startColumn: number;
  spanColumns: number;
  showTimeInfo?: boolean; // If true, show start/end dates; if false, show duration only
  onHover?: (e: React.MouseEvent) => void;
  onLeave?: () => void;
}

function GanttTaskBarComponent({ task, startColumn, spanColumns, showTimeInfo = false, onHover, onLeave }: GanttTaskBarProps) {
  // Determine color class based on task status and type
  const getColorClass = (): string => {
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

  const colorClass = getColorClass();

  return (
    <div
      className={`${colorClass} text-white text-xs px-2 py-1 rounded flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
      style={{
        height: '1.5rem',
        width: `${spanColumns * 60}px`,
        minWidth: spanColumns > 0 ? '60px' : '0px',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Task bar content: show time info for product level, duration for child nodes */}
      {showTimeInfo ? (
        <div className="text-xs opacity-90 whitespace-nowrap text-center">
          <div>{task.startDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</div>
          <div>-</div>
          <div>{task.endDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</div>
        </div>
      ) : (
        task.duration > 0 && (
          <span className="text-xs opacity-90 whitespace-nowrap">{task.duration}天</span>
        )
      )}
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
