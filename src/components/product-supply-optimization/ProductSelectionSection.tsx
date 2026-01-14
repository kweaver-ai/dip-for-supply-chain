import React, { useState } from 'react';
import type { ProductSupplyAnalysis } from '../../types/ontology';
import { Search } from 'lucide-react';

// 只显示这三个有指标模型支持的产品
const SUPPORTED_PRODUCTS = ['T01-000055', 'T01-000167', 'T01-000173'];

interface Props {
  allProducts: ProductSupplyAnalysis[];
  selectedProductId: string | null;
  onProductSelect?: (productId: string) => void;
}

export const ProductSelectionSection: React.FC<Props> = ({ 
  allProducts, 
  selectedProductId, 
  onProductSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 只显示支持的产品（有指标模型配置的）
  const supportedProducts = allProducts
    .filter(p => SUPPORTED_PRODUCTS.includes(p.productId))
    .sort((a, b) => 
      SUPPORTED_PRODUCTS.indexOf(a.productId) - SUPPORTED_PRODUCTS.indexOf(b.productId)
    );

  // Filter products by search query (only within supported products)
  const filteredProducts = searchQuery
    ? supportedProducts.filter(p => 
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : supportedProducts;

  if (allProducts.length === 0 || !onProductSelect) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-slate-700">选择产品:</span>
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索产品名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {filteredProducts.map(product => (
          <button
            key={product.productId}
            onClick={() => onProductSelect(product.productId)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedProductId === product.productId
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {product.productName}
          </button>
        ))}
      </div>
    </div>
  );
};



