# Data Model: 供应链对象数据对齐

**Feature**: 006-entity-data-alignment  
**Date**: 2024-12-19

## Overview

This feature ensures all supply chain entity configurations in `entityConfigs` Map align with data arrays in `mockData.ts`. The data model includes existing entities (Supplier, Material, Product, Order) and new data arrays (Factory, Warehouse, Logistics) that use EntityConfig.attributes structure directly.

## Entity Structures

### Factory (factoriesData array)

**Location**: `src/data/mockData.ts`  
**Structure**: Array of objects matching EntityConfig.attributes for factory entity type

```typescript
factoriesData: Array<{
  factoryCode: string;              // e.g., 'FAC-001'
  factoryName: string;              // e.g., '工厂1'
  location: string;                 // e.g., '地点1'
  productionLines: number;          // e.g., 3
  totalCapacity: number;            // e.g., 1000
  capacityUtilization: number;      // e.g., 75
  efficiency: number;               // e.g., 85
  employeeCount: number;           // e.g., 50
  productList: string[];           // Array of productIds, e.g., ['PROD-001', 'PROD-004']
  qualityPassRate: number;         // e.g., 98
  equipmentStatus: 'operational' | 'maintenance' | 'down';
  certifications: string[];        // e.g., ['ISO9001', 'ISO14001']
}>
```

**Quantity**: 3 records (FAC-001, FAC-002, FAC-003)  
**Data Source**: Derived from `productsData` - factories produce products  
**Relationships**: 
- Produces → Product (via productList array)
- Associated With → Warehouse (one-to-one)

---

### Warehouse (warehousesData array)

**Location**: `src/data/mockData.ts`  
**Structure**: Array of objects matching EntityConfig.attributes for warehouse entity type

```typescript
warehousesData: Array<{
  warehouseCode: string;            // e.g., 'WH-001'
  warehouseName: string;            // e.g., '仓库1'
  location: string;                 // e.g., '仓库地点1'
  capacity: number;                 // e.g., 5000
  currentStock: number;            // e.g., 2000
  associatedFactory: string;        // Factory ID, e.g., 'FAC-001'
  storageType: 'normal' | 'cold';  // Storage type
  temperatureControl: boolean;      // e.g., false
}>
```

**Quantity**: 3 records (WH-001, WH-002, WH-003)  
**Data Source**: Derived from factory data - warehouses are associated with factories  
**Relationships**: 
- Associated With → Factory (many-to-one, via associatedFactory)

---

### Logistics (logisticsData array)

**Location**: `src/data/mockData.ts`  
**Structure**: Array of objects matching EntityConfig.attributes for logistics entity type

```typescript
logisticsData: Array<{
  logisticsId: string;             // e.g., 'LOG-001'
  logisticsName: string;            // e.g., '物流1'
  carrier: string;                  // e.g., '承运商1'
  transportMode: 'road' | 'rail' | 'air' | 'sea';
  serviceRegion: string[];          // e.g., ['华东', '华南']
  trackingNumber: string;          // May be empty string
  estimatedDeliveryDate: string;   // May be empty string
}>
```

**Quantity**: 5 records (LOG-001 to LOG-005)  
**Data Source**: Derived from `ordersData` - logistics handle orders  
**Relationships**: 
- Handles → Order (one-to-many, calculated from order distribution)

---

### Customer (derived from ordersData.client)

**Location**: Derived from `ordersData` array in `mockData.ts`  
**Structure**: No separate data array - configurations derived from `ordersData.client` field

**Quantity**: Variable (based on unique client names in ordersData)  
**Data Source**: `ordersData.client` field  
**Relationships**: 
- Places → Order (one-to-many, via ordersData.client)

---

## Existing Entities (No Changes)

### Supplier (suppliersData array)
- Already aligned with entityConfigs
- Structure: `{ supplierId, supplierName, materialName, materialCode }`

### Material (materialsData + materialStocksData arrays)
- Already aligned with entityConfigs
- Structure: `{ materialCode, materialName, applicableProductIds }` + `{ materialCode, supplierId, remainingStock, purchaseTime, purchaseQuantity }`

### Product (productsData array)
- **Updated**: Extended with stockUnit field and expanded from 4 to 9 products
- **Location**: `src/data/mockData.ts`
- **Structure**: 
```typescript
productsData: Array<{
  productId: string;              // e.g., 'PROD-001'
  productName: string;             // e.g., '植保无人机T20'
  materialCodes: string[];         // Array of material codes, e.g., ['MAT-001', 'MAT-002']
  startSalesDate?: string;         // YYYY-MM-DD format, e.g., '2025-01-01'
  stopSalesDate?: string;          // YYYY-MM-DD format, optional
  stopExpansionDate?: string;      // YYYY-MM-DD format, optional
  stopServiceDate?: string;        // YYYY-MM-DD format, optional
  status?: '销售中' | '停止销售' | '停止扩容' | '停止服务';
  stockQuantity?: number;          // Random value 21-500
  stockUnit?: string;               // Value: "套"
}>
```

**Quantity**: 9 records (PROD-001 to PROD-009) - expanded from 4  
**Data Source**: `productsData` array in mockData.ts  
**Lifecycle Status Distribution**:
- 1 product: "停止销售" (with stopSalesDate)
- 1 product: "停止扩容" (with stopExpansionDate)
- 1 product: "停止服务" (with stopServiceDate)
- 6 products: "销售中" (with only startSalesDate)

**Stock Information**:
- All products have `stockUnit: "套"`
- All products have `stockQuantity` randomly generated between 21 and 500
- Display format: "{stockQuantity} {stockUnit}" (e.g., "50 套")

**New Products** (PROD-005 to PROD-009):
- Based on agricultural technology company context
- Examples: agricultural drones (variants), intelligent monitoring equipment, smart farm management systems, precision agriculture equipment, automated irrigation controllers
- Each product references existing materials (MAT-001 to MAT-008) in reasonable combinations

### Order (ordersData array)
- Already aligned with entityConfigs
- Structure: `{ orderId, orderName, client, productId, quantity, orderDate, dueDate, status }`

---

## Data Flow

### Creation Flow

1. **App Initialization** (`src/SupplyChainApp.tsx`):
   ```
   recreateAllMockDataRecords() 
   → recreateProductRecords() → updates productsData (4 to 9 products, adds stockUnit, lifecycle info)
   → recreateFactoryRecords() → creates factoriesData
   → recreateWarehouseRecords() → creates warehousesData  
   → recreateLogisticsRecords() → creates logisticsData
   → populateEntityConfigs() → reads from arrays and creates entityConfigs
   ```

2. **Product Data Update** (`recreateProductRecords()`):
   - Expand productsData from 4 to 9 products
   - Add stockUnit: "套" to all products
   - Generate stockQuantity randomly (21-500) for all products
   - Assign lifecycle information:
     - All products: startSalesDate
     - 1 product: stopSalesDate + status "停止销售"
     - 1 product: stopExpansionDate + status "停止扩容"
     - 1 product: stopServiceDate + status "停止服务"
     - 6 products: status "销售中"
   - Ensure new products (PROD-005 to PROD-009) have reasonable materialCodes

2. **Product Data Update** (`recreateProductRecords()`):
   - Expand productsData from 4 to 9 products
   - Add stockUnit: "套" to all products
   - Generate stockQuantity randomly (21-500) for all products
   - Assign lifecycle information:
     - All products: startSalesDate
     - 1 product: stopSalesDate + status "停止销售"
     - 1 product: stopExpansionDate + status "停止扩容"
     - 1 product: stopServiceDate + status "停止服务"
     - 6 products: status "销售中"
   - Ensure new products (PROD-005 to PROD-009) have reasonable materialCodes

3. **Factory Data Creation** (`recreateFactoryRecords()`):
   - Read `productsData` array (now 9 products)
   - Distribute products across 3 factories (modulo operation)
   - Generate factory attributes based on index and product assignments
   - Populate `factoriesData` array

3. **Warehouse Data Creation** (`recreateWarehouseRecords()`):
   - Read `factoriesData` array (created in step 2)
   - Create 3 warehouses, each associated with one factory
   - Generate warehouse attributes based on index and factory association
   - Populate `warehousesData` array

4. **Logistics Data Creation** (`recreateLogisticsRecords()`):
   - Read `ordersData` array
   - Distribute orders across 5 logistics (modulo operation)
   - Generate logistics attributes based on index and order assignments
   - Populate `logisticsData` array

### Population Flow

1. **EntityConfig Population** (`populateEntityConfigs()`):
   - Iterate over `factoriesData` array
   - Map each factory's attributes to EntityConfig.attributes
   - Calculate relations from factory.productList
   - Create EntityConfig entry in entityConfigs Map
   - Repeat for `warehousesData` and `logisticsData` arrays

### Synchronization Flow

**Bidirectional Sync**:
- Changes to `mockData.ts` arrays → reflected in `entityConfigs` Map (via `populateEntityConfigs()`)
- Changes to `entityConfigs` Map → reflected in `mockData.ts` arrays (via update functions in `entityConfigService.ts`)

---

## Validation Rules

1. **ID Matching**: All entity IDs in `entityConfigs` Map must match IDs in corresponding `mockData.ts` arrays (100% one-to-one correspondence)

2. **Attribute Completeness**: All attributes used in `populateEntityConfigs` must be present in data arrays (no missing attributes)

3. **Business Relationships**: 
   - Factory.productList must reference existing products in `productsData`
   - Warehouse.associatedFactory must reference existing factories in `factoriesData`
   - Logistics order assignments must reference existing orders in `ordersData`
   - Customer configurations must reference existing clients in `ordersData.client`

4. **Data Consistency**: 
   - No hardcoded values in `populateEntityConfigs` (0% hardcoded per success criteria)
   - All data must come from `mockData.ts` arrays

---

## Constraints

1. **No Separate Type Interfaces**: Factory, Warehouse, Logistics data arrays use EntityConfig.attributes structure directly (no separate type interfaces in database.ts or ontology.ts)

2. **Data Source**: All entity data must originate from `mockData.ts` arrays (single source of truth)

3. **Creation Order**: Data arrays must be created in correct order to maintain dependencies:
   - Supplier → Material → Product (existing)
   - Factory (depends on Product)
   - Warehouse (depends on Factory)
   - Order (depends on Product)
   - Customer (derived from Order)
   - Logistics (depends on Order)

4. **Bidirectional Sync**: Changes to arrays must reflect in entityConfigs, changes to entityConfigs must reflect in arrays



