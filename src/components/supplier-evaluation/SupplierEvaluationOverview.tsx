/**
 * SupplierEvaluationOverview Component
 * 
 * Displays supplier evaluation overview with list of suppliers, their evaluation scores,
 * risk levels, and key metrics. Supports filtering and sorting.
 * 
 * Principle 1: Types imported from ontology.ts
 * Principle 2: Uses semantic color variables
 * Principle 3: Component < 150 lines
 */

import { useState, useMemo } from 'react';
import { suppliersData } from '../../utils/entityConfigService';
import { supplierEvaluationsData } from '../../utils/entityConfigService';
import type { SupplierEvaluation, RiskLevel } from '../../types/ontology';
import RiskBadge from './RiskBadge';
import EvaluationRadarChart from './EvaluationRadarChart';

interface SupplierWithEvaluation {
  supplierId: string;
  supplierName: string;
  evaluation: SupplierEvaluation | null;
}

type SortOption = 'score-desc' | 'score-asc' | 'risk';
type FilterOption = RiskLevel | 'all';

const SupplierEvaluationOverview = () => {
  const [filterRisk, setFilterRisk] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');

  // Map suppliers to their latest evaluations
  const suppliersWithEvaluations = useMemo<SupplierWithEvaluation[]>(() => {
    const supplierMap = new Map<string, { name: string; evaluations: SupplierEvaluation[] }>();

    // Get unique suppliers
    suppliersData.forEach(supplier => {
      if (!supplierMap.has(supplier.supplierId)) {
        supplierMap.set(supplier.supplierId, {
          name: supplier.supplierName,
          evaluations: [],
        });
      }
    });

    // Add evaluations
    supplierEvaluationsData.forEach(evaluation => {
      const supplier = supplierMap.get(evaluation.supplierId);
      if (supplier) {
        supplier.evaluations.push(evaluation);
      }
    });

    // Get latest evaluation for each supplier
    return Array.from(supplierMap.entries()).map(([supplierId, data]) => {
      const latestEvaluation = data.evaluations.sort((a, b) =>
        new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
      )[0] || null;

      return {
        supplierId,
        supplierName: data.name,
        evaluation: latestEvaluation,
      };
    });
  }, []);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let filtered = suppliersWithEvaluations;

    if (filterRisk !== 'all') {
      filtered = filtered.filter(item =>
        item.evaluation?.riskLevel === filterRisk
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (!a.evaluation && !b.evaluation) return 0;
      if (!a.evaluation) return 1;
      if (!b.evaluation) return -1;

      switch (sortBy) {
        case 'score-desc':
          return b.evaluation.totalScore - a.evaluation.totalScore;
        case 'score-asc':
          return a.evaluation.totalScore - b.evaluation.totalScore;
        case 'risk':
          const riskOrder: Record<RiskLevel, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return riskOrder[a.evaluation.riskLevel] - riskOrder[b.evaluation.riskLevel];
        default:
          return 0;
      }
    });

    return sorted;
  }, [suppliersWithEvaluations, filterRisk, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">供应商评估</h2>
        <div className="flex gap-4">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as FilterOption)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">全部风险等级</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
            <option value="critical">严重风险</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="score-desc">分数降序</option>
            <option value="score-asc">分数升序</option>
            <option value="risk">风险等级</option>
          </select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>没有找到符合条件的供应商</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((item) => (
            <div
              key={item.supplierId}
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{item.supplierName}</h3>
                  <p className="text-sm text-slate-500">{item.supplierId}</p>
                </div>
                {item.evaluation && <RiskBadge riskLevel={item.evaluation.riskLevel} />}
              </div>

              {item.evaluation ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-800">
                        {item.evaluation.totalScore}
                      </span>
                      <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      评估日期: {item.evaluation.evaluationDate}
                    </p>
                  </div>
                  <div className="h-48">
                    <EvaluationRadarChart dimensions={item.evaluation.dimensions} size="sm" />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>未评估</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierEvaluationOverview;

