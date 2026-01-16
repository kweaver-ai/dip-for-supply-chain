/**
 * MPS (Master Production Schedule) Prototype Component
 * 
 * 生产计划MPS原型设计，核心功能：
 * 1. 产品列表可选择，默认选择第一个产品
 * 2. 显示产品的生产计划量（来自需求计划的产品共识需求，未来3个月未完成的）
 * 3. 显示产品的库存量、安全库存量、月度产品生产产能、在手订单量
 * 4. 显示该产品当前生产计划的甘特图（按BOM展开）
 * 5. 计算产品合计出货周期
 * 6. 给出产品出货时间的风险提示
 */

import { useState, useMemo, useEffect } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import type { BOMItem, GanttTask, RiskAlert, ProductionPlanMode, MaterialReadyGanttTask, MaterialReadyCalculationResult } from '../../types/ontology';
// TODO: buildBOMTree函数需要重构以匹配BOMItem接口，将在User Story 1中实现
// import { buildBOMTree } from '../../utils/ganttUtils';
import { fetchBOMData, fetchProductList, buildPlanInfo, fetchMaterialReadyV2Data } from '../../services/mpsDataService';
import { calculateMaterialReadyModeV2 } from '../../utils/materialReadyCalculatorV2';
import { ProductSelector } from './ProductSelector';
import { ProductInfoPanel } from './ProductInfoPanel';
import { GanttChartSection } from './GanttChartSection';
import { PlanModeSelector } from './PlanModeSelector';
import { GanttHeader } from './GanttHeader';
import { monitorLoadTime, monitorCalculationTime } from '../../utils/mpsPerformanceMonitor';
// ============================================================================
// 类型定义（使用ontology.ts中的类型）
// ============================================================================

/** 产品信息（与MPSProduct兼容） */
interface Product {
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
  /** 生产计划量（未来3个月共识需求） */
  plannedQuantity: number;
  /** BOM结构 */
  bom: BOMItem[];
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 计算产品出货周期
 * 产品合计出货周期 = 各物料到货时间（组件的物料齐套才能加工）顺序叠加 + 组件加工时间
 * 返回树形结构的GanttTask（包含children）
 *
 * 时间默认值：
 * - 物料到货周期：5天
 * - 组件/模块加工时间：6天
 */
function calculateDeliveryCycle(product: Product, plannedQuantity: number): {
  totalCycle: number;
  tasks: GanttTask[];
  risks: RiskAlert[];
} {
  const risks: RiskAlert[] = [];
  const currentDate = new Date();

  // 常量：默认时间
  const MATERIAL_DELIVERY_DAYS = 5; // 物料到货周期
  const COMPONENT_PROCESSING_DAYS = 6; // 组件/模块加工时间

  /**
   * 检查替代物料可用性（FR-031）
   * @param bomList 完整BOM列表
   * @param itemCode 物料编码
   * @param alternativeGroup 替代组号
   * @param requiredQuantity 所需数量
   * @returns 可用的替代物料列表
   */
  function checkAlternativeMaterials(
    bomList: BOMItem[],
    itemCode: string,
    alternativeGroup: number | null | undefined,
    requiredQuantity: number
  ): Array<{ code: string; name: string; inventory: number; available: boolean }> {
    if (!alternativeGroup) {
      return [];
    }

    // 查找同组替代物料（alternative_part = "替代"）
    const alternatives = bomList.filter(
      (item) =>
        item.alternative_group === alternativeGroup &&
        item.alternative_part === '替代' &&
        item.child_code !== itemCode
    );

    // FR-033: 使用 child_code-child_name 格式
    return alternatives.map((alt) => ({
      code: alt.child_code,
      name: `${alt.child_code}-${alt.child_name}`,
      inventory: alt.inventory ?? 0,
      available: (alt.inventory ?? 0) >= requiredQuantity,
    }));
  }

  /**
   * 从BOM扁平列表构建树形结构
   * @param bomList 扁平BOM列表
   * @param parentCode 父节点编码
   * @returns 子节点列表
   */
  function buildChildren(bomList: BOMItem[], parentCode: string, level: number = 0): BOMItem[] {
    const indent = '  '.repeat(level);
    const directChildren = bomList.filter(item => item.parent_code === parentCode);

    console.log(`${indent}[buildChildren] level=${level}, parentCode=${parentCode}, 找到${directChildren.length}个直接子项`);

    if (directChildren.length > 0 && level < 3) {
      console.log(`${indent}[buildChildren] 子项列表:`, directChildren.map(c => `${c.child_code}(${c.child_name})`).join(', '));
    }

    return directChildren.map(item => ({
      ...item,
      children: buildChildren(bomList, item.child_code, level + 1)
    }));
  }

  /**
   * 递归构建GanttTask树，并计算时间
   * @param item BOM项
   * @param level 层级（0=产品）
   * @param parentStartDate 父级开始日期（用于计算物料采购启动时间）
   * @returns GanttTask及其最晚结束日期
   */
  function buildGanttTaskTree(
    item: BOMItem | { child_code: string; child_name: string; children: BOMItem[] },
    level: number,
    parentStartDate: Date
  ): { task: GanttTask; maxEndDate: Date } {
    const children: GanttTask[] = [];

    // 判断是否有子项
    const hasChildren = item.children && item.children.length > 0;
    const isLeaf = !hasChildren;

    // 确定类型：product / module|component / material
    let taskType: 'product' | 'module' | 'component' | 'material';
    if (level === 0) {
      taskType = 'product';
    } else if (isLeaf) {
      taskType = 'material';
    } else {
      // 有子项的是组件或模块，这里统一为component
      taskType = level === 1 ? 'module' : 'component';
    }

    let itemStartDate: Date;
    let maxEndDate: Date;

    // 如果有子项，递归处理
    if (hasChildren) {
      // 组件/模块：先获取所有子项的最晚结束时间
      let childrenMaxEndDate = new Date(parentStartDate);

      // FR-032: 过滤掉 alternative_part = "替代" 的所有物料
      const filteredChildren = item.children!.filter(
        (child) => child.alternative_part !== '替代'
      );

      for (const child of filteredChildren) {
        const { task: childTask, maxEndDate: childEndDate } = buildGanttTaskTree(
          child,
          level + 1,
          parentStartDate
        );
        children.push(childTask);

        // 更新子项的最晚结束日期
        if (childEndDate > childrenMaxEndDate) {
          childrenMaxEndDate = childEndDate;
        }
      }

      // 组件/模块的开始日期 = 子项齐套日期（即最晚子项结束日期）
      itemStartDate = new Date(childrenMaxEndDate);

      // 组件/模块的结束日期 = 开始日期 + 加工时间
      maxEndDate = new Date(itemStartDate);
      maxEndDate.setDate(maxEndDate.getDate() + COMPONENT_PROCESSING_DAYS);
    } else {
      // 叶子节点（物料）：从父级开始日期开始采购
      itemStartDate = new Date(parentStartDate);

      // 物料的结束日期 = 开始日期 + 到货周期
      maxEndDate = new Date(itemStartDate);
      maxEndDate.setDate(maxEndDate.getDate() + MATERIAL_DELIVERY_DAYS);
    }

    // 计算持续时间
    const duration = Math.ceil(
      (maxEndDate.getTime() - itemStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 检查风险并收集
    const itemCode = 'child_code' in item ? item.child_code : product.id;
    const itemNameRaw = 'child_name' in item ? item.child_name : product.name;
    // FR-033: 使用 child_code-child_name 格式
    const itemName = 'child_code' in item 
      ? `${itemCode}-${itemNameRaw}` 
      : `${product.id}-${product.name}`;
    const quantity = 'quantity' in item ? item.quantity ?? 1 : 1;
    const requiredQuantity = plannedQuantity * quantity;
    const inventory = 'inventory' in item ? item.inventory ?? 0 : 0;
    const alternativePart = 'alternative_part' in item ? item.alternative_part : null;
    const alternativeGroup = 'alternative_group' in item ? item.alternative_group : null;

    // FR-031: 对于 alternative_part = "替代" 的物料，不显示风险提示和AI建议
    if (alternativePart === '替代') {
      // 跳过替代物料的风险检查
      // 创建GanttTask但不生成风险提示
    } else {
      // 简化风险检查：仅检查物料库存（仅对默认物料）
      if (isLeaf && inventory < requiredQuantity) {
        // FR-031: 检查替代物料可用性
        const alternativeMaterials = checkAlternativeMaterials(
          product.bom,
          itemCode,
          alternativeGroup,
          requiredQuantity
        );

        // 查找可用的替代物料
        const availableAlternatives = alternativeMaterials.filter((alt) => alt.available);

        let aiSuggestion: string;
        if (availableAlternatives.length > 0) {
          // 有可用的替代物料
          const altNames = availableAlternatives.map((alt) => alt.name).join('、');
          aiSuggestion = `建议使用替代物料：${altNames}。当前库存(${inventory})不足以满足需求(${requiredQuantity})，但替代物料可用，可以满足生产要求。`;
        } else if (alternativeMaterials.length > 0) {
          // 有替代物料但都不可用
          const altNames = alternativeMaterials.map((alt) => alt.name).join('、');
          aiSuggestion = `当前库存(${inventory})不足以满足需求(${requiredQuantity})，已检查替代物料（${altNames}），但库存均不足。建议立即启动采购流程。`;
        } else {
          // 没有替代物料
          aiSuggestion =
            inventory === 0
              ? `建议立即启动采购流程，考虑寻找替代供应商以缩短到货周期。当前库存为0，将严重影响生产计划。`
              : `建议提前采购，当前库存(${inventory})不足以满足需求(${requiredQuantity})，建议考虑批量采购以降低成本。`;
        }

        risks.push({
          type: 'material_delay',
          level: inventory === 0 ? 'critical' : 'warning',
          message: `物料 ${itemName} 库存不足，需要采购，到货周期 ${MATERIAL_DELIVERY_DAYS} 天`,
          itemId: itemCode,
          itemName: itemName,
          aiSuggestion,
        });
      }
    }

    // 创建GanttTask
    const task: GanttTask = {
      id: `${level}-${itemCode}`,
      name: itemName,
      type: taskType,
      level: level,
      startDate: itemStartDate,
      endDate: maxEndDate,
      duration: duration,
      status: 'normal',
      children: children.length > 0 ? children : undefined
    };

    // 调试日志：输出任务时间信息
    const indent = '  '.repeat(level);
    console.log(`${indent}[buildGanttTaskTree] ${taskType} "${itemName}":`, {
      startDate: itemStartDate.toLocaleDateString('zh-CN'),
      endDate: maxEndDate.toLocaleDateString('zh-CN'),
      duration: duration,
      hasChildren: hasChildren,
      childrenCount: children.length
    });

    return { task, maxEndDate };
  }

  // 调试日志：打印BOM数据
  console.log(`[calculateDeliveryCycle] ========== 开始构建BOM树 ==========`);
  console.log(`[calculateDeliveryCycle] 产品ID: ${product.id}`);
  console.log(`[calculateDeliveryCycle] 产品名称: ${product.name}`);
  console.log(`[calculateDeliveryCycle] BOM条目总数: ${product.bom.length}`);

  if (product.bom.length > 0) {
    console.log(`[calculateDeliveryCycle] BOM数据示例（前5条）:`, product.bom.slice(0, 5).map(item => ({
      parent_code: item.parent_code,
      child_code: item.child_code,
      child_name: item.child_name,
      quantity: item.quantity
    })));
  } else {
    console.warn(`[calculateDeliveryCycle] ⚠️ BOM数据为空！`);
  }

  // 从扁平BOM列表构建树形结构
  const bomTree = buildChildren(product.bom, product.id);

  console.log(`[calculateDeliveryCycle] 构建的bomTree节点数: ${bomTree.length}`);
  if (bomTree.length > 0) {
    console.log(`[calculateDeliveryCycle] bomTree示例:`, bomTree.slice(0, 3).map(item => ({
      parent_code: item.parent_code,
      child_code: item.child_code,
      child_name: item.child_name,
      has_children: item.children ? item.children.length : 0
    })));
  } else {
    console.warn(`[calculateDeliveryCycle] ⚠️ bomTree为空！没有找到parent_code=${product.id}的子项`);
  }

  // 创建产品根节点（包含所有子项）
  const productNode = {
    child_code: product.id,
    child_name: product.name,
    children: bomTree
  };

  console.log(`[calculateDeliveryCycle] 产品根节点children数: ${productNode.children.length}`);

  // 构建完整的GanttTask树
  const { task: productTask, maxEndDate } = buildGanttTaskTree(productNode, 0, currentDate);

  console.log(`[calculateDeliveryCycle] 构建的GanttTask:`, {
    id: productTask.id,
    name: productTask.name,
    type: productTask.type,
    level: productTask.level,
    startDate: productTask.startDate.toLocaleDateString('zh-CN'),
    endDate: productTask.endDate.toLocaleDateString('zh-CN'),
    children_count: productTask.children ? productTask.children.length : 0,
    duration: productTask.duration
  });

  // 输出第一层子任务的时间信息
  if (productTask.children && productTask.children.length > 0) {
    console.log(`[calculateDeliveryCycle] 第一层子任务时间（前3个）:`, productTask.children.slice(0, 3).map(child => ({
      name: child.name,
      type: child.type,
      startDate: child.startDate.toLocaleDateString('zh-CN'),
      endDate: child.endDate.toLocaleDateString('zh-CN'),
      duration: child.duration
    })));
  }

  // 计算总周期
  const totalCycle = Math.ceil(
    (maxEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log(`[calculateDeliveryCycle] 总周期: ${totalCycle}天`);
  console.log(`[calculateDeliveryCycle] ========== BOM树构建完成 ==========`);

  return {
    totalCycle,
    tasks: [productTask],
    risks
  };
}

// ============================================================================
// 组件
// ============================================================================

const MPSPrototype = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | MaterialReadyGanttTask | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  // TODO: dataSource and dataSourceError are set but not used in UI - may be used in future features
  const [, setDataSource] = useState<'api' | 'fallback'>('api');
  const [, setDataSourceError] = useState<string | null>(null);

  // 计划模式状态
  const [planMode, setPlanMode] = useState<ProductionPlanMode>('default');

  // 齐套模式V2数据
  const [v2Data, setV2Data] = useState<{
    product: any;
    productionPlan: any;
    bomItems: BOMItem[];
    materialDetails: Map<string, any>;
    inventoryMap: Map<string, number>;
  } | null>(null);
  const [v2Loading, setV2Loading] = useState<boolean>(false);
  const [v2Result, setV2Result] = useState<MaterialReadyCalculationResult | null>(null);

  // 产品列表加载由ProductSelector组件内部处理（使用和DP面板相同的逻辑）

  // 加载选中产品的BOM数据（优先使用API）
  useEffect(() => {
    if (!selectedProductId) {
      console.log(`[MPSPrototype] ⏸️ 未选择产品，跳过BOM数据加载`);
      return;
    }

    const loadProductBOM = async () => {
      const startTime = performance.now();
      setLoadStartTime(startTime);
      
      console.log(`[MPSPrototype] ========== 开始加载产品BOM数据 ==========`);
      console.log(`[MPSPrototype] 产品ID: ${selectedProductId}`);
      console.log(`[MPSPrototype] 重试次数: ${retryCount}`);
      
      try {
        setLoading(true);
        setError(null);
        
        // 优先尝试从API加载BOM数据（根据FR-027规范）
        // 先尝试从API加载BOM数据（添加详细日志）
        console.log(`[MPSPrototype] 从API加载BOM数据...`);
        
        // 1. 获取产品信息
        console.log(`[MPSPrototype] 步骤1: 获取产品信息...`);
        const products = await fetchProductList();
        const productInfo = products.find(p => p.product_code === selectedProductId);
        
        if (!productInfo) {
          throw new Error(`未找到产品: ${selectedProductId}`);
        }
        
        console.log(`[MPSPrototype] ✅ 找到产品: ${productInfo.product_name} (${productInfo.product_code})`);
        
        // 2. 获取BOM数据
        console.log(`[MPSPrototype] 步骤2: 获取BOM数据...`);
        const bomItems = await fetchBOMData(selectedProductId);
        console.log(`[MPSPrototype] ✅ API返回BOM数据，共${bomItems.length}条`);
        
        if (bomItems.length > 0) {
          console.log(`[MPSPrototype] BOM数据示例（前5条）:`, bomItems.slice(0, 5).map(item => ({
            bom_id: item.bom_id,
            parent_code: item.parent_code,
            child_code: item.child_code,
            child_name: item.child_name,
          })));
        } else {
          console.warn(`[MPSPrototype] ⚠️ API返回空BOM数据`);
        }
        
        // 3. 获取计划信息（库存、安全库存、计划数量等）
        console.log(`[MPSPrototype] 步骤3: 获取计划信息（库存、产能等）...`);
        const planInfo = await buildPlanInfo(selectedProductId, productInfo.product_name);
        console.log(`[MPSPrototype] ✅ 计划信息:`, {
          inventory: planInfo.inventoryQuantity,
          safetyStock: planInfo.safetyStock,
          plannedQuantity: planInfo.productionPlanQuantity,
          pendingOrderQuantity: planInfo.pendingOrderQuantity,
        });
        
        // 4. 构建Product对象（FR-014, FR-015: product_code-product_name格式）
        const product: Product = {
          id: selectedProductId,
          name: `${productInfo.product_code}-${productInfo.product_name}`,
          inventory: planInfo.inventoryQuantity,
          safetyStock: planInfo.safetyStock,
          monthlyCapacity: 2500, // 默认值，后续可从API获取
          orderQuantity: planInfo.pendingOrderQuantity,
          plannedQuantity: planInfo.productionPlanQuantity,
          bom: bomItems,
        };
        
        console.log(`[MPSPrototype] ✅ 产品数据构建完成:`, {
          id: product.id,
          name: product.name,
          bomCount: product.bom.length,
          inventory: product.inventory,
          safetyStock: product.safetyStock,
          orderQuantity: product.orderQuantity,
          plannedQuantity: product.plannedQuantity,
        });
        
        setProducts([product]);
        monitorLoadTime(startTime);
        setRetryCount(0);
        setDataSource('api');
        setDataSourceError(null);
        
        console.log(`[MPSPrototype] ========== BOM数据加载成功 ==========`);
        console.log(`[MPSPrototype] 加载耗时: ${(performance.now() - startTime).toFixed(2)}ms`);
      } catch (err) {
        console.error(`[MPSPrototype] ========== BOM数据加载失败 ==========`);
        console.error(`[MPSPrototype] 最终错误:`, err);
        console.error(`[MPSPrototype] 错误类型:`, err instanceof Error ? err.constructor.name : typeof err);
        console.error(`[MPSPrototype] 错误消息:`, err instanceof Error ? err.message : String(err));
        console.error(`[MPSPrototype] 错误堆栈:`, err instanceof Error ? err.stack : '无堆栈信息');
        
        const errorMessage = err instanceof Error ? err.message : '加载产品BOM数据失败';
        setError(errorMessage);
        setDataSource('fallback');
        setDataSourceError(err instanceof Error ? err.message : String(err));
        
        if (retryCount < 2) {
          console.log(`[MPSPrototype] 🔄 准备第${retryCount + 1}次重试加载BOM数据...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1));
        } else {
          console.error(`[MPSPrototype] ❌ 已达到最大重试次数，停止重试`);
        }
      } finally {
        setLoading(false);
        console.log(`[MPSPrototype] ========== BOM数据加载流程结束 ==========`);
      }
    };

    loadProductBOM();
  }, [selectedProductId, retryCount]);

  // 加载齐套模式V2数据
  useEffect(() => {
    if (!selectedProductId || planMode !== 'material-ready-v2') {
      return;
    }

    const loadV2Data = async () => {
      console.log(`[MPSPrototype] ========== 加载齐套模式V2数据 ==========`);
      setV2Loading(true);

      try {
        const data = await fetchMaterialReadyV2Data(selectedProductId);
        console.log(`[MPSPrototype] V2数据加载完成:`, {
          hasProduct: !!data.product,
          hasProductionPlan: !!data.productionPlan,
          bomCount: data.bomItems.length,
          materialDetailsCount: data.materialDetails.size,
          inventoryCount: data.inventoryMap.size,
        });

        setV2Data(data);

        // 计算V2结果
        if (data.product && data.productionPlan) {
          const result = calculateMaterialReadyModeV2(
            data.product,
            data.productionPlan,
            data.bomItems,
            data.materialDetails,
            data.inventoryMap
          );
          console.log(`[MPSPrototype] V2计算结果:`, {
            totalCycle: result.totalCycle,
            isOverdue: result.isOverdue,
            overdueDays: result.overdueDays,
            readyCount: result.readyMaterials.length,
            notReadyCount: result.notReadyMaterials.length,
            riskCount: result.risks.length,
          });
          setV2Result(result);
        }
      } catch (err) {
        console.error(`[MPSPrototype] V2数据加载失败:`, err);
      } finally {
        setV2Loading(false);
      }
    };

    loadV2Data();
  }, [selectedProductId, planMode]);

  const selectedProduct = useMemo(
    () => {
      if (!selectedProductId) return null;
      return products.find(p => p.id === selectedProductId) || products[0] || null;
    },
    [products, selectedProductId]
  );

  // 计算库存状态
  // 规则：
  // 1. 如果在手订单量 < 生产计划量+库存量，则继续下单可直接供应
  // 2. 如果在手订单量 >= 生产计划量+库存量，则需要提示增加生产计划
  const inventoryStatus = useMemo(() => {
    if (!selectedProduct) {
      return {
        totalAvailable: 0,
        isSufficient: false,
        needsProduction: true
      };
    }
    const totalAvailable = selectedProduct.plannedQuantity + selectedProduct.inventory;
    const isSufficient = selectedProduct.orderQuantity < totalAvailable;
    return {
      totalAvailable,
      isSufficient,
      needsProduction: !isSufficient
    };
  }, [selectedProduct]);

  // 计算甘特图数据和风险（带性能监控）
  const { totalCycle, tasks, risks } = useMemo(() => {
    if (!selectedProduct) {
      return { totalCycle: 0, tasks: [], risks: [] };
    }
    try {
      const calcStartTime = performance.now();
      const result = calculateDeliveryCycle(selectedProduct, selectedProduct.plannedQuantity);
      
      // 性能监控：验证SC-007（50任务流畅渲染）
      const taskCount = result.tasks[0]?.children ? 
        (result.tasks[0].children.length + 1) : result.tasks.length;
      monitorCalculationTime(calcStartTime, taskCount);
      
      return result;
    } catch (error) {
      console.error('Error calculating delivery cycle:', error);
      // 更详细的错误信息
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      return { totalCycle: 0, tasks: [], risks: [] };
    }
  }, [selectedProduct]);

  // 如果没有选中产品，显示等待选择状态
  if (!selectedProductId) {
    return (
      <div className="space-y-6">
        <ProductSelector
          selectedProductId={selectedProductId}
          onSelectionChange={setSelectedProductId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="text-slate-400 mx-auto mb-4" size={48} />
            <p className="text-slate-600">请选择产品以查看生产计划</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果正在加载BOM数据，显示加载状态
  if (loading) {
    const loadTime = loadStartTime > 0 ? Math.round((performance.now() - loadStartTime) / 1000) : 0;
    return (
      <div className="space-y-6">
        <ProductSelector
          selectedProductId={selectedProductId}
          onSelectionChange={setSelectedProductId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-slate-600 mb-1">正在加载产品BOM数据...</p>
            {loadTime > 0 && (
              <p className="text-xs text-slate-400">已用时 {loadTime} 秒</p>
            )}
            {retryCount > 0 && (
              <p className="text-xs text-yellow-600 mt-2">正在重试（第{retryCount}次）...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 如果加载失败，显示错误状态
  if (error && retryCount >= 2) {
    return (
      <div className="space-y-6">
        <ProductSelector
          selectedProductId={selectedProductId}
          onSelectionChange={setSelectedProductId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-red-600 font-semibold mb-2">BOM数据加载失败</p>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                重试加载
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有产品BOM数据，显示提示
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <ProductSelector
          selectedProductId={selectedProductId}
          onSelectionChange={setSelectedProductId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="text-slate-400 mx-auto mb-4" size={48} />
            <p className="text-slate-600">暂无产品BOM数据</p>
            <p className="text-sm text-slate-500 mt-2">请检查产品 {selectedProductId} 的BOM数据是否存在</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有选中的产品对象，显示初始化状态
  if (!selectedProduct) {
    return (
      <div className="space-y-6">
        <ProductSelector
          selectedProductId={selectedProductId}
          onSelectionChange={setSelectedProductId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-slate-600">正在初始化产品数据...</p>
          </div>
        </div>
      </div>
    );
  }

  // 根据模式选择要显示的数据
  const isV2Mode = planMode === 'material-ready-v2';
  const displayTasks = isV2Mode && v2Result ? v2Result.tasks : tasks;
  const displayCycle = isV2Mode && v2Result ? v2Result.totalCycle : totalCycle;
  const displayRisks = isV2Mode && v2Result ? v2Result.risks : risks;

  return (
    <div className="space-y-6">
      <ProductSelector
        selectedProductId={selectedProductId}
        onSelectionChange={setSelectedProductId}
      />

      <ProductInfoPanel
        product={selectedProduct}
        inventoryStatus={inventoryStatus}
      />

      {/* 计划模式选择器 */}
      <PlanModeSelector
        currentMode={planMode}
        onModeChange={setPlanMode}
        disabled={loading || v2Loading}
      />

      {/* 齐套模式V2: 显示顶部信息栏 */}
      {isV2Mode && v2Result && (
        <GanttHeader
          productCode={selectedProductId || ''}
          productName={selectedProduct.name}
          planStartDate={v2Result.planStartDate}
          planEndDate={v2Result.planEndDate}
          actualStartDate={v2Result.actualStartDate}
          actualEndDate={v2Result.actualEndDate}
          isOverdue={v2Result.isOverdue}
          overdueDays={v2Result.overdueDays}
          totalCycle={v2Result.totalCycle}
        />
      )}

      {/* V2模式加载中 */}
      {isV2Mode && v2Loading && (
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">正在计算齐套模式...</p>
          </div>
        </div>
      )}

      {/* 甘特图 */}
      {(!isV2Mode || !v2Loading) && (
        <GanttChartSection
          tasks={displayTasks as GanttTask[]}
          totalCycle={displayCycle}
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
          mode={planMode}
        />
      )}
    </div>
  );
};

export default MPSPrototype;
