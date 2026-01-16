/**
 * Gantt Tooltip Component
 *
 * Displays detailed task information in a tooltip when hovering over task bars.
 * Uses fixed positioning to appear near the cursor/task bar.
 *
 * 齐套模式V2 Tooltip显示内容：
 * - 产品：编码+名称、类型、计划生产数量、生产效率、组装时长
 * - 组件：编码+名称、类型、需求数量、生产效率、组装时长
 * - 物料：编码+名称、类型、需求数量、库存数量、交付时间
 */

import type { GanttTask, MaterialReadyGanttTask } from '../../types/ontology';

interface GanttTooltipProps {
  task: GanttTask | MaterialReadyGanttTask | null;
  position: { x: number; y: number } | null;
  mode?: 'default' | 'material-ready-v2';
}

/**
 * 判断是否为MaterialReadyGanttTask
 */
function isMaterialReadyTask(task: GanttTask | MaterialReadyGanttTask): task is MaterialReadyGanttTask {
  return 'isReady' in task;
}

export function GanttTooltip({ task, position, mode = 'default' }: GanttTooltipProps) {
  if (!task || !position) {
    return null;
  }

  const getTypeLabel = (type: GanttTask['type'], materialType?: string): string => {
    switch (type) {
      case 'product':
        return '产品';
      case 'module':
        return '一级组件（模块）';
      case 'component':
        return materialType === '自制' ? '组件（自制）' : '组件';
      case 'material':
        if (materialType === '外购') return '物料（外购）';
        if (materialType === '委外') return '物料（委外）';
        return '物料';
      default:
        return '未知';
    }
  };

  const getStatusLabel = (status: string): { label: string; className: string } => {
    switch (status) {
      case 'ready':
        return { label: '✓ 就绪', className: 'text-green-400' };
      case 'not-ready':
        return { label: '待准备', className: 'text-yellow-400' };
      case 'overdue':
        return { label: '⚠ 超期', className: 'text-red-400' };
      case 'critical':
        return { label: '⚠ 严重风险', className: 'text-red-400' };
      case 'warning':
        return { label: '⚠ 警告', className: 'text-yellow-400' };
      default:
        return { label: '正常', className: 'text-blue-400' };
    }
  };

  // 齐套模式V2 Tooltip
  if (mode === 'material-ready-v2' && isMaterialReadyTask(task)) {
    const statusInfo = getStatusLabel(task.status);
    const typeLabel = getTypeLabel(task.type, task.materialType);

    return (
      <div
        className="fixed z-50 bg-slate-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 pointer-events-none max-w-sm"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, calc(-100% - 8px))',
        }}
      >
        {/* 标题 */}
        <div className="font-semibold mb-2 text-sm border-b border-slate-700 pb-1 flex items-center justify-between">
          <span>{task.name}</span>
          <span className={`text-xs font-normal ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>

        <div className="space-y-1.5 text-slate-300">
          {/* 类型 */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">类型:</span>
            <span className="font-medium">{typeLabel}</span>
          </div>

          {/* 产品特有字段 */}
          {task.type === 'product' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">计划数量:</span>
                <span>{task.requiredQuantity.toLocaleString()}</span>
              </div>
              {task.productionRate && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">生产效率:</span>
                  <span>{task.productionRate.toLocaleString()}/天</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">组装时长:</span>
                <span className="font-medium text-blue-400">{task.assemblyTime || task.duration}天</span>
              </div>
            </>
          )}

          {/* 组件特有字段（自制物料） */}
          {task.type === 'component' && task.materialType === '自制' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">需求数量:</span>
                <span>{task.requiredQuantity.toLocaleString()}</span>
              </div>
              {task.productionRate && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">生产效率:</span>
                  <span>{task.productionRate.toLocaleString()}/天</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">组装时长:</span>
                <span className="font-medium text-purple-400">{task.assemblyTime || task.duration}天</span>
              </div>
            </>
          )}

          {/* 物料特有字段（外购/委外） */}
          {task.type === 'material' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">需求数量:</span>
                <span>{task.requiredQuantity.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">库存数量:</span>
                <span className={task.isReady ? 'text-green-400' : 'text-yellow-400'}>
                  {task.availableInventory.toLocaleString()}
                  {task.isReady && ' ✓'}
                </span>
              </div>
              {task.deliveryDuration && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">交付时间:</span>
                  <span>{task.deliveryDuration}天/次</span>
                </div>
              )}
            </>
          )}

          {/* 时间信息 */}
          <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">开始:</span>
              <span>{task.startDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">结束:</span>
              <span>{task.endDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
            </div>
          </div>

          {/* 超期警告 */}
          {task.status === 'overdue' && (
            <div className="mt-2 pt-1 border-t border-red-900/50 text-red-400 text-xs">
              超出计划结束时间，建议加急处理
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

  // 默认模式 Tooltip
  const defaultTypeLabel = getTypeLabel(task.type);

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
          <span>{defaultTypeLabel}</span>
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
