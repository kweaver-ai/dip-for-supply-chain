import React from 'react';
import type { ProductSupplyAnalysis } from '../../types/ontology';
import { Package, Truck, TrendingUp, AlertTriangle } from 'lucide-react';
import { productsData } from '../../utils/entityConfigService';
import { ProductOrderCountCard } from './ProductOrderCountCard';
import { ProductInventoryCard } from './ProductInventoryCard';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface Props {
  analysis: ProductSupplyAnalysis;
}

export const ProductSupplyMetricsCards: React.FC<Props> = ({ analysis }) => {
  const riskColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-200 text-red-800 border-red-300',
  };

  const riskLabels = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };

  const product = productsData.find(p => p.productId === analysis.productId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {/* New Dynamic Order Count Card - Only renders in API mode for specific products */}
      <div className="md:col-span-1">
        <ErrorBoundary name="OrderCountCard">
          <ProductOrderCountCard productId={analysis.productId} />
        </ErrorBoundary>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-100 hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-blue-500/10 rounded flex items-center justify-center">
            <Package className="text-blue-600" size={16} />
          </div>
          <div className="text-xs text-slate-600">供应商数量</div>
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-slate-800">{analysis.supplierCount}</div>
          <div className="text-xs text-slate-500">家</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-100 hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-emerald-500/10 rounded flex items-center justify-center">
            <Truck className="text-emerald-600" size={16} />
          </div>
          <div className="text-xs text-slate-600">平均交货周期</div>
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-slate-800">{analysis.averageDeliveryCycle}</div>
          <div className="text-xs text-slate-500">天</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-3 border border-purple-100 hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-purple-500/10 rounded flex items-center justify-center">
            <TrendingUp className="text-purple-600" size={16} />
          </div>
          <div className="text-xs text-slate-600">供货稳定性</div>
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-slate-800">{analysis.supplyStabilityScore}</div>
          <div className="text-xs text-slate-500">分</div>
        </div>
      </div>
      <div className="md:col-span-1">
        <ProductInventoryCard
          productId={analysis.productId}
          defaultInventory={analysis.currentInventoryLevel}
          unit={product?.stockUnit}
        />
      </div>
      <div className={`bg-gradient-to-br rounded-lg p-3 border hover:shadow-md transition-all ${analysis.stockoutRiskLevel === 'critical' ? 'from-red-50 to-red-100/50 border-red-200' :
        analysis.stockoutRiskLevel === 'high' ? 'from-red-50 to-red-100/50 border-red-100' :
          analysis.stockoutRiskLevel === 'medium' ? 'from-amber-50 to-amber-100/50 border-amber-100' :
            'from-emerald-50 to-emerald-100/50 border-emerald-100'
        }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded flex items-center justify-center ${analysis.stockoutRiskLevel === 'critical' ? 'bg-red-500/10' :
            analysis.stockoutRiskLevel === 'high' ? 'bg-red-500/10' :
              analysis.stockoutRiskLevel === 'medium' ? 'bg-amber-500/10' :
                'bg-emerald-500/10'
            }`}>
            <AlertTriangle className={
              analysis.stockoutRiskLevel === 'critical' || analysis.stockoutRiskLevel === 'high' ? 'text-red-600' :
                analysis.stockoutRiskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600'
            } size={16} />
          </div>
          <div className="text-xs text-slate-600">缺货风险</div>
        </div>
        <div className={`text-sm font-bold px-2 py-1 rounded border inline-block ${riskColors[analysis.stockoutRiskLevel]}`}>
          {riskLabels[analysis.stockoutRiskLevel]}
        </div>
      </div>
    </div>
  );
};

