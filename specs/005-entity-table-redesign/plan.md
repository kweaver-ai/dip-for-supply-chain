# Implementation Plan: 实体列表表格重构

**Branch**: `005-entity-table-redesign` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-entity-table-redesign/spec.md`

## Summary

重构配置后台的供应商和物料实体列表表格，将表格从简单的ID/名称/操作列结构改为显示更丰富的属性信息（供应商：名称、主要供应物料、风险等级、关系、逻辑、行动；物料：编码、名称、库存数量、关系、逻辑、行动），移除操作列，并通过点击表格行来展开右侧详情面板。这提供了更直观的信息展示，减少了用户操作步骤，并保持两个页面之间的视觉一致性。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Tailwind CSS v4, Lucide React (icons), Vite (build tool)  
**Storage**: In-memory mock data (`src/data/mockData.ts`), EntityConfig Map for configuration metadata  
**Testing**: Manual testing via browser (no test framework specified)  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Single-page web application (React SPA)  
**Performance Goals**: Table rendering should handle 100+ entities without noticeable lag, row click response < 100ms  
**Constraints**: Must maintain existing search/filter/export functionality, must preserve bidirectional sync between frontend data and EntityConfig Map  
**Scale/Scope**: 2 entity types (supplier, material), ~5-20 records per type, single table component with conditional rendering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - EntityConfig, EntityRelation, EntityAction, BusinessLogicRule types already defined in ontology.ts
  - Supplier and Material entity types already defined in ontology.ts
  - No new types needed, only using existing types
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - Will use existing semantic color variables (e.g., `bg-slate-50`, `text-slate-800`, `border-slate-200`)
  - Risk level display will use semantic status colors if available
  - No hex colors will be introduced
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - EntityListView.tsx currently ~185 lines, will be refactored to extract table rendering logic
  - Will create separate table row component or helper functions to keep main component under 150 lines
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Not applicable - this feature only affects UI display, no simulation logic involved
  - All data reads from existing mockData.ts and entityConfigs Map

**Violations**: None identified. All principles can be satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/005-entity-table-redesign/
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
│   └── config-backend/
│       ├── EntityListView.tsx          # Main entity list component (to be refactored)
│       ├── EntityTableRow.tsx         # New: Table row component for supplier/material
│       └── RightPanel.tsx              # Existing: Detail panel (no changes needed)
├── utils/
│   └── entityConfigService.ts         # Existing: Entity config service (no changes needed)
├── types/
│   └── ontology.ts                    # Existing: Type definitions (no changes needed)
└── data/
    └── mockData.ts                    # Existing: Mock data (no changes needed)
```

**Structure Decision**: Single project structure. The feature modifies existing `EntityListView.tsx` component and adds a new `EntityTableRow.tsx` component for reusable table row rendering. All other dependencies (RightPanel, entityConfigService, types) remain unchanged.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Phase 0: Research & Design Decisions

### Research Questions

**RQ-001: How to determine primary supply material for supplier?**
- **Decision**: Use first material from `supplyMaterials` array in EntityConfig attributes, or if empty, use first material from `suppliersData` matching the supplierId
- **Rationale**: Simple and predictable - first material is typically the most important or primary material
- **Alternatives Considered**: 
  - Most frequently ordered material: Requires order data analysis, more complex
  - Highest value material: Requires price data, not always available
  - User-selected primary: Requires UI for selection, out of scope

**RQ-002: How to display relations, logic, and actions counts in table?**
- **Decision**: Display as summary text (e.g., "3 materials", "2 rules", "5 actions") in separate columns
- **Rationale**: Provides quick overview without cluttering the table, consistent with common table design patterns
- **Alternatives Considered**:
  - Icons with tooltips: More visual but requires hover interaction
  - Expandable rows: More complex interaction, not requested
  - Badge components: More visual but takes more space

**RQ-003: How to handle risk level display with visual indicators?**
- **Decision**: Use text labels (高风险/中风险/低风险) with background color using Tailwind semantic status colors (e.g., `bg-status-risk` for high, `bg-status-warning` for medium, `bg-status-success` for low)
- **Rationale**: Text is accessible and clear, colors provide quick visual distinction, semantic variables ensure consistency
- **Alternatives Considered**:
  - Color-only indicators: Less accessible, requires color vision
  - Icons only: Less clear without text
  - Badge components: More complex but acceptable if using semantic colors

**RQ-004: How to make entire table row clickable?**
- **Decision**: Add `onClick` handler to `<tr>` element with `cursor-pointer` class, remove separate edit button click handler
- **Rationale**: Standard HTML pattern, provides larger click target, improves UX
- **Alternatives Considered**:
  - Wrapping row in button: Invalid HTML (button cannot contain tr)
  - Clickable div overlay: More complex, accessibility concerns
  - Checkbox selection: Different interaction pattern, not requested

**RQ-005: How to maintain table styling consistency between supplier and material pages?**
- **Decision**: Extract table rendering logic into reusable component or helper function that accepts column configuration, use same CSS classes and layout structure
- **Rationale**: DRY principle, ensures visual consistency, easier maintenance
- **Alternatives Considered**:
  - Duplicate code: Violates DRY, harder to maintain
  - Separate components: More files but better separation of concerns
  - Conditional rendering in single component: More complex but acceptable

## Phase 1: Data Model & Contracts

### Data Model

**Entities**: No new entities. Uses existing:
- `Supplier` from `src/types/ontology.ts` (supplierId, supplierName, materialName, materialCode)
- `Material` from `src/types/ontology.ts` (materialCode, materialName, applicableProductIds)
- `EntityConfig` from `src/types/ontology.ts` (attributes, relations, logicRules, actions)

**Data Flow**:
1. `EntityListView` calls `getEntitiesByType(entityType)` from `entityConfigService.ts`
2. For each entity, calls `getEntityConfig(entityType, entityId)` to get configuration
3. Extracts attributes (supplierName, supplyMaterials, riskLevel for supplier; materialCode, materialName, currentStock for material)
4. Extracts counts from relations, logicRules, actions arrays
5. Renders table row with extracted data

**Derived Data**:
- Primary supply material: `config.attributes.supplyMaterials[0]` or fallback to `suppliersData` lookup
- Relations count: `config.relations.length` or sum of `config.relations[].count`
- Logic rules count: `config.logicRules.length`
- Actions count: `config.actions.length`
- Risk level: `config.attributes.riskLevel` or default "未知"
- Current stock: `config.attributes.currentStock` or 0

### API Contracts

**Component Props**:
- `EntityListView`: `{ entityType: EntityType }` (unchanged)
- `EntityTableRow` (new): `{ entity: any, entityType: EntityType, config: EntityConfig | null, onClick: (entity: any) => void }`

**Service Functions** (no changes, existing):
- `getEntitiesByType(type: EntityType): any[]`
- `getEntityConfig(type: EntityType, id: string): EntityConfig | null`

**Event Handlers**:
- Row click: `onClick: (entity: any) => void` - triggers `setSelectedEntity(entity)` in parent

### Quickstart Guide

**For Developers**:

1. **Understand Current Structure**:
   - Review `src/components/config-backend/EntityListView.tsx` (current implementation)
   - Review `src/utils/entityConfigService.ts` (entity data access)
   - Review `src/types/ontology.ts` (type definitions)

2. **Implementation Steps**:
   - Create `EntityTableRow.tsx` component for reusable row rendering
   - Refactor `EntityListView.tsx` to use new row component
   - Update table columns for supplier and material entity types
   - Remove operation column rendering
   - Add row click handler to replace edit button click
   - Extract helper functions for data extraction (primary material, counts, etc.)

3. **Testing**:
   - Open configuration backend, navigate to "供应链对象 > 供应商"
   - Verify table displays: supplier name, primary material, risk level, relations, logic, actions
   - Click any row, verify right panel opens
   - Navigate to "供应链对象 > 物料"
   - Verify table displays: material code, name, stock, relations, logic, actions
   - Verify styling consistency between pages

4. **Key Files to Modify**:
   - `src/components/config-backend/EntityListView.tsx` - Main refactoring
   - `src/components/config-backend/EntityTableRow.tsx` - New component (create)

**For Users**:

- Navigate to "供应链对象 > 供应商" or "供应链对象 > 物料" in configuration backend
- View enhanced table with more information columns
- Click any table row to open detail panel (no need to click edit button)
- Operation buttons (edit/delete) removed from table (still available in detail panel if needed)





