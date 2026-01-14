# Ontology表关联关系分析报告

## 一、关系概览

- 总关系数: 21
- 实体→事件关系: 19
- 事件→事件关系: 2

---

## 二、实体表关联关系

### Customer Entity

**表名**: `customer_entity`
**关联的事件表数量**: 2

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `sales_order_event` | `customer_id` | One-to-Many | 一个客户可以有多个销售订单 |
| `shipment_event` | `customer_id` | One-to-Many | 一个客户可以有多次收货记录 |

---

### Factory Entity

**表名**: `factory_entity`
**关联的事件表数量**: 1

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `production_order_event` | `factory_id` | One-to-Many | 一个工厂可以有多个生产订单 |

---

### Material Entity

**表名**: `material_entity`
**关联的事件表数量**: 6

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `bom_event` | `child_id` | One-to-Many | 一个物料可以被多个BOM引用（作为子项） |
| `bom_event` | `parent_id (when parent_type=Material)` | One-to-Many | 一个物料组件可以有下级物料（物料作为父项） |
| `production_order_event` | `material_id` | One-to-Many | 一个物料可以在多个生产订单中被需求 |
| `material_procurement_event` | `material_id` | One-to-Many | 一个物料可以有多次采购记录 |
| `purchase_order_event` | `material_id` | One-to-Many | 一个物料可以在多个采购订单中 |
| `inventory_event` | `item_id (when item_type=Material)` | One-to-Many | 一个物料可以有多个库存快照 |

---

### Product Entity

**表名**: `product_entity`
**关联的事件表数量**: 5

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `bom_event` | `parent_id (when parent_type=Product)` | One-to-Many | 一个产品可以有多个BOM组成记录（产品作为父项） |
| `production_order_event` | `product_id` | One-to-Many | 一个产品可以有多个生产订单 |
| `sales_order_event` | `product_id` | One-to-Many | 一个产品可以在多个销售订单中 |
| `shipment_event` | `product_id` | One-to-Many | 一个产品可以有多次发货记录 |
| `inventory_event` | `item_id (when item_type=Product)` | One-to-Many | 一个产品可以有多个库存快照 |

---

### Supplier Entity

**表名**: `supplier_entity`
**关联的事件表数量**: 2

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `material_procurement_event` | `supplier_id` | One-to-Many | 一个供应商可以有多次物料采购记录 |
| `purchase_order_event` | `supplier_id` | One-to-Many | 一个供应商可以有多个采购订单 |

---

### Warehouse Entity

**表名**: `warehouse_entity`
**关联的事件表数量**: 3

| 目标事件表 | 外键字段 | 关系类型 | 说明 |
|-----------|---------|---------|------|
| `inventory_event` | `warehouse_id` | One-to-Many | 一个仓库可以有多个库存记录 |
| `shipment_event` | `warehouse_id` | One-to-Many | 一个仓库可以有多次发货记录 |
| `material_procurement_event` | `warehouse_id` | One-to-Many | 一个仓库可以接收多次物料采购 |

---

## 三、事件表间关联关系

| 源事件表 | 源字段 | 目标事件表 | 目标字段 | 关系类型 | 说明 |
|---------|-------|-----------|---------|---------|------|
| `sales_order_event` | `sales_order_number` | `shipment_event` | `sales_order_number` | One-to-Many | 一个销售订单可以分多次发货 |
| `purchase_order_event` | `purchase_order_number` | `material_procurement_event` | `purchase_order_number` | One-to-One | 采购订单与物料采购事件一对一关联 |

---

## 四、供应链数据流向分析

### 完整供应链流程

```
Supplier (供应商)
    ↓
Purchase Order Event (采购订单)
    ↓
Material Procurement Event (物料采购)
    ↓
Warehouse (仓库) → Inventory Event (库存)
    ↓
Material (物料) → BOM Event (BOM关系) ← Product (产品)
    ↓
Production Order Event (生产订单) ← Factory (工厂)
    ↓
Product (成品) → Inventory Event (库存)
    ↓
Sales Order Event (销售订单) ← Customer (客户)
    ↓
Shipment Event (发货) → Customer (客户)
```

### 核心实体连接度

| 实体表 | 连接的事件表数量 | 重要性 |
|-------|----------------|--------|
| Material | 6 | ⭐⭐⭐ 核心实体 |
| Product | 5 | ⭐⭐⭐ 核心实体 |
| Warehouse | 3 | ⭐⭐ 重要实体 |
| Customer | 2 | ⭐⭐ 重要实体 |
| Supplier | 2 | ⭐⭐ 重要实体 |
| Factory | 1 | ⭐ 一般实体 |

---

## 五、ER关系图（简化版）

```
┌─────────────────┐
│  Supplier       │
│  供应商实体      │
└────────┬────────┘
         │ 1:N
         ↓
┌─────────────────┐       ┌─────────────────┐
│ Purchase Order  │──────→│ Material        │
│ 采购订单事件     │       │ 物料实体         │
└─────────────────┘       └────────┬────────┘
         │                         │ 1:N
         │ 1:1                     ↓
         ↓                ┌─────────────────┐
┌─────────────────┐       │   BOM Event     │
│Material Procure │       │  BOM关系事件    │
│ 物料采购事件     │       └────────┬────────┘
└────────┬────────┘                │
         │ N:1                     │ N:1
         ↓                         ↓
┌─────────────────┐       ┌─────────────────┐
│   Warehouse     │       │    Product      │
│   仓库实体       │       │    产品实体      │
└────────┬────────┘       └────────┬────────┘
         │ 1:N                     │ 1:N
         ↓                         ↓
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Inventory Event │       │Production Order │←──────│    Factory      │
│  库存事件        │       │  生产订单事件    │       │    工厂实体      │
└─────────────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         │                         │ N:1
         ↓                         ↓
┌─────────────────┐       ┌─────────────────┐
│    Customer     │←──────│ Sales Order     │
│    客户实体      │       │  销售订单事件    │
└────────┬────────┘       └────────┬────────┘
         │ 1:N                     │ 1:N
         ↓                         ↓
┌─────────────────┐       ┌─────────────────┐
│ Shipment Event  │←──────│   Warehouse     │
│   发货事件       │       │   仓库实体       │
└─────────────────┘       └─────────────────┘
```

---

## 六、关键观察与建议

### 1. 核心实体识别

**Product (产品)** 和 **Material (物料)** 是连接度最高的实体：
- Product: 连接5个事件表（BOM、生产订单、销售订单、发货、库存）
- Material: 连接6个事件表（BOM、生产订单、采购订单、物料采购、库存、采购订单）

### 2. 数据完整性约束

**必须的外键约束**:

```sql
-- Sales Order Event
FOREIGN KEY (customer_id) REFERENCES customer_entity(customer_id)
FOREIGN KEY (product_id) REFERENCES product_entity(product_id)

-- Production Order Event
FOREIGN KEY (product_id) REFERENCES product_entity(product_id)
FOREIGN KEY (material_id) REFERENCES material_entity(material_id)
FOREIGN KEY (factory_id) REFERENCES factory_entity(factory_id)

-- Shipment Event
FOREIGN KEY (warehouse_id) REFERENCES warehouse_entity(warehouse_id)
FOREIGN KEY (customer_id) REFERENCES customer_entity(customer_id)
FOREIGN KEY (product_id) REFERENCES product_entity(product_id)

-- Material Procurement Event
FOREIGN KEY (supplier_id) REFERENCES supplier_entity(supplier_id)
FOREIGN KEY (material_id) REFERENCES material_entity(material_id)
FOREIGN KEY (warehouse_id) REFERENCES warehouse_entity(warehouse_id)

-- BOM Event
FOREIGN KEY (parent_id) REFERENCES product_entity(product_id) OR material_entity(material_id)
FOREIGN KEY (child_id) REFERENCES material_entity(material_id)
```

### 3. 查询模式建议

**常见查询场景**:

1. **产品溯源**: Product → BOM → Material → Supplier
2. **订单履行**: Sales Order → Production Order → Shipment
3. **库存追踪**: Material/Product → Inventory → Warehouse
4. **成本分析**: Product → BOM → Material → Purchase Order
5. **客户订单**: Customer → Sales Order → Shipment

### 4. 索引建议

**高频查询字段应建立索引**:

```sql
-- Event表的外键字段
CREATE INDEX idx_sales_order_customer ON sales_order_event(customer_id);
CREATE INDEX idx_sales_order_product ON sales_order_event(product_id);
CREATE INDEX idx_shipment_customer ON shipment_event(customer_id);
CREATE INDEX idx_shipment_warehouse ON shipment_event(warehouse_id);
CREATE INDEX idx_production_factory ON production_order_event(factory_id);
CREATE INDEX idx_procurement_supplier ON material_procurement_event(supplier_id);

-- 业务查询字段
CREATE INDEX idx_sales_order_number ON sales_order_event(sales_order_number);
CREATE INDEX idx_shipment_number ON shipment_event(shipment_number);
CREATE INDEX idx_inventory_date ON inventory_event(snapshot_date);
```
