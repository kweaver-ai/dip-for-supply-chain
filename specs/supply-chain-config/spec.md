# Feature Specification: 供应链大脑配置后台

**Feature Branch**: `supply-chain-config`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "在页眉右侧增加管理配置按钮，点击后进入供应链大脑配置后台，后台需求包括供应链本体建模和用户管理，具体内容参考原型设计进行需求提取"

## Overview

在供应链大脑应用页眉右侧添加管理配置按钮，点击后进入配置后台。配置后台提供两个核心功能模块：
1. **供应链本体建模**：管理供应链业务对象（实体）的定义、关系、逻辑规则和权限
   - 全局对象视图：以树形或列表形式显示8种实体类型（供应商、物料、工厂、产品、仓库、订单、物流、客户）及其下的所有实例对象
   - 实体列表视图：为每种实体类型提供CRUD操作（创建、读取、更新、删除）
   - 右侧属性面板：选中实体后显示详细信息，包含5个标签页（属性、关系、逻辑、行动、权限）
   - AI助手：通过自然语言生成业务规则（验证规则、计算公式、触发条件）
   - 新建对象模态框：创建新实体的表单界面
2. **用户管理**：管理用户账号、角色和权限配置
   - 用户列表：显示用户信息、角色、部门、权限范围、状态
   - 角色管理：5种预定义角色（供应链管理员、采购总监、生产总监、产品总监、销售总监）
   - 权限配置：为角色和用户配置访问权限

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a "管理配置" button to the page header (right side) in `src/SupplyChainApp.tsx` with Settings icon
- **FR-001a**: System MUST display selected state for management config button when currentView === 'config' using independent selected style (bg-indigo-50 text-indigo-600 border-indigo-200) to distinguish from other navigation buttons
- **FR-002**: System MUST navigate to configuration backend via route switching (e.g., `/config`) when management config button is clicked, displaying configuration backend as separate page
- **FR-003**: System MUST provide Supply Chain Ontology Modeling module with "全局对象视图" (Global Object View) showing both entity types and all instances under each type in tree or list format (e.g., "供应商" type with instances "供应商A", "供应商B", etc.) for all 8 entity types (supplier, material, factory, product, warehouse, order, logistics, customer)
- **FR-004**: System MUST provide sidebar navigation in configuration backend with menu items for "全局对象视图", "供应链对象" (with expand/collapse button using +/- icons, default expanded with first object type selected), "用户管理", etc.
- **FR-004a**: System MUST rename "实体列表" to "供应链对象" in sidebar menu
- **FR-004b**: System MUST provide expand/collapse button (+/- icons) for "供应链对象" menu item to show/hide 8 sub-object types
- **FR-004c**: System MUST default to first object type page when "供应链对象" is expanded (e.g., supplier as default)
- **FR-005**: System MUST provide entity list view for each entity type with search, filter, export, and create operations, accessible via sidebar menu items, reading from and updating `src/data/mockData.ts`
- **FR-005a**: System MUST synchronize data bidirectionally between configuration backend and frontend - configuration backend modifications sync to frontend data, frontend modifications sync to configuration backend, matching by ID (supplierId, productId, orderId, etc.)
- **FR-005b**: System MUST populate each configuration backend page with mock data records matching frontend data records by ID, ensuring one-to-one correspondence
- **FR-005c**: System MUST define entity attributes, relations, logic, and actions based on supply chain business domain knowledge (e.g., supplier has relations to materials, products have BOM relations, orders have delivery logic)
- **FR-005d**: System MUST match permissions based on user management logic (role-based access control - users with specific roles can access/modify corresponding entity types)
- **FR-006**: System MUST provide right panel (属性栏) for selected entity with 5 tabs: Attributes (属性), Relations (关系), Logic (逻辑), Actions (行动), Permissions (权限)
- **FR-007**: System MUST provide AI assistant sidebar for generating business rules (validation rules, calculation formulas, trigger conditions) with natural language input
- **FR-008**: System MUST provide new object modal for creating entities with entity-specific form fields (e.g., product: code, name, series, lifecycle, price, cost, warranty, weight)
- **FR-009**: System MUST provide User Management module with user list table showing user info (name, email, avatar), role, department, permission scope, and status
- **FR-010**: System MUST provide role management with 5 predefined roles (供应链管理员, 采购总监, 生产总监, 产品总监, 销售总监) with color coding and permission scopes
- **FR-011**: System MUST provide permission configuration for roles and individual users with role-based and user-specific access control
- **FR-012**: System MUST display entity relations in Relations tab showing target entity type, relation type (多对多, 多对一, 一对多), count, and sample items
- **FR-013**: System MUST display business logic rules in Logic tab with rule type (validation, calculation, trigger), name, condition/formula, and action
- **FR-014**: System MUST display entity actions in Actions tab with action name, icon, color, and description
- **FR-015**: System MUST allow saving changes to entity configuration (attributes, relations, logic, permissions) via "保存更改" button
- **FR-016**: System MUST audit and replace all pure black borders/lines in configuration backend components with soft colors (border-slate-200, border-slate-300) to ensure consistent business style
- **FR-017**: System MUST ensure consistent styling across all configuration backend components (rounded corners, shadows, border colors) following business style guidelines

### User Stories

- **US-001**: As an admin user, I want to click the "管理配置" button in the header to access the configuration backend, so I can manage supply chain ontology and users.
- **US-002**: As an admin user, I want to view the global object view showing all object instances and their relationships, so I can understand the supply chain structure.
- **US-003**: As an admin user, I want to manage entities (create, edit, delete) for each entity type, so I can maintain the supply chain ontology.
- **US-004**: As an admin user, I want to configure entity attributes, relations, logic rules, actions, and permissions in the right panel, so I can customize business rules.
- **US-005**: As an admin user, I want to use AI assistant to generate business rules (validation, calculation, trigger), so I can quickly configure entity logic.
- **US-006**: As an admin user, I want to manage users and their roles/permissions, so I can control access to supply chain data.

## Key Entities

- **Entity Types**: supplier (供应商), material (物料), factory (工厂), product (产品), warehouse (仓库), order (订单), logistics (物流), customer (客户)
- **Entity Object**: Represents a single instance of an entity type with attributes (code, name, type, etc.), relations, logic rules, actions, and permissions
- **Business Logic Rule**: 
  - Validation rule: condition-based validation (e.g., "stock < 100") with level (warning, critical)
  - Calculation formula: formula-based calculation (e.g., "(price - cost) / cost * 100") with unit
  - Trigger condition: condition-action trigger (e.g., "lifecycle == '衰退期'" → "建议下线")
- **Entity Relation**: Relationship between entities showing target type, relation type (多对多, 多对一, 一对多), count, and sample items
- **Entity Action**: Predefined action for entities (e.g., 生命周期管理, BOM变更, 定价调整) with icon, color, and description
- **User**: System user with id, name, role, email, phone, avatar, department, and status
- **Role**: Predefined role with name, color, permission scope, and description (供应链管理员, 采购总监, 生产总监, 产品总监, 销售总监)
- **Permission**: Access control configuration for roles and individual users

## Success Criteria

- Management config button appears in page header (right side)
- Clicking button navigates to configuration backend
- Knowledge graph view displays all 8 entity types with counts
- Entity list view allows CRUD operations for each entity type
- Right panel displays entity details with 5 tabs (attributes, relations, logic, actions, permissions)
- AI assistant can generate business rules for entities
- User management displays user list with roles and permissions
- Role management shows 5 predefined roles with permission scopes

## Edge Cases

- What if user doesn't have admin permissions? (Should show button but restrict access)
- What if entity has no relations? (Show empty state with "添加关系" button)
- What if AI assistant cannot understand user request? (Show guidance message with suggestions)
- What if entity list is empty? (Show empty state with "新建" button)
- What if user tries to delete entity with existing relations? (Show warning and prevent deletion or cascade delete)

## Assumptions

- Configuration backend is accessible only to admin users (供应链管理员 role)
- Entity data structure follows existing ontology types from `src/types/ontology.ts`
- Business logic rules are evaluated at runtime based on entity data
- Permission changes take effect immediately after saving
- AI assistant uses pattern matching for rule generation (can be enhanced with LLM in future)

## Clarifications

### Session 2024-12-19

- Q: How should the configuration backend be navigated to? → A: Route switching - clicking button navigates to new route (e.g., `/config`), configuration backend displayed as separate page
- Q: What navigation structure should the configuration backend use internally? → A: Sidebar navigation - left sidebar menu with options for "知识图谱", "实体列表", "用户管理", etc.
- Q: How should entity types be selected in the entity list view? → A: Sidebar menu items - each entity type (supplier, material, factory, etc.) as separate menu item in left sidebar, clicking shows entity list for that type
- Q: What is the data source for entities in the configuration backend? → A: Use existing mockData - configuration backend reads and modifies data from `src/data/mockData.ts`, CRUD operations update in-memory data
- Q: What is the scope of the AI assistant sidebar in the configuration backend? → A: Independent configuration assistant - dedicated AI assistant for generating business rules (validation rules, calculation formulas, trigger conditions), separate from main app's page-specific AI assistants
- Q: What should the expand/collapse button control for "供应链对象" menu? → A: Sidebar menu expand/collapse - clicking "供应链对象" main menu item expands/collapses to show 8 sub-object types (supplier, material, factory, etc.) with +/- icons
- Q: How should configuration backend data records match and link with frontend data records? → A: Two-way synchronization - configuration backend modifications sync to frontend data, frontend modifications also sync to configuration backend, matching by ID (supplierId, productId, etc.)
- Q: What should "全局对象视图" (Global Object View) display? → A: Type and instance hybrid view - displays both entity types (e.g., "供应商") and all instances under each type (e.g., "供应商A", "供应商B"), shown in tree or list format
- Q: How should the management config button display selected state when in config view? → A: Independent selected style - management config button uses independent selected style (e.g., bg-indigo-50 text-indigo-600 border-indigo-200) to distinguish from other navigation buttons, displayed when currentView === 'config'

