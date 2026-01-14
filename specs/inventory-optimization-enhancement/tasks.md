# Tasks: 库存优化页面增强

**Branch**: `inventory-optimization-enhancement` | **Date**: 2025-01-27  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Input**: Design documents from `/specs/inventory-optimization-enhancement/`

**Tests**: Tests are OPTIONAL - not explicitly requested in spec.md, so test tasks are not included.

**Organization**: Tasks are organized by functional requirements (FR-001 to FR-004) to enable independent implementation and testing.

## Format: `[ID] [P?] [FR?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[FR]**: Which functional requirement this task belongs to (e.g., [FR1], [FR2], [FR3], [FR4])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [x] T001 Verify `specs/inventory-optimization-enhancement/` directory exists
- [x] T002 Verify existing InventoryView component in `src/components/views/InventoryView.tsx`
- [x] T003 Verify existing logicRuleService in `src/utils/logicRuleService.ts`
- [x] T004 Verify existing recommendationService in `src/utils/recommendationService.ts`
- [x] T005 Verify Product and Material types exist in `src/types/ontology.ts` with required fields (stockQuantity, status, stopServiceDate, warehouseInDate, currentStock, maxStock, minStock)
- [x] T006 Verify Tailwind v4 semantic variables exist in `src/index.css` for suggestion block styling

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic rule updates that MUST be complete before recommendation features can be implemented

⚠️ **CRITICAL**: Recommendation features (FR-001, FR-003) depend on updated logic rules (FR-002, FR-004)

### FR-002: Product Inventory Logic Rules Update

- [x] T007 [FR2] Update time comparison in calculateProductLogicRules function in `src/utils/logicRuleService.ts` from `diffYears > 1` to `diffYears >= 1` (>= 365 days) for stop service rule
- [x] T008 [FR2] Verify stop expansion rule (停止扩容) already correctly implements actions: 内部消化, 改装 in `src/utils/logicRuleService.ts`

### FR-004: Material Inventory Logic Rules Update

- [x] T009 [FR4] Update time comparison in calculateMaterialLogicRules function in `src/utils/logicRuleService.ts` from `diffYears > 1` to `diffYears >= 1` (>= 365 days) for 异常 status
- [x] T010 [FR4] Update time comparison in calculateMaterialLogicRules function in `src/utils/logicRuleService.ts` from `diffYears > 2` to `diffYears >= 2` (>= 730 days) for 呆滞 status
- [x] T011 [FR4] Verify stock threshold rules (物料补充: currentStock - minStock < 10, 停止采购: maxStock - currentStock < 100) already correctly implemented in `src/utils/logicRuleService.ts`

**Checkpoint**: Logic rules updated - recommendation aggregation features can now be implemented

---

## Phase 3: Recommendation Aggregation (FR-001, FR-003)

**Purpose**: Implement aggregated recommendation functions for product and material inventory agents

### FR-001: Product Inventory Agent Top Recommendations

- [x] T012 [FR1] Add STATUS_PRIORITY constant mapping (呆滞: 3, 异常: 2, 正常: 1) in `src/utils/recommendationService.ts`
- [x] T013 [FR1] Add generateAggregatedProductRecommendations function in `src/utils/recommendationService.ts` that collects recommendations from all products
- [x] T014 [FR1] Implement deduplication logic in generateAggregatedProductRecommendations function in `src/utils/recommendationService.ts` (group by recommendation text, keep highest priority)
- [x] T015 [FR1] Implement priority sorting in generateAggregatedProductRecommendations function in `src/utils/recommendationService.ts` (status priority desc, then stockQuantity desc)
- [x] T016 [FR1] Implement top 3-5 selection in generateAggregatedProductRecommendations function in `src/utils/recommendationService.ts`
- [x] T017 [FR1] Add empty array handling in generateAggregatedProductRecommendations function in `src/utils/recommendationService.ts`
- [x] T018 [FR1] Import calculateProductLogicRules and Product type in `src/utils/recommendationService.ts`

### FR-003: Material Inventory Agent Top Recommendations

- [x] T019 [FR3] [P] Add generateAggregatedMaterialRecommendations function in `src/utils/recommendationService.ts` that collects recommendations from all materials
- [x] T020 [FR3] [P] Implement deduplication logic in generateAggregatedMaterialRecommendations function in `src/utils/recommendationService.ts` (group by recommendation text, keep highest priority)
- [x] T021 [FR3] [P] Implement priority sorting in generateAggregatedMaterialRecommendations function in `src/utils/recommendationService.ts` (status priority desc, then currentStock desc)
- [x] T022 [FR3] [P] Implement top 3-5 selection in generateAggregatedMaterialRecommendations function in `src/utils/recommendationService.ts`
- [x] T023 [FR3] [P] Add empty array handling in generateAggregatedMaterialRecommendations function in `src/utils/recommendationService.ts`
- [x] T024 [FR3] [P] Import calculateMaterialLogicRules and Material type in `src/utils/recommendationService.ts`

**Checkpoint**: Recommendation aggregation functions ready - UI integration can now begin

---

## Phase 4: UI Integration (FR-001, FR-003)

**Purpose**: Add suggestion text blocks to InventoryView component

### FR-001: Product Inventory Agent UI

- [x] T025 [FR1] Add import for generateAggregatedProductRecommendations in `src/components/views/InventoryView.tsx`
- [x] T026 [FR1] Add useMemo hook to calculate productRecommendations using generateAggregatedProductRecommendations(productsData) in `src/components/views/InventoryView.tsx`
- [x] T027 [FR1] Add product inventory suggestion text block after "产品库存智能体" title section (before product list) in `src/components/views/InventoryView.tsx`
- [x] T028 [FR1] Style product suggestion block with semantic Tailwind variables (bg-slate-50, text-slate-700, border-slate-200) in `src/components/views/InventoryView.tsx`
- [x] T029 [FR1] Add empty state handling for product recommendations (hide block if empty) in `src/components/views/InventoryView.tsx`

### FR-003: Material Inventory Agent UI

- [x] T030 [FR3] [P] Add import for generateAggregatedMaterialRecommendations in `src/components/views/InventoryView.tsx`
- [x] T031 [FR3] [P] Add useMemo hook to calculate materialRecommendations using generateAggregatedMaterialRecommendations(materialsData) in `src/components/views/InventoryView.tsx`
- [x] T032 [FR3] [P] Add material inventory suggestion text block after "物料库存智能体" title section (before material list) in `src/components/views/InventoryView.tsx`
- [x] T033 [FR3] [P] Style material suggestion block with semantic Tailwind variables (bg-slate-50, text-slate-700, border-slate-200) in `src/components/views/InventoryView.tsx`
- [x] T034 [FR3] [P] Add empty state handling for material recommendations (hide block if empty) in `src/components/views/InventoryView.tsx`

**Checkpoint**: UI integration complete - all features should be functional and testable

---

## Phase 5: Testing & Validation

**Purpose**: Verify implementation meets requirements and performance goals

### Logic Rules Testing

- [ ] T035 Test calculateProductLogicRules with stopServiceDate exactly 365 days ago (should trigger 呆滞 status) in `src/utils/logicRuleService.ts`
- [ ] T036 Test calculateProductLogicRules with stopServiceDate 364 days ago (should not trigger 呆滞) in `src/utils/logicRuleService.ts`
- [ ] T037 Test calculateMaterialLogicRules with warehouseInDate exactly 365 days ago (should trigger 异常 status) in `src/utils/logicRuleService.ts`
- [ ] T038 Test calculateMaterialLogicRules with warehouseInDate exactly 730 days ago (should trigger 呆滞 status) in `src/utils/logicRuleService.ts`
- [ ] T039 Test calculateMaterialLogicRules with warehouseInDate 729 days ago (should trigger 异常, not 呆滞) in `src/utils/logicRuleService.ts`

### Recommendation Aggregation Testing

- [ ] T040 Test generateAggregatedProductRecommendations with empty array (should return []) in `src/utils/recommendationService.ts`
- [ ] T041 Test generateAggregatedProductRecommendations deduplication (multiple products with same recommendation should show once) in `src/utils/recommendationService.ts`
- [ ] T042 Test generateAggregatedProductRecommendations priority sorting (呆滞 > 异常 > 正常, then stockQuantity desc) in `src/utils/recommendationService.ts`
- [ ] T043 Test generateAggregatedProductRecommendations top 3-5 selection (should return max 5 recommendations) in `src/utils/recommendationService.ts`
- [ ] T044 Test generateAggregatedMaterialRecommendations with empty array (should return []) in `src/utils/recommendationService.ts`
- [ ] T045 Test generateAggregatedMaterialRecommendations deduplication (multiple materials with same recommendation should show once) in `src/utils/recommendationService.ts`
- [ ] T046 Test generateAggregatedMaterialRecommendations priority sorting (呆滞 > 异常 > 正常, then currentStock desc) in `src/utils/recommendationService.ts`
- [ ] T047 Test generateAggregatedMaterialRecommendations top 3-5 selection (should return max 5 recommendations) in `src/utils/recommendationService.ts`

### UI Testing

- [ ] T048 Test product suggestion block renders correctly in InventoryView component
- [ ] T049 Test material suggestion block renders correctly in InventoryView component
- [ ] T050 Test suggestion blocks display top 3-5 recommendations
- [ ] T051 Test suggestion blocks use semantic Tailwind variables (no hardcoded colors)
- [ ] T052 Test suggestion blocks handle empty state (hide when no recommendations)
- [ ] T053 Test suggestion blocks layout (after panel title, before content list)

### Performance Testing

- [ ] T054 Measure recommendation calculation time (should be < 500ms per NFR-001) using browser DevTools
- [ ] T055 Verify logic rule calculation is real-time responsive to data changes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and Constitution compliance verification

### Constitution Compliance

- [ ] T056 Verify all types use ontology.ts (no ad-hoc type definitions) - Principle 1
- [ ] T057 Verify all colors use semantic Tailwind variables (no hardcoded hex colors) - Principle 2
- [ ] T058 Review InventoryView component size (currently ~400 lines, changes are additive) - Principle 3
- [ ] T059 Verify no simulation mode logic added (not applicable) - Principle 4

### Code Quality

- [ ] T060 Review code for TypeScript errors and warnings
- [ ] T061 Review code for ESLint errors and warnings
- [ ] T062 Verify all imports are correct and used
- [ ] T063 Verify all functions have proper error handling

### Documentation

- [ ] T064 Update code comments if needed for new functions
- [ ] T065 Verify quickstart.md steps match actual implementation

---

## Dependencies & Execution Order

### Story Completion Order

1. **Phase 2 (FR-002, FR-004)**: Logic rules MUST be updated first
   - All recommendation features depend on correct logic rule calculations
   - Can be done in parallel: T007-T008 (FR-002) and T009-T011 (FR-004)

2. **Phase 3 (FR-001, FR-003)**: Recommendation aggregation functions
   - Depends on: Phase 2 (logic rules)
   - Can be done in parallel: T012-T018 (FR-001) and T019-T024 (FR-003)

3. **Phase 4 (FR-001, FR-003)**: UI integration
   - Depends on: Phase 3 (aggregation functions)
   - Can be done in parallel: T025-T029 (FR-001) and T030-T034 (FR-003)

4. **Phase 5**: Testing & validation
   - Depends on: All previous phases

5. **Phase 6**: Polish
   - Depends on: All previous phases

### Parallel Execution Opportunities

**Within Phase 2**:
- T007-T008 (FR-002) and T009-T011 (FR-004) can run in parallel

**Within Phase 3**:
- T012-T018 (FR-001) and T019-T024 (FR-003) can run in parallel (marked with [P])

**Within Phase 4**:
- T025-T029 (FR-001) and T030-T034 (FR-003) can run in parallel (marked with [P])

**Within Phase 5**:
- Logic rules tests (T035-T039) can run in parallel
- Recommendation tests (T040-T047) can run in parallel
- UI tests (T048-T053) can run in parallel

## Implementation Strategy

### MVP Scope

**Minimum Viable Product**: Phase 2 + Phase 3 + Phase 4 (FR-001 only)

- Update logic rules (FR-002, FR-004)
- Implement product recommendation aggregation (FR-001)
- Add product suggestion block to UI

This provides one complete feature (product inventory recommendations) that can be tested independently.

### Incremental Delivery

1. **Increment 1**: Logic rules updates (Phase 2)
   - Enables correct status calculations
   - Can be tested independently

2. **Increment 2**: Product recommendations (Phase 3 FR-001 + Phase 4 FR-001)
   - Complete product inventory agent enhancement
   - Can be tested independently

3. **Increment 3**: Material recommendations (Phase 3 FR-003 + Phase 4 FR-003)
   - Complete material inventory agent enhancement
   - Can be tested independently

4. **Increment 4**: Testing and polish (Phase 5 + Phase 6)
   - Full feature validation
   - Code quality improvements

## Task Summary

- **Total Tasks**: 65
- **Setup Tasks**: 6 (Phase 1)
- **Foundational Tasks**: 5 (Phase 2)
- **Recommendation Tasks**: 13 (Phase 3)
- **UI Integration Tasks**: 10 (Phase 3)
- **Testing Tasks**: 20 (Phase 5)
- **Polish Tasks**: 11 (Phase 6)

### Tasks by Functional Requirement

- **FR-002 (Product Logic Rules)**: 2 tasks (T007-T008)
- **FR-004 (Material Logic Rules)**: 3 tasks (T009-T011)
- **FR-001 (Product Recommendations)**: 15 tasks (T012-T018, T025-T029, T040-T043, T048-T050)
- **FR-003 (Material Recommendations)**: 13 tasks (T019-T024, T030-T034, T044-T047, T051-T053)

### Parallel Opportunities

- **Phase 2**: 2 parallel tracks (FR-002 and FR-004)
- **Phase 3**: 2 parallel tracks (FR-001 and FR-003)
- **Phase 4**: 2 parallel tracks (FR-001 UI and FR-003 UI)
- **Phase 5**: 3 parallel test tracks (logic rules, recommendations, UI)

## Independent Test Criteria

### FR-002: Product Logic Rules
**Test**: Update logicRuleService, test with product having stopServiceDate exactly 365 days ago, verify 呆滞 status and actions (改装, 清退) are triggered.

### FR-004: Material Logic Rules
**Test**: Update logicRuleService, test with material having warehouseInDate exactly 365 days ago (异常) and 730 days ago (呆滞), verify correct status and actions.

### FR-001: Product Recommendations
**Test**: Open inventory page, verify product inventory agent shows suggestion block with top 3-5 recommendations after panel title, before product list.

### FR-003: Material Recommendations
**Test**: Open inventory page, verify material inventory agent shows suggestion block with top 3-5 recommendations after panel title, before material list.

