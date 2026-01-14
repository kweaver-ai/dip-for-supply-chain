# Tasks: 产品供应优化页面

**Feature Branch**: `product-supply-optimization`  
**Generated**: 2025-01-29  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Summary

This document contains all implementation tasks for the Product Supply Optimization page feature, organized by user story priority. Tasks are ordered by dependencies and can be executed in parallel where marked with [P].

**Total Tasks**: 25  
**User Story 1 (P1)**: 12 tasks  
**User Story 2 (P1)**: 6 tasks  
**User Story 3 (P2)**: 4 tasks  
**Polish & Cross-Cutting**: 3 tasks

## Dependencies

**Story Completion Order**:
- User Story 1 (P1) → User Story 2 (P1) → User Story 3 (P2)
- User Story 1 must complete before User Story 2 (depends on ProductSupplyAnalysisPanel)
- User Story 2 can start after User Story 1 core tasks complete
- User Story 3 can start in parallel with User Story 2 (independent AI assistant integration)

**Parallel Execution Opportunities**:
- Within User Story 1: Service functions (T003-T005) can be developed in parallel
- Within User Story 1: UI sections (T006-T011) can be developed in parallel after data layer complete
- User Story 3 can be developed in parallel with User Story 2

## Implementation Strategy

**MVP Scope**: User Story 1 (Product Supply Analysis Panel with enhancements)
- Core metrics display (existing)
- Product basic information section (new)
- Product inventory information section (new)
- Product suggested actions section (new)

**Incremental Delivery**:
1. Phase 1: Enhance ProductSupplyAnalysisPanel with new sections (User Story 1)
2. Phase 2: Add demand forecast and optimization suggestions (User Story 2)
3. Phase 3: Integrate AI assistant (User Story 3)

---

## Phase 1: Setup

*No setup tasks required - using existing project structure and dependencies*

---

## Phase 2: Foundational Tasks

*No blocking foundational tasks - types and services already exist*

---

## Phase 3: User Story 1 - 查看产品供应分析 (Priority: P1)

**Goal**: 用户需要查看各产品的供应情况，包括供应商数量、交货周期、历史供货稳定性等指标，以及产品基本信息、库存信息和建议动作。

**Independent Test**: 访问产品供应优化页面，验证产品供应分析面板显示正确，包含：
- 供应商数量、交货周期、供货稳定性等核心指标（已存在）
- 产品名称在面板内容中显示（FR-001.1）
- 产品基本信息：产品名称、生命周期、ROI（FR-001.2）
- 产品库存信息：库存数量、待交付订单量（FR-001.3）
- 产品建议动作：基于条件的促销和市场销售提醒按钮（FR-001.4, FR-001.5）

**Acceptance Criteria**:
1. 面板标题保持"产品供应分析"，产品名称显示在面板内容中
2. 产品基本信息部分正确显示产品名称、生命周期阶段（从Product.status）、ROI（从ProductLifecycleAssessment.roi）
3. 产品库存信息部分正确显示库存数量（从Product.stockQuantity）和待交付订单量（状态为"生产中"或"运输中"的订单数量总和）
4. 产品建议动作部分根据条件显示：
   - 停止销售时间-当前时间 < 180天 且 库存 > 100：显示"促销"按钮
   - 停止服务时间-当前时间 < 1年 且 库存 > 100：显示"市场销售提醒"按钮
5. 动作按钮点击后执行动作并记录到ActionHistory

### Implementation Tasks

- [X] T001 [US1] Add function to calculate pending order quantity in `src/services/productSupplyService.ts`
- [X] T002 [US1] Add function to get ProductLifecycleAssessment data for a product in `src/services/productSupplyService.ts`
- [X] T003 [P] [US1] Add function to calculate suggested actions based on product lifecycle and inventory in `src/services/productSupplyService.ts`
- [X] T004 [US1] Update ProductSupplyAnalysisPanel props interface to include Product and ProductLifecycleAssessment data in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T005 [US1] Add product name display section in panel content (below title) in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T006 [P] [US1] Implement product basic information section (product name, lifecycle, ROI) in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T007 [P] [US1] Implement product inventory information section (inventory quantity, order quantity) in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T008 [P] [US1] Implement product suggested actions section with conditional logic in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T009 [US1] Implement action button click handlers that execute actions via entityConfigService in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T010 [US1] Update ProductSupplyOptimizationPage to pass Product and ProductLifecycleAssessment data to ProductSupplyAnalysisPanel in `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`
- [X] T011 [US1] Handle edge cases: missing ProductLifecycleAssessment (show "N/A" for ROI), no pending orders (show 0), missing dates (hide actions) in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`
- [X] T012 [US1] Verify ProductSupplyAnalysisPanel component size < 150 lines (split into sub-components if needed) in `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx` - **Completed**: Component split into 6 sub-components, main component now 149 lines

---

## Phase 4: User Story 2 - 查看需求预测和优化建议 (Priority: P1)

**Goal**: 用户需要查看基于历史数据的需求预测，以及库存优化建议（补货或清库存建议）。

**Independent Test**: 在产品供应优化页面，验证需求预测和优化建议功能正常显示。

**Acceptance Criteria**:
1. 需求预测面板显示基于历史数据的未来需求预测
2. 优化建议面板显示补货或清库存的建议

### Implementation Tasks

- [X] T013 [US2] Verify DemandForecastPanel displays demand forecast correctly in `src/components/product-supply-optimization/DemandForecastPanel.tsx`
- [X] T014 [US2] Verify OptimizationSuggestionsPanel displays optimization suggestions correctly in `src/components/product-supply-optimization/OptimizationSuggestionsPanel.tsx`
- [X] T015 [US2] Verify demandForecastService calculates forecasts using moving average algorithm in `src/services/demandForecastService.ts`
- [X] T016 [US2] Verify optimizationService generates suggestions with priority levels in `src/services/optimizationService.ts`
- [X] T017 [US2] Verify ProductSupplyOptimizationPage integrates DemandForecastPanel and OptimizationSuggestionsPanel correctly in `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`
- [X] T018 [US2] Handle edge cases: missing historical data (show low confidence), conflicting suggestions (show all with priority) in `src/components/product-supply-optimization/OptimizationSuggestionsPanel.tsx`

---

## Phase 5: User Story 3 - 使用产品供应优化AI助手 (Priority: P2)

**Goal**: 用户需要与产品供应优化页面的专属AI助手对话，查询供应情况和获取优化建议。

**Independent Test**: 打开产品供应优化页面AI助手，验证对话功能正常，能够回答供应查询和优化建议问题。

**Acceptance Criteria**:
1. AI助手显示产品供应优化专属助手界面
2. 助手能够回答供应查询和优化建议问题

### Implementation Tasks

- [X] T019 [US3] Configure CopilotSidebar with product supply optimization page-specific props in `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`
- [X] T020 [US3] Add page-specific query handler for supply queries in `src/services/productSupplyService.ts`
- [X] T021 [US3] Add page-specific query handler for optimization suggestion queries in `src/services/optimizationService.ts`
- [X] T022 [US3] Update copilotConfig to include product supply optimization page context in `src/utils/copilotConfig.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

### Implementation Tasks

- [X] T023 Verify all components use semantic color variables from Tailwind v4 (no hardcoded colors) in `src/components/product-supply-optimization/`
- [X] T024 Verify all types are defined in ontology.ts (no ad-hoc type definitions) in `src/components/product-supply-optimization/`
- [X] T025 Update SupplyChainApp navigation to include product supply optimization page after inventory page in `src/SupplyChainApp.tsx`

---

## Task Completion Checklist

After completing all tasks, verify:

- [ ] All functional requirements (FR-001 to FR-008) are implemented
- [ ] All acceptance scenarios from user stories are testable
- [ ] All edge cases are handled
- [ ] Component size limits are respected (< 150 lines)
- [ ] All types are defined in ontology.ts
- [ ] All styles use semantic variables
- [ ] Performance targets are met (SC-001, SC-002, SC-003)
- [ ] Navigation integration is complete
- [ ] AI assistant integration is complete

---

## Notes

- Product, ProductLifecycleAssessment, Order, ActionHistory types already exist in ontology.ts
- entityConfigService.executeAction function already exists for action execution
- ProductSupplyAnalysisPanel, DemandForecastPanel, OptimizationSuggestionsPanel, RiskAlertsPanel components already exist
- productSupplyService, demandForecastService, optimizationService already exist
- Main focus is on enhancing ProductSupplyAnalysisPanel with new sections (FR-001.1 to FR-001.5)
