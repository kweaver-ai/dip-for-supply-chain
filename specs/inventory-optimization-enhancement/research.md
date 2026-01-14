# Research: 库存优化页面增强

**Date**: 2025-01-27  
**Feature**: 库存优化页面增强  
**Status**: Complete

## Research Tasks & Findings

### Task 1: Review Existing Logic Rule Service Implementation

**Objective**: Analyze current `calculateProductLogicRules` and `calculateMaterialLogicRules` functions to identify required updates.

**Findings**:

1. **Product Logic Rules** (`calculateProductLogicRules`):
   - ✅ Rule 1 (停止扩容): Already implemented correctly
     - Condition: `stockQuantity > 0 && status === '停止扩容'`
     - Actions: `['内部消化', '改装']`
     - Status: `'异常'`
   - ⚠️ Rule 2 (停止服务): Partially correct, needs update
     - Current: `diffYears > 1` (strict greater than)
     - Required: `diffYears >= 1` (greater than or equal, i.e., >= 365 days)
     - Actions: `['改装', '清退']` ✅
     - Status: `'呆滞'` ✅

2. **Material Logic Rules** (`calculateMaterialLogicRules`):
   - ⚠️ Rule 1 (异常判断): Needs update
     - Current: `diffYears > 1` (strict greater than)
     - Required: `diffYears >= 1` (>= 365 days)
     - Actions: `['替代料复用', '回售供应商']` ✅
     - Status: `'异常'` ✅
   - ⚠️ Rule 2 (呆滞判断): Needs update
     - Current: `diffYears > 2` (strict greater than)
     - Required: `diffYears >= 2` (>= 730 days)
     - Actions: `['折价处理', '报废处理']` ✅
     - Status: `'呆滞'` ✅
   - ✅ Rule 3 (库存补充): Already implemented correctly
     - Condition: `currentStock - minStock < 10`
     - Action: `'物料补充'`
   - ✅ Rule 4 (停止采购): Already implemented correctly
     - Condition: `maxStock - currentStock < 100`
     - Action: `'停止采购'`

**Decision**: Update time comparison logic from strict `>` to `>=` for all date-based rules to match spec clarifications.

**Rationale**: Spec clarification explicitly states ">= 365天视为'超过1年'，>= 730天视为'超过2年'", which requires inclusive comparison.

**Alternatives Considered**:
- Keep strict `>`: Rejected - does not match spec clarification
- Use calendar year calculation: Rejected - spec clarification uses day-based calculation (>= 365 days)

### Task 2: Review Existing Recommendation Service Implementation

**Objective**: Analyze current recommendation generation functions to identify required enhancements for aggregation.

**Findings**:

1. **Current Implementation**:
   - `generateProductRecommendations(rules: LogicRuleResult): string[]` - Generates recommendations per product
   - `generateMaterialRecommendations(rules: LogicRuleResult): string[]` - Generates recommendations per material
   - Functions return array of recommendation strings based on triggered rules and actions
   - No aggregation or cross-entity prioritization

2. **Required Enhancement**:
   - Need functions to aggregate recommendations across all products/materials
   - Need priority sorting (呆滞 > 异常 > 正常, then by stock quantity descending)
   - Need to return top 3-5 recommendations

**Decision**: Add new aggregation functions:
- `generateAggregatedProductRecommendations(products: Product[]): string[]`
- `generateAggregatedMaterialRecommendations(materials: Material[]): string[]`

**Rationale**: Spec requires aggregated recommendations at panel level (top 3-5), not per-entity recommendations.

**Implementation Strategy**:
1. Collect recommendations from all entities
2. Deduplicate similar recommendations (group by text)
3. Sort by priority (status priority + stock quantity)
4. Return top 3-5

**Alternatives Considered**:
- Modify existing functions: Rejected - would break existing per-entity usage
- Create wrapper functions: Accepted - maintains backward compatibility

### Task 3: Review InventoryView Component Structure

**Objective**: Identify insertion point for suggestion text blocks in InventoryView component.

**Findings**:

1. **Component Structure**:
   ```
   InventoryView
   ├── Header (title: "库存优化")
   └── Grid (2 columns)
       ├── Product Inventory Panel
       │   ├── Panel Header (title: "产品库存智能体")
       │   └── Product List (paginated)
       └── Material Inventory Panel
           ├── Panel Header (title: "物料库存智能体")
           └── Material List (paginated)
   ```

2. **Insertion Point**:
   - After panel header (title section with border-b)
   - Before product/material list
   - Within panel content area (p-6 div)

**Decision**: Insert suggestion text block after panel header, before list content.

**Rationale**: Spec requires suggestions at "top" of agent panel, which is after title but before content list. This placement provides visibility without disrupting existing layout.

**Styling Approach**:
- Use semantic Tailwind variables (bg-slate-50, text-slate-700, border-slate-200)
- Plain text display, no interaction
- Padding and spacing consistent with existing panel styling

### Task 4: Priority Sorting Algorithm Design

**Objective**: Design algorithm to sort recommendations by priority as specified in clarifications.

**Findings**:

1. **Priority Rules** (from spec clarification):
   - Status priority: 呆滞 (3) > 异常 (2) > 正常 (1)
   - Secondary sort: Stock quantity descending (for same status)

2. **Data Available**:
   - `LogicRuleResult.status`: '呆滞' | '异常' | '正常'
   - `Product.stockQuantity`: number
   - `Material.currentStock`: number

**Decision**: Implement priority mapping and sorting:
```typescript
const STATUS_PRIORITY = { '呆滞': 3, '异常': 2, '正常': 1 };
// Sort by: statusPriority descending, then stockQuantity/currentStock descending
```

**Rationale**: Matches spec clarification exactly. Status priority ensures critical issues (呆滞) are shown first, then stock quantity ensures high-impact items are prioritized within same status.

**Alternatives Considered**:
- Sort by stock quantity only: Rejected - does not prioritize by severity
- Sort by time (oldest first): Rejected - not specified in requirements

### Task 5: Recommendation Aggregation Strategy

**Objective**: Design strategy to aggregate recommendations from all entities into top 3-5.

**Findings**:

1. **Current State**:
   - Recommendations generated per entity
   - May have duplicates across entities (e.g., multiple products with same issue)
   - No cross-entity prioritization

2. **Required Behavior**:
   - Aggregate all entity recommendations
   - Deduplicate similar recommendations
   - Sort by priority
   - Return top 3-5

**Decision**: Implement aggregation with deduplication:
1. Collect all recommendations from all entities into array with metadata (status, stock quantity, entity info)
2. Group by recommendation text (exact match) - keep highest priority instance
3. Sort by priority (status + stock quantity)
4. Take top 3-5

**Rationale**: Ensures most important recommendations are shown while avoiding duplicate messages. Deduplication prevents showing same recommendation multiple times.

**Edge Cases Handled**:
- Empty products/materials array: Return empty array
- All entities have same recommendation: Show once with highest priority
- Less than 3-5 recommendations: Return all available
- More than 5 recommendations: Return top 5

**Alternatives Considered**:
- No deduplication: Rejected - would show duplicate recommendations
- Group by recommendation type instead of text: Rejected - too complex, text matching is sufficient

## Technical Decisions Summary

| Decision | Rationale | Alternatives |
|----------|-----------|--------------|
| Update time comparison to `>=` | Matches spec clarification | Keep `>` (rejected) |
| Add aggregation functions | Maintain backward compatibility | Modify existing (rejected) |
| Insert suggestions after panel header | Matches "top" requirement | Other positions (rejected) |
| Priority: status then stock quantity | Matches spec clarification | Other priorities (rejected) |
| Deduplicate by text | Prevents duplicate messages | No deduplication (rejected) |

## Dependencies & Constraints

**Dependencies**:
- Existing `logicRuleService.ts` - Update time comparison logic
- Existing `recommendationService.ts` - Add aggregation functions
- Existing `InventoryView.tsx` - Add suggestion blocks
- Existing `ontology.ts` - Verify types (already complete)

**Constraints**:
- Must maintain backward compatibility with existing recommendation functions
- Must use semantic Tailwind variables (Constitution P2)
- Must not exceed component size limit (Constitution P3) - current ~400 lines, changes are additive
- Performance: Recommendations must calculate < 500ms (NFR-001)

## Unresolved Issues

None - all research tasks completed, all clarifications resolved.

## Next Steps

1. Generate data-model.md with entity definitions
2. Generate contracts/ with API contracts
3. Generate quickstart.md with implementation guide
4. Proceed to task breakdown



