/**
 * Material Ready Calculator V2
 *
 * 齐套模式V2核心算法：
 * 采用倒排逻辑计算生产计划，确保所有子级物料/组件齐套后才开始上级生产
 *
 * 数据来源：HD供应链业务知识网络.json
 * - 产品: assembly_time (生产效率，如"1000/天")
 * - 物料: delivery_duration (交付周期或生产效率)
 * - 物料: material_type (自制/外购/委外)
 * - BOM: child_quantity (子件用量), loss_rate (损耗率)
 * - 库存: available_quantity (可用数量)
 */

import type {
  BOMItem,
  MaterialReadyGanttTask,
  MaterialReadyCalculationResult,
  RiskAlert,
  ProductionPlan,
} from '../types/ontology';

import {
  type MaterialInfo,
  type ProductExtendedInfo,
  parseDeliveryDuration,
  parseProductionRate,
  calculateDuration,
} from '../services/mpsDataService';

// ============================================================================
// 常量定义
// ============================================================================

const DEFAULT_PRODUCTION_RATE = 1000;    // 默认生产效率：每天1000件
const DEFAULT_DELIVERY_DAYS = 15;        // 默认交付周期：15天
const DEFAULT_ASSEMBLY_DAYS = 5;         // 默认组装时长：5天

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 计算上下文（传递给递归函数）
 */
interface CalculationContext {
  productCode: string;
  productName: string;
  plannedQuantity: number;
  planStartDate: Date;
  planEndDate: Date;
  productionRate: number;
  materialDetails: Map<string, MaterialInfo>;
  inventoryMap: Map<string, number>;
  bomItems: BOMItem[];
  risks: RiskAlert[];
  readyMaterials: string[];
  notReadyMaterials: string[];
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
  // 如果损耗率大于1，假定是百分比形式（如5表示5%）
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
    console.warn(`[calculateRequiredQuantity] 损耗率异常: ${lossRate}, 使用1作为除数`);
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
  // 防止循环引用
  if (processedCodes.has(parentCode)) {
    return [];
  }
  processedCodes.add(parentCode);

  // 过滤出当前父件的直接子件（排除替代物料）
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

/**
 * 计算BOM树的最大深度
 */
function calculateTreeDepth(nodes: BOMTreeNode[], currentDepth: number = 0): number {
  if (nodes.length === 0) {
    return currentDepth;
  }
  let maxDepth = currentDepth;
  for (const node of nodes) {
    const childDepth = calculateTreeDepth(node.children, currentDepth + 1);
    maxDepth = Math.max(maxDepth, childDepth);
  }
  return maxDepth;
}

/**
 * 获取某一层级的所有节点
 */
function getNodesAtLevel(nodes: BOMTreeNode[], targetLevel: number, currentLevel: number = 0): BOMTreeNode[] {
  if (currentLevel === targetLevel) {
    return nodes;
  }
  const result: BOMTreeNode[] = [];
  for (const node of nodes) {
    result.push(...getNodesAtLevel(node.children, targetLevel, currentLevel + 1));
  }
  return result;
}

// ============================================================================
// 核心算法
// ============================================================================

/**
 * 递归构建甘特任务（倒排逻辑）
 *
 * @param nodes BOM树节点
 * @param parentEndDate 父级的开始时间（子级的结束时间 = 父级开始时间 - 1）
 * @param parentQuantity 父级的计划数量
 * @param level 当前层级
 * @param context 计算上下文
 * @returns 甘特任务列表和最早开始时间
 */
function buildGanttTasksBackward(
  nodes: BOMTreeNode[],
  parentEndDate: Date,
  parentQuantity: number,
  level: number,
  context: CalculationContext
): { tasks: MaterialReadyGanttTask[]; earliestStartDate: Date } {
  const tasks: MaterialReadyGanttTask[] = [];
  let earliestStartDate = new Date(parentEndDate);

  for (const node of nodes) {
    // 计算需求数量
    const requiredQuantity = calculateRequiredQuantity(
      parentQuantity,
      node.childQuantity,
      node.lossRate
    );

    // 获取物料详情
    const materialInfo = context.materialDetails.get(node.code);
    const materialType = materialInfo?.material_type || '外购';
    const deliveryDuration = materialInfo?.delivery_duration;

    // 获取库存
    const availableInventory = context.inventoryMap.get(node.code) || 0;

    // 判断是否就绪（库存充足）
    const isReady = availableInventory >= requiredQuantity;

    // 计算结束时间（= 父级开始时间 - 1天）
    const endDate = new Date(parentEndDate);
    endDate.setDate(endDate.getDate() - 1);

    // 计算时长和开始时间
    let duration: number;
    let productionRate: number | undefined;
    let deliveryDurationDays: number | undefined;

    if (isReady) {
      // 库存充足，用1天表示（放在结束时间前1天）
      duration = 1;
      context.readyMaterials.push(node.code);
    } else {
      // 库存不足，需要采购或生产
      context.notReadyMaterials.push(node.code);

      if (materialType === '自制') {
        // 组件：按生产效率计算
        const parsed = parseDeliveryDuration(deliveryDuration);
        productionRate = parsed.type === 'rate' ? parsed.value : DEFAULT_PRODUCTION_RATE;
        duration = Math.ceil(requiredQuantity / productionRate);
      } else {
        // 外购/委外：固定交付周期
        const parsed = parseDeliveryDuration(deliveryDuration);
        deliveryDurationDays = parsed.type === 'duration' ? parsed.value : DEFAULT_DELIVERY_DAYS;
        duration = deliveryDurationDays;
      }

      // 风险提示已移除（不再生成）
    }

    // 计算开始时间
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - duration + 1);

    // 递归处理子节点
    let childTasks: MaterialReadyGanttTask[] = [];
    let childEarliestStart = startDate;

    if (node.children.length > 0) {
      const childResult = buildGanttTasksBackward(
        node.children,
        startDate,  // 子级的结束时间 = 当前节点的开始时间
        requiredQuantity,
        level + 1,
        context
      );
      childTasks = childResult.tasks;
      childEarliestStart = childResult.earliestStartDate;
    }

    // 更新最早开始时间
    if (childEarliestStart < earliestStartDate) {
      earliestStartDate = childEarliestStart;
    }
    if (startDate < earliestStartDate) {
      earliestStartDate = startDate;
    }

    // 确定任务状态
    let status: 'ready' | 'not-ready' | 'overdue' | 'normal';
    if (isReady) {
      status = 'ready';
    } else {
      status = 'not-ready';
    }

    // 确定任务类型
    const taskType = materialType === '自制' ? 'component' : 'material';

    // 创建甘特任务
    const task: MaterialReadyGanttTask = {
      id: `${node.code}-${level}`,
      name: `${node.code}-${node.name}`,
      code: node.code,
      type: taskType,
      level,
      startDate,
      endDate,
      duration,
      status,
      isReady,
      requiredQuantity,
      availableInventory,
      productionRate,
      deliveryDuration: deliveryDurationDays,
      assemblyTime: duration,
      materialType,
      lossRate: normalizeLossRate(node.lossRate),
      childQuantity: node.childQuantity,
      children: childTasks.length > 0 ? childTasks : undefined,
      isExpanded: level === 0,
      canExpand: childTasks.length > 0,
    };

    tasks.push(task);
  }

  return { tasks, earliestStartDate };
}

/**
 * 调整所有任务的时间（当实际开始时间与计划开始时间不一致时）
 */
function adjustTaskDates(
  tasks: MaterialReadyGanttTask[],
  adjustDays: number
): void {
  for (const task of tasks) {
    task.startDate = new Date(task.startDate);
    task.startDate.setDate(task.startDate.getDate() + adjustDays);
    task.endDate = new Date(task.endDate);
    task.endDate.setDate(task.endDate.getDate() + adjustDays);

    if (task.children) {
      adjustTaskDates(task.children, adjustDays);
    }
  }
}

/**
 * 标记超期任务（实际结束时间超过计划结束时间）
 */
function markOverdueTasks(
  tasks: MaterialReadyGanttTask[],
  planEndDate: Date
): void {
  for (const task of tasks) {
    if (task.endDate > planEndDate && task.status !== 'ready') {
      task.status = 'overdue';
    }
    if (task.children) {
      markOverdueTasks(task.children, planEndDate);
    }
  }
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 计算齐套模式V2生产计划
 *
 * @param product 产品扩展信息
 * @param productionPlan 生产计划
 * @param bomItems BOM数据
 * @param materialDetails 物料详情Map
 * @param inventoryMap 库存Map
 * @returns 计算结果
 */
export function calculateMaterialReadyModeV2(
  product: ProductExtendedInfo,
  productionPlan: ProductionPlan,
  bomItems: BOMItem[],
  materialDetails: Map<string, MaterialInfo>,
  inventoryMap: Map<string, number>
): MaterialReadyCalculationResult {
  console.log(`[MaterialReadyV2] ========== 开始计算 ==========`);
  console.log(`[MaterialReadyV2] 产品: ${product.product_code}-${product.product_name}`);
  console.log(`[MaterialReadyV2] 计划数量: ${productionPlan.quantity}`);
  console.log(`[MaterialReadyV2] 计划时间: ${productionPlan.start_time} ~ ${productionPlan.end_time}`);

  // 解析计划时间
  const planStartDate = new Date(productionPlan.start_time);
  const planEndDate = new Date(productionPlan.end_time);

  // 解析产品生产效率
  const productionRate = parseProductionRate(product.assembly_time);
  console.log(`[MaterialReadyV2] 产品生产效率: ${productionRate}/天`);

  // 计算产品组装时长
  const productAssemblyTime = Math.ceil(productionPlan.quantity / productionRate);
  console.log(`[MaterialReadyV2] 产品组装时长: ${productAssemblyTime}天`);

  // 计算产品开始时间（从计划结束时间倒推）
  const productStartDate = new Date(planEndDate);
  productStartDate.setDate(productStartDate.getDate() - productAssemblyTime);
  console.log(`[MaterialReadyV2] 产品开始时间: ${productStartDate.toISOString().split('T')[0]}`);

  // 构建BOM树
  const bomTree = buildBOMTree(bomItems, product.product_code);
  const treeDepth = calculateTreeDepth(bomTree);
  console.log(`[MaterialReadyV2] BOM树深度: ${treeDepth}层`);
  console.log(`[MaterialReadyV2] 一级子件数: ${bomTree.length}`);

  // 初始化计算上下文
  const context: CalculationContext = {
    productCode: product.product_code,
    productName: product.product_name,
    plannedQuantity: productionPlan.quantity,
    planStartDate,
    planEndDate,
    productionRate,
    materialDetails,
    inventoryMap,
    bomItems,
    risks: [],
    readyMaterials: [],
    notReadyMaterials: [],
  };

  // 递归构建甘特任务（倒排）
  const { tasks: childTasks, earliestStartDate } = buildGanttTasksBackward(
    bomTree,
    productStartDate,  // 子级结束时间 = 产品开始时间
    productionPlan.quantity,
    1,  // level 1 是一级子件
    context
  );

  console.log(`[MaterialReadyV2] 最早开始时间: ${earliestStartDate.toISOString().split('T')[0]}`);

  // 计算时间调整量
  let adjustDays = 0;
  let actualStartDate = earliestStartDate;
  let actualEndDate = planEndDate;

  if (earliestStartDate < planStartDate) {
    // 无法按时完成，需要向后调整
    adjustDays = Math.ceil((planStartDate.getTime() - earliestStartDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`[MaterialReadyV2] 无法按时完成，向后调整 ${adjustDays} 天`);
  } else if (earliestStartDate > planStartDate) {
    // 可以提前完成，向前调整
    adjustDays = -Math.ceil((earliestStartDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`[MaterialReadyV2] 可以提前完成，向前调整 ${-adjustDays} 天`);
  }

  // 调整所有任务时间
  if (adjustDays !== 0) {
    adjustTaskDates(childTasks, adjustDays);
    actualStartDate = new Date(earliestStartDate);
    actualStartDate.setDate(actualStartDate.getDate() + adjustDays);
    actualEndDate = new Date(planEndDate);
    actualEndDate.setDate(actualEndDate.getDate() + adjustDays);
  }

  // 创建产品任务
  const productTask: MaterialReadyGanttTask = {
    id: `${product.product_code}-0`,
    name: `${product.product_code}-${product.product_name}`,
    code: product.product_code,
    type: 'product',
    level: 0,
    startDate: new Date(productStartDate.getTime() + adjustDays * 24 * 60 * 60 * 1000),
    endDate: actualEndDate,
    duration: productAssemblyTime,
    status: 'normal',
    isReady: true,  // 产品本身总是"就绪"的
    requiredQuantity: productionPlan.quantity,
    availableInventory: 0,
    productionRate,
    assemblyTime: productAssemblyTime,
    children: childTasks,
    isExpanded: true,
    canExpand: childTasks.length > 0,
  };

  // 标记超期任务
  const isOverdue = actualEndDate > planEndDate;
  const overdueDays = isOverdue
    ? Math.ceil((actualEndDate.getTime() - planEndDate.getTime()) / (1000 * 60 * 60 * 24))
    : Math.ceil((planEndDate.getTime() - actualEndDate.getTime()) / (1000 * 60 * 60 * 24)) * -1;

  if (isOverdue) {
    markOverdueTasks([productTask], planEndDate);

    // 风险提示已移除（不再生成）
  }

  // 计算总周期
  const totalCycle = Math.ceil(
    (actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log(`[MaterialReadyV2] 总周期: ${totalCycle}天`);
  console.log(`[MaterialReadyV2] 是否超期: ${isOverdue} (${overdueDays}天)`);
  console.log(`[MaterialReadyV2] 就绪物料: ${context.readyMaterials.length}个`);
  console.log(`[MaterialReadyV2] 未就绪物料: ${context.notReadyMaterials.length}个`);
  console.log(`[MaterialReadyV2] ========== 计算完成 ==========`);

  return {
    tasks: [productTask],
    totalCycle,
    planStartDate,
    planEndDate,
    actualStartDate,
    actualEndDate,
    isOverdue,
    overdueDays,
    readyMaterials: context.readyMaterials,
    notReadyMaterials: context.notReadyMaterials,
    risks: context.risks,
  };
}

/**
 * 将MaterialReadyGanttTask转换为GanttTask（用于兼容现有组件）
 */
export function convertToGanttTasks(
  tasks: MaterialReadyGanttTask[]
): import('../types/ontology').GanttTask[] {
  return tasks.map(task => ({
    id: task.id,
    name: task.name,
    type: task.type,
    level: task.level,
    startDate: task.startDate,
    endDate: task.endDate,
    duration: task.duration,
    status: task.status === 'ready' ? 'normal' :
            task.status === 'overdue' ? 'critical' : 'warning',
    children: task.children ? convertToGanttTasks(task.children) : undefined,
  }));
}
