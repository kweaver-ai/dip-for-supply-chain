/**
 * MPS (Master Production Schedule) Prototype Component - Refactored
 * 
 * 重构后的MPS组件，完全使用React Query和Ontology API
 * 符合Constitution Principle 1（数据模型与API合规性）
 * 
 * 核心功能：
 * 1. 产品列表选择
 * 2. 显示产品生产计划量、库存量、安全库存、在手订单量
 * 3. 显示产品BOM甘特图
 * 4. 计算产品出货周期
 * 5. 给出风险提示
 */

import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import type { GanttTask, RiskAlert, BOMItem, Product as OntologyProduct } from '../../types/ontology';
import { buildBOMTree } from '../../utils/ganttUtils';
import { ProductSelector } from './ProductSelector';
import { ProductInfoPanel } from './ProductInfoPanel';
import { RiskAlertsPanel } from './RiskAlertsPanel';
import { GanttChartSection } from './GanttChartSection';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';
import { EmptyState } from '../common/EmptyState';

// 使用新的React Query服务
import { useProducts } from '../../services/product.service';
import { useBOMByParent, buildBOMTree as buildBOMTreeFromAPI } from '../../services/productBOM.service';
import { useInventoryByMaterialCode } from '../../services/inventory.service';
import { useSalesOrdersByProduct, calculateInHandOrders } from '../../services/salesOrder.service';
import { useProductionPlansByProduct, calculateTotalPlannedQuantity } from '../../services/productionPlan.service';

// ============================================================================
// 类型定义
// ============================================================================

/** 扩展的产品信息（用于MPS显示） */
interface MPSProduct {
  id: string;
  name: string;
  /** 库存量 */
  inventory: number;
  /** 安全库存量 */
  safetyStock: number;
  /** 月度生产产能 */
  monthlyCapacity: number;
  /** 在手订单量 */
  orderQuantity: number;
  /** 生产计划量 */
  plannedQuantity: number;
  /** BOM结构 */
  bom: BOMItem[];
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 计算产品出货周期
 * 返回树形结构的GanttTask（包含children）
 */
function calculateDeliveryCycle(product: MPSProduct, plannedQuantity: number): {
  totalCycle: number;
  tasks: GanttTask[];
  risks: RiskAlert[];
} {
  const risks: RiskAlert[] = [];
  let currentDate = new Date();
  const productTaskId = `product-${product.id}`;

  // 创建产品任务
  const productTask: GanttTask = {
    id: productTaskId,
    name: product.name,
    type: 'product',
    level: 0,
    startDate: new Date(currentDate),
    endDate: new Date(currentDate),
    duration: 0,
    status: 'normal'
  };

  // 递归处理BOM并收集风险
  function processBOMItemForRisks(
    item: BOMItem,
    level: number
  ): void {
    const requiredQuantity = plannedQuantity * item.quantityPerSet;

    if (item.type === 'material') {
      // 物料：检查库存风险
      const deliveryCycle = item.deliveryCycle || 0;
      if (item.inventory < requiredQuantity) {
        risks.push({
          type: 'material_delay',
          level: item.inventory === 0 ? 'critical' : 'warning',
          message: `物料 ${item.name} 库存不足，需要采购，到货周期 ${deliveryCycle} 天`,
          itemId: item.id,
          itemName: item.name,
          aiSuggestion: item.inventory === 0 
            ? `建议立即启动采购流程，考虑寻找替代供应商以缩短到货周期。当前库存为0，将严重影响生产计划。`
            : `建议提前采购，当前库存(${item.inventory})不足以满足需求(${requiredQuantity})，建议考虑批量采购以降低成本。`
        });
      }
    } else {
      // 模块或组件：检查产能和库存风险
      if (item.capacityLimit && plannedQuantity > item.capacityLimit) {
        risks.push({
          type: 'capacity_shortage',
          level: 'warning',
          message: `${item.name} 产能限制为 ${item.capacityLimit}，计划量 ${plannedQuantity} 超出产能`,
          itemId: item.id,
          itemName: item.name,
          aiSuggestion: `建议提前安排生产计划，或考虑增加产能投入。当前产能(${item.capacityLimit})无法满足计划量(${plannedQuantity})，可能需要分批生产或寻找外协供应商。`
        });
      }

      if (item.inventory < requiredQuantity && (!item.producible || item.producible === 0)) {
        risks.push({
          type: 'inventory_low',
          level: item.inventory === 0 ? 'critical' : 'warning',
          message: `${item.name} 库存不足，需要生产`,
          itemId: item.id,
          itemName: item.name,
          aiSuggestion: item.inventory === 0
            ? `建议立即启动生产计划，当前库存为0，将严重影响后续生产。考虑优先生产此组件以确保供应链连续性。`
            : `建议增加生产计划，当前库存(${item.inventory})不足以满足需求(${requiredQuantity})，建议提前生产以避免缺料。`
        });
      }

      // 递归处理子项
      if (item.children && item.children.length > 0) {
        item.children.forEach((child: BOMItem) => {
          processBOMItemForRisks(child, level + 1);
        });
      }
    }
  }

  // 收集所有风险
  product.bom.forEach(bomItem => {
    processBOMItemForRisks(bomItem, 1);
  });

  // 使用buildBOMTree构建树形结构
  const rootTask = buildBOMTree(product.bom, productTask, plannedQuantity, currentDate);

  return {
    totalCycle: rootTask.duration,
    tasks: [rootTask],
    risks
  };
}

// ============================================================================
// 主组件
// ============================================================================

const MPSPrototypeRefactored = () => {
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // ========== Step 1: 加载产品列表 ==========
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useProducts();

  const products = productsData?.data ?? [];

  // 自动选择第一个产品
  if (products.length > 0 && !selectedProductCode) {
    setSelectedProductCode(products[0].product_code);
  }

  // ========== Step 2: 加载选中产品的详细数据 ==========
  const selectedProduct = products.find(p => p.product_code === selectedProductCode) || null;

  // 加载BOM数据
  const {
    data: bomData,
    isLoading: bomLoading,
    error: bomError,
    refetch: refetchBOM
  } = useBOMByParent(selectedProductCode, !!selectedProductCode);

  // 加载库存数据
  const {
    data: inventoryData,
    isLoading: inventoryLoading
  } = useInventoryByMaterialCode(selectedProductCode, !!selectedProductCode);

  // 加载销售订单数据
  const {
    data: ordersData,
    isLoading: ordersLoading
  } = useSalesOrdersByProduct(selectedProductCode, !!selectedProductCode);

  // 加载生产计划数据
  const {
    data: productionPlansData,
    isLoading: productionPlansLoading
  } = useProductionPlansByProduct(selectedProductCode, !!selectedProductCode);

  // ========== Step 3: 聚合数据 ==========
  const mpsProduct = useMemo((): MPSProduct | null => {
    if (!selectedProduct) return null;

    const inventory = inventoryData?.inventory_data ?? 0;
    const safetyStock = inventoryData?.safety_stock ?? 0;
    const orderQuantity = ordersData?.data ? calculateInHandOrders(ordersData.data, selectedProductCode) : 0;
    const plannedQuantity = productionPlansData?.data ? calculateTotalPlannedQuantity(productionPlansData.data, selectedProductCode) : 0;

    // TODO: 从BOM API数据构建BOM树
    // 当前先使用空数组，待实现BOM树转换逻辑
    const bom: BOMItem[] = [];

    return {
      id: selectedProduct.product_code,
      name: selectedProduct.product_name,
      inventory,
      safetyStock,
      monthlyCapacity: 0, // TODO: 从何处获取？
      orderQuantity,
      plannedQuantity,
      bom
    };
  }, [selectedProduct, inventoryData, ordersData, productionPlansData, selectedProductCode]);

  // ========== Step 4: 计算甘特图和风险 ==========
  const { totalCycle, tasks, risks } = useMemo(() => {
    if (!mpsProduct) {
      return { totalCycle: 0, tasks: [], risks: [] };
    }
    try {
      return calculateDeliveryCycle(mpsProduct, mpsProduct.plannedQuantity);
    } catch (error) {
      console.error('Error calculating delivery cycle:', error);
      return { totalCycle: 0, tasks: [], risks: [] };
    }
  }, [mpsProduct]);

  // 计算库存状态
  const inventoryStatus = useMemo(() => {
    if (!mpsProduct) {
      return {
        totalAvailable: 0,
        isSufficient: false,
        needsProduction: true
      };
    }
    const totalAvailable = mpsProduct.plannedQuantity + mpsProduct.inventory;
    const isSufficient = mpsProduct.orderQuantity < totalAvailable;
    return {
      totalAvailable,
      isSufficient,
      needsProduction: !isSufficient
    };
  }, [mpsProduct]);

  // ========== 渲染逻辑 ==========

  // 产品列表加载中
  if (productsLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner message="正在加载产品列表..." size="large" fullScreen />
      </div>
    );
  }

  // 产品列表加载失败
  if (productsError) {
    return (
      <div className="space-y-6">
        <ErrorDisplay 
          error={productsError} 
          onRetry={refetchProducts}
          fullScreen
        />
      </div>
    );
  }

  // 无产品数据
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="database"
          title="暂无产品数据"
          description="数据服务不可用，请联系管理员"
        />
      </div>
    );
  }

  // 未选择产品
  if (!selectedProductCode) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Package className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
          </div>
          <div className="mt-4">
            <select
              value=""
              onChange={(e) => setSelectedProductCode(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择产品</option>
              {products.map(product => (
                <option key={product.product_code} value={product.product_code}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <EmptyState
          icon="package"
          title="请选择产品"
          description="选择产品以查看生产计划和BOM甘特图"
        />
      </div>
    );
  }

  // BOM数据加载中
  const isLoadingDetails = bomLoading || inventoryLoading || ordersLoading || productionPlansLoading;
  if (isLoadingDetails) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Package className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
          </div>
          <div className="mt-4">
            <select
              value={selectedProductCode}
              onChange={(e) => setSelectedProductCode(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {products.map(product => (
                <option key={product.product_code} value={product.product_code}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <LoadingSpinner message="正在加载产品详细数据..." size="medium" />
      </div>
    );
  }

  // BOM数据加载失败
  if (bomError) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Package className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
          </div>
          <div className="mt-4">
            <select
              value={selectedProductCode}
              onChange={(e) => setSelectedProductCode(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {products.map(product => (
                <option key={product.product_code} value={product.product_code}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ErrorDisplay 
          error={bomError} 
          onRetry={refetchBOM}
        />
      </div>
    );
  }

  // 正常显示
  if (!mpsProduct) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="产品数据不完整"
          description="无法加载选中产品的完整数据"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 产品选择器 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Package className="text-indigo-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-800">产品选择</h2>
        </div>
        <div className="mt-4">
          <select
            value={selectedProductCode}
            onChange={(e) => setSelectedProductCode(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {products.map(product => (
              <option key={product.product_code} value={product.product_code}>
                {product.product_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 产品信息面板 */}
      <ProductInfoPanel
        product={mpsProduct}
        inventoryStatus={inventoryStatus}
      />

      {/* 甘特图 */}
      <GanttChartSection
        tasks={tasks}
        totalCycle={totalCycle}
        hoveredTask={hoveredTask}
        tooltipPosition={tooltipPosition}
        onTaskHover={(task, position) => {
          setHoveredTask(task);
          setTooltipPosition(position);
        }}
        onTaskLeave={() => {
          setHoveredTask(null);
          setTooltipPosition(null);
        }}
      />

      {/* 风险提示 */}
      <RiskAlertsPanel risks={risks} />
    </div>
  );
};

export default MPSPrototypeRefactored;
