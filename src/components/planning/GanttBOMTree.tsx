/**
 * Gantt BOM Tree Component
 * 
 * Renders a tree-structured BOM Gantt chart with time axis on horizontal axis and BOM hierarchy on vertical axis.
 * Uses CSS Grid layout to ensure perfect alignment between task names and task bars.
 */

import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Package } from 'lucide-react';
import type { GanttTask, TimeRange } from '../../types/ontology';
import {
  calculateTimeRange,
  generateTimeColumns,
  getTaskGridPosition,
} from '../../utils/ganttUtils';
import { GanttTaskBar } from './GanttTaskBar';

interface GanttBOMTreeProps {
  tasks: GanttTask[];
  onTaskHover?: (task: GanttTask, position: { x: number; y: number }) => void;
  onTaskLeave?: () => void;
}

// Internal component for tree node rendering
interface TreeNodeProps {
  task: GanttTask;
  level: number;
  timeRange: TimeRange;
  timeColumns: Date[];
  expandedNodes: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onTaskHover?: (task: GanttTask, position: { x: number; y: number }) => void;
  onTaskLeave?: () => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  task,
  level,
  timeRange,
  timeColumns,
  expandedNodes,
  onToggleExpand,
  onTaskHover,
  onTaskLeave
}) => {
  const isExpanded = expandedNodes.has(task.id);
  const hasChildren = task.children && task.children.length > 0;

  // 根据层级获取行背景色（FR-026）
  const getRowBackgroundColor = (taskLevel: number): string => {
    // level 0: 产品 -> bg-white
    // level 1: 一级组件 -> bg-white
    // level 2: 二级组件 -> bg-slate-50
    // level 3: 三级组件 -> bg-blue-50
    // level 4+: 物料 -> bg-purple-50
    if (taskLevel === 0 || taskLevel === 1) {
      return 'bg-white';
    } else if (taskLevel === 2) {
      return 'bg-slate-50';
    } else if (taskLevel === 3) {
      return 'bg-blue-50';
    } else {
      return 'bg-purple-50';
    }
  };

  // 使用task.level确保与buildBOMTree设置的level一致
  const taskLevel = task.level !== undefined ? task.level : level;
  const bgColor = getRowBackgroundColor(taskLevel);

  // Calculate task bar position
  const position = getTaskGridPosition(task, timeRange);
  const startCol = position.startColumn - 1; // Convert to 0-based index

  // Handle task hover
  const handleTaskHover = (e: React.MouseEvent) => {
    if (onTaskHover) {
      const rect = e.currentTarget.getBoundingClientRect();
      onTaskHover(task, {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  // Handle task leave
  const handleTaskLeave = () => {
    if (onTaskLeave) {
      onTaskLeave();
    }
  };

  return (
    <>
      {/* Task name cell */}
      <div
        className={`text-sm text-slate-700 text-right pr-2 border-b border-r border-slate-100 sticky left-0 z-20 ${bgColor} flex items-center justify-end`}
        style={{
          height: '3.5rem',
          paddingLeft: `${level * 1}rem`,
          boxSizing: 'border-box',
        }}
        title={task.name}
      >
        <div className="flex items-center gap-2 w-full justify-end">
          {/* Expand/Collapse Icon */}
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                onToggleExpand(task.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )
            ) : (
              <div className="w-3.5" />
            )}
          </div>

          {/* Package Icon */}
          <Package size={14} className={level === 0 ? "text-purple-600" : "text-slate-500"} />

          {/* Task Name */}
          <div
            style={{
              lineHeight: '1.2rem',
              maxHeight: '2.4rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              textOverflow: 'ellipsis',
              textAlign: 'right',
            }}
          >
            {task.name}
          </div>
        </div>
      </div>

      {/* Task bar cells */}
      {timeColumns.map((_, colIndex) => {
        const isTaskStart = colIndex === startCol;

        return (
          <div
            key={`cell-${task.id}-${colIndex}`}
            className={`relative border-b border-l border-slate-100 ${bgColor}`}
            style={{
              height: '3.5rem',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            {isTaskStart && (
              <div
                className="absolute inset-y-0 flex items-center z-10"
                style={{
                  left: 0,
                  width: `${position.spanColumns * 60}px`,
                }}
              >
                <GanttTaskBar
                  task={task}
                  startColumn={position.startColumn}
                  spanColumns={position.spanColumns}
                  showTimeInfo={level === 0}
                  onHover={handleTaskHover}
                  onLeave={handleTaskLeave}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Child nodes (recursively rendered) */}
      {isExpanded && hasChildren && task.children!.map((child) => (
        <TreeNode
          key={child.id}
          task={child}
          level={level + 1}
          timeRange={timeRange}
          timeColumns={timeColumns}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          onTaskHover={onTaskHover}
          onTaskLeave={onTaskLeave}
        />
      ))}
    </>
  );
};

export function GanttBOMTree({ tasks, onTaskHover, onTaskLeave }: GanttBOMTreeProps) {
  // Track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Calculate time range from all tasks (flatten tree first)
  const timeRange = useMemo(() => {
    try {
      const flattenTasks = (taskList: GanttTask[]): GanttTask[] => {
        const result: GanttTask[] = [];
        taskList.forEach(task => {
          result.push(task);
          if (task.children && task.children.length > 0) {
            result.push(...flattenTasks(task.children));
          }
        });
        return result;
      };
      const allTasks = flattenTasks(tasks);
      const range = calculateTimeRange(allTasks);

      console.log('[GanttBOMTree] 时间范围计算:', {
        taskCount: allTasks.length,
        startDate: range.start.toLocaleDateString('zh-CN'),
        endDate: range.end.toLocaleDateString('zh-CN'),
        totalDays: Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24))
      });

      return range;
    } catch (error) {
      console.error('Error calculating time range:', error);
      const now = new Date();
      return { start: now, end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) };
    }
  }, [tasks]);

  // Generate time columns (one per day)
  const timeColumns = useMemo(() => {
    try {
      return generateTimeColumns(timeRange);
    } catch (error) {
      console.error('Error generating time columns:', error);
      return [];
    }
  }, [timeRange]);

  // Find root task (level === 0) and initialize expanded state
  const rootTask = useMemo(() => {
    const findRoot = (taskList: GanttTask[]): GanttTask | null => {
      for (const task of taskList) {
        if (task.level === 0) {
          return task;
        }
        if (task.children && task.children.length > 0) {
          const found = findRoot(task.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findRoot(tasks);
  }, [tasks]);

  // Initialize expanded nodes (root node expanded by default)
  useMemo(() => {
    if (rootTask && expandedNodes.size === 0) {
      setExpandedNodes(new Set([rootTask.id]));
    }
  }, [rootTask, expandedNodes.size]);

  // Calculate total rows (all expanded nodes)
  const totalRows = useMemo(() => {
    const countRows = (task: GanttTask): number => {
      let count = 1; // Current node
      if (expandedNodes.has(task.id) && task.children && task.children.length > 0) {
        task.children.forEach(child => {
          count += countRows(child);
        });
      }
      return count;
    };
    return rootTask ? countRows(rootTask) : 0;
  }, [rootTask, expandedNodes]);

  // Handle expand/collapse toggle
  const handleToggleExpand = (taskId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Handle task hover
  const handleTaskHover = (task: GanttTask, position: { x: number; y: number }) => {
    if (onTaskHover) {
      onTaskHover(task, position);
    }
  };

  // Handle task leave
  const handleTaskLeave = () => {
    if (onTaskLeave) {
      onTaskLeave();
    }
  };

  // Format date for display (M/D format)
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>暂无任务数据</p>
      </div>
    );
  }

  if (!rootTask) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>未找到根任务</p>
      </div>
    );
  }

  if (!timeColumns || timeColumns.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>时间范围无效</p>
      </div>
    );
  }

  const totalDays = Math.max(1, timeColumns.length);

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid min-w-full"
        style={{
          gridTemplateColumns: `192px repeat(${totalDays}, 60px)`,
          gridTemplateRows: `3rem repeat(${totalRows}, 3.5rem)`,
        }}
      >
        {/* Time axis header - empty cell for task name column */}
        <div className="border-b border-r border-slate-200 sticky left-0 z-30 bg-white" style={{ height: '3rem' }}></div>

        {/* Time axis header - date labels */}
        {timeColumns.map((date, index) => (
          <div
            key={`header-${index}`}
            className="border-b border-l border-slate-200 flex items-end pb-1 px-1 sticky top-0 z-20 bg-white"
            style={{ height: '3rem' }}
          >
            <div className="text-xs text-slate-500 whitespace-nowrap">
              {formatDate(date)}
            </div>
          </div>
        ))}

        {/* Tree structure rows */}
        {rootTask && (
          <TreeNode
            task={rootTask}
            level={0}
            timeRange={timeRange}
            timeColumns={timeColumns}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
            onTaskHover={handleTaskHover}
            onTaskLeave={handleTaskLeave}
          />
        )}
      </div>
    </div>
  );
}
