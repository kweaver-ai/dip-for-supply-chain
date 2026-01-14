# API Contracts: 供应链大脑配置后台

**Feature**: Supply Chain Configuration Backend  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This document defines the service layer contracts for the Supply Chain Configuration Backend. Since this is a frontend-only application using in-memory mock data, these contracts represent TypeScript function signatures for the service layer (`entityConfigService.ts`).

## Entity CRUD Operations

### getEntitiesByType

**Purpose**: Retrieve all entities of a specific type.

**Signature**:
```typescript
function getEntitiesByType(type: EntityType): Entity[]
```

**Parameters**:
- `type: EntityType` - Entity type to retrieve

**Returns**: Array of entities of the specified type

**Example**:
```typescript
const products = getEntitiesByType('product');
// Returns: Product[] from mockData.ts
```

**Error Handling**: Returns empty array if no entities found

---

### getEntityById

**Purpose**: Retrieve a specific entity by ID.

**Signature**:
```typescript
function getEntityById(type: EntityType, id: string): Entity | null
```

**Parameters**:
- `type: EntityType` - Entity type
- `id: string` - Entity ID

**Returns**: Entity object or null if not found

**Example**:
```typescript
const product = getEntityById('product', 'PRD-T20');
// Returns: Product object or null
```

**Error Handling**: Returns null if entity not found

---

### createEntity

**Purpose**: Create a new entity.

**Signature**:
```typescript
function createEntity(type: EntityType, data: Partial<Entity>): Entity
```

**Parameters**:
- `type: EntityType` - Entity type
- `data: Partial<Entity>` - Entity data (partial, required fields validated)

**Returns**: Created entity object

**Example**:
```typescript
const newProduct = createEntity('product', {
  productId: 'PRD-T50',
  productName: 'T50 旗舰植保机',
  materialCodes: ['MAT-001', 'MAT-002'],
});
// Returns: Created Product object
```

**Error Handling**: Throws error if required fields missing or ID already exists

**Validation**:
- Required fields must be present
- Entity ID must be unique within type
- Data must conform to Entity type schema

---

### updateEntity

**Purpose**: Update an existing entity.

**Signature**:
```typescript
function updateEntity(type: EntityType, id: string, data: Partial<Entity>): Entity
```

**Parameters**:
- `type: EntityType` - Entity type
- `id: string` - Entity ID
- `data: Partial<Entity>` - Updated entity data

**Returns**: Updated entity object

**Example**:
```typescript
const updatedProduct = updateEntity('product', 'PRD-T20', {
  productName: 'T20 植保无人机 (升级版)',
});
// Returns: Updated Product object
```

**Error Handling**: Throws error if entity not found

**Validation**:
- Entity must exist
- Updated data must conform to Entity type schema

---

### deleteEntity

**Purpose**: Delete an entity.

**Signature**:
```typescript
function deleteEntity(type: EntityType, id: string): boolean
```

**Parameters**:
- `type: EntityType` - Entity type
- `id: string` - Entity ID

**Returns**: true if deleted successfully, false otherwise

**Example**:
```typescript
const deleted = deleteEntity('product', 'PRD-T20');
// Returns: true if deleted, false if not found
```

**Error Handling**: Returns false if entity not found

**Validation**:
- Entity must exist
- Should warn if entity has existing relations (UI-level validation)

---

## Entity Configuration Operations

### getEntityConfig

**Purpose**: Retrieve entity configuration metadata.

**Signature**:
```typescript
function getEntityConfig(entityType: EntityType, entityId: string): EntityConfig | null
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID

**Returns**: EntityConfig object or null if not found

**Example**:
```typescript
const config = getEntityConfig('product', 'PRD-T20');
// Returns: EntityConfig object with relations, logicRules, actions, permissions
```

**Error Handling**: Returns null if configuration not found

---

### updateEntityConfig

**Purpose**: Update entity configuration metadata.

**Signature**:
```typescript
function updateEntityConfig(
  entityType: EntityType,
  entityId: string,
  config: Partial<EntityConfig>
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `config: Partial<EntityConfig>` - Updated configuration data

**Returns**: Updated EntityConfig object

**Example**:
```typescript
const updatedConfig = updateEntityConfig('product', 'PRD-T20', {
  logicRules: [
    ...existingRules,
    { ruleId: '4', ruleType: 'validation', name: '新规则', condition: 'stock < 50', level: 'critical' },
  ],
});
// Returns: Updated EntityConfig object
```

**Error Handling**: Throws error if entity not found

**Validation**:
- Entity must exist
- Configuration data must conform to EntityConfig schema

---

### addBusinessLogicRule

**Purpose**: Add a business logic rule to an entity configuration.

**Signature**:
```typescript
function addBusinessLogicRule(
  entityType: EntityType,
  entityId: string,
  rule: BusinessLogicRule
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `rule: BusinessLogicRule` - Business logic rule to add

**Returns**: Updated EntityConfig object

**Example**:
```typescript
const updatedConfig = addBusinessLogicRule('product', 'PRD-T20', {
  ruleId: '4',
  ruleType: 'validation',
  name: '库存预警',
  condition: 'stock < 100',
  level: 'warning',
});
// Returns: Updated EntityConfig with new rule added
```

**Error Handling**: Throws error if entity not found

**Validation**:
- Rule must conform to BusinessLogicRule schema
- Rule ID must be unique within entity configuration

---

### removeBusinessLogicRule

**Purpose**: Remove a business logic rule from an entity configuration.

**Signature**:
```typescript
function removeBusinessLogicRule(
  entityType: EntityType,
  entityId: string,
  ruleId: string
): EntityConfig
```

**Parameters**:
- `entityType: EntityType` - Entity type
- `entityId: string` - Entity ID
- `ruleId: string` - Rule ID to remove

**Returns**: Updated EntityConfig object

**Example**:
```typescript
const updatedConfig = removeBusinessLogicRule('product', 'PRD-T20', '1');
// Returns: Updated EntityConfig with rule removed
```

**Error Handling**: Throws error if entity or rule not found

---

## User Management Operations

### getUsers

**Purpose**: Retrieve all users.

**Signature**:
```typescript
function getUsers(): User[]
```

**Returns**: Array of all users

**Example**:
```typescript
const users = getUsers();
// Returns: User[] from mockData.ts
```

---

### getUserById

**Purpose**: Retrieve a user by ID.

**Signature**:
```typescript
function getUserById(userId: number): User | null
```

**Parameters**:
- `userId: number` - User ID

**Returns**: User object or null if not found

**Example**:
```typescript
const user = getUserById(1);
// Returns: User object or null
```

**Error Handling**: Returns null if user not found

---

### createUser

**Purpose**: Create a new user.

**Signature**:
```typescript
function createUser(data: Partial<User>): User
```

**Parameters**:
- `data: Partial<User>` - User data (partial, required fields validated)

**Returns**: Created user object

**Example**:
```typescript
const newUser = createUser({
  name: '赵明',
  role: 'procurement',
  email: 'zhao.ming@company.com',
  phone: '138-0000-0006',
  avatar: '👨‍💼',
  department: '采购部',
  status: 'active',
});
// Returns: Created User object with auto-generated userId
```

**Error Handling**: Throws error if required fields missing or email already exists

**Validation**:
- Required fields: name, role, email, department, status
- Email must be unique
- Role must be valid role ID

---

### updateUser

**Purpose**: Update an existing user.

**Signature**:
```typescript
function updateUser(userId: number, data: Partial<User>): User
```

**Parameters**:
- `userId: number` - User ID
- `data: Partial<User>` - Updated user data

**Returns**: Updated user object

**Example**:
```typescript
const updatedUser = updateUser(1, {
  department: '供应链中心 (升级)',
  status: 'active',
});
// Returns: Updated User object
```

**Error Handling**: Throws error if user not found

---

### deleteUser

**Purpose**: Delete a user.

**Signature**:
```typescript
function deleteUser(userId: number): boolean
```

**Parameters**:
- `userId: number` - User ID

**Returns**: true if deleted successfully, false otherwise

**Example**:
```typescript
const deleted = deleteUser(5);
// Returns: true if deleted, false if not found
```

**Error Handling**: Returns false if user not found

---

## Role Management Operations

### getRoles

**Purpose**: Retrieve all predefined roles.

**Signature**:
```typescript
function getRoles(): Role[]
```

**Returns**: Array of all roles

**Example**:
```typescript
const roles = getRoles();
// Returns: Role[] from mockData.ts
```

---

### getRoleById

**Purpose**: Retrieve a role by ID.

**Signature**:
```typescript
function getRoleById(roleId: string): Role | null
```

**Parameters**:
- `roleId: string` - Role ID

**Returns**: Role object or null if not found

**Example**:
```typescript
const role = getRoleById('admin');
// Returns: Role object or null
```

**Error Handling**: Returns null if role not found

---

## Knowledge Graph Operations

### getKnowledgeGraphData

**Purpose**: Retrieve data for knowledge graph visualization.

**Signature**:
```typescript
function getKnowledgeGraphData(): {
  nodes: Array<{ type: EntityType; count: number; name: string }>;
  edges: Array<{ source: EntityType; target: EntityType; relationType: string }>;
}
```

**Returns**: Object with nodes and edges for graph visualization

**Example**:
```typescript
const graphData = getKnowledgeGraphData();
// Returns: { nodes: [...], edges: [...] }
```

**Data Source**: Aggregates entity counts from mockData.ts and relations from entityConfigs

---

## AI Assistant Operations

### generateBusinessRule

**Purpose**: Generate a business logic rule from natural language input.

**Signature**:
```typescript
function generateBusinessRule(input: string, entityType: EntityType): BusinessLogicRule | null
```

**Parameters**:
- `input: string` - Natural language input (e.g., "库存低于100时预警")
- `entityType: EntityType` - Entity type context

**Returns**: Generated BusinessLogicRule object or null if pattern not matched

**Example**:
```typescript
const rule = generateBusinessRule('库存低于100时预警', 'product');
// Returns: { ruleId: '...', ruleType: 'validation', name: '库存预警', condition: 'stock < 100', level: 'warning' }
```

**Error Handling**: Returns null if pattern not matched

**Pattern Matching**:
- Keywords: "库存", "预警" → validation rule
- Keywords: "ROI", "计算" → calculation rule
- Keywords: "生命周期", "衰退" → trigger rule

---

## Service Layer Structure

**File**: `src/utils/entityConfigService.ts`

**Exports**:
```typescript
// Entity CRUD
export { getEntitiesByType, getEntityById, createEntity, updateEntity, deleteEntity };

// Entity Configuration
export { getEntityConfig, updateEntityConfig, addBusinessLogicRule, removeBusinessLogicRule };

// User Management
export { getUsers, getUserById, createUser, updateUser, deleteUser };

// Role Management
export { getRoles, getRoleById };

// Knowledge Graph
export { getKnowledgeGraphData };

// AI Assistant
export { generateBusinessRule };
```

---

## Error Types

**Custom Error Types** (optional, can use standard Error):

```typescript
class EntityNotFoundError extends Error {
  constructor(entityType: EntityType, entityId: string) {
    super(`Entity ${entityType}:${entityId} not found`);
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

class DuplicateEntityError extends Error {
  constructor(entityType: EntityType, entityId: string) {
    super(`Entity ${entityType}:${entityId} already exists`);
  }
}
```

---

## Implementation Notes

1. **In-Memory Storage**: All operations modify `mockData.ts` data structures directly
2. **No Persistence**: Changes are lost on page refresh (by design for mock data)
3. **Type Safety**: All functions use TypeScript types from `ontology.ts`
4. **Error Handling**: Functions should throw errors or return null/false for error cases
5. **Validation**: Input validation should be performed before data modification
6. **Idempotency**: Update operations should be idempotent (can be called multiple times safely)





