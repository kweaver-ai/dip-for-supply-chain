# ID 与 Code 字段区别说明

## 一、基本区别

### ID（标识符）
- **用途**：系统内部唯一标识，主要用于数据库主键和表间关联
- **格式**：简单，通常为纯数字或简单字母+数字组合
- **特点**：无业务含义，仅用于技术层面的唯一性标识
- **示例**：
  - `customer_id`: `10001`, `10002`, `10003`
  - `product_id`: `P0001`, `P0002`, `P0003`
  - `material_id`: `M0001`, `M0002`, `M0003`
  - `supplier_id`: `SUP-001`, `SUP-002`
  - `factory_id`: `FAC001`, `FAC002`
  - `warehouse_id`: `WH001`, `WH002`

### Code（业务编码）
- **用途**：业务编码，供业务人员识别和使用
- **格式**：复杂，通常包含业务规则和含义
- **特点**：有业务含义，便于业务人员理解和记忆
- **示例**：
  - `customer_code`: `CUST-10001`（客户编码，带前缀）
  - `product_code`: `UAV-XF-BASIC`（产品编码，包含产品系列和型号）
  - `material_code`: `ASSY-BODY-PLA-01`（物料编码，包含类型和规格）
  - `supplier_code`: `SUP-001`（供应商编码，与ID相同）
  - `factory_code`: `SZ-TIANYI-ASSY`（工厂编码，包含地理位置和类型）
  - `warehouse_code`: `WH-华中-01`（仓库编码，包含区域和序号）

## 二、各表对比示例

### 1. 实体表（Entity Tables）

| 表名 | ID字段 | Code字段 | 区别说明 |
|------|--------|----------|----------|
| `customer_entity` | `customer_id`: `10001` | `customer_code`: `CUST-10001` | Code添加了业务前缀 |
| `product_entity` | `product_id`: `P0001` | `product_code`: `UAV-XF-BASIC` | Code包含产品系列和型号信息 |
| `material_entity` | `material_id`: `M0001` | `material_code`: `ASSY-BODY-PLA-01` | Code包含物料类型和规格 |
| `supplier_entity` | `supplier_id`: `SUP-001` | `supplier_code`: `SUP-001` | ID和Code相同 |
| `factory_entity` | `factory_id`: `FAC001` | `factory_code`: `SZ-TIANYI-ASSY` | Code包含地理位置和工厂类型 |
| `warehouse_entity` | `warehouse_id`: `WH001` | `warehouse_code`: `WH-华中-01` | Code包含区域信息 |

### 2. 事件表（Event Tables）

| 表名 | ID字段 | Code/Number字段 | 区别说明 |
|------|--------|-----------------|----------|
| `sales_order_event` | `sales_order_id`: `SO0000001` | `sales_order_number`: `SO-202303-00001` | Number包含日期和业务规则 |
| `purchase_order_event` | `purchase_order_id`: `PO0000001` | `purchase_order_number`: `PO-2024040001` | Number包含日期信息 |
| `production_order_event` | `production_order_id`: `PO0000007` | `production_order_number`: `MO-202305001` | Number包含日期和订单类型 |

## 三、使用场景

### ID 使用场景
1. **数据库主键**：作为表的主键，保证唯一性
2. **外键关联**：用于表与表之间的关联（如 `sales_order_event.customer_id` 关联 `customer_entity.customer_id`）
3. **系统内部查询**：程序代码中使用ID进行数据查询和关联
4. **性能优化**：ID通常是数字或短字符串，查询和索引性能更好

### Code 使用场景
1. **业务单据**：在业务单据、报表中显示Code，便于业务人员识别
2. **业务查询**：业务人员通过Code进行查询和检索
3. **业务规则**：Code可能包含业务规则（如日期、类型、区域等）
4. **对外沟通**：与外部系统或客户沟通时使用Code

## 四、设计原则

1. **ID唯一性**：ID必须在整个系统中唯一，通常由系统自动生成
2. **Code可读性**：Code应该便于业务人员理解和记忆
3. **Code稳定性**：Code一旦分配，通常不会改变（即使业务规则变化）
4. **ID与Code映射**：一个ID对应一个Code，但Code可能在某些情况下与ID相同

## 五、注意事项

1. **不要混用**：在数据库关联时，应使用ID字段，而不是Code字段
2. **Code可能重复**：虽然不常见，但在某些业务场景下，Code可能会被重用（如删除后重新使用）
3. **Code格式变化**：Code的格式可能因业务需求而变化，但ID通常保持稳定
4. **查询性能**：使用ID进行关联查询通常比使用Code更快

