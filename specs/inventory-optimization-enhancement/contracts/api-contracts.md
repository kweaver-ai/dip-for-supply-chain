# API Contracts: 库存优化页面增强

**Date**: 2025-01-27  
**Feature**: 库存优化页面增强

## Overview

本功能增强主要涉及内部服务函数的更新和新增，不涉及外部 API 变更。所有合约为 TypeScript 函数签名。

## Internal Service Contracts

### Logic Rule Service Updates

#### calculateProductLogicRules (Updated)

**File**: `src/utils/logicRuleService.ts`

**Signature**:
```typescript
export const calculateProductLogicRules = (product: Product): LogicRuleResult
```

**Changes**:
- Update time comparison from `diffYears > 1` to `diffYears >= 1` (>= 365 days) for stop service rule

**Input**:
- `product: Product` - Product entity with required fields:
  - `stockQuantity?: number`
  - `status?: '销售中' | '停止销售' | '停止扩容' | '停止服务'`
  - `stopServiceDate?: string` (YYYY-MM-DD format)

**Output**:
- `LogicRuleResult`:
  ```typescript
  {
    status: '呆滞' | '异常' | '正常',
    actions: string[],
    triggeredRules: string[]
  }
  ```

**Behavior**:
1. If `stockQuantity > 0` and `status === '停止扩容'`:
   - `status = '异常'`
   - `actions = ['内部消化', '改装']`
   - `triggeredRules = ['停止扩容库存处理']`

2. If `stockQuantity > 0` and `status === '停止服务'` and `(currentDate - stopServiceDate) >= 365 days`:
   - `status = '呆滞'`
   - `actions = ['改装', '清退']`
   - `triggeredRules = ['呆滞库存处理']`

**Error Handling**:
- Invalid date format: Log warning, return current status without date-based rules
- Missing date: Skip date-based rules, return current status

#### calculateMaterialLogicRules (Updated)

**File**: `src/utils/logicRuleService.ts`

**Signature**:
```typescript
export const calculateMaterialLogicRules = (
  material: Material,
  materialStock?: { remainingStock?: number }
): LogicRuleResult
```

**Changes**:
- Update time comparison from `diffYears > 1` to `diffYears >= 1` (>= 365 days) for 异常
- Update time comparison from `diffYears > 2` to `diffYears >= 2` (>= 730 days) for 呆滞

**Input**:
- `material: Material` - Material entity with required fields:
  - `currentStock?: number` (default: 0)
  - `maxStock?: number` (default: 10000)
  - `minStock?: number` (default: 10)
  - `warehouseInDate?: string` (YYYY-MM-DD format)
- `materialStock?: { remainingStock?: number }` - Optional material stock data

**Output**:
- `LogicRuleResult`:
  ```typescript
  {
    status: '呆滞' | '异常' | '正常',
    actions: string[],
    triggeredRules: string[]
  }
  ```

**Behavior**:
1. If `(currentDate - warehouseInDate) >= 730 days`:
   - `status = '呆滞'`
   - `actions = ['折价处理', '报废处理']`
   - `triggeredRules = ['呆滞物料处理']`

2. Else if `(currentDate - warehouseInDate) >= 365 days`:
   - `status = '异常'`
   - `actions = ['替代料复用', '回售供应商']`
   - `triggeredRules = ['异常物料处理']`

3. If `currentStock - minStock < 10`:
   - Add `'物料补充'` to `actions`
   - Add `'库存不足处理'` to `triggeredRules`

4. If `maxStock - currentStock < 100`:
   - Add `'停止采购'` to `actions`
   - Add `'库存过满处理'` to `triggeredRules`

**Error Handling**:
- Invalid date format: Log warning, skip date-based rules
- Missing date: Skip date-based rules, continue with stock-based rules

### Recommendation Service Additions

#### generateAggregatedProductRecommendations (New)

**File**: `src/utils/recommendationService.ts`

**Signature**:
```typescript
export const generateAggregatedProductRecommendations = (
  products: Product[]
): string[]
```

**Input**:
- `products: Product[]` - Array of all products

**Output**:
- `string[]` - Array of top 3-5 recommendation strings, sorted by priority

**Behavior**:
1. For each product:
   - Calculate logic rules: `calculateProductLogicRules(product)`
   - Generate recommendations: `generateProductRecommendations(logicRules)`
   - Collect with metadata: `{ text, status, stockQuantity, productId }`

2. Deduplicate by recommendation text (exact match):
   - Group by text
   - Keep instance with highest priority (status + stock quantity)

3. Sort by priority:
   - Primary: Status priority (呆滞: 3, 异常: 2, 正常: 1) descending
   - Secondary: Stock quantity descending

4. Return top 3-5 recommendations

**Edge Cases**:
- Empty array: Return `[]`
- Less than 3 recommendations: Return all available
- More than 5 recommendations: Return top 5

**Performance**:
- Must complete within 500ms for typical dataset (NFR-001)

#### generateAggregatedMaterialRecommendations (New)

**File**: `src/utils/recommendationService.ts`

**Signature**:
```typescript
export const generateAggregatedMaterialRecommendations = (
  materials: Material[]
): string[]
```

**Input**:
- `materials: Material[]` - Array of all materials

**Output**:
- `string[]` - Array of top 3-5 recommendation strings, sorted by priority

**Behavior**:
1. For each material:
   - Calculate logic rules: `calculateMaterialLogicRules(material)`
   - Generate recommendations: `generateMaterialRecommendations(logicRules)`
   - Collect with metadata: `{ text, status, currentStock, materialCode }`

2. Deduplicate by recommendation text (exact match):
   - Group by text
   - Keep instance with highest priority (status + currentStock)

3. Sort by priority:
   - Primary: Status priority (呆滞: 3, 异常: 2, 正常: 1) descending
   - Secondary: Current stock descending

4. Return top 3-5 recommendations

**Edge Cases**:
- Empty array: Return `[]`
- Less than 3 recommendations: Return all available
- More than 5 recommendations: Return top 5

**Performance**:
- Must complete within 500ms for typical dataset (NFR-001)

## Component Contracts

### InventoryView Component Updates

**File**: `src/components/views/InventoryView.tsx`

**Props**: No changes
```typescript
interface Props {
  toggleCopilot?: () => void;
}
```

**New Internal State**: None required (useMemo for recommendations)

**New UI Elements**:

1. **Product Inventory Suggestion Block**:
   - Location: After "产品库存智能体" title, before product list
   - Content: Top 3-5 aggregated product recommendations
   - Styling: Semantic Tailwind variables (bg-slate-50, text-slate-700, border-slate-200)
   - Format: Plain text, no interaction

2. **Material Inventory Suggestion Block**:
   - Location: After "物料库存智能体" title, before material list
   - Content: Top 3-5 aggregated material recommendations
   - Styling: Semantic Tailwind variables (bg-slate-50, text-slate-700, border-slate-200)
   - Format: Plain text, no interaction

**Implementation Pattern**:
```typescript
const productRecommendations = useMemo(() => {
  return generateAggregatedProductRecommendations(productsData);
}, []);

const materialRecommendations = useMemo(() => {
  return generateAggregatedMaterialRecommendations(materialsData);
}, []);
```

## Data Flow Contracts

### Recommendation Generation Flow

```
Input: productsData (Product[]) | materialsData (Material[])
  ↓
For each entity:
  calculateLogicRules(entity) → LogicRuleResult
  generateRecommendations(LogicRuleResult) → string[]
  ↓
Aggregate with metadata: { text, status, stockQuantity, entityId }
  ↓
Deduplicate by text (keep highest priority)
  ↓
Sort by priority (status desc, stock desc)
  ↓
Take top 3-5
  ↓
Output: string[] (recommendation texts)
```

## Error Handling

### Logic Rule Service Errors

- **Invalid date format**: Log warning to console, skip date-based rules, continue with other rules
- **Missing required fields**: Use defaults (0 for stock, undefined for dates), continue processing
- **Type errors**: TypeScript compile-time checks prevent most type errors

### Recommendation Service Errors

- **Empty input array**: Return empty array `[]`
- **No recommendations generated**: Return general advice (e.g., "库存状态正常，无需特别处理")
- **Performance timeout**: Not applicable (synchronous functions, performance validated during development)

## Performance Contracts

### NFR-001: Performance Requirements

- **Recommendation calculation**: < 500ms for typical dataset (100 products, 50 materials)
- **Logic rule calculation**: < 10ms per entity
- **Aggregation and sorting**: < 100ms for typical dataset

**Measurement**: Use browser DevTools Performance API or console.time/console.timeEnd

## Backward Compatibility

### Breaking Changes

**None** - All changes are additive or internal updates:
- New functions added (aggregation functions)
- Existing functions updated internally (time comparison logic)
- Component UI enhanced (new suggestion blocks)

### Migration Required

**None** - No migration needed:
- Existing code using `calculateProductLogicRules` and `calculateMaterialLogicRules` continues to work
- Time comparison change is internal and matches spec requirements
- New aggregation functions are optional additions

## Testing Contracts

### Unit Test Requirements

1. **Logic Rule Service**:
   - Test time comparison edge cases (exactly 365 days, exactly 730 days)
   - Test invalid date handling
   - Test missing field defaults

2. **Recommendation Service**:
   - Test aggregation with empty array
   - Test deduplication logic
   - Test priority sorting
   - Test top N selection (3-5)

3. **Component**:
   - Test suggestion block rendering
   - Test recommendation display
   - Test empty state handling

### Integration Test Requirements

- Test full flow: Products/Materials → Logic Rules → Recommendations → Display
- Test performance with large datasets
- Test UI layout with suggestions



