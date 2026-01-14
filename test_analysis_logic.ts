
// Mock Interfaces
interface BOMNode {
    code: string;
    name: string;
    level: number;
    quantity: number; // Qty per parent
    unitPrice: number;
    currentStock: number;
    availableStock: number;
    storageDays: number;
    stockStatus?: string;
    children: BOMNode[];
    substitutes: BOMNode[];
}

interface ProductBOMTree {
    productCode: string;
    productName: string;
    rootNode: BOMNode;
}

interface InventoryRaw {
    material_code: string;
    current_stock: number;
}

interface MRPResult {
    replenishmentCost: number;     // 补货成本（消耗现有库存）
    newProcurementCost: number;    // 新增采购成本（缺料采购）
    newStagnantCost: number;       // 新增呆滞成本（采购产生的剩余库存）
}

// ==========================================
// The Logic to Test (Copied & Adapted)
// ==========================================

function calculateMRPCosts(
    productCode: string,
    bomData: ProductBOMTree,
    quantity: number,
    inventoryMap: Map<string, InventoryRaw>, // 原始库存快照
    withMOQ: boolean = false,
    defaultMOQ: number = 100
): MRPResult {
    // 克隆库存状态
    const tempStock = new Map<string, number>();
    for (const [code, inv] of inventoryMap) {
        tempStock.set(code, inv.current_stock);
    }

    // 待处理队列 { code, qty }
    const queue: { code: string; qty: number }[] = [];

    // 初始需求：成品的数量
    queue.push({ code: productCode, qty: quantity });

    let totalReplenishmentCost = 0;
    let totalProcurementCost = 0;
    let totalNewStagnantCost = 0;

    // 索引 BOM
    const bomNodeMap = new Map<string, BOMNode>();
    function indexBOM(node: BOMNode) {
        if (!bomNodeMap.has(node.code)) {
            bomNodeMap.set(node.code, node);
        }
        node.children.forEach(indexBOM);
        node.substitutes.forEach(indexBOM);
    }
    indexBOM(bomData.rootNode);

    // BFS
    while (queue.length > 0) {
        const item = queue.shift()!;
        const node = bomNodeMap.get(item.code);

        if (!node) continue;

        // 1. 获取当前库存
        const currentStock = tempStock.get(item.code) || 0;
        const unitPrice = node.unitPrice || 0;

        // 2. 扣减库存 (Netting)
        const usedStock = Math.min(currentStock, item.qty);
        // let netRequirement = item.qty - usedStock; // ORIGINAL
        const netRequirement = Math.max(0, item.qty - usedStock); // Safer

        // 更新临时库存
        // BUG POTENTIAL: If multiple parents need the same child (common part), 
        // we process them sequentially. tempStock updates handle this correctly.
        tempStock.set(item.code, currentStock - usedStock);

        // 3. 计算补货成本 (消耗的库存价值)
        if (usedStock > 0) {
            totalReplenishmentCost += usedStock * unitPrice;
        }

        // 4. 处理净需求
        if (netRequirement > 0) {
            if (node.children.length === 0) {
                // Leaf node -> Purchase
                let purchaseQty = netRequirement;

                // 处理起订量
                // 处理起订量 (作为最小包装量/Batch Size处理，即向上取整)
                if (withMOQ && defaultMOQ > 0) {
                    purchaseQty = Math.ceil(netRequirement / defaultMOQ) * defaultMOQ;
                }

                totalProcurementCost += purchaseQty * unitPrice;

                // 计算新增呆滞（购买量 - 实际需求量）
                const leftoverQty = purchaseQty - netRequirement;
                if (leftoverQty > 0) {
                    totalNewStagnantCost += leftoverQty * unitPrice;
                }
            } else {
                // Assembly -> Expand
                for (const child of node.children) {
                    const childRequiredQty = netRequirement * child.quantity;
                    queue.push({ code: child.code, qty: childRequiredQty });
                }
            }
        }
    }

    return {
        replenishmentCost: totalReplenishmentCost,
        newProcurementCost: totalProcurementCost,
        newStagnantCost: totalNewStagnantCost
    };
}

// ==========================================
// Test Cases
// ==========================================

function runTests() {
    console.log("Starting Tests...");

    // Case 1: Simple One Level
    // Product P -> Material M (Qty 1)
    // M: Price 10. Stock 0. MOQ 100.
    // Producing 10 P.
    // Need 10 M. Stock 0. Net 10.
    // Purchase 100 (MOQ). Cost 1000.
    // Stagnant: (100 - 10) * 10 = 900.

    const nodeM: BOMNode = {
        code: 'M', name: 'Material M', level: 1, quantity: 1, unitPrice: 10,
        currentStock: 0, availableStock: 0, storageDays: 0, children: [], substitutes: []
    };
    const nodeP: BOMNode = {
        code: 'P', name: 'Product P', level: 0, quantity: 1, unitPrice: 0, // Product has no internal cost usually? Or selling price.
        currentStock: 0, availableStock: 0, storageDays: 0, children: [nodeM], substitutes: []
    };
    const bomSimple: ProductBOMTree = { productCode: 'P', productName: 'Product P', rootNode: nodeP };
    const invSimple = new Map<string, InventoryRaw>();
    invSimple.set('M', { material_code: 'M', current_stock: 0 });
    invSimple.set('P', { material_code: 'P', current_stock: 0 });

    const res1 = calculateMRPCosts('P', bomSimple, 10, invSimple, true, 100);
    console.log("Test 1 (Simple MOQ):",
        res1.replenishmentCost === 0 &&
            res1.newProcurementCost === 1000 &&
            res1.newStagnantCost === 900 ? "PASS" : `FAIL: ${JSON.stringify(res1)}`);


    // Case 2: Sub-assembly Netting
    // Product P -> Sub S (Qty 1) -> Mat M (Qty 1)
    // S: Stock 5.
    // M: Stock 0. Price 10. MOQ 100.
    // Producing 10 P.
    // Need 10 S. Have 5 S. Net Need 5 S.
    // Expand 5 S -> Need 5 M.
    // M: Need 5. Purchase 100 (MOQ).
    // Procure: 100 * 10 = 1000.
    // Replenish: 5 S consumed. If S has price? Say S price is 0 for now (internal). 
    // Wait, usually S has value. Let's say S price = 20.
    // Replenish Cost = 5 * 20 = 100.
    // Stagnant: (100 - 5) * 10 = 950.

    const nodeM2: BOMNode = { ...nodeM };
    const nodeS: BOMNode = {
        code: 'S', name: 'Sub S', level: 1, quantity: 1, unitPrice: 20,
        currentStock: 5, availableStock: 5, storageDays: 0, children: [nodeM2], substitutes: []
    };
    const nodeP2: BOMNode = { ...nodeP, children: [nodeS] };
    const bomSub: ProductBOMTree = { productCode: 'P', productName: 'Product P', rootNode: nodeP2 };

    const invSub = new Map<string, InventoryRaw>();
    invSub.set('M', { material_code: 'M', current_stock: 0 });
    invSub.set('S', { material_code: 'S', current_stock: 5 });
    invSub.set('P', { material_code: 'P', current_stock: 0 });

    const res2 = calculateMRPCosts('P', bomSub, 10, invSub, true, 100);
    console.log("Test 2 (Sub Netting):",
        res2.replenishmentCost === 100 && // 5 units of S * 20
            res2.newProcurementCost === 1000 &&
            res2.newStagnantCost === 950 ? "PASS" : `FAIL: ${JSON.stringify(res2)}`);

    // Case 3: Common Material (Double Counting Check)
    // P -> A (Qty 1) -> M (Qty 1)
    // P -> B (Qty 1) -> M (Qty 1)
    // Need 10 P.
    // Need 10 A -> Need 10 M.
    // Need 10 B -> Need 10 M.
    // Total M need: 20.
    // M Stock: 15.
    // Net M need: 20 - 15 = 5.
    // MOQ 100. Purchase 100.
    // Stagnant: (100 - 5) * 10 = 950.
    // Warning: BFS Queue might process A then B.
    // 1. Process A. Need 10 M. Stock 15. Use 10. Net 0.
    // 2. Process B. Need 10 M. Stock 5 (Remaining). Use 5. Net 5.
    // Net 5 -> Purchase 100.
    // Works correctly?

    const nodeM3: BOMNode = { ...nodeM, currentStock: 15 };
    const nodeA: BOMNode = { code: 'A', name: 'A', level: 1, quantity: 1, unitPrice: 0, currentStock: 0, availableStock: 0, storageDays: 0, children: [nodeM3], substitutes: [] };
    const nodeB: BOMNode = { code: 'B', name: 'B', level: 1, quantity: 1, unitPrice: 0, currentStock: 0, availableStock: 0, storageDays: 0, children: [nodeM3], substitutes: [] }; // M is same obj
    const nodeP3: BOMNode = { ...nodeP, children: [nodeA, nodeB] };
    const bomCommon: ProductBOMTree = { productCode: 'P', productName: 'Product P', rootNode: nodeP3 };

    // Need to handle shared node reference or just same code in Map?
    // The code uses `inventoryMap` to build `tempStock`.
    // The BOM tree navigation uses `bomNodeMap`.
    // `bomNodeMap` keys by code.
    // If Logic uses `bomNodeMap.get(item.code)`, and both A and B have child "M".
    // If the BOM tree object structure shares the `M` node reference, it's fine.
    // If they are different objects with same code, `indexBOM` will overwrite one. 
    // But `tempStock` is by code. So it works.

    const invCommon = new Map<string, InventoryRaw>();
    invCommon.set('M', { material_code: 'M', current_stock: 15 });

    const res3 = calculateMRPCosts('P', bomCommon, 10, invCommon, true, 100);
    // Cost:
    // Replenishment: using 15 M. 15 * 10 = 150.
    // Procurement: 100 * 10 = 1000.
    // Stagnant: (100 - 5) * 10 = 950.
    console.log("Test 3 (Common Part):",
        res3.replenishmentCost === 150 &&
            res3.newProcurementCost === 1000 &&
            res3.newStagnantCost === 950 ? "PASS" : `FAIL: ${JSON.stringify(res3)}`);

    // Case 4: Step Alignment Check (The "Always 0" Bug)
    // Product P -> M (Qty 1). MOQ 100.
    // If we sample at 100, 200, 300... Stagnant is 0.
    // If we sample at 120... Stagnant is 80.

    console.log("\nTest 4 (Step Alignment):");
    const nodeM4: BOMNode = { ...nodeM, currentStock: 0 };
    const bomAlignment: ProductBOMTree = { productCode: 'P', productName: 'Product P', rootNode: { ...nodeP, children: [nodeM4] } };
    const invAlignment = new Map<string, InventoryRaw>();

    // Scenario A: Aligned Step (Like current logic if max is large)
    // maxX = 3000. Step = 200.
    const qtyAligned = 200;
    const resAligned = calculateMRPCosts('P', bomAlignment, qtyAligned, invAlignment, true, 100);
    console.log(`Qty ${qtyAligned} (Aligned): NewStagnant=${resAligned.newStagnantCost} (Expected 0) -> ${resAligned.newStagnantCost === 0 ? "CONFIRMED" : "WEIRD"}`);

    // Scenario B: Unaligned Step
    // qty = 250.
    const qtyUnaligned = 250;
    const resUnaligned = calculateMRPCosts('P', bomAlignment, qtyUnaligned, invAlignment, true, 100);
    // Need 250. Buy 300. Excess 50. Cost 50 * 10 = 500.
    console.log(`Qty ${qtyUnaligned} (Unaligned): NewStagnant=${resUnaligned.newStagnantCost} (Expected 500) -> ${resUnaligned.newStagnantCost === 500 ? "PASS" : `FAIL ${resUnaligned.newStagnantCost}`}`);
}

runTests();
