import Papa from 'papaparse';

interface OrderItem {
    id: string;
    product_code: string;
    product_name: string;
    signing_quantity: number;   // Total ordered
    shipping_quantity: number;  // Already delivered
    // pending = signing_quantity - shipping_quantity
}

export interface OrderAnalysisResult {
    productId: string;
    totalOrders: number;      // Count of orders (rows)
    totalQuantity: number;    // Sum of signing_quantity
    deliveredQuantity: number;// Sum of shipping_quantity
    pendingQuantity: number;  // Sum of (signing - shipping)
    completionRate: number;   // delivered / totalQuantity
}

export class ProductOrderCalculator {
    private orders: OrderItem[] = [];
    private initialized = false;

    async init() {
        if (this.initialized) return;

        try {
            const response = await fetch('/data/订单信息_fixed.csv');
            if (!response.ok) {
                console.error(`[ProductOrderCalculator] Failed to fetch CSV: ${response.status} ${response.statusText}`);
                return;
            }
            const csvText = await response.text();

            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.orders = results.data.map((row: any) => ({
                        id: row.id,
                        product_code: row.product_code,
                        product_name: row.product_name,
                        signing_quantity: parseFloat(row.signing_quantity) || 0,
                        shipping_quantity: parseFloat(row.shipping_quantity) || 0,
                    })) as OrderItem[];
                    this.initialized = true;
                }
            });
        } catch (error) {
            console.error("Failed to initialize ProductOrderCalculator", error);
        }
    }

    calculateOrderAnalysis(productId: string): OrderAnalysisResult {
        const productOrders = this.orders.filter(o => o.product_code === productId);

        let totalQuantity = 0;
        let deliveredQuantity = 0;

        productOrders.forEach(order => {
            totalQuantity += order.signing_quantity;
            deliveredQuantity += order.shipping_quantity;
        });

        // Ensure non-negative pending
        const pendingQuantity = Math.max(0, totalQuantity - deliveredQuantity);

        // Safety check for completion rate
        const completionRate = totalQuantity > 0 ? (deliveredQuantity / totalQuantity) * 100 : 0;

        return {
            productId,
            totalOrders: productOrders.length,
            totalQuantity,
            deliveredQuantity,
            pendingQuantity,
            completionRate: Math.min(100, Math.max(0, completionRate)) // Clamp 0-100
        };
    }
}

export const productOrderCalculator = new ProductOrderCalculator();
