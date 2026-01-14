# Tasks: 供应链管理视图页面组件拆分重构

**Branch**: `001-refactor-view-components` | **Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Input**: Design documents from `/specs/001-refactor-view-components/`

**Tests**: Tests are OPTIONAL - not explicitly requested in spec.md, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [x] T001 Verify `src/components/shared/` directory exists or create it
- [x] T002 Verify `src/components/views/` directory exists or create it
- [x] T003 Verify TypeScript and React dependencies are installed in `package.json`
- [x] T004 Verify Tailwind CSS v4 semantic variables exist in `src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Verify `src/SupplyChainApp.tsx` file exists and contains all components to be extracted
- [x] T006 [P] Verify Badge component code exists in `src/SupplyChainApp.tsx` (lines ~45-56)
- [x] T007 [P] Verify CopilotSidebar component code exists in `src/SupplyChainApp.tsx` (lines ~59-146)
- [x] T008 [P] Verify EnhancedCockpitView component code exists in `src/SupplyChainApp.tsx` (lines ~149-383)
- [x] T009 [P] Verify EnhancedSearchView component code exists in `src/SupplyChainApp.tsx` (lines ~386-544)
- [x] T010 [P] Verify EnhancedInventoryView component code exists in `src/SupplyChainApp.tsx` (lines ~547-688)
- [x] T011 [P] Verify EnhancedDeliveryView component code exists in `src/SupplyChainApp.tsx` (lines ~691-795)
- [x] T012 Verify all required icon imports from lucide-react are available
- [x] T013 Verify all required chart components from recharts are available
- [x] T014 Verify Constitution compliance: check that existing code uses semantic Tailwind variables (Principle 2)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 提取共享组件 (Priority: P1) 🎯 MVP

**Goal**: Extract shared components (Badge, CopilotSidebar) to independent files for reuse across multiple business views

**Independent Test**: Verify Badge and CopilotSidebar components extracted后，原有功能保持不变，所有使用这些组件的页面仍能正常工作

### Implementation for User Story 1

- [x] T015 [US1] Extract Badge component from `src/SupplyChainApp.tsx` to `src/components/shared/Badge.tsx` with all existing functionality preserved
- [x] T016 [US1] Add React import to `src/components/shared/Badge.tsx`
- [x] T017 [US1] Export Badge component as named export in `src/components/shared/Badge.tsx`
- [x] T018 [US1] Remove Badge component definition from `src/SupplyChainApp.tsx`
- [x] T019 [US1] Add Badge import statement to `src/SupplyChainApp.tsx`: `import { Badge } from './components/shared/Badge';`
- [x] T020 [US1] Verify Badge component compiles without errors
- [x] T021 [US1] Verify Badge component displays correctly in all views that use it
- [x] T022 [US1] Verify `src/components/shared/Badge.tsx` file size < 150 lines (Principle 3 compliance)
- [x] T023 [US1] Extract CopilotSidebar component from `src/SupplyChainApp.tsx` to `src/components/shared/CopilotSidebar.tsx` with all existing props and behavior preserved
- [x] T024 [US1] Add React and useState imports to `src/components/shared/CopilotSidebar.tsx`
- [x] T025 [US1] Add lucide-react icon imports (Bot, User, X, Send) to `src/components/shared/CopilotSidebar.tsx`
- [x] T026 [US1] Export CopilotSidebar component as named export in `src/components/shared/CopilotSidebar.tsx`
- [x] T027 [US1] Remove CopilotSidebar component definition from `src/SupplyChainApp.tsx`
- [x] T028 [US1] Add CopilotSidebar import statement to `src/SupplyChainApp.tsx`: `import { CopilotSidebar } from './components/shared/CopilotSidebar';`
- [x] T029 [US1] Verify CopilotSidebar component compiles without errors
- [x] T030 [US1] Verify CopilotSidebar opens/closes correctly
- [x] T031 [US1] Verify CopilotSidebar messages send/receive correctly
- [x] T032 [US1] Verify `src/components/shared/CopilotSidebar.tsx` file size < 150 lines (Principle 3 compliance)
- [x] T033 [US1] Verify all Badge usages in `src/SupplyChainApp.tsx` still work after extraction
- [x] T034 [US1] Verify all CopilotSidebar usages in `src/SupplyChainApp.tsx` still work after extraction

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 提取业务视图组件 (Priority: P1)

**Goal**: Extract business view components (CockpitView, SearchView, InventoryView, DeliveryView) to independent files

**Independent Test**: Verify each business view component extracted后，页面功能完整，导航和交互正常，组件大小符合原则3限制

### Implementation for User Story 2

- [ ] T035 [US2] Extract EnhancedCockpitView component from `src/SupplyChainApp.tsx` to `src/components/views/CockpitView.tsx` with all KPI metrics, charts, and navigation functionality preserved
- [ ] T036 [US2] Rename EnhancedCockpitView to CockpitView in `src/components/views/CockpitView.tsx`
- [ ] T037 [US2] Add React import to `src/components/views/CockpitView.tsx`
- [ ] T038 [US2] Add Badge import to `src/components/views/CockpitView.tsx`: `import { Badge } from '../shared/Badge';`
- [ ] T039 [US2] Add all required lucide-react icon imports to `src/components/views/CockpitView.tsx`
- [ ] T040 [US2] Add all required recharts chart component imports to `src/components/views/CockpitView.tsx`
- [ ] T041 [US2] Export CockpitView component as default export in `src/components/views/CockpitView.tsx`
- [ ] T042 [US2] Remove EnhancedCockpitView component definition from `src/SupplyChainApp.tsx`
- [ ] T043 [US2] Add CockpitView import statement to `src/SupplyChainApp.tsx`: `import CockpitView from './components/views/CockpitView';`
- [ ] T044 [US2] Update SupplyChainApp.tsx to use CockpitView instead of EnhancedCockpitView
- [ ] T045 [US2] Verify CockpitView component compiles without errors
- [ ] T046 [US2] Verify CockpitView displays all KPIs, charts, and navigation correctly
- [ ] T047 [US2] Verify `src/components/views/CockpitView.tsx` file size < 150 lines (Principle 3 compliance)
- [ ] T048 [US2] Extract EnhancedSearchView component from `src/SupplyChainApp.tsx` to `src/components/views/SearchView.tsx` with all search, filter, and display modes preserved
- [ ] T049 [US2] Rename EnhancedSearchView to SearchView in `src/components/views/SearchView.tsx`
- [ ] T050 [US2] Add React and useState imports to `src/components/views/SearchView.tsx`
- [ ] T051 [US2] Add Badge import to `src/components/views/SearchView.tsx`: `import { Badge } from '../shared/Badge';`
- [ ] T052 [US2] Add all required lucide-react icon imports to `src/components/views/SearchView.tsx`
- [ ] T053 [US2] Export SearchView component as default export in `src/components/views/SearchView.tsx`
- [ ] T054 [US2] Remove EnhancedSearchView component definition from `src/SupplyChainApp.tsx`
- [ ] T055 [US2] Add SearchView import statement to `src/SupplyChainApp.tsx`: `import SearchView from './components/views/SearchView';`
- [ ] T056 [US2] Update SupplyChainApp.tsx to use SearchView instead of EnhancedSearchView
- [ ] T057 [US2] Verify SearchView component compiles without errors
- [ ] T058 [US2] Verify SearchView search, filter, and view modes work correctly
- [ ] T059 [US2] Verify `src/components/views/SearchView.tsx` file size < 150 lines (Principle 3 compliance)
- [ ] T060 [US2] Extract EnhancedInventoryView component from `src/SupplyChainApp.tsx` to `src/components/views/InventoryView.tsx` with all inventory risk cards, charts, and AI suggestions preserved
- [ ] T061 [US2] Rename EnhancedInventoryView to InventoryView in `src/components/views/InventoryView.tsx`
- [ ] T062 [US2] Add React import to `src/components/views/InventoryView.tsx`
- [ ] T063 [US2] Add Badge import to `src/components/views/InventoryView.tsx`: `import { Badge } from '../shared/Badge';`
- [ ] T064 [US2] Add all required lucide-react icon imports to `src/components/views/InventoryView.tsx`
- [ ] T065 [US2] Add all required recharts chart component imports to `src/components/views/InventoryView.tsx`
- [ ] T066 [US2] Export InventoryView component as default export in `src/components/views/InventoryView.tsx`
- [ ] T067 [US2] Remove EnhancedInventoryView component definition from `src/SupplyChainApp.tsx`
- [ ] T068 [US2] Add InventoryView import statement to `src/SupplyChainApp.tsx`: `import InventoryView from './components/views/InventoryView';`
- [ ] T069 [US2] Update SupplyChainApp.tsx to use InventoryView instead of EnhancedInventoryView
- [ ] T070 [US2] Verify InventoryView component compiles without errors
- [ ] T071 [US2] Verify InventoryView displays inventory risk cards, charts, and AI suggestions correctly
- [ ] T072 [US2] Verify `src/components/views/InventoryView.tsx` file size < 150 lines (Principle 3 compliance)
- [ ] T073 [US2] Extract EnhancedDeliveryView component from `src/SupplyChainApp.tsx` to `src/components/views/DeliveryView.tsx` with all order tracking, statistics, and trend charts preserved
- [ ] T074 [US2] Rename EnhancedDeliveryView to DeliveryView in `src/components/views/DeliveryView.tsx`
- [ ] T075 [US2] Add React import to `src/components/views/DeliveryView.tsx`
- [ ] T076 [US2] Add Badge import to `src/components/views/DeliveryView.tsx`: `import { Badge } from '../shared/Badge';`
- [ ] T077 [US2] Add all required lucide-react icon imports to `src/components/views/DeliveryView.tsx`
- [ ] T078 [US2] Add all required recharts chart component imports to `src/components/views/DeliveryView.tsx`
- [ ] T079 [US2] Export DeliveryView component as default export in `src/components/views/DeliveryView.tsx`
- [ ] T080 [US2] Remove EnhancedDeliveryView component definition from `src/SupplyChainApp.tsx`
- [ ] T081 [US2] Add DeliveryView import statement to `src/SupplyChainApp.tsx`: `import DeliveryView from './components/views/DeliveryView';`
- [ ] T082 [US2] Update SupplyChainApp.tsx to use DeliveryView instead of EnhancedDeliveryView
- [ ] T083 [US2] Verify DeliveryView component compiles without errors
- [ ] T084 [US2] Verify DeliveryView displays order tracking, statistics, and trend charts correctly
- [ ] T085 [US2] Verify `src/components/views/DeliveryView.tsx` file size < 150 lines (Principle 3 compliance)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 简化主应用组件 (Priority: P2)

**Goal**: Simplify SupplyChainApp main component to only contain navigation logic, view routing, and component orchestration

**Independent Test**: Verify main app component simplified后，导航功能正常，所有业务视图正确加载，组件大小符合原则3限制

### Implementation for User Story 3

- [ ] T086 [US3] Remove all component definitions from `src/SupplyChainApp.tsx` (already extracted in US1 and US2)
- [ ] T087 [US3] Remove unused icon imports from `src/SupplyChainApp.tsx` (keep only navigation icons)
- [ ] T088 [US3] Remove unused chart component imports from `src/SupplyChainApp.tsx` (charts are now in view components)
- [ ] T089 [US3] Update import statements in `src/SupplyChainApp.tsx` to import all extracted components
- [ ] T090 [US3] Verify SupplyChainApp component only contains navigation logic, view routing, and component orchestration
- [ ] T091 [US3] Verify all view components render correctly from SupplyChainApp navigation
- [ ] T092 [US3] Verify navigation between views works correctly
- [ ] T093 [US3] Verify `src/SupplyChainApp.tsx` file size < 150 lines (Principle 3 compliance)
- [ ] T094 [US3] Verify CopilotSidebar integration works correctly with page-specific configurations
- [ ] T095 [US3] Verify all component props and callbacks are correctly passed between components

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, compliance checks, and cleanup

- [ ] T096 Verify all extracted components comply with Principle 1 (types reference ontology.ts where applicable)
- [ ] T097 Verify all extracted components comply with Principle 2 (use semantic Tailwind variables, no hardcoded colors)
- [ ] T098 Verify all extracted components comply with Principle 3 (component size < 150 lines)
- [ ] T099 Verify zero TypeScript compilation errors across all files
- [ ] T100 Verify zero ESLint errors across all files
- [ ] T101 Verify all imports resolve correctly (no broken import paths)
- [ ] T102 Verify no unused imports remain in any component file
- [ ] T103 Test all business views load correctly from navigation
- [ ] T104 Test navigation between views works smoothly
- [ ] T105 Test shared components (Badge, CopilotSidebar) work in all contexts
- [ ] T106 Test AI assistant (CopilotSidebar) works on all pages
- [ ] T107 Verify no visual regressions (compare before/after screenshots)
- [ ] T108 Verify 100% functional parity (all features work identically before and after refactoring)
- [ ] T109 Verify no performance degradation (refactoring maintains existing performance characteristics)
- [ ] T110 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - Uses shared components from US1 but independently testable
  - User Story 3 (P2): Can start after Foundational - Uses shared components from US1 and view components from US2 but independently testable
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses Badge and CopilotSidebar from US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses all extracted components from US1/US2 but independently testable

### Within Each User Story

- Extract component before removing from main file
- Add imports before using component
- Verify compilation after each extraction
- Verify functionality after each extraction
- Verify component size < 150 lines after extraction

### Parallel Opportunities

- All Setup tasks can run in parallel
- All Foundational verification tasks (T006-T011) marked [P] can run in parallel
- Within User Story 1: T015-T022 (Badge extraction) and T023-T032 (CopilotSidebar extraction) can be worked on sequentially
- Within User Story 2: T035-T047 (CockpitView), T048-T059 (SearchView), T060-T072 (InventoryView), T073-T085 (DeliveryView) can be worked on in parallel after US1 completes
- Once Foundational phase completes, User Stories 1 and 2 can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 2

```bash
# After User Story 1 completes, User Story 2 can extract all view components in parallel:

# Stream 1: CockpitView extraction
Task: "Extract EnhancedCockpitView component from src/SupplyChainApp.tsx to src/components/views/CockpitView.tsx"
Task: "Add React import to src/components/views/CockpitView.tsx"
Task: "Add Badge import to src/components/views/CockpitView.tsx"

# Stream 2: SearchView extraction (parallel with Stream 1)
Task: "Extract EnhancedSearchView component from src/SupplyChainApp.tsx to src/components/views/SearchView.tsx"
Task: "Add React and useState imports to src/components/views/SearchView.tsx"
Task: "Add Badge import to src/components/views/SearchView.tsx"

# Stream 3: InventoryView extraction (parallel with Streams 1 and 2)
Task: "Extract EnhancedInventoryView component from src/SupplyChainApp.tsx to src/components/views/InventoryView.tsx"

# Stream 4: DeliveryView extraction (parallel with Streams 1, 2, and 3)
Task: "Extract EnhancedDeliveryView component from src/SupplyChainApp.tsx to src/components/views/DeliveryView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (提取共享组件)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (提取共享组件)
   - Developer B: User Story 2 (提取业务视图组件) - can start after US1 completes Badge extraction
   - Developer C: User Story 3 (简化主应用组件) - can start after US1 and US2 complete
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 110
- **Setup Tasks**: 4 (T001-T004)
- **Foundational Tasks**: 10 (T005-T014)
- **User Story 1 Tasks**: 20 (T015-T034)
- **User Story 2 Tasks**: 51 (T035-T085)
- **User Story 3 Tasks**: 10 (T086-T095)
- **Polish Tasks**: 15 (T096-T110)

### Independent Test Criteria

- **User Story 1**: Verify Badge and CopilotSidebar components extracted后，原有功能保持不变，所有使用这些组件的页面仍能正常工作
- **User Story 2**: Verify each business view component extracted后，页面功能完整，导航和交互正常，组件大小符合原则3限制
- **User Story 3**: Verify main app component simplified后，导航功能正常，所有业务视图正确加载，组件大小符合原则3限制

### Suggested MVP Scope

**MVP = User Story 1 Only** (提取共享组件)
- Provides core value: reusable shared components
- Independent and testable
- Can be delivered and demoed independently
- Foundation for subsequent stories

---

## Notes

- All components MUST use semantic color variables from `src/index.css` (Principle 2)
- All types MUST reference `src/types/ontology.ts` where applicable (Principle 1)
- Components exceeding 150 lines MUST be split further (Principle 3)
- This refactoring maintains 100% functional parity - no feature changes
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

