/**
 * Product Selector Component
 * 
 * 产品选择器组件，用于选择要查看的产品
 * 支持两种模式：
 * 1. MPS模式：外部传入products数组
 * 2. DemandPlanning模式：内部从API加载products（通过demandPlanningService）
 */

import { useState, useEffect } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import type { ProductOption } from '../../types/ontology';
import { demandPlanningService } from '../../services/demandPlanningService';

interface Product {
  id: string;
  name: string;
}

// MPS模式Props（外部传入products）
interface MPSProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductChange: (productId: string) => void;
  dataSource?: 'api' | 'fallback';
  error?: string | null;
}

// DemandPlanning模式Props（内部加载products）
interface DemandPlanningProductSelectorProps {
  selectedProductId: string | null;
  onSelectionChange: (productId: string | null) => void;
  loading?: boolean;
}

// 联合类型
type ProductSelectorProps = MPSProductSelectorProps | DemandPlanningProductSelectorProps;

// 类型守卫：判断是否为MPS模式
function isMPSMode(props: ProductSelectorProps): props is MPSProductSelectorProps {
  return 'products' in props && 'onProductChange' in props;
}

const ProductSelectorComponent = (props: ProductSelectorProps) => {
  // MPS模式：使用外部传入的products
  if (isMPSMode(props)) {
    const { products, selectedProductId, onProductChange, dataSource = 'api', error } = props;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Package className="text-indigo-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
        </div>
        <div className="mt-4">
          <select
            value={selectedProductId}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {/* 显示数据源提示 */}
          {dataSource === 'fallback' && error && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    加载后端数据失败，当前显示模拟数据
                  </p>
                  {error && (
                    <p className="text-xs text-yellow-700 mt-1">
                      错误信息: {error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DemandPlanning模式：内部加载products
  const { selectedProductId, onSelectionChange, loading = false } = props;
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(true);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setInternalLoading(true);
        setInternalError(null);
        const productList = await demandPlanningService.getProductList();
        setProducts(productList);
        
        // 如果产品列表加载成功且当前没有选中产品，自动选择第一个产品
        if (productList.length > 0 && !selectedProductId && onSelectionChange) {
          console.log('[ProductSelector] 自动选择第一个产品:', productList[0].id);
          onSelectionChange(productList[0].id);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMsg = err instanceof Error ? err.message : '加载后端数据失败';
        setInternalError(errorMsg);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次，selectedProductId和onSelectionChange不需要作为依赖

  const isLoading = loading || internalLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        <Package className="text-indigo-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
      </div>
      <div className="mt-4">
      <select
        value={selectedProductId || ''}
          onChange={(e) => onSelectionChange(e.target.value || null)}
        disabled={isLoading}
          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            isLoading ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
      >
        <option value="">请选择产品</option>
          {products.map(product => (
          <option key={product.id} value={product.id}>
              {product.displayName || product.id}
          </option>
        ))}
      </select>
      {isLoading && (
          <p className="text-xs text-slate-500 mt-2">正在加载产品列表...</p>
      )}
      {/* 显示错误提示 */}
      {internalError && !isLoading && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                加载后端数据失败，当前显示模拟数据
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                错误信息: {internalError}
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
    </div>
  );
};

// 命名导出（用于MPS）
export const ProductSelector = ProductSelectorComponent;

// 默认导出（用于DemandPlanning）
export default ProductSelectorComponent;
