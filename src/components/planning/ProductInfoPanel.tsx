/**
 * Product Info Panel Component
 * 
 * 产品信息面板组件，显示产品的关键信息指标
 */

import { BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  inventory: number;
  safetyStock: number;
  monthlyCapacity: number;
  orderQuantity: number;
  plannedQuantity: number;
}

interface InventoryStatus {
  totalAvailable: number;
  isSufficient: boolean;
  needsProduction: boolean;
}

interface ProductInfoPanelProps {
  product: Product;
  inventoryStatus: InventoryStatus;
}

export const ProductInfoPanel = ({ product, inventoryStatus }: ProductInfoPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <BarChart3 className="text-indigo-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">产品信息</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">生产计划量</div>
          <div className="text-2xl font-bold text-indigo-600">{product.plannedQuantity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">未来3个月共识需求</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">库存量</div>
          <div className="text-2xl font-bold text-slate-800">{product.inventory.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">当前库存</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">安全库存</div>
          <div className="text-2xl font-bold text-slate-800">{product.safetyStock.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">最低安全库存</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">月度产能</div>
          <div className="text-2xl font-bold text-blue-600">{product.monthlyCapacity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">每月可生产量</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">在手订单量</div>
          <div className="text-2xl font-bold text-orange-600">{product.orderQuantity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">已下单未交付</div>
        </div>
      </div>

      {/* 库存状态提示 */}
      <div className="mt-4 p-4 rounded-lg" style={{
        backgroundColor: inventoryStatus.isSufficient ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${inventoryStatus.isSufficient ? '#86efac' : '#fca5a5'}`
      }}>
        <div className="flex items-center gap-2">
          {inventoryStatus.isSufficient ? (
            <>
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-800">
                库存充足：在手订单量({product.orderQuantity}) {'<'} 生产计划量({product.plannedQuantity}) + 库存量({product.inventory})，继续下单可直接供应
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="text-red-600" size={20} />
              <span className="text-sm font-medium text-red-800">
                库存不足：在手订单量({product.orderQuantity}) {'≥'} 生产计划量({product.plannedQuantity}) + 库存量({product.inventory})，需要增加生产计划
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
