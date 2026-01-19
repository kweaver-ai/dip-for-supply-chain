/**
 * Supplier Service
 * 
 * Provides supplier-related business logic using API data.
 */

import { loadSupplierEntities, loadSupplierPerformanceScores, loadMaterialProcurementEvents } from './ontologyDataService';

/**
 * Get alternative suppliers for a material
 */
export async function getAlternativeSuppliers(materialCode: string): Promise<any[]> {
  console.log(`[SupplierService] Getting alternative suppliers for material: ${materialCode}`);

  try {
    const [suppliers, procurementEvents] = await Promise.all([
      loadSupplierEntities(),
      loadMaterialProcurementEvents(),
    ]);

    // Find suppliers who supply this material
    const supplierIds = new Set<string>();
    procurementEvents
      .filter(event => event.material_code === materialCode)
      .forEach(event => {
        if (event.supplier_id) {
          supplierIds.add(event.supplier_id);
        }
      });

    // Get supplier details
    const alternativeSuppliers = suppliers.filter(s => supplierIds.has(s.supplier_id));

    console.log(`[SupplierService] Found ${alternativeSuppliers.length} alternative suppliers`);
    return alternativeSuppliers;
  } catch (error) {
    console.error(`[SupplierService] Failed to get alternative suppliers:`, error);
    return [];
  }
}

/**
 * Get suppliers by purchase amount
 */
export async function getSuppliersByPurchaseAmount(): Promise<any[]> {
  console.log('[SupplierService] Getting suppliers by purchase amount...');

  try {
    const [suppliers, procurementEvents] = await Promise.all([
      loadSupplierEntities(),
      loadMaterialProcurementEvents(),
    ]);

    // Calculate total purchase amount for each supplier
    const supplierPurchaseMap = new Map<string, number>();

    procurementEvents.forEach(event => {
      const supplierId = event.supplier_id;
      const amount = parseFloat(event.total_amount || '0');

      if (supplierId) {
        const currentAmount = supplierPurchaseMap.get(supplierId) || 0;
        supplierPurchaseMap.set(supplierId, currentAmount + amount);
      }
    });

    // Combine supplier info with purchase amounts and sort
    const suppliersWithPurchase = suppliers
      .map(supplier => ({
        ...supplier,
        totalPurchaseAmount: supplierPurchaseMap.get(supplier.supplier_id) || 0,
      }))
      .filter(s => s.totalPurchaseAmount > 0)
      .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount);

    console.log(`[SupplierService] Found ${suppliersWithPurchase.length} suppliers with purchase data`);
    return suppliersWithPurchase;
  } catch (error) {
    console.error('[SupplierService] Failed to get suppliers by purchase amount:', error);
    return [];
  }
}

/**
 * Get supplier comparison data
 */
export async function getSupplierComparison(supplierId: string): Promise<any | null> {
  console.log(`[SupplierService] Getting comparison data for supplier: ${supplierId}`);

  try {
    const [suppliers, performances, procurementEvents] = await Promise.all([
      loadSupplierEntities(),
      loadSupplierPerformanceScores(),
      loadMaterialProcurementEvents(),
    ]);

    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    const performance = performances.find(p => p.supplier_id === supplierId);

    if (!supplier) {
      console.warn(`[SupplierService] Supplier not found: ${supplierId}`);
      return null;
    }

    // Calculate purchase statistics
    const supplierProcurements = procurementEvents.filter(e => e.supplier_id === supplierId);
    const totalPurchaseAmount = supplierProcurements.reduce(
      (sum, e) => sum + parseFloat(e.total_amount || '0'),
      0
    );

    return {
      ...supplier,
      performance: performance || {},
      totalPurchaseAmount,
      procurementCount: supplierProcurements.length,
    };
  } catch (error) {
    console.error(`[SupplierService] Failed to get supplier comparison:`, error);
    return null;
  }
}


