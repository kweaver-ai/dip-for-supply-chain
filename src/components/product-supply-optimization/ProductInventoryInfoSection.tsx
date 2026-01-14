import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/ontology';
import { ShoppingCart } from 'lucide-react';
import { getPendingOrderQuantity } from '../../services/productSupplyService';

interface Props {
  product: Product;
  productId: string;
}

export const ProductInventoryInfoSection: React.FC<Props> = ({ product, productId }) => {
  const [pendingOrderQuantity, setPendingOrderQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`ProductInventoryInfoSection mounted for product: ${productId}`);
    const loadOrderQuantity = async () => {
      setLoading(true);
      try {
        console.log(`Calling getPendingOrderQuantity for ${productId}`);
        const quantity = await getPendingOrderQuantity(productId);
        console.log(`Received order quantity for ${productId}: ${quantity}`);
        setPendingOrderQuantity(quantity);
      } catch (error) {
        console.error(`Error loading order quantity for ${productId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    loadOrderQuantity();
  }, [productId]);

  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <ShoppingCart className="text-blue-600" size={20} />
        产品库存信息
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-slate-600 mb-1">产品库存数量</div>
          <div className="text-2xl font-bold text-slate-800">
            {(product.stockQuantity || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">{product.stockUnit || '单位'}</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-slate-600 mb-1">订单量</div>
          <div className="text-2xl font-bold text-slate-800">
            {loading ? (
              <div className="animate-pulse h-8 bg-slate-200 rounded w-16"></div>
            ) : (
              pendingOrderQuantity.toLocaleString()
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">已确认订单</div>
        </div>
      </div>
    </div>
  );
};



