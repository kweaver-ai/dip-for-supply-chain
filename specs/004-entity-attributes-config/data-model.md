# Data Model: 供应链对象属性配置

**Feature**: Supply Chain Entity Attributes Configuration  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This document defines the data model for populating entity configurations with complete attribute, relation, logic, action, and permission definitions for all 8 entity types. All types MUST be defined in or extend from `src/types/ontology.ts` (Principle 1 compliance).

## Entity Configuration Structure

### EntityConfig (Extended)

**Location**: `src/types/ontology.ts`

**Description**: Extended EntityConfig interface with complete attribute, relation, logic, action, and permission definitions.

**Fields**:
- `entityId: string` - Unique entity identifier (e.g., "SUP-001", "PROD-001")
- `entityType: EntityType` - Type of entity (supplier, material, factory, product, warehouse, order, logistics, customer)
- `attributes: Record<string, any>` - Complete entity attributes based on FR-009
- `relations: EntityRelation[]` - Complete entity relations based on FR-010
- `logicRules: BusinessLogicRule[]` - Complete business logic rules based on FR-011
- `actions: EntityAction[]` - Complete entity actions based on FR-012
- `permissions: PermissionConfig` - Permission configuration based on FR-013

**Relationships**:
- Stored in: `mockData.ts` as `Map<string, EntityConfig>`
- Key format: `{entityType}-{entityId}` (e.g., "supplier-SUP-001", "product-PROD-001")

## Mock Data Record Requirements

**Record Counts** (per FR-008b):
- **Supplier**: 5 records (clear existing, recreate with IDs: SUP-001 to SUP-005)
- **Material**: 20 records (clear existing, recreate with IDs: MAT-001 to MAT-020, ensure all 9 attributes displayed)
- **Factory**: 3 records (create with IDs: FAC-001 to FAC-003)
- **Product**: 4 records (keep existing: PROD-001 to PROD-004)
- **Warehouse**: 3 records (create with IDs: WH-001 to WH-003)
- **Order**: 10 records (clear existing, recreate with IDs: ORD-001 to ORD-010)
- **Logistics**: 5 records (create with IDs: LOG-001 to LOG-005)
- **Customer**: 10 records (create with IDs: CUST-001 to CUST-010)

**ID Matching Requirement** (per FR-008d):
- All entity IDs in configuration backend entityConfigs Map MUST match frontend mockData array IDs exactly
- When recreating records, both frontend mockData arrays and entityConfigs Map must be updated simultaneously
- ID format: `{ENTITY_TYPE}-{SEQUENTIAL_NUMBER}` (e.g., "SUP-001", "MAT-001")

**Business Relationship Requirements** (per FR-008c):
- Orders must reference existing products (productId must exist in productsData)
- Orders must reference existing customers (client name must match customerName in customersData)
- Materials must reference existing suppliers (supplier ID must exist in suppliersData)
- Products must reference existing materials (materialCodes must exist in materialsData)
- Factories must reference existing products (productList must contain existing product IDs)
- Warehouses must reference existing factories (associatedFactory must exist in factoriesData)

---

## Entity Attribute Definitions

### Supplier Attributes

**Entity Type**: `supplier`

**Attributes** (11 total):
- `supplierId: string` - Supplier ID (e.g., "SUP-001")
- `supplierName: string` - Supplier name (e.g., "供应商A")
- `contact: string` - Contact person name
- `phone: string` - Phone number
- `email: string` - Email address
- `address: string` - Physical address
- `supplyMaterials: string[]` - List of materials supplied (material codes)
- `qualityRating: number` - Quality rating (0-100)
- `certification: string[]` - Certifications (e.g., ["ISO9001", "ISO14001"])
- `riskLevel: 'low' | 'medium' | 'high' | 'critical'` - Risk level

**Source**: Extracted from `suppliersData` array, supplemented with business domain knowledge

---

### Material Attributes

**Entity Type**: `material`

**Attributes** (9 total - **ALL MUST BE DISPLAYED**):
- `materialCode: string` - Material code (e.g., "MAT-001")
- `materialName: string` - Material name (e.g., "钢材")
- `applicableProducts: string[]` - List of applicable product IDs
- `currentStock: number` - Current stock quantity
- `safetyStock: number` - Safety stock level
- `supplier: string` - Primary supplier ID
- `unit: string` - Unit of measurement (e.g., "kg", "m")
- `price: number` - Unit price
- `category: string` - Material category (e.g., "原材料", "半成品")

**Source**: Extracted from `materialsData` array, supplemented with business domain knowledge

**Display Requirement**: All 9 attributes MUST be displayed in the RightPanel sidebar when viewing a material entity. Current implementation may only show 4 attributes - this must be fixed.

---

### Factory Attributes

**Entity Type**: `factory`

**Attributes** (12 total):
- `factoryCode: string` - Factory code (e.g., "FAC-001")
- `factoryName: string` - Factory name (e.g., "工厂A")
- `location: string` - Geographic location
- `productionLines: number` - Number of production lines
- `totalCapacity: number` - Total production capacity (units/day)
- `capacityUtilization: number` - Current capacity utilization (0-100%)
- `efficiency: number` - Production efficiency (0-100%)
- `employeeCount: number` - Number of employees
- `productList: string[]` - List of products produced (product IDs)
- `qualityPassRate: number` - Quality pass rate (0-100%)
- `equipmentStatus: 'operational' | 'maintenance' | 'down'` - Equipment status
- `certifications: string[]` - Certifications (e.g., ["ISO9001", "ISO14001"])

**Source**: Created from business domain knowledge (may not exist in frontend data yet)

---

### Product Attributes

**Entity Type**: `product`

**Attributes** (9 total):
- `productId: string` - Product ID (e.g., "PROD-001")
- `productName: string` - Product name (e.g., "产品A")
- `BOM: string[]` - Bill of Materials (material codes)
- `lifecycleStage: 'Intro' | 'Growth' | 'Maturity' | 'Decline'` - Lifecycle stage
- `price: number` - Product price
- `currentInventory: number` - Current inventory level
- `safetyStock: number` - Safety stock level
- `series: string` - Product series
- `specifications: Record<string, any>` - Product specifications

**Source**: Extracted from `productsData` array, supplemented with business domain knowledge

---

### Warehouse Attributes

**Entity Type**: `warehouse`

**Attributes** (8 total):
- `warehouseCode: string` - Warehouse code (e.g., "WH-001")
- `warehouseName: string` - Warehouse name (e.g., "仓库A")
- `location: string` - Geographic location
- `capacity: number` - Storage capacity (units)
- `currentStock: number` - Current stock level
- `associatedFactory: string` - Associated factory ID
- `storageType: 'normal' | 'cold' | 'frozen'` - Storage type
- `temperatureControl: boolean` - Temperature control required

**Source**: Created from business domain knowledge (may not exist in frontend data yet)

---

### Order Attributes

**Entity Type**: `order`

**Attributes** (10 total):
- `orderId: string` - Order ID (e.g., "ORD-101", "SO-20231105")
- `orderName: string` - Order name (e.g., "订单-101")
- `client: string` - Client name (e.g., "客户A", "黑龙江农垦总局")
- `productId: string` - Product ID
- `quantity: number` - Order quantity
- `orderDate: string` - Order date (ISO format)
- `dueDate: string` - Due date (ISO format)
- `status: string` - Order status (e.g., "运输中", "生产中", "采购中")
- `priority: 'low' | 'medium' | 'high' | 'urgent'` - Order priority
- `deliveryAddress: string` - Delivery address

**Source**: Extracted from `ordersData` array, supplemented with business domain knowledge

---

### Logistics Attributes

**Entity Type**: `logistics`

**Attributes** (7 total):
- `logisticsId: string` - Logistics ID (e.g., "LOG-001")
- `logisticsName: string` - Logistics name (e.g., "物流A")
- `carrier: string` - Carrier name
- `transportMode: 'road' | 'rail' | 'air' | 'sea'` - Transport mode
- `serviceRegion: string[]` - Service regions
- `trackingNumber: string` - Tracking number
- `estimatedDeliveryDate: string` - Estimated delivery date (ISO format)

**Source**: Created from business domain knowledge (may not exist in frontend data yet)

---

### Customer Attributes

**Entity Type**: `customer`

**Attributes** (9 total):
- `customerId: string` - Customer ID (e.g., "CUST-001")
- `customerName: string` - Customer name (e.g., "客户A")
- `contact: string` - Contact person name
- `phone: string` - Phone number
- `email: string` - Email address
- `address: string` - Physical address
- `serviceRegion: string[]` - Service regions
- `orderHistory: string[]` - Order IDs (historical orders)
- `creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C'` - Credit rating

**Source**: Created from business domain knowledge (may not exist in frontend data yet)

---

## Entity Relation Definitions

### Supplier Relations

**Relations** (2 total):
1. **Supplies → Material** (一对多)
   - Target: `material`
   - Relation Type: `一对多`
   - Calculated from: `suppliersData` entries with same `supplierId`
   - Sample: ["MAT-001", "MAT-002"]

2. **Evaluated By → SupplierEvaluation** (一对多)
   - Target: `supplierEvaluation` (external entity)
   - Relation Type: `一对多`
   - Calculated from: `supplierEvaluationsData` entries

---

### Material Relations

**Relations** (3 total):
1. **Used By → Product** (多对多/BOM)
   - Target: `product`
   - Relation Type: `多对多`
   - Calculated from: `productsData[].materialCodes` containing material code
   - Sample: ["PROD-001", "PROD-002"]

2. **Supplied By → Supplier** (多对一)
   - Target: `supplier`
   - Relation Type: `多对一`
   - Calculated from: `suppliersData` entries with matching `materialCode`

3. **Stored In → Warehouse** (多对一)
   - Target: `warehouse`
   - Relation Type: `多对一`
   - Calculated from: Warehouse storage data (if available)

---

### Factory Relations

**Relations** (5 total):
1. **Produces → Product** (一对多)
   - Target: `product`
   - Relation Type: `一对多`
   - Calculated from: Factory `productList` attribute

2. **Uses → Material** (多对多)
   - Target: `material`
   - Relation Type: `多对多`
   - Calculated from: Products produced by factory → materials used

3. **Associated With → Warehouse** (一对多)
   - Target: `warehouse`
   - Relation Type: `一对多`
   - Calculated from: Warehouse `associatedFactory` attribute

4. **Receives → Order** (一对多)
   - Target: `order`
   - Relation Type: `一对多`
   - Calculated from: Orders assigned to factory

5. **Serves → Customer Region** (一对多)
   - Target: `customer`
   - Relation Type: `一对多`
   - Calculated from: Factory service regions matching customer regions

---

### Product Relations

**Relations** (4 total):
1. **Uses → Material** (多对多/BOM)
   - Target: `material`
   - Relation Type: `多对多`
   - Calculated from: `productsData[].materialCodes`
   - Sample: ["MAT-001", "MAT-002"]

2. **Produced By → Factory** (多对一)
   - Target: `factory`
   - Relation Type: `多对一`
   - Calculated from: Factory `productList` containing product ID

3. **Ordered In → Order** (一对多)
   - Target: `order`
   - Relation Type: `一对多`
   - Calculated from: `ordersData[].productId` matching product ID
   - Sample: ["ORD-101", "SO-20231105"]

4. **Stored In → Warehouse** (多对一)
   - Target: `warehouse`
   - Relation Type: `多对一`
   - Calculated from: Warehouse storage data (if available)

---

### Warehouse Relations

**Relations** (3 total):
1. **Stores → Material** (一对多)
   - Target: `material`
   - Relation Type: `一对多`
   - Calculated from: Warehouse storage data (if available)

2. **Stores → Product** (一对多)
   - Target: `product`
   - Relation Type: `一对多`
   - Calculated from: Warehouse storage data (if available)

3. **Associated With → Factory** (多对一)
   - Target: `factory`
   - Relation Type: `多对一`
   - Calculated from: Warehouse `associatedFactory` attribute

---

### Order Relations

**Relations** (4 total):
1. **Contains → Product** (多对一)
   - Target: `product`
   - Relation Type: `多对一`
   - Calculated from: `ordersData[].productId`
   - Sample: ["PROD-001"]

2. **Placed By → Customer** (多对一)
   - Target: `customer`
   - Relation Type: `多对一`
   - Calculated from: `ordersData[].client` matching customer name

3. **Delivered By → Logistics** (多对一)
   - Target: `logistics`
   - Relation Type: `多对一`
   - Calculated from: Order logistics assignment (if available)

4. **Produced By → Factory** (多对一)
   - Target: `factory`
   - Relation Type: `多对一`
   - Calculated from: Order factory assignment (if available)

---

### Logistics Relations

**Relations** (2 total):
1. **Delivers → Order** (一对多)
   - Target: `order`
   - Relation Type: `一对多`
   - Calculated from: Orders assigned to logistics

2. **Serves → Customer Region** (一对多)
   - Target: `customer`
   - Relation Type: `一对多`
   - Calculated from: Logistics `serviceRegion` matching customer regions

---

### Customer Relations

**Relations** (3 total):
1. **Places → Order** (一对多)
   - Target: `order`
   - Relation Type: `一对多`
   - Calculated from: `ordersData[].client` matching customer name
   - Sample: ["ORD-101", "SO-20231105"]

2. **Served By → Logistics** (多对一)
   - Target: `logistics`
   - Relation Type: `多对一`
   - Calculated from: Logistics `serviceRegion` matching customer regions

3. **Served By → Factory Region** (多对一)
   - Target: `factory`
   - Relation Type: `多对一`
   - Calculated from: Factory service regions matching customer regions

---

## Business Logic Rule Templates

### Supplier Rules

**Rules** (3 total):
1. **Quality Validation** (validation)
   - Name: "质量合格率验证"
   - Type: `validation`
   - Condition: `qualityRating > 95`
   - Level: `warning`
   - Action: Alert if quality rating below threshold

2. **Risk Assessment** (calculation)
   - Name: "风险等级计算"
   - Type: `calculation`
   - Formula: Based on qualityRating, deliveryPerformance, financialStatus
   - Unit: Risk level (low/medium/high/critical)

3. **Delivery Performance** (calculation)
   - Name: "准时交付率计算"
   - Type: `calculation`
   - Formula: `onTimeDeliveries / totalDeliveries * 100`
   - Unit: Percentage

---

### Material Rules

**Rules** (3 total):
1. **Stock Validation** (validation)
   - Name: "库存预警"
   - Type: `validation`
   - Condition: `currentStock < safetyStock`
   - Level: `warning`
   - Action: Trigger purchase suggestion

2. **Purchase Suggestion** (calculation)
   - Name: "采购建议计算"
   - Type: `calculation`
   - Formula: `safetyStock * 2 - currentStock`
   - Unit: Quantity

3. **Usage Tracking** (calculation)
   - Name: "使用量统计"
   - Type: `calculation`
   - Formula: Sum of usage across all products
   - Unit: Quantity

---

### Factory Rules

**Rules** (3 total):
1. **Capacity Validation** (validation)
   - Name: "产能利用率验证"
   - Type: `validation`
   - Condition: `capacityUtilization < 90`
   - Level: `warning`
   - Action: Alert if capacity utilization too high

2. **Quality Control** (validation)
   - Name: "质量合格率验证"
   - Type: `validation`
   - Condition: `qualityPassRate > 98`
   - Level: `critical`
   - Action: Alert if quality below threshold

3. **Efficiency Calculation** (calculation)
   - Name: "生产效率计算"
   - Type: `calculation`
   - Formula: `actualOutput / plannedOutput * 100`
   - Unit: Percentage

---

### Product Rules

**Rules** (3 total):
1. **Stock Validation** (validation)
   - Name: "库存预警"
   - Type: `validation`
   - Condition: `currentInventory < safetyStock`
   - Level: `warning`
   - Action: Trigger production or purchase

2. **Lifecycle Trigger** (trigger)
   - Name: "生命周期阶段转换"
   - Type: `trigger`
   - Condition: Based on sales volume, time, ROI
   - Action: Transition to next lifecycle stage

3. **ROI Calculation** (calculation)
   - Name: "ROI计算"
   - Type: `calculation`
   - Formula: `(revenue - cost) / cost * 100`
   - Unit: Percentage

---

### Warehouse Rules

**Rules** (3 total):
1. **Capacity Validation** (validation)
   - Name: "容量利用率验证"
   - Type: `validation`
   - Condition: `currentStock / capacity < 0.85`
   - Level: `warning`
   - Action: Alert if capacity utilization too high

2. **Stock Tracking** (calculation)
   - Name: "库存统计"
   - Type: `calculation`
   - Formula: Sum of all stored items
   - Unit: Quantity

3. **Temperature Control** (validation)
   - Name: "温控验证"
   - Type: `validation`
   - Condition: `temperatureControl === true && temperature within range`
   - Level: `critical`
   - Action: Alert if temperature out of range

---

### Order Rules

**Rules** (3 total):
1. **Delivery Validation** (validation)
   - Name: "交付日期预警"
   - Type: `validation`
   - Condition: `dueDate - currentDate < 7 days && status === '采购中'`
   - Level: `warning`
   - Action: Alert if delivery date approaching

2. **Status Trigger** (trigger)
   - Name: "状态流转规则"
   - Type: `trigger`
   - Condition: Based on order progress
   - Action: Transition to next status

3. **Priority Calculation** (calculation)
   - Name: "优先级计算"
   - Type: `calculation`
   - Formula: Based on dueDate, quantity, client importance
   - Unit: Priority level (low/medium/high/urgent)

---

### Logistics Rules

**Rules** (3 total):
1. **Delivery Tracking** (calculation)
   - Name: "交付跟踪"
   - Type: `calculation`
   - Formula: Track delivery progress
   - Unit: Percentage complete

2. **Delay Trigger** (trigger)
   - Name: "延迟预警"
   - Type: `trigger`
   - Condition: `estimatedDeliveryDate < currentDate`
   - Action: Alert if delivery delayed

3. **Route Optimization** (calculation)
   - Name: "路线优化"
   - Type: `calculation`
   - Formula: Optimize delivery route
   - Unit: Distance/time saved

---

### Customer Rules

**Rules** (3 total):
1. **Credit Validation** (validation)
   - Name: "信用评级验证"
   - Type: `validation`
   - Condition: `creditRating >= 'BBB'`
   - Level: `warning`
   - Action: Alert if credit rating too low

2. **Order Frequency Calculation** (calculation)
   - Name: "订单频率计算"
   - Type: `calculation`
   - Formula: `orderCount / timePeriod`
   - Unit: Orders per month

3. **Satisfaction Tracking** (calculation)
   - Name: "满意度跟踪"
   - Type: `calculation`
   - Formula: Average satisfaction score
   - Unit: Score (0-100)

---

## Entity Action Templates

### Supplier Actions

**Actions** (5 total):
1. **供应商评估** - "Evaluate supplier performance and quality"
   - Icon: `Users`
   - Color: `emerald`
   
2. **质量审核** - "Review supplier quality metrics"
   - Icon: `CheckCircle2`
   - Color: `blue`
   
3. **风险分析** - "Analyze supplier risk factors"
   - Icon: `AlertTriangle`
   - Color: `amber`
   
4. **合同管理** - "Manage supplier contracts"
   - Icon: `FileText`
   - Color: `indigo`
   
5. **绩效跟踪** - "Track supplier performance over time"
   - Icon: `TrendingUp`
   - Color: `purple`

---

### Material Actions

**Actions** (5 total):
1. **采购建议** - "Generate purchase recommendations"
   - Icon: `ShoppingCart`
   - Color: `blue`
   
2. **库存调整** - "Adjust material inventory levels"
   - Icon: `Package`
   - Color: `indigo`
   
3. **供应商切换** - "Switch material supplier"
   - Icon: `RefreshCw`
   - Color: `amber`
   
4. **价格谈判** - "Negotiate material prices"
   - Icon: `DollarSign`
   - Color: `emerald`
   
5. **质量检验** - "Inspect material quality"
   - Icon: `CheckCircle2`
   - Color: `blue`

---

### Factory Actions

**Actions** (6 total):
1. **排产计划** - "Create production scheduling plan"
   - Icon: `Calendar`
   - Color: `blue`
   
2. **产能调整** - "Adjust factory capacity"
   - Icon: `Settings`
   - Color: `indigo`
   
3. **设备维护** - "Schedule equipment maintenance"
   - Icon: `Wrench`
   - Color: `amber`
   
4. **质量管控** - "Control production quality"
   - Icon: `Shield`
   - Color: `emerald`
   
5. **效率优化** - "Optimize production efficiency"
   - Icon: `TrendingUp`
   - Color: `purple`
   
6. **人员调配** - "Manage factory workforce"
   - Icon: `Users`
   - Color: `pink`

---

### Product Actions

**Actions** (5 total):
1. **生命周期管理** - "Manage product lifecycle stages"
   - Icon: `Lifecycle`
   - Color: `purple`
   
2. **BOM变更** - "Modify Bill of Materials"
   - Icon: `GitBranch`
   - Color: `indigo`
   
3. **价格调整** - "Adjust product pricing"
   - Icon: `DollarSign`
   - Color: `emerald`
   
4. **库存优化** - "Optimize product inventory"
   - Icon: `Package`
   - Color: `blue`
   
5. **停产决策** - "Make product discontinuation decision"
   - Icon: `XCircle`
   - Color: `red`

---

### Warehouse Actions

**Actions** (5 total):
1. **库存盘点** - "Conduct warehouse inventory audit"
   - Icon: `ClipboardList`
   - Color: `blue`
   
2. **容量调整** - "Adjust warehouse capacity"
   - Icon: `Maximize2`
   - Color: `indigo`
   
3. **温控设置** - "Configure temperature control"
   - Icon: `Thermometer`
   - Color: `cyan`
   
4. **出入库管理** - "Manage inbound and outbound operations"
   - Icon: `ArrowLeftRight`
   - Color: `emerald`
   
5. **库存转移** - "Transfer inventory between warehouses"
   - Icon: `Truck`
   - Color: `amber`

---

### Order Actions

**Actions** (5 total):
1. **订单跟踪** - "Track order progress"
   - Icon: `MapPin`
   - Color: `blue`
   
2. **交付计划** - "Plan order delivery schedule"
   - Icon: `Calendar`
   - Color: `indigo`
   
3. **状态更新** - "Update order status"
   - Icon: `RefreshCw`
   - Color: `amber`
   
4. **优先级调整** - "Adjust order priority"
   - Icon: `ArrowUp`
   - Color: `red`
   
5. **取消处理** - "Handle order cancellation"
   - Icon: `XCircle`
   - Color: `red`

---

### Logistics Actions

**Actions** (5 total):
1. **路线规划** - "Plan delivery routes"
   - Icon: `Map`
   - Color: `blue`
   
2. **运输跟踪** - "Track shipment progress"
   - Icon: `Truck`
   - Color: `indigo`
   
3. **延迟处理** - "Handle delivery delays"
   - Icon: `Clock`
   - Color: `amber`
   
4. **成本优化** - "Optimize logistics costs"
   - Icon: `DollarSign`
   - Color: `emerald`
   
5. **承运商切换** - "Switch logistics carrier"
   - Icon: `RefreshCw`
   - Color: `purple`

---

### Customer Actions

**Actions** (5 total):
1. **客户维护** - "Maintain customer information"
   - Icon: `User`
   - Color: `blue`
   
2. **订单历史** - "View customer order history"
   - Icon: `History`
   - Color: `indigo`
   
3. **信用管理** - "Manage customer credit"
   - Icon: `CreditCard`
   - Color: `emerald`
   
4. **满意度调查** - "Conduct customer satisfaction survey"
   - Icon: `Star`
   - Color: `amber`
   
5. **服务区域调整** - "Adjust customer service regions"
   - Icon: `MapPin`
   - Color: `purple`

---

## Permission Configuration

### Role-Based Access Control

**Default Permissions** (based on FR-013):

1. **供应链管理员 (admin)**:
   - Full access to all entity types
   - Roles: `['admin']`
   - Users: All admin users

2. **采购总监 (procurement)**:
   - Read/Write: Supplier, Material, Order (采购订单)
   - Roles: `['procurement']`
   - Users: Procurement department users

3. **生产总监 (production)**:
   - Read/Write: Factory, Product, Order (生产订单)
   - Roles: `['production']`
   - Users: Production department users

4. **产品总监 (product)**:
   - Read/Write: Product, Material (BOM), Factory (生产计划)
   - Roles: `['product']`
   - Users: Product department users

5. **销售总监 (sales)**:
   - Read/Write: Customer, Order, Logistics
   - Roles: `['sales']`
   - Users: Sales department users

---

## Data Population Strategy

### Population Function

**Function**: `populateEntityConfigs()`

**Location**: `src/utils/entityConfigService.ts`

**Process**:
1. Iterate through all frontend entity arrays:
   - `suppliersData` → Create supplier configs
   - `materialsData` → Create material configs
   - `productsData` → Create product configs
   - `ordersData` → Create order configs
   - Create factory configs (if frontend data exists or use defaults)
   - Create warehouse configs (if frontend data exists or use defaults)
   - Create logistics configs (if frontend data exists or use defaults)
   - Create customer configs (if frontend data exists or use defaults)

2. For each entity:
   - Extract attributes from frontend data
   - Calculate relations from frontend data relationships
   - Add predefined logic rules (templates)
   - Add predefined actions (templates)
   - Set default permissions based on entity type and role scope

3. Store in `entityConfigs` Map with key format `{entityType}-{entityId}`

---

## Validation Rules

- Entity ID must match frontend entity ID exactly (one-to-one correspondence)
- All required attributes must be present (use defaults if missing)
- Relations must reference valid entity types and IDs
- Logic rules must have valid rule types (validation, calculation, trigger)
- Actions must have valid icon names (Lucide React) and colors (Tailwind)
- Permissions must reference valid role IDs and user IDs

---

## Summary

Complete data model for populating entity configurations with:
- 8 entity types × 8-12 attributes each = ~80 attribute definitions
- 8 entity types × 2-5 relations each = ~24 relation definitions
- 8 entity types × 3 rules each = ~24 rule templates
- 8 entity types × 5-6 actions each = ~40 action templates
- 5 role-based permission configurations

All configurations match frontend data by ID with 100% one-to-one correspondence.

