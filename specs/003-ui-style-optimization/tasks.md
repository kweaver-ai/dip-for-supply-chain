# Task List: UI风格系统性优化

**Feature**: UI Style Optimization  
**Branch**: `003-ui-style-optimization`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

**Total Tasks**: 58  
**Tasks by User Story**:
- Setup: 3 tasks
- Foundational: 2 tasks
- US-001 (商务风格视觉体验): 18 tasks
- US-002 (柔和的线条颜色): 8 tasks
- US-003 (适中的面板尺寸): 12 tasks
- US-004 (品牌标识更新): 8 tasks
- Polish: 7 tasks

**Parallel Opportunities**: Many tasks can be executed in parallel within each phase (marked with [P])

**MVP Scope**: US-001 + US-002 + US-004 (business style, soft borders, logo integration)

## Dependencies

**Story Completion Order**:
1. Setup → Foundational (must complete first - logo assets needed by US-004)
2. US-001 (can be parallel with US-002 after Foundational)
3. US-002 (can be parallel with US-001 after Foundational)
4. US-003 (depends on US-001 - needs panels to exist before sizing)
5. US-004 (can be parallel with US-001/US-002 after Setup)
6. Polish (depends on all user stories)

**Parallel Execution Examples**:
- **Setup**: T001-T003 can be done in parallel (different logo files)
- **US-001**: T006-T023 can be done in parallel (different components)
- **US-002**: T024-T031 can be done in parallel (different components)
- **US-003**: T032-T043 can be done in parallel (different components)
- **US-004**: T044-T051 can be done in parallel (different locations)

## Implementation Strategy

**MVP First**: Start with Setup → Foundational → US-001 → US-002 → US-004 to deliver core visual improvements.

**Incremental Delivery**:
1. **Sprint 1**: Setup + Foundational + US-004 (logo integration)
2. **Sprint 2**: US-001 + US-002 (business style + soft borders)
3. **Sprint 3**: US-003 (panel size optimization)
4. **Sprint 4**: Polish (consistency review, responsive testing)

---

## Phase 1: Setup

**Goal**: Add logo assets and prepare for style updates.

**Independent Test**: Logo files exist in correct locations, favicon updated.

### Implementation

- [X] T001 Create src/assets directory if it doesn't exist
- [X] T002 Add supply chain brain logo.svg file to src/assets/logo.svg (SVG format, optimized < 50KB)
- [X] T003 Add supply chain brain logo PNG files to public/ directory (logo-32x32.png, logo-192x192.png, optimized < 20KB each)

---

## Phase 2: Foundational

**Goal**: Update favicon and establish logo integration pattern.

**Independent Test**: Favicon displays logo, logo loading pattern established.

### Implementation

- [X] T004 Update favicon link tags in index.html to use supply chain brain logo (add link rel="icon" tags for SVG and PNG formats)
- [X] T005 Add logo fallback handling pattern (onError handler for graceful degradation if logo fails to load)

---

## Phase 3: User Story 1 - 商务风格视觉体验

**Goal**: Apply business-style design to all panels (rounded corners, subtle shadows, professional color scheme).

**Independent Test**: All panels display with business-style design (rounded corners, shadows, professional appearance).

### Implementation

- [X] T006 [US1] Apply business style to SupplyChainApp.tsx main container (add rounded-lg, shadow-sm, ensure border-slate-200)
- [X] T007 [US1] Apply business style to CockpitView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T008 [US1] Apply business style to SearchView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T009 [US1] Apply business style to InventoryView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T010 [US1] Apply business style to DeliveryView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T011 [US1] Apply business style to SupplierEvaluationPage.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T012 [US1] Apply business style to ProductSupplyOptimizationPage.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T013 [US1] Apply business style to ConfigBackendLayout.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T014 [US1] Apply business style to KnowledgeGraphView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T015 [US1] Apply business style to EntityListView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [X] T016 [US1] Apply business style to RightPanel.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [ ] T017 [US1] Apply business style to NewObjectModal.tsx modal (add rounded-xl, shadow-lg, border-slate-200)
- [X] T018 [US1] Apply business style to UserManagementView.tsx panels (add rounded-lg/xl, shadow-sm/md, border-slate-200 to all panels)
- [ ] T019 [US1] Apply business style to ConfigAIAssistant.tsx sidebar (add rounded-lg, shadow-lg, border-slate-200)
- [X] T020 [US1] Apply business style to CopilotSidebar.tsx sidebar (add rounded-lg, shadow-lg, border-slate-200)
- [ ] T021 [US1] Ensure all cards use business style in all view components (rounded-lg, shadow-sm, border-slate-200)
- [ ] T022 [US1] Ensure all modals use business style in all components (rounded-xl, shadow-lg, border-slate-200)
- [ ] T023 [US1] Verify business style consistency across all pages (visual inspection, ensure 90%+ of panels follow guidelines)

---

## Phase 4: User Story 2 - 柔和的线条颜色

**Goal**: Replace all pure black borders and divider lines with soft colors (slate-200, slate-300).

**Independent Test**: Zero instances of pure black (#000000) borders or lines remain, all use soft colors.

### Implementation

- [X] T024 [US2] Audit and replace pure black borders in SupplyChainApp.tsx (search for border-black, #000000, rgb(0,0,0), replace with border-slate-200 or border-slate-300)
- [X] T025 [US2] Audit and replace pure black borders in all view components (CockpitView, SearchView, InventoryView, DeliveryView, SupplierEvaluationPage, ProductSupplyOptimizationPage)
- [X] T026 [US2] Audit and replace pure black borders in config backend components (ConfigBackendLayout, KnowledgeGraphView, EntityListView, RightPanel, NewObjectModal, UserManagementView, ConfigAIAssistant)
- [X] T027 [US2] Audit and replace pure black borders in shared components (CopilotSidebar)
- [X] T028 [US2] Replace pure black SVG stroke colors in KnowledgeGraphView.tsx (replace stroke="black" or stroke="#000000" with stroke="rgb(148, 163, 184)" or similar)
- [X] T029 [US2] Replace pure black table borders in all components (ensure table borders use border-slate-200 or border-slate-300)
- [X] T030 [US2] Replace pure black divider lines in all components (ensure hr and divider elements use border-slate-200)
- [X] T031 [US2] Verify no pure black colors remain (code audit using grep for #000000, rgb(0,0,0), border-black, stroke="black")

---

## Phase 5: User Story 3 - 适中的面板尺寸

**Goal**: Adjust panel sizes to be moderate (max-w-5xl/6xl instead of max-w-7xl, balanced padding and spacing).

**Independent Test**: All panels have moderate maximum widths (max-w-3xl to max-w-6xl), balanced spacing.

### Implementation

- [X] T032 [US3] Update SupplyChainApp.tsx main container max-width from max-w-7xl to max-w-5xl or max-w-6xl
- [X] T033 [US3] Update CockpitView.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T034 [US3] Update SearchView.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T035 [US3] Update InventoryView.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T036 [US3] Update DeliveryView.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T037 [US3] Update SupplierEvaluationPage.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T038 [US3] Update ProductSupplyOptimizationPage.tsx panel max-widths to moderate sizes (max-w-5xl or max-w-6xl instead of max-w-7xl or max-w-full)
- [X] T039 [US3] Optimize panel padding in all view components (ensure px-4 to px-6, py-4 to py-6, not px-8 or larger)
- [X] T040 [US3] Optimize card spacing in all components (ensure gap-4 to gap-6, not gap-2 or gap-8)
- [X] T041 [US3] Ensure sidebar widths are moderate in config backend (w-64 to w-80, not w-96 or larger)
- [X] T042 [US3] Verify panel sizes are responsive and adapt to different screen sizes (test on mobile, tablet, desktop)
- [X] T043 [US3] Verify panel spacing and padding are balanced (not exceeding 20% of screen width for single panels)

---

## Phase 6: User Story 4 - 品牌标识更新

**Goal**: Replace application icon with supply chain brain logo in all relevant locations.

**Independent Test**: Supply chain brain logo appears in header, favicon, and all brand-related locations.

### Implementation

- [ ] T044 [US4] Replace Activity icon with supply chain brain logo in SupplyChainApp.tsx header (replace icon div with img tag using /logo.svg)
- [ ] T045 [US4] Add logo fallback handling in SupplyChainApp.tsx (onError handler to show fallback icon if logo fails to load)
- [ ] T046 [US4] Verify favicon displays supply chain brain logo in browser tab (check index.html favicon links)
- [ ] T047 [US4] Ensure logo displays correctly in header at different sizes (test logo rendering at 40x40px and 48x48px)
- [ ] T048 [US4] Add alt text to logo image in SupplyChainApp.tsx (alt="供应链大脑" for accessibility)
- [ ] T049 [US4] Verify logo file paths are correct (check /logo.svg, /logo-32x32.png, /logo-192x192.png exist in public/)
- [ ] T050 [US4] Test logo loading with fallback (simulate logo file missing, verify fallback icon displays)
- [ ] T051 [US4] Verify logo appears in all brand-related locations (header, favicon, check for any other icon locations)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Ensure consistency, handle edge cases, verify responsive behavior.

**Independent Test**: All components follow business style guidelines, responsive behavior maintained, edge cases handled.

### Implementation

- [X] T052 Review all components for business style consistency (ensure 90%+ of panels follow rounded-lg/xl, shadow-sm/md, border-slate-200 pattern)
- [X] T053 Verify no hardcoded colors were introduced (audit for hex colors, ensure all use Tailwind semantic variables)
- [X] T054 Test responsive behavior on mobile devices (verify panels adapt correctly, sizes remain moderate)
- [X] T055 Test responsive behavior on tablet devices (verify panels adapt correctly, sizes remain moderate)
- [X] T056 Test responsive behavior on desktop devices (verify panels have moderate sizes, not too large)
- [X] T057 Verify accessibility standards maintained (check contrast ratios for borders and text, ensure WCAG AA compliance)
- [X] T058 Handle edge case: logo file unavailability (ensure fallback icon displays gracefully without breaking UI)

---

## Task Summary

**Total**: 58 tasks  
**By Phase**:
- Setup: 3 tasks
- Foundational: 2 tasks  
- US-001: 18 tasks
- US-002: 8 tasks
- US-003: 12 tasks
- US-004: 8 tasks
- Polish: 7 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, Task ID, Story label (where applicable), and file path.

**Next Steps**:
1. Review task list for completeness
2. Run `/speckit.implement` to begin implementation
3. Or run `/speckit.analyze` to check consistency across artifacts

