# Feature Specification: 供应链对象数据对齐

**Feature Branch**: `006-entity-data-alignment`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "参考 mockData.ts的模拟数据，对供应链对象下面所有的模拟数据进行更新对齐。优化产品对象信息：产品对象页面：1）增加产品对象的库存单位为套，库存数量随机生成大于20套以上；2）产品对象增加5条，总计9个产品。参考公司信息生成：某农业科技股份有限公司专注于智慧农业产品解决方案，将北斗技术、物联网、人工智能与农业场景相结合，自行研发和生产了一系列的智能装备，包括：农业无人飞机、北斗导航农机自动驾驶系统、农机智能探测设备、智能灌溉系统等产品，并通过自营无人农场运营实现智慧农业方案的典型应用，推进并落地全球农业自动化。3）产品对象属性增加生命周期信息：开始销售时间，停止销售时间，停止扩容时间，停止服务时间，9个产品1个产品停止销售，1个产品停止扩容，1个产品停止服务。所有其他页面的信息同步更新。"

## Clarifications

### Session 2024-12-19

- Q: Factory、Warehouse、Logistics、Customer 四个实体类型是否需要创建独立的数据数组？ → A: 混合方案：部分实体（如 Customer）从现有数据推导，部分实体（如 Factory）创建独立数据数组
- Q: Factory、Warehouse、Logistics 的数据来源是什么？ → A: 基于现有数据重新生成：根据 productsData、ordersData 等现有数据重新生成 Factory、Warehouse、Logistics 的数据，确保业务关联关系正确
- Q: Factory、Warehouse、Logistics 的数据数组应包含哪些属性？是否需要定义独立的类型接口？ → A: 使用 EntityConfig 属性结构：直接使用 EntityConfig.attributes 的结构创建数据数组，不定义独立的类型接口
- Q: 数据对齐的范围是什么？是否需要确保所有属性都对齐？ → A: 对齐所有属性：Factory、Warehouse、Logistics 数据数组应包含 populateEntityConfigs 中使用的所有属性（如工厂的生产线数量、产能利用率、仓库的容量、存储类型等），确保配置后台显示的数据与 mockData.ts 完全一致
- Q: Factory、Warehouse、Logistics 数据数组的创建时机和位置是什么？ → A: 在 mockData.ts 的 recreate 函数中创建：更新 recreateFactoryRecords、recreateWarehouseRecords、recreateLogisticsRecords 函数，在这些函数中创建对应的数据数组（factoriesData、warehousesData、logisticsData），然后在 populateEntityConfigs 中从这些数组读取数据

### Session 2024-12-20

- Q: 库存单位字段的处理方式是什么？ → A: 在 Product 类型中添加 stockUnit 字段（如 "套"），并在所有显示产品库存的页面使用该字段
- Q: 库存数量随机范围的上限是多少？ → A: 21-500 套（上限 500）
- Q: 新增5个产品的生成方式是什么？ → A: 基于现有4个产品扩展，参考公司信息生成5个新产品（如：农业无人飞机系列、智能监测设备等），确保产品名称和物料编码合理
- Q: 生命周期状态的分配方式是什么？ → A: 从全部9个产品中任意选择3个分别设置状态（1个停止销售、1个停止扩容、1个停止服务），其余6个为"销售中"
- Q: 需要同步更新的页面范围是什么？ → A: 更新所有显示产品数据的页面：配置后台的产品列表页、产品详情面板、驾驶舱的产品库存面板、供应链图谱、产品供应优化页面等

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 数据对齐验证 (Priority: P1)

作为系统管理员，我需要确保配置后台中所有供应链对象（供应商、物料、产品、订单、工厂、仓库、物流、客户）的数据与 mockData.ts 中的模拟数据完全对齐，以便保证数据一致性和系统正常运行。

**Why this priority**: 数据对齐是系统正确运行的基础，确保配置后台和前台数据的一致性对于所有依赖这些数据的功能都至关重要。

**Independent Test**: 打开配置后台，进入"供应链对象"，依次查看每个对象类型（供应商、物料、产品、订单、工厂、仓库、物流、客户），验证每个实体的ID、名称、属性值都与 mockData.ts 中对应的数据完全一致。

**Acceptance Scenarios**:

1. **Given** 系统管理员已登录并进入配置后台，**When** 查看"供应链对象 > 供应商"列表，**Then** 显示的供应商ID、名称、供应物料等属性与 mockData.ts 中的 suppliersData 完全一致
2. **Given** 系统管理员查看"供应链对象 > 物料"列表，**When** 查看物料详情，**Then** 显示的物料编码、名称、库存数量等属性与 mockData.ts 中的 materialsData 和 materialStocksData 完全一致
3. **Given** 系统管理员查看"供应链对象 > 产品"列表，**When** 查看产品详情，**Then** 显示的产品ID、名称、物料编码列表与 mockData.ts 中的 productsData 完全一致
4. **Given** 系统管理员查看"供应链对象 > 订单"列表，**When** 查看订单详情，**Then** 显示的订单ID、客户、产品、数量、日期等属性与 mockData.ts 中的 ordersData 完全一致
5. **Given** 系统管理员查看"供应链对象 > 工厂"列表，**When** 查看工厂详情，**Then** 显示的工厂数据与 mockData.ts 中对应的数据源完全一致（如果存在）或基于现有数据正确生成
6. **Given** 系统管理员查看"供应链对象 > 仓库"列表，**When** 查看仓库详情，**Then** 显示的仓库数据与 mockData.ts 中对应的数据源完全一致（如果存在）或基于现有数据正确生成
7. **Given** 系统管理员查看"供应链对象 > 物流"列表，**When** 查看物流详情，**Then** 显示的物流数据与 mockData.ts 中对应的数据源完全一致（如果存在）或基于现有数据正确生成
8. **Given** 系统管理员查看"供应链对象 > 客户"列表，**When** 查看客户详情，**Then** 显示的客户数据与 mockData.ts 中对应的数据源完全一致（如果存在）或基于现有数据正确生成

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure all supplier entity configurations in entityConfigs Map match suppliersData array in mockData.ts by ID, name, and supplyMaterials
- **FR-002**: System MUST ensure all material entity configurations in entityConfigs Map match materialsData array in mockData.ts by materialCode, materialName, and applicableProductIds
- **FR-003**: System MUST ensure material entity configurations include currentStock and safetyStock values calculated from materialStocksData array in mockData.ts
- **FR-004**: System MUST ensure all product entity configurations in entityConfigs Map match productsData array in mockData.ts by productId, productName, and materialCodes
- **FR-015**: System MUST add stockUnit field to Product type in ontology.ts (e.g., "套") and ensure all products have this field set to "套"
- **FR-016**: System MUST ensure all product stock quantities are randomly generated with values between 21 and 500 (21 <= stockQuantity <= 500)
- **FR-017**: System MUST expand productsData array from 4 products to 9 products total, adding 5 new products based on existing 4 products structure, referencing company information to generate new products (e.g., agricultural drone series, intelligent monitoring equipment, etc.), ensuring product names and material codes are reasonable and consistent with existing product patterns
- **FR-018**: System MUST ensure all 9 products have complete lifecycle information (startSalesDate, stopSalesDate, stopExpansionDate, stopServiceDate), with exactly 1 product in "停止销售" status, 1 product in "停止扩容" status, and 1 product in "停止服务" status, selected arbitrarily from all 9 products, with the remaining 6 products in "销售中" status
- **FR-019**: System MUST synchronize product information updates across all pages that display product data, including but not limited to: EntityListPage (product list in config backend), RightPanel (product detail panel), ProductInventoryPanel (cockpit product inventory panel), SupplyChainGraphPanel (supply chain graph), ProductSupplyOptimizationPage (product supply optimization page), and any other pages that reference product data
- **FR-005**: System MUST ensure all order entity configurations in entityConfigs Map match ordersData array in mockData.ts by orderId, orderName, client, productId, quantity, dates, and status
- **FR-006**: System MUST ensure factory entity configurations are generated from factoriesData array in mockData.ts, where factoriesData contains ALL attributes used in populateEntityConfigs (factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications), and factoriesData is created by deriving factory data from productsData
- **FR-007**: System MUST ensure warehouse entity configurations are generated from warehousesData array in mockData.ts, where warehousesData contains ALL attributes used in populateEntityConfigs (warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl), and warehousesData is created by deriving warehouse data from factory data
- **FR-008**: System MUST ensure logistics entity configurations are generated from logisticsData array in mockData.ts, where logisticsData contains ALL attributes used in populateEntityConfigs (logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate), and logisticsData is created by deriving logistics data from ordersData
- **FR-009**: System MUST ensure customer entity configurations are correctly derived from ordersData.client field (no need to create customersData array - use existing ordersData)
- **FR-010**: System MUST maintain bidirectional synchronization: changes to mockData.ts arrays MUST be reflected in entityConfigs Map, and changes to entityConfigs MUST be reflected in mockData.ts arrays
- **FR-011**: System MUST ensure populateEntityConfigs function reads from mockData.ts data arrays instead of hardcoding entity data
- **FR-012**: System MUST ensure all entity IDs match exactly between mockData.ts arrays and entityConfigs Map (100% one-to-one correspondence)
- **FR-013**: System MUST ensure factoriesData, warehousesData, logisticsData arrays are created in mockData.ts within recreateFactoryRecords, recreateWarehouseRecords, recreateLogisticsRecords functions respectively (consistent with recreateSupplierRecords, recreateMaterialRecords, recreateOrderRecords pattern)
- **FR-014**: System MUST ensure populateEntityConfigs function reads from factoriesData, warehousesData, logisticsData arrays instead of generating hardcoded values

### Key Entities *(include if feature involves data)*

- **Supplier**: From suppliersData array in mockData.ts
- **Material**: From materialsData and materialStocksData arrays in mockData.ts
- **Product**: From productsData array in mockData.ts
- **Order**: From ordersData array in mockData.ts
- **Factory**: Requires factoriesData array in mockData.ts (to be created by deriving from productsData - factories produce products), using EntityConfig.attributes structure without separate type interface
- **Warehouse**: Requires warehousesData array in mockData.ts (to be created by deriving from factory data - warehouses are associated with factories), using EntityConfig.attributes structure without separate type interface
- **Logistics**: Requires logisticsData array in mockData.ts (to be created by deriving from ordersData - logistics handle orders), using EntityConfig.attributes structure without separate type interface
- **Customer**: Derived from ordersData.client field (no separate customersData array needed)

**Note**: Factory, Warehouse, Logistics data arrays use EntityConfig.attributes structure directly without separate type interfaces. Other entity types (Supplier, Material, Product, Order) MUST be defined in `src/types/ontology.ts` per Principle 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All supplier configurations match suppliersData - 100% ID match, name match, and supplyMaterials match
- **SC-002**: All material configurations match materialsData and materialStocksData - 100% materialCode match, name match, and stock values match
- **SC-003**: All product configurations match productsData - 100% productId match, name match, and materialCodes match
- **SC-007**: All products have stockUnit field set to "套" and stockQuantity between 21 and 500 - 100% compliance
- **SC-008**: productsData array contains exactly 9 products (expanded from 4), with 5 new products generated based on agricultural technology company context - 100% product count match
- **SC-009**: All 9 products have complete lifecycle information (startSalesDate, stopSalesDate, stopExpansionDate, stopServiceDate), with exactly 1 product in "停止销售" status, 1 product in "停止扩容" status, 1 product in "停止服务" status, and 6 products in "销售中" status - 100% lifecycle data completeness
- **SC-010**: All pages displaying product data (EntityListPage, RightPanel, ProductInventoryPanel, SupplyChainGraphPanel, ProductSupplyOptimizationPage, etc.) show updated product information with stockUnit and lifecycle data - 100% page synchronization
- **SC-004**: All order configurations match ordersData - 100% orderId match and all attribute values match
- **SC-005**: Factory, Warehouse, Logistics configurations are generated from factoriesData, warehousesData, logisticsData arrays in mockData.ts, where these arrays contain ALL attributes (not just ID, name, and relations) and are created by deriving data from productsData, factory data, and ordersData respectively - 0% hardcoded values in populateEntityConfigs; Customer configurations are correctly derived from ordersData.client field
- **SC-006**: Data synchronization works bidirectionally - changes in mockData.ts reflect in entityConfigs within 1 function call, changes in entityConfigs reflect in mockData.ts within 1 function call

## Assumptions

- mockData.ts is the single source of truth for all entity data
- EntityConfigs Map should be populated from mockData.ts, not hardcoded
- Factory, Warehouse, Logistics entities require new data arrays (factoriesData, warehousesData, logisticsData) in mockData.ts, which should be created by deriving data from existing data sources (productsData for factories, factory data for warehouses, ordersData for logistics)
- Factory, Warehouse, Logistics data arrays use EntityConfig.attributes structure directly without separate type interfaces (no need to define Factory, Warehouse, Logistics interfaces in database.ts or ontology.ts)
- Factory, Warehouse, Logistics data arrays should be created in recreateFactoryRecords, recreateWarehouseRecords, recreateLogisticsRecords functions in mockData.ts (consistent with existing recreate pattern)
- Customer entity configurations should be derived from ordersData.client field (no separate customersData array needed)
- populateEntityConfigs function should read from data arrays instead of generating hardcoded values
- Bidirectional synchronization should be maintained between mockData.ts and entityConfigs Map

## Dependencies

- **mockData.ts**: Must contain all entity data arrays (suppliersData, materialsData, productsData, ordersData, factoriesData, warehousesData, logisticsData)
- **mockData.ts recreate functions**: Must implement recreateFactoryRecords, recreateWarehouseRecords, recreateLogisticsRecords functions to create factoriesData, warehousesData, logisticsData arrays
- **entityConfigService.ts**: Must have populateEntityConfigs function that reads from mockData.ts data arrays (factoriesData, warehousesData, logisticsData) instead of hardcoding values
- **EntityConfig Types**: Must be defined in ontology.ts

## Out of Scope

- Creating new entity types - only aligning existing entity types
- Changing entity data structure - only ensuring data alignment
- UI changes - only data layer alignment
- Performance optimization - focus on correctness, not performance

