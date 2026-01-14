import React from 'react';
import type { Product, ProductLifecycleAssessment } from '../../types/ontology';
import { Info } from 'lucide-react';

interface Props {
  product: Product;
  productLifecycleAssessment: ProductLifecycleAssessment | null;
}

export const ProductBasicInfoSection: React.FC<Props> = ({ product, productLifecycleAssessment }) => {
  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Info className="text-slate-600" size={20} />
        产品基本信息
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">产品名称</div>
          <div className="text-base font-bold text-slate-800">{product.productName}</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">产品生命周期</div>
          <div className="text-base font-bold text-slate-800">
            {product.status || '未知'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">业绩及投资回报率</div>
          <div className="text-base font-bold text-slate-800">
            {productLifecycleAssessment?.roi || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};



