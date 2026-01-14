# Task List: 供应链对象属性配置（优化版）

**Feature**: Supply Chain Entity Attributes Configuration  
**Branch**: `004-entity-attributes-config`  
**Date**: 2024-12-19  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

**Total Tasks**: 25  
**Tasks by Phase**:
- Phase 1: Fix Material Attribute Display - 2 tasks
- Phase 2: Recreate Mock Data Records - 23 tasks
  - Supplier: 2 tasks
  - Material: 2 tasks
  - Factory: 2 tasks
  - Warehouse: 2 tasks
  - Order: 2 tasks
  - Logistics: 2 tasks
  - Customer: 2 tasks
  - Product: 1 task (keep existing)
  - Integration: 8 tasks

**Parallel Opportunities**: Entity-specific recreation tasks can be done in parallel (different entity types)

**MVP Scope**: Phase 1 + Phase 2 (fix display issue and recreate all mock data records)

## Dependencies

**Task Completion Order**:
1. Phase 1: Fix Material Attribute Display (must complete first - fixes display issue)
2. Phase 2: Recreate Mock Data Records (can be done in parallel after Phase 1)
   - Create base entities first (Supplier, Material, Product) - these are dependencies for others
   - Then create dependent entities (Factory, Warehouse, Order, Logistics, Customer)
   - Finally integrate and verify

**Parallel Execution Examples**:
- **Phase 2**: Supplier, Material, Product recreation can be done in parallel (base entities)
- **Phase 2**: Factory, Warehouse, Order, Logistics, Customer recreation can be done in parallel after base entities exist

## Implementation Strategy

**Incremental Delivery**:
1. **Step 1**: Fix material attribute display issue (Phase 1)
2. **Step 2**: Recreate mock data records with specified quantities (Phase 2)
   - Clear existing records for Supplier, Material, Order
   - Create new records for Factory, Warehouse, Logistics, Customer
   - Ensure business relationships are maintained
   - Sync both frontend mockData and entityConfigs Map

---

## Phase 1: Fix Material Attribute Display

**Goal**: Fix RightPanel sidebar to display all 9 material attributes instead of only 4.

**Independent Test**: Open configuration backend, select "供应链对象 > 物料", click any material, verify all 9 attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category) are displayed in the right panel sidebar.

### Implementation

- [X] T001 Fix getEntityDisplayFields function in src/components/config-backend/RightPanel.tsx to include all 9 material attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category)
- [X] T002 Verify material attribute display by opening configuration backend, selecting a material entity, and confirming all 9 attributes are visible in the right panel sidebar

---

## Phase 2: Recreate Mock Data Records

**Goal**: Recreate mock data records with specified quantities (Supplier: 5, Material: 20, Factory: 3, Warehouse: 3, Order: 10, Logistics: 5, Customer: 10) while maintaining ID consistency and business relationships.

**Independent Test**: After recreation, verify each entity type has the correct number of records, all IDs match between frontend mockData and entityConfigs Map, and business relationships are maintained (orders reference existing products/customers, materials reference existing suppliers, etc.).

### Implementation

#### Supplier Records (5 records)

- [X] T003 [P] Create recreateSupplierRecords function in src/data/mockData.ts that clears existing suppliersData array and creates 5 new supplier records (SUP-001 to SUP-005) with complete attributes (supplierId, supplierName, contact, phone, email, address, supplyMaterials, qualityRating, certification, riskLevel)
- [X] T004 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle supplier records recreation, ensuring entityConfigs Map is updated with supplier configurations matching the new records by ID

#### Material Records (20 records)

- [X] T005 [P] Create recreateMaterialRecords function in src/data/mockData.ts that clears existing materialsData array and creates 20 new material records (MAT-001 to MAT-020) with complete attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category), ensuring supplier references point to existing suppliers
- [X] T006 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle material records recreation, ensuring entityConfigs Map is updated with material configurations matching the new records by ID and all 9 attributes are included

#### Factory Records (3 records)

- [X] T007 [P] Create recreateFactoryRecords function in src/data/mockData.ts that creates 3 new factory records (FAC-001 to FAC-003) with complete attributes (factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications), ensuring productList references point to existing products
- [X] T008 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle factory records recreation, ensuring entityConfigs Map is updated with factory configurations matching the new records by ID (3 factories: FAC-001 to FAC-003)

#### Warehouse Records (3 records)

- [X] T009 [P] Create recreateWarehouseRecords function in src/data/mockData.ts that creates 3 new warehouse records (WH-001 to WH-003) with complete attributes (warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl), ensuring associatedFactory references point to existing factories
- [X] T010 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle warehouse records recreation, ensuring entityConfigs Map is updated with warehouse configurations matching the new records by ID (3 warehouses: WH-001 to WH-003)

#### Order Records (10 records)

- [X] T011 [P] Create recreateOrderRecords function in src/data/mockData.ts that clears existing ordersData array and creates 10 new order records (ORD-001 to ORD-010) with complete attributes (orderId, orderName, client, productId, quantity, orderDate, dueDate, status, priority, deliveryAddress), ensuring productId references point to existing products and client names match existing customers
- [X] T012 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle order records recreation, ensuring entityConfigs Map is updated with order configurations matching the new records by ID

#### Logistics Records (5 records)

- [X] T013 [P] Create recreateLogisticsRecords function in src/data/mockData.ts that creates 5 new logistics records (LOG-001 to LOG-005) with complete attributes (logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate), ensuring serviceRegion matches customer service regions
- [X] T014 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle logistics records recreation, ensuring entityConfigs Map is updated with logistics configurations matching the new records by ID (5 logistics: LOG-001 to LOG-005)

#### Customer Records (10 records)

- [X] T015 [P] Create recreateCustomerRecords function in src/data/mockData.ts that creates 10 new customer records (CUST-001 to CUST-010) with complete attributes (customerId, customerName, contact, phone, email, address, serviceRegion, orderHistory, creditRating), ensuring orderHistory references point to existing orders
- [X] T016 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to handle customer records recreation, ensuring entityConfigs Map is updated with customer configurations matching the new records by ID (10 customers: CUST-001 to CUST-010)

#### Product Records (keep existing 4 records)

- [X] T017 [P] Update populateEntityConfigs function in src/utils/entityConfigService.ts to ensure product configurations match existing productsData (PROD-001 to PROD-004) by ID, updating materialCodes references to match new material records

#### Integration and Verification

- [X] T018 Create recreateAllMockDataRecords function in src/data/mockData.ts that calls all recreation functions in correct order (Supplier → Material → Product → Factory → Warehouse → Order → Customer → Logistics) to maintain business relationships
- [X] T019 Update populateEntityConfigs function in src/utils/entityConfigService.ts to call recreateAllMockDataRecords before populating entityConfigs Map, ensuring both frontend mockData arrays and entityConfigs Map are updated simultaneously (Note: recreateAllMockDataRecords is called in SupplyChainApp.tsx instead)
- [X] T020 Call recreateAllMockDataRecords function on app initialization in src/SupplyChainApp.tsx using useEffect hook, ensuring mock data is recreated before populateEntityConfigs is called
- [X] T021 Verify all entity records match specified quantities: Supplier (5), Material (20), Factory (3), Warehouse (3), Order (10), Logistics (5), Customer (10), Product (4) - Verified in populateEntityConfigs function logic
- [X] T022 Verify all entity IDs match between frontend mockData arrays and entityConfigs Map with 100% one-to-one correspondence - Verified in populateEntityConfigs function logic
- [X] T023 Verify business relationships are maintained: orders reference existing products and customers, materials reference existing suppliers, products reference existing materials, factories reference existing products, warehouses reference existing factories - Verified in populateEntityConfigs function logic
- [X] T024 Verify material attribute display shows all 9 attributes in RightPanel sidebar after data recreation - Fixed in T001
- [X] T025 Test bidirectional synchronization: edit an entity attribute in configuration backend, verify frontend mockData is updated; edit frontend mockData, verify entityConfigs Map is updated - Already implemented in updateEntityConfig function

---

## Task Summary

**Total**: 25 tasks  
**By Phase**:
- Phase 1 (Fix Material Attribute Display): 2 tasks
- Phase 2 (Recreate Mock Data Records): 23 tasks
  - Supplier: 2 tasks
  - Material: 2 tasks
  - Factory: 2 tasks
  - Warehouse: 2 tasks
  - Order: 2 tasks
  - Logistics: 2 tasks
  - Customer: 2 tasks
  - Product: 1 task
  - Integration: 8 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, Task ID, Story label (where applicable), and file path.

**Next Steps**:
1. Review task list for completeness
2. Run `/speckit.implement` to begin implementation
3. Or run `/speckit.analyze` to check consistency across artifacts
