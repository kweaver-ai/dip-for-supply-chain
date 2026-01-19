/**
 * Material Service
 * 
 * Provides material-related business logic using API data.
 */

import { loadMaterialEntities, loadMaterialProcurementEvents, loadInventoryEvents } from './ontologyDataService';

/**
 * Get main materials by purchase amount
 */
export async function getMainMaterialsByPurchaseAmount(): Promise<any[]> {
    console.log('[MaterialService] Getting main materials by purchase amount...');

    try {
        const [materials, procurementEvents] = await Promise.all([
            loadMaterialEntities(),
            loadMaterialProcurementEvents(),
        ]);

        // Calculate total purchase amount for each material
        const materialPurchaseMap = new Map<string, number>();

        procurementEvents.forEach(event => {
            const materialCode = event.material_code;
            const amount = parseFloat(event.total_amount || '0');

            if (materialCode) {
                const currentAmount = materialPurchaseMap.get(materialCode) || 0;
                materialPurchaseMap.set(materialCode, currentAmount + amount);
            }
        });

        // Combine material info with purchase amounts and sort
        const materialsWithPurchase = materials
            .map(material => ({
                ...material,
                totalPurchaseAmount: materialPurchaseMap.get(material.material_code) || 0,
            }))
            .filter(m => m.totalPurchaseAmount > 0)
            .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount);

        console.log(`[MaterialService] Found ${materialsWithPurchase.length} materials with purchase data`);
        return materialsWithPurchase;
    } catch (error) {
        console.error('[MaterialService] Failed to get materials by purchase amount:', error);
        return [];
    }
}



/**
 * Get main materials by stock
 */
export async function getMainMaterialsByStock(): Promise<any[]> {
    console.log('[MaterialService] Getting main materials by stock...');

    try {
        const [materials, inventoryEvents] = await Promise.all([
            loadMaterialEntities(),
            loadInventoryEvents(),
        ]);

        // Calculate total stock for each material
        const materialStockMap = new Map<string, number>();

        inventoryEvents.forEach(event => {
            const materialCode = event.material_code || event.item_code;
            const quantity = parseFloat(event.quantity || event.inventory_data || '0');

            if (materialCode) {
                const currentStock = materialStockMap.get(materialCode) || 0;
                materialStockMap.set(materialCode, currentStock + quantity);
            }
        });

        // Combine material info with stock and sort
        const materialsWithStock = materials
            .map(material => ({
                ...material,
                currentStock: materialStockMap.get(material.material_code) || 0,
            }))
            .sort((a, b) => b.currentStock - a.currentStock);

        console.log(`[MaterialService] Found ${materialsWithStock.length} materials with stock data`);
        return materialsWithStock;
    } catch (error) {
        console.error('[MaterialService] Failed to get materials by stock:', error);
        return [];
    }
}
