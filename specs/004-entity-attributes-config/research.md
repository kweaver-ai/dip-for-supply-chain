# Research: 供应链对象属性配置

**Feature**: Supply Chain Entity Attributes Configuration  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This document captures research findings and decisions for populating entity configurations with complete attribute, relation, logic, action, and permission definitions for all 8 entity types in the configuration backend.

## Research Questions

### RQ-011: How to fix material attribute display issue in RightPanel sidebar?

**Context**: Material entity detail panel sidebar currently only displays 4 attributes, but should display all 9 attributes (materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category) per FR-008a.

**Research**:
- RightPanel.tsx uses `getEntityDisplayFields()` helper function to filter attributes
- Current implementation may be filtering out some material attributes
- Need to ensure all 9 material attributes are included in display

**Decision**: Update `getEntityDisplayFields()` function in RightPanel.tsx to include all 9 material attributes. Alternatively, update the attribute rendering logic to show all attributes regardless of filtering.

**Rationale**: User requirement explicitly states all 9 material attributes must be displayed. Current implementation is incomplete.

**Alternatives Considered**:
- Option A: Update getEntityDisplayFields helper function to include all material attributes
- Option B: Update RightPanel attribute rendering logic to show all attributes regardless of type
- Option C: Create material-specific attribute display component

**Chosen**: Option A - Update getEntityDisplayFields helper function, as it's the most maintainable approach and follows existing patterns.

---

### RQ-012: How to recreate mock data records with specified quantities while maintaining ID consistency?

**Context**: Need to recreate mock data records with specific quantities (Supplier: 5, Material: 20, Factory: 3, Warehouse: 3, Order: 10, Logistics: 5, Customer: 10) while ensuring IDs match between frontend mockData arrays and configuration backend entityConfigs Map per FR-008b, FR-008c, FR-008d.

**Research**:
- Current mockData.ts has existing records that need to be cleared and recreated
- Need to maintain business relationships (orders reference products/customers, materials reference suppliers, etc.)
- Both frontend mockData arrays and entityConfigs Map must be updated simultaneously

**Decision**: Create a new function `recreateMockDataRecords()` that:
1. Clears existing records from both frontend mockData arrays and entityConfigs Map
2. Creates new records with sequential IDs (e.g., SUP-001 to SUP-005, MAT-001 to MAT-020)
3. Ensures business relationships are maintained (orders reference existing products/customers, materials reference existing suppliers, etc.)
4. Calls populateEntityConfigs() after creating records to sync entityConfigs Map

**Rationale**: 
- User requirement specifies exact record counts and ID matching
- Need to ensure data consistency between frontend and config backend
- Business relationships must be maintained for realistic data

**Alternatives Considered**:
- Option A: Create records sequentially, ensuring dependencies exist before creating dependent records
- Option B: Create all records first, then establish relationships
- Option C: Use a dependency graph to determine creation order

**Chosen**: Option A - Sequential creation with dependency checking, as it ensures data integrity and is easier to debug.

---

### RQ-001: How to populate entityConfigs Map with complete attribute definitions for all 8 entity types?

**Context**: The entityConfigs Map in mockData.ts currently has minimal entries. We need to populate it with complete configurations for all entities matching frontend data by ID.

**Research**:
- Existing entityConfigs Map structure uses key format "{entityType}-{entityId}"
- Frontend data exists in suppliersData, materialsData, productsData, ordersData arrays
- Some entity types (factory, warehouse, logistics, customer) may not have frontend data yet

**Decision**: Create a helper function `populateEntityConfigs()` that:
1. Iterates through all frontend entity arrays
2. For each entity, creates/updates entityConfigs entry with:
   - Complete attribute list from FR-009 (extracted from entity data + business domain knowledge)
   - Calculated relations from FR-010 (based on frontend data relationships)
   - Predefined logic rules from FR-011 (templates instantiated per entity)
   - Predefined actions from FR-012 (templates with name, icon, color, description)
   - Default permissions from FR-013 (based on entity type and role scope)

**Rationale**: Centralized population function ensures consistency and makes it easy to regenerate configurations when frontend data changes.

**Alternatives Considered**:
- Manual configuration entry: Too time-consuming and error-prone
- Separate configuration files: Adds complexity, harder to maintain sync with frontend data
- Database storage: Overkill for in-memory mock data

---

### RQ-002: How to define entity attributes based on supply chain business domain knowledge?

**Context**: Each entity type needs 8-12 attributes defined based on supply chain business domain knowledge (e.g., Factory: 12 attributes).

**Research**:
- FR-009 provides detailed attribute lists for each entity type
- Attributes should be extracted from frontend entity data where available
- Missing attributes should use default values or be marked as optional

**Decision**: Use the detailed attribute lists from FR-009:
- **Supplier**: supplierId, supplierName, contact, phone, email, address, supplyMaterials, qualityRating, certification, riskLevel
- **Material**: materialCode, materialName, applicableProducts, currentStock, safetyStock, supplier, unit, price, category
- **Factory**: factoryCode, factoryName, location, productionLines, totalCapacity, capacityUtilization, efficiency, employeeCount, productList, qualityPassRate, equipmentStatus, certifications
- **Product**: productId, productName, BOM, lifecycleStage, price, currentInventory, safetyStock, series, specifications
- **Warehouse**: warehouseCode, warehouseName, location, capacity, currentStock, associatedFactory, storageType, temperatureControl
- **Order**: orderId, orderName, client, productId, quantity, orderDate, dueDate, status, priority, deliveryAddress
- **Logistics**: logisticsId, logisticsName, carrier, transportMode, serviceRegion, trackingNumber, estimatedDeliveryDate
- **Customer**: customerId, customerName, contact, phone, email, address, serviceRegion, orderHistory, creditRating

**Rationale**: These attributes represent standard supply chain management data points and align with industry best practices.

**Alternatives Considered**:
- Generic attribute system: Too flexible, loses domain-specific meaning
- Minimal attributes: Insufficient for comprehensive configuration

---

### RQ-003: How to define entity relations based on supply chain business domain knowledge?

**Context**: Each entity type needs 2-5 relations defined showing relationships to other entities (e.g., Factory → Produces → Product).

**Research**:
- FR-010 provides detailed relation definitions for each entity type
- Relations can be calculated from frontend data (e.g., Product.materialCodes → Material relation)
- Relation types: 多对多, 多对一, 一对多

**Decision**: Use the detailed relation definitions from FR-010:
- **Supplier**: Supplies → Material (一对多), Evaluated By → SupplierEvaluation (一对多)
- **Material**: Used By → Product (多对多/BOM), Supplied By → Supplier (多对一), Stored In → Warehouse (多对一)
- **Factory**: Produces → Product (一对多), Uses → Material (多对多), Associated With → Warehouse (一对多), Receives → Order (一对多), Serves → Customer Region (一对多)
- **Product**: Uses → Material (多对多/BOM), Produced By → Factory (多对一), Ordered In → Order (一对多), Stored In → Warehouse (多对一)
- **Warehouse**: Stores → Material (一对多), Stores → Product (一对多), Associated With → Factory (多对一)
- **Order**: Contains → Product (多对一), Placed By → Customer (多对一), Delivered By → Logistics (多对一), Produced By → Factory (多对一)
- **Logistics**: Delivers → Order (一对多), Serves → Customer Region (一对多)
- **Customer**: Places → Order (一对多), Served By → Logistics (多对一), Served By → Factory Region (多对一)

**Rationale**: These relations represent standard supply chain relationships and can be calculated from frontend data relationships.

**Alternatives Considered**:
- Manual relation entry: Too time-consuming
- Automatic relation detection only: May miss business domain relationships not in data

---

### RQ-004: How to define business logic rules based on supply chain business domain knowledge?

**Context**: Each entity type needs 3+ business logic rules defined (validation, calculation, or trigger).

**Research**:
- FR-011 provides detailed logic rule definitions for each entity type
- Rules are templates that can be instantiated for each entity
- Rule types: validation, calculation, trigger

**Decision**: Use the detailed logic rule definitions from FR-011:
- **Supplier**: Quality validation (质量合格率 > 95%), Risk assessment (风险等级计算), Delivery performance (准时交付率计算)
- **Material**: Stock validation (库存低于安全库存预警), Purchase suggestion (采购建议计算), Usage tracking (使用量统计)
- **Factory**: Capacity validation (产能利用率 < 90%), Quality control (质量合格率 > 98%), Efficiency calculation (生产效率计算)
- **Product**: Stock validation (库存预警), Lifecycle trigger (生命周期阶段转换), ROI calculation (ROI计算)
- **Warehouse**: Capacity validation (容量利用率 < 85%), Stock tracking (库存统计), Temperature control (温控验证)
- **Order**: Delivery validation (交付日期预警), Status trigger (状态流转规则), Priority calculation (优先级计算)
- **Logistics**: Delivery tracking (交付跟踪), Delay trigger (延迟预警), Route optimization (路线优化)
- **Customer**: Credit validation (信用评级验证), Order frequency calculation (订单频率计算), Satisfaction tracking (满意度跟踪)

**Rationale**: These rules represent standard supply chain business logic and can be configured per entity.

**Alternatives Considered**:
- Generic rule system: Too flexible, loses domain-specific meaning
- Hardcoded rules: Not configurable, harder to maintain

---

### RQ-005: How to define entity actions based on supply chain business domain knowledge?

**Context**: Each entity type needs 5-6 actions defined with name, icon, color, and description.

**Research**:
- FR-012 provides detailed action definitions for each entity type
- Actions use Lucide React icons and Tailwind colors
- Actions are predefined templates

**Decision**: Use the detailed action definitions from FR-012:
- **Supplier**: 供应商评估, 质量审核, 风险分析, 合同管理, 绩效跟踪
- **Material**: 采购建议, 库存调整, 供应商切换, 价格谈判, 质量检验
- **Factory**: 排产计划, 产能调整, 设备维护, 质量管控, 效率优化, 人员调配
- **Product**: 生命周期管理, BOM变更, 价格调整, 库存优化, 停产决策
- **Warehouse**: 库存盘点, 容量调整, 温控设置, 出入库管理, 库存转移
- **Order**: 订单跟踪, 交付计划, 状态更新, 优先级调整, 取消处理
- **Logistics**: 路线规划, 运输跟踪, 延迟处理, 成本优化, 承运商切换
- **Customer**: 客户维护, 订单历史, 信用管理, 满意度调查, 服务区域调整

**Rationale**: These actions represent standard supply chain operations and provide clear user guidance.

**Alternatives Considered**:
- Generic action system: Too flexible, loses domain-specific meaning
- Minimal actions: Insufficient for comprehensive configuration

---

### RQ-006: How to match entity permissions based on user management logic?

**Context**: Each entity type needs permission configuration based on 5 predefined roles (供应链管理员, 采购总监, 生产总监, 产品总监, 销售总监).

**Research**:
- FR-013 provides detailed permission mappings
- Role-based access control (RBAC) is standard practice
- Permissions are based on role scope

**Decision**: Use the detailed permission mappings from FR-013:
- **供应链管理员 (admin)**: Full access to all entity types
- **采购总监 (procurement)**: Read/Write access to Supplier, Material, Order (采购订单)
- **生产总监 (production)**: Read/Write access to Factory, Product, Order (生产订单)
- **产品总监 (product)**: Read/Write access to Product, Material (BOM), Factory (生产计划)
- **销售总监 (sales)**: Read/Write access to Customer, Order, Logistics

**Rationale**: Role-based permissions align with organizational structure and provide appropriate access control.

**Alternatives Considered**:
- User-specific permissions only: Too granular, harder to manage
- Open access: Security risk

---

## Technology Choices

**Entity Configuration Storage**: In-memory Map (entityConfigs) in mockData.ts
- **Rationale**: Simple, fast, matches existing architecture
- **Alternatives**: Database (overkill), separate files (harder to sync)

**Attribute Definition**: TypeScript Record<string, any> in EntityConfig.attributes
- **Rationale**: Flexible, allows entity-specific attributes
- **Alternatives**: Strict typing (too rigid for diverse entity types)

**Relation Calculation**: Analyze frontend data relationships
- **Rationale**: Ensures accuracy, maintains sync with frontend data
- **Alternatives**: Manual entry (error-prone)

**Rule Templates**: Predefined templates instantiated per entity
- **Rationale**: Consistent, maintainable, domain-specific
- **Alternatives**: Generic rule system (too flexible)

**Action Templates**: Predefined templates with Lucide icons and Tailwind colors
- **Rationale**: Consistent UI, domain-specific actions
- **Alternatives**: Generic action system (too flexible)

**Permission Matching**: Role-based access control (RBAC)
- **Rationale**: Standard practice, aligns with user management system
- **Alternatives**: User-specific permissions (too granular)

## Summary

All research questions resolved. Key decisions:
1. Centralized population function for entityConfigs Map
2. Detailed attribute, relation, logic, and action definitions from FR-009 to FR-012
3. Role-based permission matching from FR-013
4. Bidirectional synchronization with frontend data
5. Material attribute display fix: Update getEntityDisplayFields to show all 9 attributes
6. Mock data recreation: Create recreateMockDataRecords() function with sequential creation and dependency checking

Ready for Phase 1 design.

