import React, { useState } from 'react';
import type { ProductSupplyAnalysis, DemandForecast, Product, ProductLifecycleAssessment } from '../../types/ontology';
import { Package, Sparkles, Search } from 'lucide-react';
import { ProductBasicInfoSection } from './ProductBasicInfoSection';
import { ProductInventoryInfoSection } from './ProductInventoryInfoSection';
import { ProductSuggestedActionsSection } from './ProductSuggestedActionsSection';
import { ProductSupplyMetricsCards } from './ProductSupplyMetricsCards';
import { ProductDemandForecastCard } from './ProductDemandForecastCard';
import { ProductSelectionSection } from './ProductSelectionSection';


interface Props {
  analysis: ProductSupplyAnalysis | null;
  loading?: boolean;
  allProducts?: ProductSupplyAnalysis[];
  selectedProductId?: string | null;
  onProductSelect?: (productId: string) => void;
  demandForecasts?: Map<string, DemandForecast>;
  product?: Product | null;
  productLifecycleAssessment?: ProductLifecycleAssessment | null;
}

export const ProductSupplyAnalysisPanel: React.FC<Props> = ({
  analysis,
  loading = false,
  allProducts = [],
  selectedProductId = null,
  onProductSelect,
  demandForecasts = new Map(),
  product = null,
  productLifecycleAssessment = null
}) => {

  // AI suggestions
  const aiSuggestions = [
    '建议优先关注库存量前3的产品，及时调整供应策略',
    '根据需求预测，建议提前准备高需求产品的原材料',
  ];
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-slate-100 rounded-lg p-4">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">产品供应分析</h2>
        <div className="text-center py-8 text-slate-500">
          <Package className="mx-auto mb-2 text-slate-400" size={48} />
          <p>暂无数据</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* AI Suggestions Section */}
      {allProducts.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            AI 建议
          </h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {aiSuggestions.map((suggestion, i) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Product Selection */}
      <ProductSelectionSection
        allProducts={allProducts}
        selectedProductId={selectedProductId}
        onProductSelect={onProductSelect}
      />

      {/* Panel Header */}
      {analysis && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg flex items-center justify-center">
              <Package className="text-indigo-600" size={20} />
            </div>
            产品供应分析
          </h2>
          <div className="text-xs text-slate-500">
            更新时间: {new Date(analysis.lastUpdated).toLocaleString('zh-CN')}
          </div>
        </div>
      )}

      {/* Product Name Display (FR-001.1) */}
      {analysis && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">{analysis.productName}</h3>
        </div>
      )}

      {/* Product Supply Metrics Cards */}
      {analysis && <ProductSupplyMetricsCards analysis={analysis} />}

      {/* Product Basic Information Section (FR-001.2) */}
      {analysis && product && (
        <ProductBasicInfoSection
          product={product}
          productLifecycleAssessment={productLifecycleAssessment || null}
        />
      )}

      {/* Product Inventory Information Section (FR-001.3) */}
      {analysis && product && selectedProductId && (
        <ProductInventoryInfoSection
          product={product}
          productId={selectedProductId}
        />
      )}

      {/* Product Suggested Actions Section (FR-001.4, FR-001.5) */}
      {analysis && product && selectedProductId && (
        <ProductSuggestedActionsSection
          product={product}
          productId={selectedProductId}
        />
      )}


      {/* Demand Forecast Cards - Show 3 different models for selected product only */}
      {selectedProductId && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">需求预测</h3>
          {(() => {
            const productForecasts = Array.from(demandForecasts.values())
              .filter(forecast => forecast.productId === selectedProductId);

            return demandForecasts.size > 0 && productForecasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productForecasts.slice(0, 3).map((forecast, index) => (
                  <ProductDemandForecastCard
                    key={`${forecast.productId}-${forecast.calculationMethod}-${index}`}
                    forecast={forecast}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">暂无历史销售数据</h4>
                    <p className="text-sm text-amber-700">
                      该产品暂无历史销售记录，无法生成需求预测。建议累积至少6个月的销售数据后再进行需求预测分析。
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}


    </div >
  );
};

