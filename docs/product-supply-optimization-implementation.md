# 产品供应优化页面 - 技术实现方案文档

## 1. 技术栈

### 1.1 前端框架
- **React 18+**: UI框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具

### 1.2 UI库
- **Tailwind CSS**: 样式框架
- **Lucide React**: 图标库

### 1.3 API通信
- **自定义httpClient**: 基于fetch的HTTP客户端
- **ontologyApi**: 本体API封装

## 2. 项目结构

### 2.1 文件组织

```
src/
├── components/
│   └── product-supply-optimization/
│       ├── ProductSupplyOptimizationPage.tsx      # 主页面
│       ├── ProductSupplyAnalysisPanel.tsx         # 分析面板
│       ├── ProductSelectionSection.tsx             # 产品选择
│       ├── ProductBasicInfoSection.tsx             # 基本信息
│       ├── ProductSupplyMetricsCards.tsx           # 指标卡片
│       ├── ProductOrderCountCard.tsx               # 订单卡片
│       ├── ProductInventoryCard.tsx                # 库存卡片
│       ├── ProductDemandForecastPanelNew.tsx       # 需求预测面板
│       ├── ProductSuggestedActionsSection.tsx      # 建议动作
│       ├── OrderAnalysisModal.tsx                  # 订单分析模态框
│       ├── ForecastComparisonChart.tsx              # 预测对比图表
│       └── ... (其他子组件)
├── services/
│   ├── productSupplyOptimizationService.ts         # 主要数据服务
│   ├── ProductOrderCalculator.ts                   # 订单计算器
│   ├── demandForecastService.ts                    # 需求预测服务
│   └── ... (其他服务)
├── api/
│   ├── ontologyApi.ts                              # 本体API
│   └── httpClient.ts                               # HTTP客户端
├── types/
│   └── ontology.ts                                 # 类型定义
└── config/
    └── apiConfig.ts                                # API配置
```

## 3. API配置

### 3.1 知识网络配置

```typescript
// Knowledge Network ID
const KNOWLEDGE_NETWORK_ID = 'd56v1l69olk4bpa66uv0';

// Object Type IDs
const OBJECT_TYPE_IDS = {
  PRODUCT: 'd56v4ue9olk4bpa66v00',           // 产品
  INVENTORY: 'd56vcuu9olk4bpa66v3g',         // 库存
  SALES_ORDER: 'd56vh169olk4bpa66v80',       // 销售订单
  MATERIAL: 'd56voju9olk4bpa66vcg',          // 物料
  PRODUCT_BOM: 'd56vqtm9olk4bpa66vfg',       // 产品BOM
  SUPPLIER: 'd5700je9olk4bpa66vkg',          // 供应商
  PRODUCTION_PLAN: 'd5704qm9olk4bpa66vp0',    // 工厂生产计划
};
```

### 3.2 API端点

```typescript
// 基础URL
const ONTOLOGY_API_BASE_URL = 'https://api.example.com/api/ontology-query/v1';

// 查询对象实例
POST /api/ontology-query/v1/knowledge-networks/{networkId}/object-types/{objectTypeId}/query
```

## 4. 数据字段映射

### 4.1 产品对象 (Product) - `d56v4ue9olk4bpa66v00`

**API字段 → 应用字段映射**:

| API字段名 | 应用字段名 | 类型 | 说明 | 示例值 |
|----------|----------|------|------|--------|
| `product_code` | `productId` | string | 产品编码（主键） | `"T01-000055"` |
| `product_name` | `productName` | string | 产品名称 | `"北斗车载智能终端系统"` |
| `product_model` | - | string | 产品型号 | `"BD-2024"` |
| `product_series` | - | string | 产品系列 | `"TA系列"` |
| `product_type` | - | string | 产品类型 | `"主产品"` |
| `amount` | - | number | 成本金额 | `1000.00` |
| `status` | `status` | string | 产品状态 | `"销售中"` |
| `main_unit` | `stockUnit` | string | 主单位 | `"个"` |

**数据加载代码**:
```typescript
const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.PRODUCT, {
  limit: 1000,
  need_total: true,
});

const products: Product[] = response.entries.map((item: any) => ({
  productId: item.product_code || item.id || '',
  productName: item.product_name || '',
  materialCodes: [], // 从BOM加载时填充
  status: item.status || '销售中',
  stockQuantity: 0, // 从库存加载时填充
  stockUnit: item.main_unit || '个',
})).filter((p: Product) => p.productId && p.productName);
```

### 4.2 库存对象 (Inventory) - `d56vcuu9olk4bpa66v3g`

**API字段 → 应用字段映射**:

| API字段名 | 应用字段名 | 类型 | 说明 | 示例值 |
|----------|----------|------|------|--------|
| `id` | `inventory_id` | string | 库存ID | `"inv-001"` |
| `snapshot_month` | `snapshot_month` | string | 快照月份 | `"2024-01"` |
| `item_type` | `item_type` | string | 项目类型 | `"Product"` 或 `"Material"` |
| `material_code` 或 `product_code` | `item_id` / `item_code` | string | 物料/产品编码 | `"T01-000055"` |
| `material_name` 或 `product_name` | `item_name` | string | 物料/产品名称 | `"北斗车载智能终端系统"` |
| `inventory_data` 或 `available_quantity` | `quantity` | string | 库存数量 | `"100"` |
| `unit_price` | `unit_price` | string | 单价 | `"10.50"` |
| `warehouse_id` | `warehouse_id` | string | 仓库ID | `"WH-001"` |
| `warehouse_name` | `warehouse_name` | string | 仓库名称 | `"主仓库"` |
| `status` | `status` | string | 状态 | `"Active"` |

**数据加载代码**:
```typescript
const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.INVENTORY, {
  limit: 1000,
  need_total: true,
});

const inventoryEvents: InventoryEvent[] = response.entries.map((item: any) => ({
  inventory_id: item.id || '',
  snapshot_month: item.snapshot_month || new Date().toISOString().substring(0, 7),
  item_type: item.item_type || 'Material',
  item_id: item.material_code || item.product_code || '',
  item_code: item.material_code || item.product_code || '',
  item_name: item.material_name || item.product_name || '',
  quantity: String(item.inventory_data || item.available_quantity || 0),
  // ... 其他字段
}));
```

### 4.3 销售订单对象 (Sales Order) - `d56vh169olk4bpa66v80`

**API字段 → 应用字段映射**:

| API字段名 | 应用字段名 | 类型 | 说明 | 示例值 |
|----------|----------|------|------|--------|
| `id` | `sales_order_id` | string | 订单ID | `"SO-001"` |
| `contract_number` 或 `id` | `sales_order_number` | string | 订单编号 | `"CONTRACT-2024-001"` |
| `signing_date` | `document_date` | string | 签约日期 | `"2024-01-15"` |
| `customer_id` | `customer_id` | string | 客户ID | `"CUST-001"` |
| `customer_name` | `customer_name` | string | 客户名称 | `"XX公司"` |
| `product_code` | `product_id` / `product_code` | string | 产品编码 | `"T01-000055"` |
| `product_name` | `product_name` | string | 产品名称 | `"北斗车载智能终端系统"` |
| `signing_quantity` | `quantity` | string | 签约数量 | `"100"` |
| `shipping_quantity` | - | number | 发货数量 | `80` |
| `unit` | `unit` | string | 单位 | `"个"` |
| `standard_price` | `standard_price` | string | 标准价格 | `"1000.00"` |
| `promised_delivery_date` | `planned_delivery_date` | string | 承诺交期 | `"2024-02-15"` |
| `status` | `status` | string | 状态 | `"Active"` |

**数据加载代码**:
```typescript
const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.SALES_ORDER, {
  limit: 1000,
  need_total: true,
});

const salesOrders: SalesOrderEvent[] = response.entries.map((item: any) => ({
  sales_order_id: item.id || '',
  sales_order_number: item.contract_number || item.id || '',
  document_date: item.signing_date || '',
  product_id: item.product_code || '',
  product_code: item.product_code || '',
  product_name: item.product_name || '',
  quantity: String(item.signing_quantity || 0),
  // ... 其他字段
}));
```

**订单计算逻辑**:
```typescript
// 总签约数量
const totalQuantity = productOrders.reduce((sum, order) => {
  return sum + (parseInt(order.quantity) || 0);
}, 0);

// 已交付数量（总发货数量）
const deliveredQuantity = productOrders.reduce((sum, order) => {
  return sum + (parseInt(order.shipping_quantity) || 0);
}, 0);

// 待交付数量
const pendingQuantity = Math.max(0, totalQuantity - deliveredQuantity);

// 完成率
const completionRate = totalQuantity > 0 
  ? (deliveredQuantity / totalQuantity) * 100 
  : 0;
```

### 4.4 产品BOM对象 (Product BOM) - `d56vqtm9olk4bpa66vfg`

**API字段 → 应用字段映射**:

| API字段名 | 应用字段名 | 类型 | 说明 | 示例值 |
|----------|----------|------|------|--------|
| `bom_number` 或 `id` | `bom_id` | string | BOM编号 | `"BOM-001"` |
| `bom_version` | `bom_version` | string | BOM版本 | `"1.0"` |
| `product_code` | `parent_id` / `parent_code` | string | 父件（产品）编码 | `"T01-000055"` |
| `material_code` | `child_id` / `child_code` | string | 子件（物料）编码 | `"MAT-001"` |
| `material_name` | `child_name` | string | 子件名称 | `"芯片"` |
| `quantity` 或 `usage_quantity` | `quantity` | string | 用量 | `"2"` |
| `unit` | `unit` | string | 单位 | `"个"` |
| `status` | `status` | string | 状态 | `"Active"` |

**数据加载代码**:
```typescript
const response = await ontologyApi.queryObjectInstances(OBJECT_TYPE_IDS.BOM, {
  limit: 1000,
  need_total: true,
});

const bomEvents: BOMEvent[] = response.entries.map((item: any) => ({
  bom_id: item.bom_number || item.id || '',
  parent_id: item.product_code || '',
  parent_code: item.product_code || '',
  child_id: item.material_code || '',
  child_code: item.material_code || '',
  child_name: item.material_name || '',
  quantity: String(item.quantity || item.usage_quantity || 0),
  // ... 其他字段
}));
```

## 5. 核心算法实现

### 5.1 缺货风险等级计算

```typescript
// 计算库存覆盖月数
const totalPendingOrders = productOrders.reduce((sum, order) => {
  const qty = parseInt(order.quantity) || 0;
  return sum + qty;
}, 0);

const monthsOfCoverage = totalPendingOrders > 0
  ? currentInventoryLevel / (totalPendingOrders / 30)
  : currentInventoryLevel > 0 ? 999 : 0;

// 判断风险等级
const stockoutRiskLevel: 'low' | 'medium' | 'high' | 'critical' =
  monthsOfCoverage < 1 ? 'critical' :
  monthsOfCoverage < 2 ? 'high' :
  monthsOfCoverage < 3 ? 'medium' : 'low';
```

### 5.2 需求趋势计算

```typescript
// 获取最近6个月和前6个月的订单
const recentOrders = productOrders
  .filter(o => o.document_date)
  .sort((a, b) => b.document_date.localeCompare(a.document_date))
  .slice(0, 6);

const olderOrders = productOrders
  .filter(o => o.document_date)
  .sort((a, b) => b.document_date.localeCompare(a.document_date))
  .slice(6, 12);

// 计算总量
const recentTotal = recentOrders.reduce((sum, o) => 
  sum + (parseInt(o.quantity) || 0), 0);
const olderTotal = olderOrders.reduce((sum, o) => 
  sum + (parseInt(o.quantity) || 0), 0);

// 判断趋势
const demandTrend: 'increasing' | 'decreasing' =
  recentTotal > olderTotal ? 'increasing' : 'decreasing';
```

### 5.3 平均交货周期计算

```typescript
let totalCycleDays = 0;
let cycleCount = 0;

productOrders.forEach(order => {
  if (order.planned_delivery_date && order.document_date) {
    const orderDate = new Date(order.document_date);
    const dueDate = new Date(order.planned_delivery_date);
    if (!isNaN(orderDate.getTime()) && !isNaN(dueDate.getTime())) {
      const cycleDays = Math.ceil(
        (dueDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (cycleDays > 0) {
        totalCycleDays += cycleDays;
        cycleCount++;
      }
    }
  }
});

const averageDeliveryCycle = cycleCount > 0 
  ? Math.round(totalCycleDays / cycleCount) 
  : 30;
```

### 5.4 供货稳定性评分计算

```typescript
// 基于平均交货周期计算稳定性评分
// 理想交货周期为10天，每增加1天扣2分
const supplyStabilityScore = Math.max(0, Math.min(100, 
  100 - (averageDeliveryCycle - 10) * 2
));
```

## 6. 组件实现示例

### 6.1 ProductSupplyOptimizationPage 实现

```typescript
export const ProductSupplyOptimizationPage: React.FC<{ 
  toggleCopilot?: () => void 
}> = ({ toggleCopilot }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<ProductSupplyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 初始化加载
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const apiResult = await getAllProductsSupplyAnalysisFromAPI();
        setAnalyses(apiResult.analyses);
        
        // 自动选择第一个产品
        if (apiResult.analyses.length > 0) {
          setSelectedProductId(apiResult.analyses[0].productId);
        }
      } catch (error) {
        console.error('[产品供应优化] 加载失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // 切换产品时加载详细信息
  useEffect(() => {
    if (!selectedProductId) return;
    
    const loadProductDetails = async () => {
      const result = await loadAllProductSupplyData();
      const product = result.products.find(p => p.productId === selectedProductId);
      setSelectedProduct(product || null);
    };
    loadProductDetails();
  }, [selectedProductId]);

  const selectedAnalysis = analyses.find(a => a.productId === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            产品供应优化
          </h1>
          <p className="text-slate-500 mt-1">
            NPI 选型、EOL 决策与供应链风险评估
          </p>
        </div>
      </div>

      {/* Main Content */}
      <ProductSupplyAnalysisPanel
        analysis={selectedAnalysis || null}
        loading={loading}
        allProducts={analyses}
        selectedProductId={selectedProductId}
        onProductSelect={setSelectedProductId}
        product={selectedProduct}
      />
    </div>
  );
};
```

### 6.2 ProductOrderCountCard 实现

```typescript
export const ProductOrderCountCard: React.FC<{ productId: string }> = ({ 
  productId 
}) => {
  const [orderAnalysis, setOrderAnalysis] = useState<OrderAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      setLoading(true);
      try {
        await productOrderCalculator.init();
        const analysis = productOrderCalculator.calculateOrderAnalysis(productId);
        setOrderAnalysis(analysis);
      } catch (error) {
        console.error('[ProductOrderCountCard] 加载失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrderData();
  }, [productId]);

  if (loading || !orderAnalysis) {
    return <div>加载中...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-3 border border-indigo-100">
      <div className="text-xs text-slate-600 mb-2">订单数量</div>
      <div className="text-2xl font-bold text-slate-800">
        {orderAnalysis.totalOrders}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        总签约: {orderAnalysis.totalQuantity} | 
        已交付: {orderAnalysis.deliveredQuantity} | 
        待交付: {orderAnalysis.pendingQuantity}
      </div>
    </div>
  );
};
```

## 7. API调用示例

### 7.1 查询产品对象实例

```typescript
const response = await ontologyApi.queryObjectInstances(
  'd56v4ue9olk4bpa66v00', // Object Type ID: Product
  {
    limit: 1000,
    need_total: true,
  }
);

// 响应格式
{
  entries: [
    {
      id: "obj-001",
      product_code: "T01-000055",
      product_name: "北斗车载智能终端系统",
      product_model: "BD-2024",
      status: "销售中",
      main_unit: "个",
      amount: 1000.00,
      // ... 其他字段
    },
    // ... 更多产品
  ],
  total: 150,
  page: 1,
  page_size: 1000
}
```

### 7.2 查询销售订单对象实例

```typescript
const response = await ontologyApi.queryObjectInstances(
  'd56vh169olk4bpa66v80', // Object Type ID: Sales Order
  {
    limit: 1000,
    need_total: true,
  }
);

// 响应格式
{
  entries: [
    {
      id: "so-001",
      contract_number: "CONTRACT-2024-001",
      signing_date: "2024-01-15",
      product_code: "T01-000055",
      product_name: "北斗车载智能终端系统",
      signing_quantity: 100,
      shipping_quantity: 80,
      unit: "个",
      promised_delivery_date: "2024-02-15",
      status: "Active",
      // ... 其他字段
    },
    // ... 更多订单
  ],
  total: 200,
  page: 1,
  page_size: 1000
}
```

## 8. 错误处理

### 8.1 API错误处理

```typescript
try {
  const response = await ontologyApi.queryObjectInstances(objectTypeId, options);
  // 处理响应
} catch (error) {
  console.error('[API Error]', error);
  // 显示错误提示，但不fallback到模拟数据
  setDataSourceError(error instanceof Error ? error.message : String(error));
}
```

### 8.2 数据验证

```typescript
// 过滤无效数据
const validProducts = products.filter((p: Product) => 
  p.productId && p.productName
);

// 数值计算时处理null/undefined
const quantity = parseInt(order.quantity) || 0;
const total = orders.reduce((sum, order) => 
  sum + (parseInt(order.quantity) || 0), 0
);
```

## 9. 测试数据示例

### 9.1 产品数据示例

```json
{
  "id": "obj-001",
  "product_code": "T01-000055",
  "product_name": "北斗车载智能终端系统",
  "product_model": "BD-2024",
  "product_series": "TA系列",
  "product_type": "主产品",
  "status": "销售中",
  "main_unit": "个",
  "amount": 1000.00
}
```

### 9.2 销售订单数据示例

```json
{
  "id": "so-001",
  "contract_number": "CONTRACT-2024-001",
  "signing_date": "2024-01-15",
  "customer_id": "CUST-001",
  "customer_name": "XX公司",
  "product_code": "T01-000055",
  "product_name": "北斗车载智能终端系统",
  "signing_quantity": 100,
  "shipping_quantity": 80,
  "unit": "个",
  "standard_price": 1000.00,
  "promised_delivery_date": "2024-02-15",
  "status": "Active"
}
```

### 9.3 库存数据示例

```json
{
  "id": "inv-001",
  "snapshot_month": "2024-01",
  "item_type": "Product",
  "product_code": "T01-000055",
  "product_name": "北斗车载智能终端系统",
  "inventory_data": 150,
  "available_quantity": 150,
  "safety_stock": 50,
  "warehouse_id": "WH-001",
  "warehouse_name": "主仓库",
  "status": "Active"
}
```

## 10. 部署配置

### 10.1 环境变量

```bash
# .env
VITE_API_TOKEN=your_api_token_here
VITE_ONTOLOGY_API_BASE_URL=https://api.example.com/api/ontology-query/v1
VITE_KNOWLEDGE_NETWORK_ID=d56v1l69olk4bpa66uv0
```

### 10.2 代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:30777',
        changeOrigin: true,
      },
    },
  },
});
```

## 11. 复现步骤

### 11.1 环境准备

1. 安装Node.js 18+
2. 安装依赖: `npm install`
3. 配置环境变量（.env文件）

### 11.2 启动服务

1. 启动代理服务器: `node proxy-server.js`
2. 启动开发服务器: `npm run dev`

### 11.3 验证功能

1. 访问产品供应优化页面
2. 验证数据加载（检查浏览器控制台）
3. 验证产品选择功能
4. 验证指标卡片显示
5. 验证需求预测功能
6. 验证订单交付分析

## 12. 常见问题

### 12.1 数据加载失败

**问题**: API返回错误或超时

**解决方案**:
- 检查API Token是否正确
- 检查网络连接
- 检查代理服务器是否运行
- 查看浏览器控制台错误信息

### 12.2 字段映射错误

**问题**: 数据显示不正确或为空

**解决方案**:
- 检查API响应字段名是否与映射表一致
- 检查数据转换逻辑
- 添加日志输出查看原始数据

### 12.3 计算逻辑错误

**问题**: 指标计算结果不正确

**解决方案**:
- 检查计算公式
- 验证输入数据格式
- 添加单元测试

---

## 13. Python预测算子服务实现 (2026-01-17 新增)

本章节提供完整的Python预测算子服务实现代码和部署说明。

### 13.1 项目结构

```
forecast-operator-service/
├── main.py                    # FastAPI应用入口
├── requirements.txt           # Python依赖
├── Dockerfile                 # Docker镜像构建
├── docker-compose.yml         # Docker Compose配置
├── .env.example               # 环境变量示例
├── forecast_operators/        # 算子实现
│   ├── __init__.py
│   ├── base.py                # 算子基类
│   ├── prophet_op.py          # Prophet算子
│   ├── exp_smoothing.py       # 指数平滑算子
│   ├── arima_op.py            # ARIMA算子
│   ├── ensemble_op.py         # 集成预测算子
│   └── utils.py               # 工具函数
├── tests/                     # 单元测试
│   ├── __init__.py
│   ├── test_operators.py
│   └── test_api.py
└── scripts/
    ├── start.sh               # 启动脚本
    └── health_check.sh        # 健康检查脚本
```

### 13.2 核心实现代码

#### 13.2.1 算子基类 (forecast_operators/base.py)

```python
"""
预测算子基类定义
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ForecastInput(BaseModel):
    """预测输入数据模型"""
    product_id: str = Field(..., description="产品ID")
    historical_data: List[Dict[str, Any]] = Field(
        ...,
        description="历史数据 [{'month': 'YYYY-MM', 'quantity': float}, ...]"
    )
    forecast_periods: int = Field(default=12, description="预测期数")
    parameters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="算法参数"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "T01-000055",
                "historical_data": [
                    {"month": "2025-01", "quantity": 100},
                    {"month": "2025-02", "quantity": 120},
                    {"month": "2025-03", "quantity": 110}
                ],
                "forecast_periods": 12,
                "parameters": {"alpha": 0.2}
            }
        }


class ConfidenceInterval(BaseModel):
    """置信区间"""
    lower: float
    upper: float


class ForecastMetrics(BaseModel):
    """预测质量指标"""
    mape: Optional[float] = Field(default=None, description="平均绝对百分比误差")
    rmse: Optional[float] = Field(default=None, description="均方根误差")
    mae: Optional[float] = Field(default=None, description="平均绝对误差")


class ForecastOutput(BaseModel):
    """预测输出数据模型"""
    product_id: str
    algorithm: str
    forecast_values: List[float]
    confidence_intervals: Optional[List[ConfidenceInterval]] = None
    metrics: Optional[ForecastMetrics] = None
    generated_at: str


class BaseForecastOperator(ABC):
    """预测算子基类"""

    @property
    @abstractmethod
    def algorithm_name(self) -> str:
        """算法名称"""
        pass

    @property
    @abstractmethod
    def algorithm_display_name(self) -> str:
        """算法显示名称（中文）"""
        pass

    @abstractmethod
    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        """执行预测"""
        pass

    def validate_input(self, input_data: ForecastInput) -> bool:
        """验证输入数据"""
        if not input_data.historical_data:
            return False
        if input_data.forecast_periods <= 0:
            return False
        return True

    def _get_sorted_values(self, input_data: ForecastInput) -> List[float]:
        """获取按时间排序的历史数据值"""
        sorted_data = sorted(
            input_data.historical_data,
            key=lambda x: x.get('month', '')
        )
        return [
            float(item.get('quantity', 0))
            for item in sorted_data
        ]

    def _create_output(
        self,
        product_id: str,
        forecast_values: List[float],
        confidence_intervals: Optional[List[ConfidenceInterval]] = None,
        metrics: Optional[ForecastMetrics] = None
    ) -> ForecastOutput:
        """创建标准输出"""
        return ForecastOutput(
            product_id=product_id,
            algorithm=self.algorithm_name,
            forecast_values=forecast_values,
            confidence_intervals=confidence_intervals,
            metrics=metrics,
            generated_at=datetime.now().isoformat()
        )
```

#### 13.2.2 指数平滑算子 (forecast_operators/exp_smoothing.py)

```python
"""
指数平滑算子实现
包括: 简单指数平滑、Holt线性、Holt-Winters
"""
from typing import List, Optional
from .base import BaseForecastOperator, ForecastInput, ForecastOutput


class SimpleExponentialSmoothingOperator(BaseForecastOperator):
    """简单指数平滑算子"""

    @property
    def algorithm_name(self) -> str:
        return "simple_exponential"

    @property
    def algorithm_display_name(self) -> str:
        return "简单指数平滑预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}
        alpha = params.get('alpha', 0.2)

        values = self._get_sorted_values(input_data)

        if not values:
            return self._create_output(
                input_data.product_id,
                [0.0] * input_data.forecast_periods
            )

        # 初始化预测值（前3个值的平均）
        init_count = min(3, len(values))
        last_forecast = sum(values[:init_count]) / init_count

        # 应用指数平滑
        for value in values:
            last_forecast = alpha * value + (1 - alpha) * last_forecast

        # 简单指数平滑的未来预测值保持恒定
        forecast_values = [round(last_forecast, 2)] * input_data.forecast_periods

        return self._create_output(input_data.product_id, forecast_values)


class HoltLinearSmoothingOperator(BaseForecastOperator):
    """Holt线性指数平滑算子"""

    @property
    def algorithm_name(self) -> str:
        return "holt_linear"

    @property
    def algorithm_display_name(self) -> str:
        return "Holt线性指数平滑预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}
        alpha = params.get('alpha', 0.3)
        beta = params.get('beta', 0.1)

        values = self._get_sorted_values(input_data)

        if len(values) < 2:
            initial_value = values[0] if values else 0.0
            return self._create_output(
                input_data.product_id,
                [initial_value] * input_data.forecast_periods
            )

        # 初始化水平和趋势
        level = values[0]
        trend = values[1] - values[0]

        # 应用Holt方法
        for i in range(1, len(values)):
            prev_level = level
            level = alpha * values[i] + (1 - alpha) * (level + trend)
            trend = beta * (level - prev_level) + (1 - beta) * trend

        # 生成预测
        forecast_values = [
            round(level + trend * (i + 1), 2)
            for i in range(input_data.forecast_periods)
        ]

        return self._create_output(input_data.product_id, forecast_values)


class HoltWintersSmoothingOperator(BaseForecastOperator):
    """Holt-Winters三重指数平滑算子"""

    @property
    def algorithm_name(self) -> str:
        return "holt_winters"

    @property
    def algorithm_display_name(self) -> str:
        return "Holt-Winters三重指数平滑预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}
        alpha = params.get('alpha', 0.3)
        beta = params.get('beta', 0.1)
        gamma = params.get('gamma', 0.2)
        season_length = params.get('season_length', 12)

        values = self._get_sorted_values(input_data)

        # 需要至少2个完整季节的数据
        if len(values) < season_length * 2:
            # 回退到Holt线性方法
            holt_op = HoltLinearSmoothingOperator()
            return holt_op.forecast(input_data)

        # 初始化季节因子
        seasonal: List[float] = []
        for i in range(season_length):
            season_values = [
                values[j]
                for j in range(i, len(values), season_length)
            ]
            seasonal.append(
                sum(season_values) / len(season_values) if season_values else 1.0
            )

        # 归一化季节因子
        avg_seasonal = sum(seasonal) / season_length
        if avg_seasonal > 0:
            seasonal = [s / avg_seasonal for s in seasonal]

        # 初始化水平和趋势
        level = values[0] / seasonal[0] if seasonal[0] != 0 else values[0]
        trend = 0.0
        if len(values) >= season_length:
            seasonal_idx = season_length % season_length
            if seasonal[seasonal_idx] != 0:
                trend = (
                    values[season_length] / seasonal[seasonal_idx] - level
                ) / season_length

        # 应用Holt-Winters方法
        for i in range(1, len(values)):
            prev_level = level
            seasonal_idx = i % season_length

            if seasonal[seasonal_idx] != 0:
                level = alpha * (values[i] / seasonal[seasonal_idx]) + \
                        (1 - alpha) * (level + trend)
            else:
                level = alpha * values[i] + (1 - alpha) * (level + trend)

            trend = beta * (level - prev_level) + (1 - beta) * trend

            if level != 0:
                seasonal[seasonal_idx] = gamma * (values[i] / level) + \
                                          (1 - gamma) * seasonal[seasonal_idx]

        # 生成预测
        forecast_values: List[float] = []
        for i in range(input_data.forecast_periods):
            seasonal_idx = (len(values) + i) % season_length
            predicted = (level + trend * (i + 1)) * seasonal[seasonal_idx]
            forecast_values.append(round(max(0, predicted), 2))

        return self._create_output(input_data.product_id, forecast_values)
```

#### 13.2.3 Prophet算子 (forecast_operators/prophet_op.py)

```python
"""
Prophet预测算子实现
"""
from typing import List
from datetime import datetime
import pandas as pd
from prophet import Prophet

from .base import (
    BaseForecastOperator,
    ForecastInput,
    ForecastOutput,
    ConfidenceInterval
)


class ProphetOperator(BaseForecastOperator):
    """Prophet预测算子"""

    @property
    def algorithm_name(self) -> str:
        return "prophet"

    @property
    def algorithm_display_name(self) -> str:
        return "Prophet预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}

        # 准备数据
        df = pd.DataFrame(input_data.historical_data)
        df['ds'] = pd.to_datetime(df['month'] + '-01')
        df['y'] = df['quantity'].astype(float)

        if len(df) < 2:
            # 数据不足，返回简单预测
            avg_value = df['y'].mean() if len(df) > 0 else 0.0
            return self._create_output(
                input_data.product_id,
                [round(avg_value, 2)] * input_data.forecast_periods
            )

        # 配置模型
        model = Prophet(
            seasonality_mode=params.get('seasonality_mode', 'additive'),
            yearly_seasonality=params.get('yearly_seasonality', True),
            weekly_seasonality=params.get('weekly_seasonality', False),
            daily_seasonality=False,
            # 抑制日志输出
            interval_width=0.95
        )

        # 训练模型
        model.fit(df[['ds', 'y']])

        # 生成未来日期
        future = model.make_future_dataframe(
            periods=input_data.forecast_periods,
            freq='MS'  # 月初
        )

        # 预测
        forecast = model.predict(future)

        # 提取预测值（只取未来部分）
        future_forecast = forecast.tail(input_data.forecast_periods)
        forecast_values = [
            round(max(0, v), 2)
            for v in future_forecast['yhat'].tolist()
        ]

        # 提取置信区间
        confidence_intervals = [
            ConfidenceInterval(
                lower=round(max(0, row['yhat_lower']), 2),
                upper=round(max(0, row['yhat_upper']), 2)
            )
            for _, row in future_forecast.iterrows()
        ]

        return self._create_output(
            input_data.product_id,
            forecast_values,
            confidence_intervals=confidence_intervals
        )
```

#### 13.2.4 ARIMA算子 (forecast_operators/arima_op.py)

```python
"""
ARIMA时间序列算子实现
"""
from typing import List, Optional
import pandas as pd
import pmdarima as pm

from .base import (
    BaseForecastOperator,
    ForecastInput,
    ForecastOutput,
    ConfidenceInterval
)


class ARIMAOperator(BaseForecastOperator):
    """ARIMA时间序列算子"""

    @property
    def algorithm_name(self) -> str:
        return "arima"

    @property
    def algorithm_display_name(self) -> str:
        return "ARIMA时间序列预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}
        auto = params.get('auto', True)

        values = self._get_sorted_values(input_data)

        if len(values) < 3:
            avg_value = sum(values) / len(values) if values else 0.0
            return self._create_output(
                input_data.product_id,
                [round(avg_value, 2)] * input_data.forecast_periods
            )

        series = pd.Series(values)

        try:
            if auto:
                # 自动选择最佳ARIMA参数
                model = pm.auto_arima(
                    series,
                    start_p=0, start_q=0,
                    max_p=5, max_q=5,
                    m=12,  # 季节周期
                    seasonal=True,
                    d=None,  # 自动选择d
                    trace=False,
                    error_action='ignore',
                    suppress_warnings=True,
                    stepwise=True
                )
            else:
                from statsmodels.tsa.arima.model import ARIMA
                p = params.get('p', 1)
                d = params.get('d', 1)
                q = params.get('q', 1)
                model = ARIMA(series, order=(p, d, q))
                model = model.fit()

            # 生成预测
            forecast_result = model.predict(
                n_periods=input_data.forecast_periods,
                return_conf_int=True
            )

            if isinstance(forecast_result, tuple):
                forecast_values = [
                    round(max(0, v), 2)
                    for v in forecast_result[0].tolist()
                ]
                # 提取置信区间
                conf_int = forecast_result[1]
                confidence_intervals = [
                    ConfidenceInterval(
                        lower=round(max(0, conf_int[i, 0]), 2),
                        upper=round(max(0, conf_int[i, 1]), 2)
                    )
                    for i in range(len(conf_int))
                ]
            else:
                forecast_values = [
                    round(max(0, v), 2)
                    for v in forecast_result.tolist()
                ]
                confidence_intervals = None

            return self._create_output(
                input_data.product_id,
                forecast_values,
                confidence_intervals=confidence_intervals
            )

        except Exception as e:
            # ARIMA失败时回退到简单方法
            print(f"ARIMA failed: {e}, falling back to simple average")
            avg_value = sum(values[-6:]) / min(6, len(values))
            return self._create_output(
                input_data.product_id,
                [round(avg_value, 2)] * input_data.forecast_periods
            )
```

#### 13.2.5 集成预测算子 (forecast_operators/ensemble_op.py)

```python
"""
集成预测算子实现
综合多种算法的预测结果
"""
from typing import List, Dict
import numpy as np

from .base import BaseForecastOperator, ForecastInput, ForecastOutput
from .prophet_op import ProphetOperator
from .exp_smoothing import (
    SimpleExponentialSmoothingOperator,
    HoltLinearSmoothingOperator,
    HoltWintersSmoothingOperator
)
from .arima_op import ARIMAOperator


class EnsembleForecastOperator(BaseForecastOperator):
    """集成预测算子"""

    def __init__(self):
        self._operators: Dict[str, BaseForecastOperator] = {
            "prophet": ProphetOperator(),
            "simple_exponential": SimpleExponentialSmoothingOperator(),
            "holt_linear": HoltLinearSmoothingOperator(),
            "holt_winters": HoltWintersSmoothingOperator(),
            "arima": ARIMAOperator(),
        }

    @property
    def algorithm_name(self) -> str:
        return "ensemble"

    @property
    def algorithm_display_name(self) -> str:
        return "集成预测需求"

    def forecast(self, input_data: ForecastInput) -> ForecastOutput:
        params = input_data.parameters or {}

        # 默认使用4种主要算法
        algorithms = params.get('algorithms', [
            "prophet", "simple_exponential", "holt_linear", "holt_winters"
        ])

        # 权重（默认等权重）
        weights = params.get('weights')
        if weights is None or len(weights) != len(algorithms):
            weights = [1.0 / len(algorithms)] * len(algorithms)

        # 集成方法
        method = params.get('method', 'weighted_average')

        # 收集各算法预测结果
        all_forecasts: List[List[float]] = []
        valid_weights: List[float] = []

        for i, algo in enumerate(algorithms):
            if algo not in self._operators:
                continue

            try:
                result = self._operators[algo].forecast(input_data)
                all_forecasts.append(result.forecast_values)
                valid_weights.append(weights[i])
            except Exception as e:
                print(f"Algorithm {algo} failed: {e}")
                continue

        if not all_forecasts:
            return self._create_output(
                input_data.product_id,
                [0.0] * input_data.forecast_periods
            )

        # 归一化权重
        weight_sum = sum(valid_weights)
        if weight_sum > 0:
            valid_weights = [w / weight_sum for w in valid_weights]

        # 计算集成预测
        if method == 'median':
            forecast_values = np.median(all_forecasts, axis=0).tolist()
        else:  # weighted_average
            forecast_values = []
            for i in range(input_data.forecast_periods):
                weighted_sum = sum(
                    all_forecasts[j][i] * valid_weights[j]
                    for j in range(len(all_forecasts))
                )
                forecast_values.append(weighted_sum)

        forecast_values = [round(v, 2) for v in forecast_values]

        return self._create_output(input_data.product_id, forecast_values)
```

#### 13.2.6 FastAPI应用入口 (main.py)

```python
"""
供应链预测算子服务 - FastAPI应用入口
"""
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from forecast_operators.base import ForecastInput, ForecastOutput
from forecast_operators.prophet_op import ProphetOperator
from forecast_operators.exp_smoothing import (
    SimpleExponentialSmoothingOperator,
    HoltLinearSmoothingOperator,
    HoltWintersSmoothingOperator
)
from forecast_operators.arima_op import ARIMAOperator
from forecast_operators.ensemble_op import EnsembleForecastOperator

# 创建FastAPI应用
app = FastAPI(
    title="供应链预测算子服务",
    description="提供多种需求预测算法的统一API接口",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化算子
operators = {
    "prophet": ProphetOperator(),
    "simple_exponential": SimpleExponentialSmoothingOperator(),
    "holt_linear": HoltLinearSmoothingOperator(),
    "holt_winters": HoltWintersSmoothingOperator(),
    "arima": ARIMAOperator(),
    "ensemble": EnsembleForecastOperator(),
}


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "service": "forecast-operator-service"}


@app.post("/api/v1/forecast/prophet", response_model=ForecastOutput)
async def forecast_prophet(request: ForecastInput) -> ForecastOutput:
    """Prophet预测接口"""
    operator = operators["prophet"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/simple-exp", response_model=ForecastOutput)
async def forecast_simple_exp(request: ForecastInput) -> ForecastOutput:
    """简单指数平滑预测接口"""
    operator = operators["simple_exponential"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/holt-linear", response_model=ForecastOutput)
async def forecast_holt_linear(request: ForecastInput) -> ForecastOutput:
    """Holt线性指数平滑预测接口"""
    operator = operators["holt_linear"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/holt-winters", response_model=ForecastOutput)
async def forecast_holt_winters(request: ForecastInput) -> ForecastOutput:
    """Holt-Winters三重指数平滑预测接口"""
    operator = operators["holt_winters"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/arima", response_model=ForecastOutput)
async def forecast_arima(request: ForecastInput) -> ForecastOutput:
    """ARIMA时间序列预测接口"""
    operator = operators["arima"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/ensemble", response_model=ForecastOutput)
async def forecast_ensemble(request: ForecastInput) -> ForecastOutput:
    """集成预测接口"""
    operator = operators["ensemble"]
    if not operator.validate_input(request):
        raise HTTPException(status_code=400, detail="无效的输入数据")
    return operator.forecast(request)


@app.post("/api/v1/forecast/batch", response_model=List[ForecastOutput])
async def forecast_batch(
    requests: List[ForecastInput],
    algorithm: str = "ensemble"
) -> List[ForecastOutput]:
    """批量预测接口"""
    if algorithm not in operators:
        raise HTTPException(
            status_code=400,
            detail=f"未知算法: {algorithm}"
        )

    operator = operators[algorithm]
    results: List[ForecastOutput] = []

    for request in requests:
        if operator.validate_input(request):
            try:
                results.append(operator.forecast(request))
            except Exception as e:
                print(f"Batch forecast error for {request.product_id}: {e}")
                continue

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 13.3 部署配置

#### 13.3.1 requirements.txt

```text
# Web框架
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.0

# 数据处理
numpy>=1.26.0
pandas>=2.1.0

# 预测算法
prophet>=1.1.5
pmdarima>=2.0.4
statsmodels>=0.14.0
scikit-learn>=1.4.0

# 工具
python-dotenv>=1.0.0
```

#### 13.3.2 Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY forecast_operators/ ./forecast_operators/
COPY main.py .

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 13.3.3 docker-compose.yml

```yaml
version: '3.8'

services:
  forecast-operator-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: forecast-operator-service
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - LOG_LEVEL=INFO
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  # 可选: Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: forecast-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - forecast-operator-service
    restart: unless-stopped
```

### 13.4 前端集成服务

#### 13.4.1 forecastOperatorService.ts

```typescript
/**
 * 预测算子服务 - 前端集成
 * 调用Python预测算子API或使用本地回退
 */

import { httpClient } from '../api/httpClient';
import { getEnvironmentConfig } from '../config/apiConfig';

// 类型定义
export interface ForecastInput {
  product_id: string;
  historical_data: Array<{ month: string; quantity: number }>;
  forecast_periods: number;
  parameters?: Record<string, any>;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface ForecastOutput {
  product_id: string;
  algorithm: string;
  forecast_values: number[];
  confidence_intervals?: ConfidenceInterval[];
  metrics?: Record<string, number>;
  generated_at: string;
}

export type ForecastAlgorithm =
  | 'prophet'
  | 'simple_exponential'
  | 'holt_linear'
  | 'holt_winters'
  | 'arima'
  | 'ensemble';

// API端点映射
const ALGORITHM_ENDPOINTS: Record<ForecastAlgorithm, string> = {
  prophet: '/api/v1/forecast/prophet',
  simple_exponential: '/api/v1/forecast/simple-exp',
  holt_linear: '/api/v1/forecast/holt-linear',
  holt_winters: '/api/v1/forecast/holt-winters',
  arima: '/api/v1/forecast/arima',
  ensemble: '/api/v1/forecast/ensemble',
};

/**
 * 预测算子服务类
 */
export class ForecastOperatorService {
  private baseUrl: string;
  private timeout: number = 30000; // 30秒超时

  constructor() {
    const envConfig = getEnvironmentConfig();
    this.baseUrl = (envConfig as any).forecastBaseUrl || '/proxy-forecast';
  }

  /**
   * 调用预测API
   */
  async forecast(
    algorithm: ForecastAlgorithm,
    input: ForecastInput
  ): Promise<ForecastOutput> {
    const endpoint = ALGORITHM_ENDPOINTS[algorithm];
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await httpClient.post<ForecastOutput>(url, input, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      console.warn(`[ForecastOperatorService] API调用失败，尝试本地回退:`, error);

      // 尝试本地回退
      if (['simple_exponential', 'holt_linear', 'holt_winters'].includes(algorithm)) {
        return this.forecastLocal(algorithm, input);
      }

      throw error;
    }
  }

  /**
   * 批量预测
   */
  async batchForecast(
    algorithm: ForecastAlgorithm,
    inputs: ForecastInput[]
  ): Promise<ForecastOutput[]> {
    const url = `${this.baseUrl}/api/v1/forecast/batch?algorithm=${algorithm}`;

    try {
      const response = await httpClient.post<ForecastOutput[]>(url, inputs, {
        timeout: this.timeout * 2, // 批量请求超时时间更长
      });
      return response.data;
    } catch (error) {
      console.warn(`[ForecastOperatorService] 批量API调用失败:`, error);

      // 逐个使用本地回退
      const results: ForecastOutput[] = [];
      for (const input of inputs) {
        try {
          const result = await this.forecastLocal(algorithm, input);
          results.push(result);
        } catch (e) {
          console.error(`[ForecastOperatorService] 本地预测失败:`, e);
        }
      }
      return results;
    }
  }

  /**
   * 本地预测回退（当API不可用时）
   */
  async forecastLocal(
    algorithm: ForecastAlgorithm,
    input: ForecastInput
  ): Promise<ForecastOutput> {
    // 动态导入本地实现
    const {
      simpleExponentialSmoothing,
      holtLinearSmoothing,
      holtWintersSmoothing
    } = await import('./forecastAlgorithmService');

    const history = input.historical_data.map(h => ({
      productId: input.product_id,
      month: h.month,
      quantity: h.quantity,
    }));

    let forecastValues: number[];

    switch (algorithm) {
      case 'simple_exponential':
        forecastValues = simpleExponentialSmoothing(history, input.forecast_periods);
        break;
      case 'holt_linear':
        forecastValues = holtLinearSmoothing(history, input.forecast_periods);
        break;
      case 'holt_winters':
        forecastValues = holtWintersSmoothing(history, input.forecast_periods, 12);
        break;
      default:
        // Prophet、ARIMA、集成预测需要后端支持
        throw new Error(`算法 ${algorithm} 需要后端API支持`);
    }

    return {
      product_id: input.product_id,
      algorithm,
      forecast_values: forecastValues,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/health`;
      const response = await httpClient.get(url, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const forecastOperatorService = new ForecastOperatorService();
export default forecastOperatorService;
```

### 13.5 API测试示例

```bash
# 健康检查
curl http://localhost:8000/health

# Prophet预测
curl -X POST http://localhost:8000/api/v1/forecast/prophet \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "T01-000055",
    "historical_data": [
      {"month": "2025-01", "quantity": 100},
      {"month": "2025-02", "quantity": 120},
      {"month": "2025-03", "quantity": 110},
      {"month": "2025-04", "quantity": 130},
      {"month": "2025-05", "quantity": 140},
      {"month": "2025-06", "quantity": 125}
    ],
    "forecast_periods": 12
  }'

# 集成预测
curl -X POST http://localhost:8000/api/v1/forecast/ensemble \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "T01-000055",
    "historical_data": [
      {"month": "2025-01", "quantity": 100},
      {"month": "2025-02", "quantity": 120}
    ],
    "forecast_periods": 6,
    "parameters": {
      "algorithms": ["simple_exponential", "holt_linear"],
      "method": "weighted_average"
    }
  }'

# 批量预测
curl -X POST "http://localhost:8000/api/v1/forecast/batch?algorithm=simple_exponential" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "product_id": "T01-000055",
      "historical_data": [{"month": "2025-01", "quantity": 100}],
      "forecast_periods": 6
    },
    {
      "product_id": "T01-000056",
      "historical_data": [{"month": "2025-01", "quantity": 200}],
      "forecast_periods": 6
    }
  ]'
```

### 13.6 启动和验证

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 3. 访问API文档
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)

# 4. Docker部署
docker-compose up -d

# 5. 查看日志
docker-compose logs -f forecast-operator-service
```
