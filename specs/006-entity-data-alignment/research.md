# Research & Design Decisions: 供应链对象数据对齐

**Feature**: 006-entity-data-alignment  
**Date**: 2024-12-19  
**Status**: Complete

## Research Questions & Decisions

### RQ-001: How to structure factoriesData array to match EntityConfig.attributes for factory?

**Decision**: Use object structure matching EntityConfig.attributes for factory entity type, including all 12 attributes: factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications

**Rationale**: 
- Ensures 100% alignment between mockData.ts and entityConfigs Map
- Allows direct mapping without transformation
- Matches clarification decision to use EntityConfig.attributes structure directly

**Alternatives Considered**: 
- **Separate type interface**: Rejected - clarification specified using EntityConfig.attributes structure directly without separate type interfaces
- **Minimal structure with only ID/name**: Rejected - clarification specified aligning ALL attributes, not just core attributes

**Implementation Notes**:
- factoriesData will be an array of objects with structure matching EntityConfig.attributes for factory
- Each object will contain: factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList (array of productIds), qualityPassRate, equipmentStatus, certifications (array)

---

### RQ-002: How to derive factory data from productsData?

**Decision**: Distribute products across factories (3 factories, 4 products) - Factory 1 gets products at index 0,3; Factory 2 gets products at index 1; Factory 3 gets products at index 2. Generate factory attributes (location, productionLines, capacity, etc.) based on index and product assignments.

**Rationale**: 
- Maintains business relationship (factories produce products)
- Ensures each factory has at least one product
- Creates realistic distribution matching current populateEntityConfigs logic
- Factory 1 gets first and last product to ensure it has products

**Alternatives Considered**: 
- **One product per factory**: Too restrictive, doesn't match current populateEntityConfigs logic which distributes products across factories
- **All products in first factory**: Doesn't distribute load, unrealistic for supply chain scenario

**Implementation Notes**:
- Use modulo operation to distribute products: `productsData.filter((_, idx) => idx % 3 === index)`
- Ensure Factory 1 (index 0) has at least one product as fallback
- Generate factory names, locations, and other attributes based on index

---

### RQ-003: How to structure warehousesData array to match EntityConfig.attributes for warehouse?

**Decision**: Use object structure matching EntityConfig.attributes for warehouse entity type, including all 8 attributes: warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl

**Rationale**: 
- Ensures 100% alignment between mockData.ts and entityConfigs Map
- Allows direct mapping without transformation
- Matches clarification decision to use EntityConfig.attributes structure directly

**Alternatives Considered**: 
- **Separate type interface**: Rejected - clarification specified using EntityConfig.attributes structure directly without separate type interfaces
- **Minimal structure**: Rejected - clarification specified aligning ALL attributes, not just core attributes

**Implementation Notes**:
- warehousesData will be an array of objects with structure matching EntityConfig.attributes for warehouse
- Each object will contain: warehouseCode, warehouseName, location, capacity (number), currentStock (number), associatedFactory (factoryId string), storageType ('normal' | 'cold'), temperatureControl (boolean)

---

### RQ-004: How to derive warehouse data from factory data?

**Decision**: Create 3 warehouses, each associated with one factory (WH-001 → FAC-001, WH-002 → FAC-002, WH-003 → FAC-003). Generate warehouse attributes (capacity, currentStock, storageType) based on index and factory association.

**Rationale**: 
- Maintains business relationship (warehouses associated with factories)
- Ensures one-to-one mapping (one warehouse per factory)
- Creates realistic distribution matching current populateEntityConfigs logic
- Simple and predictable mapping

**Alternatives Considered**: 
- **Multiple warehouses per factory**: More complex, not needed for current data volume (3 factories, 3 warehouses)
- **Random factory assignment**: Doesn't maintain clear business relationships, harder to verify correctness

**Implementation Notes**:
- Use factoryIds array index to map warehouses to factories
- Generate warehouse capacity and stock based on factory capacity/utilization
- Alternate storageType between 'normal' and 'cold' based on index

---

### RQ-005: How to structure logisticsData array to match EntityConfig.attributes for logistics?

**Decision**: Use object structure matching EntityConfig.attributes for logistics entity type, including all 7 attributes: logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate

**Rationale**: 
- Ensures 100% alignment between mockData.ts and entityConfigs Map
- Allows direct mapping without transformation
- Matches clarification decision to use EntityConfig.attributes structure directly

**Alternatives Considered**: 
- **Separate type interface**: Rejected - clarification specified using EntityConfig.attributes structure directly without separate type interfaces
- **Minimal structure**: Rejected - clarification specified aligning ALL attributes, not just core attributes

**Implementation Notes**:
- logisticsData will be an array of objects with structure matching EntityConfig.attributes for logistics
- Each object will contain: logisticsId, logisticsName, carrier (string), transportMode ('road' | 'rail' | 'air' | 'sea'), serviceRegion (array of strings), trackingNumber (string, may be empty), estimatedDeliveryDate (string, may be empty)

---

### RQ-006: How to derive logistics data from ordersData?

**Decision**: Distribute orders across logistics (5 logistics, 10 orders) - Logistics 1 gets orders at index 0,5; Logistics 2 gets orders at index 1,6; etc. Generate logistics attributes (carrier, transportMode, serviceRegion) based on index and order assignments.

**Rationale**: 
- Maintains business relationship (logistics handle orders)
- Ensures each logistics has orders (2 orders per logistics on average)
- Creates realistic distribution matching current populateEntityConfigs logic
- Uses modulo operation: `ordersData.filter((_, idx) => idx % 5 === index)`

**Alternatives Considered**: 
- **One order per logistics**: Too restrictive, doesn't match current populateEntityConfigs logic which distributes orders across logistics
- **All orders in first logistics**: Doesn't distribute load, unrealistic for supply chain scenario

**Implementation Notes**:
- Use modulo operation to distribute orders: `ordersData.filter((_, idx) => idx % 5 === index)`
- Generate logistics names, carriers, and transport modes based on index
- Set serviceRegion based on order client locations if available

---

### RQ-007: How to ensure populateEntityConfigs reads from data arrays instead of hardcoding?

**Decision**: Replace hardcoded factory/warehouse/logistics creation logic in populateEntityConfigs with iteration over factoriesData, warehousesData, logisticsData arrays. Map each array element's attributes directly to EntityConfig.attributes.

**Rationale**: 
- Ensures single source of truth (mockData.ts)
- Eliminates hardcoded values (0% hardcoded per success criteria)
- Maintains bidirectional synchronization
- Simplifies code by removing duplicate data generation logic

**Alternatives Considered**: 
- **Keep hardcoded logic and sync to arrays**: Defeats purpose of data alignment, creates two sources of truth
- **Generate arrays in populateEntityConfigs**: Violates separation of concerns, data should be in mockData.ts per clarification

**Implementation Notes**:
- Remove hardcoded factoryIds, warehouseIds, logisticsIds arrays
- Replace forEach loops with iteration over factoriesData, warehousesData, logisticsData arrays
- Map array element attributes directly to EntityConfig.attributes
- Calculate relations from array data (e.g., factory.productList → product relations)

---

### RQ-008: How to add stockUnit field to Product type?

**Decision**: Add `stockUnit?: string` field to Product interface in ontology.ts, set default value to "套" for all products in productsData array

**Rationale**: 
- Ensures type safety and consistency across codebase
- Allows future extension to other units (e.g., "台", "件") if needed
- Maintains consistency with existing Product type structure (optional fields)
- Follows Principle 1 (Type System Ontology) - all types in ontology.ts

**Alternatives Considered**: 
- **Hardcode "套" in UI components**: Rejected - violates type safety, makes future changes difficult, creates inconsistency
- **Use enum for units**: Over-engineered for current single unit requirement, adds unnecessary complexity

**Implementation Notes**:
- Add `stockUnit?: string` to Product interface in `src/types/ontology.ts`
- Update all products in productsData array to include `stockUnit: "套"`
- Update UI components to display stockUnit alongside stockQuantity
- Ensure backward compatibility (optional field, existing code won't break)

---

### RQ-009: How to generate 5 new products based on agricultural technology company context?

**Decision**: Create 5 new products (PROD-005 to PROD-009) based on existing 4 products structure, referencing agricultural technology company products: agricultural drones (variants), intelligent monitoring equipment, smart farm management systems, precision agriculture equipment, automated irrigation controllers. Each product should have reasonable materialCodes referencing existing materials, stockQuantity 21-500, stockUnit "套", and complete lifecycle information.

**Rationale**: 
- Maintains consistency with existing product patterns (productId format, materialCodes structure)
- Ensures realistic product names and material relationships
- Creates diverse product portfolio matching agricultural technology company context
- All products follow same structure (productId, productName, materialCodes, lifecycle fields, stockUnit, stockQuantity)

**Alternatives Considered**: 
- **Completely independent products**: Rejected - may break existing material relationships, doesn't leverage existing material codes
- **Copy existing products**: Rejected - doesn't add value, creates duplicates, doesn't expand product portfolio

**Implementation Notes**:
- Product IDs: PROD-005, PROD-006, PROD-007, PROD-008, PROD-009
- Product names should reference agricultural technology: e.g., "农业无人飞机T30", "智能监测系统", "智慧农场管理平台", "精准农业设备", "自动化灌溉控制器"
- materialCodes should reference existing materials (MAT-001 to MAT-008) in reasonable combinations
- Each product needs: stockUnit: "套", stockQuantity: random(21, 500), complete lifecycle information
- Update recreateProductRecords() function to generate all 9 products

---

### RQ-010: How to assign lifecycle statuses to 9 products?

**Decision**: Arbitrarily select 3 products from all 9 products: 1 product set to "停止销售" (with stopSalesDate), 1 product set to "停止扩容" (with stopExpansionDate), 1 product set to "停止服务" (with stopServiceDate). Remaining 6 products set to "销售中" status with only startSalesDate defined.

**Rationale**: 
- Ensures test coverage of all lifecycle states in UI
- Maintains realistic distribution (majority in "销售中", minority in various stopped states)
- Allows testing of different product states across all products (not just new ones)
- Follows clarification: "从全部9个产品中任意选择3个分别设置状态"

**Alternatives Considered**: 
- **All new products in different states**: Rejected - doesn't test existing products with new states, doesn't provide comprehensive coverage
- **All products in same state**: Rejected - doesn't provide sufficient test coverage, doesn't match real-world scenarios

**Implementation Notes**:
- Select products arbitrarily (e.g., PROD-001, PROD-005, PROD-009 for different states)
- Set appropriate lifecycle dates:
  - "停止销售": stopSalesDate set to past date, status: "停止销售"
  - "停止扩容": stopExpansionDate set to past date, status: "停止扩容"
  - "停止服务": stopServiceDate set to past date, status: "停止服务"
  - "销售中": only startSalesDate set, status: "销售中"
- Ensure dates are realistic (stop dates after start dates)

---

### RQ-011: Which pages need to be updated to display product stockUnit and lifecycle information?

**Decision**: Update all pages that display product data: EntityListPage (product list in config backend), RightPanel (product detail panel), ProductInventoryPanel (cockpit product inventory panel), SupplyChainGraphPanel (supply chain graph), ProductSupplyOptimizationPage (product supply optimization page), and any other pages that reference product data. Each page should display stockUnit alongside stockQuantity, and lifecycle dates/status where relevant.

**Rationale**: 
- Ensures data consistency across all UI (single source of truth)
- Prevents confusion from inconsistent displays (some pages showing stockUnit, others not)
- Maintains user experience consistency
- Follows clarification: "所有其他页面的信息同步更新"

**Alternatives Considered**: 
- **Update only data source**: Rejected - UI won't reflect changes without component updates, users won't see new information
- **Update only main pages**: Rejected - incomplete updates create inconsistent user experience, violates requirement for "所有其他页面"

**Implementation Notes**:
- EntityListPage: Display stockUnit in product list table (e.g., "50 套")
- RightPanel: Display stockUnit and lifecycle information in product detail view
- ProductInventoryPanel: Display stockUnit in inventory metrics
- SupplyChainGraphPanel: Include stockUnit in product node tooltips/info
- ProductSupplyOptimizationPage: Display stockUnit in product supply analysis
- Update dataService.ts buildGraphData() to include stockUnit in product graph nodes
- Ensure all displays use format: "{stockQuantity} {stockUnit}" (e.g., "50 套")

---

## Summary

All research questions have been resolved. Key decisions:
1. Use EntityConfig.attributes structure directly for all data arrays (no separate type interfaces)
2. Derive factory data from productsData (distribute products across factories)
3. Derive warehouse data from factory data (one warehouse per factory)
4. Derive logistics data from ordersData (distribute orders across logistics)
5. Replace hardcoded logic in populateEntityConfigs with array iteration
6. Add stockUnit field to Product type in ontology.ts (value: "套")
7. Expand productsData from 4 to 9 products with agricultural technology context
8. Assign lifecycle statuses: 1 "停止销售", 1 "停止扩容", 1 "停止服务", 6 "销售中"
9. Update all UI pages displaying product data to show stockUnit and lifecycle information

All decisions align with clarifications and project principles.



