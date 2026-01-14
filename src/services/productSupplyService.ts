import type { ProductSupplyAnalysis, ProductLifecycleAssessment } from '../types/ontology';
import {
  loadProductEntities,
  loadInventoryEvents,
  loadBOMEvents,
  loadSupplierEntities,
  loadMonthlySalesByProduct,
  loadMaterialProcurementEvents,
  loadSupplierPerformanceScores,
  loadSalesOrderEvents,
} from './ontologyDataService';

/**
 * Get product supply analysis for a specific product using ontology CSV data
 */
export async function getProductSupplyAnalysis(productId: string): Promise<ProductSupplyAnalysis | null> {
  try {
    // Load all required data
    const [
      productEntities,
      inventoryEvents,
      bomEvents,
      supplierEntities,
      monthlySales,
      procurementEvents,
      supplierPerformances
    ] = await Promise.all([
      loadProductEntities(),
      loadInventoryEvents(),
      loadBOMEvents(),
      loadSupplierEntities(),
      loadMonthlySalesByProduct(),
      loadMaterialProcurementEvents(),
      loadSupplierPerformanceScores()
    ]);

    // Find the product
    const product = productEntities.find(p => p.product_id === productId);
    if (!product) return null;

    // 1. Calculate supplier count
    // Get all materials for this product from BOM
    const productBOMs = bomEvents.filter(bom =>
      bom.parent_id === productId &&
      bom.parent_type === 'Product' &&
      bom.status === 'Active'
    );

    const materialIds = new Set(productBOMs.map(bom => bom.child_id));

    // For each material, find all suppliers
    // Note: We need to map materials to suppliers through procurement events
    const uniqueSupplierIds = new Set<string>();
    procurementEvents.forEach(proc => {
      if (materialIds.has(proc.material_id)) {
        uniqueSupplierIds.add(proc.supplier_id);
      }
    });

    const supplierCount = uniqueSupplierIds.size;

    // 2. Calculate average delivery cycle
    // Use procurement events for materials of this product
    const relevantProcurements = procurementEvents.filter(proc =>
      materialIds.has(proc.material_id) &&
      proc.actual_arrival_date &&
      proc.order_date
    );

    let totalCycleDays = 0;
    let cycleCount = 0;

    relevantProcurements.forEach(proc => {
      const orderDate = new Date(proc.order_date);
      const arrivalDate = new Date(proc.actual_arrival_date!);
      const cycleDays = Math.ceil((arrivalDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      if (cycleDays > 0) {
        totalCycleDays += cycleDays;
        cycleCount++;
      }
    });

    const averageDeliveryCycle = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 0;

    // 3. Calculate supply stability score
    // Based on supplier performance scores
    const relevantSupplierPerfs = supplierPerformances.filter(perf =>
      uniqueSupplierIds.has(perf.supplier_id)
    );

    let totalDeliveryScore = 0;
    let perfCount = 0;

    relevantSupplierPerfs.forEach(perf => {
      const deliveryScore = parseFloat(perf.delivery_score);
      if (!isNaN(deliveryScore)) {
        totalDeliveryScore += deliveryScore;
        perfCount++;
      }
    });

    // Supply stability score based on average delivery score
    const supplyStabilityScore = perfCount > 0
      ? Math.round(totalDeliveryScore / perfCount)
      : 50; // Default to medium stability

    // 4. Calculate current inventory level
    // Get latest inventory snapshot for this product
    const productInventories = inventoryEvents
      .filter(inv =>
        inv.item_id === productId &&
        inv.item_type === 'Product' &&
        inv.status === 'Active'
      )
      .sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month));

    const latestInventory = productInventories[0];
    const currentInventoryLevel = latestInventory ? parseInt(latestInventory.quantity) : 0;

    // 5. Calculate stockout risk level
    // Get average monthly sales for this product
    const productSales = monthlySales.filter(sale => sale.product_id === productId);

    let totalSales = 0;
    productSales.forEach(sale => {
      const qty = parseInt(sale.quantity);
      if (!isNaN(qty)) {
        totalSales += qty;
      }
    });

    const avgMonthlySales = productSales.length > 0 ? totalSales / productSales.length : 0;

    // Calculate months of inventory coverage
    const monthsOfCoverage = avgMonthlySales > 0 ? currentInventoryLevel / avgMonthlySales : 0;

    // Determine stockout risk level based on months of coverage
    const stockoutRiskLevel: ProductSupplyAnalysis['stockoutRiskLevel'] =
      monthsOfCoverage < 1 ? 'critical' :
        monthsOfCoverage < 2 ? 'high' :
          monthsOfCoverage < 3 ? 'medium' : 'low';

    return {
      productId: product.product_id,
      productName: product.product_name,
      supplierCount,
      averageDeliveryCycle,
      supplyStabilityScore,
      currentInventoryLevel,
      stockoutRiskLevel,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to get product supply analysis from CSV for ${productId}:`, error);
    return null;
  }
}

/**
 * Get product supply analysis for all products
 */
export const getAllProductsSupplyAnalysis = async (): Promise<ProductSupplyAnalysis[]> => {
  try {
    const productEntities = await loadProductEntities();
    const analyses = await Promise.all(
      productEntities
        .filter(p => p.status === 'Active')
        .map(p => getProductSupplyAnalysis(p.product_id))
    );
    return analyses.filter((analysis): analysis is ProductSupplyAnalysis => analysis !== null);
  } catch (error) {
    console.error('Failed to get all products supply analysis from CSV:', error);
    return [];
  }
};

/**
 * Calculate pending order quantity for a product
 * Uses ontology CSV data
 */
export const getPendingOrderQuantity = async (productId: string): Promise<number> => {
  try {
    const salesOrders = await loadSalesOrderEvents();

    // console.log(`Loading orders for product ${productId}, total orders: ${salesOrders.length}`);

    // Filter orders that:
    // 1. Match the product ID
    // 2. Are confirmed (not cancelled)
    // Note: Showing all confirmed orders regardless of delivery date
    // because CSV data dates may be in the past
    // '已发货' or '已确认'
    const confirmedOrders = salesOrders.filter(order =>
      order.product_id === productId &&
      (order.order_status === '已发货' || order.document_status === '已确认')
    );

    // console.log(`Found ${confirmedOrders.length} confirmed orders for ${productId}`);

    // Sum up quantities
    const total = confirmedOrders.reduce((sum, order) => {
      const qty = parseInt(order.quantity);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);

    // console.log(`Total confirmed order quantity for ${productId}: ${total}`);
    return total;
  } catch (error) {
    console.error(`Failed to get pending order quantity from CSV for ${productId}:`, error);
    return 0;
  }
};

/**
 * Get ProductLifecycleAssessment data for a product
 * Currently returns null as real data source is not yet available
 */
export const getProductLifecycleAssessment = (productId: string): ProductLifecycleAssessment | null => {
  // Returns null as we don't have mock data anymore and real data source is TBD
  return null;
};

/**
 * Calculate suggested actions based on product lifecycle and inventory
 * Returns array of action types that should be displayed
 */
export type SuggestedAction = 'promotion' | 'market_sales_reminder';

export const calculateSuggestedActions = async (
  productId: string,
  inventory: number
): Promise<SuggestedAction[]> => {
  // Note: Real product entities do not currently have stopSalesDate or stopServiceDate
  // Returning empty array for now
  const productEntities = await loadProductEntities();
  const product = productEntities.find(p => p.product_id === productId);
  if (!product) return [];

  const actions: SuggestedAction[] = [];

  // Logic commented out until fields are available in CSV/API
  /*
  const currentDate = new Date();
  if ((product as any).stopSalesDate) { ... }
  */

  return actions;
};

/**
 * Handle supply-related queries for AI assistant
 */
export const handleSupplyQuery = async (query: string): Promise<string> => {
  const productEntities = await loadProductEntities();

  // Extract product name or ID from query
  const productMatch = query.match(/产品([A-Z]|[\u4e00-\u9fa5]+)/);
  let productId: string | null = null;
  let productName: string | null = null;

  if (productMatch) {
    productName = productMatch[1];
    const product = productEntities.find(p =>
      p.product_name.includes(productName!) || p.product_id.includes(productName!)
    );
    if (product) {
      productId = product.product_id;
    }
  }

  if (!productId && productEntities.length > 0) {
    // Default to first product if no specific product mentioned
    productId = productEntities[0].product_id;
  }

  if (!productId) {
    return '抱歉，未找到相关产品信息。';
  }

  const analysis = await getProductSupplyAnalysis(productId);
  if (!analysis) {
    return '抱歉，无法获取该产品的供应分析数据。';
  }

  return `产品 ${analysis.productName} 的供应情况：
- 供应商数量：${analysis.supplierCount} 家
- 平均交货周期：${analysis.averageDeliveryCycle} 天
- 供货稳定性评分：${analysis.supplyStabilityScore} 分
- 当前库存水平：${analysis.currentInventoryLevel.toLocaleString()} 单位
- 缺货风险等级：${analysis.stockoutRiskLevel === 'critical' ? '严重' : analysis.stockoutRiskLevel === 'high' ? '高' : analysis.stockoutRiskLevel === 'medium' ? '中' : '低'}

${analysis.stockoutRiskLevel === 'critical' || analysis.stockoutRiskLevel === 'high' ? '⚠️ 建议：当前库存风险较高，建议及时补货。' : '✅ 当前供应状态良好。'}`;
};
