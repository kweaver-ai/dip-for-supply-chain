# Feature Specification: 供应链管理视图页面组件拆分重构

**Feature Branch**: `001-refactor-view-components`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "根据原则3将供应链管理视图页面按照一个一个业务视图拆解。"

## Overview

当前 `SupplyChainApp.tsx` 文件包含959行代码，远超原则3规定的150行组件大小限制。本次重构将按照业务视图将大型组件拆分为独立的、可维护的组件文件，提高代码可读性、可测试性和可维护性。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 提取共享组件 (Priority: P1)

开发者需要将共享组件（Badge、CopilotSidebar）提取到独立文件，以便在多个业务视图中复用。

**Why this priority**: 共享组件是其他业务视图组件的基础依赖，必须先提取才能进行后续拆分。

**Independent Test**: 验证 Badge 和 CopilotSidebar 组件提取后，原有功能保持不变，所有使用这些组件的页面仍能正常工作。

**Acceptance Scenarios**:

1. **Given** 开发者访问应用, **When** 查看任意页面, **Then** Badge 组件显示正常，样式和功能与重构前一致
2. **Given** 用户打开 AI 助手侧边栏, **When** 与助手交互, **Then** CopilotSidebar 组件功能正常，消息发送和接收正常
3. **Given** 开发者查看代码, **When** 检查组件文件, **Then** Badge 和 CopilotSidebar 位于独立的组件文件中，符合原则3的组件大小限制

---

### User Story 2 - 提取业务视图组件 (Priority: P1)

开发者需要将各个业务视图（驾驶舱、搜索、库存、交付）提取为独立组件文件。

**Why this priority**: 业务视图组件是核心功能，拆分后可以独立开发、测试和维护，符合原则3要求。

**Independent Test**: 验证每个业务视图组件提取后，页面功能完整，导航和交互正常，组件大小符合原则3限制。

**Acceptance Scenarios**:

1. **Given** 用户访问驾驶舱页面, **When** 查看供应链驾驶舱, **Then** 所有 KPI 指标、图表和导航功能正常显示
2. **Given** 用户访问搜索页面, **When** 执行搜索操作, **Then** 搜索结果正确显示，筛选和视图切换功能正常
3. **Given** 用户访问库存页面, **When** 查看库存优化信息, **Then** 库存风险卡片、图表和 AI 建议正常显示
4. **Given** 用户访问交付页面, **When** 查看交付保障信息, **Then** 订单列表、统计指标和趋势图表正常显示
5. **Given** 开发者在各业务视图间切换, **When** 导航到不同页面, **Then** 页面切换流畅，无功能丢失

---

### User Story 3 - 简化主应用组件 (Priority: P2)

开发者需要简化 SupplyChainApp 主组件，使其仅负责路由和导航逻辑，符合原则3的组件大小限制。

**Why this priority**: 主应用组件简化后，代码结构更清晰，维护成本降低，符合架构最佳实践。

**Independent Test**: 验证主应用组件简化后，导航功能正常，所有业务视图正确加载，组件大小符合原则3限制。

**Acceptance Scenarios**:

1. **Given** 用户访问应用, **When** 应用加载完成, **Then** 导航栏正常显示，默认视图正确加载
2. **Given** 用户点击导航项, **When** 切换到不同业务视图, **Then** 对应视图组件正确加载，URL 或状态正确更新
3. **Given** 开发者查看代码, **When** 检查 SupplyChainApp.tsx, **Then** 文件行数小于150行，仅包含导航和路由逻辑

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST extract Badge component to `src/components/shared/Badge.tsx` with all existing functionality preserved
- **FR-002**: System MUST extract CopilotSidebar component to `src/components/shared/CopilotSidebar.tsx` with all existing props and behavior preserved
- **FR-003**: System MUST extract EnhancedCockpitView component to `src/components/views/CockpitView.tsx` with all KPI metrics, charts, and navigation functionality preserved
- **FR-004**: System MUST extract EnhancedSearchView component to `src/components/views/SearchView.tsx` with all search, filter, and display modes preserved
- **FR-005**: System MUST extract EnhancedInventoryView component to `src/components/views/InventoryView.tsx` with all inventory risk cards, charts, and AI suggestions preserved
- **FR-006**: System MUST extract EnhancedDeliveryView component to `src/components/views/DeliveryView.tsx` with all order tracking, statistics, and trend charts preserved
- **FR-007**: System MUST refactor SupplyChainApp.tsx to only contain navigation logic, view routing, and component orchestration
- **FR-008**: System MUST ensure all extracted components are properly imported and exported
- **FR-009**: System MUST ensure all component props and callbacks are correctly passed between components
- **FR-010**: System MUST ensure all extracted components comply with Principle 3 (component size < 150 lines)
- **FR-011**: System MUST ensure all extracted components comply with Principle 2 (use semantic Tailwind variables, no hardcoded colors)
- **FR-012**: System MUST ensure all extracted components comply with Principle 1 (types reference ontology.ts)

### Key Entities *(include if feature involves data)*

- **Component Props**: Interface definitions for component props (should reference ontology.ts types where applicable)
- **View State**: State management for each business view component
- **Navigation State**: Current view state in main SupplyChainApp component

**Note**: All entity types MUST be defined in `src/types/ontology.ts` per Principle 1, or use existing types from ontology.ts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All extracted components have file size less than 150 lines (Principle 3 compliance)
- **SC-002**: SupplyChainApp.tsx file size reduced to less than 150 lines
- **SC-003**: All business views function identically before and after refactoring (100% functional parity)
- **SC-004**: No visual regressions - all UI elements render identically before and after refactoring
- **SC-005**: All component imports and exports resolve correctly (zero TypeScript compilation errors)
- **SC-006**: All shared components (Badge, CopilotSidebar) are reusable across multiple views

## Edge Cases

- What happens when a component prop is missing or undefined?
- How does the system handle navigation state when switching between views?
- What happens if a shared component (Badge, CopilotSidebar) is used in a new context?
- How does the system handle component import path changes during refactoring?

## Assumptions

- All existing functionality should be preserved exactly as-is (no feature changes)
- Component file structure follows existing patterns in the codebase
- TypeScript types from ontology.ts are sufficient for component props
- Tailwind CSS semantic variables are already defined in index.css
- No new dependencies are required for this refactoring





