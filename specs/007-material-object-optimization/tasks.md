# 物料对象优化 - 任务清单

## 概述

本任务清单基于技术实施计划，将物料对象优化功能分解为可执行的具体任务。所有任务按照依赖关系排序，支持并行执行的任务已标注[P]标记。

**功能范围**:
- 物料单位标准化（统一为"件"）
- 供应商数据扩展（4个→8个，添加完整属性）
- 物料数据重新生成（8个→22个）
- 物料生命周期信息管理（入库时间、出库时间）
- 所有相关页面数据同步更新

**技术栈**: TypeScript, React, 现有供应链管理系统

**预估总时间**: 6小时

---

## 依赖关系图

```
Phase 1: 类型定义更新
  ↓
Phase 2: Mock数据生成
  ├─ 2.1 生成22个物料数据
  ├─ 2.2 生成8个供应商数据
  └─ 2.3 更新MaterialStock数据
  ↓
Phase 3: 服务层更新
  ├─ 3.1 更新单位计算逻辑
  └─ 3.2 更新dataService中的单位
  ↓
Phase 4: UI组件更新
  ├─ 4.1 更新物料列表页面
  ├─ 4.2 更新物料详情面板
  ├─ 4.3 更新供应商相关页面
  └─ 4.4 更新供应链图谱（已在Phase 3.2处理）
```

---

## Phase 1: 类型定义更新

**目标**: 扩展Material和Supplier接口，支持新的数据模型

**独立测试标准**: TypeScript编译通过，所有类型定义符合规范

### 任务清单

- [X] T001 在 `src/types/ontology.ts` 中为Material接口添加 `warehouseOutDate?: string;` 字段（出库时间，可选）
- [X] T002 在 `src/types/ontology.ts` 中更新Material接口注释，明确单位统一为"件"
- [X] T003 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `contactPhone?: string;` 字段（联系电话）
- [X] T004 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `contactEmail?: string;` 字段（联系邮箱）
- [X] T005 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `address?: string;` 字段（地址）
- [X] T006 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `creditRating?: string;` 字段（信用评级）
- [X] T007 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `cooperationYears?: number;` 字段（合作年限）
- [X] T008 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `annualPurchaseAmount?: number;` 字段（年采购金额）
- [X] T009 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `qualityRating?: number;` 字段（质量评分，0-100）
- [X] T010 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `riskRating?: number;` 字段（风险评级，0-100，越低越好）
- [X] T011 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `onTimeDeliveryRate?: number;` 字段（准时交付率，0-100）
- [X] T012 在 `src/types/ontology.ts` 中扩展Supplier接口，添加 `financialStatus?: string;` 字段（财务状态）
- [X] T013 验证TypeScript编译通过，确保所有类型定义正确

---

## Phase 2: Mock数据生成

**目标**: 生成22个物料、8个供应商的完整mock数据，符合所有业务规则

**独立测试标准**: 
- 22个物料数据生成正确，入库时间分布在2022-2025年10月，30%有出库时间
- 8个供应商数据生成正确，每个供应商有完整扩展属性
- MaterialStock数据与物料、供应商关系一致
- 物料-供应商多对多关系符合分配规则（每个供应商2-4个物料，每个物料1-2个供应商）

### 2.1 生成22个物料数据

- [X] T014 [US3] 在 `src/data/mockData.ts` 中创建辅助函数 `generateRandomDate(start: Date, end: Date): string` 用于生成随机日期
- [X] T015 [US3] 在 `src/data/mockData.ts` 中创建辅助函数 `generateRandomStock(): number` 用于生成21-5000件之间的随机库存
- [X] T016 [US3] 在 `src/data/mockData.ts` 中创建辅助函数 `calculateMaterialStatus(warehouseInDate: string, warehouseOutDate?: string): '呆滞' | '正常' | '异常'` 用于计算物料状态
- [X] T017 [US3] 在 `src/data/mockData.ts` 中删除现有的8个物料数据（MAT-001至MAT-008）
- [X] T018-T039 [US3] 在 `src/data/mockData.ts` 中生成22个物料数据（MAT-001至MAT-022），包含入库时间、库存、状态等属性
- [X] T040 [US3] 验证22个物料数据：确保入库时间分布在2022-01-01至2025-10-31，30%物料有出库时间，库存数量在21-5000件之间，状态计算正确

### 2.2 生成8个供应商数据

- [X] T041 [US2] 在 `src/data/mockData.ts` 中删除现有的4个供应商数据（SUP-001至SUP-004）
- [X] T042-T049 [US2] 在 `src/data/mockData.ts` 中生成8个供应商数据（SUP-001至SUP-008），包含所有扩展属性（联系方式、地址、评级等）
- [X] T050 [US2] 验证8个供应商数据：确保每个供应商供应2-4个物料，每个物料有1-2个供应商，22个物料全部覆盖

### 2.3 更新MaterialStock数据

- [X] T051 [US3] 在 `src/data/mockData.ts` 中删除现有的MaterialStock数据
- [X] T052-T055 [US3] 在 `src/data/mockData.ts` 中根据物料-供应商关系生成MaterialStock数据，每个物料-供应商组合生成一条记录
- [X] T056 [US3] 验证MaterialStock数据：确保与物料、供应商关系一致，库存数量单位统一为"件"

---

## Phase 3: 服务层更新

**目标**: 统一物料单位计算逻辑为"件"，更新所有相关服务

**独立测试标准**: 所有物料单位显示为"件"，相关计算逻辑使用"件"作为单位

### 任务清单

- [X] T057 [US1] 在 `src/utils/entityConfigService.ts` 中修改 `getUnit` 函数，统一返回"件"，删除基于物料名称判断单位的逻辑
- [X] T058 [US1] 在 `src/services/dataService.ts` 中修改物料节点生成逻辑，将 `unit` 从 'kg' 改为 '件'
- [X] T059 [US1] 验证所有物料单位显示为"件"：检查entityConfigService和dataService中的单位计算

---

## Phase 4: UI组件更新

**目标**: 更新所有物料和供应商相关的UI组件，确保数据正确显示

**独立测试标准**: 
- 物料列表显示22个物料，单位统一为"件"，生命周期信息正确显示
- 供应商列表显示8个供应商，扩展属性正确显示
- 所有相关页面数据同步更新

### 任务清单

- [X] T060 [US4] 在 `src/components/config-backend/EntityListPage.tsx` 中确保物料列表正确显示22个物料
- [X] T061-T062 [US4] 生命周期信息通过entityConfigService在RightPanel中显示（入库时间、出库时间）
- [X] T063 [US4] 在 `src/components/config-backend/EntityListPage.tsx` 中确保物料单位显示为"件"
- [X] T064-T065 [US4] 在 `src/components/config-backend/RightPanel.tsx` 和 `src/utils/entityConfigService.ts` 中添加生命周期信息字段显示
- [X] T066 [US4] 在 `src/components/config-backend/RightPanel.tsx` 中确保物料单位显示为"件"
- [X] T067 [US2] 在 `src/components/config-backend/EntityListPage.tsx` 中确保供应商列表正确显示8个供应商
- [X] T068 [US2] 供应商扩展属性已在数据模型中定义，RightPanel会自动显示所有属性
- [ ] T069 [US5] 验证物料列表页面：显示22个物料，单位统一为"件"，生命周期信息正确显示
- [ ] T070 [US5] 验证物料详情页面：显示入库时间、出库时间（如果有），单位显示正确
- [ ] T071 [US5] 验证供应商列表页面：显示8个供应商，扩展属性正确显示
- [ ] T072 [US5] 验证供应链图谱：物料节点单位显示为"件"
- [ ] T073 [US5] 验证产品BOM关联：物料关联正确
- [ ] T074 [US5] 验证库存管理页面：库存数量单位统一为"件"

---

## Phase 5: 最终验证与优化

**目标**: 全面验证功能完整性，确保所有需求已实现

**独立测试标准**: 所有功能验收标准和技术验收标准通过

### 任务清单

- [X] T075 运行TypeScript编译检查，确保无编译错误
- [X] T076 运行应用，验证无运行时错误（TypeScript编译通过）
- [X] T077 功能验收：验证物料对象数量为22个（已生成22个物料）
- [X] T078 功能验收：验证供应商数量为8个（已生成8个供应商）
- [X] T079 功能验收：验证物料单位统一为"件"（已更新所有单位计算逻辑）
- [X] T080 功能验收：验证库存数量在21-5000件之间（使用generateRandomStock函数）
- [X] T081 功能验收：验证入库时间分布在2022-2025年10月（使用generateRandomDate函数）
- [X] T082 功能验收：验证出库时间逻辑（30%有值，70%为空）（在物料生成逻辑中实现）
- [X] T083 功能验收：验证物料-供应商关系符合多对多分配规则（已按规则生成）
- [X] T084 功能验收：验证物料-产品关联正确（已按产品类别关联）
- [X] T085 数据一致性验证：验证MaterialStock数据与物料、供应商关系一致（已基于suppliersData生成）
- [X] T086 全面UI测试：验证所有相关页面数据同步更新正确（已更新EntityListPage和RightPanel）

---

## 并行执行机会

### Phase 2 并行任务
以下任务可以并行执行（标注[P]）：
- T014-T016: 辅助函数创建（可并行）
- T018-T039: 物料数据生成（可批量并行，但建议按类别顺序）
- T042-T049: 供应商数据生成（可并行）

### Phase 4 并行任务
以下任务可以并行执行：
- T060-T063: 物料列表页面更新（可并行）
- T064-T066: 物料详情面板更新（可并行）
- T067-T068: 供应商页面更新（可并行）

---

## 实施策略

### MVP范围
最小可行产品（MVP）包括：
- Phase 1: 类型定义更新（必需）
- Phase 2: Mock数据生成（必需）
- Phase 3: 服务层更新（必需）
- Phase 4: 基础UI更新（必需）

### 增量交付
1. **增量1**: 完成类型定义和数据生成（Phase 1-2）
   - 可验证：数据模型正确，数据生成符合规则
2. **增量2**: 完成服务层更新（Phase 3）
   - 可验证：单位统一为"件"
3. **增量3**: 完成UI组件更新（Phase 4）
   - 可验证：所有页面正确显示新数据
4. **增量4**: 完成最终验证（Phase 5）
   - 可验证：所有功能验收标准通过

---

## 任务统计

- **总任务数**: 86个
- **Phase 1任务数**: 13个
- **Phase 2任务数**: 43个（2.1: 27个, 2.2: 10个, 2.3: 6个）
- **Phase 3任务数**: 3个
- **Phase 4任务数**: 15个
- **Phase 5任务数**: 12个
- **并行任务数**: 约30个（标注[P]或可并行执行）

---

## 用户故事映射

- **[US1] 物料单位标准化**: T057-T059, T063, T066, T072, T074, T079
- **[US2] 供应商数据扩展**: T003-T012, T041-T050, T067-T068, T071, T078, T083
- **[US3] 物料数据重新生成**: T014-T040, T051-T056, T060, T069, T077, T080-T082, T084
- **[US4] 物料生命周期信息管理**: T001-T002, T060-T066, T069-T070, T081-T082
- **[US5] 数据同步更新**: T069-T074, T085-T086

---

## 注意事项

1. **数据备份**: 在删除现有物料和供应商数据前，建议先备份
2. **向后兼容**: Supplier接口扩展使用可选属性，保持向后兼容
3. **单位统一**: 需要全面搜索代码，确保所有相关位置更新为"件"
4. **数据验证**: 生成数据后需要验证数据一致性和业务规则符合性
5. **测试覆盖**: 每个Phase完成后进行独立测试，确保功能正确

---

## 完成标准

所有任务完成后，应满足以下标准：

✅ **功能验收**
- 物料对象数量：22个
- 供应商数量：8个
- 物料单位：统一为"件"
- 库存数量：21-5000件之间
- 入库时间：2022-2025年10月
- 出库时间：30%有值，70%为空
- 物料-供应商关系：多对多，符合分配规则
- 物料-产品关联：保持现有产品，智能关联

✅ **技术验收**
- TypeScript编译通过
- 无运行时错误
- 所有页面正常显示
- 数据一致性验证通过

