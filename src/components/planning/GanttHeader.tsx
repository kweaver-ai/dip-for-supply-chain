/**
 * Gantt Header Component
 *
 * 甘特图顶部信息栏，显示：
 * - 产品编码-名称
 * - 预计出货周期（计划开始时间-计划结束时间）
 * - 实际时间（开始时间-结束时间）
 * - 延期/提前天数
 */

import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface GanttHeaderProps {
  productCode: string;
  productName: string;
  planStartDate: Date;
  planEndDate: Date;
  actualStartDate: Date;
  actualEndDate: Date;
  isOverdue: boolean;
  overdueDays: number;  // 正数表示延期，负数表示提前
  totalCycle: number;
}

/**
 * 格式化日期为 MM/DD 格式
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
function formatFullDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function GanttHeader({
  productCode,
  productName,
  planStartDate,
  planEndDate,
  actualStartDate,
  actualEndDate,
  isOverdue,
  overdueDays,
  totalCycle,
}: GanttHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 产品信息 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-lg">P</span>
          </div>
          <div>
            <div className="text-xs text-slate-500">产品</div>
            <div className="text-base font-semibold text-slate-800">
              {productName}
            </div>
          </div>
        </div>

        {/* 预计出货周期 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-xs text-slate-500">预计出货周期</div>
            <div className="text-sm font-medium text-slate-700">
              {formatDate(planStartDate)} ~ {formatDate(planEndDate)}
            </div>
          </div>
        </div>

        {/* 实际时间 */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-xs text-slate-500">实际时间</div>
            <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
              {formatDate(actualStartDate)} ~ {formatDate(actualEndDate)}
            </div>
          </div>
        </div>

        {/* 状态标识 */}
        <div className="flex items-center gap-2">
          {isOverdue ? (
            <>
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm font-semibold text-red-600">
                  延期 {overdueDays} 天
                </div>
              </div>
            </>
          ) : overdueDays < 0 ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm font-semibold text-green-600">
                  提前 {Math.abs(overdueDays)} 天
                </div>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm font-semibold text-indigo-600">
                  按时完成
                </div>
              </div>
            </>
          )}
        </div>

        {/* 总周期 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
          <div className="text-xs text-slate-500">总周期</div>
          <div className="text-xl font-bold text-slate-800">
            {totalCycle} <span className="text-sm font-normal text-slate-500">天</span>
          </div>
        </div>
      </div>

      {/* 详细时间信息 */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-6 text-xs text-slate-500">
        <span>计划时间: {formatFullDate(planStartDate)} ~ {formatFullDate(planEndDate)}</span>
        <span>实际时间: {formatFullDate(actualStartDate)} ~ {formatFullDate(actualEndDate)}</span>
      </div>
    </div>
  );
}

export default GanttHeader;
