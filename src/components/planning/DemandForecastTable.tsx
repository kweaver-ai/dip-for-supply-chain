/**
 * Demand Forecast Table Component
 * 
 * Displays forecast results in a table format with 18 columns horizontally.
 * Shows multiple algorithm forecast rows, historical actual, confirmed orders, and consensus suggestion.
 * Current month column is highlighted with light red color, past 2 years same month columns are highlighted with green color.
 */

import type { ProductDemandForecast } from '../../types/ontology';
import { formatMonth, formatNumber, generateMonthRange, isCurrentMonthColumn, isSameMonthColumn } from './DemandForecastTableUtils';
import { Info } from 'lucide-react';

export interface DemandForecastTableProps {
  productForecast: ProductDemandForecast;
  loading?: boolean;
}

const DemandForecastTable = ({ productForecast, loading }: DemandForecastTableProps) => {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-slate-500 animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!productForecast) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-slate-500">暂无数据</div>
      </div>
    );
  }

  const months = generateMonthRange();

  return (
    <div className="w-full overflow-x-auto animate-fade-in">
      <table className="min-w-full border-collapse border border-slate-300">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-100 px-4 py-2 text-left text-sm font-medium text-slate-700 sticky left-0 z-10">
              数据项
            </th>
            {months.map((month) => {
              const isCurrentMonth = isCurrentMonthColumn(month);
              const isPastSameMonth = isSameMonthColumn(month);
              return (
                <th
                  key={month}
                  className={`border border-slate-300 px-3 py-2 text-center text-xs font-medium ${
                    isCurrentMonth
                      ? 'bg-red-100 text-red-800'
                      : isPastSameMonth
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatMonth(month)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Algorithm Forecast Rows - One row per algorithm */}
          {productForecast.algorithmForecasts.map((algorithmForecast) => (
            <tr key={algorithmForecast.algorithm}>
              <td className="border border-slate-300 bg-blue-50 px-4 py-2 text-sm font-medium text-slate-700 sticky left-0 z-10">
                {algorithmForecast.algorithmDisplayName}
              </td>
              {algorithmForecast.forecastValues.map((value, index) => {
                const month = months[index];
                const isCurrentMonth = isCurrentMonthColumn(month);
                const isPastSameMonth = isSameMonthColumn(month);
                return (
                  <td
                    key={`${algorithmForecast.algorithm}-${month}`}
                    className={`border border-slate-300 px-3 py-2 text-center text-sm ${
                      isCurrentMonth
                        ? 'bg-red-50'
                        : isPastSameMonth
                        ? 'bg-green-50'
                        : 'bg-white'
                    }`}
                  >
                    {formatNumber(value)}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Historical Actual Row */}
          <tr>
            <td className="border border-slate-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-slate-700 sticky left-0 z-10">
              历史实际
            </td>
            {productForecast.historicalActual.map((value, index) => {
              const month = months[index];
              const isCurrentMonth = isCurrentMonthColumn(month);
              const isPastSameMonth = isSameMonthColumn(month);
              return (
                <td
                  key={`historical-${month}`}
                  className={`border border-slate-300 px-3 py-2 text-center text-sm ${
                    isCurrentMonth
                      ? 'bg-red-50'
                      : isPastSameMonth
                      ? 'bg-green-50'
                      : 'bg-white'
                  }`}
                >
                  {formatNumber(value)}
                </td>
              );
            })}
          </tr>

          {/* Confirmed Orders Row */}
          <tr>
            <td className="border border-slate-300 bg-purple-50 px-4 py-2 text-sm font-medium text-slate-700 sticky left-0 z-10">
              已确认订单
            </td>
            {productForecast.confirmedOrder.map((value, index) => {
              const month = months[index];
              const isCurrentMonth = isCurrentMonthColumn(month);
              const isPastSameMonth = isSameMonthColumn(month);
              return (
                <td
                  key={`confirmed-${month}`}
                  className={`border border-slate-300 px-3 py-2 text-center text-sm ${
                    isCurrentMonth
                      ? 'bg-red-50'
                      : isPastSameMonth
                      ? 'bg-green-50'
                      : 'bg-white'
                  }`}
                >
                  {formatNumber(value)}
                </td>
              );
            })}
          </tr>

          {/* Consensus Suggestion Row */}
          <tr>
            <td className="border border-slate-300 bg-green-50 px-4 py-2 text-sm font-medium text-slate-700 sticky left-0 z-10">
              <div className="flex items-center gap-1">
                共识需求建议
                <Info size={14} className="text-slate-400" />
              </div>
            </td>
            {productForecast.consensusSuggestion.map((value, index) => {
              const month = months[index];
              const isCurrentMonth = isCurrentMonthColumn(month);
              const isPastSameMonth = isSameMonthColumn(month);
              return (
                <td
                  key={`consensus-${month}`}
                  className={`border border-slate-300 px-3 py-2 text-center text-sm font-semibold ${
                    isCurrentMonth
                      ? 'bg-red-50 text-red-900'
                      : isPastSameMonth
                      ? 'bg-green-50 text-green-900'
                      : 'bg-white text-slate-900'
                  }`}
                >
                  {formatNumber(value)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Calculation Remarks */}
      <div className="mt-3 space-y-1">
        <div className="text-xs text-slate-500 flex items-start gap-1">
          <span className="font-medium min-w-[80px]">共识计算说明:</span>
          <span>
            1. 历史月份：直接采用历史实际销量；
            2. 未来月份：采用加权平均计算，公式为：多个预测需求平均值 × 60% + 已确认订单 × 40%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastTable;

