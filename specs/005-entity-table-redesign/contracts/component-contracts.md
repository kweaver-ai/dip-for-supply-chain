# Component Contracts: 实体列表表格重构

**Feature**: 实体列表表格重构  
**Date**: 2024-12-19

## Component Interfaces

### EntityListView Component

**File**: `src/components/config-backend/EntityListView.tsx`

**Props**:
```typescript
interface Props {
  entityType: EntityType;
}
```

**State**:
```typescript
interface State {
  entities: any[];
  selectedEntity: any | null;
  searchQuery: string;
  filters: { status: string };
  showNewModal: boolean;
}
```

**Methods**:
- `handleEntitySelect(entity: any): void` - Sets selectedEntity, opens RightPanel
- `handleDelete(entity: any): void` - Deletes entity, refreshes list
- `handleExport(): void` - Exports entities to CSV
- `getEntityName(entity: any): string` - Extracts entity name
- `getEntityId(entity: any): string` - Extracts entity ID

**Events**:
- Row click: `onClick={() => handleEntitySelect(entity)}` - Triggers entity selection

**Dependencies**:
- `getEntitiesByType` from `entityConfigService.ts`
- `getEntityConfig` from `entityConfigService.ts`
- `deleteEntity` from `entityConfigService.ts`
- `RightPanel` component
- `NewObjectModal` component

---

### EntityTableRow Component (New)

**File**: `src/components/config-backend/EntityTableRow.tsx` (to be created)

**Props**:
```typescript
interface Props {
  entity: any;
  entityType: EntityType;
  config: EntityConfig | null;
  onClick: (entity: any) => void;
}
```

**Methods** (internal):
- `getPrimarySupplyMaterial(): string` - Extracts primary material for supplier
- `getRiskLevelDisplay(): { label: string; className: string }` - Formats risk level for display
- `getRelationsCount(): number` - Calculates total relations count
- `getLogicRulesCount(): number` - Gets logic rules count
- `getActionsCount(): number` - Gets actions count
- `getCurrentStock(): number` - Gets current stock for material

**Rendering**:
- Supplier row: Renders columns for name, primary material, risk level, relations, logic, actions
- Material row: Renders columns for code, name, stock, relations, logic, actions
- Other types: Falls back to default row rendering (ID, name)

**Events**:
- Row click: `onClick(entity)` - Propagates to parent component

---

### RightPanel Component (Existing, No Changes)

**File**: `src/components/config-backend/RightPanel.tsx`

**Props**: (unchanged)
```typescript
interface Props {
  entity: any;
  entityType: EntityType;
  onClose: () => void;
}
```

**Behavior**: (unchanged)
- Displays entity details in sidebar
- Supports 5 tabs: attributes, relations, logic, actions, permissions
- Handles entity attribute editing

---

## Service Contracts

### EntityConfigService (Existing, No Changes)

**File**: `src/utils/entityConfigService.ts`

**Functions Used**:

#### `getEntitiesByType(type: EntityType): any[]`

**Input**: Entity type (e.g., 'supplier', 'material')

**Output**: Array of entity objects

**Behavior**: Returns all entities of specified type from mockData

**Example**:
```typescript
const suppliers = getEntitiesByType('supplier');
// Returns: Supplier[] from suppliersData
```

#### `getEntityConfig(type: EntityType, id: string): EntityConfig | null`

**Input**: 
- Entity type
- Entity ID

**Output**: EntityConfig object or null if not found

**Behavior**: Looks up entity configuration from entityConfigs Map

**Example**:
```typescript
const config = getEntityConfig('supplier', 'SUP-001');
// Returns: EntityConfig | null
```

#### `deleteEntity(type: EntityType, id: string): boolean`

**Input**: 
- Entity type
- Entity ID

**Output**: Boolean indicating success

**Behavior**: Deletes entity from data and EntityConfig Map (bidirectional sync)

**Note**: Not directly used in this feature, but available for future use

---

## Data Flow Contracts

### Entity Selection Flow

```
User clicks table row
  → EntityTableRow.onClick(entity) called
  → EntityListView.handleEntitySelect(entity) called
  → setSelectedEntity(entity) updates state
  → RightPanel component renders with entity prop
  → RightPanel displays entity details
```

### Data Retrieval Flow

```
EntityListView mounts
  → useEffect calls getEntitiesByType(entityType)
  → For each entity, calls getEntityConfig(entityType, entityId)
  → Extracts display data from entity + config
  → Renders table rows with extracted data
```

### Empty State Flow

```
No entities found
  → filteredEntities.length === 0
  → Renders empty state message
  → Shows "新建" button if no search/filter active
```

---

## Event Contracts

### Row Click Event

**Trigger**: User clicks anywhere on table row

**Handler**: `onClick: (entity: any) => void`

**Behavior**:
- Sets selectedEntity state
- Opens RightPanel component
- If RightPanel already open with different entity, replaces it

**Accessibility**:
- Keyboard support: Enter/Space keys trigger click
- Focus management: Row receives focus on selection

### Search Event

**Trigger**: User types in search input

**Handler**: `onChange: (e: ChangeEvent<HTMLInputElement>) => void`

**Behavior**:
- Updates searchQuery state
- Filters entities list in real-time
- Updates filteredEntities array

### Filter Event (Unchanged)

**Trigger**: User clicks filter button

**Handler**: (unchanged, not modified in this feature)

**Behavior**: (unchanged)

---

## Styling Contracts

### Table Styling

**Base Classes**: 
- Table container: `bg-white rounded-lg border shadow-sm`
- Table: `w-full`
- Header: `bg-slate-50 border-b`
- Header cell: `px-3 py-2 text-left text-xs font-bold text-slate-600`
- Body row: `border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors`
- Body cell: `px-3 py-2 text-sm text-slate-600` or `text-slate-800`

### Risk Level Badge Styling

**Classes** (using semantic variables):
- Low risk: `bg-status-success text-status-success-foreground` or `bg-green-100 text-green-800`
- Medium risk: `bg-status-warning text-status-warning-foreground` or `bg-yellow-100 text-yellow-800`
- High risk: `bg-status-risk text-status-risk-foreground` or `bg-red-100 text-red-800`
- Critical risk: `bg-status-critical text-status-critical-foreground` or `bg-red-200 text-red-900`
- Unknown: `bg-slate-200 text-slate-600`

**Format**: Badge/pill shape with padding: `px-2 py-1 rounded-full text-xs font-bold`

---

## Error Handling Contracts

### Missing EntityConfig

**Scenario**: Entity exists but EntityConfig is null

**Handling**:
- Use entity data directly
- Display default values for counts (0)
- Display default risk level ("未知")
- Display "-" for optional fields

**No Error Thrown**: Graceful degradation

### Missing Attributes

**Scenario**: EntityConfig exists but specific attributes missing

**Handling**:
- Use fallback values (see data-model.md)
- Display "-" for optional text fields
- Display 0 for numeric fields

**No Error Thrown**: Graceful degradation

### Invalid Entity Type

**Scenario**: entityType not 'supplier' or 'material'

**Handling**:
- Fall back to default table rendering (ID, name columns)
- Log warning to console (development only)

**No Error Thrown**: Graceful degradation

---

## Testing Contracts

### Unit Test Contracts

**EntityTableRow Component**:
- Test primary material extraction logic
- Test risk level display formatting
- Test counts calculation (relations, logic, actions)
- Test row click event propagation

**EntityListView Component**:
- Test entity selection flow
- Test table rendering for supplier type
- Test table rendering for material type
- Test empty state rendering

### Integration Test Contracts

**Table Display**:
- Verify correct columns displayed for supplier
- Verify correct columns displayed for material
- Verify operation column removed
- Verify row click opens RightPanel

**Data Display**:
- Verify primary material displayed correctly
- Verify risk level displayed with correct styling
- Verify counts displayed correctly
- Verify missing data handled gracefully

---

## Performance Contracts

### Rendering Performance

**Target**: Table renders 20 entities in < 100ms

**Measurement**: Time from component mount to table visible

### Interaction Performance

**Target**: Row click response < 50ms

**Measurement**: Time from click to RightPanel visible

### Data Retrieval Performance

**Target**: EntityConfig lookup < 1ms per entity

**Measurement**: Time for getEntityConfig call

**Note**: All data is in-memory, so performance should be excellent.





