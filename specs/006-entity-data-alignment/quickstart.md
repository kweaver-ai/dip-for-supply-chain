# Quickstart Guide: 供应链对象数据对齐

**Feature**: 006-entity-data-alignment  
**Date**: 2024-12-19

## For Developers

### Prerequisites

- TypeScript 5.9.3+
- Node.js 18+
- Access to `src/data/mockData.ts` and `src/utils/entityConfigService.ts`

### Implementation Steps

#### Step 0: Update Product Type in ontology.ts

In `src/types/ontology.ts`, add `stockUnit` field to Product interface:

```typescript
export interface Product {
  productId: string;
  productName: string;
  materialCodes: string[];
  startSalesDate?: string;
  stopSalesDate?: string;
  stopExpansionDate?: string;
  stopServiceDate?: string;
  status?: '销售中' | '停止销售' | '停止扩容' | '停止服务';
  stockQuantity?: number;
  stockUnit?: string;  // Add this field
}
```

#### Step 1: Update recreateProductRecords()

Update `recreateProductRecords()` function in `src/data/mockData.ts` to:
- Expand productsData from 4 to 9 products
- Add stockUnit: "套" to all products
- Generate stockQuantity randomly (21-500) for all products
- Assign lifecycle information (1 "停止销售", 1 "停止扩容", 1 "停止服务", 6 "销售中")

```typescript
const recreateProductRecords = (): void => {
  // Keep existing 4 products, update them with stockUnit and stockQuantity
  productsData.forEach(product => {
    product.stockUnit = '套';
    product.stockQuantity = Math.floor(Math.random() * 480) + 21; // 21-500
  });
  
  // Add 5 new products (PROD-005 to PROD-009)
  const newProducts = [
    {
      productId: 'PROD-005',
      productName: '农业无人飞机T30',
      materialCodes: ['MAT-001', 'MAT-002', 'MAT-004'],
      startSalesDate: '2025-02-01',
      stockUnit: '套',
      stockQuantity: Math.floor(Math.random() * 480) + 21,
      status: '销售中' as const,
    },
    // ... add 4 more products
  ];
  
  productsData.push(...newProducts);
  
  // Assign lifecycle statuses: arbitrarily select 3 products for stopped states
  // Example: PROD-001 -> 停止扩容, PROD-005 -> 停止销售, PROD-009 -> 停止服务
};
```

#### Step 2: Add Data Array Declarations

In `src/data/mockData.ts`, add export declarations for new data arrays:

```typescript
// After existing data array declarations
export let factoriesData: Array<Record<string, any>> = [];
export let warehousesData: Array<Record<string, any>> = [];
export let logisticsData: Array<Record<string, any>> = [];
```

#### Step 2: Implement recreateFactoryRecords()

Update `recreateFactoryRecords()` function in `src/data/mockData.ts`:

```typescript
export const recreateFactoryRecords = (): void => {
  factoriesData.length = 0; // Clear existing
  
  const factoryIds = ['FAC-001', 'FAC-002', 'FAC-003'];
  factoryIds.forEach((factoryId, index) => {
    // Distribute products across factories
    const productIds = productsData
      .filter((_, idx) => idx % 3 === index)
      .map(p => p.productId);
    
    if (productIds.length === 0 && index === 0) {
      productIds.push(productsData[0]?.productId || 'PROD-001');
    }
    
    factoriesData.push({
      factoryCode: factoryId,
      factoryName: `工厂${index + 1}`,
      location: `地点${index + 1}`,
      productionLines: 3 + index,
      totalCapacity: 1000 + index * 100,
      capacityUtilization: 75 + index * 5,
      efficiency: 85 + index,
      employeeCount: 50 + index * 10,
      productList: productIds,
      qualityPassRate: 98,
      equipmentStatus: 'operational' as const,
      certifications: ['ISO9001', 'ISO14001'],
    });
  });
};
```

#### Step 3: Implement recreateWarehouseRecords()

Update `recreateWarehouseRecords()` function in `src/data/mockData.ts`:

```typescript
export const recreateWarehouseRecords = (): void => {
  warehousesData.length = 0; // Clear existing
  
  const warehouseIds = ['WH-001', 'WH-002', 'WH-003'];
  const factoryIds = factoriesData.map(f => f.factoryCode);
  
  warehouseIds.forEach((warehouseId, index) => {
    warehousesData.push({
      warehouseCode: warehouseId,
      warehouseName: `仓库${index + 1}`,
      location: `仓库地点${index + 1}`,
      capacity: 5000 + index * 1000,
      currentStock: 2000 + index * 500,
      associatedFactory: factoryIds[index] || 'FAC-001',
      storageType: index === 0 ? 'normal' as const : 'cold' as const,
      temperatureControl: index === 1,
    });
  });
};
```

#### Step 4: Implement recreateLogisticsRecords()

Update `recreateLogisticsRecords()` function in `src/data/mockData.ts`:

```typescript
export const recreateLogisticsRecords = (): void => {
  logisticsData.length = 0; // Clear existing
  
  const logisticsIds = ['LOG-001', 'LOG-002', 'LOG-003', 'LOG-004', 'LOG-005'];
  
  logisticsIds.forEach((logisticsId, index) => {
    // Distribute orders across logistics
    const orderIds = ordersData
      .filter((_, idx) => idx % 5 === index)
      .map(o => o.orderId);
    
    logisticsData.push({
      logisticsId: logisticsId,
      logisticsName: `物流${index + 1}`,
      carrier: `承运商${index + 1}`,
      transportMode: index === 0 ? 'road' as const : 'rail' as const,
      serviceRegion: ['华东', '华南'],
      trackingNumber: '',
      estimatedDeliveryDate: '',
    });
  });
};
```

#### Step 5: Update populateEntityConfigs()

In `src/utils/entityConfigService.ts`, update `populateEntityConfigs()` function:

**Before** (hardcoded):
```typescript
// Create Factory configs (3 records: FAC-001 to FAC-003)
const factoryIds = ['FAC-001', 'FAC-002', 'FAC-003'];
factoryIds.forEach((factoryId, index) => {
  // ... hardcoded attribute generation
});
```

**After** (read from array):
```typescript
// Populate Factory configs from factoriesData
factoriesData.forEach(factory => {
  const key = `factory-${factory.factoryCode}`;
  
  const attributes = {
    ...getDefaultAttributes('factory'),
    ...factory, // Map all attributes directly
  };
  
  const relations: EntityRelation[] = [
    {
      targetType: 'product',
      relationType: '一对多',
      count: factory.productList.length,
      sampleItems: factory.productList.slice(0, 3),
    },
  ];
  
  const config: EntityConfig = {
    entityId: factory.factoryCode,
    entityType: 'factory',
    attributes,
    relations,
    logicRules: getDefaultLogicRules('factory'),
    actions: getDefaultActions('factory'),
    permissions: getDefaultPermissions('factory'),
  };
  
  entityConfigs.set(key, config);
});
```

Repeat similar pattern for Warehouse and Logistics.

#### Step 6: Update Imports

In `src/utils/entityConfigService.ts`, add imports for new data arrays:

```typescript
import { 
  suppliersData, 
  materialsData, 
  productsData, 
  ordersData,
  materialStocksData,
  supplierEvaluationsData,
  factoriesData,      // Add this
  warehousesData,     // Add this
  logisticsData       // Add this
} from '../data/mockData';
```

#### Step 7: Update UI Components

Update all UI components that display product data to show stockUnit and lifecycle information:

**EntityListPage.tsx**:
```typescript
// In product list table
<td>{product.stockQuantity} {product.stockUnit || '套'}</td>
<td>{product.status || '销售中'}</td>
```

**RightPanel.tsx**:
```typescript
// In product detail view
<div>库存数量: {product.stockQuantity} {product.stockUnit || '套'}</div>
<div>生命周期状态: {product.status || '销售中'}</div>
<div>开始销售时间: {product.startSalesDate}</div>
{product.stopSalesDate && <div>停止销售时间: {product.stopSalesDate}</div>}
// ... other lifecycle dates
```

**dataService.ts buildGraphData()**:
```typescript
const products: GraphNode[] = productsData.map(product => ({
  id: product.productId,
  name: product.productName,
  type: 'PRODUCT',
  bom: product.materialCodes,
  stock: product.stockQuantity,
  stockUnit: product.stockUnit || '套',  // Add this
  status: product.status,  // Add this
}));
```

#### Step 8: Verify Data Flow

Ensure `recreateAllMockDataRecords()` calls recreate functions in correct order:

```typescript
export const recreateAllMockDataRecords = (): void => {
  recreateSupplierRecords();
  recreateMaterialRecords();
  recreateProductRecords();      // Updated: expands to 9 products, adds stockUnit
  recreateFactoryRecords();      // Depends on productsData (now 9 products)
  recreateWarehouseRecords();    // Depends on factoriesData
  recreateOrderRecords();
  recreateCustomerRecords();
  recreateLogisticsRecords();    // Depends on ordersData
};
```

### Testing

1. **Manual Testing**:
   - Open browser console
   - Check `factoriesData`, `warehousesData`, `logisticsData` arrays exist and contain correct data
   - Verify `entityConfigs` Map contains entries matching array data
   - Check configuration backend UI displays correct factory/warehouse/logistics data

2. **Data Alignment Verification**:
   - Compare factory IDs in `factoriesData` with factory IDs in `entityConfigs` Map
   - Verify all attributes match (100% alignment)
   - Repeat for warehouse and logistics

3. **Business Relationship Verification**:
   - Check factory.productList references existing products
   - Check warehouse.associatedFactory references existing factories
   - Check logistics order assignments reference existing orders

---

## For Users

### What Changed?

1. **Product Data Enhancement**:
   - Product inventory now uses "套" as the unit (stockUnit field)
   - Product inventory quantities are randomly generated between 21 and 500 sets
   - Product list expanded from 4 to 9 products, including new agricultural technology products
   - All products now have complete lifecycle information (start sales date, stop sales date, stop expansion date, stop service date)
   - Product lifecycle statuses: 1 product stopped sales, 1 product stopped expansion, 1 product stopped service, 6 products in sales

2. **Data Synchronization**:
   - Configuration backend now ensures all supply chain object data (factories, warehouses, logistics) is synchronized with the underlying data source (`mockData.ts`)
   - This ensures data consistency across the application

### How to Verify

1. **Open Configuration Backend**:
   - Click "管理配置" button in header
   - Navigate to "供应链对象"

2. **Check Product Data**:
   - Select "产品" from entity list
   - Verify product list shows 9 products (PROD-001 to PROD-009)
   - Verify each product displays stock quantity with unit (e.g., "50 套")
   - Verify lifecycle status is displayed (销售中, 停止销售, 停止扩容, 停止服务)
   - Click any product to view details
   - Verify all lifecycle dates are displayed correctly

3. **Check Factory Data**:
   - Select "工厂" from entity list
   - Verify factory list shows 3 factories (FAC-001, FAC-002, FAC-003)
   - Click any factory to view details
   - Verify all attributes (location, production lines, capacity, etc.) are displayed correctly
   - Verify factory is associated with correct products (now 9 products total)

4. **Check Warehouse Data**:
   - Select "仓库" from entity list
   - Verify warehouse list shows 3 warehouses (WH-001, WH-002, WH-003)
   - Click any warehouse to view details
   - Verify warehouse is associated with correct factory

5. **Check Logistics Data**:
   - Select "物流" from entity list
   - Verify logistics list shows 5 logistics (LOG-001 to LOG-005)
   - Click any logistics to view details
   - Verify logistics handles correct orders

### Expected Behavior

- Product list shows 9 products (expanded from 4)
- All products display stock quantity with unit "套" (e.g., "50 套")
- Product lifecycle information is displayed correctly (status, dates)
- All entity data should match between configuration backend and frontend views
- Factory, warehouse, and logistics data should be consistent and up-to-date
- No data discrepancies or missing attributes

---

## Troubleshooting

### Issue: factoriesData array is empty

**Solution**: Ensure `recreateFactoryRecords()` is called before `populateEntityConfigs()`, and `productsData` array contains at least one product.

### Issue: Warehouse not associated with factory

**Solution**: Ensure `recreateWarehouseRecords()` is called after `recreateFactoryRecords()`, and `factoriesData` array contains factories.

### Issue: EntityConfig entries don't match data arrays

**Solution**: Verify `populateEntityConfigs()` iterates over data arrays (not hardcoded IDs), and maps attributes directly from array elements.

### Issue: Missing attributes in configuration backend

**Solution**: Ensure data arrays contain all required attributes matching EntityConfig.attributes structure. Check `getDefaultAttributes()` for required attribute list.

---

## Next Steps

After implementation:
1. Run `/speckit.tasks` to generate detailed task list
2. Implement tasks in order
3. Test data alignment
4. Verify bidirectional synchronization
5. Update documentation if needed



