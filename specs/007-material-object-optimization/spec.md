# 物料对象优化功能规范

## 概述

本规范描述物料对象的数据模型优化和页面展示优化需求，包括物料单位标准化、供应商数据更新、库存数据生成规则调整，以及物料生命周期信息管理。

## 功能需求

### 一、物料对象优化

#### 1.1 物料单位标准化
- **需求**：物料对象的单位为"件"，而不是重量（如"吨"、"千克"等）
- **影响范围**：所有物料相关的数据展示、计算逻辑、单位显示

#### 1.2 供应商数据更新
- **需求**：供应商更新为8个，供应商对象相关属性需要mock并更新
- **当前状态**：现有4个供应商（SUP-001至SUP-004），每个供应商可供应多个物料
- **目标状态**：扩展至8个独立供应商，每个供应商具有完整的属性信息
- **物料-供应商分配规则**：多对多关系，每个供应商供应2-4个物料，每个物料可以有1-2个供应商，确保22个物料覆盖8个供应商

#### 1.3 物料库存数据生成规则
- **需求**：
  - 每个物料库存数量随机生成，范围在21-5000件之间
  - 入库时间随机分布在2022年-2025年10月

### 二、物料对象页面优化

#### 2.1 物料数据重新生成
- **需求**：物料对象重新更新为22件
- **物料命名规则**：参考产品名称生成，参考公司信息：
  - 公司背景：某农业科技股份有限公司专注于智慧农业产品解决方案
  - 技术特点：将北斗技术、物联网、人工智能与农业场景相结合
  - 产品类别：
    - 农业无人飞机
    - 北斗导航农机自动驾驶系统
    - 农机智能探测设备
    - 智能灌溉系统
  - 应用场景：自营无人农场运营实现智慧农业方案的典型应用
- **产品关联规则**：保持现有产品不变，将22个物料按类别和功能关联到相应产品，确保每个产品都有足够的物料支持

#### 2.2 物料生命周期信息
- **需求**：物料对象属性增加生命周期信息
  - 入库时间（warehouseInDate）：必填，随机分布在2022年-2025年10月
  - 出库时间（warehouseOutDate，新增字段）：可选字段，只有已出库的物料才填写出库时间，未出库的物料出库时间为空

#### 2.3 数据同步更新
- **需求**：所有其他页面的信息同步更新
- **影响范围**：
  - 物料列表页面
  - 物料详情页面
  - 供应商关联页面
  - 产品BOM关联页面
  - 库存管理页面
  - 供应链图谱页面

## 数据模型

### Material接口扩展
```typescript
export interface Material {
  materialCode: string;       // 物料编码
  materialName: string;       // 物料名称
  applicableProductIds: string[]; // 物料适用产品编号（数组）
  bomId?: string;             // BOM编号
  warehouseInDate?: string;   // 入库时间（YYYY-MM-DD格式）
  warehouseOutDate?: string;  // 出库时间（YYYY-MM-DD格式，新增）
  status?: '呆滞' | '正常' | '异常' | '慢动';
  maxStock?: number;          // 最大库存量
  minStock?: number;          // 最低库存量
  currentStock?: number;      // 当前库存量（单位：件）
  inventoryDistribution?: {   // 库存分布
    available: number;
    locked: number;
    inTransit: number;
    scrapped: number;
  };
}
```

### MaterialStock接口
```typescript
export interface MaterialStock {
  materialCode: string;       // 物料编码
  supplierId: string;         // 供应商ID
  remainingStock: number;      // 剩余库存数量（单位：件）
  purchaseTime: string;       // 采购时间
  purchaseQuantity: number;    // 采购数量（单位：件）
}
```

### Supplier接口扩展
```typescript
export interface Supplier {
  supplierId: string;        // 供应商ID
  supplierName: string;       // 供应商名称
  materialName: string;       // 供应物料名称
  materialCode: string;       // 物料编码
  // 扩展属性
  contactPhone?: string;      // 联系电话
  contactEmail?: string;      // 联系邮箱
  address?: string;           // 地址
  creditRating?: string;      // 信用评级
  cooperationYears?: number;  // 合作年限
  annualPurchaseAmount?: number; // 年采购金额
  qualityRating?: number;     // 质量评分（0-100）
  riskRating?: number;        // 风险评级（0-100，越低越好）
  onTimeDeliveryRate?: number; // 准时交付率（0-100）
  financialStatus?: string;   // 财务状态
}
```

## Clarifications

### Session 2025-01-27

- Q: 供应商对象需要扩展哪些属性？ → A: 选项C - 扩展完整属性：包括常用业务属性（联系方式、地址、信用评级、合作年限、年采购金额等），再加上质量评分、风险评级、准时交付率、财务状态等评估维度
- Q: 22个物料如何分配给8个供应商？ → A: 选项B - 多对多关系：每个供应商供应2-4个物料，每个物料可以有1-2个供应商，确保22个物料覆盖8个供应商
- Q: 出库时间的逻辑是什么？ → A: 选项B - 出库时间为可选字段，只有已出库的物料才填写出库时间，未出库的物料出库时间为空
- Q: 物料库存数量的上限范围是多少？ → A: 选项B - 设置合理上限：库存数量范围在21-5000件之间
- Q: 22个物料如何关联到现有产品？ → A: 选项B - 保持现有产品，智能关联：保持现有产品不变，将22个物料按类别和功能关联到相应产品，确保每个产品都有足够的物料支持

