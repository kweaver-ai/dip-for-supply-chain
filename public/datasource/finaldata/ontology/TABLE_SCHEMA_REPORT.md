# Ontology表结构分析报告

## 总览

- 总表数: 14
- 实体表: 6
- 事件表: 8

---

## 一、实体表 (Entity Tables)

### 1. customer_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 228 条
**字段数**: 22 个

#### 主键设置

- **推荐主键**: `customer_id`
- **类型**: Single Column
- **原因**: 唯一标识customer实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `customer_id` | 客户ID | 客户的唯一标识符，系统内部使用 |
| 2 | `customer_code` | 客户编码 | 客户的业务编码，用于业务单据和查询 |
| 3 | `customer_name` | 客户名称 | 客户的完整公司名称 |
| 4 | `customer_level` | 客户等级 | 客户分级（T1/T2/T3），用于客户价值评估和分类管理 |
| 5 | `customer_type` | 客户类型 | 客户类型（SMB/Enterprise/Government），区分企业规模和组织性质 |
| 6 | `industry_type` | 行业类型 | 客户所属行业大类（如农业、测绘、影视传媒等） |
| 7 | `industry` | 行业 | 客户所属具体行业 |
| 8 | `primary_industry` | 主行业 | 客户的主要业务行业分类 |
| 9 | `secondary_industry` | 次行业 | 客户的次要业务行业分类 |
| 10 | `company_size` | 公司规模 | 公司规模分类（微型/小型/中型/大型） |
| 11 | `established_year` | 成立年份 | 公司成立年份 |
| 12 | `annual_revenue` | 年收入 | 公司年营业收入（单位：元） |
| 13 | `city` | 城市 | 客户所在城市 |
| 14 | `province` | 省份 | 客户所在省份 |
| 15 | `address` | 地址 | 客户详细地址 |
| 16 | `contact_person` | 联系人 | 主要联系人姓名 |
| 17 | `contact_phone` | 联系电话 | 联系人电话号码 |
| 18 | `contact_email` | 联系邮箱 | 联系人电子邮箱 |
| 19 | `is_named_customer` | 是否重点客户 | 标识是否为重要客户（是/否） |
| 20 | `has_contract` | 是否有合同 | 标识是否签署了正式合同（是/否） |
| 21 | `created_date` | 创建日期 | 客户记录创建日期 |
| 22 | `status` | 状态 | 客户状态（Active/Inactive等） |

---

### 2. factory_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 5 条
**字段数**: 19 个

#### 主键设置

- **推荐主键**: `factory_id`
- **类型**: Single Column
- **原因**: 唯一标识factory实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `factory_id` | 工厂ID | 工厂的唯一标识符，系统内部使用 |
| 2 | `factory_code` | 工厂编码 | 工厂的业务编码，用于业务单据和查询 |
| 3 | `factory_name` | 工厂名称 | 工厂的完整名称 |
| 4 | `factory_type` | 工厂类型 | 工厂的类型（如总装工厂、机身制造工厂等） |
| 5 | `address` | 地址 | 工厂的详细地址 |
| 6 | `city` | 城市 | 工厂所在城市 |
| 7 | `province` | 省份 | 工厂所在省份 |
| 8 | `country` | 国家 | 工厂所在国家 |
| 9 | `production_lines` | 生产线 | 工厂的生产线列表（逗号分隔） |
| 10 | `total_capacity` | 总产能 | 工厂的总生产能力（单位：台/年、套/年等） |
| 11 | `established_year` | 成立年份 | 工厂成立的年份 |
| 12 | `area_sqm` | 面积(平方米) | 工厂占地面积（单位：平方米） |
| 13 | `employee_count` | 员工数量 | 工厂的员工总数 |
| 14 | `manager` | 经理 | 工厂经理姓名 |
| 15 | `contact_phone` | 联系电话 | 工厂联系电话 |
| 16 | `contact_email` | 联系邮箱 | 工厂联系邮箱 |
| 17 | `certification` | 认证 | 工厂获得的认证（如ISO9001等，逗号分隔） |
| 18 | `created_date` | 创建日期 | 工厂记录创建日期 |
| 19 | `status` | 状态 | 工厂状态（Active/Inactive等） |

---

### 3. material_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 125 条
**字段数**: 9 个

#### 主键设置

- **推荐主键**: `material_id`
- **类型**: Single Column
- **原因**: 唯一标识material实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `material_id` | 物料ID | 物料的唯一标识符，系统内部使用 |
| 2 | `material_code` | 物料编码 | 物料的业务编码，用于业务单据和查询 |
| 3 | `material_name` | 物料名称 | 物料的完整名称 |
| 4 | `material_type` | 物料类型 | 物料的类型（如组件、零件、原材料等） |
| 5 | `unit` | 单位 | 物料的计量单位（如套、个、件等） |
| 6 | `is_virtual` | 是否虚拟件 | 标识是否为虚拟件（是/否），虚拟件不实际存在 |
| 7 | `is_assembly` | 是否组件 | 标识是否为组件（是/否），组件由多个子件组成 |
| 8 | `created_date` | 创建日期 | 物料记录创建日期 |
| 9 | `status` | 状态 | 物料状态（Active/Inactive等） |

---

### 4. product_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 10 条
**字段数**: 7 个

#### 主键设置

- **推荐主键**: `product_id`
- **类型**: Single Column
- **原因**: 唯一标识product实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `product_id` | 产品ID | 产品的唯一标识符，系统内部使用 |
| 2 | `product_code` | 产品编码 | 产品的业务编码，用于业务单据和查询 |
| 3 | `product_name` | 产品名称 | 产品的完整名称 |
| 4 | `product_type` | 产品类型 | 产品的类型（如UAV等） |
| 5 | `main_unit` | 主单位 | 产品的主要计量单位（如台等） |
| 6 | `created_date` | 创建日期 | 产品记录创建日期 |
| 7 | `status` | 状态 | 产品状态（Active/Inactive等） |

---

### 5. supplier_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 44 条
**字段数**: 22 个

#### 主键设置

- **推荐主键**: `supplier_id`
- **类型**: Single Column
- **原因**: 唯一标识supplier实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `supplier_id` | 供应商ID | 供应商的唯一标识符，系统内部使用 |
| 2 | `supplier_code` | 供应商编码 | 供应商的业务编码，用于业务单据和查询 |
| 3 | `supplier_name` | 供应商名称 | 供应商的完整公司名称 |
| 4 | `supplier_short_name` | 供应商简称 | 供应商的简称或英文名称 |
| 5 | `supplier_category` | 供应商分类 | 供应商的业务分类（如电子元件-芯片、传感器-IMU等） |
| 6 | `supplier_tier` | 供应商层级 | 供应商等级（战略/核心/一般），用于供应商分级管理 |
| 7 | `primary_contact` | 主要联系人 | 供应商的主要联系人姓名 |
| 8 | `contact_phone` | 联系电话 | 供应商联系电话 |
| 9 | `contact_email` | 联系邮箱 | 供应商联系邮箱 |
| 10 | `registered_address` | 注册地址 | 供应商的注册地址 |
| 11 | `country` | 国家 | 供应商所在国家 |
| 12 | `city` | 城市 | 供应商所在城市 |
| 13 | `settlement_currency` | 结算货币 | 与供应商结算使用的货币（CNY/USD等） |
| 14 | `default_tax_rate` | 默认税率 | 与供应商交易的默认税率 |
| 15 | `payment_terms` | 付款条件 | 付款条件（如月结60天、款到发货等） |
| 16 | `lead_time_avg` | 平均交期 | 供应商的平均交货周期（单位：天） |
| 17 | `risk_level` | 风险等级 | 供应商的风险等级（高/中/低） |
| 18 | `is_active` | 是否活跃 | 标识供应商是否处于活跃状态（是/否） |
| 19 | `established_year` | 成立年份 | 供应商公司成立年份 |
| 20 | `annual_capacity` | 年产能 | 供应商的年生产能力（单位：件/万件等） |
| 21 | `created_date` | 创建日期 | 供应商记录创建日期 |
| 22 | `status` | 状态 | 供应商状态（Active/Inactive等） |

---

### 6. warehouse_entity.csv

**表类型**: Entity Table (实体表)
**记录数**: 5 条
**字段数**: 44 个

#### 主键设置

- **推荐主键**: `warehouse_id`
- **类型**: Single Column
- **原因**: 唯一标识warehouse实体

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `warehouse_id` | 仓库ID | 仓库的唯一标识符，系统内部使用 |
| 2 | `warehouse_code` | 仓库编码 | 仓库的业务编码，用于业务单据和查询 |
| 3 | `warehouse_name` | 仓库名称 | 仓库的完整名称 |
| 4 | `warehouse_type` | 仓库类型 | 仓库的类型（如成品仓、原材料仓、配件仓等） |
| 5 | `address` | 地址 | 仓库的详细地址 |
| 6 | `city` | 城市 | 仓库所在城市 |
| 7 | `province` | 省份 | 仓库所在省份 |
| 8 | `country` | 国家 | 仓库所在国家 |
| 9 | `postal_code` | 邮编 | 仓库所在地的邮政编码 |
| 10 | `latitude` | 纬度 | 仓库的地理位置纬度 |
| 11 | `longitude` | 经度 | 仓库的地理位置经度 |
| 12 | `total_area_sqm` | 总面积(平方米) | 仓库的总面积（单位：平方米） |
| 13 | `storage_area_sqm` | 存储面积(平方米) | 仓库的存储面积（单位：平方米） |
| 14 | `warehouse_height` | 仓库高度(米) | 仓库的高度（单位：米） |
| 15 | `storage_capacity_cbm` | 存储容量(立方米) | 仓库的存储容量（单位：立方米） |
| 16 | `pallet_positions` | 托盘位数量 | 仓库的托盘位数量 |
| 17 | `temperature_control` | 温度控制 | 仓库的温度控制方式（如常温、恒温等） |
| 18 | `temperature_range` | 温度范围 | 仓库的温度控制范围 |
| 19 | `humidity_control` | 湿度控制 | 是否有湿度控制（是/否） |
| 20 | `humidity_range` | 湿度范围 | 仓库的湿度控制范围 |
| 21 | `has_cold_storage` | 是否有冷库 | 标识是否有冷库（是/否） |
| 22 | `fire_protection_level` | 消防等级 | 仓库的消防等级（如一级、二级等） |
| 23 | `security_system` | 安防系统 | 仓库的安防系统描述 |
| 24 | `has_wms` | 是否有WMS | 标识是否有仓库管理系统（是/否） |
| 25 | `wms_system` | WMS系统 | 使用的WMS系统名称（如SAP EWM、Oracle WMS等） |
| 26 | `automation_level` | 自动化水平 | 仓库的自动化水平（如高度自动化、中度自动化等） |
| 27 | `has_agv` | 是否有AGV | 标识是否有自动导引车（是/否） |
| 28 | `agv_count` | AGV数量 | AGV的数量 |
| 29 | `has_conveyor` | 是否有输送带 | 标识是否有输送带（是/否） |
| 30 | `has_sorting_system` | 是否有分拣系统 | 标识是否有分拣系统（是/否） |
| 31 | `has_rfid` | 是否有RFID | 标识是否有RFID系统（是/否） |
| 32 | `established_year` | 成立年份 | 仓库成立的年份 |
| 33 | `operation_hours` | 运营时间 | 仓库的运营时间（如7x24小时、周一至周六等） |
| 34 | `max_daily_throughput` | 最大日吞吐量 | 仓库的最大日吞吐量 |
| 35 | `throughput_unit` | 吞吐量单位 | 吞吐量的单位（如台/天、箱/天等） |
| 36 | `manager_name` | 经理姓名 | 仓库经理的姓名 |
| 37 | `manager_phone` | 经理电话 | 仓库经理的电话 |
| 38 | `manager_email` | 经理邮箱 | 仓库经理的邮箱 |
| 39 | `employee_count` | 员工数量 | 仓库的员工总数 |
| 40 | `certifications` | 认证 | 仓库获得的认证（如ISO9001等，逗号分隔） |
| 41 | `quality_standards` | 质量标准 | 仓库执行的质量标准（如GMP、5S等，逗号分隔） |
| 42 | `created_date` | 创建日期 | 仓库记录创建日期 |
| 43 | `last_inspection_date` | 最后检查日期 | 仓库最后一次检查的日期 |
| 44 | `status` | 状态 | 仓库状态（Active/Inactive等） |

---

## 二、事件表 (Event Tables)

### 1. bom_event.csv

**表类型**: Event Table (事件表)
**记录数**: 173 条
**字段数**: 26 个

#### 主键设置

- **推荐主键**: `bom_id`
- **类型**: Single Column
- **原因**: BOM关系的唯一标识
- **备选方案**: (parent_id, child_id, sequence) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `bom_id` | BOM ID | BOM关系的唯一标识符 |
| 2 | `bom_version` | BOM版本 | BOM的版本号（如V2.0） |
| 3 | `parent_type` | 父项类型 | 父项的类型（Product/Material等） |
| 4 | `parent_id` | 父项ID | 父项的ID标识 |
| 5 | `parent_code` | 父项编码 | 父项的编码 |
| 6 | `child_type` | 子项类型 | 子项的类型（Product/Material等） |
| 7 | `child_id` | 子项ID | 子项的ID标识 |
| 8 | `child_code` | 子项编码 | 子项的编码 |
| 9 | `child_name` | 子项名称 | 子项的名称 |
| 10 | `relationship_type` | 关系类型 | BOM关系的类型（如Standard等） |
| 11 | `sequence` | 序号 | BOM中的序号 |
| 12 | `line_number` | 行号 | BOM中的行号 |
| 13 | `quantity` | 数量 | 子项的数量 |
| 14 | `unit` | 单位 | 子项的计量单位 |
| 15 | `child_quantity` | 子项数量 | 子项物料的用量数量 |
| 16 | `child_unit` | 子项单位 | 子项物料的计量单位 |
| 17 | `base_quantity` | 基础数量 | BOM的基础数量，用于计算子项用量 |
| 18 | `effective_date` | 生效日期 | BOM版本的生效日期 |
| 19 | `expiry_date` | 失效日期 | BOM版本的失效日期 |
| 20 | `bom_category` | BOM类别 | BOM的分类（如Consumer等） |
| 21 | `assembly_set` | 是否装配组 | 标识是否为装配组（是/否） |
| 22 | `issue_method` | 发料方式 | 物料发放方式（如按订单发料、按计划发料等） |
| 23 | `scrap_rate` | 损耗率 | 物料的损耗率 |
| 24 | `created_by` | 创建人 | BOM记录的创建人 |
| 25 | `created_date` | 创建日期 | BOM记录创建日期 |
| 26 | `status` | 状态 | BOM状态（Active/Inactive等） |

---

### 2. inventory_event.csv

**表类型**: Event Table (事件表)
**记录数**: 146 条
**字段数**: 19 个

#### 主键设置

- **推荐主键**: `inventory_id`
- **类型**: Single Column
- **原因**: 库存快照记录的唯一标识
- **备选方案**: (warehouse_id, item_id, snapshot_date) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `inventory_id` | 库存ID | 库存记录的唯一标识符 |
| 2 | `snapshot_month` | 快照月份 | 库存快照的月份（格式：YYYY-MM） |
| 3 | `item_type` | 物品类型 | 物品类型（Product/Material等） |
| 4 | `item_id` | 物品ID | 物品的ID标识 |
| 5 | `item_code` | 物品编码 | 物品的编码 |
| 6 | `item_name` | 物品名称 | 物品的名称 |
| 7 | `warehouse_id` | 仓库ID | 仓库的ID标识 |
| 8 | `warehouse_name` | 仓库名称 | 仓库的名称 |
| 9 | `batch_number` | 批次号 | 物料的批次编号，用于批次管理和追溯 |
| 10 | `quantity` | 数量 | 库存数量 |
| 11 | `unit_price` | 单价 | 物料的单位价格 |
| 12 | `total_price` | 总价 | 库存总价值（数量×单价） |
| 13 | `earliest_storage_date` | 最早入库日期 | 该批次物料的最早入库日期 |
| 14 | `max_storage_age` | 最大存储期限 | 物料的最大存储期限（单位：月） |
| 15 | `storage_reason` | 存储原因 | 物料入库的原因（如生产入库、采购入库等） |
| 16 | `storage_note` | 存储备注 | 库存存储的相关备注信息 |
| 17 | `consumption_path` | 消耗路径 | 物料的消耗去向（如销售出库、生产领料等） |
| 18 | `created_date` | 创建日期 | 库存记录创建日期 |
| 19 | `status` | 状态 | 库存状态（Active/Inactive等） |

---

### 3. material_procurement_event.csv 物料发货单

**表类型**: Event Table (事件表)
**记录数**: 375 条
**字段数**: 26 个

#### 主键设置

- **推荐主键**: `procurement_id`
- **类型**: Single Column
- **原因**: 物料采购记录的唯一标识

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `procurement_id` | 采购ID | 物料采购记录的唯一标识符 |
| 2 | `procurement_number` | 采购单号 | 物料采购单的业务编号 |
| 3 | `procurement_date` | 采购日期 | 物料采购的日期 |
| 4 | `supplier_id` | 供应商ID | 供应商的ID标识 |
| 5 | `supplier_code` | 供应商编码 | 供应商的编码 |
| 6 | `supplier_name` | 供应商名称 | 供应商的名称 |
| 7 | `material_id` | 物料ID | 物料的ID标识 |
| 8 | `material_code` | 物料编码 | 物料的编码 |
| 9 | `material_name` | 物料名称 | 物料的名称 |
| 10 | `warehouse_id` | 仓库ID | 目标仓库的ID标识 |
| 11 | `warehouse_name` | 仓库名称 | 目标仓库的名称 |
| 12 | `quantity` | 数量 | 采购的物料数量 |
| 13 | `unit_price` | 单价 | 物料的单位价格 |
| 14 | `total_amount` | 总金额 | 采购的总金额 |
| 15 | `currency` | 货币 | 交易使用的货币类型（CNY/USD等） |
| 16 | `tax_rate` | 税率 | 采购交易的税率 |
| 17 | `payment_terms` | 付款条件 | 付款条件（如月结60天等） |
| 18 | `logistics_provider` | 物流商 | 负责物流运输的供应商名称 |
| 19 | `tracking_number` | 跟踪号 | 物流跟踪单号 |
| 20 | `ship_date` | 发货日期 | 供应商发货的日期 |
| 21 | `estimated_delivery_date` | 预计送达日期 | 预计送达仓库的日期 |
| 22 | `actual_delivery_date` | 实际送达日期 | 实际送达仓库的日期 |
| 23 | `inspection_status` | 检验状态 | 物料检验的状态 |
| 24 | `notes` | 备注 | 采购记录的备注信息 |
| 25 | `created_date` | 创建日期 | 采购记录创建日期 |
| 26 | `status` | 状态 | 采购记录状态（Active/Inactive等） |

---

### 4. production_order_event.csv 产品生产订单

**表类型**: Event Table (事件表)
**记录数**: 10 条
**字段数**: 18 个

#### 主键设置

- **推荐主键**: `production_order_id`
- **类型**: Single Column
- **原因**: 生产订单行的唯一标识
- **备选方案**: (production_order_number, line_number) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `production_order_id` | 生产订单ID | 生产订单记录的唯一标识符 |
| 2 | `production_order_number` | 生产订单编号 | 生产订单的业务编号（如MO-202305001） |
| 3 | `line_number` | 行号 | 生产订单的行号 |
| 4 | `output_type` | 产出类型 | 产出物的类型（Product/Material等） |
| 5 | `output_id` | 产出ID | 产出物的ID标识 |
| 6 | `output_code` | 产出编码 | 产出物的编码 |
| 7 | `output_name` | 产出名称 | 产出物的名称 |
| 8 | `production_quantity` | 生产数量 | 计划生产的产出物数量 |
| 9 | `factory_id` | 工厂ID | 执行生产的工厂ID标识 |
| 10 | `factory_name` | 工厂名称 | 执行生产的工厂名称 |
| 11 | `production_line` | 生产线 | 执行生产的生产线名称 |
| 12 | `process_sequence` | 工序顺序 | 生产工序的顺序号 |
| 13 | `planned_start_date` | 计划开始日期 | 生产计划开始日期 |
| 14 | `planned_finish_date` | 计划完成日期 | 生产计划完成日期 |
| 15 | `work_order_status` | 工单状态 | 工单的状态（如已完工等） |
| 16 | `priority` | 优先级 | 生产订单的优先级（高/中/低） |
| 17 | `created_date` | 创建日期 | 生产订单创建日期 |
| 18 | `status` | 状态 | 生产订单状态（Active/Inactive等） |

---

### 5. material_requisition_event.csv 物料领料单

**表类型**: Event Table (事件表)
**记录数**: 32 条
**字段数**: 20 个

#### 主键设置

- **推荐主键**: `material_requisition_id`
- **类型**: Single Column
- **原因**: 物料领料记录的唯一标识
- **备选方案**: (requisition_number, material_id) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `material_requisition_id` | 物料领料ID | 物料领料记录的唯一标识符 |
| 2 | `requisition_number` | 领料单号 | 物料领料单的业务编号（如REQ-MO202305001-M0001） |
| 3 | `requisition_type` | 领料类型 | 领料的类型（如部件领取、半成品领取、零件领取等） |
| 4 | `material_id` | 物料ID | 被领用物料的ID标识 |
| 5 | `material_code` | 物料编码 | 被领用物料的编码 |
| 6 | `material_name` | 物料名称 | 被领用物料的名称 |
| 7 | `material_type` | 物料类型 | 物料的类型（如部件、组件、零件等） |
| 8 | `warehouse_id` | 仓库ID | 发料仓库的ID标识 |
| 9 | `warehouse_name` | 仓库名称 | 发料仓库的名称 |
| 10 | `factory_id` | 工厂ID | 领料工厂的ID标识 |
| 11 | `factory_name` | 工厂名称 | 领料工厂的名称 |
| 12 | `requested_quantity` | 申请数量 | 申请领用的物料数量 |
| 13 | `issued_quantity` | 已发数量 | 实际已发放的物料数量 |
| 14 | `unit` | 单位 | 物料的计量单位（如个、套、块、颗等） |
| 15 | `requisition_date` | 领料日期 | 物料领料申请的日期 |
| 16 | `issue_date` | 发料日期 | 物料实际发放的日期 |
| 17 | `production_order_number` | 生产订单编号 | 关联的生产订单编号（如MO-202305001） |
| 18 | `purpose` | 用途 | 物料领用的用途说明（如生产M0001、组装P0001等） |
| 19 | `status` | 状态 | 领料单状态（如已发料等） |
| 20 | `created_date` | 创建日期 | 领料记录创建日期 |

---

### 6. purchase_order_event.csv 采购订单

**表类型**: Event Table (事件表)
**记录数**: 248 条
**字段数**: 25 个

#### 主键设置

- **推荐主键**: `purchase_order_id`
- **类型**: Single Column
- **原因**: 采购订单行的唯一标识
- **备选方案**: (purchase_order_number, line_number) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `purchase_order_id` | 采购订单ID | 采购订单记录的唯一标识符 |
| 2 | `purchase_order_number` | 采购订单编号 | 采购订单的业务编号 |
| 3 | `document_date` | 单据日期 | 采购订单的单据日期 |
| 4 | `supplier_id` | 供应商ID | 供应商的ID标识 |
| 5 | `supplier_name` | 供应商名称 | 供应商的名称 |
| 6 | `material_id` | 物料ID | 物料的ID标识 |
| 7 | `material_code` | 物料编码 | 物料的编码 |
| 8 | `material_name` | 物料名称 | 物料的名称 |
| 9 | `purchase_quantity` | 采购数量 | 采购订单中的物料数量 |
| 10 | `unit_price_tax` | 含税单价 | 包含税款的单位价格 |
| 11 | `total_amount_tax` | 含税总金额 | 包含税款的订单总金额 |
| 12 | `unit_price_no_tax` | 不含税单价 | 不含税款的单位价格 |
| 13 | `total_amount_no_tax` | 不含税总金额 | 不含税款的订单总金额 |
| 14 | `tax_rate` | 税率 | 采购订单的税率 |
| 15 | `document_status` | 单据状态 | 采购订单的状态（已关闭/已收货等） |
| 16 | `required_date` | 需求日期 | 物料的需求日期 |
| 17 | `planned_arrival_date` | 计划到货日期 | 物料计划到达仓库的日期 |
| 18 | `accumulated_arrival_tax` | 累计到货含税金额 | 累计已到货的含税金额 |
| 19 | `accumulated_storage_tax` | 累计入库含税金额 | 累计已入库的含税金额 |
| 20 | `payment_terms` | 付款条件 | 付款条件（如月结60天等） |
| 21 | `supplier_level` | 供应商等级 | 供应商的等级分类（战略/核心/一般） |
| 22 | `risk_level` | 风险等级 | 供应商的风险等级（高/中/低） |
| 23 | `buyer` | 采购员 | 负责该采购订单的采购员姓名 |
| 24 | `created_date` | 创建日期 | 采购订单创建日期 |
| 25 | `status` | 状态 | 采购订单状态（Active/Inactive等） |

---

### 7. sales_order_event.csv 销售订单

**表类型**: Event Table (事件表)
**记录数**: 1,402 条
**字段数**: 31 个

#### 主键设置

- **推荐主键**: `sales_order_id`
- **类型**: Single Column
- **原因**: 销售订单行的唯一标识
- **备选方案**: (sales_order_number, line_number) 作为复合主键

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `sales_order_id` | 销售订单ID | 销售订单记录的唯一标识符 |
| 2 | `sales_order_number` | 销售订单编号 | 销售订单的业务编号 |
| 3 | `document_date` | 单据日期 | 销售订单的单据日期 |
| 4 | `customer_id` | 客户ID | 客户的ID标识 |
| 5 | `customer_name` | 客户名称 | 客户的名称 |
| 6 | `line_number` | 行号 | 销售订单的行号 |
| 7 | `product_id` | 产品ID | 销售产品的ID标识 |
| 8 | `product_code` | 产品编码 | 销售产品的编码 |
| 9 | `product_name` | 产品名称 | 销售产品的名称 |
| 10 | `quantity` | 数量 | 销售的产品数量 |
| 11 | `unit` | 单位 | 产品的计量单位（如台等） |
| 12 | `standard_price` | 标准价格 | 产品的标准价格 |
| 13 | `discount_rate` | 折扣率 | 订单的折扣率（如4.0%） |
| 14 | `actual_price` | 实际价格 | 折扣后的实际单价 |
| 15 | `subtotal_amount` | 小计金额 | 订单行的小计金额（数量×实际价格） |
| 16 | `tax_amount` | 税额 | 订单行的税额 |
| 17 | `total_amount` | 总金额 | 订单行的总金额（小计+税额） |
| 18 | `order_status` | 订单状态 | 订单的状态（如已发货等） |
| 19 | `document_status` | 单据状态 | 单据的状态（如已确认等） |
| 20 | `transaction_type` | 交易类型 | 交易类型（如项目销售、直销等） |
| 21 | `sales_department` | 销售部门 | 负责的销售部门 |
| 22 | `salesperson` | 销售员 | 负责的销售员姓名 |
| 23 | `planned_delivery_date` | 计划交货日期 | 计划交货给客户的日期 |
| 24 | `is_urgent` | 是否加急 | 标识是否为加急订单（是/否） |
| 25 | `contract_number` | 合同号 | 关联的合同编号 |
| 26 | `project_name` | 项目名称 | 关联的项目名称 |
| 27 | `end_customer` | 最终客户 | 最终使用产品的客户名称 |
| 28 | `quotation_number` | 报价单号 | 关联的报价单编号 |
| 29 | `notes` | 备注 | 订单的备注信息 |
| 30 | `created_date` | 创建日期 | 销售订单创建日期 |
| 31 | `status` | 状态 | 销售订单状态（Active/Inactive等） |

---

### 8. shipment_event.csv 产品发货物流单

**表类型**: Event Table (事件表)
**记录数**: 73 条
**字段数**: 26 个

#### 主键设置

- **推荐主键**: `shipment_id`
- **类型**: Single Column
- **原因**: 发货记录的唯一标识

#### 字段中英文对照

| 序号 | 英文字段名 | 中文字段名 | 字段描述 |
|------|-----------|-----------|----------|
| 1 | `shipment_id` | 发货ID | 发货记录的唯一标识符 |
| 2 | `shipment_number` | 发货单号 | 发货单的业务编号 |
| 3 | `shipment_date` | 发货日期 | 产品发货的日期 |
| 4 | `warehouse_id` | 仓库ID | 发货仓库的ID标识 |
| 5 | `warehouse_name` | 仓库名称 | 发货仓库的名称 |
| 6 | `customer_id` | 客户ID | 收货客户的ID标识 |
| 7 | `customer_code` | 客户编码 | 收货客户的编码 |
| 8 | `customer_name` | 客户名称 | 收货客户的名称 |
| 9 | `product_id` | 产品ID | 发货产品的ID标识 |
| 10 | `product_code` | 产品编码 | 发货产品的编码 |
| 11 | `product_name` | 产品名称 | 发货产品的名称 |
| 12 | `quantity` | 数量 | 发货的产品数量 |
| 13 | `unit_price` | 单价 | 产品的单位价格 |
| 14 | `total_amount` | 总金额 | 发货的总金额（数量×单价） |
| 15 | `consignee` | 收货人 | 收货人的姓名 |
| 16 | `consignee_phone` | 收货人电话 | 收货人的联系电话 |
| 17 | `delivery_address` | 交货地址 | 产品交付的详细地址 |
| 18 | `logistics_provider` | 物流商 | 负责物流运输的供应商名称 |
| 19 | `tracking_number` | 跟踪号 | 物流跟踪单号 |
| 20 | `estimated_delivery_date` | 预计送达日期 | 预计送达客户的日期 |
| 21 | `actual_delivery_date` | 实际送达日期 | 实际送达客户的日期 |
| 22 | `delivery_status` | 交付状态 | 产品的交付状态 |
| 23 | `sales_order_number` | 销售订单编号 | 关联的销售订单编号 |
| 24 | `notes` | 备注 | 发货记录的备注信息 |
| 25 | `created_date` | 创建日期 | 发货记录创建日期 |
| 26 | `status` | 状态 | 发货记录状态（Active/Inactive等） |

---
