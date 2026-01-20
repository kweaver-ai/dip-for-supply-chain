# PRD：产品供应优化——产品BOM多层展开与供应商匹配（主料）

## 1. 背景与目标
产品供应优化模块需要基于 **HD供应链业务知识网络** 的本体数据，自动识别每个产品的完整物料组成及其供应商构成，以支撑：
- 产品供应商数量/集中度评估
- 物料缺供（无供应商）识别与风险预警
- 供应链稳定性指标计算的真实性（不再使用占位/猜测逻辑）

## 2. 范围
### 2.1 In Scope
- 多层BOM展开（父件→子件→继续展开）
- 仅主料参与匹配（排除替代料）
- 编码规范化后进行匹配（避免空格/全角/大小写等导致的漏匹配）
- 输出：产品→物料清单→供应商列表，以及汇总指标（供应商数、缺供物料数、集中度等）

### 2.2 Out of Scope
- 替代料的可替代关系推演（本期明确不做）
- 历史价格波动/交付周期的统计（无采购事件/历史表时不做）
- 供应商绩效评分融合（另模块/另PRD）

## 3. 数据来源与字段（来自 `docs/HD供应链业务知识网络.json`）
### 3.1 产品BOM对象
- ObjectTypeId：`d56vqtm9olk4bpa66vfg`（产品BOM）
- 关键字段：
  - `parent_code`：父件编码（可为产品编码/上层组件编码）
  - `child_code`：子件编码（物料/下层组件编码）
  - `alternative_part`：替代标识（值包含“替代”时，视为替代料记录）

### 3.2 供应商对象
- ObjectTypeId：`d5700je9olk4bpa66vkg`（供应商）
- 关键字段：
  - `supplier_code`：供应商编码
  - `supplier`：供应商名称
  - `provided_material_code`：供应物料编码（用于与BOM子件编码匹配）
  - 其他：`unit_price_with_tax`、`payment_terms`、`is_lowest_price_alternative`、`is_basic_material`

### 3.3 产品对象
- ObjectTypeId：`d56v4ue9olk4bpa66v00`（产品）
- 关键字段：
  - `product_code`：产品编码（BOM展开的起点）

## 4. 业务规则
### 4.1 多层BOM展开（必须）
- 以 `product_code` 作为初始 `parent_code`。
- 递归/迭代获取 `parent_code -> child_code`。
- 若某 `child_code` 同时也是其他记录的 `parent_code`，继续展开。
- 防环：使用 `visited` 集合避免循环。
- 最大深度：默认 `10`（可配置），超过时停止并记录告警日志。

### 4.2 主料规则（必须，选项A）
- 当 BOM 记录的 `alternative_part` 字段包含 “替代” 时，该记录视为替代料，**不参与** 展开与匹配。
- 缺失该字段或不包含“替代”的记录，视为主料记录，参与展开。

### 4.3 编码规范化（必须）
对 `product_code` / `parent_code` / `child_code` / `provided_material_code` 统一做规范化后再匹配：
- `trim()` 去除首尾空白
- Unicode 规范化（NFKC）以兼容全角/半角
- 移除中间空白字符（空格、制表符）
- 统一大小写（转大写）

## 5. 算法与索引设计
为避免 O(产品×BOM×供应商) 的暴力匹配，采用索引结构：

### 5.1 BOM索引
`bomChildrenByParent: Map<string, Set<string>>`
- key：规范化后的 `parent_code`
- value：规范化后的 `child_code` 集合（仅主料记录）

### 5.2 供应商索引
`suppliersByMaterial: Map<string, SupplierInfo[]>`
- key：规范化后的 `provided_material_code`
- value：该物料对应的供应商记录列表（全量保留，规则4=选项A）

### 5.3 计算流程（单产品）
输入：`product_code`
1) `materials = expandBom(product_code, bomChildrenByParent)`
2) `suppliersForProduct = union(suppliersByMaterial[material] for material in materials)`
3) `missingMaterials = materials - keys(suppliersByMaterial)`
4) `supplierSummary`：
   - 按 `supplier_code` 聚合：覆盖物料数、覆盖率、最小/平均含税单价（若有）

## 6. 输出与指标
### 6.1 结构化输出（供计算模块消费）
- `materials: string[]`（该产品展开得到的所有子件编码）
- `missingMaterials: string[]`（无供应商匹配的子件编码）
- `suppliers: { supplier_code, supplier, ... }[]`（去重后的供应商集合）
- `supplierSummary: { supplier_code, supplier, coveredMaterialCount }[]`

### 6.2 风险指标（用于 SupplyRisk）
- `materialShortage`：`missingMaterials.length > 0`
- `supplierConcentration`：
  - 若 `supplierCount <= 2` 或者 “最大覆盖供应商覆盖率 >= 0.6” 则为 true

## 7. 验收标准
- 给定任意 `product_code`：
  - 能正确展开到多层子件，且不会死循环
  - 替代料记录不参与（`alternative_part` 含“替代”应被排除）
  - 经过规范化后，`child_code` 与 `provided_material_code` 能正确匹配到供应商
  - 能输出供应商数量、缺供物料数量，并用于风险评估
- 性能：在当前数据量（产品≈4、BOM≈531、供应商≈69、订单≈452、库存≈70）下，计算应在秒级完成

## 8. 非功能要求
- 日志：输出每类索引构建数量、每个产品的展开层级/物料数量/供应商数量（可控制为 debug）
- 容错：个别产品展开异常不影响整体（单产品失败可降级为空结果并记录错误）

