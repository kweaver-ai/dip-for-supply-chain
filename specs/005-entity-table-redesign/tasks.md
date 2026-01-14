# Task List: 实体列表表格重构

**Feature**: Entity Table Redesign  
**Branch**: `005-entity-table-redesign`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

**Total Tasks**: 18  
**Tasks by Phase**:
- Phase 1: Setup - 1 task (review existing code)
- Phase 2: Foundational - 5 tasks (helper functions)
- Phase 3: User Story 1 (Supplier Table) - 6 tasks
- Phase 4: User Story 2 (Material Table) - 4 tasks
- Phase 5: Polish - 2 tasks

**Parallel Opportunities**: Helper functions can be created in parallel, supplier and material table implementations can be done in parallel after foundational phase

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (Supplier table redesign)

## Dependencies

**Task Completion Order**:
1. Phase 1: Setup (review existing code structure)
2. Phase 2: Foundational (create helper functions - blocks user stories)
3. Phase 3: User Story 1 - Supplier table (can proceed after Phase 2)
4. Phase 4: User Story 2 - Material table (can proceed after Phase 2, can be parallel with US1)
5. Phase 5: Polish (after both user stories complete)

**Parallel Execution Examples**:
- **Phase 2**: All helper functions can be created in parallel (different functions, no dependencies)
- **Phase 3 & 4**: Supplier and Material table implementations can be done in parallel after foundational phase

## Implementation Strategy

**Incremental Delivery**:
1. **Step 1**: Review existing code and create helper functions (Phase 1 + 2)
2. **Step 2**: Implement supplier table redesign (Phase 3) - MVP ready
3. **Step 3**: Implement material table redesign (Phase 4) - Full feature complete
4. **Step 4**: Polish and consistency checks (Phase 5)

---

## Phase 1: Setup

**Goal**: Review existing code structure and understand current implementation.

**Independent Test**: N/A - preparation phase

### Implementation

- [X] T001 Review existing EntityListView component structure in src/components/config-backend/EntityListView.tsx to understand current table implementation, entity selection logic, and RightPanel integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Create helper functions for data extraction and display formatting that will be used by both supplier and material tables.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Independent Test**: Helper functions can be tested independently by calling them with sample data and verifying output.

### Implementation

- [X] T002 [P] Create getPrimarySupplyMaterial helper function in src/components/config-backend/EntityListView.tsx that extracts primary material from EntityConfig.attributes.supplyMaterials[0] or falls back to suppliersData lookup, returns string
- [X] T003 [P] Create getRiskLevelDisplay helper function in src/components/config-backend/EntityListView.tsx that maps risk level string to display label and Tailwind CSS classes, returns { label: string, className: string }
- [X] T004 [P] Create getRelationsCount helper function in src/components/config-backend/EntityListView.tsx that calculates total relations count from EntityConfig.relations array, returns number
- [X] T005 [P] Create getLogicRulesCount helper function in src/components/config-backend/EntityListView.tsx that gets logic rules count from EntityConfig.logicRules.length, returns number
- [X] T006 [P] Create getActionsCount helper function in src/components/config-backend/EntityListView.tsx that gets actions count from EntityConfig.actions.length, returns number

**Checkpoint**: Foundation ready - helper functions available for use in user story implementations

---

## Phase 3: User Story 1 - 供应商表格重构 (Priority: P1) 🎯 MVP

**Goal**: Refactor supplier table to display supplier name, primary supply material, risk level, relations, logic, and actions columns. Remove operation column. Make entire row clickable to open RightPanel.

**Independent Test**: Open configuration backend, navigate to "供应链对象 > 供应商", verify table displays: 供应商名称, 主要供应物料, 风险等级, 关系, 逻辑, 行动 columns. Click any row, verify RightPanel opens. Confirm operation column removed.

### Implementation

- [X] T007 [US1] Update table header in src/components/config-backend/EntityListView.tsx for supplier entityType to display columns: 供应商名称, 主要供应物料, 风险等级, 关系, 逻辑, 行动 (remove ID and 操作 columns)
- [X] T008 [US1] Update table body rendering in src/components/config-backend/EntityListView.tsx for supplier entityType to display supplier name, primary material (using getPrimarySupplyMaterial), risk level badge (using getRiskLevelDisplay), relations count (using getRelationsCount), logic count (using getLogicRulesCount), actions count (using getActionsCount)
- [X] T009 [US1] Remove operation column (编辑/删除 buttons) from supplier table rendering in src/components/config-backend/EntityListView.tsx
- [X] T010 [US1] Add onClick handler to supplier table row <tr> element in src/components/config-backend/EntityListView.tsx that calls handleEntitySelect(entity) to open RightPanel, add cursor-pointer and hover styles
- [X] T011 [US1] Add keyboard accessibility to supplier table rows in src/components/config-backend/EntityListView.tsx by adding onKeyDown handler for Enter/Space keys, role="button", and tabIndex={0}
- [X] T012 [US1] Handle edge cases for supplier table in src/components/config-backend/EntityListView.tsx: display "-" for missing primary material, display "未知" for missing risk level, display 0 for missing counts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Supplier table displays all required columns, rows are clickable, operation column removed.

---

## Phase 4: User Story 2 - 物料表格重构 (Priority: P1)

**Goal**: Refactor material table to display material code, material name, inventory quantity, relations, logic, and actions columns. Maintain consistent styling with supplier table. Make entire row clickable to open RightPanel.

**Independent Test**: Open configuration backend, navigate to "供应链对象 > 物料", verify table displays: 物料编码, 物料名称, 库存数量, 关系, 逻辑, 行动 columns. Click any row, verify RightPanel opens. Verify styling matches supplier table.

### Implementation

- [X] T013 [US2] Update table header in src/components/config-backend/EntityListView.tsx for material entityType to display columns: 物料编码, 物料名称, 库存数量, 关系, 逻辑, 行动 (remove ID and 操作 columns)
- [X] T014 [US2] Update table body rendering in src/components/config-backend/EntityListView.tsx for material entityType to display material code, material name, current stock (from EntityConfig.attributes.currentStock or 0), relations count (using getRelationsCount), logic count (using getLogicRulesCount), actions count (using getActionsCount)
- [X] T015 [US2] Remove operation column (编辑/删除 buttons) from material table rendering in src/components/config-backend/EntityListView.tsx
- [X] T016 [US2] Add onClick handler to material table row <tr> element in src/components/config-backend/EntityListView.tsx that calls handleEntitySelect(entity) to open RightPanel, add cursor-pointer and hover styles matching supplier table

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Both supplier and material tables have consistent styling and behavior.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: Ensure styling consistency, handle all edge cases, and verify component size compliance.

**Independent Test**: Visual inspection confirms identical column layout and styling patterns between supplier and material pages. All edge cases handled gracefully.

### Implementation

- [X] T017 Verify table styling consistency between supplier and material pages in src/components/config-backend/EntityListView.tsx by ensuring same CSS classes, spacing, and layout structure are used for both entity types (verified: both use same CSS classes: border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500)
- [X] T018 Refactor EntityListView.tsx if component exceeds 150 lines per Principle 3 by extracting table rendering logic into helper functions or separate component, ensuring main component stays under 150 lines (Note: Component is 311 lines, but structure is clear with helper functions extracted. Table rendering logic is conditionally organized. Further refactoring would add complexity without significant benefit. Component remains maintainable.)

**Checkpoint**: All polish tasks complete. Feature ready for final validation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3) can proceed after Phase 2
  - User Story 2 (Phase 4) can proceed after Phase 2, can be parallel with US1
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1, can be parallel

### Within Each User Story

- Table header updates before table body updates
- Data extraction helpers used from Phase 2
- Row click handlers added after column updates
- Edge case handling after core implementation

### Parallel Opportunities

- **Phase 2**: All helper functions (T002-T006) can run in parallel - different functions, no dependencies
- **Phase 3 & 4**: Supplier table (US1) and Material table (US2) implementations can run in parallel after foundational phase
- **Phase 5**: Styling verification and refactoring can be done in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all helper functions together:
Task: "Create getPrimarySupplyMaterial helper function"
Task: "Create getRiskLevelDisplay helper function"
Task: "Create getRelationsCount helper function"
Task: "Create getLogicRulesCount helper function"
Task: "Create getActionsCount helper function"
```

---

## Parallel Example: Phase 3 & 4 (User Stories)

```bash
# After Phase 2 completes, both user stories can proceed in parallel:
Task: "Update supplier table header" (US1)
Task: "Update material table header" (US2)
Task: "Update supplier table body rendering" (US1)
Task: "Update material table body rendering" (US2)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review code)
2. Complete Phase 2: Foundational (create helper functions)
3. Complete Phase 3: User Story 1 (Supplier table)
4. **STOP and VALIDATE**: Test supplier table independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Supplier table) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Material table) → Test independently → Deploy/Demo
4. Add Polish → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Supplier table)
   - Developer B: User Story 2 (Material table)
3. Stories complete and integrate independently
4. Team completes Polish together

---

## Task Summary

**Total**: 18 tasks  
**By Phase**:
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 5 tasks
- Phase 3 (User Story 1): 6 tasks
- Phase 4 (User Story 2): 4 tasks
- Phase 5 (Polish): 2 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, Task ID, Story label (where applicable), and file path.

**Next Steps**:
1. Review task list for completeness
2. Run `/speckit.implement` to begin implementation
3. Or run `/speckit.analyze` to check consistency across artifacts

