# 物料对象优化技术实施计划

## 概述

本计划基于澄清后的功能规范，详细描述物料对象优化的技术实施步骤、代码变更、测试策略和验收标准。

## 技术架构

### 数据流
```
类型定义 (ontology.ts) 
  ↓
Mock数据生成 (mockData.ts)
  ↓
数据服务层 (dataService.ts, entityConfigService.ts)
  ↓
UI组件层 (EntityListPage, RightPanel, etc.)
```

### 核心变更点
1. **类型定义层**：扩展Material和Supplier接口
2. **数据层**：重新生成22个物料、8个供应商的mock数据
3. **服务层**：更新单位计算逻辑，统一为"件"
4. **UI层**：同步更新所有物料相关页面展示

## 实施步骤

### Phase 1: 类型定义更新

#### 1.1 更新Material接口
**文件**: `src/types/ontology.ts`

**变更内容**:
- 添加 `warehouseOutDate?: string;` 字段（出库时间，可选）
- 更新注释：明确单位统一为"件"

**代码示例**:
```typescript
export interface Material {
  materialCode: string;
  materialName: string;
  applicableProductIds: string[];
  warehouseInDate?: string;   // 入库时间（YYYY-MM-DD格式）
  warehouseOutDate?: string;  // 出库时间（YYYY-MM-DD格式，新增）
  status?: '呆滞' | '正常' | '异常';
  maxStock?: number;
  minStock?: number;
  currentStock?: number;      // 当前库存量（单位：件）
}
```

#### 1.2 更新Supplier接口
**文件**: `src/types/ontology.ts`

**变更内容**:
- 扩展Supplier接口，添加完整业务属性

**代码示例**:
```typescript
export interface Supplier {
  supplierId: string;
  supplierName: string;
  materialName: string;       // 供应物料名称
  materialCode: string;        // 物料编码
  // 扩展属性
  contactPhone?: string;       // 联系电话
  contactEmail?: string;       // 联系邮箱
  address?: string;            // 地址
  creditRating?: string;       // 信用评级
  cooperationYears?: number;   // 合作年限
  annualPurchaseAmount?: number; // 年采购金额
  qualityRating?: number;       // 质量评分（0-100）
  riskRating?: number;          // 风险评级（0-100，越低越好）
  onTimeDeliveryRate?: number;  // 准时交付率（0-100）
  financialStatus?: string;     // 财务状态
}
```

**依赖关系**: 无

**验收标准**:
- TypeScript编译通过
- 所有类型定义符合规范要求

---

### Phase 2: Mock数据生成

#### 2.1 生成22个物料数据
**文件**: `src/data/mockData.ts`

**变更内容**:
- 删除现有8个物料数据
- 生成22个新物料，物料编码：MAT-001 至 MAT-022
- 物料命名规则：参考农业科技公司产品类别
  - 农业无人飞机相关：飞控芯片、GPS定位器、多光谱相机、避障雷达、电池模块、螺旋桨、机架、云台等
  - 北斗导航系统相关：北斗接收模块、惯性导航单元、RTK定位板、控制主板、显示屏、操作手柄等
  - 智能探测设备相关：土壤湿度传感器、温度传感器、pH传感器、光照传感器、风速传感器等
  - 智能灌溉系统相关：电磁阀、水泵、流量计、压力传感器、控制器等
- 每个物料属性：
  - `warehouseInDate`: 随机分布在2022-01-01至2025-10-31之间
  - `warehouseOutDate`: 30%的物料随机生成（已出库），70%为空（未出库）
  - `currentStock`: 随机生成21-5000件之间
  - `status`: 根据入库时间计算（超过2年且未出库为"呆滞"，超过1年为"异常"，其他为"正常"）
  - `applicableProductIds`: 根据物料类别智能关联到现有产品

**物料分配示例**:
```typescript
// 农业无人飞机类别（6个物料）
MAT-001: 飞控芯片 → PROD-001, PROD-005
MAT-002: GPS定位器 → PROD-001, PROD-002, PROD-005
MAT-003: 多光谱相机 → PROD-001, PROD-003, PROD-005
MAT-004: 避障雷达 → PROD-001, PROD-005
MAT-005: 电池模块 → PROD-001, PROD-005
MAT-006: 螺旋桨 → PROD-001, PROD-005

// 北斗导航系统类别（6个物料）
MAT-007: 北斗接收模块 → PROD-002, PROD-006
MAT-008: 惯性导航单元 → PROD-002, PROD-006
MAT-009: RTK定位板 → PROD-002, PROD-006
MAT-010: 控制主板 → PROD-002, PROD-006
MAT-011: 显示屏 → PROD-002, PROD-006
MAT-012: 操作手柄 → PROD-002, PROD-006

// 智能探测设备类别（5个物料）
MAT-013: 土壤湿度传感器 → PROD-003, PROD-006
MAT-014: 温度传感器 → PROD-003, PROD-006
MAT-015: pH传感器 → PROD-003, PROD-006
MAT-016: 光照传感器 → PROD-003, PROD-006
MAT-017: 风速传感器 → PROD-003, PROD-006

// 智能灌溉系统类别（5个物料）
MAT-018: 电磁阀 → PROD-004, PROD-009
MAT-019: 水泵 → PROD-004, PROD-009
MAT-020: 流量计 → PROD-004, PROD-009
MAT-021: 压力传感器 → PROD-004, PROD-009
MAT-022: 控制器 → PROD-004, PROD-009
```

**辅助函数**:
```typescript
// 生成随机日期（2022-01-01 至 2025-10-31）
const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// 生成随机库存（21-5000件）
const generateRandomStock = (): number => {
  return Math.floor(Math.random() * 4979) + 21;
};

// 计算物料状态
const calculateMaterialStatus = (warehouseInDate: string, warehouseOutDate?: string): '呆滞' | '正常' | '异常' => {
  if (warehouseOutDate) return '正常'; // 已出库视为正常
  const inDate = new Date(warehouseInDate);
  const now = new Date();
  const yearsDiff = (now.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (yearsDiff > 2) return '呆滞';
  if (yearsDiff > 1) return '异常';
  return '正常';
};
```

**依赖关系**: Phase 1完成

**验收标准**:
- 22个物料数据生成正确
- 入库时间分布在2022-2025年10月
- 30%物料有出库时间，70%为空
- 库存数量在21-5000件之间
- 物料状态计算正确
- 物料与产品关联合理

#### 2.2 生成8个供应商数据
**文件**: `src/data/mockData.ts`

**变更内容**:
- 删除现有4个供应商数据
- 生成8个新供应商，供应商ID：SUP-001 至 SUP-008
- 每个供应商mock完整属性信息

**供应商分配规则**:
- 每个供应商供应2-4个物料
- 每个物料可以有1-2个供应商
- 确保22个物料全部覆盖

**供应商数据示例**:
```typescript
SUP-001: 北斗科技电子元件有限公司
  - 供应物料: MAT-001, MAT-002, MAT-007, MAT-008
  - contactPhone: '010-12345678'
  - contactEmail: 'contact@beidou-tech.com'
  - address: '北京市海淀区中关村大街1号'
  - creditRating: 'AAA'
  - cooperationYears: 5
  - annualPurchaseAmount: 5000000
  - qualityRating: 95
  - riskRating: 10
  - onTimeDeliveryRate: 98
  - financialStatus: '良好'

SUP-002: 智能装备机械加工厂
  - 供应物料: MAT-003, MAT-004, MAT-005, MAT-006
  - ... (完整属性)

// ... 其他6个供应商
```

**依赖关系**: Phase 2.1完成

**验收标准**:
- 8个供应商数据生成正确
- 每个供应商有完整的扩展属性
- 物料-供应商分配符合多对多关系规则
- 22个物料全部有供应商覆盖

#### 2.3 更新MaterialStock数据
**文件**: `src/data/mockData.ts`

**变更内容**:
- 根据新的物料和供应商关系，重新生成MaterialStock数据
- 每个物料-供应商组合生成一条库存记录
- `remainingStock`: 随机生成21-5000件
- `purchaseQuantity`: 大于remainingStock（模拟已使用部分）
- `purchaseTime`: 与物料的warehouseInDate保持一致或稍早

**依赖关系**: Phase 2.1, 2.2完成

**验收标准**:
- MaterialStock数据与物料、供应商关系一致
- 库存数量单位统一为"件"
- 采购时间逻辑合理

---

### Phase 3: 服务层更新

#### 3.1 更新单位计算逻辑
**文件**: `src/utils/entityConfigService.ts`

**变更内容**:
- 修改 `getUnit` 函数，统一返回"件"
- 删除基于物料名称判断单位的逻辑

**代码变更**:
```typescript
// 修改前
const getUnit = (materialName: string): string => {
  if (materialName.includes('钢材') || materialName.includes('铝材') || materialName.includes('铜材')) return '吨';
  if (materialName.includes('塑料') || materialName.includes('橡胶')) return '千克';
  return '件';
};

// 修改后
const getUnit = (materialName: string): string => {
  return '件'; // 统一使用"件"作为单位
};
```

**依赖关系**: Phase 2完成

**验收标准**:
- 所有物料单位显示为"件"
- 相关计算逻辑使用"件"作为单位

#### 3.2 更新dataService中的单位
**文件**: `src/services/dataService.ts`

**变更内容**:
- 修改物料节点生成逻辑，将单位从'kg'改为'件'

**代码变更**:
```typescript
// 修改前
return {
  id: material.materialCode,
  name: material.materialName,
  type: 'MATERIAL',
  stock: totalStock,
  unit: 'kg',  // 需要修改
  applicableProductIds: material.applicableProductIds,
};

// 修改后
return {
  id: material.materialCode,
  name: material.materialName,
  type: 'MATERIAL',
  stock: totalStock,
  unit: '件',  // 统一为"件"
  applicableProductIds: material.applicableProductIds,
};
```

**依赖关系**: Phase 3.1完成

**验收标准**:
- 供应链图谱中物料单位显示为"件"

---

### Phase 4: UI组件更新

#### 4.1 更新物料列表页面
**文件**: `src/components/config-backend/EntityListPage.tsx`

**变更内容**:
- 确保物料列表正确显示22个物料
- 显示入库时间和出库时间（如果有）
- 单位显示为"件"

**依赖关系**: Phase 2, 3完成

**验收标准**:
- 物料列表显示22个物料
- 生命周期信息正确显示
- 单位统一为"件"

#### 4.2 更新物料详情面板
**文件**: `src/components/config-backend/RightPanel.tsx`

**变更内容**:
- 添加入库时间和出库时间字段显示
- 确保单位显示为"件"

**依赖关系**: Phase 2, 3完成

**验收标准**:
- 物料详情正确显示生命周期信息
- 单位显示正确

#### 4.3 更新供应商相关页面
**文件**: `src/components/config-backend/EntityListPage.tsx`, `RightPanel.tsx`

**变更内容**:
- 确保供应商列表显示8个供应商
- 显示供应商的扩展属性（联系方式、评级等）

**依赖关系**: Phase 2完成

**验收标准**:
- 供应商列表显示8个供应商
- 扩展属性正确显示

#### 4.4 更新供应链图谱
**文件**: `src/services/dataService.ts` (已在Phase 3.2处理)

**变更内容**:
- 确保图谱中物料节点单位显示为"件"

**依赖关系**: Phase 3.2完成

**验收标准**:
- 图谱中物料单位显示为"件"

---

## 测试策略

### 单元测试
1. **数据生成函数测试**
   - 验证22个物料生成正确
   - 验证8个供应商生成正确
   - 验证库存数量范围（21-5000件）
   - 验证入库时间分布（2022-2025年10月）
   - 验证出库时间逻辑（30%有值，70%为空）

2. **单位计算测试**
   - 验证所有物料单位返回"件"
   - 验证相关计算使用"件"作为单位

### 集成测试
1. **数据一致性测试**
   - 验证物料-供应商关系正确
   - 验证物料-产品关联正确
   - 验证MaterialStock数据与物料数据一致

2. **UI展示测试**
   - 验证物料列表显示22个物料
   - 验证供应商列表显示8个供应商
   - 验证单位显示统一为"件"
   - 验证生命周期信息正确显示

### 手动测试清单
- [ ] 物料列表页面：显示22个物料，单位统一为"件"
- [ ] 物料详情页面：显示入库时间、出库时间（如果有）
- [ ] 供应商列表页面：显示8个供应商，扩展属性正确
- [ ] 供应链图谱：物料节点单位显示为"件"
- [ ] 产品BOM关联：物料关联正确
- [ ] 库存管理页面：库存数量单位统一为"件"

---

## 风险评估

### 高风险项
1. **数据迁移风险**
   - 现有8个物料删除后，可能影响其他功能
   - **缓解措施**: 先备份现有数据，逐步迁移

2. **供应商接口扩展风险**
   - Supplier接口扩展可能影响现有代码
   - **缓解措施**: 使用可选属性，保持向后兼容

### 中风险项
1. **单位统一风险**
   - 单位从多种（吨、千克）统一为"件"，可能影响业务逻辑
   - **缓解措施**: 全面搜索代码，确保所有相关位置更新

2. **物料-产品关联风险**
   - 22个新物料需要正确关联到现有产品
   - **缓解措施**: 仔细设计关联规则，确保每个产品都有足够物料

---

## 实施时间估算

| Phase | 任务 | 预估时间 |
|-------|------|----------|
| Phase 1 | 类型定义更新 | 0.5小时 |
| Phase 2 | Mock数据生成 | 2小时 |
| Phase 3 | 服务层更新 | 1小时 |
| Phase 4 | UI组件更新 | 1.5小时 |
| 测试 | 单元测试和集成测试 | 1小时 |
| **总计** | | **6小时** |

---

## 验收标准

### 功能验收
- ✅ 物料对象数量：22个
- ✅ 供应商数量：8个
- ✅ 物料单位：统一为"件"
- ✅ 库存数量：21-5000件之间
- ✅ 入库时间：2022-2025年10月
- ✅ 出库时间：30%有值，70%为空
- ✅ 物料-供应商关系：多对多，符合分配规则
- ✅ 物料-产品关联：保持现有产品，智能关联

### 技术验收
- ✅ TypeScript编译通过
- ✅ 无运行时错误
- ✅ 所有页面正常显示
- ✅ 数据一致性验证通过

---

## 后续优化建议

1. **数据验证增强**
   - 添加数据一致性检查函数
   - 添加数据生成验证工具

2. **性能优化**
   - 如果22个物料导致性能问题，考虑分页或虚拟滚动

3. **扩展性考虑**
   - 考虑将物料和供应商数据迁移到配置文件，便于后续维护

