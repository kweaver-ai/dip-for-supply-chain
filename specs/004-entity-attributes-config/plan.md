# Implementation Plan: 供应链对象属性配置

**Branch**: `004-entity-attributes-config` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-entity-attributes-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为配置后台中的8种供应链对象（供应商、物料、工厂、产品、仓库、订单、物流、客户）定义详细的属性、关系、逻辑、行动和权限配置，并确保与前台数据一一匹配形成联动。基于供应链业务常识为每种实体类型定义完整的属性列表（如工厂的12个属性）、关系定义（如工厂生产产品的一对多关系）、业务逻辑规则（如库存预警、ROI计算）、行动定义（如排产计划、产能调整）和权限配置（基于5种预定义角色的访问控制）。所有实体配置与前台mockData.ts中的数据通过ID一一对应，实现双向同步。

**新增需求（基于澄清）**：
- 修复物料属性显示问题：确保物料实体详情面板侧边栏显示全部9个属性（materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category）
- 重新准备各实体类型的模拟数据记录，确保数量符合要求且与前台数据通过ID一一对应：
  - 供应商：5条记录（清除现有，重新创建）
  - 物料：20条记录（清除现有，重新创建，确保9个属性全部显示）
  - 工厂：3条记录（创建新记录）
  - 仓库：3条记录（创建新记录）
  - 订单：10条记录（清除现有，重新创建）
  - 物流：5条记录（创建新记录）
  - 客户：10条记录（创建新记录）
- 保持业务关联关系：订单必须关联存在的产品和客户，物料必须关联存在的供应商，产品必须关联存在的物料等
- 同时更新前台mockData数组和配置后台entityConfigs Map，确保ID一致性

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: In-memory mock data (`src/data/mockData.ts`), existing entity data structures, entityConfigs Map  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Entity list rendering < 500ms, configuration panel loading < 200ms, bidirectional sync < 1 second  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), integrate with existing configuration backend infrastructure, maintain bidirectional synchronization with frontend data  
**Scale/Scope**: 8 entity types, 59 entity instances total (Supplier: 5, Material: 20, Factory: 3, Product: 4, Warehouse: 3, Order: 10, Logistics: 5, Customer: 10), 8-12 attributes per entity type (Material: 9 attributes, all must be displayed), 2-5 relations per entity type, 3+ logic rules per entity type, 5-6 actions per entity type, 5 predefined roles for permission matching. All entity records must maintain business relationships and match frontend mockData by ID.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - New types MUST be defined in or extend from `src/types/ontology.ts`
  - No ad-hoc type definitions in component files
  - **Action Required**: Entity attribute definitions will extend existing EntityConfig interface in ontology.ts, no new types needed
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Use existing semantic variables from index.css, ensure all new UI components use semantic colors
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - Large components identified and refactoring plan documented
  - **Action Required**: RightPanel.tsx may exceed 150 lines with new attribute/relation/logic/action/permission panels, consider splitting into sub-components if needed
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - configuration backend modifies mockData directly (in-memory), no simulation mode

**Violations**: None identified.

## Project Structure

### Documentation (this feature)

```text
specs/004-entity-attributes-config/
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
├── types/
│   └── ontology.ts                    # EntityConfig interface (extend existing)
├── data/
│   └── mockData.ts                    # entityConfigs Map (populate with all entity types)
├── utils/
│   └── entityConfigService.ts         # Extend with attribute/relation/logic/action population functions
└── components/
    └── config-backend/
        ├── EntityListView.tsx         # Display entity list (existing)
        ├── RightPanel.tsx             # Display entity details (extend with new attribute/relation/logic/action/permission panels)
        └── ConfigAIAssistant.tsx      # AI assistant for rule generation (existing)
```

**Structure Decision**: Single-page React application structure. Configuration backend components extend existing infrastructure. Entity configurations stored in entityConfigs Map in mockData.ts. Service layer (entityConfigService.ts) handles CRUD and bidirectional synchronization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Phase 0: Research

**Status**: Complete

See [research.md](./research.md) for detailed research findings and decisions.

### Key Research Questions

1. **RQ-001**: How to populate entityConfigs Map with complete attribute definitions for all 8 entity types?
   - **Decision**: Create a helper function `populateEntityConfigs()` that iterates through all frontend entities and creates/updates entityConfigs entries with complete attribute, relation, logic, and action definitions based on supply chain business domain knowledge.

2. **RQ-002**: How to define entity attributes based on supply chain business domain knowledge?
   - **Decision**: Use the detailed attribute lists provided in FR-009 (e.g., Factory: 12 attributes, Supplier: 11 attributes). Attributes are extracted from frontend entity data and supplemented with business domain knowledge.

3. **RQ-003**: How to define entity relations based on supply chain business domain knowledge?
   - **Decision**: Use the detailed relation definitions provided in FR-010. Relations are calculated by analyzing frontend data relationships (e.g., Product.materialCodes → Material relation, Order.productId → Product relation).

4. **RQ-004**: How to define business logic rules based on supply chain business domain knowledge?
   - **Decision**: Use the detailed logic rule definitions provided in FR-011. Rules are predefined templates that can be instantiated for each entity (e.g., "库存预警" validation rule for Material and Product entities).

5. **RQ-005**: How to define entity actions based on supply chain business domain knowledge?
   - **Decision**: Use the detailed action definitions provided in FR-012. Actions are predefined templates with name, icon (Lucide React), color (Tailwind), and description for each entity type.

6. **RQ-006**: How to match entity permissions based on user management logic?
   - **Decision**: Use role-based access control mapping from FR-013. Each entity type has default permissions based on role scope (e.g., procurement role → Supplier, Material, Order access).

7. **RQ-011**: How to fix material attribute display issue in RightPanel sidebar?
   - **Decision**: Update `getEntityDisplayFields()` helper function in RightPanel.tsx to include all 9 material attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category). This ensures all material attributes are displayed in the entity detail panel sidebar per FR-008a.

8. **RQ-012**: How to recreate mock data records with specified quantities while maintaining ID consistency?
   - **Decision**: Create `recreateMockDataRecords()` function that clears existing records from both frontend mockData arrays and entityConfigs Map, creates new records sequentially with dependency checking (ensuring orders reference existing products/customers, materials reference existing suppliers, etc.), and calls populateEntityConfigs() to sync entityConfigs Map. This ensures ID consistency per FR-008b, FR-008c, FR-008d.

## Phase 1: Design & Contracts

**Status**: Complete

See [data-model.md](./data-model.md), [contracts/api-contracts.md](./contracts/api-contracts.md), and [quickstart.md](./quickstart.md) for detailed design artifacts.

### Data Model

**Key Entities**:
- **EntityConfig**: Extended with complete attribute, relation, logic, action, and permission definitions
- **Entity Attribute Definitions**: 8 entity types × 8-12 attributes each = ~80 attribute definitions
- **Entity Relation Definitions**: 8 entity types × 2-5 relations each = ~24 relation definitions
- **Business Logic Rule Templates**: 8 entity types × 3+ rules each = ~24 rule templates
- **Entity Action Templates**: 8 entity types × 5-6 actions each = ~40 action templates

**Data Population Strategy**:
1. Iterate through all frontend entities (suppliersData, materialsData, productsData, ordersData, etc.)
2. For each entity, create/update entityConfigs entry with:
   - Complete attribute list from FR-009
   - Calculated relations from FR-010 (based on frontend data relationships)
   - Predefined logic rules from FR-011
   - Predefined actions from FR-012
   - Default permissions from FR-013 (based on entity type and role scope)

### API Contracts

**Service Layer Functions** (extend existing entityConfigService.ts):
- `populateEntityConfigs()`: Populate entityConfigs Map with all entity configurations
- `getEntityAttributes(entityType, entityId)`: Get entity attributes
- `getEntityRelations(entityType, entityId)`: Get entity relations
- `getEntityLogicRules(entityType, entityId)`: Get entity logic rules
- `getEntityActions(entityType, entityId)`: Get entity actions
- `getEntityPermissions(entityType, entityId)`: Get entity permissions
- `updateEntityAttributes(entityType, entityId, attributes)`: Update entity attributes with bidirectional sync
- `addEntityRelation(entityType, entityId, relation)`: Add entity relation
- `addEntityLogicRule(entityType, entityId, rule)`: Add entity logic rule
- `addEntityAction(entityType, entityId, action)`: Add entity action
- `updateEntityPermissions(entityType, entityId, permissions)`: Update entity permissions

### Integration Points

- **RightPanel.tsx**: Extend existing 5-tab panel to display complete attribute, relation, logic, action, and permission configurations
- **EntityListView.tsx**: Display entity list (no changes needed)
- **entityConfigService.ts**: Add population and helper functions
- **mockData.ts**: Populate entityConfigs Map with all entity configurations

## Phase 2: Implementation Planning

**Status**: Pending (requires Phase 1 completion)

Implementation will be broken down into tasks in `tasks.md` (generated by `/speckit.tasks` command).

**Estimated Phases**:
1. Setup: Create helper functions for entity configuration population
2. Data Population: Populate entityConfigs Map with all entity configurations (attributes, relations, logic, actions, permissions)
3. UI Enhancement: Extend RightPanel.tsx to display complete configurations
4. Integration: Ensure bidirectional synchronization works correctly
5. Testing: Verify all entity configurations match frontend data by ID
6. Polish: Edge case handling, empty states, validation

## Assumptions & Risks

**Assumptions**:
- Frontend data structure follows existing mockData.ts format with entity IDs matching configuration backend entity IDs
- Entity attributes, relations, logic rules, and actions are defined based on standard supply chain management practices
- Permission matching follows existing user management logic with 5 predefined roles
- Bidirectional synchronization updates both configuration backend and frontend data immediately when changes are saved
- All entity types have at least some frontend data records to match (suppliers, materials, products, orders exist; factories, warehouses, logistics, customers may need to be created if missing)

**Risks**:
- Entity configuration population complexity (mitigation: use helper functions, iterate systematically)
- RightPanel.tsx component size exceeding 150 lines (mitigation: split into sub-components if needed)
- Missing frontend data for some entity types (mitigation: create mock data or handle empty states)
- Bidirectional synchronization edge cases (mitigation: test thoroughly, handle conflicts)

## Next Steps

1. ✅ Complete Phase 0 research (research.md generated)
2. ✅ Complete Phase 1 design (data-model.md, contracts/, quickstart.md generated)
3. Run `/speckit.tasks` to generate task breakdown
4. Begin implementation following tasks.md

## Summary

**Plan Status**: Phase 0 and Phase 1 complete. Ready for task breakdown.

