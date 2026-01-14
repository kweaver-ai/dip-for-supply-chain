# Task List: 供应链大脑配置后台优化

**Feature**: Supply Chain Configuration Backend Optimization  
**Branch**: `supply-chain-config`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

**Total Tasks**: 74  
**Tasks by User Story**:
- Setup: 4 tasks
- Foundational: 3 tasks
- US-001 (管理配置按钮访问): 3 tasks
- US-002 (全局对象视图): 8 tasks
- US-003 (实体管理CRUD): 12 tasks
- US-004 (实体配置面板): 15 tasks
- US-005 (AI助手): 6 tasks
- US-006 (用户管理): 8 tasks
- Polish: 15 tasks

**Parallel Opportunities**: Many tasks can be executed in parallel within each phase (marked with [P])

**MVP Scope**: US-001 + US-002 + US-003 (basic navigation, global object view, entity CRUD)

## Dependencies

**Story Completion Order**:
1. Setup → Foundational (must complete first - types and data needed by all stories)
2. US-001 (can be parallel with Setup/Foundational after basic types added)
3. US-002 (depends on Foundational - needs data structures)
4. US-003 (depends on US-002 - needs global object view to select entities)
5. US-004 (depends on US-003 - needs entities to configure)
6. US-005 (depends on US-004 - needs entity configuration structure)
7. US-006 (can be parallel with US-002/US-003 after Foundational)
8. Polish (depends on all user stories)

**Parallel Execution Examples**:
- **Setup**: T001-T004 can be done in parallel (different type definitions)
- **US-002**: T008-T015 can be done in parallel (different components)
- **US-003**: T016-T027 can be done in parallel (different entity types)
- **US-004**: T028-T042 can be done in parallel (different tabs/features)
- **US-006**: T049-T056 can be done in parallel (user list and role management)

## Implementation Strategy

**MVP First**: Start with Setup → Foundational → US-001 → US-002 → US-003 to deliver basic configuration backend functionality.

**Incremental Delivery**:
1. **Sprint 1**: Setup + Foundational + US-001 (basic navigation and button)
2. **Sprint 2**: US-002 + US-003 (global object view and entity CRUD)
3. **Sprint 3**: US-004 + US-005 (entity configuration and AI assistant)
4. **Sprint 4**: US-006 + Polish (user management and refinements)

---

## Phase 1: Setup

**Goal**: Add types to ontology.ts and prepare data structures.

**Independent Test**: All new types defined in ontology.ts, mockData.ts updated with initial data.

### Implementation

- [X] T001 Add EntityType union type to src/types/ontology.ts (supplier, material, factory, product, warehouse, order, logistics, customer)
- [X] T002 Add EntityConfig interface to src/types/ontology.ts (entityId, entityType, attributes, relations, logicRules, actions, permissions)
- [X] T003 Add EntityRelation, BusinessLogicRule, EntityAction, PermissionConfig interfaces to src/types/ontology.ts
- [X] T004 Add User and Role interfaces to src/types/ontology.ts (if not already present)

---

## Phase 2: Foundational

**Goal**: Create service layer and populate mock data with configuration backend data.

**Independent Test**: Service functions exist and can read/write mockData, mockData contains entity configurations.

### Implementation

- [X] T005 Create src/utils/entityConfigService.ts with getEntitiesByType, getEntityById, createEntity, updateEntity, deleteEntity functions
- [X] T006 Add entityConfigs Map to src/data/mockData.ts with initial entity configurations matching frontend data by ID
- [X] T007 Implement bidirectional synchronization logic in entityConfigService.ts (sync config changes to frontend data, sync frontend changes to config)

---

## Phase 3: User Story 1 - 管理配置按钮访问

**Goal**: Add "管理配置" button to header with selected state, navigate to configuration backend.

**Independent Test**: Button appears in header, clicking navigates to config view, button shows selected state when currentView === 'config'.

### Implementation

- [X] T008 [US1] Add "管理配置" button to src/SupplyChainApp.tsx header (right side) with Settings icon
- [X] T009 [US1] Add 'config' to ViewType union type in src/SupplyChainApp.tsx
- [X] T010 [US1] Implement selected state styling for management config button in src/SupplyChainApp.tsx (bg-indigo-50 text-indigo-600 border-indigo-200 when currentView === 'config')

---

## Phase 4: User Story 2 - 全局对象视图

**Goal**: Create global object view showing both entity types and all instances in tree/list format.

**Independent Test**: Global object view displays all 8 entity types with their instances, can navigate to entity details.

### Implementation

- [X] T011 [US2] Create src/components/config-backend/GlobalObjectView.tsx component (renamed from KnowledgeGraphView)
- [X] T012 [US2] Implement tree/list layout in GlobalObjectView.tsx showing entity types as parent nodes
- [X] T013 [US2] Display all instances under each entity type in GlobalObjectView.tsx (e.g., "供应商" type with instances "供应商A", "供应商B")
- [ ] T014 [US2] Add click handler in GlobalObjectView.tsx to select entity instance and open right panel
- [X] T015 [US2] Update ConfigBackendLayout.tsx sidebar menu to rename "知识图谱" to "全局对象视图"
- [X] T016 [US2] Update ConfigBackendLayout.tsx to render GlobalObjectView when "全局对象视图" is selected
- [X] T017 [US2] Implement data loading in GlobalObjectView.tsx to fetch all entities from mockData.ts
- [X] T018 [US2] Add empty state handling in GlobalObjectView.tsx when no entities exist

---

## Phase 5: User Story 3 - 实体管理CRUD

**Goal**: Provide CRUD operations for each entity type with expand/collapse menu, default to first object type.

**Independent Test**: Can create, read, update, delete entities for each type, menu expands/collapses correctly, first type selected by default.

### Implementation

- [X] T019 [US3] Update ConfigBackendLayout.tsx sidebar menu to rename "实体列表" to "供应链对象"
- [X] T020 [US3] Add expand/collapse state management in ConfigBackendLayout.tsx for "供应链对象" menu (use useState for isExpanded)
- [X] T021 [US3] Add +/- icons (ChevronDown/ChevronRight or Plus/Minus) to "供应链对象" menu item in ConfigBackendLayout.tsx
- [X] T022 [US3] Set default expanded state (isExpanded = true) and default selected entity type (supplier) in ConfigBackendLayout.tsx
- [X] T023 [US3] Update EntityListView.tsx to display entity list for selected entity type with search, filter, export functionality
- [X] T024 [US3] Implement create entity functionality in EntityListView.tsx (open NewObjectModal, create entity via entityConfigService)
- [X] T025 [US3] Implement update entity functionality in EntityListView.tsx (select entity, edit in right panel, save changes)
- [X] T026 [US3] Implement delete entity functionality in EntityListView.tsx (confirm dialog, delete via entityConfigService, sync to frontend)
- [X] T027 [US3] Add bidirectional sync in EntityListView.tsx when entities are created/updated/deleted (update frontend mockData)
- [X] T028 [US3] Populate EntityListView.tsx with mock data records matching frontend data by ID (one-to-one correspondence)
- [X] T029 [US3] Add empty state handling in EntityListView.tsx when no entities exist for selected type
- [X] T030 [US3] Ensure EntityListView.tsx displays correctly when "供应链对象" menu is expanded and entity type is selected

---

## Phase 6: User Story 4 - 实体配置面板

**Goal**: Provide right panel with 5 tabs (属性、关系、逻辑、行动、权限) for configuring selected entity.

**Independent Test**: Right panel displays entity details, all 5 tabs work correctly, can save changes.

### Implementation

- [X] T031 [US4] Update RightPanel.tsx to display selected entity details with 5 tabs (Attributes, Relations, Logic, Actions, Permissions)
- [X] T032 [US4] Implement Attributes tab in RightPanel.tsx showing entity attributes (code, name, type, etc.) with editable fields
- [X] T033 [US4] Implement Relations tab in RightPanel.tsx showing entity relations (target type, relation type, count, sample items)
- [X] T034 [US4] Add "添加关系" button in Relations tab of RightPanel.tsx with empty state handling
- [X] T035 [US4] Implement Logic tab in RightPanel.tsx showing business logic rules (validation, calculation, trigger) with rule details
- [X] T036 [US4] Add "添加规则" button in Logic tab of RightPanel.tsx for adding new business logic rules
- [X] T037 [US4] Implement Actions tab in RightPanel.tsx showing entity actions (name, icon, color, description)
- [X] T038 [US4] Add "添加行动" button in Actions tab of RightPanel.tsx for adding new actions
- [X] T039 [US4] Implement Permissions tab in RightPanel.tsx showing permission configuration (roles, users) based on user management logic
- [X] T040 [US4] Add role-based permission matching in Permissions tab of RightPanel.tsx (match permissions based on user roles)
- [X] T041 [US4] Implement "保存更改" button in RightPanel.tsx to save entity configuration changes (attributes, relations, logic, permissions)
- [X] T042 [US4] Add bidirectional sync in RightPanel.tsx when entity configuration is saved (sync to frontend mockData)
- [X] T043 [US4] Define entity attributes based on supply chain business domain knowledge in RightPanel.tsx (e.g., supplier: contact, phone, email; product: series, lifecycle, price)
- [X] T044 [US4] Define entity relations based on supply chain business domain knowledge in RightPanel.tsx (e.g., supplier → materials, product → BOM materials, order → products)
- [X] T045 [US4] Define entity logic rules based on supply chain business domain knowledge in RightPanel.tsx (e.g., stock validation, ROI calculation, lifecycle triggers)

---

## Phase 7: User Story 5 - AI助手

**Goal**: Provide AI assistant for generating business rules (validation, calculation, trigger) from natural language.

**Independent Test**: AI assistant can generate business rules from natural language input, rules can be applied to entity configuration.

### Implementation

- [X] T046 [US5] Create src/components/config-backend/ConfigAIAssistant.tsx component (or reuse CopilotSidebar with config-specific props)
- [X] T047 [US5] Implement pattern matching logic in ConfigAIAssistant.tsx for detecting rule types (validation, calculation, trigger) from natural language
- [X] T048 [US5] Add rule generation templates in ConfigAIAssistant.tsx (e.g., "库存预警" → validation rule, "ROI计算" → calculation rule)
- [X] T049 [US5] Implement "应用配置" button in ConfigAIAssistant.tsx to apply generated rule to selected entity
- [X] T050 [US5] Add rule preview in ConfigAIAssistant.tsx showing generated rule details before applying
- [X] T051 [US5] Integrate ConfigAIAssistant.tsx with RightPanel.tsx Logic tab (open AI assistant, apply generated rules)

---

## Phase 8: User Story 6 - 用户管理

**Goal**: Provide user management module with user list, role management, and permission configuration.

**Independent Test**: Can view user list, manage roles, configure permissions for users and roles.

### Implementation

- [X] T052 [US6] Update UserManagementView.tsx to display user list table with user info (name, email, avatar), role, department, permission scope, status
- [X] T053 [US6] Implement role management cards in UserManagementView.tsx showing 5 predefined roles (供应链管理员, 采购总监, 生产总监, 产品总监, 销售总监) with color coding
- [X] T054 [US6] Add permission scope display in UserManagementView.tsx for each role (e.g., 采购总监: 供应商、物料、采购订单)
- [X] T055 [US6] Implement user creation functionality in UserManagementView.tsx (create user, assign role, set permissions)
- [X] T056 [US6] Implement user update functionality in UserManagementView.tsx (edit user info, change role, update permissions)
- [X] T057 [US6] Implement user deletion functionality in UserManagementView.tsx (delete user with confirmation)
- [X] T058 [US6] Add role-based permission matching in UserManagementView.tsx (users with specific roles can access/modify corresponding entity types)
- [X] T059 [US6] Populate UserManagementView.tsx with mock user and role data from mockData.ts

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Ensure consistency, handle edge cases, verify styling, implement bidirectional sync.

**Independent Test**: All components follow business style guidelines, no pure black borders, bidirectional sync works correctly, edge cases handled.

### Implementation

- [X] T060 Audit all configuration backend components for pure black borders (#000000, rgb(0,0,0), border-black) and replace with soft colors (border-slate-200, border-slate-300)
- [X] T061 Replace pure black borders in ConfigBackendLayout.tsx with border-slate-200 or border-slate-300
- [X] T062 Replace pure black borders in GlobalObjectView.tsx with border-slate-200 or border-slate-300
- [X] T063 Replace pure black borders in EntityListView.tsx with border-slate-200 or border-slate-300
- [X] T064 Replace pure black borders in RightPanel.tsx with border-slate-200 or border-slate-300
- [X] T065 Replace pure black borders in NewObjectModal.tsx with border-slate-200 or border-slate-300
- [X] T066 Replace pure black borders in ConfigAIAssistant.tsx with border-slate-200 or border-slate-300
- [X] T067 Replace pure black borders in UserManagementView.tsx with border-slate-200 or border-slate-300
- [X] T068 Ensure all configuration backend components use consistent business style (rounded-lg/xl, shadow-sm/md, border-slate-200)
- [X] T069 Verify bidirectional synchronization works correctly (config changes sync to frontend, frontend changes sync to config)
- [X] T070 Handle edge case: entity deletion with existing relations (show warning, prevent deletion or cascade delete)
- [X] T071 Handle edge case: empty entity list (show empty state with "新建" button)
- [X] T072 Handle edge case: AI assistant cannot understand request (show guidance message with suggestions)
- [X] T073 Verify all mock data records match frontend data records by ID (one-to-one correspondence)
- [X] T074 Verify component sizes do not exceed 150 lines (split into sub-components if needed)

---

## Task Summary

**Total**: 74 tasks  
**By Phase**:
- Setup: 4 tasks
- Foundational: 3 tasks
- US-001: 3 tasks
- US-002: 8 tasks
- US-003: 12 tasks
- US-004: 15 tasks
- US-005: 6 tasks
- US-006: 8 tasks
- Polish: 15 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, Task ID, Story label (where applicable), and file path.

**Next Steps**:
1. Review task list for completeness
2. Run `/speckit.implement` to begin implementation
3. Or run `/speckit.analyze` to check consistency across artifacts
