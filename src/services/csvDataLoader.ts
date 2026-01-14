/**
 * CSV 数据加载器
 * 
 * 负责加载和解析惠达供应链的 CSV 数据文件
 */

import type { MaterialData, BOMData, ProductData } from '../types/stagnantInventory';

/**
 * 库存数据接口
 */
interface InventoryData {
    materialCode: string;
    materialName: string;
    inventoryData: number;
    availableQuantity: number;
    safetyStock: number;
    lastInboundTime: string;
    inventoryAge: number;
    updateTime: string;
}

/**
 * 解析 CSV 文本为对象数组
 */
function parseCSV(csvText: string): Record<string, string>[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // 解析表头
    const headers = lines[0].split(',').map(h => h.trim().replace(/\r$/, ''));

    // 解析数据行
    const data: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/\r$/, ''));
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        data.push(row);
    }

    return data;
}

/**
 * 供应链数据加载器
 */
export class SupplyChainDataLoader {
    private materialsCache: Map<string, MaterialData> = new Map();
    private bomsCache: BOMData[] = [];
    private productsCache: Map<string, ProductData> = new Map();
    private inventoryCache: Map<string, InventoryData> = new Map();

    /**
     * 加载所有数据
     */
    async loadAll(): Promise<void> {
        await Promise.all([
            this.loadInventory(), // 先加载库存
            this.loadBOMs(),
            this.loadProducts(),
        ]);

        // 然后加载物料（需要库存数据）
        await this.loadMaterials();
    }

    /**
     * 加载库存信息
     */
    async loadInventory(): Promise<Map<string, InventoryData>> {
        try {
            const response = await fetch('/HD供应链/库存信息_fixed.csv');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            this.inventoryCache.clear();

            for (const row of rows) {
                const materialCode = row.material_code;
                if (!materialCode) continue;

                const inventory: InventoryData = {
                    materialCode,
                    materialName: row.material_name || '',
                    inventoryData: parseFloat(row.inventory_data) || 0,
                    availableQuantity: parseFloat(row.available_quantity) || 0,
                    safetyStock: parseFloat(row.safety_stock) || 0,
                    lastInboundTime: row.last_inbound_time || '',
                    inventoryAge: parseInt(row.inventory_age) || 0,
                    updateTime: row.update_time || '',
                };

                this.inventoryCache.set(materialCode, inventory);
            }

            console.log(`✅ 加载库存信息: ${this.inventoryCache.size} 条`);
            return this.inventoryCache;
        } catch (error) {
            console.error('❌ 加载库存信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载物料信息
     * 
     * 📝 注意：
     * 1. 先从物料表加载（有单价信息）
     * 2. 再从库存表补充（可能有物料表中没有的物料）
     * 3. 当前所有有库存的物料都视为"呆滞料"
     */
    async loadMaterials(): Promise<Map<string, MaterialData>> {
        try {
            const response = await fetch('/HD供应链/物料信息.csv');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            this.materialsCache.clear();

            // 第一步：从物料表加载物料（有单价信息）
            for (const row of rows) {
                const materialCode = row.material_code;
                if (!materialCode) continue;

                // 获取库存信息
                const inventory = this.inventoryCache.get(materialCode);

                const currentStock = inventory?.availableQuantity || 0;
                const safetyStock = inventory?.safetyStock || 0;
                const inventoryAge = inventory?.inventoryAge || 0;

                // 📌 当前逻辑：所有有库存的都视为"呆滞料"
                const isStagnant = currentStock > 0;

                const material: MaterialData = {
                    code: materialCode,
                    name: row.material_name || '',
                    specification: row.specification || '',
                    type: row.material_type || '',
                    unitPrice: parseFloat(row.unit_price) || 0,

                    // 库存相关（从库存表获取）
                    isStagnant,
                    storageDays: inventoryAge,
                    currentStock,
                    safetyStock,
                };

                this.materialsCache.set(materialCode, material);
            }

            // 第二步：从库存表补充物料（物料表中没有的）
            for (const [materialCode, inventory] of this.inventoryCache) {
                // 排除产品代码（T01 开头）
                if (materialCode.startsWith('T01')) continue;

                // 如果已经从物料表加载过，跳过
                if (this.materialsCache.has(materialCode)) continue;

                // 如果没有库存，跳过
                if (inventory.availableQuantity <= 0) continue;

                // 从库存表获取基本信息
                const material: MaterialData = {
                    code: materialCode,
                    name: inventory.materialName || materialCode,
                    specification: '',
                    type: '未知',
                    unitPrice: 0, // 无单价信息

                    isStagnant: true, // 有库存就是呆滞
                    storageDays: inventory.inventoryAge || 0,
                    currentStock: inventory.availableQuantity,
                    safetyStock: inventory.safetyStock || 0,
                };

                this.materialsCache.set(materialCode, material);
                console.log(`  📦 从库存表补充物料: ${materialCode} (${material.name})`);
            }

            // 统计有库存的物料
            const materialsWithStock = Array.from(this.materialsCache.values()).filter(m => (m.currentStock || 0) > 0);
            const totalStockValue = materialsWithStock.reduce((sum, m) => sum + (m.currentStock || 0) * m.unitPrice, 0);

            console.log(`✅ 加载物料信息: ${this.materialsCache.size} 条`);
            console.log(`📦 有库存的物料: ${materialsWithStock.length} 种`);
            console.log(`💰 库存总价值: ¥${totalStockValue.toLocaleString()}`);

            return this.materialsCache;
        } catch (error) {
            console.error('❌ 加载物料信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载 BOM 信息
     */
    async loadBOMs(): Promise<BOMData[]> {
        try {
            const response = await fetch('/HD供应链/产品BOM信息.csv');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            this.bomsCache = rows.map(row => ({
                bomNumber: row.bom_number || '',
                parentCode: row.parent_code || '',
                parentName: row.parent_name || '',
                childCode: row.child_code || '',
                childName: row.child_name || '',
                childQuantity: parseFloat(row.child_quantity) || 0,
                unit: row.unit || '',
                lossRate: parseFloat(row.loss_rate) || 0,
                alternativeGroup: row.alternative_group || '',
                alternativePart: row.alternative_part || '',
            }));

            console.log(`✅ 加载 BOM 信息: ${this.bomsCache.length} 条`);
            return this.bomsCache;
        } catch (error) {
            console.error('❌ 加载 BOM 信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载产品信息
     */
    async loadProducts(): Promise<Map<string, ProductData>> {
        try {
            const response = await fetch('/HD供应链/产品信息.csv');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            this.productsCache.clear();

            for (const row of rows) {
                const productCode = row.product_code;
                if (!productCode) continue;

                const product: ProductData = {
                    code: productCode,
                    name: row.product_name || '',
                    model: row.product_model || '',
                    series: row.product_series || '',
                    type: row.product_type || '',
                    amount: parseFloat(row.amount) || 0,
                };

                this.productsCache.set(productCode, product);
            }

            console.log(`✅ 加载产品信息: ${this.productsCache.size} 条`);
            return this.productsCache;
        } catch (error) {
            console.error('❌ 加载产品信息失败:', error);
            throw error;
        }
    }

    /**
     * 获取物料信息
     */
    getMaterial(code: string): MaterialData | undefined {
        return this.materialsCache.get(code);
    }

    /**
     * 获取所有物料
     */
    getAllMaterials(): MaterialData[] {
        return Array.from(this.materialsCache.values());
    }

    /**
     * 获取呆滞物料
     */
    getStagnantMaterials(): MaterialData[] {
        return this.getAllMaterials().filter(m => m.isStagnant);
    }

    /**
     * 获取 BOM 数据
     */
    getBOMs(): BOMData[] {
        return this.bomsCache;
    }

    /**
     * 获取产品信息
     */
    getProduct(code: string): ProductData | undefined {
        return this.productsCache.get(code);
    }

    /**
     * 获取所有产品
     */
    getAllProducts(): ProductData[] {
        return Array.from(this.productsCache.values());
    }

    /**
     * 获取产品的 BOM 项
     */
    getProductBOMItems(productCode: string): BOMData[] {
        return this.bomsCache.filter(bom => bom.parentCode === productCode);
    }

    /**
     * 获取库存信息
     */
    getInventory(materialCode: string): InventoryData | undefined {
        return this.inventoryCache.get(materialCode);
    }
}

// 创建单例实例
export const dataLoader = new SupplyChainDataLoader();
