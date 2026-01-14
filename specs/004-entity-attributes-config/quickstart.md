# Quick Start Guide: 供应链对象属性配置

**Feature**: Supply Chain Entity Attributes Configuration  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This guide provides step-by-step instructions for populating entity configurations with complete attribute, relation, logic, action, and permission definitions for all 8 entity types in the configuration backend.

## Prerequisites

- TypeScript 5.9.3
- React 19.2.0
- Tailwind CSS v4.1.17
- Lucide React (icons)
- Existing codebase with:
  - `src/types/ontology.ts` (EntityConfig interface)
  - `src/data/mockData.ts` (entityConfigs Map, frontend entity arrays)
  - `src/utils/entityConfigService.ts` (existing service functions)
  - `src/components/config-backend/RightPanel.tsx` (existing UI component)

## Implementation Steps

### Step 1: Create Helper Functions for Default Configurations

**File**: `src/utils/entityConfigService.ts`

**Changes**: Add helper functions to get default attributes, relations, logic rules, actions, and permissions for each entity type.

```typescript
/**
 * Get default attributes for an entity type based on FR-009
 */
export const getDefaultAttributes = (entityType: EntityType): Record<string, any> => {
  const defaults: Record<EntityType, Record<string, any>> = {
    supplier: {
      supplierId: '',
      supplierName: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      supplyMaterials: [],
      qualityRating: 0,
      certification: [],
      riskLevel: 'low' as const,
    },
    material: {
      materialCode: '',
      materialName: '',
      applicableProducts: [],
      currentStock: 0,
      safetyStock: 0,
      supplier: '',
      unit: '',
      price: 0,
      category: '',
    },
    factory: {
      factoryCode: '',
      factoryName: '',
      location: '',
      productionLines: 0,
      totalCapacity: 0,
      capacityUtilization: 0,
      efficiency: 0,
      employeeCount: 0,
      productList: [],
      qualityPassRate: 0,
      equipmentStatus: 'operational' as const,
      certifications: [],
    },
    product: {
      productId: '',
      productName: '',
      BOM: [],
      lifecycleStage: 'Intro' as const,
      price: 0,
      currentInventory: 0,
      safetyStock: 0,
      series: '',
      specifications: {},
    },
    warehouse: {
      warehouseCode: '',
      warehouseName: '',
      location: '',
      capacity: 0,
      currentStock: 0,
      associatedFactory: '',
      storageType: 'normal' as const,
      temperatureControl: false,
    },
    order: {
      orderId: '',
      orderName: '',
      client: '',
      productId: '',
      quantity: 0,
      orderDate: '',
      dueDate: '',
      status: '',
      priority: 'medium' as const,
      deliveryAddress: '',
    },
    logistics: {
      logisticsId: '',
      logisticsName: '',
      carrier: '',
      transportMode: 'road' as const,
      serviceRegion: [],
      trackingNumber: '',
      estimatedDeliveryDate: '',
    },
    customer: {
      customerId: '',
      customerName: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      serviceRegion: [],
      orderHistory: [],
      creditRating: 'BBB' as const,
    },
  };
  return defaults[entityType] || {};
};

/**
 * Get default relations for an entity type based on FR-010
 */
export const getDefaultRelations = (entityType: EntityType): EntityRelation[] => {
  // Relations are calculated from frontend data, return empty array as template
  return [];
};

/**
 * Get default logic rules for an entity type based on FR-011
 */
export const getDefaultLogicRules = (entityType: EntityType): BusinessLogicRule[] => {
  const rules: Record<EntityType, BusinessLogicRule[]> = {
    supplier: [
      {
        ruleId: `supplier-quality-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '质量合格率验证',
        condition: 'qualityRating > 95',
        level: 'warning',
      },
      {
        ruleId: `supplier-risk-assessment-${Date.now()}`,
        ruleType: 'calculation',
        name: '风险等级计算',
        formula: 'calculateRiskLevel(qualityRating, deliveryPerformance, financialStatus)',
      },
      {
        ruleId: `supplier-delivery-performance-${Date.now()}`,
        ruleType: 'calculation',
        name: '准时交付率计算',
        formula: 'onTimeDeliveries / totalDeliveries * 100',
        unit: '%',
      },
    ],
    material: [
      {
        ruleId: `material-stock-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '库存预警',
        condition: 'currentStock < safetyStock',
        level: 'warning',
      },
      {
        ruleId: `material-purchase-suggestion-${Date.now()}`,
        ruleType: 'calculation',
        name: '采购建议计算',
        formula: 'safetyStock * 2 - currentStock',
        unit: 'quantity',
      },
      {
        ruleId: `material-usage-tracking-${Date.now()}`,
        ruleType: 'calculation',
        name: '使用量统计',
        formula: 'sum(usageAcrossAllProducts)',
        unit: 'quantity',
      },
    ],
    factory: [
      {
        ruleId: `factory-capacity-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '产能利用率验证',
        condition: 'capacityUtilization < 90',
        level: 'warning',
      },
      {
        ruleId: `factory-quality-control-${Date.now()}`,
        ruleType: 'validation',
        name: '质量合格率验证',
        condition: 'qualityPassRate > 98',
        level: 'critical',
      },
      {
        ruleId: `factory-efficiency-calculation-${Date.now()}`,
        ruleType: 'calculation',
        name: '生产效率计算',
        formula: 'actualOutput / plannedOutput * 100',
        unit: '%',
      },
    ],
    product: [
      {
        ruleId: `product-stock-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '库存预警',
        condition: 'currentInventory < safetyStock',
        level: 'warning',
      },
      {
        ruleId: `product-lifecycle-trigger-${Date.now()}`,
        ruleType: 'trigger',
        name: '生命周期阶段转换',
        condition: 'salesVolume < threshold && time > period',
        action: 'transitionToNextStage()',
      },
      {
        ruleId: `product-roi-calculation-${Date.now()}`,
        ruleType: 'calculation',
        name: 'ROI计算',
        formula: '(revenue - cost) / cost * 100',
        unit: '%',
      },
    ],
    warehouse: [
      {
        ruleId: `warehouse-capacity-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '容量利用率验证',
        condition: 'currentStock / capacity < 0.85',
        level: 'warning',
      },
      {
        ruleId: `warehouse-stock-tracking-${Date.now()}`,
        ruleType: 'calculation',
        name: '库存统计',
        formula: 'sum(allStoredItems)',
        unit: 'quantity',
      },
      {
        ruleId: `warehouse-temperature-control-${Date.now()}`,
        ruleType: 'validation',
        name: '温控验证',
        condition: 'temperatureControl === true && temperature within range',
        level: 'critical',
      },
    ],
    order: [
      {
        ruleId: `order-delivery-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '交付日期预警',
        condition: 'dueDate - currentDate < 7 days && status === "采购中"',
        level: 'warning',
      },
      {
        ruleId: `order-status-trigger-${Date.now()}`,
        ruleType: 'trigger',
        name: '状态流转规则',
        condition: 'orderProgress >= threshold',
        action: 'transitionToNextStatus()',
      },
      {
        ruleId: `order-priority-calculation-${Date.now()}`,
        ruleType: 'calculation',
        name: '优先级计算',
        formula: 'calculatePriority(dueDate, quantity, clientImportance)',
        unit: 'priority level',
      },
    ],
    logistics: [
      {
        ruleId: `logistics-delivery-tracking-${Date.now()}`,
        ruleType: 'calculation',
        name: '交付跟踪',
        formula: 'trackDeliveryProgress()',
        unit: '%',
      },
      {
        ruleId: `logistics-delay-trigger-${Date.now()}`,
        ruleType: 'trigger',
        name: '延迟预警',
        condition: 'estimatedDeliveryDate < currentDate',
        action: 'alertDelay()',
      },
      {
        ruleId: `logistics-route-optimization-${Date.now()}`,
        ruleType: 'calculation',
        name: '路线优化',
        formula: 'optimizeRoute()',
        unit: 'distance/time saved',
      },
    ],
    customer: [
      {
        ruleId: `customer-credit-validation-${Date.now()}`,
        ruleType: 'validation',
        name: '信用评级验证',
        condition: 'creditRating >= "BBB"',
        level: 'warning',
      },
      {
        ruleId: `customer-order-frequency-${Date.now()}`,
        ruleType: 'calculation',
        name: '订单频率计算',
        formula: 'orderCount / timePeriod',
        unit: 'orders per month',
      },
      {
        ruleId: `customer-satisfaction-tracking-${Date.now()}`,
        ruleType: 'calculation',
        name: '满意度跟踪',
        formula: 'average(satisfactionScores)',
        unit: 'score (0-100)',
      },
    ],
  };
  return rules[entityType] || [];
};

/**
 * Get default actions for an entity type based on FR-012
 */
export const getDefaultActions = (entityType: EntityType): EntityAction[] => {
  const actions: Record<EntityType, EntityAction[]> = {
    supplier: [
      { actionId: 'supplier-evaluate', name: '供应商评估', icon: 'Users', color: 'emerald', description: 'Evaluate supplier performance and quality' },
      { actionId: 'supplier-quality-audit', name: '质量审核', icon: 'CheckCircle2', color: 'blue', description: 'Review supplier quality metrics' },
      { actionId: 'supplier-risk-analysis', name: '风险分析', icon: 'AlertTriangle', color: 'amber', description: 'Analyze supplier risk factors' },
      { actionId: 'supplier-contract', name: '合同管理', icon: 'FileText', color: 'indigo', description: 'Manage supplier contracts' },
      { actionId: 'supplier-performance', name: '绩效跟踪', icon: 'TrendingUp', color: 'purple', description: 'Track supplier performance over time' },
    ],
    material: [
      { actionId: 'material-purchase-suggestion', name: '采购建议', icon: 'ShoppingCart', color: 'blue', description: 'Generate purchase recommendations' },
      { actionId: 'material-stock-adjust', name: '库存调整', icon: 'Package', color: 'indigo', description: 'Adjust material inventory levels' },
      { actionId: 'material-supplier-switch', name: '供应商切换', icon: 'RefreshCw', color: 'amber', description: 'Switch material supplier' },
      { actionId: 'material-price-negotiate', name: '价格谈判', icon: 'DollarSign', color: 'emerald', description: 'Negotiate material prices' },
      { actionId: 'material-quality-inspect', name: '质量检验', icon: 'CheckCircle2', color: 'blue', description: 'Inspect material quality' },
    ],
    factory: [
      { actionId: 'factory-schedule', name: '排产计划', icon: 'Calendar', color: 'blue', description: 'Create production scheduling plan' },
      { actionId: 'factory-capacity-adjust', name: '产能调整', icon: 'Settings', color: 'indigo', description: 'Adjust factory capacity' },
      { actionId: 'factory-maintenance', name: '设备维护', icon: 'Wrench', color: 'amber', description: 'Schedule equipment maintenance' },
      { actionId: 'factory-quality-control', name: '质量管控', icon: 'Shield', color: 'emerald', description: 'Control production quality' },
      { actionId: 'factory-efficiency-optimize', name: '效率优化', icon: 'TrendingUp', color: 'purple', description: 'Optimize production efficiency' },
      { actionId: 'factory-workforce', name: '人员调配', icon: 'Users', color: 'pink', description: 'Manage factory workforce' },
    ],
    product: [
      { actionId: 'product-lifecycle', name: '生命周期管理', icon: 'Lifecycle', color: 'purple', description: 'Manage product lifecycle stages' },
      { actionId: 'product-bom-change', name: 'BOM变更', icon: 'GitBranch', color: 'indigo', description: 'Modify Bill of Materials' },
      { actionId: 'product-price-adjust', name: '价格调整', icon: 'DollarSign', color: 'emerald', description: 'Adjust product pricing' },
      { actionId: 'product-inventory-optimize', name: '库存优化', icon: 'Package', color: 'blue', description: 'Optimize product inventory' },
      { actionId: 'product-discontinue', name: '停产决策', icon: 'XCircle', color: 'red', description: 'Make product discontinuation decision' },
    ],
    warehouse: [
      { actionId: 'warehouse-audit', name: '库存盘点', icon: 'ClipboardList', color: 'blue', description: 'Conduct warehouse inventory audit' },
      { actionId: 'warehouse-capacity-adjust', name: '容量调整', icon: 'Maximize2', color: 'indigo', description: 'Adjust warehouse capacity' },
      { actionId: 'warehouse-temperature', name: '温控设置', icon: 'Thermometer', color: 'cyan', description: 'Configure temperature control' },
      { actionId: 'warehouse-inout', name: '出入库管理', icon: 'ArrowLeftRight', color: 'emerald', description: 'Manage inbound and outbound operations' },
      { actionId: 'warehouse-transfer', name: '库存转移', icon: 'Truck', color: 'amber', description: 'Transfer inventory between warehouses' },
    ],
    order: [
      { actionId: 'order-track', name: '订单跟踪', icon: 'MapPin', color: 'blue', description: 'Track order progress' },
      { actionId: 'order-delivery-plan', name: '交付计划', icon: 'Calendar', color: 'indigo', description: 'Plan order delivery schedule' },
      { actionId: 'order-status-update', name: '状态更新', icon: 'RefreshCw', color: 'amber', description: 'Update order status' },
      { actionId: 'order-priority-adjust', name: '优先级调整', icon: 'ArrowUp', color: 'red', description: 'Adjust order priority' },
      { actionId: 'order-cancel', name: '取消处理', icon: 'XCircle', color: 'red', description: 'Handle order cancellation' },
    ],
    logistics: [
      { actionId: 'logistics-route-plan', name: '路线规划', icon: 'Map', color: 'blue', description: 'Plan delivery routes' },
      { actionId: 'logistics-track', name: '运输跟踪', icon: 'Truck', color: 'indigo', description: 'Track shipment progress' },
      { actionId: 'logistics-delay-handle', name: '延迟处理', icon: 'Clock', color: 'amber', description: 'Handle delivery delays' },
      { actionId: 'logistics-cost-optimize', name: '成本优化', icon: 'DollarSign', color: 'emerald', description: 'Optimize logistics costs' },
      { actionId: 'logistics-carrier-switch', name: '承运商切换', icon: 'RefreshCw', color: 'purple', description: 'Switch logistics carrier' },
    ],
    customer: [
      { actionId: 'customer-maintain', name: '客户维护', icon: 'User', color: 'blue', description: 'Maintain customer information' },
      { actionId: 'customer-order-history', name: '订单历史', icon: 'History', color: 'indigo', description: 'View customer order history' },
      { actionId: 'customer-credit', name: '信用管理', icon: 'CreditCard', color: 'emerald', description: 'Manage customer credit' },
      { actionId: 'customer-satisfaction', name: '满意度调查', icon: 'Star', color: 'amber', description: 'Conduct customer satisfaction survey' },
      { actionId: 'customer-region-adjust', name: '服务区域调整', icon: 'MapPin', color: 'purple', description: 'Adjust customer service regions' },
    ],
  };
  return actions[entityType] || [];
};

/**
 * Get default permissions for an entity type based on FR-013
 */
export const getDefaultPermissions = (entityType: EntityType): PermissionConfig => {
  const permissions: Record<EntityType, PermissionConfig> = {
    supplier: { roles: ['admin', 'procurement'], users: [] },
    material: { roles: ['admin', 'procurement', 'product'], users: [] },
    factory: { roles: ['admin', 'production', 'product'], users: [] },
    product: { roles: ['admin', 'production', 'product'], users: [] },
    warehouse: { roles: ['admin', 'production'], users: [] },
    order: { roles: ['admin', 'procurement', 'production', 'sales'], users: [] },
    logistics: { roles: ['admin', 'sales'], users: [] },
    customer: { roles: ['admin', 'sales'], users: [] },
  };
  return permissions[entityType] || { roles: ['admin'], users: [] };
};
```

---

### Step 2: Create Population Function

**File**: `src/utils/entityConfigService.ts`

**Changes**: Add `populateEntityConfigs()` function that iterates through all frontend entities and creates/updates entityConfigs entries.

```typescript
/**
 * Populate entityConfigs Map with complete configurations for all entities
 * matching frontend data by ID
 */
export const populateEntityConfigs = (): void => {
  // Populate Supplier configs
  suppliersData.forEach(supplier => {
    const key = `supplier-${supplier.supplierId}`;
    const existing = entityConfigs.get(key);
    const attributes = {
      ...getDefaultAttributes('supplier'),
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      supplyMaterials: [supplier.materialCode],
      // Add other attributes from supplier data or defaults
    };
    
    // Calculate relations
    const relations: EntityRelation[] = [
      {
        targetType: 'material',
        relationType: '一对多',
        count: suppliersData.filter(s => s.supplierId === supplier.supplierId).length,
        sampleItems: suppliersData.filter(s => s.supplierId === supplier.supplierId).map(s => s.materialCode).slice(0, 3),
      },
    ];
    
    const config: EntityConfig = {
      entityId: supplier.supplierId,
      entityType: 'supplier',
      attributes,
      relations,
      logicRules: getDefaultLogicRules('supplier'),
      actions: getDefaultActions('supplier'),
      permissions: getDefaultPermissions('supplier'),
    };
    
    entityConfigs.set(key, config);
  });
  
  // Populate Material configs
  materialsData.forEach(material => {
    const key = `material-${material.materialCode}`;
    const attributes = {
      ...getDefaultAttributes('material'),
      materialCode: material.materialCode,
      materialName: material.materialName,
      applicableProducts: material.applicableProductIds || [],
      // Add other attributes from material data or defaults
    };
    
    // Calculate relations
    const relations: EntityRelation[] = [
      {
        targetType: 'product',
        relationType: '多对多',
        count: material.applicableProductIds?.length || 0,
        sampleItems: material.applicableProductIds?.slice(0, 3) || [],
      },
      {
        targetType: 'supplier',
        relationType: '多对一',
        count: suppliersData.filter(s => s.materialCode === material.materialCode).length,
        sampleItems: suppliersData.filter(s => s.materialCode === material.materialCode).map(s => s.supplierId).slice(0, 3),
      },
    ];
    
    const config: EntityConfig = {
      entityId: material.materialCode,
      entityType: 'material',
      attributes,
      relations,
      logicRules: getDefaultLogicRules('material'),
      actions: getDefaultActions('material'),
      permissions: getDefaultPermissions('material'),
    };
    
    entityConfigs.set(key, config);
  });
  
  // Populate Product configs
  productsData.forEach(product => {
    const key = `product-${product.productId}`;
    const attributes = {
      ...getDefaultAttributes('product'),
      productId: product.productId,
      productName: product.productName,
      BOM: product.materialCodes || [],
      // Add other attributes from product data or defaults
    };
    
    // Calculate relations
    const relations: EntityRelation[] = [
      {
        targetType: 'material',
        relationType: '多对多',
        count: product.materialCodes?.length || 0,
        sampleItems: product.materialCodes?.slice(0, 3) || [],
      },
      {
        targetType: 'order',
        relationType: '一对多',
        count: ordersData.filter(o => o.productId === product.productId).length,
        sampleItems: ordersData.filter(o => o.productId === product.productId).map(o => o.orderId).slice(0, 3),
      },
    ];
    
    const config: EntityConfig = {
      entityId: product.productId,
      entityType: 'product',
      attributes,
      relations,
      logicRules: getDefaultLogicRules('product'),
      actions: getDefaultActions('product'),
      permissions: getDefaultPermissions('product'),
    };
    
    entityConfigs.set(key, config);
  });
  
  // Populate Order configs
  ordersData.forEach(order => {
    const key = `order-${order.orderId}`;
    const attributes = {
      ...getDefaultAttributes('order'),
      orderId: order.orderId,
      orderName: order.orderName,
      client: order.client,
      productId: order.productId,
      quantity: order.quantity,
      orderDate: order.orderDate,
      dueDate: order.dueDate,
      status: order.status,
      // Add other attributes from order data or defaults
    };
    
    // Calculate relations
    const relations: EntityRelation[] = [
      {
        targetType: 'product',
        relationType: '多对一',
        count: 1,
        sampleItems: [order.productId],
      },
      {
        targetType: 'customer',
        relationType: '多对一',
        count: 1,
        sampleItems: [order.client],
      },
    ];
    
    const config: EntityConfig = {
      entityId: order.orderId,
      entityType: 'order',
      attributes,
      relations,
      logicRules: getDefaultLogicRules('order'),
      actions: getDefaultActions('order'),
      permissions: getDefaultPermissions('order'),
    };
    
    entityConfigs.set(key, config);
  });
  
  // Note: Factory, Warehouse, Logistics, Customer configs can be created similarly
  // if frontend data exists, or use defaults if not
};
```

---

### Step 3: Call Population Function on App Initialization

**File**: `src/SupplyChainApp.tsx` or `src/App.tsx`

**Changes**: Call `populateEntityConfigs()` when app initializes to ensure all entity configurations are populated.

```typescript
import { populateEntityConfigs } from './utils/entityConfigService';

// Call on app initialization
useEffect(() => {
  populateEntityConfigs();
}, []);
```

---

### Step 4: Verify Entity Configurations

**Test**: Open configuration backend, navigate to each entity type, and verify:
1. Entity list displays all entities matching frontend data by ID
2. Right panel shows complete attributes, relations, logic rules, actions, and permissions
3. All configurations match frontend data with 100% one-to-one correspondence

---

## Summary

Implementation steps:
1. Create helper functions for default configurations (attributes, relations, logic rules, actions, permissions)
2. Create population function that iterates through all frontend entities
3. Call population function on app initialization
4. Verify entity configurations match frontend data by ID

All entity configurations will be populated with complete attribute, relation, logic, action, and permission definitions based on supply chain business domain knowledge.





