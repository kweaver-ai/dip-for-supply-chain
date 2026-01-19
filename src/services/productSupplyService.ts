/**
 * Product Supply Service
 * 
 * Provides product supply analysis using API data.
 */

import { loadProductEntities, loadInventoryEvents, loadSalesOrderEvents } from './ontologyDataService';
import type { ProductSupplyAnalysis, ProductLifecycleAssessment } from '../types/ontology';

export type SuggestedAction = 'promotion' | 'market_sales_reminder';

/**
 * Get all products supply analysis
 */
export async function getAllProductsSupplyAnalysis(): Promise<ProductSupplyAnalysis[]> {
    console.log('[ProductSupplyService] Getting all products supply analysis...');

    try {
        const [products, inventoryEvents, salesOrders] = await Promise.all([
            loadProductEntities(),
            loadInventoryEvents(),
            loadSalesOrderEvents(),
        ]);

        const analyses: ProductSupplyAnalysis[] = products.map(product => {
            const productId = product.product_id || product.product_code;

            // Get inventory
            const inventory = inventoryEvents.find(
                inv => inv.item_id === productId || inv.item_code === productId
            );
            const currentStock = inventory ? parseFloat(inventory.quantity || inventory.inventory_data || '0') : 0;
            const safetyStock = inventory ? parseInt(inventory.safety_stock || '0') : 0;

            // Get sales orders
            const productOrders = salesOrders.filter(
                order => order.product_id === productId || order.product_code === productId
            );
            const totalDemand = productOrders.reduce(
                (sum, order) => sum + parseFloat(order.quantity || '0'),
                0
            );

            // Calculate stock days
            const averageDailyDemand = totalDemand / 30; // Rough estimate
            const stockDays = averageDailyDemand > 0 ? Math.round(currentStock / averageDailyDemand) : 999;

            // Determine supply risk
            let supplyRisk: 'low' | 'medium' | 'high' = 'low';
            if (currentStock < safetyStock) {
                supplyRisk = 'high';
            } else if (stockDays < 30) {
                supplyRisk = 'medium';
            }

            return {
                productId,
                productName: product.product_name,
                currentStock,
                safetyStock,
                stockDays,
                demandTrend: totalDemand > currentStock ? 'increasing' : 'decreasing',
                supplyRisk,
                recommendation: supplyRisk === 'high' ? '建议补货' : '库存充足',
                supplierCount: 1, // Placeholder
                averageDeliveryCycle: 30,
                supplyStabilityScore: supplyRisk === 'low' ? 90 : supplyRisk === 'medium' ? 70 : 50,
                currentInventoryLevel: currentStock,
                stockoutRiskLevel: supplyRisk,
                lastUpdated: new Date().toISOString(),
                leadTime: 30,
                reorderPoint: safetyStock,
                economicOrderQuantity: Math.ceil(averageDailyDemand * 60),
            };
        });

        console.log(`[ProductSupplyService] Generated ${analyses.length} supply analyses`);
        return analyses;
    } catch (error) {
        console.error('[ProductSupplyService] Failed to get supply analysis:', error);
        return [];
    }
}

/**
 * Get pending order quantity for a product
 */
export async function getPendingOrderQuantity(productId: string): Promise<number> {
    console.log(`[ProductSupplyService] Getting pending orders for product: ${productId}`);

    try {
        const salesOrders = await loadSalesOrderEvents();

        const pendingOrders = salesOrders.filter(
            order =>
                (order.product_id === productId || order.product_code === productId) &&
                (order.order_status === 'pending' || order.status === 'pending' || order.order_status === 'Active')
        );

        const totalQuantity = pendingOrders.reduce(
            (sum, order) => sum + parseFloat(order.quantity || '0'),
            0
        );

        console.log(`[ProductSupplyService] Found ${totalQuantity} pending order quantity`);
        return totalQuantity;
    } catch (error) {
        console.error('[ProductSupplyService] Failed to get pending orders:', error);
        return 0;
    }
}

/**
 * Calculate suggested actions for a product
 */
export async function calculateSuggestedActions(
    productId: string,
    stockQuantity: number
): Promise<SuggestedAction[]> {
    console.log(`[ProductSupplyService] Calculating suggested actions for ${productId}`);

    try {
        const salesOrders = await loadSalesOrderEvents();

        const productOrders = salesOrders.filter(
            order => order.product_id === productId || order.product_code === productId
        );

        const totalDemand = productOrders.reduce(
            (sum, order) => sum + parseFloat(order.quantity || '0'),
            0
        );

        const actions: SuggestedAction[] = [];

        // If stock is high and demand is low, suggest promotion
        if (stockQuantity > totalDemand * 2) {
            actions.push('promotion');
        }

        // If demand is increasing, suggest market sales reminder
        if (totalDemand > stockQuantity) {
            actions.push('market_sales_reminder');
        }

        return actions;
    } catch (error) {
        console.error('[ProductSupplyService] Failed to calculate suggested actions:', error);
        return [];
    }
}

/**
 * Get product lifecycle assessment
 */
export function getProductLifecycleAssessment(productId: string): ProductLifecycleAssessment | null {
    console.log(`[ProductSupplyService] Getting lifecycle assessment for ${productId}`);

    // Placeholder implementation - would need historical sales data
    return {
        productId,
        productName: 'Unknown Product', // Placeholder/TODO: fetch name
        stage: 'Maturity',
        salesTrend: 'stable',
        marketShare: 15,
        profitMargin: 25,
        recommendation: '保持现状',
        // Required fields
        roi: '15%',
        revenue: '¥ 0',
        stock: 'Normal',
        actionType: 'promote',
        suggestion: '保持现状，监控市场动态',
    };
}
