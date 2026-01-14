# API Contracts: 供应链对象属性配置

**Feature**: Supply Chain Entity Attributes Configuration  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This document defines the service layer contracts for populating and managing entity configurations with complete attribute, relation, logic, action, and permission definitions. Since this is a frontend-only application using in-memory mock data, these contracts represent TypeScript function signatures for the service layer (`entityConfigService.ts`).

## Entity Configuration Population

### populateEntityConfigs

**Purpose**: Populate entityConfigs Map with complete configurations for all entities matching frontend data by ID.

**Signature**:
```typescript
function populateEntityConfigs(): void
```

**Parameters**: None

**Returns**: void

**Process**:
1. Iterate through all frontend entity arrays (suppliersData, materialsData, productsData, ordersData, etc.)
2. For each entity, create/update entityConfigs entry with:
   - Complete attributes from FR-009 (extracted from entity data + business domain knowledge)
   - Calculated relations from FR-010 (based on frontend data relationships)
   - Predefined logic rules from FR-011 (templates instantiated per entity)
   - Predefined actions from FR-012 (templates with name, icon, color, description)
   - Default permissions from FR-013 (based on entity type and role scope)

**Example**:
```typescript
populateEntityConfigs();
// Populates entityConfigs Map with all entity configurations
```

**Error Handling**: Logs warnings for missing frontend data, uses defaults for missing attributes

---

## Entity Attribute Operations

### getEntityAttributes

**Purpose**: Get entity attributes for a specific entity.

**Signature**:
```typescript
function getEntityAttributes(entityType: EntityType, entityId: string): Record<string, any>
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: Entity attributes object

**Example**:
```typescript
const attributes = getEntityAttributes('factory', 'FAC-001');
// Returns: { factoryCode: 'FAC-001', factoryName: '工厂A', location: '...', ... }
```

**Error Handling**: Returns empty object if entity config not found

---

### updateEntityAttributes

**Purpose**: Update entity attributes with bidirectional synchronization.

**Signature**:
```typescript
function updateEntityAttributes(
  entityType: EntityType,
  entityId: string,
  attributes: Partial<Record<string, any>>
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `attributes: Partial<Record<string, any>>` - Attributes to update

**Returns**: Updated EntityConfig

**Bidirectional Sync**: Updates both entityConfigs Map and frontend entity data

**Example**:
```typescript
const updated = updateEntityAttributes('factory', 'FAC-001', {
  capacityUtilization: 85,
  efficiency: 92
});
// Updates both config and frontend factory data
```

**Error Handling**: Throws error if entity config not found

---

## Entity Relation Operations

### getEntityRelations

**Purpose**: Get entity relations for a specific entity.

**Signature**:
```typescript
function getEntityRelations(entityType: EntityType, entityId: string): EntityRelation[]
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: Array of entity relations

**Example**:
```typescript
const relations = getEntityRelations('factory', 'FAC-001');
// Returns: [
//   { targetType: 'product', relationType: '一对多', count: 5, sampleItems: ['PROD-001', 'PROD-002'] },
//   { targetType: 'material', relationType: '多对多', count: 10, sampleItems: ['MAT-001', 'MAT-002'] },
//   ...
// ]
```

**Error Handling**: Returns empty array if entity config not found

---

### addEntityRelation

**Purpose**: Add a new relation to an entity configuration.

**Signature**:
```typescript
function addEntityRelation(
  entityType: EntityType,
  entityId: string,
  relation: EntityRelation
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `relation: EntityRelation` - Relation to add

**Returns**: Updated EntityConfig

**Example**:
```typescript
const updated = addEntityRelation('factory', 'FAC-001', {
  targetType: 'warehouse',
  relationType: '一对多',
  count: 2,
  sampleItems: ['WH-001', 'WH-002']
});
```

**Error Handling**: Throws error if entity config not found

---

## Entity Logic Rule Operations

### getEntityLogicRules

**Purpose**: Get business logic rules for a specific entity.

**Signature**:
```typescript
function getEntityLogicRules(entityType: EntityType, entityId: string): BusinessLogicRule[]
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: Array of business logic rules

**Example**:
```typescript
const rules = getEntityLogicRules('material', 'MAT-001');
// Returns: [
//   { ruleId: 'rule-1', ruleType: 'validation', name: '库存预警', condition: 'currentStock < safetyStock', ... },
//   { ruleId: 'rule-2', ruleType: 'calculation', name: '采购建议计算', formula: 'safetyStock * 2 - currentStock', ... },
//   ...
// ]
```

**Error Handling**: Returns empty array if entity config not found

---

### addEntityLogicRule

**Purpose**: Add a business logic rule to an entity configuration.

**Signature**:
```typescript
function addEntityLogicRule(
  entityType: EntityType,
  entityId: string,
  rule: BusinessLogicRule
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `rule: BusinessLogicRule` - Rule to add

**Returns**: Updated EntityConfig

**Example**:
```typescript
const updated = addEntityLogicRule('product', 'PROD-001', {
  ruleId: 'rule-3',
  ruleType: 'validation',
  name: '库存预警',
  condition: 'currentInventory < safetyStock',
  level: 'warning'
});
```

**Error Handling**: Throws error if entity config not found

---

## Entity Action Operations

### getEntityActions

**Purpose**: Get entity actions for a specific entity type.

**Signature**:
```typescript
function getEntityActions(entityType: EntityType, entityId: string): EntityAction[]
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: Array of entity actions

**Example**:
```typescript
const actions = getEntityActions('factory', 'FAC-001');
// Returns: [
//   { actionId: 'action-1', name: '排产计划', icon: 'Calendar', color: 'blue', description: '...' },
//   { actionId: 'action-2', name: '产能调整', icon: 'Settings', color: 'indigo', description: '...' },
//   ...
// ]
```

**Error Handling**: Returns empty array if entity config not found

---

### addEntityAction

**Purpose**: Add an action to an entity configuration.

**Signature**:
```typescript
function addEntityAction(
  entityType: EntityType,
  entityId: string,
  action: EntityAction
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `action: EntityAction` - Action to add

**Returns**: Updated EntityConfig

**Example**:
```typescript
const updated = addEntityAction('factory', 'FAC-001', {
  actionId: 'action-7',
  name: '设备升级',
  icon: 'Upgrade',
  color: 'purple',
  description: 'Upgrade factory equipment'
});
```

**Error Handling**: Throws error if entity config not found

---

## Entity Permission Operations

### getEntityPermissions

**Purpose**: Get permission configuration for a specific entity.

**Signature**:
```typescript
function getEntityPermissions(entityType: EntityType, entityId: string): PermissionConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: Permission configuration

**Example**:
```typescript
const permissions = getEntityPermissions('factory', 'FAC-001');
// Returns: { roles: ['admin', 'production'], users: [1, 3] }
```

**Error Handling**: Returns default permissions if entity config not found

---

### updateEntityPermissions

**Purpose**: Update permission configuration for an entity.

**Signature**:
```typescript
function updateEntityPermissions(
  entityType: EntityType,
  entityId: string,
  permissions: Partial<PermissionConfig>
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `permissions: Partial<PermissionConfig>` - Permissions to update

**Returns**: Updated EntityConfig

**Example**:
```typescript
const updated = updateEntityPermissions('factory', 'FAC-001', {
  roles: ['admin', 'production', 'product'],
  users: [1, 3, 4]
});
```

**Error Handling**: Throws error if entity config not found

---

## Helper Functions

### getDefaultAttributes

**Purpose**: Get default attributes for an entity type based on FR-009.

**Signature**:
```typescript
function getDefaultAttributes(entityType: EntityType): Record<string, any>
```

**Parameters**:
- `entityType: EntityType` - Entity type

**Returns**: Default attributes object

**Example**:
```typescript
const defaults = getDefaultAttributes('factory');
// Returns default factory attributes with empty/default values
```

---

### getDefaultRelations

**Purpose**: Get default relations for an entity type based on FR-010.

**Signature**:
```typescript
function getDefaultRelations(entityType: EntityType): EntityRelation[]
```

**Parameters**:
- `entityType: EntityType` - Entity type

**Returns**: Array of default relations

**Example**:
```typescript
const relations = getDefaultRelations('factory');
// Returns default factory relations templates
```

---

### getDefaultLogicRules

**Purpose**: Get default logic rules for an entity type based on FR-011.

**Signature**:
```typescript
function getDefaultLogicRules(entityType: EntityType): BusinessLogicRule[]
```

**Parameters**:
- `entityType: EntityType` - Entity type

**Returns**: Array of default logic rules

**Example**:
```typescript
const rules = getDefaultLogicRules('factory');
// Returns default factory logic rules templates
```

---

### getDefaultActions

**Purpose**: Get default actions for an entity type based on FR-012.

**Signature**:
```typescript
function getDefaultActions(entityType: EntityType): EntityAction[]
```

**Parameters**:
- `entityType: EntityType` - Entity type

**Returns**: Array of default actions

**Example**:
```typescript
const actions = getDefaultActions('factory');
// Returns default factory actions templates
```

---

### getDefaultPermissions

**Purpose**: Get default permissions for an entity type based on FR-013.

**Signature**:
```typescript
function getDefaultPermissions(entityType: EntityType): PermissionConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type

**Returns**: Default permission configuration

**Example**:
```typescript
const permissions = getDefaultPermissions('factory');
// Returns: { roles: ['admin', 'production'], users: [] }
```

---

## Summary

Service layer contracts for:
- Entity configuration population
- Attribute operations (get, update)
- Relation operations (get, add)
- Logic rule operations (get, add)
- Action operations (get, add)
- Permission operations (get, update)
- Helper functions for defaults

All operations support bidirectional synchronization with frontend data.





