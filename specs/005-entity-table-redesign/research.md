# Research: 实体列表表格重构

**Feature**: 实体列表表格重构  
**Date**: 2024-12-19  
**Phase**: Phase 0 - Research & Design Decisions

## Research Questions & Decisions

### RQ-001: How to determine primary supply material for supplier?

**Context**: Supplier entities have a `supplyMaterials` array in EntityConfig attributes, but we need to display a single "primary" material in the table.

**Decision**: Use first material from `supplyMaterials` array in EntityConfig attributes. If empty, fallback to first material from `suppliersData` matching the supplierId.

**Rationale**: 
- Simple and predictable behavior
- First material in array is typically the most important or primary material
- Fallback ensures data is always displayed even if config is incomplete

**Alternatives Considered**:
- **Most frequently ordered material**: Would require analyzing order data, more complex logic, performance overhead
- **Highest value material**: Requires price data which may not always be available
- **User-selected primary**: Would require UI for selection, out of scope for this feature

**Implementation Notes**:
```typescript
const getPrimarySupplyMaterial = (supplier: Supplier, config: EntityConfig | null): string => {
  if (config?.attributes?.supplyMaterials?.length > 0) {
    return config.attributes.supplyMaterials[0];
  }
  // Fallback to first material from suppliersData
  const supplierMaterials = suppliersData
    .filter(s => s.supplierId === supplier.supplierId)
    .map(s => s.materialName);
  return supplierMaterials[0] || '-';
};
```

---

### RQ-002: How to display relations, logic, and actions counts in table?

**Context**: EntityConfig contains arrays of relations, logicRules, and actions. We need to display summary information in table columns.

**Decision**: Display as summary text in separate columns (e.g., "3 materials", "2 rules", "5 actions").

**Rationale**:
- Provides quick overview without cluttering the table
- Consistent with common table design patterns
- Easy to scan and understand
- No additional interaction required

**Alternatives Considered**:
- **Icons with tooltips**: More visual but requires hover interaction, less accessible
- **Expandable rows**: More complex interaction pattern, not requested in requirements
- **Badge components**: More visual but takes more horizontal space, may cause layout issues

**Implementation Notes**:
```typescript
const getRelationsSummary = (config: EntityConfig | null): string => {
  if (!config?.relations?.length) return '0';
  const total = config.relations.reduce((sum, rel) => sum + rel.count, 0);
  return `${total}`;
};

const getLogicRulesCount = (config: EntityConfig | null): number => {
  return config?.logicRules?.length || 0;
};

const getActionsCount = (config: EntityConfig | null): number => {
  return config?.actions?.length || 0;
};
```

---

### RQ-003: How to handle risk level display with visual indicators?

**Context**: Supplier risk level is stored as string ('low' | 'medium' | 'high' | 'critical') in EntityConfig attributes. We need to display it with visual distinction.

**Decision**: Use text labels (高风险/中风险/低风险) with background color using Tailwind semantic status colors.

**Rationale**:
- Text labels are accessible and clear (screen reader friendly)
- Colors provide quick visual distinction
- Semantic variables ensure consistency with design system
- Follows Principle 2 (Tailwind semantic variables)

**Alternatives Considered**:
- **Color-only indicators**: Less accessible, requires color vision, violates accessibility best practices
- **Icons only**: Less clear without text labels, may be ambiguous
- **Badge components**: More complex but acceptable if using semantic colors (could be future enhancement)

**Implementation Notes**:
```typescript
const getRiskLevelDisplay = (riskLevel: string | undefined): { label: string; className: string } => {
  const riskMap: Record<string, { label: string; className: string }> = {
    'low': { label: '低风险', className: 'bg-status-success text-status-success-foreground' },
    'medium': { label: '中风险', className: 'bg-status-warning text-status-warning-foreground' },
    'high': { label: '高风险', className: 'bg-status-risk text-status-risk-foreground' },
    'critical': { label: '极高风险', className: 'bg-status-critical text-status-critical-foreground' },
  };
  return riskMap[riskLevel || ''] || { label: '未知', className: 'bg-slate-200 text-slate-600' };
};
```

**Note**: If semantic status colors are not defined in Tailwind config, use existing semantic colors like `bg-green-100 text-green-800` for low, `bg-yellow-100 text-yellow-800` for medium, `bg-red-100 text-red-800` for high.

---

### RQ-004: How to make entire table row clickable?

**Context**: Current implementation has separate edit button. Requirement is to make entire row clickable to open detail panel.

**Decision**: Add `onClick` handler to `<tr>` element with `cursor-pointer` class and appropriate hover styles.

**Rationale**:
- Standard HTML pattern, well-supported
- Provides larger click target, improves UX
- Maintains accessibility (keyboard navigation still works)
- Simple implementation

**Alternatives Considered**:
- **Wrapping row in button**: Invalid HTML (button element cannot contain tr element)
- **Clickable div overlay**: More complex, accessibility concerns, z-index issues
- **Checkbox selection pattern**: Different interaction pattern, not requested in requirements

**Implementation Notes**:
```typescript
<tr 
  key={entityId} 
  onClick={() => handleEntitySelect(entity)}
  className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
>
  {/* table cells */}
</tr>
```

**Accessibility Considerations**:
- Ensure keyboard navigation works (onKeyDown handler for Enter/Space)
- Add `role="button"` and `tabIndex={0}` for keyboard accessibility
- Maintain focus indicators

---

### RQ-005: How to maintain table styling consistency between supplier and material pages?

**Context**: Both supplier and material tables should have consistent styling and layout, but different column configurations.

**Decision**: Extract table rendering logic into reusable component (`EntityTableRow.tsx`) that accepts column configuration, or use helper functions with conditional rendering based on entityType.

**Rationale**:
- DRY principle - single source of truth for table styling
- Ensures visual consistency between pages
- Easier maintenance - changes in one place affect both
- Component size limit (Principle 3) - keeps EntityListView under 150 lines

**Alternatives Considered**:
- **Duplicate code**: Violates DRY, harder to maintain, higher risk of inconsistency
- **Separate components**: More files but better separation of concerns (could be future refactoring)
- **Conditional rendering in single component**: More complex but acceptable, keeps related code together

**Implementation Notes**:
```typescript
// Option 1: Helper function approach (simpler, keeps code together)
const renderTableRow = (entity: any, entityType: EntityType, config: EntityConfig | null) => {
  if (entityType === 'supplier') {
    return <SupplierTableRow entity={entity} config={config} onClick={handleEntitySelect} />;
  } else if (entityType === 'material') {
    return <MaterialTableRow entity={entity} config={config} onClick={handleEntitySelect} />;
  }
  // Fallback for other types
  return <DefaultTableRow entity={entity} onClick={handleEntitySelect} />;
};

// Option 2: Shared component with column config (more flexible)
<EntityTableRow 
  entity={entity}
  entityType={entityType}
  config={config}
  columns={getColumnsForEntityType(entityType)}
  onClick={handleEntitySelect}
/>
```

**Decision**: Use Option 1 (helper function with conditional rendering) for initial implementation, as it's simpler and keeps related code together. Can refactor to Option 2 later if needed.

---

## Summary

All research questions resolved. Key decisions:
1. Primary material: First item from supplyMaterials array
2. Counts display: Summary text format
3. Risk level: Text labels with semantic color backgrounds
4. Row click: onClick handler on tr element
5. Consistency: Shared rendering logic with conditional column configuration

All decisions align with project principles and requirements.





