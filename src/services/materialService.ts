/**
 * Material Service
 * 
 * Handles main material calculation based on annual purchase amounts.
 * 
 * Principle 1: All types imported from ontology.ts
 */

import type { MainMaterialSupplier, QualityEvent } from '../types/ontology';
import { ordersData, productsData, materialsData, suppliersData, mainMaterialSuppliersData } from '../utils/entityConfigService';

// Helper function to generate random mock data for missing fields
const generateRandomMockData = (field: string, seed: number = 0): number => {
  const base = seed % 100;
  if (field === 'qualityRating') return 80 + (base % 20);
  if (field === 'riskRating') return 10 + (base % 40);
  if (field === 'onTimeDeliveryRate') return 85 + (base % 15);
  if (field === 'annualPurchaseAmount') return 100000 + (base * 1000);
  return 50;
};
import {
  loadMaterialProcurementEvents,
  loadInventoryEvents,
  loadSupplierPerformanceScores,
  loadSupplierEntities,
  loadMaterialEntities,
  type MaterialProcurementEvent,
  type InventoryEvent,
  type SupplierPerformanceScore,
  type SupplierEntity,
  type MaterialEntity
} from './ontologyDataService';
import { loadCSV } from '../utils/csvParser';
import { loadHDMainMaterialsByPurchaseAmount } from './hdSupplierDataLoader';


// Quality Event interface
interface QualityEventCSV {
  event_id: string;
  event_date: string;
  event_type: string;
  severity: string;
  supplier_id: string;
  supplier_name: string;
  material_id: string;
  material_code: string;
  material_name: string;
  description: string;
  status: string;
}

// Cache for quality events
let cachedQualityEvents: QualityEventCSV[] | null = null;

/**
 * Load quality events from CSV
 */
async function loadQualityEvents(forceReload = false): Promise<QualityEventCSV[]> {
  if (cachedQualityEvents && !forceReload) {
    return cachedQualityEvents;
  }

  try {
    const data = await loadCSV<QualityEventCSV>('/datasource/finaldata/ontology/quality_event.csv');
    cachedQualityEvents = data;
    return data;
  } catch (error) {
    console.error('Failed to load quality events:', error);
    return [];
  }
}

/**
 * Calculate main materials by aggregating annual purchase amounts and selecting top N
 * 
 * @param limit Number of materials to return (default: 10)
 * @param year Year for purchase amount calculation (default: current year)
 * @returns Array of main materials sorted by annual purchase amount
 */
export const calculateMainMaterials = (
  limit: number = 10,
  year?: number
): MainMaterialSupplier[] => {
  const targetYear = year || new Date().getFullYear();

  // Aggregate purchase amounts by material code
  const materialAmounts = new Map<string, number>();
  const materialSuppliers = new Map<string, { supplierId: string; supplierName: string }>();

  // Process orders to calculate annual purchase amounts
  ordersData.forEach(order => {
    // Find product to get material codes
    const product = productsData.find(p => p.productId === order.productId);
    if (!product) return;

    // Check if order is in target year
    const orderYear = new Date(order.orderDate).getFullYear();
    if (orderYear !== targetYear) return;

    // Calculate purchase amount (simplified: quantity * unit price estimate)
    // In real implementation, would use actual purchase price from purchase records
    const estimatedUnitPrice = 1000; // Placeholder
    const purchaseAmount = order.quantity * estimatedUnitPrice;

    // Distribute amount across materials in product BOM
    product.materialCodes.forEach(materialCode => {
      const currentAmount = materialAmounts.get(materialCode) || 0;
      materialAmounts.set(materialCode, currentAmount + purchaseAmount);

      // Find supplier for this material
      const supplier = suppliersData.find(s => s.materialCode === materialCode);
      if (supplier && !materialSuppliers.has(materialCode)) {
        materialSuppliers.set(materialCode, {
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
        });
      }
    });
  });

  // Convert to array and sort by amount (descending)
  const sortedMaterials = Array.from(materialAmounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // Build MainMaterialSupplier objects
  return sortedMaterials.map(([materialCode, annualAmount], index) => {
    const material = materialsData.find(m => m.materialCode === materialCode);
    const supplierInfo = materialSuppliers.get(materialCode);

    // Generate random mock data for missing fields
    const qualityRating = generateRandomMockData('qualityRating', annualAmount);
    const riskRating = generateRandomMockData('riskRating', annualAmount + 1);
    const onTimeDeliveryRate = generateRandomMockData('onTimeDeliveryRate', annualAmount + 2);

    return {
      materialCode,
      materialName: material?.materialName || materialCode,
      supplierId: supplierInfo?.supplierId || 'UNKNOWN',
      supplierName: supplierInfo?.supplierName || '未知供应商',
      currentStock: material?.currentStock || 0,
      qualityRating,
      riskRating,
      onTimeDeliveryRate,
      annualPurchaseAmount: annualAmount,
      riskCoefficient: riskRating, // Use riskRating as riskCoefficient
      qualityEvents: [], // Placeholder - would be loaded from quality events data
      rank: index + 1,
    };
  });
};

/**
 * Get main material suppliers with enriched data
 * 
 * @param limit Number of materials to return (default: 10)
 * @returns Array of main material suppliers
 */
export const getMainMaterialSuppliers = (
  limit: number = 10
): MainMaterialSupplier[] => {
  // Use mock data for now, calculateMainMaterials can be used when order data is complete
  return mainMaterialSuppliersData.slice(0, limit);
};

/**
 * Get main materials by current stock, sorted descending, select top N
 * 
 * @param limit Number of materials to return (default: 5)
 * @returns Array of main materials sorted by current stock
 */
export const getMainMaterialsByStock = (
  limit: number = 5
): MainMaterialSupplier[] => {
  // Query materials with currentStock field
  const materialsWithStock = materialsData
    .filter(m => m.currentStock !== undefined && m.currentStock !== null)
    .map(material => {
      // Find supplier for this material
      const supplier = suppliersData.find(s => s.materialCode === material.materialCode);

      // Calculate annual purchase amount (simplified - would use actual purchase records)
      const annualAmount = (material.currentStock || 0) * 100; // Placeholder calculation

      // Generate random mock data for missing fields
      const qualityRating = material.currentStock === 0 || material.currentStock === null
        ? generateRandomMockData('qualityRating')
        : generateRandomMockData('qualityRating', material.currentStock);

      const riskRating = material.currentStock === 0 || material.currentStock === null
        ? generateRandomMockData('riskRating')
        : generateRandomMockData('riskRating', (material.currentStock || 0) + 1);

      const onTimeDeliveryRate = material.currentStock === 0 || material.currentStock === null
        ? generateRandomMockData('onTimeDeliveryRate')
        : generateRandomMockData('onTimeDeliveryRate', (material.currentStock || 0) + 2);

      const annualPurchaseAmount = annualAmount === 0 || annualAmount === null
        ? generateRandomMockData('annualPurchaseAmount')
        : annualAmount;

      return {
        materialCode: material.materialCode,
        materialName: material.materialName,
        supplierId: supplier?.supplierId || 'UNKNOWN',
        supplierName: supplier?.supplierName || '未知供应商',
        currentStock: material.currentStock || 0,
        qualityRating,
        riskRating,
        onTimeDeliveryRate,
        annualPurchaseAmount,
        riskCoefficient: riskRating, // Use riskRating as riskCoefficient
        qualityEvents: [], // Placeholder - would be loaded from quality events data
        rank: 0, // Will be set after sorting
      };
    });

  // Sort by currentStock descending
  const sorted = materialsWithStock.sort((a, b) => b.currentStock - a.currentStock);

  // Select top N and set rank
  return sorted.slice(0, limit).map((material, index) => ({
    ...material,
    rank: index + 1,
  }));
};

/**
 * Get main materials by annual purchase amount from ontology CSV data
 * 
 * @param limit Number of materials to return (default: 5)
 * @returns Promise of array of main materials sorted by annual purchase amount
 */
export const getMainMaterialsByPurchaseAmount = async (
  limit: number = 5
): Promise<MainMaterialSupplier[]> => {
  try {
    console.log('Loading main materials by purchase amount...');
    // Load required data
    const [procurementEvents, inventoryEvents, supplierPerformances, supplierEntities, materialEntities, qualityEvents] = await Promise.all([
      loadMaterialProcurementEvents(),
      loadInventoryEvents(),
      loadSupplierPerformanceScores(),
      loadSupplierEntities(),
      loadMaterialEntities(),
      loadQualityEvents()
    ]);

    console.log('Loaded data:', {
      procurementEvents: procurementEvents.length,
      inventoryEvents: inventoryEvents.length,
      supplierPerformances: supplierPerformances.length,
      supplierEntities: supplierEntities.length,
      materialEntities: materialEntities.length,
      qualityEvents: qualityEvents.length
    });

    // Calculate annual purchase amount per material
    const materialPurchaseMap = new Map<string, {
      material: MaterialEntity;
      totalAmount: number;
      suppliers: Map<string, { count: number; amount: number }>;
    }>();

    procurementEvents.forEach(proc => {
      const material = materialEntities.find(m => m.material_id === proc.material_id);
      if (!material) return;

      const amount = parseFloat(proc.total_amount) || 0;

      if (!materialPurchaseMap.has(proc.material_id)) {
        materialPurchaseMap.set(proc.material_id, {
          material,
          totalAmount: 0,
          suppliers: new Map()
        });
      }

      const materialData = materialPurchaseMap.get(proc.material_id)!;
      materialData.totalAmount += amount;

      // Track supplier usage
      if (!materialData.suppliers.has(proc.supplier_id)) {
        materialData.suppliers.set(proc.supplier_id, { count: 0, amount: 0 });
      }
      const supplierData = materialData.suppliers.get(proc.supplier_id)!;
      supplierData.count += 1;
      supplierData.amount += amount;
    });

    // Convert to array and sort by total amount
    const sortedMaterials = Array.from(materialPurchaseMap.entries())
      .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
      .slice(0, limit);

    // Build MainMaterialSupplier objects
    const results: MainMaterialSupplier[] = [];

    for (let i = 0; i < sortedMaterials.length; i++) {
      const [materialId, data] = sortedMaterials[i];
      const material = data.material;

      // Find primary supplier (highest purchase amount)
      let primarySupplierId = '';
      let maxAmount = 0;
      data.suppliers.forEach((supplierData, supplierId) => {
        if (supplierData.amount > maxAmount) {
          maxAmount = supplierData.amount;
          primarySupplierId = supplierId;
        }
      });

      const supplierEntity = supplierEntities.find(s => s.supplier_id === primarySupplierId);
      const supplierPerf = supplierPerformances.find(p => p.supplier_id === primarySupplierId);

      // Get current stock from latest inventory event
      const latestInventory = inventoryEvents
        .filter(inv => inv.item_id === materialId && inv.item_type === 'Material')
        .sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month))[0];

      const currentStock = latestInventory ? parseFloat(latestInventory.quantity) || 0 : 0;

      // Get quality events for this material
      const materialQualityEvents: QualityEvent[] = qualityEvents
        .filter(qe => qe.material_id === materialId)
        .map(qe => ({
          eventId: qe.event_id,
          eventDate: qe.event_date,
          eventType: qe.event_type as 'defect' | 'delay' | 'rejection' | 'complaint',
          severity: qe.severity as 'low' | 'medium' | 'high' | 'critical',
          description: qe.description,
          materialCode: material.material_code,
          supplierId: primarySupplierId,
          resolved: qe.status === 'closed'
        }));

      // Extract performance metrics
      const qualityRating = supplierPerf ? parseFloat(supplierPerf.quality_score) || 85 : 85;
      const onTimeDeliveryRate = supplierPerf ? parseFloat(supplierPerf.otif_rate) || 90 : 90;

      // Calculate risk rating based on supplier performance and quality events
      let riskRating = 20; // Base low risk
      if (supplierPerf) {
        const riskLevel = supplierPerf.risk_level?.toLowerCase() || 'low';
        if (riskLevel === 'high') riskRating = 70;
        else if (riskLevel === 'medium' || riskLevel === '中') riskRating = 40;
      }

      // Increase risk based on recent critical quality events
      const criticalEvents = materialQualityEvents.filter(e => e.severity === 'critical').length;
      riskRating = Math.min(100, riskRating + criticalEvents * 10);

      results.push({
        materialCode: material.material_code,
        materialName: material.material_name,
        supplierId: primarySupplierId,
        supplierName: supplierEntity?.supplier_name || '未知供应商',
        currentStock,
        qualityRating,
        riskRating,
        onTimeDeliveryRate,
        annualPurchaseAmount: data.totalAmount,
        riskCoefficient: riskRating,
        qualityEvents: materialQualityEvents,
        rank: i + 1
      });
    }

    console.log('Returning', results.length, 'main materials');
    return results;
  } catch (error) {
    console.error('Failed to load main materials from ontology:', error);
    console.error('Error details:', error);
    // Fallback to mock data
    console.log('Falling back to mock data');
    return getMainMaterialsByStock(limit);
  }
};

/**
 * 根据模式获取主要物料供应商数据
 * 
 * @param limit 返回数量限制
 * @param mode 数据模式: 'api' 使用惠达真实数据, 'mock' 使用Mock数据
 * @returns Promise of array of main material suppliers
 */
export const getMainMaterialsByPurchaseAmountWithMode = async (
  limit: number = 5,
  mode: 'mock' | 'api' = 'mock'
): Promise<MainMaterialSupplier[]> => {
  console.log(`[供应商评估] 加载数据，模式: ${mode}`);

  if (mode === 'api') {
    // 大脑模式：使用惠达供应链真实数据
    const materials = await loadHDMainMaterialsByPurchaseAmount(limit);
    console.log(`[供应商评估-大脑模式] 加载惠达供应商数据: ${materials.length} 条`);
    return materials;
  }

  // Mock模式：使用原有的Mock数据
  const materials = await getMainMaterialsByPurchaseAmount(limit);
  console.log(`[供应商评估-Mock模式] 加载Mock供应商数据: ${materials.length} 条`);
  return materials;
};
