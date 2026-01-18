# 生产计划甘特图齐套模式 - 产品需求文档 (PRD)

> **版本**: v1.0
> **创建日期**: 2026-01-16
> **作者**: Claude AI
> **状态**: 待审核

---

## 1. 概述

### 1.1 项目背景

本项目旨在为现有生产计划甘特图增加"齐套模式"功能。齐套模式采用**倒排逻辑**计算生产计划，确保所有子级物料/组件齐套后才开始上级生产，从而优化生产排程，降低库存成本。

### 1.2 目标

- 实现基于物料齐套的倒排生产计划排程
- 可视化展示产品、组件、物料的时间分布关系
- 支持BOM层级的展开/收缩交互
- 提供库存就绪状态的直观显示（绿色/黄色）
- 当计划无法按时完成时自动调整并用红色标识

### 1.3 术语定义

| 术语 | 定义 |
|------|------|
| 物料 | 物料对象，material_type为"外购"或"委外" |
| 组件 | 物料对象，material_type为"自制" |
| 产品 | 产品对象，最终成品 |
| BOM | 产品BOM对象，定义父件与子件的组成关系 |
| 库存 | 库存对象，记录物料的实时库存状态 |
| 齐套 | 所有子级物料/组件全部就绪的状态 |
| 倒排 | 从结束时间向前推算开始时间的排程方式 |

---

## 2. 数据模型

### 2.1 数据源（知识网络对象）

根据 `docs/HD供应链业务知识网络.json`，涉及以下对象：

#### 2.1.1 产品对象 (d56v4ue9olk4bpa66v00)

| 字段名 | 显示名 | 类型 | 说明 |
|--------|--------|------|------|
| product_code | 产品编码 | string | 主键 |
| product_name | 产品名称 | string | 显示名 |
| assembly_time | 生产组装时长 | string | **格式: "1000/天"**, 表示每天可生产1000件 |
| product_model | 产品型号 | string | 可选 |
| product_series | 产品系列 | string | 可选 |
| amount | 成本金额 | float | 可选 |

**生产效率计算**:
```
生产效率 = 解析 assembly_time（如 "1000/天" → 1000）
组装时长（天）= ceil(计划生产数量 / 生产效率)
```

#### 2.1.2 物料对象 (d56voju9olk4bpa66vcg)

| 字段名 | 显示名 | 类型 | 说明 |
|--------|--------|------|------|
| material_code | 物料编码 | string | 主键 |
| material_name | 物料名称 | string | 显示名 |
| material_type | 物料类型 | string | **"外购"/"自制"/"委外"** |
| delivery_duration | 交付时长/周期 | string | **格式: "10天/次" 或 "1000/天"** |
| specification | 规格型号 | string | 可选 |
| unit_price | 单价 | float | 可选 |

**物料分类逻辑**:
- `material_type = "自制"` → **组件**，有生产效率
  - delivery_duration 格式: "1000/天" → 组装时长 = ceil(需求数量 / 1000)
- `material_type = "外购" 或 "委外"` → **物料**，有固定交付周期
  - delivery_duration 格式: "10天/次" → 交付时长 = 10天

#### 2.1.3 库存对象 (d56vcuu9olk4bpa66v3g)

| 字段名 | 显示名 | 类型 | 说明 |
|--------|--------|------|------|
| material_code | 物料编码 | string | 主键 |
| material_name | 物料名称 | string | 显示名 |
| inventory_data | 库存数量 | float | 当前库存总量 |
| available_quantity | 可用数量 | float | **优先使用** |
| safety_stock | 安全库存 | integer | 安全库存警戒线 |
| inventory_age | 库龄 | integer | 天数 |

**库存判断**:
```
可用库存 = available_quantity || inventory_data
是否就绪 = 可用库存 >= 需求数量
```

#### 2.1.4 产品BOM对象 (d56vqtm9olk4bpa66vfg)

| 字段名 | 显示名 | 类型 | 说明 |
|--------|--------|------|------|
| bom_number | BOM编号 | string | 主键 |
| parent_code | 父件编码 | string | 上级物料/产品编码 |
| parent_name | 父件名称 | string | 上级物料/产品名称 |
| child_code | 子件编码 | string | 下级物料/组件编码 |
| child_name | 子件名称 | string | 下级物料/组件名称 |
| child_quantity | 子件用量 | float | 生产一个父件所需数量 |
| loss_rate | 损耗率 | integer | **百分比**，如5表示5% |
| alternative_group | 替代组 | float | 替代物料分组编号 |
| alternative_part | 替代标识 | string | "替代"表示替代物料 |
| unit | 单位 | string | 计量单位 |

**需求数量计算**:
```javascript
// 损耗率处理
effectiveLossRate = loss_rate > 1 ? loss_rate / 100 : loss_rate;

// 需求数量 = (上级计划数量 * 子件用量) / (1 - 损耗率)
需求数量 = ceil((parentQuantity * child_quantity) / (1 - effectiveLossRate));
```

#### 2.1.5 工厂生产计划对象 (d5704qm9olk4bpa66vp0)

| 字段名 | 显示名 | 类型 | 说明 |
|--------|--------|------|------|
| order_number | 计划生产编号 | string | 主键 |
| code | 产品编码 | string | 关联产品 |
| quantity | 计划生产数量 | integer | 生产数量 |
| start_time | 开始时间 | date | **计划开始时间（软约束）** |
| end_time | 结束时间 | date | **计划结束时间（软约束）** |
| status | 状态 | string | 未开始/进行中/已完成 |
| priority | 优先级 | integer | 数值越小优先级越高 |
| ordered | 已下单数量 | integer | 已下达生产指令数量 |

---

## 3. 功能需求

### 3.1 模式切换 (FR-001)

**描述**: 用户选择产品后，默认加载"默认模式"，可切换到"齐套模式"

**交互**:
1. 产品选择器保持现有功能
2. 新增模式选择器（下拉或Tab切换）
3. 模式选项：
   - 默认模式（Default）- 现有逻辑
   - 齐套模式（Material-Ready）- **本次开发重点**

**UI位置**: 甘特图区域上方，产品选择器右侧

### 3.2 齐套模式核心算法 (FR-002)

**倒排排程原则**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         时间轴 →                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  物料层  │■■■■■│                                                        │
│          │ 物料A │                                                       │
│          │采购10天│                                                       │
│          │       │■■■■■■│                                               │
│          │       │ 物料B │                                               │
│          │       │采购15天│                                               │
├──────────┼───────┴───────┼──────────────────────────────────────────────┤
│  组件层  │               │■■■■■■│                                       │
│          │               │ 组件C │                                       │
│          │               │组装5天 │                                       │
├──────────┼───────────────┴───────┼──────────────────────────────────────┤
│  产品层  │                       │■■■■■■■│                              │
│          │                       │  产品  │                              │
│          │                       │组装3天  │                              │
├──────────┴───────────────────────┴────────┴──────────────────────────────┤
│                                          ↑ 计划结束时间                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**算法步骤**:

1. **确定产品结束时间**: 产品结束时间 = 生产计划结束时间 (end_time)

2. **计算产品组装开始时间**:
   ```
   产品组装时长 = ceil(计划生产数量 / 产品生产效率)
   产品开始时间 = 产品结束时间 - 产品组装时长
   ```

3. **逐层级倒推**:
   ```
   每一级对象的结束时间 = 上一级的开始时间 - 1天
   每一级对象的开始时间 = 结束时间 - 该对象的组装/交付时长
   ```

4. **处理库存就绪情况**:
   ```
   if (可用库存 >= 需求数量) {
     // 已就绪，用1天表示，放在结束时间前1天
     开始时间 = 结束时间 - 1
     状态 = "就绪"（绿色）
   } else {
     // 未就绪，需要采购/生产
     状态 = "未就绪"（黄色）
   }
   ```

5. **时间调整**:
   ```
   // 计算最底层物料的实际开始时间
   actualStartTime = 最底层物料的开始时间
   planStartTime = 生产计划开始时间 (start_time)

   if (actualStartTime < planStartTime) {
     // 无法按时完成，所有对象向后调整
     adjustDays = planStartTime - actualStartTime
     所有对象的开始/结束时间 += adjustDays
   } else if (actualStartTime > planStartTime) {
     // 可以提前完成，所有对象向前调整
     adjustDays = actualStartTime - planStartTime
     所有对象的开始/结束时间 -= adjustDays
   }
   ```

### 3.3 BOM层级展开 (FR-003)

**描述**: 甘特图支持BOM树形结构的展开/收缩

**规则**:
- 默认展开产品一级，显示一级组件/物料
- 点击展开图标可以展开下一级
- 支持无限层级（递归展开）
- **忽略替代物料** (alternative_part = "替代")

**交互**:
- 点击行首的 ▶/▼ 图标切换展开状态
- 展开时显示子级，收缩时隐藏子级

### 3.4 甘特图顶部信息栏 (FR-004)

**显示内容**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 产品: CP001-北斗车载智能终端                                             │
│ 预计出货周期: 2026-01-20 ~ 2026-02-15                                    │
│ 实际时间: 2026-01-18 ~ 2026-02-18 (延期3天)                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**字段说明**:
- 产品编码-名称: `${product_code}-${product_name}`
- 预计出货周期: 生产计划的 `start_time ~ end_time`
- 实际时间: 齐套模式计算出的 `actual_start_time ~ actual_end_time`
- 如有延期，显示延期天数

### 3.5 进度条显示规则 (FR-005)

#### 3.5.1 产品进度条

```
┌──────────────────────────────────────────────┐
│ CP001-北斗车载智能终端                        │
│ 类型: 产品                                    │
│ 计划生产数量: 5000                            │
│ 生产效率: 1000/天                             │
│ 组装时长: 5天                                 │
└──────────────────────────────────────────────┘
```

#### 3.5.2 组件进度条（自制物料）

```
┌──────────────────────────────────────────────┐
│ M001-主控板组件                               │
│ 类型: 组件                                    │
│ 需求数量: 5263                                │
│ 生产效率: 1000/天                             │
│ 组装时长: 6天                                 │
└──────────────────────────────────────────────┘
```

#### 3.5.3 物料进度条（外购/委外）

```
┌──────────────────────────────────────────────┐
│ R001-电阻10K                                  │
│ 类型: 物料                                    │
│ 需求数量: 26316                               │
│ 库存数量: 30000 ✓                            │
│ 交付时间: 10天/次                             │
└──────────────────────────────────────────────┘
```

### 3.6 颜色编码 (FR-006)

| 状态 | 颜色 | 说明 |
|------|------|------|
| 就绪（库存充足） | 绿色 `#52C41A` | 库存 >= 需求，进度条显示1天 |
| 未就绪（需采购/生产） | 黄色 `#FAAD14` | 库存 < 需求，需要时间准备 |
| 超期（超出计划结束时间） | 红色 `#FF4D4F` | 实际结束时间 > 计划结束时间 |
| 正常 | 蓝色 `#1890FF` | 默认颜色 |

---

## 4. 接口设计

### 4.1 API调用

使用现有的 `ontologyApi.queryObjectInstances` 接口：

```typescript
// 获取产品信息
const products = await ontologyApi.queryObjectInstances(
  OBJECT_TYPE_IDS.PRODUCT,
  { condition: { product_code: { "==": productCode } }, limit: 1 }
);

// 获取生产计划
const plans = await ontologyApi.queryObjectInstances(
  OBJECT_TYPE_IDS.PRODUCTION_PLAN,
  { condition: { code: { "==": productCode } }, limit: 10 }
);

// 获取BOM数据（全量加载后客户端过滤）
const bomItems = await ontologyApi.queryObjectInstances(
  OBJECT_TYPE_IDS.BOM,
  { limit: 10000 }
);

// 获取物料信息
const materials = await ontologyApi.queryObjectInstances(
  OBJECT_TYPE_IDS.MATERIAL,
  { condition: { material_code: { in: materialCodes } }, limit: 1000 }
);

// 获取库存信息
const inventories = await ontologyApi.queryObjectInstances(
  OBJECT_TYPE_IDS.INVENTORY,
  { condition: { material_code: { in: materialCodes } }, limit: 1000 }
);
```

### 4.2 数据结构

```typescript
// 齐套模式甘特任务
interface MaterialReadyGanttTask {
  id: string;
  name: string;                     // 编码-名称
  code: string;                     // 编码
  type: 'product' | 'component' | 'material';
  level: number;                    // BOM层级

  // 时间属性
  startDate: Date;
  endDate: Date;
  duration: number;                 // 天数

  // 状态属性
  status: 'ready' | 'not-ready' | 'overdue' | 'normal';
  isReady: boolean;                 // 库存是否就绪

  // 数量属性
  requiredQuantity: number;         // 需求数量
  availableInventory: number;       // 可用库存

  // 生产/交付属性
  productionRate?: number;          // 生产效率（组件）
  deliveryDuration?: number;        // 交付周期（物料）
  assemblyTime?: number;            // 组装时长

  // 树形结构
  children?: MaterialReadyGanttTask[];
  isExpanded: boolean;
  canExpand: boolean;
  parentId?: string;
}

// 计算结果
interface MaterialReadyCalculationResult {
  tasks: MaterialReadyGanttTask[];
  totalCycle: number;               // 总周期（天）
  actualStartDate: Date;            // 实际开始时间
  actualEndDate: Date;              // 实际结束时间
  isOverdue: boolean;               // 是否超期
  overdueDays: number;              // 超期天数
  readyMaterials: string[];         // 就绪物料列表
  notReadyMaterials: string[];      // 未就绪物料列表
}
```

---

## 5. UI设计

### 5.1 页面布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [产品选择器 ▼]              [模式: 默认模式 | 齐套模式]                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 产品信息面板                                                             │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 产品: CP001-北斗车载智能终端  |  预计: 01/20~02/15  |  实际: 01/18~02/18 │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ 甘特图区域                                                               │
│ ┌───────────────┬────────────────────────────────────────────────────┐ │
│ │ 名称          │ 01/18  01/19  01/20  ...  02/15  02/16  02/17  02/18│ │
│ ├───────────────┼────────────────────────────────────────────────────┤ │
│ │▼ CP001-终端   │                              [=====产品=====]       │ │
│ │  ▶ M001-主控板│                         [===组件===]                │ │
│ │  ▶ M002-外壳  │                         [==]                       │ │
│ │  ● R001-电阻  │ [■]                                                │ │
│ │  ● R002-电容  │ [■■■■■]                                            │ │
│ └───────────────┴────────────────────────────────────────────────────┘ │
│ 图例: [绿色]=就绪  [黄色]=未就绪  [红色]=超期                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 风险提示面板                                                             │
│ ⚠ 物料R002-电容库存不足，需采购15天                                      │
│ ⚠ 预计延期3天，建议加急采购                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 组件结构

```
MPSPrototype (现有)
├── ProductSelector (现有)
├── PlanModeSelector (新增)
│   └── 模式切换按钮组
├── ProductInfoPanel (修改)
│   └── 增加实际时间显示
├── GanttChartSection (修改)
│   ├── GanttHeader (新增)
│   │   └── 产品信息、计划时间、实际时间
│   ├── GanttBOMTree (修改)
│   │   └── 支持齐套模式的进度条渲染
│   ├── GanttTaskBar (修改)
│   │   └── 支持新的颜色编码和Tooltip
│   └── GanttTooltip (修改)
│       └── 显示详细信息
├── RiskAlertsPanel (现有)
└── LegendPanel (新增)
    └── 颜色图例说明
```

---

## 6. 实现计划

### 6.1 阶段划分

#### 阶段1: 数据层 (P0)

1. **类型定义** (ontology.ts)
   - 新增 `MaterialReadyGanttTask` 接口
   - 新增 `MaterialReadyCalculationResult` 接口
   - 新增 `ProductionPlanMode` 类型

2. **数据服务** (mpsDataService.ts)
   - 新增 `fetchMaterialDeliveryDuration()` 获取物料交付周期
   - 新增 `parseDeliveryDuration()` 解析交付时长字符串
   - 新增 `parseProductionRate()` 解析生产效率字符串

3. **计算器** (productionPlanCalculator.ts)
   - 新增 `calculateMaterialReadyModeV2()` 齐套模式核心算法
   - 新增 `calculateRequiredQuantity()` 需求数量计算
   - 新增 `adjustScheduleForDeadline()` 时间调整算法

#### 阶段2: UI层 (P0)

4. **模式选择器** (PlanModeSelector.tsx)
   - 新增模式切换UI
   - 状态管理

5. **甘特图组件** (GanttChartSection.tsx)
   - 集成模式切换
   - 新增顶部信息栏

6. **进度条组件** (GanttTaskBar.tsx)
   - 新增颜色编码支持
   - 新增状态渲染逻辑

7. **Tooltip组件** (GanttTooltip.tsx)
   - 根据类型显示不同信息

#### 阶段3: 集成测试 (P1)

8. **单元测试**
   - 算法测试用例
   - 组件测试用例

9. **集成测试**
   - 端到端测试
   - 真实数据测试

### 6.2 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/ontology.ts` | 修改 | 新增类型定义 |
| `src/services/mpsDataService.ts` | 修改 | 新增数据获取函数 |
| `src/utils/productionPlanCalculator.ts` | 修改 | 新增齐套模式算法 |
| `src/components/planning/PlanModeSelector.tsx` | 修改 | 完善模式选择器 |
| `src/components/planning/GanttChartSection.tsx` | 修改 | 集成模式切换 |
| `src/components/planning/GanttTaskBar.tsx` | 修改 | 新增颜色编码 |
| `src/components/planning/GanttTooltip.tsx` | 修改 | 新增详细信息 |
| `src/components/planning/GanttHeader.tsx` | 新增 | 顶部信息栏 |
| `src/components/planning/LegendPanel.tsx` | 新增 | 颜色图例 |
| `src/components/planning/MPSPrototype.tsx` | 修改 | 集成齐套模式 |

---

## 7. 测试计划

### 7.1 测试场景

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| TC-001 | 所有物料库存充足 | 所有物料显示绿色，1天进度条 |
| TC-002 | 部分物料库存不足 | 不足物料显示黄色，显示采购周期 |
| TC-003 | 计划时间充足 | 正常显示，无红色 |
| TC-004 | 计划时间不足 | 超期部分显示红色，提示延期天数 |
| TC-005 | BOM多层嵌套 | 正确展开/收缩，时间倒排正确 |
| TC-006 | 组件有子组件 | 组件等待子组件齐套后才开始 |
| TC-007 | 损耗率计算 | 需求数量正确考虑损耗 |
| TC-008 | 模式切换 | 切换模式后甘特图正确刷新 |

### 7.2 真实数据测试

需要用户提供:
- 服务器端token
- 测试用产品编号
- 测试用生产计划编号

---

## 8. 风险与注意事项

### 8.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| BOM数据量大 | 加载慢 | 分页加载，客户端缓存 |
| 多层BOM递归 | 性能问题 | 限制最大层级，优化算法 |
| delivery_duration格式不一致 | 解析错误 | 健壮的解析函数，默认值兜底 |

### 8.2 数据注意事项

1. **损耗率处理**: 如果 `loss_rate > 1`，需要除以100转为小数
2. **交付周期解析**: 需要支持 "10天/次" 和 "1000/天" 两种格式
3. **替代物料**: 过滤掉 `alternative_part = "替代"` 的记录
4. **库存优先级**: 优先使用 `available_quantity`，其次 `inventory_data`

### 8.3 边界条件

- 空BOM数据：显示提示信息
- 库存为0：显示完整采购周期
- 生产效率为0：使用默认值
- 交付周期未填写：使用默认值（15天）

---

## 9. 附录

### 9.1 现有代码参考

- 默认模式算法: [MPSPrototype.tsx:59-368](src/components/planning/MPSPrototype.tsx#L59-L368)
- 物料齐套模式（旧版）: [productionPlanCalculator.ts:256-349](src/utils/productionPlanCalculator.ts#L256-L349)
- 甘特图渲染: [GanttBOMTree.tsx](src/components/planning/GanttBOMTree.tsx)
- 数据服务: [mpsDataService.ts](src/services/mpsDataService.ts)

### 9.2 API文档

后端API文档: https://github.com/kweaver-ai/adp/blob/main/docs/ontology/ontology-query/ontology-query.yaml

### 9.3 审核清单

- [ ] 需求描述是否清晰完整
- [ ] 数据模型是否正确
- [ ] 算法逻辑是否合理
- [ ] UI设计是否满足需求
- [ ] 实现计划是否可行
- [ ] 测试场景是否覆盖完整

---

**文档状态**: 待审核
**下一步**: 请审核本文档，确认无误后开始实施
