# PRD：产品供应优化——供应商数量卡片「展开面板」（物料展开与供应商明细）

## 1. 背景
当前“产品供应优化”页面展示了“供应商数量”等指标，但缺少可追溯的明细解释，用户无法看到：
- 该产品 BOM 多层展开后的完整物料清单
- 每个物料的类型（自制/委外/外购）
- 非自制物料的供应商、价格与条款
- 是否存在替代件，以及替代件的供应商与价格

本 PRD 在现有“多层 BOM 展开 + 供应商匹配”基础上，为「供应商数量」卡片增加可展开面板，提供可解释的明细视图。

## 2. 目标与非目标
### 2.1 目标（Goals）
- 点击“供应商数量”卡片可展开面板（Drawer/Modal），展示当前选中产品的“物料展开与供应商情况”。
- 明细包含：
  1) 产品 BOM 多层展开后的物料：物料名称、编码、类型（自制件、委外、外购）
  2) 对于 **非自制** 物料：展示供应商列表（含税单价、付款条件、是否基础物料、是否有替代件）
  3) 若有替代件：展示替代件（物料名称、供应商、价格）
- 支持编码规范化匹配（与现有计算逻辑一致），避免因空格/大小写/全角导致漏匹配。

### 2.2 非目标（Non-goals）
- 不新增采购事件/交期事件统计（交货周期、OTIF 等），本期仅做“物料—供应商”静态匹配解释。
- 不做替代件最优选择/推荐算法（仅展示关系与明细）。
- 不做跨产品对比或全局供应商画像。

## 3. 用户故事
1) 作为业务分析人员，我希望点击“供应商数量”后看到组成该数量的具体供应商与覆盖的物料，便于判断供应商集中度风险。
2) 作为计划人员，我希望看到 BOM 展开后的缺供物料（无供应商匹配），便于补齐供应商数据或做风险预警。
3) 作为采购人员，我希望看到某物料的替代件及其供应商与价格，便于在缺供时快速选择替代。

## 4. 入口与交互
### 4.1 入口
- 页面：`产品供应优化`
- 卡片：`供应商数量`
- 行为：点击卡片主体（或“查看明细”按钮）打开展开面板

### 4.2 展开面板形态
- 形式建议：右侧 Drawer（不离开当前页面）
- 标题：`供应商明细 / 物料展开`
- 副标题：展示产品名称与编码、统计摘要（物料总数、非自制物料数、供应商数、缺供物料数）
- 关闭：右上角关闭按钮 / ESC

### 4.3 筛选与排序（建议本期做基础版）
- 默认展示：按“层级深度 + 物料编码”排序
- 可选筛选：
  - 仅看缺供物料
  - 仅看非自制物料
  - 仅看有替代件物料

## 5. 数据来源与字段（以 HD 业务知识网络为准）
> 以 `docs/HD供应链业务知识网络.json` 的 object types 为准（名称仅用于解释，实际以字段名匹配）。

### 5.1 产品BOM（ObjectType）
- ObjectTypeId：`d56vqtm9olk4bpa66vfg`
- 字段：
  - `parent_code`：父件编码
  - `child_code`：子件编码
  - `child_name`：子件名称（若有则优先展示；否则从物料主数据补齐）
  - `child_type`：子件类型（若有则展示；否则以物料主数据的“物料类型”展示）
  - `alternative_part`：替代标识（包含“替代”视为替代件记录）
  - `alternative_group`：替代组（用于把主件与替代件聚合）

### 5.2 物料（ObjectType）
- ObjectTypeId：`d56voju9olk4bpa66vcg`
- 字段（关键）：
  - `material_code`：物料编码
  - `material_name`：物料名称
  - `material_type`：物料类型（外购/自制/委外）

### 5.3 供应商（ObjectType）
- ObjectTypeId：`d5700je9olk4bpa66vkg`
- 字段（关键）：
  - `supplier_code`：供应商编码
  - `supplier`：供应商名称
  - `provided_material_code`：供应物料编码（与 BOM 子件编码匹配）
  - `provided_material_name`：供应物料名称（可作为兜底展示）
  - `unit_price_with_tax`：含税单价
  - `payment_terms`：付款条款
  - `is_basic_material`：是否基础物料（是/否）
  - `is_lowest_price_alternative`：是否最低价替代（是/否）

## 6. 业务规则（与现有计算逻辑对齐）
### 6.1 BOM 多层展开
- 从 `product_code` 作为起点，对 `parent_code -> child_code` 进行 BFS/DFS 展开。
- 防环：`visited` 去重。
- 最大深度：默认 10（可配置）。

### 6.2 替代件判定与展示口径
- 本期“供应商数量”指标仍按 **主料** 口径计算（不把替代件加入主展开集合）。
- 在展开面板中：
  - 主料物料行：展示“是否有替代件”；
  - 若有：在该主料下展示替代件清单（来自 BOM 中 `alternative_part` 包含“替代”的记录）。

#### 6.2.1 替代件聚合规则（待实现时按此口径）
以 `parent_code` 维度聚合：
- 主料记录：`alternative_part` 为空或不包含“替代”
- 替代件记录：`alternative_part` 包含“替代”
- 若两个物料存在替代关系：其 `alternative_group` 必须相同（例如都为 1、都为 2），且在同一 `parent_code` 下。
- `alternative_part` 判定：
  - `alternative_part` 为空：主料
  - `alternative_part` 为“替代”：替代料
- 若 `alternative_group` 存在：用 `(parent_code, alternative_group)` 将主料与替代料聚合到同一组并展示
- 若 `alternative_group` 缺失：退化为仅展示“该 parent_code 下的所有替代件”（并标注“关联不精确”）

### 6.3 编码规范化
对以下字段做同一套规范化：
- `product_code / parent_code / child_code / material_code / provided_material_code`
规则：`trim + NFKC + 去空白 + toUpperCase`

### 6.4 物料类型与供应商展示规则
- 若物料类型为 **自制**：不展示供应商列表（显示“自制件，无外部供应商”）。
- 若物料类型为 **外购/委外**（或无法判断但默认非自制）：展示供应商列表。

## 7. UI 内容结构（信息架构）
### 7.1 面板摘要区（顶部）
- 产品：`{productName} ({productCode})`
- 指标：
  - 展开物料总数（主料）
  - 非自制物料数
  - 供应商数（去重）
  - 缺供物料数（非自制且无供应商匹配）

### 7.2 物料列表区（主体）
每一行（主料物料）展示：
- 层级深度（可选）
- 物料编码
- 物料名称
- 物料类型（自制/委外/外购/未知）
- 是否基础物料（若可从供应商记录推断：任一供应商 `is_basic_material=是` 则显示“是”，否则“否/未知”）
- 是否有替代件（基于 BOM 替代记录）
- 供应商概览（仅非自制）：供应商数量、最低价/价格区间（可选）

展开该物料（accordion）后：
1) 供应商表（非自制）
   - 供应商编码、供应商名称
   - 含税单价 `unit_price_with_tax`
   - 付款条款 `payment_terms`
   - 是否基础物料 `is_basic_material`
   - 是否最低价替代 `is_lowest_price_alternative`
2) 替代件列表（若存在）
   - 替代件物料编码/名称/类型
   - 替代件供应商表（同上字段，但至少显示：供应商、含税单价）

### 7.3 缺供提示
- 对缺供物料在列表中高亮标记“缺供/无供应商”，并允许一键筛选“仅缺供”。

## 8. 计算与接口/数据结构（供研发实现）
> 本期不要求后端改造；基于前端已加载的对象（产品/BOM/物料/供应商）构建索引并计算。

### 8.1 推荐的中间数据结构
- `materialMasterByCode: Map<material_code, {name,type}>`
- `suppliersByMaterial: Map<provided_material_code, SupplierInfo[]>`
- `bomChildrenByParent: Map<parent_code, Set<child_code>>`（主料）
- `bomAlternativesByParent: Map<parent_code, AlternativeItem[]>`（替代件）

### 8.2 面板输出模型（建议）
```ts
type MaterialType = '自制' | '委外' | '外购' | '未知';

interface SupplierRow {
  supplier_code: string;
  supplier: string;
  unit_price_with_tax?: number;
  payment_terms?: string;
  is_basic_material?: string;
  is_lowest_price_alternative?: string;
}

interface AlternativeMaterialRow {
  material_code: string;
  material_name?: string;
  material_type: MaterialType;
  suppliers: SupplierRow[];
}

interface ExpandedMaterialRow {
  depth: number;
  material_code: string;
  material_name?: string;
  material_type: MaterialType;
  suppliers: SupplierRow[];            // 非自制才展示
  hasAlternatives: boolean;
  alternatives: AlternativeMaterialRow[];
  isMissingSupplier: boolean;          // 非自制且 suppliers 为空
}

interface SupplierDetailPanelModel {
  product_code: string;
  product_name?: string;
  totalMaterials: number;
  nonSelfMadeMaterials: number;
  supplierCount: number;
  missingMaterials: number;
  materials: ExpandedMaterialRow[];
}
```

## 9. 验收标准（Acceptance Criteria）
- 点击“供应商数量”卡片可打开面板，关闭不影响页面其他状态。
- 面板能正确展示：
  - BOM 多层展开（最大深度10、防环）
  - 每个物料的名称/编码/类型（优先物料主数据，缺失时兜底展示）
  - 非自制物料展示供应商列表，字段齐全（含税单价、付款条款、是否基础物料、是否最低价替代）
  - 主料物料行展示“是否有替代件”；存在时展示替代件及其供应商与价格
  - 缺供物料可识别并高亮，且“仅缺供”筛选生效
- 编码规范化后匹配正确（同一物料编码不同格式不应导致重复/漏匹配）。
- 性能：当前数据量下打开面板应在 1s 内完成渲染（不做重复全量计算；建议缓存索引）。

## 10. 风险与依赖
- 物料类型字段在数据源中的命名/取值可能不一致（需在实现阶段确认 `material_type` 的实际字段与枚举值）。
- 替代组 `alternative_group` 若缺失，将导致替代件关联不精确；需按 6.2.1 的降级策略提示用户。
- 供应商对象为“供应商-物料关系表”，同一物料可能多条记录（不同条款/价格）；本期规则为“全量展示（选项A）”。
