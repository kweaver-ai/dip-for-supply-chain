# Data Model: 实体列表表格重构

**Feature**: 实体列表表格重构  
**Date**: 2024-12-19

## Overview

This feature does not introduce new data entities. It uses existing entities from `src/types/ontology.ts` and enhances the display of existing data in table format.

## Existing Entities Used

### Supplier Entity

**Source**: `src/types/ontology.ts` - `Supplier` interface

**Attributes**:
- `supplierId: string` - Unique supplier identifier
- `supplierName: string` - Supplier name
- `materialName: string` - Material name supplied
- `materialCode: string` - Material code

**EntityConfig Attributes** (from `EntityConfig.attributes`):
- `supplierName: string` - Supplier name (displayed in table)
- `supplyMaterials: string[]` - Array of material codes supplied (used to determine primary material)
- `riskLevel: 'low' | 'medium' | 'high' | 'critical'` - Risk level (displayed in table)

**Relations** (from `EntityConfig.relations`):
- Array of `EntityRelation` objects
- Each relation has `targetType`, `relationType`, `count`, `sampleItems`
- Displayed as summary count in table

**Logic Rules** (from `EntityConfig.logicRules`):
- Array of `BusinessLogicRule` objects
- Displayed as count in table

**Actions** (from `EntityConfig.actions`):
- Array of `EntityAction` objects
- Displayed as count in table

### Material Entity

**Source**: `src/types/ontology.ts` - `Material` interface

**Attributes**:
- `materialCode: string` - Material code (displayed in table)
- `materialName: string` - Material name (displayed in table)
- `applicableProductIds: string[]` - Product IDs that use this material

**EntityConfig Attributes** (from `EntityConfig.attributes`):
- `materialCode: string` - Material code (displayed in table)
- `materialName: string` - Material name (displayed in table)
- `currentStock: number` - Current stock quantity (displayed in table)
- `safetyStock: number` - Safety stock level (not displayed in table, but available)

**Relations** (from `EntityConfig.relations`):
- Array of `EntityRelation` objects
- Displayed as summary count in table

**Logic Rules** (from `EntityConfig.logicRules`):
- Array of `BusinessLogicRule` objects
- Displayed as count in table

**Actions** (from `EntityConfig.actions`):
- Array of `EntityAction` objects
- Displayed as count in table

### EntityConfig Entity

**Source**: `src/types/ontology.ts` - `EntityConfig` interface

**Structure**:
```typescript
interface EntityConfig {
  entityId: string;
  entityType: EntityType;
  attributes: Record<string, any>;
  relations: EntityRelation[];
  logicRules: BusinessLogicRule[];
  actions: EntityAction[];
  permissions: PermissionConfig;
}
```

**Usage**: Retrieved via `getEntityConfig(entityType, entityId)` from `entityConfigService.ts`

## Data Flow

### 1. Entity List Retrieval

```
EntityListView component
  → calls getEntitiesByType(entityType)
  → returns array of Supplier[] or Material[]
```

### 2. Entity Configuration Retrieval

```
For each entity in list:
  → calls getEntityConfig(entityType, entityId)
  → returns EntityConfig | null
```

### 3. Data Extraction for Display

**For Supplier**:
- Supplier name: `entity.supplierName` or `config.attributes.supplierName`
- Primary material: `config.attributes.supplyMaterials[0]` or fallback to `suppliersData` lookup
- Risk level: `config.attributes.riskLevel` or default "未知"
- Relations count: Sum of `config.relations[].count` or `config.relations.length`
- Logic rules count: `config.logicRules.length`
- Actions count: `config.actions.length`

**For Material**:
- Material code: `entity.materialCode` or `config.attributes.materialCode`
- Material name: `entity.materialName` or `config.attributes.materialName`
- Current stock: `config.attributes.currentStock` or 0
- Relations count: Sum of `config.relations[].count` or `config.relations.length`
- Logic rules count: `config.logicRules.length`
- Actions count: `config.actions.length`

### 4. Table Rendering

```
Extracted data
  → passed to EntityTableRow component (or inline rendering)
  → rendered as table row with columns:
    - Supplier: Name | Primary Material | Risk Level | Relations | Logic | Actions
    - Material: Code | Name | Stock | Relations | Logic | Actions
```

## Derived Data

### Primary Supply Material (Supplier)

**Source**: `EntityConfig.attributes.supplyMaterials` array

**Derivation Logic**:
1. If `config.attributes.supplyMaterials` exists and has length > 0:
   - Return first item: `supplyMaterials[0]`
2. Else, fallback to `suppliersData` lookup:
   - Find all entries in `suppliersData` matching `supplierId`
   - Return first `materialName` from matching entries
3. Else, return "-" or "无"

**Display Format**: String (material name or code)

### Relations Summary

**Source**: `EntityConfig.relations` array

**Derivation Logic**:
- Sum all `count` values from relations array: `relations.reduce((sum, rel) => sum + rel.count, 0)`
- Or use array length if counts are not reliable: `relations.length`

**Display Format**: Number as string (e.g., "3", "5")

### Logic Rules Count

**Source**: `EntityConfig.logicRules` array

**Derivation Logic**:
- Array length: `logicRules.length`

**Display Format**: Number as string (e.g., "2", "0")

### Actions Count

**Source**: `EntityConfig.actions` array

**Derivation Logic**:
- Array length: `actions.length`

**Display Format**: Number as string (e.g., "5", "1")

### Risk Level Display

**Source**: `EntityConfig.attributes.riskLevel`

**Derivation Logic**:
- Map risk level to display label and color:
  - 'low' → "低风险" + green background
  - 'medium' → "中风险" + yellow background
  - 'high' → "高风险" + red background
  - 'critical' → "极高风险" + dark red background
  - undefined/null → "未知" + gray background

**Display Format**: Badge component with text label and background color

## Data Validation Rules

### Supplier Table

- **Supplier Name**: Required, must not be empty (fallback to supplierId if missing)
- **Primary Material**: Optional, display "-" if not available
- **Risk Level**: Optional, default to "未知" if not available
- **Relations Count**: Default to 0 if config missing or relations array empty
- **Logic Rules Count**: Default to 0 if config missing or logicRules array empty
- **Actions Count**: Default to 0 if config missing or actions array empty

### Material Table

- **Material Code**: Required, must not be empty (fallback to entityId if missing)
- **Material Name**: Required, must not be empty (fallback to materialCode if missing)
- **Current Stock**: Optional, default to 0 if not available
- **Relations Count**: Default to 0 if config missing or relations array empty
- **Logic Rules Count**: Default to 0 if config missing or logicRules array empty
- **Actions Count**: Default to 0 if config missing or actions array empty

## Edge Cases

### Missing EntityConfig

**Scenario**: Entity exists in data but has no EntityConfig entry

**Handling**:
- Use entity data directly (fallback to entity attributes)
- Display default values for counts (0)
- Display default risk level ("未知" for supplier)
- Display "-" for primary material if not available

### Empty Arrays

**Scenario**: EntityConfig exists but arrays are empty

**Handling**:
- Relations count: Display "0"
- Logic rules count: Display "0"
- Actions count: Display "0"

### Missing Attributes

**Scenario**: EntityConfig exists but specific attributes are missing

**Handling**:
- Use fallback values (see Data Validation Rules above)
- Display "-" for optional text fields
- Display 0 for numeric fields

## State Management

### Component State

**EntityListView**:
- `entities: any[]` - List of entities for current entityType
- `selectedEntity: any | null` - Currently selected entity (opens RightPanel)
- `searchQuery: string` - Search filter text
- `filters: { status: string }` - Filter state (unchanged)

### No New State Required

- EntityConfig data is retrieved on-demand via service calls
- No caching needed (data is in-memory)
- No synchronization needed (data is read-only for display)

## Data Sources

### Primary Sources

1. **Entity Data**: `src/data/mockData.ts`
   - `suppliersData: Supplier[]`
   - `materialsData: Material[]`

2. **Entity Configurations**: `src/data/mockData.ts`
   - `entityConfigs: Map<string, EntityConfig>`

### Service Layer

- `src/utils/entityConfigService.ts`
  - `getEntitiesByType(type: EntityType): any[]`
  - `getEntityConfig(type: EntityType, id: string): EntityConfig | null`

## Performance Considerations

- Entity list retrieval: O(1) - direct array access
- EntityConfig lookup: O(1) - Map lookup by key
- Data extraction: O(n) where n is number of relations/logicRules/actions (typically small, < 10)
- Table rendering: O(m) where m is number of entities (typically < 20)

**Optimization**: No special optimization needed for current scale (5-20 entities per type).





