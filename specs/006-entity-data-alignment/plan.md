# Implementation Plan: 供应链对象数据对齐

**Branch**: `006-entity-data-alignment` | **Date**: 2024-12-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-entity-data-alignment/spec.md`

## Summary

确保配置后台中所有供应链对象（供应商、物料、产品、订单、工厂、仓库、物流、客户）的数据与 mockData.ts 中的模拟数据完全对齐。主要工作包括：1) 在 mockData.ts 中创建 factoriesData、warehousesData、logisticsData 数据数组；2) 更新 recreateFactoryRecords、recreateWarehouseRecords、recreateLogisticsRecords 函数来填充这些数组；3) 修改 populateEntityConfigs 函数从这些数据数组读取数据，而不是硬编码生成；4) 确保所有实体配置与 mockData.ts 中的数据保持 100% 一致。

**产品对象优化**：优化产品对象信息，包括：1) 在 Product 类型中添加 stockUnit 字段（"套"），所有产品库存数量随机生成 21-500 套；2) 扩展 productsData 数组从 4 个产品增加到 9 个产品，新增 5 个基于农业科技公司背景的产品；3) 确保所有 9 个产品都有完整的生命周期信息（开始销售时间、停止销售时间、停止扩容时间、停止服务时间），其中 1 个产品停止销售、1 个产品停止扩容、1 个产品停止服务，其余 6 个产品为销售中；4) 同步更新所有显示产品数据的页面（配置后台产品列表页、产品详情面板、驾驶舱产品库存面板、供应链图谱、产品供应优化页面等）。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Tailwind CSS v4, Lucide React (icons), Vite (build tool)  
**Storage**: In-memory mock data (`src/data/mockData.ts`), EntityConfig Map for configuration metadata (`src/utils/entityConfigService.ts`)  
**Testing**: Manual testing via browser (no test framework specified)  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Single-page web application (React SPA)  
**Performance Goals**: Data synchronization should complete within 1 function call, no noticeable performance impact  
**Constraints**: Must maintain bidirectional synchronization between mockData.ts arrays and entityConfigs Map, must preserve existing data structure and business relationships  
**Scale/Scope**: 8 entity types (supplier, material, product, order, factory, warehouse, logistics, customer), ~3-20 records per type, data arrays in mockData.ts, populateEntityConfigs function in entityConfigService.ts. Product entity: 9 products (expanded from 4), each with stockUnit field ("套"), stockQuantity 21-500, complete lifecycle information. Multiple UI pages displaying product data need synchronization updates.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - Factory, Warehouse, Logistics data arrays use EntityConfig.attributes structure (no separate type interfaces needed)
  - Existing entity types (Supplier, Material, Product, Order) already defined in ontology.ts
  - **Action Required**: Add `stockUnit?: string` field to Product interface in ontology.ts (e.g., "套")
  - EntityConfig type already defined in ontology.ts
  - Product type already has lifecycle fields (startSalesDate, stopSalesDate, stopExpansionDate, stopServiceDate) and status field
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - Product data updates may require UI component updates to display stockUnit and lifecycle information
  - All UI components must continue using semantic variables (no hardcoded colors)
  - Components displaying product data: EntityListPage, RightPanel, ProductInventoryPanel, SupplyChainGraphPanel, ProductSupplyOptimizationPage
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - populateEntityConfigs function in entityConfigService.ts may exceed 150 lines after updates
  - Will extract helper functions for creating factory/warehouse/logistics data to keep function manageable
  - No UI components affected
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Not applicable - this feature only affects mock data structure and population logic
  - All data remains in mockData.ts (simulation data source)
  - No real data or simulation mode logic involved

**Violations**: None identified. All principles can be satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/006-entity-data-alignment/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   └── mockData.ts                    # Modify: Add factoriesData, warehousesData, logisticsData arrays
│                                      # Modify: Update recreateFactoryRecords, recreateWarehouseRecords, recreateLogisticsRecords
│                                      # Modify: Expand productsData from 4 to 9 products, add stockUnit field, update stockQuantity (21-500)
│                                      # Modify: Update all 9 products with complete lifecycle information
├── utils/
│   └── entityConfigService.ts         # Modify: Update populateEntityConfigs to read from data arrays
├── types/
│   └── ontology.ts                    # Modify: Add stockUnit?: string field to Product interface
├── components/
│   ├── config-backend/
│   │   ├── EntityListPage.tsx         # Modify: Display product stockUnit and lifecycle information
│   │   └── RightPanel.tsx             # Modify: Display product stockUnit and lifecycle information
│   ├── cockpit/
│   │   └── ProductInventoryPanel.tsx  # Modify: Display product stockUnit and lifecycle information
│   ├── views/
│   │   └── CockpitView.tsx            # May need updates if it displays product data
│   └── product-supply-optimization/
│       └── ProductSupplyOptimizationPage.tsx  # Modify: Display product stockUnit and lifecycle information
└── services/
    └── dataService.ts                 # Modify: Update buildGraphData to include product stockUnit in graph nodes
```

**Structure Decision**: Single project structure. The feature modifies existing files: `mockData.ts`, `entityConfigService.ts`, `ontology.ts`, and multiple UI components that display product data. No new files needed, only updates to existing data structures, types, and UI components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Phase 0: Research & Design Decisions

### Research Questions

**RQ-001: How to structure factoriesData array to match EntityConfig.attributes for factory?**
- **Decision**: Use object structure matching EntityConfig.attributes for factory entity type, including all 12 attributes: factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications
- **Rationale**: Ensures 100% alignment between mockData.ts and entityConfigs Map, allows direct mapping without transformation
- **Alternatives Considered**: 
  - Separate type interface: Rejected per clarification - use EntityConfig.attributes structure directly
  - Minimal structure with only ID/name: Rejected - need all attributes for complete alignment

**RQ-002: How to derive factory data from productsData?**
- **Decision**: Distribute products across factories (3 factories, 4 products) - Factory 1 gets products at index 0,3; Factory 2 gets products at index 1; Factory 3 gets products at index 2. Generate factory attributes (location, productionLines, capacity, etc.) based on index and product assignments
- **Rationale**: Maintains business relationship (factories produce products), ensures each factory has at least one product, creates realistic distribution
- **Alternatives Considered**: 
  - One product per factory: Too restrictive, doesn't match current populateEntityConfigs logic
  - All products in first factory: Doesn't distribute load, unrealistic

**RQ-003: How to structure warehousesData array to match EntityConfig.attributes for warehouse?**
- **Decision**: Use object structure matching EntityConfig.attributes for warehouse entity type, including all 8 attributes: warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl
- **Rationale**: Ensures 100% alignment between mockData.ts and entityConfigs Map, allows direct mapping without transformation
- **Alternatives Considered**: 
  - Separate type interface: Rejected per clarification - use EntityConfig.attributes structure directly
  - Minimal structure: Rejected - need all attributes for complete alignment

**RQ-004: How to derive warehouse data from factory data?**
- **Decision**: Create 3 warehouses, each associated with one factory (WH-001 → FAC-001, WH-002 → FAC-002, WH-003 → FAC-003). Generate warehouse attributes (capacity, currentStock, storageType) based on index and factory association
- **Rationale**: Maintains business relationship (warehouses associated with factories), ensures one-to-one mapping, creates realistic distribution
- **Alternatives Considered**: 
  - Multiple warehouses per factory: More complex, not needed for current data volume
  - Random factory assignment: Doesn't maintain clear business relationships

**RQ-005: How to structure logisticsData array to match EntityConfig.attributes for logistics?**
- **Decision**: Use object structure matching EntityConfig.attributes for logistics entity type, including all 7 attributes: logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate
- **Rationale**: Ensures 100% alignment between mockData.ts and entityConfigs Map, allows direct mapping without transformation
- **Alternatives Considered**: 
  - Separate type interface: Rejected per clarification - use EntityConfig.attributes structure directly
  - Minimal structure: Rejected - need all attributes for complete alignment

**RQ-006: How to derive logistics data from ordersData?**
- **Decision**: Distribute orders across logistics (5 logistics, 10 orders) - Logistics 1 gets orders at index 0,5; Logistics 2 gets orders at index 1,6; etc. Generate logistics attributes (carrier, transportMode, serviceRegion) based on index and order assignments
- **Rationale**: Maintains business relationship (logistics handle orders), ensures each logistics has orders, creates realistic distribution matching current populateEntityConfigs logic
- **Alternatives Considered**: 
  - One order per logistics: Too restrictive, doesn't match current logic
  - All orders in first logistics: Doesn't distribute load, unrealistic

**RQ-007: How to ensure populateEntityConfigs reads from data arrays instead of hardcoding?**
- **Decision**: Replace hardcoded factory/warehouse/logistics creation logic in populateEntityConfigs with iteration over factoriesData, warehousesData, logisticsData arrays. Map each array element's attributes directly to EntityConfig.attributes
- **Rationale**: Ensures single source of truth (mockData.ts), eliminates hardcoded values, maintains bidirectional synchronization
- **Alternatives Considered**: 
  - Keep hardcoded logic and sync to arrays: Defeats purpose of data alignment
  - Generate arrays in populateEntityConfigs: Violates separation of concerns, data should be in mockData.ts

**RQ-008: How to add stockUnit field to Product type?**
- **Decision**: Add `stockUnit?: string` field to Product interface in ontology.ts, set default value to "套" for all products in productsData array
- **Rationale**: Ensures type safety, allows future extension to other units, maintains consistency with existing Product type structure
- **Alternatives Considered**: 
  - Hardcode "套" in UI components: Rejected - violates type safety and makes future changes difficult
  - Use enum for units: Over-engineered for current single unit requirement

**RQ-009: How to generate 5 new products based on agricultural technology company context?**
- **Decision**: Create 5 new products (PROD-005 to PROD-009) based on existing 4 products structure, referencing agricultural technology company products: agricultural drones (variants), intelligent monitoring equipment, smart farm management systems, precision agriculture equipment, automated irrigation controllers. Each product should have reasonable materialCodes referencing existing materials, stockQuantity 21-500, stockUnit "套", and complete lifecycle information
- **Rationale**: Maintains consistency with existing product patterns, ensures realistic product names and material relationships, creates diverse product portfolio
- **Alternatives Considered**: 
  - Completely independent products: Rejected - may break existing material relationships
  - Copy existing products: Rejected - doesn't add value, creates duplicates

**RQ-010: How to assign lifecycle statuses to 9 products?**
- **Decision**: Arbitrarily select 3 products from all 9 products: 1 product set to "停止销售" (with stopSalesDate), 1 product set to "停止扩容" (with stopExpansionDate), 1 product set to "停止服务" (with stopServiceDate). Remaining 6 products set to "销售中" status with only startSalesDate defined
- **Rationale**: Ensures test coverage of all lifecycle states, maintains realistic distribution, allows testing of different product states in UI
- **Alternatives Considered**: 
  - All new products in different states: Rejected - doesn't test existing products with new states
  - All products in same state: Rejected - doesn't provide sufficient test coverage

**RQ-011: Which pages need to be updated to display product stockUnit and lifecycle information?**
- **Decision**: Update all pages that display product data: EntityListPage (product list in config backend), RightPanel (product detail panel), ProductInventoryPanel (cockpit product inventory panel), SupplyChainGraphPanel (supply chain graph), ProductSupplyOptimizationPage (product supply optimization page), and any other pages that reference product data. Each page should display stockUnit alongside stockQuantity, and lifecycle dates/status where relevant
- **Rationale**: Ensures data consistency across all UI, prevents confusion from inconsistent displays, maintains single source of truth
- **Alternatives Considered**: 
  - Update only data source: Rejected - UI won't reflect changes without component updates
  - Update only main pages: Rejected - incomplete updates create inconsistent user experience

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for detailed entity structures and relationships.

**Key Entities**:
- **Factory**: factoriesData array in mockData.ts, structure matches EntityConfig.attributes for factory
- **Warehouse**: warehousesData array in mockData.ts, structure matches EntityConfig.attributes for warehouse  
- **Logistics**: logisticsData array in mockData.ts, structure matches EntityConfig.attributes for logistics
- **Customer**: Derived from ordersData.client field (no separate array needed)
- **Product**: productsData array in mockData.ts, expanded from 4 to 9 products, each with:
  - `stockUnit?: string` field (value: "套")
  - `stockQuantity?: number` field (random value 21-500)
  - Complete lifecycle information: `startSalesDate`, `stopSalesDate`, `stopExpansionDate`, `stopServiceDate`
  - `status?: '销售中' | '停止销售' | '停止扩容' | '停止服务'` field
  - Distribution: 1 product "停止销售", 1 product "停止扩容", 1 product "停止服务", 6 products "销售中"

**Data Flow**:
1. `recreateAllMockDataRecords()` calls `recreateFactoryRecords()`, `recreateWarehouseRecords()`, `recreateLogisticsRecords()`
2. These functions populate `factoriesData`, `warehousesData`, `logisticsData` arrays in mockData.ts
3. `populateEntityConfigs()` reads from these arrays and creates EntityConfig entries
4. Bidirectional sync: Changes to arrays reflect in entityConfigs, changes to entityConfigs reflect in arrays

### API Contracts

See `contracts/` directory for detailed API contracts.

**Key Functions**:
- `recreateFactoryRecords()`: Creates factoriesData array (3 records) from productsData
- `recreateWarehouseRecords()`: Creates warehousesData array (3 records) from factory data
- `recreateLogisticsRecords()`: Creates logisticsData array (5 records) from ordersData
- `recreateProductRecords()`: Updates productsData array - expands from 4 to 9 products, adds stockUnit field, generates stockQuantity 21-500, assigns lifecycle information
- `populateEntityConfigs()`: Reads from factoriesData, warehousesData, logisticsData arrays instead of hardcoding
- UI Component Updates: EntityListPage, RightPanel, ProductInventoryPanel, SupplyChainGraphPanel, ProductSupplyOptimizationPage - display product stockUnit and lifecycle information

### Quickstart

See `quickstart.md` for developer and user quickstart guides.

## Phase 2: Implementation Tasks

*Tasks will be generated by `/speckit.tasks` command - NOT created by `/speckit.plan`*

## Notes

- All data arrays use EntityConfig.attributes structure directly (no separate type interfaces)
- Factory data derived from productsData (factories produce products)
- Warehouse data derived from factory data (warehouses associated with factories)
- Logistics data derived from ordersData (logistics handle orders)
- Customer data derived from ordersData.client field (no separate array)
- All attributes must be included in data arrays for complete alignment
- populateEntityConfigs must read from arrays, not generate hardcoded values
- Product type extended with stockUnit field in ontology.ts (value: "套")
- Product stockQuantity randomly generated between 21 and 500 for all 9 products
- ProductsData expanded from 4 to 9 products, with 5 new products based on agricultural technology company context
- All 9 products have complete lifecycle information with status distribution: 1 "停止销售", 1 "停止扩容", 1 "停止服务", 6 "销售中"
- All UI pages displaying product data must be updated to show stockUnit and lifecycle information



