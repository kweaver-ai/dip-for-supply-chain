# Feature Specification: 实体列表表格重构

**Feature Branch**: `005-entity-table-redesign`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "请优化： 1. 供应链对象-供应商页面，表格面板要重构其风格，每条记录显示供应商的主要3个属性（供应商名称、主要供应物料，风险等级），关系，逻辑、行动，去掉操作列，在表格记录里面点击任何即可展开右边侧边栏。2. 供应链对象-供应商页面，表格结构参考供应商页面，呈现属性：物料编码、物料名称、库存数量、关系、逻辑、行动。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 供应商表格重构 (Priority: P1)

用户在配置后台的"供应链对象 > 供应商"页面查看供应商列表时，希望看到更丰富的信息展示，包括供应商的主要属性（供应商名称、主要供应物料、风险等级）、关系、逻辑和行动信息，并且可以通过点击表格行来展开右侧详情面板，而不需要单独的操作按钮。

**Why this priority**: 这是核心的用户界面优化，直接影响用户查看和管理供应商信息的效率。重构后的表格提供更直观的信息展示，减少操作步骤。

**Independent Test**: 可以独立测试：打开配置后台，进入"供应链对象 > 供应商"页面，验证表格显示供应商名称、主要供应物料、风险等级、关系、逻辑、行动列，点击任意表格行展开右侧详情面板，确认操作列已移除。

**Acceptance Scenarios**:

1. **Given** 用户在配置后台的"供应链对象 > 供应商"页面，**When** 查看供应商列表，**Then** 表格显示以下列：供应商名称、主要供应物料、风险等级、关系、逻辑、行动
2. **Given** 供应商列表已加载，**When** 用户点击任意表格行，**Then** 右侧详情面板展开显示该供应商的完整信息（属性、关系、逻辑、行动、权限）
3. **Given** 表格已显示，**When** 用户查看表格结构，**Then** 操作列（编辑、删除按钮）已移除
4. **Given** 供应商有多个供应物料，**When** 显示主要供应物料，**Then** 显示第一个或最重要的物料名称
5. **Given** 供应商有风险等级信息，**When** 显示风险等级，**Then** 以颜色标识或文字显示风险等级（如：高风险、中风险、低风险）

---

### User Story 2 - 物料表格重构 (Priority: P1)

用户在配置后台的"供应链对象 > 物料"页面查看物料列表时，希望看到与供应商页面类似的表格结构，显示物料的关键属性（物料编码、物料名称、库存数量）、关系、逻辑和行动信息，并且可以通过点击表格行来展开右侧详情面板。

**Why this priority**: 与供应商页面保持一致的交互体验，提供统一的用户界面模式，降低学习成本。

**Independent Test**: 可以独立测试：打开配置后台，进入"供应链对象 > 物料"页面，验证表格显示物料编码、物料名称、库存数量、关系、逻辑、行动列，点击任意表格行展开右侧详情面板。

**Acceptance Scenarios**:

1. **Given** 用户在配置后台的"供应链对象 > 物料"页面，**When** 查看物料列表，**Then** 表格显示以下列：物料编码、物料名称、库存数量、关系、逻辑、行动
2. **Given** 物料列表已加载，**When** 用户点击任意表格行，**Then** 右侧详情面板展开显示该物料的完整信息（属性、关系、逻辑、行动、权限）
3. **Given** 物料有库存信息，**When** 显示库存数量，**Then** 显示当前库存数量（currentStock）
4. **Given** 物料表格已显示，**When** 用户查看表格结构，**Then** 表格风格与供应商页面保持一致

---

### Edge Cases

- 当供应商没有供应物料信息时，主要供应物料列显示什么？（显示"无"或"-"）
- 当供应商没有风险等级信息时，风险等级列显示什么？（显示默认值"未知"或"-"）
- 当物料没有库存信息时，库存数量列显示什么？（显示"0"或"-"）
- 当表格行被点击时，如果右侧面板已经打开并显示另一个实体，如何处理？（关闭当前面板并打开新选中的实体）
- 当表格为空时，如何显示？（显示空状态提示）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display supplier table with columns: supplier name, primary supply material, risk level, relations, logic, actions
- **FR-002**: System MUST display material table with columns: material code, material name, inventory quantity, relations, logic, actions
- **FR-003**: System MUST remove operation column (edit/delete buttons) from supplier and material tables
- **FR-004**: System MUST allow users to click any part of a table row to expand the right sidebar panel with entity details
- **FR-005**: System MUST display primary supply material for each supplier (first material or most important material)
- **FR-006**: System MUST display risk level for each supplier with appropriate visual indicators (color coding or text labels)
- **FR-007**: System MUST display current stock quantity for each material
- **FR-008**: System MUST maintain consistent table styling between supplier and material pages
- **FR-009**: System MUST show relations summary in table (e.g., "3 materials", "2 products")
- **FR-010**: System MUST show logic rules count in table (e.g., "2 rules")
- **FR-011**: System MUST show actions count in table (e.g., "5 actions")
- **FR-012**: System MUST handle empty states when no entities exist (display appropriate message)
- **FR-013**: System MUST handle missing attribute values gracefully (display "-" or default value)

### Key Entities *(include if feature involves data)*

- **Supplier**: Represents a supplier entity with attributes including supplierId, supplierName, supplyMaterials (array), riskLevel, and relations/logic/actions from EntityConfig
- **Material**: Represents a material entity with attributes including materialCode, materialName, currentStock, and relations/logic/actions from EntityConfig
- **EntityConfig**: Configuration metadata for entities including relations, logicRules, and actions arrays

**Note**: All entity types MUST be defined in `src/types/ontology.ts` per Principle 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view supplier key information (name, primary material, risk level) at a glance without opening detail panel - 100% of supplier records display these 3 attributes
- **SC-002**: Users can view material key information (code, name, stock) at a glance without opening detail panel - 100% of material records display these 3 attributes
- **SC-003**: Users can access entity details with single click on table row - reduces interaction steps from 2 (click edit button) to 1 (click row)
- **SC-004**: Table styling consistency between supplier and material pages - visual inspection confirms identical column layout and styling patterns
- **SC-005**: All table rows are clickable and expand detail panel - 100% of rows respond to click events
- **SC-006**: Operation column removal reduces visual clutter - table width reduced by approximately 15-20% (operation column width)

## Assumptions

- Supplier risk level is available in EntityConfig attributes (riskLevel field)
- Primary supply material can be determined from supplyMaterials array (first item or most important)
- Material current stock is available in EntityConfig attributes (currentStock field)
- Relations, logic, and actions information is available in EntityConfig for each entity
- Right sidebar panel (RightPanel component) already exists and can be triggered by entity selection
- Table row click event will replace the current edit button click functionality
- Empty states and missing data handling follow existing UI patterns in the application

## Dependencies

- **RightPanel Component**: Must support entity selection and detail display (already exists)
- **EntityConfig Service**: Must provide entity configurations with relations, logicRules, and actions (already exists)
- **Entity Data**: Must have supplier and material entities with required attributes populated (already exists from previous features)

## Out of Scope

- Other entity type tables (factory, warehouse, order, logistics, customer) - only supplier and material tables are in scope
- Table sorting and filtering functionality - these remain unchanged
- Export functionality - remains unchanged
- Delete functionality - users can still delete entities through detail panel or other means (not specified in requirements)
- Table pagination - remains unchanged if exists





