# Data Model: 库存优化页面增强

**Date**: 2025-01-27  
**Feature**: 库存优化页面增强

## Overview

本功能增强使用现有的 Product 和 Material 实体类型，无需创建新类型。所有必需字段已存在于 `src/types/ontology.ts` 中。

## Entity Definitions

### Product Entity

**Source**: `src/types/ontology.ts`  
**Status**: ✅ All required fields exist

```typescript
export interface Product {
  productId: string;          // 产品编号
  productName: string;        // 产品名称
  materialCodes: string[];    // 物料编码（数组，BOM结构）
  bomId?: string;             // BOM编号
  // 生命周期时间字段（YYYY-MM-DD格式）
  startSalesDate?: string;    // 开始销售时间
  stopSalesDate?: string;     // 停止销售时间
  stopExpansionDate?: string;  // 停止扩容时间
  stopServiceDate?: string;    // 停止服务时间
  // 状态字段
  status?: '销售中' | '停止销售' | '停止扩容' | '停止服务';
  inventoryStatus?: '正常' | '呆滞' | '慢动' | '缺货'; // 库存状态
  // 库存字段
  stockQuantity?: number;      // 库存数量（单位：个）
  inventoryDistribution?: {    // 库存分布
    available: number;
    locked: number;
    inTransit: number;
    scrapped: number;
  };
}
```

**Fields Used in This Feature**:
- `stockQuantity` - 用于库存数量判断和优先级排序
- `status` - 用于逻辑规则判断（停止扩容、停止服务）
- `inventoryStatus` - 用于前端展示和筛选
- `inventoryDistribution` - 用于展示库存分布详情
- `stopExpansionDate` - 用于停止扩容时间显示
- `stopServiceDate` - 用于呆滞库存判断（>= 365天）

**Validation Rules**:
- `stockQuantity > 0` - 触发停止扩容和停止服务规则
- `status === '停止扩容'` - 触发内部消化、改装行动
- `status === '停止服务' && (currentDate - stopServiceDate) >= 365 days` - 触发呆滞库存处理

### Material Entity

**Source**: `src/types/ontology.ts`  
**Status**: ✅ All required fields exist

```typescript
export interface Material {
  materialCode: string;       // 物料编码
  materialName: string;       // 物料名称
  applicableProductIds: string[]; // 物料适用产品编号（数组）
  bomId?: string;             // BOM编号
  // 时间字段（YYYY-MM-DD格式）
  warehouseInDate?: string;   // 入库时间
  // 状态字段
  status?: '呆滞' | '正常' | '异常' | '慢动';
  // 库存量字段（单位：个）
  maxStock?: number;          // 最大库存量（默认：10000）
  minStock?: number;          // 最低库存量（默认：10）
  currentStock?: number;      // 当前库存量
  inventoryDistribution?: {   // 库存分布
    available: number;
    locked: number;
    inTransit: number;
    scrapped: number;
  };
}
```

**Fields Used in This Feature**:
- `currentStock` - 用于库存数量判断和优先级排序
- `maxStock` - 用于停止采购判断（默认10000）
- `minStock` - 用于物料补充判断（默认10）
- `warehouseInDate` - 用于异常和呆滞判断（>= 365天 = 异常, >= 730天 = 呆滞）

**Validation Rules**:
- `(currentDate - warehouseInDate) >= 365 days` - 触发异常状态（替代料复用、回售供应商）
- `(currentDate - warehouseInDate) >= 730 days` - 触发呆滞状态（折价处理、报废处理）
- `currentStock - minStock < 10` - 触发物料补充行动
- `maxStock - currentStock < 100` - 触发停止采购行动

### LogicRuleResult Type

**Source**: `src/utils/logicRuleService.ts`  
**Status**: ✅ Already defined

```typescript
export interface LogicRuleResult {
  status: string;              // '呆滞' | '异常' | '正常'
  actions: string[];           // Array of action names
  triggeredRules: string[];   // Array of triggered rule names
}
```

**Fields Used in This Feature**:
- `status` - 用于优先级排序（呆滞 > 异常 > 正常）
- `actions` - 用于生成建议文本
- `triggeredRules` - 用于生成建议文本

## Relationships

**No new relationships required** - existing relationships are sufficient:
- Product → Material (via materialCodes array)
- Material → Product (via applicableProductIds array)

## State Transitions

### Product Status Transitions

```
销售中 → 停止销售 → 停止扩容 → 停止服务
```

**Logic Rule Triggers**:
- `停止扩容` + `stockQuantity > 0` → 异常状态，行动：内部消化、改装
- `停止服务` + `stockQuantity > 0` + `(currentDate - stopServiceDate) >= 365 days` → 呆滞状态，行动：改装、清退

### Material Status Transitions

```
正常 → 异常 (warehouseInDate >= 365 days) → 呆滞 (warehouseInDate >= 730 days)
```

**Logic Rule Triggers**:
- `(currentDate - warehouseInDate) >= 365 days` → 异常状态，行动：替代料复用、回售供应商
- `(currentDate - warehouseInDate) >= 730 days` → 呆滞状态，行动：折价处理、报废处理
- `currentStock - minStock < 10` → 触发物料补充行动（不影响状态）
- `maxStock - currentStock < 100` → 触发停止采购行动（不影响状态）

## Data Flow

### Recommendation Generation Flow

```
Products/Materials Array
  ↓
For each entity:
  calculateLogicRules(entity) → LogicRuleResult
  generateRecommendations(LogicRuleResult) → string[]
  ↓
Aggregate all recommendations
  ↓
Deduplicate by text
  ↓
Sort by priority (status + stock quantity)
  ↓
Take top 3-5
  ↓
Display in suggestion text block
```

## Default Values

- `Material.maxStock`: 10000 (if undefined)
- `Material.minStock`: 10 (if undefined)
- `Material.currentStock`: 0 (if undefined)
- `Product.stockQuantity`: 0 (if undefined)

## Validation Rules Summary

### Product Validation
1. If `stockQuantity > 0` and `status === '停止扩容'` → 异常，行动：内部消化、改装
2. If `stockQuantity > 0` and `status === '停止服务'` and `(currentDate - stopServiceDate) >= 365 days` → 呆滞，行动：改装、清退

### Material Validation
1. If `(currentDate - warehouseInDate) >= 365 days` → 异常，行动：替代料复用、回售供应商
2. If `(currentDate - warehouseInDate) >= 730 days` → 呆滞，行动：折价处理、报废处理
3. If `currentStock - minStock < 10` → 行动：物料补充
4. If `maxStock - currentStock < 100` → 行动：停止采购

## Time Calculation

**Method**: Calendar day calculation (>= 365 days, >= 730 days)

**Implementation**:
```typescript
const diffTime = currentDate.getTime() - targetDate.getTime();
const diffDays = diffTime / (1000 * 60 * 60 * 24);
// >= 365 days = >= 1 year
// >= 730 days = >= 2 years
```

**Rationale**: Matches spec clarification - uses day-based calculation with inclusive comparison (>=).

## No Schema Changes Required

✅ All required fields exist in existing types  
✅ No new types needed  
✅ No database schema changes  
✅ No API contract changes (internal functions only)



