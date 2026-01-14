/**
 * 惠达供应链供应商数据加载器
 * 负责从 public/data/供应商信息.csv 加载并转换为供应商评估格式
 */

import type { MainMaterialSupplier, Supplier360Scorecard, RiskLevel, AlternativeSupplier } from '../types/ontology';
import { httpClient } from '../api/httpClient';

/**
 * 惠达BOM原始数据结构
 */
interface HDBOMRaw {
    bom_number: string;
    parent_code: string;
    parent_name: string;
    child_code: string;
    child_name: string;
    child_quantity: string;
    unit: string;
    loss_rate: string;
    alternative_group: string;
    alternative_part: string;
}

/**
 * 加载惠达BOM CSV数据
 */
/**
 * 加载惠达BOM API数据 (View: 2004376134629285892)
 */
async function loadHDBOMData(): Promise<HDBOMRaw[]> {
    try {
        console.log('[HD BOM加载] 开始从API加载数据 (View: 2004376134629285892)...');
        const url = '/proxy-metric/v1/data-views/2004376134629285892?include_view=true';
        const response = await httpClient.postAsGet<any>(url, { limit: 2000, offset: 0 });

        const rawData = response.data?.entries || response.data || [];

        if (Array.isArray(rawData)) {
            console.log('[HD BOM加载] 加载成功:', rawData.length, '条记录');
            return rawData.map((item: any) => ({
                bom_number: item.bom_number || '',
                parent_code: item.parent_code || '',
                parent_name: item.parent_name || '',
                child_code: item.child_code || '',
                child_name: item.child_name || '',
                child_quantity: item.quantity ? String(item.quantity) : '0', // API likely uses 'quantity'
                unit: item.unit || '',
                loss_rate: item.loss_rate || '0',
                alternative_group: item.alternative_group || '',
                alternative_part: item.alternative_part || '',
            }));
        } else {
            console.warn('[HD BOM加载] 返回数据格式异常', response);
            return [];
        }
    } catch (error) {
        console.error('[HD BOM加载] 加载异常:', error);
        return [];
    }
}

/**
 * 获取指定物料的备选供应商
 * 基于BOM中的alternative_group和alternative_part字段
 */
export async function getHDAlternativeSuppliers(
    materialCode: string,
    limit: number = 5
): Promise<AlternativeSupplier[]> {
    try {
        console.log(`[HD备选] 查找物料 ${materialCode} 的备选供应商`);

        // 1. 加载BOM数据和供应商数据
        const [bomData, supplierData] = await Promise.all([
            loadHDBOMData(),
            loadHDSupplierData()
        ]);

        if (bomData.length === 0 || supplierData.length === 0) {
            return [];
        }

        // 2. 找到当前物料所属的替代组
        // 注意：当前物料可能是主料（alternative_part为空），也可能是替代料
        const targetBOMItems = bomData.filter(item =>
            item.child_code === materialCode && item.alternative_group
        );

        if (targetBOMItems.length === 0) {
            console.log(`[HD备选] 物料 ${materialCode} 未在BOM中找到替代组信息`);
            return [];
        }

        // 收集所有关联的替代组ID
        const groupIds = new Set(targetBOMItems.map(item => item.alternative_group));

        // 3. 找到同组中的其他“替代”物料
        const substituteMaterialCodes = new Set<string>();

        bomData.forEach(item => {
            if (groupIds.has(item.alternative_group) &&
                item.child_code !== materialCode && // 排除自己
                item.alternative_part === '替代') { // 必须标记为替代
                substituteMaterialCodes.add(item.child_code);
            }
        });

        if (substituteMaterialCodes.size === 0) {
            console.log(`[HD备选] 物料 ${materialCode} 在组 ${Array.from(groupIds)} 中无替代料`);
            return [];
        }

        console.log(`[HD备选] 找到替代物料:`, Array.from(substituteMaterialCodes));

        // 4. 查找这些替代物料的供应商
        const alternatives: AlternativeSupplier[] = [];
        const aggregatedSuppliers = aggregateSupplierData(supplierData);

        substituteMaterialCodes.forEach(subCode => {
            // 找到提供该替代料的供应商
            // 原始数据中 provided_material_code 对应 child_code
            const suppliers = aggregatedSuppliers.filter(s =>
                s.materials.some(m => m.materialCode === subCode)
            );

            suppliers.forEach(supplier => {
                const materialInfo = supplier.materials.find(m => m.materialCode === subCode);
                if (!materialInfo) return;

                const riskLevel = calculateRiskLevel(supplier);
                const overallScore = calculateSupplierScore(supplier);

                alternatives.push({
                    supplierId: supplier.supplierId,
                    supplierName: supplier.supplierName,
                    materialCode: subCode,
                    similarityScore: 100, // BOM明确定义的替代料，视为完全匹配
                    recommendationReason: `BOM定义的替代料 (${materialInfo.materialName})`,
                    comparison: {
                        onTimeDeliveryRate: 85 + Math.random() * 10,
                        quality: overallScore,
                        price: materialInfo.isLowestPrice ? 100 : 80, // 最低价得满分
                        responseSpeed: calculatePaymentScore(supplier.avgPaymentDays), // 使用付款评分作为响应速度的代理（暂时的）
                        riskLevel: riskLevel
                    },
                    availability: true
                });
            });
        });

        // 去重 (同一个供应商可能供应多个替代料)
        const uniqueAlternatives = Array.from(
            new Map(alternatives.map(item => [item.supplierId, item])).values()
        );

        console.log(`[HD备选] 找到 ${uniqueAlternatives.length} 个备选供应商`);
        return uniqueAlternatives.slice(0, limit);

    } catch (error) {
        console.error('[HD备选] 获取备选供应商失败:', error);
        return [];
    }
}


/**
 * 惠达供应商原始数据结构
 */
export interface HDSupplierRaw {
    supplier: string;
    supplier_code: string;
    unit_price_with_tax: string;
    payment_terms: string;
    is_lowest_price_alternative: string;
    is_basic_material: string;
    provided_material_code: string;
    provided_material_name: string;
}

/**
 * 供应商聚合数据
 */
interface HDSupplierAggregated {
    supplierId: string;
    supplierName: string;
    supplierCode: string;
    materials: {
        materialCode: string;
        materialName: string;
        unitPrice: number;
        isLowestPrice: boolean;
        isBasicMaterial: boolean;
    }[];
    totalPurchaseAmount: number;
    avgPaymentDays: number;
    lowestPriceCount: number;
    basicMaterialCount: number;
    materialCount: number;
}

/**
 * 解析CSV文本为对象数组
 */
function parseCSV<T>(csvText: string): T[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
    const result: T[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',');
        const obj: Record<string, string> = {};

        headers.forEach((header, index) => {
            obj[header] = values[index]?.trim().replace(/\r/g, '') || '';
        });

        result.push(obj as T);
    }

    return result;
}

/**
 * 解析付款条件为天数
 */
function parsePaymentTermsToDays(paymentTerms: string): number {
    if (!paymentTerms) return 30;

    const match = paymentTerms.match(/(\d+)天?/);
    if (match) {
        return parseInt(match[1]);
    }

    if (paymentTerms.includes('款到发货')) {
        return 0; // 预付款
    }

    return 30; // 默认30天
}

/**
 * 加载惠达供应商CSV数据
 */
/**
 * 加载惠达供应商API数据 (View: 2004376134633480193)
 */
async function loadHDSupplierData(): Promise<HDSupplierRaw[]> {
    try {
        console.log('[HD供应商加载] 开始从API加载数据 (View: 2004376134633480193)...');
        const url = '/proxy-metric/v1/data-views/2004376134633480193?include_view=true';
        const response = await httpClient.postAsGet<any>(url, { limit: 2000, offset: 0 });

        const rawData = response.data?.entries || response.data || [];

        if (Array.isArray(rawData)) {
            console.log('[HD供应商加载] 加载成功:', rawData.length, '条记录');
            return rawData.map((item: any) => ({
                supplier: item.supplier || item.supplier_name || '',
                supplier_code: item.supplier_code || '',
                unit_price_with_tax: item.unit_price_with_tax || '0',
                payment_terms: item.payment_terms || '',
                is_lowest_price_alternative: item.is_lowest_price_alternative || '否',
                is_basic_material: item.is_basic_material || '否',
                provided_material_code: item.provided_material_code || '',
                provided_material_name: item.provided_material_name || '',
            }));
        } else {
            console.warn('[HD供应商加载] 返回数据格式异常', response);
            return [];
        }
    } catch (error) {
        console.error('[HD供应商加载] 加载异常:', error);
        return [];
    }
}

/**
 * 聚合供应商数据
 */
function aggregateSupplierData(rawData: HDSupplierRaw[]): HDSupplierAggregated[] {
    const supplierMap = new Map<string, HDSupplierAggregated>();

    rawData.forEach(row => {
        const supplierKey = row.supplier_code || row.supplier;

        if (!supplierMap.has(supplierKey)) {
            supplierMap.set(supplierKey, {
                supplierId: `HD-SUP-${row.supplier_code}`,
                supplierName: row.supplier,
                supplierCode: row.supplier_code,
                materials: [],
                totalPurchaseAmount: 0,
                avgPaymentDays: 0,
                lowestPriceCount: 0,
                basicMaterialCount: 0,
                materialCount: 0,
            });
        }

        const supplier = supplierMap.get(supplierKey)!;
        const unitPrice = parseFloat(row.unit_price_with_tax) || 0;
        const isLowestPrice = row.is_lowest_price_alternative === '是';
        const isBasicMaterial = row.is_basic_material === '是';
        const paymentDays = parsePaymentTermsToDays(row.payment_terms);

        supplier.materials.push({
            materialCode: row.provided_material_code,
            materialName: row.provided_material_name,
            unitPrice,
            isLowestPrice,
            isBasicMaterial,
        });

        // 预估年度采购额：单价 × 1000（假设每年采购1000单位）
        supplier.totalPurchaseAmount += unitPrice * 1000;
        supplier.avgPaymentDays = (supplier.avgPaymentDays * supplier.materialCount + paymentDays) / (supplier.materialCount + 1);
        if (isLowestPrice) supplier.lowestPriceCount++;
        if (isBasicMaterial) supplier.basicMaterialCount++;
        supplier.materialCount++;
    });

    return Array.from(supplierMap.values());
}

/**
 * 计算付款条件评分
 */
function calculatePaymentScore(avgPaymentDays: number): number {
    // 付款周期越长越好（对采购方有利）
    if (avgPaymentDays >= 90) return 95;
    if (avgPaymentDays >= 60) return 85;
    if (avgPaymentDays >= 30) return 70;
    if (avgPaymentDays > 0) return 50;
    return 30; // 款到发货得分最低
}

/**
 * 计算供应商综合评分
 */
function calculateSupplierScore(supplier: HDSupplierAggregated): number {
    // 物料多样性 (0-100)
    const materialDiversity = Math.min(100, supplier.materialCount * 15);

    // 价格竞争力 (0-100): 最低价备选比例
    const priceCompetitiveness = supplier.materialCount > 0
        ? (supplier.lowestPriceCount / supplier.materialCount) * 100
        : 50;

    // 基础物料可靠性 (0-100): 基础物料比例
    const basicMaterialReliability = supplier.materialCount > 0
        ? (supplier.basicMaterialCount / supplier.materialCount) * 100
        : 50;

    // 付款条件评分 (0-100)
    const paymentTermsScore = calculatePaymentScore(supplier.avgPaymentDays);

    // 加权平均
    return Math.round(
        materialDiversity * 0.2 +
        priceCompetitiveness * 0.3 +
        basicMaterialReliability * 0.3 +
        paymentTermsScore * 0.2
    );
}

/**
 * 计算风险等级
 */
function calculateRiskLevel(supplier: HDSupplierAggregated): RiskLevel {
    let riskScore = 0;

    // 付款条件风险：预付款风险最高
    if (supplier.avgPaymentDays === 0) riskScore += 25;
    else if (supplier.avgPaymentDays <= 30) riskScore += 15;
    else if (supplier.avgPaymentDays <= 60) riskScore += 5;

    // 无最低价备选风险
    const lowestPriceRatio = supplier.materialCount > 0
        ? supplier.lowestPriceCount / supplier.materialCount
        : 0;
    if (lowestPriceRatio < 0.3) riskScore += 20;
    else if (lowestPriceRatio < 0.5) riskScore += 10;

    // 物料多样性风险：供应少量物料的供应商风险较高
    if (supplier.materialCount < 2) riskScore += 15;
    else if (supplier.materialCount < 4) riskScore += 5;

    if (riskScore >= 35) return 'high';
    if (riskScore >= 15) return 'medium';
    return 'low';
}

/**
 * 风险等级转评分
 */
function riskLevelToRating(riskLevel: RiskLevel): number {
    switch (riskLevel) {
        case 'low': return 20;
        case 'medium': return 50;
        case 'high': return 80;
        case 'critical': return 95;
        default: return 50;
    }
}

/**
 * 加载惠达供应商主要物料数据
 */
export async function loadHDMainMaterialsByPurchaseAmount(
    limit: number = 5
): Promise<MainMaterialSupplier[]> {
    try {
        const rawData = await loadHDSupplierData();

        if (rawData.length === 0) {
            console.warn('[HD供应商] 未加载到数据');
            return [];
        }

        // 聚合供应商数据
        const aggregatedSuppliers = aggregateSupplierData(rawData);

        // 按年度采购额排序
        const sortedSuppliers = aggregatedSuppliers
            .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount);

        // 转换为MainMaterialSupplier格式
        // 每个供应商取其采购额最高的物料
        const mainMaterials: MainMaterialSupplier[] = [];

        for (let i = 0; i < Math.min(limit, sortedSuppliers.length); i++) {
            const supplier = sortedSuppliers[i];
            const topMaterial = supplier.materials.sort((a, b) => b.unitPrice - a.unitPrice)[0];

            if (!topMaterial) continue;

            const riskLevel = calculateRiskLevel(supplier);
            const qualityScore = calculateSupplierScore(supplier);
            const onTimeDeliveryRate = 85 + Math.random() * 10; // 模拟准时交付率

            mainMaterials.push({
                materialCode: topMaterial.materialCode,
                materialName: topMaterial.materialName,
                supplierId: supplier.supplierId,
                supplierName: supplier.supplierName,
                currentStock: Math.round(1000 + Math.random() * 5000), // 模拟库存
                qualityRating: qualityScore,
                riskRating: riskLevelToRating(riskLevel),
                onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
                annualPurchaseAmount: supplier.totalPurchaseAmount,
                riskCoefficient: riskLevelToRating(riskLevel),
                qualityEvents: [], // 无质量事件数据
                rank: i + 1,
            });
        }

        console.log('[HD供应商] 转换完成:', mainMaterials.length, '条主要物料');
        return mainMaterials;
    } catch (error) {
        console.error('[HD供应商] 加载失败:', error);
        return [];
    }
}

/**
 * 加载惠达供应商360°评分卡
 */
export async function loadHDSupplierScorecard(
    supplierId: string
): Promise<Supplier360Scorecard | null> {
    try {
        const rawData = await loadHDSupplierData();

        if (rawData.length === 0) {
            return null;
        }

        // 聚合供应商数据
        const aggregatedSuppliers = aggregateSupplierData(rawData);

        // 查找指定供应商
        const supplier = aggregatedSuppliers.find(s => s.supplierId === supplierId);

        if (!supplier) {
            console.warn('[HD供应商] 未找到供应商:', supplierId);
            // 尝试模糊匹配
            const fuzzyMatch = aggregatedSuppliers.find(s =>
                s.supplierId.includes(supplierId) || supplierId.includes(s.supplierCode)
            );
            if (!fuzzyMatch) return null;
            return generateScorecard(fuzzyMatch);
        }

        return generateScorecard(supplier);
    } catch (error) {
        console.error('[HD供应商] 加载评分卡失败:', error);
        return null;
    }
}

/**
 * 生成供应商360°评分卡
 */
function generateScorecard(supplier: HDSupplierAggregated): Supplier360Scorecard {
    const riskLevel = calculateRiskLevel(supplier);
    const overallScore = calculateSupplierScore(supplier);
    const today = new Date().toISOString().split('T')[0];

    return {
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        evaluationDate: today,
        overallScore: overallScore,
        dimensions: {
            onTimeDeliveryRate: 85 + Math.random() * 10,
            qualityRating: overallScore,
            riskRating: riskLevelToRating(riskLevel),
            onTimeDeliveryRate2: 88 + Math.random() * 8,
            annualPurchaseAmount: supplier.totalPurchaseAmount,
            responseSpeed: 24 + Math.random() * 48, // 24-72小时响应
        },
        riskAssessment: {
            supplierId: supplier.supplierId,
            assessmentDate: today,
            overallRiskLevel: riskLevel,
            financialStatus: {
                score: 80 + Math.random() * 15,
                lastUpdated: new Date().toISOString(),
            },
            publicSentiment: {
                score: 75 + Math.random() * 20,
                source: 'manual',
                lastUpdated: new Date().toISOString(),
            },
            productionAnomalies: {
                count: Math.floor(Math.random() * 3),
                severity: riskLevel === 'high' ? 'medium' : 'low',
                source: 'manual',
                lastUpdated: new Date().toISOString(),
            },
            legalRisks: {
                score: 10 + Math.random() * 20,
                source: 'auto',
                lastUpdated: new Date().toISOString(),
                risks: [],
            },
        },
    };
}

/**
 * 获取所有惠达供应商列表（用于下拉选择）
 */
export async function loadHDSupplierList(): Promise<{ supplierId: string; supplierName: string }[]> {
    try {
        const rawData = await loadHDSupplierData();
        const aggregatedSuppliers = aggregateSupplierData(rawData);

        return aggregatedSuppliers
            .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount)
            .map(s => ({
                supplierId: s.supplierId,
                supplierName: s.supplierName,
            }));
    } catch (error) {
        console.error('[HD供应商] 加载供应商列表失败:', error);
        return [];
    }
}
