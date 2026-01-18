/**
 * Product Info Panel Component
 *
 * 产品信息面板组件，显示产品的关键信息指标
 *
 * 修改说明：
 * 1. 移除月度产能卡片
 * 2. 生产计划量卡片显示：计划数量、计划开始时间、结束时间
 * 3. 在手订单量 = 累计签约数量 - 累计发货数量
 */

import { BarChart3, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  inventory: number;
  safetyStock: number;
  orderQuantity: number;       // 在手订单量（累计签约数量 - 累计发货数量）
  plannedQuantity: number;     // 生产计划量
  planStartTime?: string;      // 计划开始时间
  planEndTime?: string;        // 计划结束时间
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

/**
 * 格式化日期为 MM/DD 格式
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

export const ProductInfoPanel = ({ product, inventoryStatus }: ProductInfoPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <BarChart3 className="text-indigo-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">产品信息</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 生产计划量卡片：显示计划数量、开始时间、结束时间 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">生产计划量</div>
          <div className="text-2xl font-bold text-indigo-600">{product.plannedQuantity.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(product.planStartTime)} ~ {formatDate(product.planEndTime)}</span>
          </div>
        </div>
        {/* 库存量卡片 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">库存量</div>
          <div className="text-2xl font-bold text-slate-800">{product.inventory.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">当前库存</div>
        </div>
        {/* 安全库存卡片 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">安全库存</div>
          <div className="text-2xl font-bold text-slate-800">{product.safetyStock.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">最低安全库存</div>
        </div>
        {/* 在手订单量卡片：累计签约数量 - 累计发货数量 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600 mb-1">在手订单量</div>
          <div className="text-2xl font-bold text-orange-600">{product.orderQuantity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">签约数量 - 发货数量</div>
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
