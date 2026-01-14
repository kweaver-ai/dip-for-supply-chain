# Function Contracts: 供应链对象数据对齐

**Feature**: 006-entity-data-alignment  
**Date**: 2024-12-19

## Overview

This document defines the function contracts for data array creation and entity configuration population functions. All functions maintain bidirectional synchronization between `mockData.ts` arrays and `entityConfigs` Map.

## Function Contracts

### recreateProductRecords() (Updated)

**Location**: `src/data/mockData.ts`  
**Purpose**: Update productsData array - expand from 4 to 9 products, add stockUnit field, generate stockQuantity 21-500, assign lifecycle information

**Signature**:
```typescript
export const recreateProductRecords = (): void
```

**Preconditions**:
- `productsData` array exists and contains 4 products (PROD-001 to PROD-004)
- Existing materials (MAT-001 to MAT-008) are available for new products

**Postconditions**:
- `productsData` array contains exactly 9 product records (PROD-001 to PROD-009)
- All products have `stockUnit: "套"` field
- All products have `stockQuantity` randomly generated between 21 and 500
- All products have complete lifecycle information:
  - All products: `startSalesDate` defined
  - 1 product: `stopSalesDate` + `status: "停止销售"`
  - 1 product: `stopExpansionDate` + `status: "停止扩容"`
  - 1 product: `stopServiceDate` + `status: "停止服务"`
  - 6 products: `status: "销售中"`
- New products (PROD-005 to PROD-009) have reasonable materialCodes referencing existing materials

**Side Effects**:
- Expands `productsData` array from 4 to 9 products
- Updates all existing products with stockUnit and stockQuantity
- Assigns lifecycle information to all products

**Business Rules**:
- Product IDs: PROD-001 to PROD-009
- Stock unit: All products use "套"
- Stock quantity: Random integer between 21 and 500 (inclusive)
- New product names based on agricultural technology context:
  - PROD-005: Agricultural drone variant (e.g., "农业无人飞机T30")
  - PROD-006: Intelligent monitoring equipment (e.g., "智能监测系统")
  - PROD-007: Smart farm management system (e.g., "智慧农场管理平台")
  - PROD-008: Precision agriculture equipment (e.g., "精准农业设备")
  - PROD-009: Automated irrigation controller (e.g., "自动化灌溉控制器")
- Material codes: Each new product references 2-4 existing materials (MAT-001 to MAT-008)
- Lifecycle status distribution: Arbitrarily select 3 products for different stopped states, remaining 6 in "销售中"
- Lifecycle dates: stopSalesDate, stopExpansionDate, stopServiceDate must be after startSalesDate

---

### recreateFactoryRecords()

**Location**: `src/data/mockData.ts`  
**Purpose**: Create factoriesData array (3 records) by deriving data from productsData

**Signature**:
```typescript
export const recreateFactoryRecords = (): void
```

**Preconditions**:
- `productsData` array exists and contains 9 products (PROD-001 to PROD-009, after recreateProductRecords())
- `factoriesData` array exists (may be empty)

**Postconditions**:
- `factoriesData` array contains exactly 3 factory records (FAC-001, FAC-002, FAC-003)
- Each factory record contains all 12 attributes matching EntityConfig.attributes for factory
- Factory.productList contains productIds from productsData (distributed across factories)
- Factory attributes (location, productionLines, capacity, etc.) are generated based on index

**Side Effects**:
- Clears existing `factoriesData` array if it exists
- Populates `factoriesData` array with 3 factory records

**Business Rules**:
- Products distributed across factories using modulo operation: `productsData.filter((_, idx) => idx % 3 === index)` (now 9 products total)
- Factory 1 (index 0) must have at least one product (fallback to productsData[0] if empty)
- Each factory will now have 3 products on average (9 products / 3 factories)
- Factory names: `工厂${index + 1}`
- Factory locations: `地点${index + 1}`
- Production lines: `3 + index`
- Total capacity: `1000 + index * 100`
- Capacity utilization: `75 + index * 5`
- Efficiency: `85 + index`
- Employee count: `50 + index * 10`
- Quality pass rate: `98`
- Equipment status: `'operational'`
- Certifications: `['ISO9001', 'ISO14001']`

---

### recreateWarehouseRecords()

**Location**: `src/data/mockData.ts`  
**Purpose**: Create warehousesData array (3 records) by deriving data from factory data

**Signature**:
```typescript
export const recreateWarehouseRecords = (): void
```

**Preconditions**:
- `factoriesData` array exists and contains at least 1 factory (created by `recreateFactoryRecords()`)
- `warehousesData` array exists (may be empty)

**Postconditions**:
- `warehousesData` array contains exactly 3 warehouse records (WH-001, WH-002, WH-003)
- Each warehouse record contains all 8 attributes matching EntityConfig.attributes for warehouse
- Warehouse.associatedFactory references existing factory in factoriesData (one-to-one mapping)
- Warehouse attributes (capacity, currentStock, storageType) are generated based on index

**Side Effects**:
- Clears existing `warehousesData` array if it exists
- Populates `warehousesData` array with 3 warehouse records

**Business Rules**:
- One warehouse per factory: WH-001 → FAC-001, WH-002 → FAC-002, WH-003 → FAC-003
- Warehouse names: `仓库${index + 1}`
- Warehouse locations: `仓库地点${index + 1}`
- Capacity: `5000 + index * 1000`
- Current stock: `2000 + index * 500`
- Storage type: `index === 0 ? 'normal' : 'cold'`
- Temperature control: `index === 1`

---

### recreateLogisticsRecords()

**Location**: `src/data/mockData.ts`  
**Purpose**: Create logisticsData array (5 records) by deriving data from ordersData

**Signature**:
```typescript
export const recreateLogisticsRecords = (): void
```

**Preconditions**:
- `ordersData` array exists and contains at least 1 order
- `logisticsData` array exists (may be empty)

**Postconditions**:
- `logisticsData` array contains exactly 5 logistics records (LOG-001 to LOG-005)
- Each logistics record contains all 7 attributes matching EntityConfig.attributes for logistics
- Logistics order assignments are calculated from ordersData distribution (modulo operation)
- Logistics attributes (carrier, transportMode, serviceRegion) are generated based on index

**Side Effects**:
- Clears existing `logisticsData` array if it exists
- Populates `logisticsData` array with 5 logistics records

**Business Rules**:
- Orders distributed across logistics using modulo operation: `ordersData.filter((_, idx) => idx % 5 === index)`
- Logistics names: `物流${index + 1}`
- Carrier names: `承运商${index + 1}`
- Transport mode: `index === 0 ? 'road' : 'rail'`
- Service region: `['华东', '华南']`
- Tracking number: `''` (empty string)
- Estimated delivery date: `''` (empty string)

---

### populateEntityConfigs() (Updated)

**Location**: `src/utils/entityConfigService.ts`  
**Purpose**: Populate entityConfigs Map from mockData.ts data arrays (including factoriesData, warehousesData, logisticsData)

**Signature**:
```typescript
export const populateEntityConfigs = (): void
```

**Preconditions**:
- `factoriesData`, `warehousesData`, `logisticsData` arrays exist in mockData.ts (created by recreate functions)
- `suppliersData`, `materialsData`, `productsData`, `ordersData` arrays exist in mockData.ts
- `entityConfigs` Map exists (may contain existing entries)

**Postconditions**:
- `entityConfigs` Map contains EntityConfig entries for all entities in mockData.ts arrays
- Factory EntityConfig entries match factoriesData array (100% ID match, all attributes match)
- Warehouse EntityConfig entries match warehousesData array (100% ID match, all attributes match)
- Logistics EntityConfig entries match logisticsData array (100% ID match, all attributes match)
- No hardcoded values in factory/warehouse/logistics creation logic (0% hardcoded)

**Side Effects**:
- Clears existing `entityConfigs` Map entries
- Populates `entityConfigs` Map with EntityConfig entries for all entities

**Business Rules**:
- **Factory Population**:
  - Iterate over `factoriesData` array (not hardcoded factoryIds)
  - Map factory.attributes directly to EntityConfig.attributes
  - Calculate relations from factory.productList (Produces → Product)
  - Create EntityConfig entry: `entityConfigs.set(\`factory-\${factory.factoryCode}\`, config)`

- **Warehouse Population**:
  - Iterate over `warehousesData` array (not hardcoded warehouseIds)
  - Map warehouse.attributes directly to EntityConfig.attributes
  - Calculate relations from warehouse.associatedFactory (Associated With → Factory)
  - Create EntityConfig entry: `entityConfigs.set(\`warehouse-\${warehouse.warehouseCode}\`, config)`

- **Logistics Population**:
  - Iterate over `logisticsData` array (not hardcoded logisticsIds)
  - Map logistics.attributes directly to EntityConfig.attributes
  - Calculate relations from order distribution (Handles → Order)
  - Create EntityConfig entry: `entityConfigs.set(\`logistics-\${logistics.logisticsId}\`, config)`

- **Customer Population** (unchanged):
  - Derive from `ordersData.client` field
  - Create EntityConfig entries for unique customer names

**Changes from Current Implementation**:
- **Before**: Hardcoded factoryIds, warehouseIds, logisticsIds arrays with forEach loops generating attributes
- **After**: Iterate over factoriesData, warehousesData, logisticsData arrays, map attributes directly

---

## Error Handling

All functions should handle edge cases:

1. **Empty Data Arrays**: If source array is empty, create minimum viable records (e.g., at least 1 factory, 1 warehouse, 1 logistics)

2. **Missing Attributes**: If required attribute is missing in source data, use default value from `getDefaultAttributes()`

3. **Invalid References**: If referenced entity doesn't exist (e.g., factory.productList references non-existent product), skip invalid reference or use fallback

4. **Array Length Mismatch**: If expected array length doesn't match (e.g., factoriesData.length !== 3), log warning but continue with available data

---

## Testing Contracts

### Unit Tests

Each function should have unit tests verifying:
- Correct array length after execution
- All required attributes present in each record
- Business relationships maintained (e.g., factory.productList references existing products)
- No hardcoded values in populateEntityConfigs

### Integration Tests

Integration tests should verify:
- Data flow from recreate functions → populateEntityConfigs → entityConfigs Map
- Bidirectional synchronization (changes to arrays reflect in entityConfigs)
- ID matching (100% match between arrays and entityConfigs)

---

## Performance Contracts

- `recreateFactoryRecords()`: Should complete in < 10ms for 3 factories
- `recreateWarehouseRecords()`: Should complete in < 10ms for 3 warehouses
- `recreateLogisticsRecords()`: Should complete in < 10ms for 5 logistics
- `populateEntityConfigs()`: Should complete in < 100ms for all entities (supplier, material, product, order, factory, warehouse, logistics, customer)

---

## UI Component Update Contracts

### EntityListPage (Product List Display)

**Location**: `src/components/config-backend/EntityListPage.tsx`  
**Purpose**: Display product list with stockUnit and lifecycle information

**Updates Required**:
- Display stockQuantity with stockUnit in product list table (format: "{stockQuantity} {stockUnit}", e.g., "50 套")
- Display lifecycle status in product list (status field)
- Display lifecycle dates in product detail view (startSalesDate, stopSalesDate, stopExpansionDate, stopServiceDate)

### RightPanel (Product Detail Panel)

**Location**: `src/components/config-backend/RightPanel.tsx`  
**Purpose**: Display product details with stockUnit and lifecycle information

**Updates Required**:
- Display stockQuantity with stockUnit in product detail view (format: "{stockQuantity} {stockUnit}")
- Display all lifecycle dates (startSalesDate, stopSalesDate, stopExpansionDate, stopServiceDate)
- Display lifecycle status prominently

### ProductInventoryPanel (Cockpit Product Inventory)

**Location**: `src/components/cockpit/ProductInventoryPanel.tsx`  
**Purpose**: Display product inventory metrics with stockUnit

**Updates Required**:
- Display stockQuantity with stockUnit in inventory metrics (format: "{stockQuantity} {stockUnit}")
- Update inventory calculations to account for stockUnit

### SupplyChainGraphPanel (Supply Chain Graph)

**Location**: `src/components/cockpit/SupplyChainGraphPanel.tsx` or `src/services/dataService.ts`  
**Purpose**: Include product stockUnit in graph node information

**Updates Required**:
- Update `buildGraphData()` function to include stockUnit in product graph nodes
- Display stockUnit in product node tooltips/info (format: "{stockQuantity} {stockUnit}")

### ProductSupplyOptimizationPage (Product Supply Optimization)

**Location**: `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`  
**Purpose**: Display product supply analysis with stockUnit

**Updates Required**:
- Display stockQuantity with stockUnit in product supply analysis
- Update optimization suggestions to include stockUnit

---

## Dependencies

- `recreateProductRecords()` must be called before `recreateFactoryRecords()` (factories depend on products)
- `factoriesData` depends on `productsData` (now 9 products)
- `warehousesData` depends on `factoriesData`
- `logisticsData` depends on `ordersData`
- `populateEntityConfigs()` depends on all data arrays (factoriesData, warehousesData, logisticsData, suppliersData, materialsData, productsData, ordersData)
- All UI components displaying product data depend on updated productsData with stockUnit and lifecycle information



