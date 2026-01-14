// ProductAssemblyCalculator Service to handle BOM and Inventory logic
import Papa from 'papaparse';

interface BOMItem {
    bom_number: string;
    parent_code: string;
    parent_name: string;
    child_code: string;
    child_name: string;
    child_quantity: number;
    unit: string;
    loss_rate: number;
    alternative_group?: string;
    alternative_part?: string;
}

export interface AssemblyNode {
    code: string;
    name: string;
    inventory: number;
    totalAvailable: number; // inventory + producible
    producible: number;
    requiredPerSet: number; // For the parent
    maxSets: number; // How many sets of PARENT can be supported by this node/group
    limitingFactor?: AssemblyNode;
    children: AssemblyNode[];
    isAlternativeGroup?: boolean;
    groupName?: string;
    unit: string;
}

export class ProductAssemblyCalculator {
    private bomData: BOMItem[] = [];
    private inventoryData: Map<string, number> = new Map();
    private materialNames: Map<string, string> = new Map();
    private initialized = false;

    async init() {
        if (this.initialized) return;

        try {
            const [bomResponse, inventoryResponse] = await Promise.all([
                fetch('/data/产品BOM信息.csv'),
                fetch('/data/库存信息_fixed.csv')
            ]);

            const bomText = await bomResponse.text();
            const inventoryText = await inventoryResponse.text();

            this.parseBOM(bomText);
            this.parseInventory(inventoryText);
            this.initialized = true;
        } catch (error) {
            console.error("Failed to initialize ProductAssemblyCalculator", error);
        }
    }

    private parseBOM(csvText: string) {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.bomData = results.data.map((row: any) => {
                    // Cache names
                    if (row.parent_code && row.parent_name) this.materialNames.set(row.parent_code, row.parent_name);
                    if (row.child_code && row.child_name) this.materialNames.set(row.child_code, row.child_name);

                    return {
                        ...row,
                        child_quantity: parseFloat(row.child_quantity) || 0,
                        loss_rate: parseFloat(row.loss_rate) || 0,
                    };
                }) as BOMItem[];
            }
        });
    }

    private parseInventory(csvText: string) {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.inventoryData.clear();
                results.data.forEach((row: any) => {
                    const qty = parseFloat(row.available_quantity) || parseFloat(row.inventory_data) || 0;
                    if (row.material_code) {
                        this.inventoryData.set(row.material_code, qty);
                        if (row.material_name) this.materialNames.set(row.material_code, row.material_name);
                    }
                });
            }
        });
    }

    calculateMaxAssemblable(productCode: string): number {
        const root = this.calculateAssemblyTree(productCode);
        return root.totalAvailable;
    }

    calculateAssemblyTree(productCode: string, depth = 0, requiredPerSet = 1): AssemblyNode {
        const name = this.materialNames.get(productCode) || productCode;
        const inventory = this.inventoryData.get(productCode) || 0;
        const unit = this.bomData.find(b => b.child_code === productCode)?.unit || '个';

        // Check recursion limit
        if (depth > 5) {
            return {
                code: productCode,
                name,
                inventory,
                totalAvailable: inventory,
                producible: 0,
                requiredPerSet,
                maxSets: Infinity, // Doesn't limit
                children: [],
                unit
            };
        }

        const children = this.bomData.filter(item => item.parent_code === productCode);

        // Map to group objects
        const groups: Map<string, BOMItem[]> = new Map();
        children.forEach(child => {
            let key = child.child_code;
            if (child.alternative_group && child.alternative_group !== '0') {
                key = `GROUP_${child.alternative_group}`;
            }
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(child);
        });

        const childNodes: AssemblyNode[] = [];
        let minProducibleSets = Infinity;
        let limitingChild: AssemblyNode | undefined = undefined;

        // If no children, it's a raw material (or leaf)
        if (groups.size === 0) {
            return {
                code: productCode,
                name,
                inventory,
                totalAvailable: inventory,
                producible: 0,
                requiredPerSet,
                maxSets: Math.floor(inventory / requiredPerSet), // Limit enforced on parent
                children: [],
                unit
            };
        }

        // Process each group
        for (const [key, items] of groups) {
            // Determine if it's an alternative group
            const isAltGroup = items.length > 1 || (items[0].alternative_group && items[0].alternative_group !== '0');
            const mainItem = items.find(i => !i.alternative_part) || items[0];
            const groupRequiredPerSet = mainItem.child_quantity;

            let groupTotalAvailable = 0;
            const groupChildren: AssemblyNode[] = [];

            for (const item of items) {
                const childNode = this.calculateAssemblyTree(item.child_code, depth + 1, item.child_quantity);
                groupTotalAvailable += childNode.totalAvailable;
                groupChildren.push(childNode);
            }

            // How many sets of THIS product can this group support?
            const groupCapableSets = Math.floor(groupTotalAvailable / groupRequiredPerSet);

            if (groupCapableSets < minProducibleSets) {
                minProducibleSets = groupCapableSets;
            }

            if (isAltGroup) {
                const groupNode: AssemblyNode = {
                    code: key,
                    name: `替代组 ${items[0].alternative_group}`,
                    inventory: 0, // Virtual
                    totalAvailable: groupTotalAvailable,
                    producible: 0, // Virtual
                    requiredPerSet: groupRequiredPerSet,
                    maxSets: groupCapableSets,
                    children: groupChildren,
                    isAlternativeGroup: true,
                    unit: items[0].unit
                };
                if (groupCapableSets === minProducibleSets) limitingChild = groupNode;
                childNodes.push(groupNode);
            } else {
                // Single item
                // The childNode we calculated above passed 'requiredPerSet' purely for info? 
                // No, childNode.maxSets was not calculated relative to THIS parent yet.
                // Recalculate usage-based limit.
                const childNode = groupChildren[0];
                childNode.requiredPerSet = groupRequiredPerSet; // Update generic call
                childNode.maxSets = groupCapableSets;

                if (groupCapableSets === minProducibleSets) limitingChild = childNode;
                childNodes.push(childNode);
            }
        }

        const producible = minProducibleSets === Infinity ? 0 : minProducibleSets;

        return {
            code: productCode,
            name,
            inventory,
            totalAvailable: inventory + producible,
            producible,
            requiredPerSet,
            maxSets: Math.floor((inventory + producible) / requiredPerSet),
            limitingFactor: limitingChild,
            children: childNodes,
            unit
        };
    }
}

export const productAssemblyCalculator = new ProductAssemblyCalculator();
