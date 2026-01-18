/**
 * Default Mode Calculator
 *
 * 默认模式核心算法：
 * 采用正排逻辑计算生产计划，从生产计划开始时间向后推算
 *
 * 数据来源：HD供应链业务知识网络.json
 * - 产品: assembly_time (生产效率，如"1000/天")
 * - 物料: delivery_duration (交付周期或生产效率)
 * - 物料: material_type (自制/外购/委外)
 * - BOM: child_quantity (子件用量), loss_rate (损耗率)
 * - 库存: available_quantity (可用数量)
 * - 工厂生产计划: start_time, end_time, quantity
 */

import type {
  BOMItem,
  GanttTask,
  RiskAlert,
  ProductionPlan,
} from '../types/ontology';

import {
  type MaterialInfo,
  type ProductExtendedInfo,
  parseDeliveryDuration,
  parseProductionRate,
} from '../services/mpsDataService';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 默认模式计算结果
 */
export interface DefaultModeCalculationResult {
  tasks: GanttTask[];
  totalCycle: number;
  planStartDate: Date;
  planEndDate: Date;
  actualStartDate: Date;
  actualEndDate: Date;
  isOverdue: boolean;
  overdueDays: number;
  risks: RiskAlert[];
}

/**
 * BOM树节点（内部使用）
 */
interface BOMTreeNode {
  code: string;
  name: string;
  parentCode: string;
  childQuantity: number;
  lossRate: number;
  children: BOMTreeNode[];
  bomItem: BOMItem;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 处理损耗率：如果大于1则除以100
 */
function normalizeLossRate(lossRate: number | undefined): number {
  if (lossRate === undefined || lossRate === null) {
    return 0;
  }
  return lossRate > 1 ? lossRate / 100 : lossRate;
}

/**
 * 计算需求数量
 * 公式：需求数量 = (上级计划数量 * 子件用量) / (1 - 损耗率)
 */
function calculateRequiredQuantity(
  parentQuantity: number,
  childQuantity: number,
  lossRate: number
): number {
  const normalizedLossRate = normalizeLossRate(lossRate);
  const divisor = 1 - normalizedLossRate;
  if (divisor <= 0) {
    return Math.ceil(parentQuantity * childQuantity);
  }
  return Math.ceil((parentQuantity * childQuantity) / divisor);
}

/**
 * 构建BOM树（过滤掉替代物料）
 */
function buildBOMTree(
  bomItems: BOMItem[],
  parentCode: string,
  processedCodes: Set<string> = new Set()
): BOMTreeNode[] {
  if (processedCodes.has(parentCode)) {
    return [];
  }
  processedCodes.add(parentCode);

  const children = bomItems.filter(
    item => item.parent_code === parentCode && item.alternative_part !== '替代'
  );

  return children.map(item => ({
    code: item.child_code,
    name: item.child_name,
    parentCode: item.parent_code,
    childQuantity: item.quantity || 1,
    lossRate: item.loss_rate || 0,
    children: buildBOMTree(bomItems, item.child_code, new Set(processedCodes)),
    bomItem: item,
  }));
}

// ============================================================================
// 核心算法
// ============================================================================

/**
 * 递归构建甘特任务（正排逻辑）
 *
 * 正排逻辑：从计划开始时间向后推算
 * - 所有最底层物料从计划开始时间同时开始准备（采购/生产）
 * - 有子级的组件：必须等待所有子级完成后才能开始生产
 *   - 组件开始时间 = 所有子级的最晚结束时间
 *   - 组件结束时间 = 组件开始时间 + 组件生产时长
 * - 无子级的物料：从计划开始时间开始
 *   - 物料开始时间 = 计划开始时间
 *   - 物料结束时间 = 开始时间 + 采购/生产时长
 */
function buildGanttTasksForward(
  nodes: BOMTreeNode[],
  planStartDate: Date,
  parentQuantity: number,
  level: number,
  materialDetails: Map<string, MaterialInfo>,
  inventoryMap: Map<string, number>,
  risks: RiskAlert[]
): { tasks: GanttTask[]; maxEndDate: Date } {
  const tasks: GanttTask[] = [];
  let maxEndDate = new Date(planStartDate);

  for (const node of nodes) {
    // 计算需求数量
    const requiredQuantity = calculateRequiredQuantity(
      parentQuantity,
      node.childQuantity,
      node.lossRate
    );

    // 获取物料详情
    const materialInfo = materialDetails.get(node.code);
    const materialType = materialInfo?.material_type || '外购';
    const deliveryDuration = materialInfo?.delivery_duration;

    // 获取库存
    const availableInventory = inventoryMap.get(node.code) || 0;

    // 判断是否就绪（库存充足）
    const isReady = availableInventory >= requiredQuantity;

    // 计算时长
    let duration: number;
    if (isReady) {
      // 库存充足，用1天表示
      duration = 1;
    } else {
      // 库存不足，需要采购或生产
      const parsed = parseDeliveryDuration(deliveryDuration);
      if (materialType === '自制') {
        // 组件：按生产效率计算
        const productionRate = parsed.type === 'rate' ? parsed.value : 1000;
        duration = Math.ceil(requiredQuantity / productionRate);
      } else {
        // 外购/委外：固定交付周期
        duration = parsed.type === 'duration' ? parsed.value : 15;
      }

      // 风险提示已移除（不再生成）
    }

    // 递归处理子节点（先处理子节点，才能知道子级的最晚结束时间）
    let childTasks: GanttTask[] = [];
    let childrenMaxEndDate = new Date(planStartDate);

    if (node.children.length > 0) {
      const childResult = buildGanttTasksForward(
        node.children,
        planStartDate,  // 子节点也从计划开始时间开始
        requiredQuantity,
        level + 1,
        materialDetails,
        inventoryMap,
        risks
      );
      childTasks = childResult.tasks;
      childrenMaxEndDate = childResult.maxEndDate;
    }

    // 确定当前节点的开始时间
    let startDate: Date;
    if (node.children.length > 0) {
      // 有子级的组件：必须等待所有子级完成后才能开始
      startDate = new Date(childrenMaxEndDate);
    } else {
      // 无子级的物料：从计划开始时间开始
      startDate = new Date(planStartDate);
    }

    // 计算结束时间 = 开始时间 + 时长
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // 更新最晚结束时间
    if (endDate > maxEndDate) {
      maxEndDate = endDate;
    }

    // 确定任务类型
    const hasChildren = node.children.length > 0;
    const taskType: 'product' | 'module' | 'component' | 'material' =
      hasChildren ? (level === 1 ? 'module' : 'component') : 'material';

    // 确定任务状态
    const status: 'normal' | 'warning' | 'critical' = isReady ? 'normal' :
      (availableInventory === 0 ? 'critical' : 'warning');

    // 创建甘特任务
    const task: GanttTask = {
      id: `${node.code}-${level}`,
      name: `${node.code}-${node.name}`,
      type: taskType,
      level,
      startDate,
      endDate,
      duration,
      status,
      children: childTasks.length > 0 ? childTasks : undefined,
    };

    tasks.push(task);
  }

  return { tasks, maxEndDate };
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 计算默认模式生产计划（正排）
 *
 * @param product 产品扩展信息
 * @param productionPlan 生产计划
 * @param bomItems BOM数据
 * @param materialDetails 物料详情Map
 * @param inventoryMap 库存Map
 * @returns 计算结果
 */
export function calculateDefaultMode(
  product: ProductExtendedInfo,
  productionPlan: ProductionPlan,
  bomItems: BOMItem[],
  materialDetails: Map<string, MaterialInfo>,
  inventoryMap: Map<string, number>
): DefaultModeCalculationResult {
  console.log(`[DefaultMode] ========== 开始计算 ==========`);
  console.log(`[DefaultMode] 产品: ${product.product_code}-${product.product_name}`);
  console.log(`[DefaultMode] 计划数量: ${productionPlan.quantity}`);
  console.log(`[DefaultMode] 计划时间: ${productionPlan.start_time} ~ ${productionPlan.end_time}`);

  // 解析计划时间
  const planStartDate = new Date(productionPlan.start_time);
  const planEndDate = new Date(productionPlan.end_time);

  // 解析产品生产效率
  const productionRate = parseProductionRate(product.assembly_time);
  console.log(`[DefaultMode] 产品生产效率: ${productionRate}/天`);

  // 计算产品组装时长
  const productAssemblyTime = Math.ceil(productionPlan.quantity / productionRate);
  console.log(`[DefaultMode] 产品组装时长: ${productAssemblyTime}天`);

  // 构建BOM树
  const bomTree = buildBOMTree(bomItems, product.product_code);
  console.log(`[DefaultMode] BOM树一级子件数: ${bomTree.length}`);

  // 初始化风险列表
  const risks: RiskAlert[] = [];

  // 递归构建甘特任务（正排）
  const { tasks: childTasks, maxEndDate: childrenMaxEndDate } = buildGanttTasksForward(
    bomTree,
    planStartDate,
    productionPlan.quantity,
    1,
    materialDetails,
    inventoryMap,
    risks
  );

  // 产品开始时间 = 所有子级完成后（齐套）
  const productStartDate = new Date(childrenMaxEndDate);

  // 产品结束时间 = 产品开始时间 + 组装时长
  const productEndDate = new Date(productStartDate);
  productEndDate.setDate(productEndDate.getDate() + productAssemblyTime);

  // 实际结束时间
  const actualStartDate = new Date(planStartDate);
  const actualEndDate = new Date(productEndDate);

  // 判断是否超期
  const isOverdue = actualEndDate > planEndDate;
  const overdueDays = isOverdue
    ? Math.ceil((actualEndDate.getTime() - planEndDate.getTime()) / (1000 * 60 * 60 * 24))
    : Math.ceil((planEndDate.getTime() - actualEndDate.getTime()) / (1000 * 60 * 60 * 24)) * -1;

  if (isOverdue) {
    // 风险提示已移除（不再生成）
  }

  // 创建产品任务
  const productTask: GanttTask = {
    id: `${product.product_code}-0`,
    name: `${product.product_code}-${product.product_name}`,
    type: 'product',
    level: 0,
    startDate: productStartDate,
    endDate: productEndDate,
    duration: productAssemblyTime,
    status: isOverdue ? 'critical' : 'normal',
    children: childTasks,
  };

  // 计算总周期
  const totalCycle = Math.ceil(
    (actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log(`[DefaultMode] 总周期: ${totalCycle}天`);
  console.log(`[DefaultMode] 是否超期: ${isOverdue} (${overdueDays}天)`);
  console.log(`[DefaultMode] ========== 计算完成 ==========`);

  return {
    tasks: [productTask],
    totalCycle,
    planStartDate,
    planEndDate,
    actualStartDate,
    actualEndDate,
    isOverdue,
    overdueDays,
    risks,
  };
}
