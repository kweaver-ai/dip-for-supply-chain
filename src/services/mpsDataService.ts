/**
 * MPS Data Service
 *
 * 提供MPS甘特图所需的数据获取和转换服务
 * 符合Constitution Principle 1 & 7: 所有数据从供应链知识网络API获取，无CSV fallback
 */

import { ontologyApi } from '../api';
import type {
  APIProduct,
  ProductionPlan,
  Inventory,
  BOMItem,
  BOMNode,
  PlanInfo
} from '../types/ontology';
import type { QueryCondition } from '../api/ontologyApi';

// ============================================================================
// 对象类型ID常量
// ============================================================================

const OBJECT_TYPE_IDS = {
  PRODUCT: 'd56v4ue9olk4bpa66v00',           // 产品对象类型
  PRODUCTION_PLAN: 'd5704qm9olk4bpa66vp0',   // 工厂生产计划对象类型
  INVENTORY: 'd56vcuu9olk4bpa66v3g',         // 库存对象类型
  SALES_ORDER: 'd56vh169olk4bpa66v80',       // 销售订单对象类型
  BOM: 'd56vqtm9olk4bpa66vfg',              // 产品BOM对象类型
} as const;

// Note: DataSourceResponse type removed - all functions now return direct data from API
// CSV fallback logic completely removed per Constitution Principle 1 & 7

// ============================================================================
// API数据获取函数
// ============================================================================

/**
 * 获取产品列表
 * 符合Constitution Principle 1: 仅从API获取数据，字段名遵循HD供应链业务知识网络.json
 */
export async function fetchProductList(): Promise<APIProduct[]> {
  const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.PRODUCT, {
    limit: 100,
    need_total: true,
  });

  return response.entries.map((item: any) => ({
    product_code: item.product_code || '',
    product_name: item.product_name || '',
    product_model: item.product_model,
    product_series: item.product_series,
    product_type: item.product_type,
    amount: item.amount ? parseFloat(item.amount) : undefined,
  })).filter((p: APIProduct) => p.product_code && p.product_name);
}

/**
 * 获取工厂生产计划
 * 符合Constitution Principle 1: 仅从API获取数据，字段名遵循HD供应链业务知识网络.json
 */
export async function fetchProductionPlan(productCode: string): Promise<ProductionPlan[]> {
  const condition: QueryCondition = {
    operation: '==',
    field: 'code',
    value: productCode,
    value_from: 'const',
  };

  const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.PRODUCTION_PLAN, {
    condition,
    limit: 1000,
  });

  return response.entries.map((item: any) => ({
    order_number: item.order_number || '',
    code: item.code || '',
    quantity: item.quantity ? parseInt(item.quantity) : 0,
    start_time: item.start_time || '',
    end_time: item.end_time || '',
    status: item.status,
    priority: item.priority ? parseInt(item.priority) : undefined,
    ordered: item.ordered ? parseInt(item.ordered) : undefined,
  })).filter((p: ProductionPlan) => p.order_number && p.code === productCode);
}

/**
 * 获取库存信息
 * 符合Constitution Principle 1: 仅从API获取数据，字段名遵循HD供应链业务知识网络.json
 */
export async function fetchInventory(productCode: string): Promise<Inventory | null> {
  const condition: QueryCondition = {
    operation: '==',
    field: 'material_code',
    value: productCode,
    value_from: 'const',
  };

  const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.INVENTORY, {
    condition,
    limit: 100,
  });

  if (response.entries.length === 0) {
    return null;
  }

  const item = response.entries[0];
  return {
    material_code: item.material_code || '',
    material_name: item.material_name,
    inventory_data: item.inventory_data ? parseFloat(item.inventory_data) : 0,
    safety_stock: item.safety_stock ? parseInt(item.safety_stock) : 0,
    available_quantity: item.available_quantity ? parseFloat(item.available_quantity) : undefined,
    inventory_age: item.inventory_age ? parseInt(item.inventory_age) : undefined,
    last_inbound_time: item.last_inbound_time,
    update_time: item.update_time,
  };
}

/**
 * 获取在手订单量（累计签约数量）
 * 符合Constitution Principle 1: 仅从API获取数据，字段名遵循HD供应链业务知识网络.json
 */
export async function fetchPendingOrders(productCode: string): Promise<number> {
  const condition: QueryCondition = {
    operation: '==',
    field: 'product_code',
    value: productCode,
    value_from: 'const',
  };

  const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.SALES_ORDER, {
    condition,
    limit: 1000,
  });

  // 累加所有匹配记录的signing_quantity（不过滤状态）
  const totalQuantity = response.entries.reduce((sum: number, item: any) => {
    const quantity = item.signing_quantity ? parseInt(item.signing_quantity) : 0;
    return sum + quantity;
  }, 0);

  return totalQuantity;
}

/**
 * 获取BOM数据（递归查询）
 * 符合Constitution Principle 1 & 7: 仅从API获取数据，字段名遵循HD供应链业务知识网络.json
 * 递归查询所有BOM层级，包括替代件
 */
export async function fetchBOMData(productCode: string): Promise<BOMItem[]> {
  console.log(`[mpsDataService] ========== fetchBOMData 开始 ==========`);
  console.log(`[mpsDataService] 产品编码: ${productCode}`);
  console.log(`[mpsDataService] BOM对象类型ID: ${OBJECT_TYPE_IDS.BOM}`);

  // 🔍 DEBUG: 首先查询所有BOM数据（无条件）以验证数据是否存在
  console.log(`[mpsDataService] 🔍 DEBUG: 查询所有BOM数据（无条件）...`);
  try {
    const debugResponse = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.BOM, {
      limit: 10,
      need_total: true,
    });
    console.log(`[mpsDataService] 🔍 DEBUG: 知识网络中BOM数据总数: ${debugResponse.total_count || debugResponse.entries.length}`);
    if (debugResponse.entries.length > 0) {
      console.log(`[mpsDataService] 🔍 DEBUG: BOM数据示例（前5条）:`, debugResponse.entries.slice(0, 5).map((item: any) => ({
        bom_number: item.bom_number,
        parent_code: item.parent_code,
        child_code: item.child_code,
        child_name: item.child_name,
      })));
    } else {
      console.warn(`[mpsDataService] ⚠️ 知识网络中没有任何BOM数据！请检查数据是否已导入。`);
    }
  } catch (err) {
    console.error(`[mpsDataService] ❌ DEBUG查询失败:`, err);
  }

  // ⚠️ 问题诊断：parent_code字段未建立索引，条件查询返回空结果
  // 解决方案：获取所有BOM数据，然后在客户端递归过滤
  console.log(`[mpsDataService] 🔧 使用客户端过滤方案（parent_code字段未索引）`);

  // Step 1: 获取所有BOM数据（一次性查询，避免多次网络往返）
  console.log(`[mpsDataService] Step 1: 获取所有BOM数据...`);
  const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.BOM, {
    limit: 10000, // 假设BOM总数不超过10000条
    need_total: true,
  });

  console.log(`[mpsDataService] ✅ 获取到${response.entries.length}条BOM数据`);

  // Step 2: 映射API响应到BOMItem类型
  const allBOMRecords = response.entries.map((item: any) => ({
    bom_id: item.bom_id || item.bom_number || '',
    parent_code: item.parent_code || '',
    child_code: item.child_code || '',
    child_name: item.child_name || '',
    quantity: item.quantity || item.child_quantity ? parseFloat(item.quantity || item.child_quantity) : undefined,
    unit: item.unit || '',
    alternative_part: item.alternative_part,
    alternative_group: item.alternative_group,
    relationship_type: item.relationship_type,
    sequence: item.sequence ? parseInt(item.sequence) : undefined,
    effective_date: item.effective_date,
    expiry_date: item.expiry_date,
    loss_rate: item.loss_rate ? parseFloat(item.loss_rate) : undefined,
  })).filter((bom: BOMItem) => bom.bom_id && bom.parent_code && bom.child_code);

  console.log(`[mpsDataService] 映射后有效BOM记录数: ${allBOMRecords.length}`);

  // Step 3: 客户端递归过滤，构建指定产品的BOM树
  const allBOMItems: BOMItem[] = [];
  const processedCodes = new Set<string>();

  function filterChildren(parentCode: string, level: number = 0) {
    const indent = '  '.repeat(level);

    // 防止循环引用
    if (processedCodes.has(parentCode)) {
      console.log(`${indent}[filterChildren] ⚠️ 跳过已处理的parentCode: ${parentCode}`);
      return;
    }

    // 客户端过滤：查找parent_code匹配的记录
    const children = allBOMRecords.filter(bom => bom.parent_code === parentCode);

    console.log(`${indent}[filterChildren] level=${level}, parentCode=${parentCode}, 找到${children.length}个子项`);

    if (children.length === 0) {
      return; // 自然终止
    }

    if (level === 0 && children.length > 0) {
      console.log(`${indent}[filterChildren] 顶层子项示例（前3条）:`, children.slice(0, 3).map(c => ({
        parent_code: c.parent_code,
        child_code: c.child_code,
        child_name: c.child_name,
      })));
    }

    allBOMItems.push(...children);
    processedCodes.add(parentCode);

    // 递归处理子项
    for (const child of children) {
      filterChildren(child.child_code, level + 1);
    }
  }

  console.log(`[mpsDataService] Step 3: 客户端递归过滤，起始产品编码: ${productCode}`);
  filterChildren(productCode, 0);

  console.log(`[mpsDataService] ========== fetchBOMData 完成 ==========`);
  console.log(`[mpsDataService] 共提取 ${allBOMItems.length} 条相关BOM数据`);

  return allBOMItems;
}

/**
 * 构建BOM树形结构
 * T012: 实现buildBOMTree函数
 */
export function buildBOMTree(
  bomItems: BOMItem[],
  rootCode: string,
  hideAlternatives: boolean = true
): BOMNode[] {
  // 创建节点映射表
  const nodeMap = new Map<string, BOMNode>();
  const alternativeGroups = new Map<number, BOMItem[]>();
  
  // 第一遍：创建所有节点（不包括替代件，如果hideAlternatives=true）
  for (const item of bomItems) {
    if (hideAlternatives && item.alternative_part === '替代') {
      // 收集替代件到替代组
      if (item.alternative_group) {
        if (!alternativeGroups.has(item.alternative_group)) {
          alternativeGroups.set(item.alternative_group, []);
        }
        alternativeGroups.get(item.alternative_group)!.push(item);
      }
      continue;
    }
    
    // 创建或更新子节点
    if (!nodeMap.has(item.child_code)) {
      nodeMap.set(item.child_code, {
        code: item.child_code,
        name: item.child_name || item.child_code,
        type: determineNodeType(item.child_code, item.child_name),
        level: 0, // 将在后续计算
        quantity: item.quantity,
        unit: item.unit,
        children: [],
        isExpanded: false,
        alternativeGroup: item.alternative_group,
        alternatives: [],
        isAlternative: item.alternative_part === '替代',
      });
    }
  }
  
  // 第二遍：构建父子关系
  const rootNodes: BOMNode[] = [];
  
  function buildNode(parentCode: string, level: number): BOMNode[] {
    const children: BOMNode[] = [];
    
    for (const item of bomItems) {
      if (item.parent_code !== parentCode) continue;
      if (hideAlternatives && item.alternative_part === '替代') continue;
      
      const node = nodeMap.get(item.child_code);
      if (!node) continue;
      
      node.level = level;
      node.children = buildNode(item.child_code, level + 1);
      
      // 处理替代组
      if (item.alternative_group && alternativeGroups.has(item.alternative_group)) {
        const alternatives = alternativeGroups.get(item.alternative_group)!;
        node.alternatives = alternatives.map(alt => ({
          code: alt.child_code,
          name: alt.child_name || alt.child_code,
          type: determineNodeType(alt.child_code, alt.child_name),
          level: level + 1,
          quantity: alt.quantity,
          unit: alt.unit,
          children: [],
          isExpanded: false,
          alternativeGroup: alt.alternative_group,
          alternatives: [],
          isAlternative: true,
        }));
      }
      
      children.push(node);
    }
    
    return children;
  }
  
  const rootNode = nodeMap.get(rootCode);
  if (rootNode) {
    rootNode.level = 0;
    rootNode.children = buildNode(rootCode, 1);
    rootNodes.push(rootNode);
  } else {
    // 如果根节点不在BOM数据中，创建一个虚拟根节点
    rootNodes.push({
      code: rootCode,
      name: rootCode,
      type: 'product',
      level: 0,
      children: buildNode(rootCode, 1),
      isExpanded: true,
      isAlternative: false,
    });
  }
  
  return rootNodes;
}

/**
 * 根据编码和名称判断节点类型
 */
function determineNodeType(code: string, name?: string): 'product' | 'component' | 'material' {
  // 简单的启发式判断：可以根据实际业务规则调整
  if (code.startsWith('T') || code.startsWith('PROD-')) {
    return 'product';
  }
  if (name?.includes('BOM') || name?.includes('组件') || name?.includes('模块')) {
    return 'component';
  }
  return 'material';
}

/**
 * 构建计划信息
 * 符合Constitution Principle 1: 仅从API获取数据并聚合
 */
export async function buildPlanInfo(productCode: string, productName?: string): Promise<PlanInfo> {
  // 并行获取所有数据
  const [productionPlans, inventory, pendingOrderQuantity] = await Promise.all([
    fetchProductionPlan(productCode),
    fetchInventory(productCode),
    fetchPendingOrders(productCode),
  ]);

  // 累加生产计划量
  const productionPlanQuantity = productionPlans.reduce(
    (sum, plan) => sum + plan.quantity,
    0
  );

  return {
    productCode,
    productName: productName || productCode,
    productionPlanQuantity,
    inventoryQuantity: inventory?.inventory_data ?? 0,
    safetyStock: inventory?.safety_stock ?? 0,
    pendingOrderQuantity,
  };
}
