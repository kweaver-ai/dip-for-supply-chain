# Quickstart: 库存优化页面增强

**Date**: 2025-01-27  
**Feature**: 库存优化页面增强

## Overview

本指南提供实现库存优化页面增强功能的步骤说明。主要任务包括：更新逻辑规则服务的时间比较逻辑、添加推荐聚合函数、在 InventoryView 组件中添加建议文本块。

## Prerequisites

- ✅ TypeScript 5.9.3
- ✅ React 19.2.0
- ✅ 现有 InventoryView 组件
- ✅ 现有 logicRuleService.ts
- ✅ 现有 recommendationService.ts
- ✅ 现有 ontology.ts 类型定义

## Implementation Steps

### Step 1: Update Logic Rule Service Time Comparisons

**File**: `src/utils/logicRuleService.ts`

#### 1.1 Update Product Logic Rules

**Location**: `calculateProductLogicRules` function, line ~68

**Change**:
```typescript
// Before:
if (diffYears > 1) {

// After:
if (diffYears >= 1) {  // >= 365 days
```

**Complete Rule**:
```typescript
// Rule 2: If stockQuantity > 0 and status is '停止服务' and (current time - stopServiceDate) >= 365 days
if (product.stockQuantity && product.stockQuantity > 0 && product.status === '停止服务' && product.stopServiceDate) {
  // ... date validation ...
  const diffTime = currentDate.getTime() - stopServiceDate.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  
  if (diffYears >= 1) {  // Updated: >= instead of >
    triggeredRules.push('呆滞库存处理');
    actions.push('改装', '清退');
    status = '呆滞';
  }
}
```

#### 1.2 Update Material Logic Rules

**Location**: `calculateMaterialLogicRules` function, lines ~118-129

**Changes**:
```typescript
// Before:
if (diffYears > 2) {
  // 呆滞
} else if (diffYears > 1) {
  // 异常

// After:
if (diffYears >= 2) {  // >= 730 days
  // 呆滞
} else if (diffYears >= 1) {  // >= 365 days
  // 异常
```

**Complete Rules**:
```typescript
// Rule 1: > 2 years = 呆滞
if (diffYears >= 2) {  // Updated: >= instead of >
  triggeredRules.push('呆滞物料处理');
  actions.push('折价处理', '报废处理');
  status = '呆滞';
}
// Rule 2: > 1 year = 异常
else if (diffYears >= 1) {  // Updated: >= instead of >
  triggeredRules.push('异常物料处理');
  actions.push('替代料复用', '回售供应商');
  status = '异常';
}
```

**Verification**:
- Test with date exactly 365 days ago (should trigger 异常)
- Test with date exactly 730 days ago (should trigger 呆滞)
- Test with date 364 days ago (should not trigger)
- Test with date 729 days ago (should trigger 异常, not 呆滞)

### Step 2: Add Aggregation Functions to Recommendation Service

**File**: `src/utils/recommendationService.ts`

#### 2.1 Add Priority Mapping Constant

**Location**: After existing constants, before functions

```typescript
/**
 * Status priority mapping for recommendation sorting
 * Higher number = higher priority
 */
const STATUS_PRIORITY: Record<string, number> = {
  '呆滞': 3,
  '异常': 2,
  '正常': 1,
};
```

#### 2.2 Add generateAggregatedProductRecommendations Function

**Location**: After `generateProductRecommendations` function

```typescript
/**
 * Generate aggregated product recommendations across all products
 * Returns top 3-5 recommendations sorted by priority
 */
export const generateAggregatedProductRecommendations = (
  products: Product[]
): string[] => {
  if (products.length === 0) {
    return [];
  }

  // Collect all recommendations with metadata
  const allRecommendations: Array<{
    text: string;
    status: string;
    stockQuantity: number;
    productId: string;
  }> = [];

  products.forEach(product => {
    const rules = calculateProductLogicRules(product);
    const recommendations = generateProductRecommendations(rules);
    
    recommendations.forEach(rec => {
      allRecommendations.push({
        text: rec,
        status: rules.status,
        stockQuantity: product.stockQuantity || 0,
        productId: product.productId,
      });
    });
  });

  // Deduplicate by text, keep highest priority instance
  const deduplicated = new Map<string, typeof allRecommendations[0]>();
  allRecommendations.forEach(rec => {
    const existing = deduplicated.get(rec.text);
    if (!existing) {
      deduplicated.set(rec.text, rec);
    } else {
      // Compare priority: status first, then stock quantity
      const existingPriority = STATUS_PRIORITY[existing.status] || 0;
      const newPriority = STATUS_PRIORITY[rec.status] || 0;
      
      if (newPriority > existingPriority || 
          (newPriority === existingPriority && rec.stockQuantity > existing.stockQuantity)) {
        deduplicated.set(rec.text, rec);
      }
    }
  });

  // Sort by priority (status desc, stock quantity desc)
  const sorted = Array.from(deduplicated.values()).sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status] || 0;
    const priorityB = STATUS_PRIORITY[b.status] || 0;
    
    if (priorityB !== priorityA) {
      return priorityB - priorityA;  // Status priority descending
    }
    return b.stockQuantity - a.stockQuantity;  // Stock quantity descending
  });

  // Return top 3-5
  return sorted.slice(0, 5).map(rec => rec.text);
};
```

**Note**: Import `calculateProductLogicRules` and `Product` type at top of file:
```typescript
import { calculateProductLogicRules } from './logicRuleService';
import type { Product } from '../types/ontology';
```

#### 2.3 Add generateAggregatedMaterialRecommendations Function

**Location**: After `generateMaterialRecommendations` function

```typescript
/**
 * Generate aggregated material recommendations across all materials
 * Returns top 3-5 recommendations sorted by priority
 */
export const generateAggregatedMaterialRecommendations = (
  materials: Material[]
): string[] => {
  if (materials.length === 0) {
    return [];
  }

  // Collect all recommendations with metadata
  const allRecommendations: Array<{
    text: string;
    status: string;
    currentStock: number;
    materialCode: string;
  }> = [];

  materials.forEach(material => {
    const rules = calculateMaterialLogicRules(material);
    const recommendations = generateMaterialRecommendations(rules);
    
    recommendations.forEach(rec => {
      allRecommendations.push({
        text: rec,
        status: rules.status,
        currentStock: material.currentStock || 0,
        materialCode: material.materialCode,
      });
    });
  });

  // Deduplicate by text, keep highest priority instance
  const deduplicated = new Map<string, typeof allRecommendations[0]>();
  allRecommendations.forEach(rec => {
    const existing = deduplicated.get(rec.text);
    if (!existing) {
      deduplicated.set(rec.text, rec);
    } else {
      // Compare priority: status first, then current stock
      const existingPriority = STATUS_PRIORITY[existing.status] || 0;
      const newPriority = STATUS_PRIORITY[rec.status] || 0;
      
      if (newPriority > existingPriority || 
          (newPriority === existingPriority && rec.currentStock > existing.currentStock)) {
        deduplicated.set(rec.text, rec);
      }
    }
  });

  // Sort by priority (status desc, current stock desc)
  const sorted = Array.from(deduplicated.values()).sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status] || 0;
    const priorityB = STATUS_PRIORITY[b.status] || 0;
    
    if (priorityB !== priorityA) {
      return priorityB - priorityA;  // Status priority descending
    }
    return b.currentStock - a.currentStock;  // Current stock descending
  });

  // Return top 3-5
  return sorted.slice(0, 5).map(rec => rec.text);
};
```

**Note**: Import `calculateMaterialLogicRules` and `Material` type at top of file:
```typescript
import { calculateMaterialLogicRules } from './logicRuleService';
import type { Material } from '../types/ontology';
```

**Verification**:
- Test with empty array (should return [])
- Test with single product/material (should return recommendations)
- Test with multiple products/materials (should deduplicate and sort)
- Test priority sorting (呆滞 > 异常 > 正常)
- Test stock quantity secondary sort

### Step 3: Update InventoryView Component

**File**: `src/components/views/InventoryView.tsx`

#### 3.1 Add Imports

**Location**: Top of file, after existing imports

```typescript
import { 
  generateAggregatedProductRecommendations,
  generateAggregatedMaterialRecommendations 
} from '../../utils/recommendationService';
```

#### 3.2 Add Recommendation Calculations

**Location**: After existing useMemo hooks (around line 86)

```typescript
// 计算产品库存综合建议
const productRecommendations = useMemo(() => {
  return generateAggregatedProductRecommendations(productsData);
}, []);

// 计算物料库存综合建议
const materialRecommendations = useMemo(() => {
  return generateAggregatedMaterialRecommendations(materialsData);
}, []);
```

#### 3.3 Add Product Inventory Suggestion Block

**Location**: After "产品库存智能体" title section (around line 178), before product list

```typescript
{/* Product Inventory Suggestion Block */}
{productRecommendations.length > 0 && (
  <div className="p-4 mb-4 bg-slate-50 border border-slate-200 rounded-lg">
    <h3 className="text-sm font-semibold text-slate-700 mb-2">库存优化建议</h3>
    <div className="space-y-1">
      {productRecommendations.map((rec, index) => (
        <p key={index} className="text-sm text-slate-600">{rec}</p>
      ))}
    </div>
  </div>
)}
```

**Insert after**:
```typescript
<div className="p-6 border-b border-slate-200">
  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
    <Package className="text-indigo-500" size={20} />
    产品库存智能体
    ...
  </h2>
</div>
```

**Insert before**:
```typescript
<div className="p-6">
  <div className="space-y-3">
    {paginatedProducts.map((product, index) => (
```

#### 3.4 Add Material Inventory Suggestion Block

**Location**: After "物料库存智能体" title section (around line 283), before material list

```typescript
{/* Material Inventory Suggestion Block */}
{materialRecommendations.length > 0 && (
  <div className="p-4 mb-4 bg-slate-50 border border-slate-200 rounded-lg">
    <h3 className="text-sm font-semibold text-slate-700 mb-2">库存优化建议</h3>
    <div className="space-y-1">
      {materialRecommendations.map((rec, index) => (
        <p key={index} className="text-sm text-slate-600">{rec}</p>
      ))}
    </div>
  </div>
)}
```

**Insert after**:
```typescript
<div className="p-6 border-b border-slate-200">
  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
    <Box className="text-indigo-500" size={20} />
    物料库存智能体
    ...
  </h2>
</div>
```

**Insert before**:
```typescript
<div className="p-6">
  <div className="space-y-3">
    {paginatedMaterials.map((material, index) => {
```

**Verification**:
- Test suggestion blocks render correctly
- Test recommendations display (top 3-5)
- Test empty state (no recommendations)
- Test styling matches existing design
- Test responsive layout

### Step 4: Testing

#### 4.1 Unit Tests

**Logic Rule Service**:
- Test time comparison: exactly 365 days, exactly 730 days
- Test edge cases: 364 days (should not trigger), 729 days (should trigger 异常)
- Test invalid dates: should log warning and skip

**Recommendation Service**:
- Test aggregation with empty array
- Test deduplication logic
- Test priority sorting
- Test top N selection

#### 4.2 Integration Tests

- Test full flow: Data → Logic Rules → Recommendations → Display
- Test performance: < 500ms for typical dataset
- Test UI: Suggestion blocks render correctly

#### 4.3 Manual Testing

1. **Open Inventory View**:
   - Navigate to inventory page
   - Verify suggestion blocks appear after panel titles

2. **Verify Recommendations**:
   - Check product recommendations show top 3-5
   - Check material recommendations show top 3-5
   - Verify priority sorting (呆滞 first, then 异常, then 正常)

3. **Verify Logic Rules**:
   - Test with product: stopServiceDate exactly 365 days ago (should show 呆滞)
   - Test with material: warehouseInDate exactly 365 days ago (should show 异常)
   - Test with material: warehouseInDate exactly 730 days ago (should show 呆滞)

4. **Verify Performance**:
   - Use browser DevTools to measure recommendation calculation time
   - Should be < 500ms for typical dataset

## Common Issues & Solutions

### Issue 1: Recommendations not showing

**Solution**: Check that `productsData` and `materialsData` are imported and available in component scope.

### Issue 2: Time comparison not working

**Solution**: Verify date format is YYYY-MM-DD. Check browser console for date parsing warnings.

### Issue 3: Priority sorting incorrect

**Solution**: Verify STATUS_PRIORITY constant is defined correctly and used in sort function.

### Issue 4: Performance issues

**Solution**: Use useMemo to cache recommendations. Check for unnecessary re-renders.

## Next Steps

After completing implementation:
1. Run `/speckit.tasks` to create task breakdown
2. Review code for Constitution compliance
3. Test all scenarios
4. Update documentation if needed



