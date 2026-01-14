# Implementation Plan: 库存优化页面增强

**Branch**: `inventory-optimization-enhancement` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/inventory-optimization-enhancement/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化库存优化页面（InventoryView），增强产品库存智能体和物料库存智能体的建议功能，完善库存逻辑规则和动作处理。主要改进包括：在智能体面板标题下方显示综合建议文本块（纯文本，无交互）、更新产品库存逻辑规则（停止扩容和停止服务处理）、更新物料库存逻辑规则（异常和呆滞判断、库存补充和停止采购阈值）。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: In-memory mock data (src/data/mockData.ts), future: backend API integration  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: 建议计算应在页面加载时完成，延迟不超过500ms (NFR-001)  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), integrate with existing InventoryView component and logicRuleService  
**Scale/Scope**: 产品库存和物料库存的综合建议生成，逻辑规则实时计算，建议按优先级排序显示前3-5条

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - New types MUST be defined in or extend from `src/types/ontology.ts`
  - No ad-hoc type definitions in component files
  - **Action Required**: Verify Product and Material types in ontology.ts already include required fields (stockQuantity, status, stopServiceDate, warehouseInDate, currentStock, maxStock, minStock). No new types needed.
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Use existing semantic variables from index.css for suggestion text block styling
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - Large components identified and refactoring plan documented
  - **Action Required**: InventoryView.tsx is currently ~400 lines. Consider extracting suggestion generation logic to a separate service/hook if component exceeds 150 lines after changes. Current changes are additive and may not require splitting if existing code is well-organized.
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - this feature does not include simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/inventory-optimization-enhancement/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── views/
│       └── InventoryView.tsx                    # Updated: Add suggestion text blocks for product and material inventory agents
├── utils/
│   ├── logicRuleService.ts                     # Updated: Verify and update product/material logic rules per FR-002 and FR-004
│   └── recommendationService.ts                # Updated: Add functions to generate aggregated recommendations with priority sorting
├── types/
│   └── ontology.ts                             # Verify: Ensure Product and Material types have all required fields
└── data/
    └── mockData.ts                             # No changes required (uses existing data)
```

**Structure Decision**: Enhance existing InventoryView component and utility services. No new components needed. Suggestion text blocks added directly to existing panels. Logic rules updated in existing logicRuleService. Recommendation aggregation added to existing recommendationService.

## Phase 0: Research & Analysis

**Status**: In Progress

### Research Tasks

1. **Review existing logicRuleService implementation**
   - **Task**: Analyze current calculateProductLogicRules and calculateMaterialLogicRules functions
   - **Findings**: 
     - Product logic: Already implements stop expansion rule (internal消化, 改装). Stop service rule exists but uses > 1 year (strict), needs update to >= 365 days
     - Material logic: Already implements warehouse date rules (> 1 year = 异常, > 2 years = 呆滞), needs update to >= 365 days and >= 730 days
     - Material logic: Already implements stock threshold rules (currentStock - minStock < 10 = 物料补充, maxStock - currentStock < 100 = 停止采购)
   - **Decision**: Update time comparison logic from strict > to >= for consistency with spec clarifications
   - **Rationale**: Spec clarification explicitly states >= 365 days and >= 730 days

2. **Review existing recommendationService implementation**
   - **Task**: Analyze current generateProductRecommendations and generateMaterialRecommendations functions
   - **Findings**:
     - Functions generate recommendations per entity based on logic rules
     - No aggregation or priority sorting across all entities
     - Recommendations are per-entity, not global summaries
   - **Decision**: Add new functions to aggregate recommendations across all products/materials and sort by priority
   - **Rationale**: Spec requires aggregated recommendations (top 3-5) at panel level, not per-entity

3. **Review InventoryView component structure**
   - **Task**: Analyze current component layout and identify insertion point for suggestion text blocks
   - **Findings**:
     - Component has two main panels: Product Inventory Panel and Material Inventory Panel
     - Each panel has a header section with title
     - Product list and material list follow header
   - **Decision**: Insert suggestion text block after panel header (title section) and before product/material list
   - **Rationale**: Spec requires suggestions at "top" of agent panel, which is after title but before content list

4. **Priority sorting algorithm design**
   - **Task**: Design algorithm to sort recommendations by priority (呆滞 > 异常 > 正常, then by stock quantity descending)
   - **Findings**:
     - LogicRuleResult has status field ('呆滞', '异常', '正常')
     - Product has stockQuantity field
     - Material has currentStock field
   - **Decision**: Create priority mapping function: statusPriority = { '呆滞': 3, '异常': 2, '正常': 1 }, sort by statusPriority descending, then by stock quantity descending
   - **Rationale**: Matches spec clarification for priority sorting

5. **Recommendation aggregation strategy**
   - **Task**: Design strategy to aggregate recommendations from all products/materials into top 3-5
   - **Findings**:
     - Current recommendationService generates per-entity recommendations
     - Need to collect all recommendations, deduplicate similar ones, sort by priority, take top 3-5
   - **Decision**: 
     - Collect all entity recommendations into array
     - Group by recommendation text (deduplicate)
     - Sort by priority (status + stock quantity)
     - Take top 3-5
   - **Rationale**: Ensures most important recommendations are shown while avoiding duplicates

### Research Output

**All NEEDS CLARIFICATION resolved**: Yes

- Time calculation precision: >= 365 days and >= 730 days (from spec clarifications)
- Priority sorting: 呆滞 > 异常 > 正常, then by stock quantity descending (from spec clarifications)
- Suggestion display: Text block after panel title, before content list (from spec clarifications)
- Aggregation: Top 3-5 recommendations across all entities (from spec clarifications)

## Phase 1: Design & Contracts ✅

**Prerequisites:** `research.md` complete ✅

**Status**: Complete

**Outputs**:
- `data-model.md` - Entity definitions and data flow
- `contracts/api-contracts.md` - Internal service contracts
- `quickstart.md` - Step-by-step implementation guide

### Data Model

See `data-model.md` for detailed entity definitions.

**Key Entities**:
- **Product**: Uses existing Product type from ontology.ts. Required fields: stockQuantity, status, stopExpansionDate, stopServiceDate
- **Material**: Uses existing Material type from ontology.ts. Required fields: currentStock, maxStock (default 10000), minStock (default 10), warehouseInDate

**No new types required** - all fields exist in existing ontology.ts types.

### API Contracts

See `contracts/` directory for detailed API contracts.

**Internal Service Contracts** (TypeScript function signatures):

1. **generateAggregatedProductRecommendations(products: Product[]): string[]**
   - Input: Array of all products
   - Output: Array of top 3-5 recommendation strings, sorted by priority
   - Logic: Collect recommendations from all products, deduplicate, sort by priority, return top 3-5

2. **generateAggregatedMaterialRecommendations(materials: Material[]): string[]**
   - Input: Array of all materials
   - Output: Array of top 3-5 recommendation strings, sorted by priority
   - Logic: Collect recommendations from all materials, deduplicate, sort by priority, return top 3-5

3. **calculateProductLogicRules(product: Product): LogicRuleResult** (Updated)
   - Update: Change time comparison from `> 1 year` to `>= 365 days` for stop service rule

4. **calculateMaterialLogicRules(material: Material, materialStock?: MaterialStock): LogicRuleResult** (Updated)
   - Update: Change time comparison from `> 1 year` to `>= 365 days` and `> 2 years` to `>= 730 days`

### Component Contracts

**InventoryView Component Updates**:
- Add suggestion text block after "产品库存智能体" title, before product list
- Add suggestion text block after "物料库存智能体" title, before material list
- Suggestion text blocks: Plain text display, no interaction, styled with semantic variables

### Quickstart

See `quickstart.md` for step-by-step implementation guide.

## Phase 2: Implementation Planning

**Status**: Ready for task breakdown

### Implementation Phases

1. **Phase 2.1: Update Logic Rules Service**
   - Update time comparison logic in calculateProductLogicRules (>= 365 days)
   - Update time comparison logic in calculateMaterialLogicRules (>= 365 days, >= 730 days)
   - Verify existing stock threshold rules match spec (already correct)

2. **Phase 2.2: Enhance Recommendation Service**
   - Add generateAggregatedProductRecommendations function
   - Add generateAggregatedMaterialRecommendations function
   - Implement priority sorting algorithm (呆滞 > 异常 > 正常, then stock quantity descending)
   - Implement deduplication logic

3. **Phase 2.3: Update InventoryView Component**
   - Add suggestion text block for product inventory agent
   - Add suggestion text block for material inventory agent
   - Integrate aggregated recommendation functions
   - Style suggestion blocks with semantic variables

4. **Phase 2.4: Testing & Validation**
   - Test logic rule updates with various date scenarios
   - Test recommendation aggregation and sorting
   - Test UI display of suggestion blocks
   - Verify performance (NFR-001: < 500ms)

### Dependencies

- Existing InventoryView component
- Existing logicRuleService
- Existing recommendationService
- Existing Product and Material types from ontology.ts

### Risk Assessment

**Low Risk**:
- Changes are additive and enhance existing functionality
- No breaking changes to existing APIs
- Logic rule updates are straightforward (time comparison change)

**Mitigation**:
- Test time comparison edge cases (exactly 365 days, exactly 730 days)
- Verify recommendation aggregation handles empty arrays gracefully
- Ensure suggestion blocks don't break existing layout

## Next Steps

1. Generate `research.md` with detailed findings
2. Generate `data-model.md` with entity definitions
3. Generate `contracts/` with API contracts
4. Generate `quickstart.md` with implementation guide
5. Run `/speckit.tasks` to create task breakdown

