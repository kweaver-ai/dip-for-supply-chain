# Implementation Tasks: 供应链对象数据对齐

**Feature**: 006-entity-data-alignment  
**Branch**: `006-entity-data-alignment`  
**Generated**: 2024-12-20  
**Total Tasks**: 35

## Summary

This task list implements data alignment between `mockData.ts` arrays and `entityConfigs` Map for all supply chain entities, including product object optimization. The implementation includes: 1) Adding stockUnit field to Product type and expanding productsData from 4 to 9 products; 2) Creating factoriesData, warehousesData, and logisticsData arrays in mockData.ts; 3) Updating recreate functions to populate these arrays; 4) Modifying populateEntityConfigs to read from arrays instead of hardcoding values; 5) Updating all UI components that display product data to show stockUnit and lifecycle information.

## Dependencies

**User Story Completion Order**:
- User Story 1 (P1): 数据对齐验证 - All tasks must be completed for this story

**Task Dependencies**:
- T001-T002: Setup (no dependencies)
- T003-T004: Foundational (depends on T001-T002)
- T005-T031: User Story 1 implementation (depends on T003-T004)
- T032-T035: Polish (depends on T005-T031)

## Implementation Strategy

**MVP Scope**: Complete User Story 1 (all tasks T001-T031) - this provides full data alignment functionality including product optimization.

**Incremental Delivery**:
1. **Phase 1-2**: Setup and foundational tasks (T001-T004)
2. **Phase 3**: Product type and data updates (T005-T010)
3. **Phase 4**: Factory data alignment (T011-T013)
4. **Phase 5**: Warehouse data alignment (T014-T016)
5. **Phase 6**: Logistics data alignment (T017-T019)
6. **Phase 7**: Update populateEntityConfigs (T020-T022)
7. **Phase 8**: UI component updates for product data (T023-T031)
8. **Phase 9**: Polish and verification (T032-T035)

## Phase 1: Setup

### Goal
Initialize data array declarations in mockData.ts for factoriesData, warehousesData, and logisticsData.

**Independent Test**: After this phase, mockData.ts exports factoriesData, warehousesData, and logisticsData arrays (may be empty initially).

- [x] T001 Add factoriesData array declaration in src/data/mockData.ts
- [x] T002 Add warehousesData and logisticsData array declarations in src/data/mockData.ts

## Phase 2: Foundational

### Goal
Update Product type in ontology.ts to add stockUnit field, ensuring type system compliance.

**Independent Test**: After this phase, Product interface in ontology.ts includes stockUnit?: string field, and TypeScript compilation succeeds.

- [x] T003 [P] Add stockUnit?: string field to Product interface in src/types/ontology.ts
- [x] T004 Verify TypeScript compilation succeeds after Product type update

## Phase 3: Product Data Updates [US1]

### Goal
Expand productsData from 4 to 9 products, add stockUnit field, generate stockQuantity 21-500, and assign lifecycle information to all products.

**Independent Test**: After this phase, productsData array contains exactly 9 products (PROD-001 to PROD-009), all with stockUnit: "套", stockQuantity between 21-500, and complete lifecycle information (1 "停止销售", 1 "停止扩容", 1 "停止服务", 6 "销售中").

- [x] T005 [US1] Update recreateProductRecords function in src/data/mockData.ts to add stockUnit: "套" to all existing 4 products
- [x] T006 [US1] Update recreateProductRecords function in src/data/mockData.ts to generate stockQuantity randomly (21-500) for all existing 4 products
- [x] T007 [US1] Add 5 new products (PROD-005 to PROD-009) to productsData array in src/data/mockData.ts with agricultural technology context
- [x] T008 [US1] Assign stockUnit: "套" and stockQuantity (21-500) to all 5 new products in src/data/mockData.ts
- [x] T009 [US1] Assign complete lifecycle information to all 9 products in src/data/mockData.ts (startSalesDate for all, stopSalesDate/stopExpansionDate/stopServiceDate for 3 products, status for all)
- [x] T010 [US1] Verify productsData array contains exactly 9 products with all required fields (stockUnit, stockQuantity, lifecycle dates, status)

## Phase 4: Factory Data Alignment [US1]

### Goal
Create factoriesData array by deriving data from productsData (now 9 products), ensuring all factory attributes match EntityConfig.attributes structure.

**Independent Test**: After this phase, factoriesData array contains exactly 3 factory records (FAC-001, FAC-002, FAC-003) with all 12 attributes, and factory.productList references existing products from productsData.

- [x] T011 [US1] Implement recreateFactoryRecords function in src/data/mockData.ts to create factoriesData array (3 records) from productsData
- [x] T012 [US1] Ensure recreateFactoryRecords distributes 9 products across 3 factories using modulo operation in src/data/mockData.ts
- [x] T013 [US1] Verify factoriesData array contains all 12 attributes matching EntityConfig.attributes structure

## Phase 5: Warehouse Data Alignment [US1]

### Goal
Create warehousesData array by deriving data from factoriesData, ensuring all warehouse attributes match EntityConfig.attributes structure.

**Independent Test**: After this phase, warehousesData array contains exactly 3 warehouse records (WH-001, WH-002, WH-003) with all 8 attributes, and warehouse.associatedFactory references existing factories.

- [x] T014 [US1] Implement recreateWarehouseRecords function in src/data/mockData.ts to create warehousesData array (3 records) from factoriesData
- [x] T015 [US1] Ensure recreateWarehouseRecords creates one-to-one mapping between warehouses and factories in src/data/mockData.ts
- [x] T016 [US1] Verify warehousesData array contains all 8 attributes matching EntityConfig.attributes structure

## Phase 6: Logistics Data Alignment [US1]

### Goal
Create logisticsData array by deriving data from ordersData, ensuring all logistics attributes match EntityConfig.attributes structure.

**Independent Test**: After this phase, logisticsData array contains exactly 5 logistics records (LOG-001 to LOG-005) with all 7 attributes, and logistics order assignments reference existing orders.

- [x] T017 [US1] Implement recreateLogisticsRecords function in src/data/mockData.ts to create logisticsData array (5 records) from ordersData
- [x] T018 [US1] Ensure recreateLogisticsRecords distributes orders across logistics using modulo operation in src/data/mockData.ts
- [x] T019 [US1] Verify logisticsData array contains all 7 attributes matching EntityConfig.attributes structure

## Phase 7: Update populateEntityConfigs [US1]

### Goal
Modify populateEntityConfigs function to read from factoriesData, warehousesData, and logisticsData arrays instead of hardcoding values.

**Independent Test**: After this phase, populateEntityConfigs function iterates over data arrays (not hardcoded IDs), maps attributes directly from array elements, and creates EntityConfig entries matching array data (100% ID match, all attributes match).

- [x] T020 [US1] Update populateEntityConfigs function in src/utils/entityConfigService.ts to iterate over factoriesData array instead of hardcoded factoryIds
- [x] T021 [US1] Update populateEntityConfigs function in src/utils/entityConfigService.ts to iterate over warehousesData array instead of hardcoded warehouseIds
- [x] T022 [US1] Update populateEntityConfigs function in src/utils/entityConfigService.ts to iterate over logisticsData array instead of hardcoded logisticsIds

## Phase 8: UI Component Updates for Product Data [US1]

### Goal
Update all UI components that display product data to show stockUnit and lifecycle information.

**Independent Test**: After this phase, all pages displaying product data (EntityListPage, RightPanel, ProductInventoryPanel, SupplyChainGraphPanel, ProductSupplyOptimizationPage) show stockUnit alongside stockQuantity and lifecycle information (status, dates).

- [x] T023 [P] [US1] Update EntityListPage component in src/components/config-backend/EntityListPage.tsx to display product stockUnit in product list table
- [x] T024 [P] [US1] Update EntityListPage component in src/components/config-backend/EntityListPage.tsx to display product lifecycle status in product list table
- [x] T025 [P] [US1] Update RightPanel component in src/components/config-backend/RightPanel.tsx to display product stockUnit in product detail view
- [x] T026 [P] [US1] Update RightPanel component in src/components/config-backend/RightPanel.tsx to display product lifecycle information (dates, status) in product detail view
- [x] T027 [P] [US1] Update ProductInventoryPanel component in src/components/cockpit/ProductInventoryPanel.tsx to display product stockUnit in inventory metrics
- [x] T028 [P] [US1] Update buildGraphData function in src/services/dataService.ts to include product stockUnit in graph nodes
- [x] T029 [P] [US1] Update buildGraphData function in src/services/dataService.ts to include product lifecycle status in graph nodes
- [x] T030 [P] [US1] Update ProductSupplyOptimizationPage component in src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx to display product stockUnit in product supply analysis
- [x] T031 [P] [US1] Verify all UI components use semantic color variables (no hardcoded colors) per Principle 2

## Phase 9: Polish & Verification [US1]

### Goal
Verify data alignment, update recreateAllMockDataRecords function call order, and perform final verification.

**Independent Test**: After this phase, all entity data in configuration backend matches mockData.ts arrays (100% alignment), recreateAllMockDataRecords calls recreate functions in correct order, and all UI pages display updated product information correctly.

- [x] T032 [US1] Update recreateAllMockDataRecords function in src/data/mockData.ts to call recreateProductRecords before recreateFactoryRecords
- [x] T033 [US1] Verify all entity IDs match exactly between mockData.ts arrays and entityConfigs Map (100% one-to-one correspondence)
- [x] T034 [US1] Verify all entity attributes match between mockData.ts arrays and entityConfigs Map (100% attribute alignment)
- [x] T035 [US1] Perform manual testing: Open configuration backend, verify all entity types (supplier, material, product, order, factory, warehouse, logistics, customer) display correct data with stockUnit and lifecycle information

## Parallel Execution Opportunities

**Phase 3 (Product Data Updates)**:
- T005-T006 can run in parallel (updating existing products)
- T007-T008 can run in parallel (adding new products)
- T009 can run after T005-T008 complete

**Phase 8 (UI Component Updates)**:
- T023-T031 can all run in parallel (different components, no dependencies)

**Phase 4-6 (Factory/Warehouse/Logistics Data)**:
- T011-T013 (Factory) must complete before T014-T016 (Warehouse)
- T014-T016 (Warehouse) can run after T011-T013 complete
- T017-T019 (Logistics) can run in parallel with T014-T016 (no dependencies)

## Task Count Summary

- **Setup**: 2 tasks (T001-T002)
- **Foundational**: 2 tasks (T003-T004)
- **Product Data Updates**: 6 tasks (T005-T010)
- **Factory Data Alignment**: 3 tasks (T011-T013)
- **Warehouse Data Alignment**: 3 tasks (T014-T016)
- **Logistics Data Alignment**: 3 tasks (T017-T019)
- **Update populateEntityConfigs**: 3 tasks (T020-T022)
- **UI Component Updates**: 9 tasks (T023-T031)
- **Polish & Verification**: 4 tasks (T032-T035)

**Total**: 35 tasks

## Independent Test Criteria

**User Story 1 - 数据对齐验证**:
- Open configuration backend, navigate to "供应链对象"
- Verify each entity type (supplier, material, product, order, factory, warehouse, logistics, customer) displays correct data
- For products: Verify stockUnit ("套") and stockQuantity (21-500) are displayed
- For products: Verify lifecycle information (status, dates) is displayed
- Verify all entity IDs, names, and attributes match mockData.ts exactly (100% alignment)

## Suggested MVP Scope

**MVP**: Complete all tasks T001-T035 (User Story 1) - this provides complete data alignment functionality including product optimization, factory/warehouse/logistics data arrays, and UI synchronization.

**Incremental Delivery Path**:
1. **Week 1**: Setup + Product Data Updates (T001-T010) - Core product optimization
2. **Week 2**: Factory/Warehouse/Logistics Data (T011-T019) - Data array creation
3. **Week 3**: populateEntityConfigs Update (T020-T022) - Data synchronization
4. **Week 4**: UI Component Updates (T023-T031) - User-facing changes
5. **Week 5**: Polish & Verification (T032-T035) - Final testing
