# Implementation Plan: 供应链大脑配置后台

**Branch**: `supply-chain-config` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/supply-chain-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

在供应链大脑应用页眉右侧添加"管理配置"按钮（选中时显示独立选中样式），点击后进入配置后台。配置后台提供两个核心功能模块：1) **供应链本体建模**：全局对象视图以树形/列表形式显示8种实体类型及其所有实例对象，供应链对象菜单（带+/-展开/收缩按钮，默认展开并选择第一个对象类型）提供CRUD操作，右侧属性面板显示实体详细信息（属性、关系、逻辑、行动、权限），AI助手生成业务规则，新建对象模态框创建实体；2) **用户管理**：用户列表显示用户信息、角色、部门、权限范围、状态，角色管理提供5种预定义角色，权限配置支持角色和用户级别的访问控制。配置后台与前台数据双向同步（基于ID匹配），所有页面包含模拟数据记录与前台记录一一对应，实体属性/关系/逻辑/行动基于供应链业务常识定义，权限基于用户管理逻辑匹配。配置后台使用侧边栏导航，实体数据读取和修改 `src/data/mockData.ts`，AI助手为独立的配置助手专门用于生成业务规则。所有组件需统一商务风格（无纯黑色线条，使用border-slate-200/300）。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: In-memory mock data (`src/data/mockData.ts`), existing entity data structures  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Route switching < 100ms, entity list rendering < 500ms, AI assistant response < 1 second  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), integrate with existing navigation system (state-based view switching), reuse existing mockData structure  
**Scale/Scope**: 1 new route (`/config`), 2 main modules (ontology modeling, user management), 8 entity types, 5 predefined roles, CRUD operations for all entities, AI assistant for business rule generation, bidirectional data synchronization with frontend, expand/collapse menu functionality, global object view with type-instance hybrid display, consistent business styling across all components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - New types MUST be defined in or extend from `src/types/ontology.ts`
  - No ad-hoc type definitions in component files
  - **Action Required**: Define new types for EntityConfig, BusinessLogicRule, EntityRelation, EntityAction, User, Role, Permission in `src/types/ontology.ts`
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Use existing semantic variables from index.css, define new semantic variables for role colors if needed
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - Large components identified and refactoring plan documented
  - **Action Required**: Monitor component sizes - GlobalObjectView, EntityListView, RightPanel, UserManagementView may exceed 150 lines, split into sub-components if needed
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - configuration backend modifies mockData directly (in-memory), no simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/supply-chain-config/
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
│   ├── config-backend/
│   │   ├── ConfigBackendLayout.tsx          # New: Main layout with sidebar navigation
│   │   ├── GlobalObjectView.tsx             # New: Global object view (renamed from KnowledgeGraphView) showing types and instances
│   │   ├── EntityListView.tsx               # New: Generic entity list with CRUD
│   │   ├── RightPanel.tsx                   # New: Entity detail panel with 5 tabs
│   │   ├── NewObjectModal.tsx               # New: Modal for creating entities
│   │   ├── ConfigAIAssistant.tsx            # New: AI assistant for business rules
│   │   └── UserManagementView.tsx           # New: User and role management
│   └── shared/
│       └── CopilotSidebar.tsx                # Reference: Reuse for config AI assistant (or create separate)
├── types/
│   └── ontology.ts                           # Updated: Add EntityConfig, BusinessLogicRule, EntityRelation, EntityAction, User, Role, Permission types
├── data/
│   └── mockData.ts                           # Updated: Add user and role data, entity configuration data
├── utils/
│   └── entityConfigService.ts                 # New: Service for CRUD operations on entities
└── SupplyChainApp.tsx                        # Updated: Add "管理配置" button, add config view state
```

**Structure Decision**: Single-page React application structure with state-based view switching. New `config-backend` component directory contains all configuration backend components. Configuration backend uses same navigation pattern as main app (state-based). Entity data read/write operations handled by `entityConfigService.ts`. AI assistant can reuse `CopilotSidebar` component or create separate `ConfigAIAssistant` component. User and role data added to `mockData.ts`. New types added to `ontology.ts` for configuration entities.

## Phase 0: Research & Analysis ✅

**Status**: Complete

See [research.md](./research.md) for detailed findings.

**Key Research Questions**:
- RQ-001: How to implement route switching without React Router? → **Decision**: State-based view switching
- RQ-002: How to structure entity CRUD operations? → **Decision**: Service layer pattern (`entityConfigService.ts`)
- RQ-003: How to visualize knowledge graph? → **Decision**: Tree/list-based global object view showing both entity types and instances
- RQ-008: How to implement expand/collapse for "供应链对象" menu? → **Decision**: Use +/- icons with state management for expanded/collapsed state
- RQ-009: How to synchronize data between configuration backend and frontend? → **Decision**: Bidirectional synchronization matching by ID (supplierId, productId, etc.)
- RQ-010: How to ensure consistent styling across configuration backend? → **Decision**: Audit and replace all pure black borders with soft colors (border-slate-200, border-slate-300)
- RQ-004: How to implement AI assistant for business rule generation? → **Decision**: Pattern matching + template generation
- RQ-005: How to manage entity relations and business logic rules? → **Decision**: Nested data structures in mockData.ts
- RQ-006: How to handle entity type selection in sidebar navigation? → **Decision**: Sidebar menu items (each entity type as separate menu item)
- RQ-007: How to implement right panel with 5 tabs? → **Decision**: Tab-based UI with conditional rendering

**Key Decisions**:
- Use state-based view switching (add `currentView === 'config'` condition in SupplyChainApp)
- Create `entityConfigService.ts` for centralized CRUD operations
- Use SVG-based knowledge graph visualization (simple node-link diagram)
- Implement pattern matching for AI assistant (can be enhanced with LLM later)
- Store entity relations and business logic rules in mockData.ts as nested structures
- Use sidebar menu items for entity type selection
- Use tab-based UI for right panel (5 tabs: attributes, relations, logic, actions, permissions)
- Rename "知识图谱" to "全局对象视图" and display both types and instances in tree/list format
- Rename "实体列表" to "供应链对象" with expand/collapse functionality (+/- icons)
- Default to first object type (supplier) when "供应链对象" is expanded
- Implement bidirectional data synchronization matching by ID
- Audit and replace all pure black borders with soft colors for consistent business styling
- Display selected state for management config button using independent style (bg-indigo-50 text-indigo-600 border-indigo-200)

## Phase 1: Design & Contracts ✅

**Status**: Complete

### Data Model

See [data-model.md](./data-model.md) for detailed entity definitions.

**Key Entities**:
- `EntityType`: Union type of 8 entity types (supplier, material, factory, product, warehouse, order, logistics, customer)
- `EntityConfig`: Configuration metadata for entities (attributes, relations, logic, actions, permissions)
- `BusinessLogicRule`: Validation rules, calculation formulas, trigger conditions
- `EntityRelation`: Relationship between entities (target type, relation type, count, sample items)
- `EntityAction`: Predefined actions for entities (name, icon, color, description)
- `PermissionConfig`: Permission configuration (roles, users)
- `User`: System user (id, name, role, email, phone, avatar, department, status)
- `Role`: Predefined role (name, color, permission scope, description)

**Data Storage**:
- Entity configurations: `Map<string, EntityConfig>` in `mockData.ts`
- User data: `User[]` in `mockData.ts`
- Role data: `Record<string, Role>` in `mockData.ts`

### API Contracts

See [contracts/api-contracts.md](./contracts/api-contracts.md) for detailed API specifications.

**Key Contracts**:
- Entity CRUD operations: `getEntitiesByType`, `getEntityById`, `createEntity`, `updateEntity`, `deleteEntity`
- Entity configuration operations: `getEntityConfig`, `updateEntityConfig`, `addBusinessLogicRule`, `removeBusinessLogicRule`
- User management operations: `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`
- Role management operations: `getRoles`, `getRoleById`
- Knowledge graph operations: `getKnowledgeGraphData`
- AI assistant operations: `generateBusinessRule`

### Quick Start

See [quickstart.md](./quickstart.md) for implementation guide.

**Implementation Steps**:
1. Add types to `ontology.ts`
2. Add data to `mockData.ts`
3. Create `entityConfigService.ts`
4. Create `ConfigBackendLayout.tsx`
5. Create `KnowledgeGraphView.tsx`
6. Create `EntityListView.tsx`
7. Add "管理配置" button to header

## Phase 2: Implementation Planning

**Status**: Pending (requires Phase 1 completion)

Implementation will be broken down into tasks in `tasks.md` (generated by `/speckit.tasks` command).

**Estimated Phases**:
1. Setup: Add types to ontology.ts, update mockData.ts, create service layer
2. UI Components: Create config backend layout, knowledge graph view, entity list view
3. Right Panel: Implement 5-tab panel (attributes, relations, logic, actions, permissions)
4. AI Assistant: Implement business rule generation assistant
5. User Management: Implement user list and role management
6. Integration: Add "管理配置" button to header, integrate config backend
7. Polish: Testing, edge cases, UI refinements

## Assumptions & Risks

**Assumptions**:
- Configuration backend accessible only to admin users (供应链管理员 role)
- Entity data structure follows existing ontology types from `src/types/ontology.ts`
- Business logic rules evaluated at runtime based on entity data
- Permission changes take effect immediately after saving
- AI assistant uses pattern matching for rule generation (can be enhanced with LLM in future)

**Risks**:
- Knowledge graph visualization complexity (mitigation: start with simple SVG-based diagram)
- Entity relation management complexity (mitigation: use simple data structures, add validation)
- AI assistant rule generation accuracy (mitigation: use pattern matching, provide templates)
- Component size exceeding 150 lines (mitigation: split into sub-components proactively)

## Next Steps

1. ✅ Complete Phase 0 research (research.md generated)
2. ✅ Complete Phase 1 design (data-model.md, contracts/, quickstart.md generated)
3. Run `/speckit.tasks` to generate task breakdown
4. Begin implementation following tasks.md

## Summary

**Plan Status**: Phase 0 and Phase 1 complete. Updated with latest clarifications. Ready for task breakdown.

**Generated Artifacts**:
- ✅ `research.md` - Research findings and key decisions (updated with RQ-008, RQ-009, RQ-010)
- ✅ `data-model.md` - Entity definitions and data structures
- ✅ `contracts/api-contracts.md` - Service layer API contracts
- ✅ `quickstart.md` - Implementation guide with step-by-step instructions
- ✅ `plan.md` - This implementation plan (updated with latest clarifications)

**Key Updates from Clarifications**:
- Renamed "知识图谱" to "全局对象视图" (Global Object View) with type-instance hybrid display
- Renamed "实体列表" to "供应链对象" with expand/collapse functionality (+/- icons)
- Added bidirectional data synchronization requirement (matching by ID)
- Added business style consistency requirement (replace pure black borders with soft colors)
- Added management config button selected state requirement (independent style)
- Added default selection of first object type when "供应链对象" is expanded

**Branch**: `supply-chain-config`  
**Plan Path**: `specs/supply-chain-config/plan.md`

