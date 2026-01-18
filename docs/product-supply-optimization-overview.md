# 产品供应优化页面 - 文档总览

## 📚 文档索引

本文档集提供了产品供应优化页面的完整逆向工程文档，包含需求、设计和技术实现方案，旨在帮助Agent根据这些文档进行功能复现。

### 文档列表

1. **[需求文档](./product-supply-optimization-requirements.md)**
   - 功能需求详细说明
   - 业务规则和约束条件
   - 验收标准

2. **[设计文档](./product-supply-optimization-design.md)**
   - 架构设计
   - 组件设计
   - UI/UX设计
   - 数据模型设计

3. **[技术实现方案文档](./product-supply-optimization-implementation.md)**
   - 技术栈说明
   - 数据字段映射（含示例）
   - 核心算法实现
   - API调用示例
   - 复现步骤

## 🎯 快速开始

### 对于Agent开发者

1. **首先阅读需求文档**，了解功能目标和业务规则
2. **然后阅读设计文档**，理解架构和组件结构
3. **最后阅读技术实现方案**，获取具体的实现细节和数据映射

### 关键信息速查

#### 知识网络配置
- **Knowledge Network ID**: `d56v1l69olk4bpa66uv0`
- **名称**: HD供应链业务知识网络

#### 对象类型ID
```typescript
const OBJECT_TYPE_IDS = {
  PRODUCT: 'd56v4ue9olk4bpa66v00',           // 产品
  INVENTORY: 'd56vcuu9olk4bpa66v3g',         // 库存
  SALES_ORDER: 'd56vh169olk4bpa66v80',       // 销售订单
  MATERIAL: 'd56voju9olk4bpa66vcg',          // 物料
  PRODUCT_BOM: 'd56vqtm9olk4bpa66vfg',       // 产品BOM
};
```

#### 核心文件路径
- 主页面: `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`
- 数据服务: `src/services/productSupplyOptimizationService.ts`
- 订单计算器: `src/services/ProductOrderCalculator.ts`
- 类型定义: `src/types/ontology.ts`
- API配置: `src/config/apiConfig.ts`

## 📊 数据流概览

```
API (供应链知识网络)
    ↓
ontologyApi.queryObjectInstances()
    ↓
productSupplyOptimizationService
    ├── loadProducts() → Product[]
    ├── loadBOM() → BOMEvent[]
    ├── loadInventory() → InventoryEvent[]
    └── loadSalesOrders() → SalesOrderEvent[]
    ↓
generateProductSupplyAnalysis()
    ↓
ProductSupplyAnalysis[]
    ↓
ProductSupplyOptimizationPage (状态管理)
    ↓
ProductSupplyAnalysisPanel (展示)
    ↓
子组件 (指标卡片、预测面板等)
```

## 🔑 关键业务逻辑

### 订单交付计算
- **总签约数量** = sum(signing_quantity)
- **已交付数量** = sum(shipping_quantity)
- **待交付数量** = 总签约数量 - 已交付数量
- **完成率** = (已交付数量 / 总签约数量) * 100%

### 缺货风险等级
- **严重（critical）**: 库存覆盖月数 < 1个月
- **高（high）**: 库存覆盖月数 >= 1个月且 < 2个月
- **中（medium）**: 库存覆盖月数 >= 2个月且 < 3个月
- **低（low）**: 库存覆盖月数 >= 3个月

### 需求趋势判断
- **上升（increasing）**: 最近6个月订单总量 > 前6个月订单总量
- **下降（decreasing）**: 最近6个月订单总量 <= 前6个月订单总量

## 📋 数据字段映射速查表

### 产品对象字段
| API字段 | 应用字段 | 说明 |
|---------|----------|------|
| `product_code` | `productId` | 产品编码 |
| `product_name` | `productName` | 产品名称 |
| `status` | `status` | 产品状态 |
| `main_unit` | `stockUnit` | 主单位 |

### 销售订单字段
| API字段 | 应用字段 | 说明 |
|---------|----------|------|
| `signing_quantity` | `quantity` | 签约数量 |
| `shipping_quantity` | - | 发货数量（用于计算已交付） |
| `product_code` | `product_id` | 产品编码 |

### 库存字段
| API字段 | 应用字段 | 说明 |
|---------|----------|------|
| `inventory_data` 或 `available_quantity` | `quantity` | 库存数量 |
| `product_code` 或 `material_code` | `item_id` | 项目编码 |

## 🛠️ 技术栈

- **前端框架**: React 18+ + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **API通信**: 自定义httpClient + ontologyApi

## 📝 复现检查清单

### 环境准备
- [ ] Node.js 18+ 已安装
- [ ] 依赖已安装 (`npm install`)
- [ ] 环境变量已配置 (.env文件)
- [ ] 代理服务器配置正确

### 功能实现
- [ ] 产品数据加载功能
- [ ] 产品选择下拉框
- [ ] 指标卡片显示（订单、供应商、交货周期、稳定性、库存、缺货风险）
- [ ] 订单交付分析计算
- [ ] 需求预测功能（多算法支持）
- [ ] AI建议展示

### 数据验证
- [ ] API字段映射正确
- [ ] 数据转换逻辑正确
- [ ] 计算逻辑正确（缺货风险、需求趋势、供应风险等）
- [ ] 错误处理完善

### UI/UX验证
- [ ] 页面布局符合设计
- [ ] 响应式设计正常
- [ ] 交互流畅
- [ ] 错误提示清晰

## 🔍 调试指南

### 常见问题

1. **数据加载失败**
   - 检查API Token
   - 检查网络连接
   - 检查代理服务器
   - 查看浏览器控制台

2. **字段映射错误**
   - 检查API响应字段名
   - 检查数据转换逻辑
   - 添加日志输出

3. **计算逻辑错误**
   - 检查计算公式
   - 验证输入数据格式
   - 添加单元测试

### 调试工具

- 浏览器开发者工具（Network、Console）
- React DevTools
- 代理服务器日志

## 📖 相关文档

- [HD供应链业务知识网络.json](./HD供应链业务知识网络.json) - 知识网络完整定义
- [API概览文档](./api/api-overview.md) - API使用说明
- [本体API文档](./api/ontology-api.md) - 本体查询API详细说明

## 🎓 学习路径

### 新手路径
1. 阅读需求文档，理解业务目标
2. 查看技术实现方案中的数据字段映射
3. 参考代码示例实现基本功能
4. 逐步完善UI和交互

### 进阶路径
1. 深入理解架构设计
2. 优化数据加载和计算性能
3. 实现错误处理和边界情况
4. 添加单元测试和集成测试

## 📞 支持

如有问题，请参考：
1. 各文档中的"常见问题"章节
2. 代码注释和类型定义
3. 浏览器控制台错误信息

---

**文档版本**: 1.0  
**最后更新**: 2024-01-XX  
**维护者**: SupplyChainBrain Team
