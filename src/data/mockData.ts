/**
 * Mock数据占位文件
 * 
 * 此文件仅作为占位符，导出空数组和空对象
 * 实际数据需要通过 API 获取（通用模式或大脑模式）
 */

import type { Supplier, Material, MaterialStock, Product, Order } from '../types/ontology';
import type {
    Supplier360Scorecard,
    SupplierEvaluation,
    MainMaterialSupplier,
    SupplyRiskAlert,
    ProductLifecycleAssessment,
    RiskAssessment,
    AlternativeSupplier,
    User,
    Role,
    EntityConfig,
    ActionHistory,
} from '../types/ontology';
import type { Opportunity } from '../types/database';

// ============================================================================
// ⚠️ 警告: 此文件仅保留类型导出，所有数据均为空
// 实际数据请通过 API 获取
// ============================================================================

// 供应商数据（空）
export const suppliersData: Supplier[] = [];

// 物料数据（空）
export const materialsData: Material[] = [];

// 物料库存数据（空）
export const materialStocksData: MaterialStock[] = [];

// 产品数据（空）
export const productsData: Product[] = [];

// 订单数据（空）
export const ordersData: Order[] = [];

// 商机数据（空）
export const opportunitiesData: Opportunity[] = [];

// 行动执行历史数据（空）
export const actionHistories: ActionHistory[] = [];

/**
 * 生成随机模拟数据的占位函数
 * @deprecated 请使用真实 API 数据
 */
export const generateRandomMockData = (
    field: 'qualityRating' | 'riskRating' | 'onTimeDeliveryRate' | 'annualPurchaseAmount',
    _seed?: number
): number => {
    switch (field) {
        case 'qualityRating':
            return 85;
        case 'riskRating':
            return 20;
        case 'onTimeDeliveryRate':
            return 90;
        case 'annualPurchaseAmount':
            return 1000000;
        default:
            return 0;
    }
};

// 供应商评估数据（空）
export const supplier360ScorecardsData: Supplier360Scorecard[] = [];
export const supplierEvaluationsData: SupplierEvaluation[] = [];
export const mainMaterialSuppliersData: MainMaterialSupplier[] = [];
export const alternativeSuppliersData: AlternativeSupplier[] = [];
export const riskAssessmentsData: RiskAssessment[] = [];

// 扩展实体数据（空）
export const warehousesData: any[] = [];
export const factoriesData: any[] = [];
export const customersData: any[] = [];
export const logisticsData: any[] = [];

// 产品供应优化数据（空）
export const supplyRiskAlertsData: SupplyRiskAlert[] = [];
export const productLifecycleAssessmentsData: ProductLifecycleAssessment[] = [];

// 用户和角色数据
export const usersData: Record<number, User> = {
    1: {
        userId: 1,
        name: '管理员',
        role: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '👤',
        department: '供应链中心',
        status: 'active',
    },
};

export const rolesData: Record<string, Role> = {
    admin: {
        roleId: 'admin',
        name: '供应链管理员',
        color: 'purple',
    },
};

// 实体配置映射（空）
export const entityConfigs = new Map<string, EntityConfig>();

/**
 * 重新创建所有模拟数据记录
 * @deprecated 此函数现在不执行任何操作，数据通过 API 获取
 */
export const recreateAllMockDataRecords = (): void => {
    console.log('[mockData] recreateAllMockDataRecords 已禁用，请通过 API 获取数据');
};
