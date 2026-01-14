# Feature Specification: 供应链对象属性配置

**Feature Branch**: `004-entity-attributes-config`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "供应链对象下属每个页面都要模拟一些数据记录，跟前台的记录一一匹配起来形成联动，每个对象，根据供应链业务访问的对象常识定义其属性、关系、逻辑、行动，权限基于用户管理的逻辑进行匹配。"

## Clarifications

### Session 2024-12-19

- Q: 物料页面属性显示问题 - 物料页面侧边栏只显示了4个属性，但应该有9个属性，是否需要减少到3个？ → A: 不需要减少，应修复显示逻辑确保全部9个属性（materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category）都能在侧边栏中显示出来
- Q: 数据记录与前台对应关系 - "与前台对应"的具体含义是什么？ → A: 通过ID匹配：配置后台的实体ID必须与前台mockData中的实体ID完全一致，确保一一对应
- Q: 数据记录来源和更新范围 - "清除之前的记录，重新准备X条对象记录"是指仅更新配置后台，还是同时更新前台mockData？ → A: 同时更新前台mockData和配置后台entityConfigs：清除现有记录，重新创建指定数量的记录，确保两者ID一致
- Q: 数据记录之间的关联关系 - 各实体类型的记录之间是否需要保持业务关联？ → A: 保持业务关联：订单必须关联存在的产品和客户，物料必须关联存在的供应商，产品必须关联存在的物料等
- Q: 物料"重新整理"的具体含义 - "物料页面，属性只有3个，请重新整理"是指什么？ → A: 修复显示问题并重新准备数据：修复物料属性显示逻辑（确保9个属性全部显示），同时重新准备20条物料记录，确保数据完整且与前台对应

## User Scenarios & Testing

### User Story 1 - 查看和配置供应商对象属性 (Priority: P1)

作为供应链管理员，我需要在配置后台的"供应链对象 > 供应商"页面查看每个供应商的详细属性配置（如供应商编码、名称、联系方式、供应物料、质量评级等），并能够编辑这些属性，以便维护供应商基础信息。

**Why this priority**: 供应商是供应链的核心对象之一，供应商属性配置是所有其他功能的基础。

**Independent Test**: 管理员可以打开配置后台，选择"供应链对象 > 供应商"，查看供应商列表，点击任意供应商查看其属性、关系、逻辑、行动和权限配置，并能够编辑保存。

**Acceptance Scenarios**:

1. **Given** 管理员已登录并进入配置后台，**When** 选择"供应链对象 > 供应商"，**Then** 显示所有供应商列表（共5条记录），每个供应商与前台数据一一对应
2. **Given** 管理员查看供应商列表，**When** 点击供应商"供应商A"（SUP-001），**Then** 右侧面板显示该供应商的完整属性配置（编码、名称、联系方式、供应物料等）
3. **Given** 管理员查看供应商属性，**When** 编辑供应商名称并保存，**Then** 前台供应商数据同步更新，显示新的供应商名称
4. **Given** 管理员查看供应商关系，**When** 查看"供应物料"关系，**Then** 显示该供应商供应的所有物料列表（如钢材、铝材），关系类型为"一对多"

---

### User Story 2 - 查看和配置工厂对象属性 (Priority: P1)

作为生产总监，我需要在配置后台的"供应链对象 > 工厂"页面查看每个工厂的详细属性配置（如工厂编码、名称、地理位置、生产线数量、产能利用率、生产产品列表等），并能够配置工厂的行动（如排产计划、产能调整），以便管理工厂运营。

**Why this priority**: 工厂是生产环节的核心对象，工厂属性配置直接影响生产计划和产能管理。

**Independent Test**: 生产总监可以打开配置后台，选择"供应链对象 > 工厂"，查看工厂列表，点击任意工厂查看其属性、关系、逻辑、行动和权限配置，并能够执行工厂相关行动。

**Acceptance Scenarios**:

1. **Given** 生产总监已登录并进入配置后台，**When** 选择"供应链对象 > 工厂"，**Then** 显示所有工厂列表（共3条记录），每个工厂与前台数据一一对应
2. **Given** 生产总监查看工厂列表，**When** 点击工厂"工厂A"（FAC-001），**Then** 右侧面板显示该工厂的完整属性配置（编码、名称、地理位置、生产线数量、总产能、产能利用率、生产效率、员工数量、生产产品列表、质量合格率、设备状态、认证资质）
3. **Given** 生产总监查看工厂关系，**When** 查看"生产产品"关系，**Then** 显示该工厂生产的所有产品列表，关系类型为"一对多"
4. **Given** 生产总监查看工厂行动，**When** 查看可用行动，**Then** 显示6个行动：排产计划、产能调整、设备维护、质量管控、效率优化、人员调配

---

### User Story 3 - 查看和配置产品对象属性 (Priority: P1)

作为产品总监，我需要在配置后台的"供应链对象 > 产品"页面查看每个产品的详细属性配置（如产品编码、名称、BOM清单、生命周期阶段、价格等），并能够配置产品的业务逻辑规则（如库存预警、ROI计算），以便管理产品信息。

**Why this priority**: 产品是供应链的核心对象，产品属性配置影响BOM管理、库存管理和产品生命周期管理。

**Independent Test**: 产品总监可以打开配置后台，选择"供应链对象 > 产品"，查看产品列表，点击任意产品查看其属性、关系、逻辑、行动和权限配置，并能够添加业务逻辑规则。

**Acceptance Scenarios**:

1. **Given** 产品总监已登录并进入配置后台，**When** 选择"供应链对象 > 产品"，**Then** 显示所有产品列表，每个产品与前台数据一一对应（PROD-001, PROD-002, PROD-003, PROD-004）
2. **Given** 产品总监查看产品列表，**When** 点击产品"产品A"（PROD-001），**Then** 右侧面板显示该产品的完整属性配置（编码、名称、BOM清单、生命周期阶段、价格、库存量等）
3. **Given** 产品总监查看产品关系，**When** 查看"使用物料"关系，**Then** 显示该产品使用的所有物料列表（如MAT-001钢材、MAT-002铝材），关系类型为"多对多（BOM）"
4. **Given** 产品总监查看产品逻辑，**When** 使用AI助手生成"库存预警"规则，**Then** 系统生成验证规则，当库存低于阈值时触发预警

---

### User Story 4 - 查看和配置订单对象属性 (Priority: P2)

作为销售总监，我需要在配置后台的"供应链对象 > 订单"页面查看每个订单的详细属性配置（如订单编号、客户、产品、数量、交付日期、状态等），并能够配置订单的业务逻辑规则（如交付预警、状态流转），以便管理订单流程。

**Why this priority**: 订单是销售和交付环节的核心对象，订单属性配置影响订单跟踪和交付管理。

**Independent Test**: 销售总监可以打开配置后台，选择"供应链对象 > 订单"，查看订单列表，点击任意订单查看其属性、关系、逻辑、行动和权限配置。

**Acceptance Scenarios**:

1. **Given** 销售总监已登录并进入配置后台，**When** 选择"供应链对象 > 订单"，**Then** 显示所有订单列表（共10条记录），每个订单与前台数据一一对应
2. **Given** 销售总监查看订单列表，**When** 点击订单"SO-20231105"，**Then** 右侧面板显示该订单的完整属性配置（订单编号、客户、产品、数量、订单日期、交付日期、状态等）
3. **Given** 销售总监查看订单关系，**When** 查看"关联产品"关系，**Then** 显示该订单关联的产品（如PROD-001），关系类型为"多对一"
4. **Given** 销售总监查看订单逻辑，**When** 查看业务规则，**Then** 显示交付预警规则：当订单交付日期临近且状态为"采购中"时，触发预警

---

### User Story 5 - 查看和配置物料对象属性 (Priority: P2)

作为采购总监，我需要在配置后台的"供应链对象 > 物料"页面查看每个物料的详细属性配置（如物料编码、名称、适用产品、库存量、供应商等），并能够配置物料的业务逻辑规则（如库存预警、采购建议），以便管理物料信息。

**Why this priority**: 物料是采购和库存管理的核心对象，物料属性配置影响采购决策和库存优化。

**Independent Test**: 采购总监可以打开配置后台，选择"供应链对象 > 物料"，查看物料列表，点击任意物料查看其属性、关系、逻辑、行动和权限配置。

**Acceptance Scenarios**:

1. **Given** 采购总监已登录并进入配置后台，**When** 选择"供应链对象 > 物料"，**Then** 显示所有物料列表（共20条记录），每个物料与前台数据一一对应
2. **Given** 采购总监查看物料列表，**When** 点击物料"钢材"（MAT-001），**Then** 右侧面板显示该物料的完整属性配置（全部9个属性：编码、名称、适用产品、当前库存、安全库存、供应商、单位、价格、类别）
3. **Given** 采购总监查看物料关系，**When** 查看"被产品使用"关系，**Then** 显示使用该物料的所有产品列表（如PROD-001, PROD-002），关系类型为"多对多（BOM）"
4. **Given** 采购总监查看物料逻辑，**When** 查看业务规则，**Then** 显示库存预警规则：当物料库存低于安全库存时，触发采购建议

---

### User Story 6 - 查看和配置仓库、物流、客户对象属性 (Priority: P3)

作为供应链管理员，我需要在配置后台查看仓库、物流、客户对象的详细属性配置，并能够配置这些对象的属性、关系、逻辑、行动和权限，以便全面管理供应链对象。

**Why this priority**: 仓库、物流、客户是供应链的重要对象，虽然优先级较低，但需要完整的配置支持。

**Independent Test**: 管理员可以打开配置后台，选择"供应链对象 > 仓库/物流/客户"，查看对象列表，点击任意对象查看其完整配置。

**Acceptance Scenarios**:

1. **Given** 管理员已登录并进入配置后台，**When** 选择"供应链对象 > 仓库"，**Then** 显示所有仓库列表（共3条记录），每个仓库与前台数据一一对应
2. **Given** 管理员查看仓库对象，**When** 点击仓库"仓库A"，**Then** 右侧面板显示该仓库的完整属性配置（编码、名称、地理位置、容量、当前库存、关联工厂等）
3. **Given** 管理员查看物流对象，**When** 选择"供应链对象 > 物流"，**Then** 显示所有物流列表（共5条记录），每个物流与前台数据一一对应；**When** 点击物流"物流A"，**Then** 右侧面板显示该物流的完整属性配置（编码、名称、承运商、运输方式、服务区域等）
4. **Given** 管理员查看客户对象，**When** 选择"供应链对象 > 客户"，**Then** 显示所有客户列表（共10条记录），每个客户与前台数据一一对应；**When** 点击客户"客户A"，**Then** 右侧面板显示该客户的完整属性配置（编码、名称、联系方式、服务区域、订单历史等）

---

### Edge Cases

- **数据不匹配**: 如果配置后台的实体ID与前台数据不匹配，系统应显示警告并提示管理员检查数据一致性
- **关系循环**: 如果实体关系形成循环引用（如产品A使用物料B，物料B又依赖产品A），系统应检测并提示
- **权限冲突**: 如果用户同时属于多个角色，且角色权限冲突，系统应应用最严格的权限策略
- **空数据**: 如果某个实体类型没有前台数据，配置后台应显示空状态，并提供"创建新对象"选项
- **属性缺失**: 如果前台实体缺少配置后台定义的某些属性，系统应使用默认值或提示管理员补充

## Requirements

### Functional Requirements

- **FR-001**: System MUST display entity list for each entity type (supplier, material, factory, product, warehouse, order, logistics, customer) with all entities matching frontend data by ID (one-to-one correspondence)
- **FR-002**: System MUST display entity attributes panel showing all attributes defined for each entity type based on supply chain business domain knowledge
- **FR-003**: System MUST display entity relations panel showing all relationships (target type, relation type, count, sample items) for each entity
- **FR-004**: System MUST display entity logic rules panel showing all business logic rules (validation, calculation, trigger) for each entity
- **FR-005**: System MUST display entity actions panel showing all available actions (name, icon, color, description) for each entity type
- **FR-006**: System MUST display entity permissions panel showing permission configuration (roles, users) based on user management logic
- **FR-007**: System MUST allow editing entity attributes and save changes with bidirectional synchronization to frontend data
- **FR-008**: System MUST populate entity configurations with mock data records matching frontend data records by ID for all 8 entity types
- **FR-008a**: System MUST display all 9 material attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category) in the material entity detail panel sidebar
- **FR-008b**: System MUST prepare mock data records with specified quantities for each entity type:
  - Supplier: 5 records (clear existing, recreate with IDs matching frontend)
  - Material: 20 records (clear existing, recreate with IDs matching frontend, ensure all 9 attributes are displayed)
  - Factory: 3 records (create with IDs matching frontend)
  - Warehouse: 3 records (create with IDs matching frontend)
  - Order: 10 records (clear existing, recreate with IDs matching frontend)
  - Logistics: 5 records (create with IDs matching frontend)
  - Customer: 10 records (create with IDs matching frontend)
- **FR-008c**: System MUST maintain business relationships between entity records: orders must reference existing products and customers, materials must reference existing suppliers, products must reference existing materials, etc.
- **FR-008d**: System MUST update both frontend mockData arrays and configuration backend entityConfigs Map simultaneously when recreating records, ensuring ID consistency
- **FR-009**: System MUST define entity attributes based on supply chain business domain knowledge for each entity type:
  - **Supplier**: supplierId, supplierName, contact, phone, email, address, supplyMaterials, qualityRating, certification, riskLevel
  - **Material**: materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category
  - **Factory**: factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications
  - **Product**: productId, productName, BOM, lifecycleStage, price, currentInventory, safetyStock, series, specifications
  - **Warehouse**: warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl
  - **Order**: orderId, orderName, client, productId, quantity, orderDate, dueDate, status, priority, deliveryAddress
  - **Logistics**: logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate
  - **Customer**: customerId, customerName, contact, phone, email, address, serviceRegion, orderHistory, creditRating
- **FR-010**: System MUST define entity relations based on supply chain business domain knowledge for each entity type:
  - **Supplier**: Supplies → Material (一对多), Evaluated By → SupplierEvaluation (一对多)
  - **Material**: Used By → Product (多对多/BOM), Supplied By → Supplier (多对一), Stored In → Warehouse (多对一)
  - **Factory**: Produces → Product (一对多), Uses → Material (多对多), Associated With → Warehouse (一对多), Receives → Order (一对多), Serves → Customer Region (一对多)
  - **Product**: Uses → Material (多对多/BOM), Produced By → Factory (多对一), Ordered In → Order (一对多), Stored In → Warehouse (多对一)
  - **Warehouse**: Stores → Material (一对多), Stores → Product (一对多), Associated With → Factory (多对一)
  - **Order**: Contains → Product (多对一), Placed By → Customer (多对一), Delivered By → Logistics (多对一), Produced By → Factory (多对一)
  - **Logistics**: Delivers → Order (一对多), Serves → Customer Region (一对多)
  - **Customer**: Places → Order (一对多), Served By → Logistics (多对一), Served By → Factory Region (多对一)
- **FR-011**: System MUST define entity business logic rules based on supply chain business domain knowledge for each entity type:
  - **Supplier**: Quality validation (质量合格率 > 95%), Risk assessment (风险等级计算), Delivery performance (准时交付率计算)
  - **Material**: Stock validation (库存低于安全库存预警), Purchase suggestion (采购建议计算), Usage tracking (使用量统计)
  - **Factory**: Capacity validation (产能利用率 < 90%), Quality control (质量合格率 > 98%), Efficiency calculation (生产效率计算)
  - **Product**: Stock validation (库存预警), Lifecycle trigger (生命周期阶段转换), ROI calculation (ROI计算)
  - **Warehouse**: Capacity validation (容量利用率 < 85%), Stock tracking (库存统计), Temperature control (温控验证)
  - **Order**: Delivery validation (交付日期预警), Status trigger (状态流转规则), Priority calculation (优先级计算)
  - **Logistics**: Delivery tracking (交付跟踪), Delay trigger (延迟预警), Route optimization (路线优化)
  - **Customer**: Credit validation (信用评级验证), Order frequency calculation (订单频率计算), Satisfaction tracking (满意度跟踪)
- **FR-012**: System MUST define entity actions based on supply chain business domain knowledge for each entity type:
  - **Supplier**: 供应商评估, 质量审核, 风险分析, 合同管理, 绩效跟踪
  - **Material**: 采购建议, 库存调整, 供应商切换, 价格谈判, 质量检验
  - **Factory**: 排产计划, 产能调整, 设备维护, 质量管控, 效率优化, 人员调配
  - **Product**: 生命周期管理, BOM变更, 价格调整, 库存优化, 停产决策
  - **Warehouse**: 库存盘点, 容量调整, 温控设置, 出入库管理, 库存转移
  - **Order**: 订单跟踪, 交付计划, 状态更新, 优先级调整, 取消处理
  - **Logistics**: 路线规划, 运输跟踪, 延迟处理, 成本优化, 承运商切换
  - **Customer**: 客户维护, 订单历史, 信用管理, 满意度调查, 服务区域调整
- **FR-013**: System MUST match entity permissions based on user management logic:
  - **供应链管理员 (admin)**: Full access to all entity types
  - **采购总监 (procurement)**: Read/Write access to Supplier, Material, Order (采购订单)
  - **生产总监 (production)**: Read/Write access to Factory, Product, Order (生产订单)
  - **产品总监 (product)**: Read/Write access to Product, Material (BOM), Factory (生产计划)
  - **销售总监 (sales)**: Read/Write access to Customer, Order, Logistics
- **FR-014**: System MUST synchronize entity configuration changes bidirectionally with frontend data (config changes sync to frontend, frontend changes sync to config)
- **FR-015**: System MUST display empty state when entity type has no frontend data, with option to create new entity

### Key Entities

- **Entity Configuration**: Represents complete configuration for a single entity instance, including attributes, relations, logic rules, actions, and permissions. Each configuration MUST match a frontend entity by ID.
- **Entity Attribute**: Represents a single property of an entity (e.g., factoryCode, factoryName, location). Attributes are defined based on supply chain business domain knowledge.
- **Entity Relation**: Represents a relationship between entities (e.g., Factory → Produces → Product). Relations include target type, relation type (多对多/多对一/一对多), count, and sample items.
- **Business Logic Rule**: Represents a business rule (validation, calculation, or trigger) for an entity (e.g., "库存预警", "ROI计算"). Rules are defined based on supply chain business domain knowledge.
- **Entity Action**: Represents a predefined action available for an entity type (e.g., "排产计划", "产能调整"). Actions include name, icon, color, and description.
- **Permission Configuration**: Represents access control for an entity, matching roles and users based on user management logic.

**Note**: All entity types MUST be defined in `src/types/ontology.ts` per Principle 1.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 8 entity types (supplier, material, factory, product, warehouse, order, logistics, customer) have complete attribute definitions based on supply chain business domain knowledge
- **SC-002**: All entity configurations match frontend data records by ID with 100% one-to-one correspondence
- **SC-003**: All entity types have defined relations showing relationships to other entities with correct relation types (多对多/多对一/一对多)
- **SC-004**: All entity types have at least 3 business logic rules defined (validation, calculation, or trigger) based on supply chain business domain knowledge
- **SC-005**: All entity types have at least 3 actions defined with name, icon, color, and description
- **SC-006**: Entity permissions match user management logic with role-based access control correctly applied
- **SC-007**: Entity configuration changes synchronize bidirectionally with frontend data within 1 second
- **SC-008**: Administrators can view and edit entity attributes, relations, logic rules, actions, and permissions for all 8 entity types
- **SC-009**: Empty states display correctly when entity types have no frontend data, with option to create new entity

## Assumptions

- Frontend data structure follows existing mockData.ts format with entity IDs matching configuration backend entity IDs
- Entity attributes, relations, logic rules, and actions are defined based on standard supply chain management practices
- Permission matching follows existing user management logic with 5 predefined roles (供应链管理员, 采购总监, 生产总监, 产品总监, 销售总监)
- Bidirectional synchronization updates both configuration backend and frontend data immediately when changes are saved
- Entity configurations are stored in entityConfigs Map in mockData.ts with key format "{entityType}-{entityId}"
- All entity types have at least some frontend data records to match (suppliers, materials, products, orders exist; factories, warehouses, logistics, customers may need to be created if missing)

## Dependencies

- Existing configuration backend infrastructure (ConfigBackendLayout, EntityListView, RightPanel)
- Existing entity configuration service (entityConfigService.ts) with bidirectional synchronization
- Existing user management system with 5 predefined roles
- Existing frontend mock data (mockData.ts) with entity records

## Out of Scope

- Creating new entity types beyond the 8 defined types (supplier, material, factory, product, warehouse, order, logistics, customer)
- Modifying frontend data structure or entity ID format
- Implementing actual business logic rule execution (only configuration is in scope)
- Implementing actual entity action execution (only action definition is in scope)
- Modifying user management system or role definitions

