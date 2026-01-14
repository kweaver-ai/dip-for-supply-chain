/**
 * Gantt Tooltip Component
 * 
 * Displays detailed task information in a tooltip when hovering over task bars.
 * Uses fixed positioning to appear near the cursor/task bar.
 */

import type { GanttTask } from '../../types/ontology';

interface GanttTooltipProps {
  task: GanttTask | null;
  position: { x: number; y: number } | null;
}

export function GanttTooltip({ task, position }: GanttTooltipProps) {
  if (!task || !position) {
    return null;
  }

  const getTypeLabel = (type: GanttTask['type']): string => {
    switch (type) {
      case 'product':
        return '产品';
      case 'module':
        return '一级组件（模块）';
      case 'component':
        return '二级组件（构件）';
      case 'material':
        return '物料';
      default:
        return '未知';
    }
  };

  return (
    <div
      className="fixed z-50 bg-slate-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 pointer-events-none max-w-xs"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, calc(-100% - 8px))',
      }}
    >
      <div className="font-semibold mb-2 text-sm border-b border-slate-700 pb-1">
        {task.name}
      </div>
      <div className="space-y-1 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">类型:</span>
          <span>{getTypeLabel(task.type)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">持续时间:</span>
          <span className="font-medium">{task.duration} 天</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">开始:</span>
          <span>{task.startDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">结束:</span>
          <span>{task.endDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
        </div>
        {task.status !== 'normal' && (
          <div
            className={`mt-2 pt-1 border-t border-slate-700 ${
              task.status === 'critical' ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            <span className="font-medium">
              {task.status === 'critical' ? '⚠️ 严重风险' : '⚠️ 警告'}
            </span>
          </div>
        )}
      </div>
      {/* Arrow pointing to task bar */}
      <div
        className="absolute left-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900"
        style={{ transform: 'translateX(-50%)' }}
      />
    </div>
  );
}
