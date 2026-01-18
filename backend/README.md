# Prophet Forecast Service

基于 Meta Prophet 算法的时间序列预测服务，为供应链管理系统提供需求预测能力。

## 快速开始

### 1. 创建虚拟环境

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 启动服务

```bash
python run.py
```

服务将在 `http://localhost:8000` 启动。

## API 端点

### 健康检查

```
GET /health
GET /api/forecast/health
```

### Prophet 预测

```
POST /api/v1/forecast/prophet
```

请求示例：

```json
{
  "product_id": "PROD-001",
  "historical_data": [
    { "month": "2024-01", "quantity": 100 },
    { "month": "2024-02", "quantity": 120 },
    { "month": "2024-03", "quantity": 115 },
    { "month": "2024-04", "quantity": 130 },
    { "month": "2024-05", "quantity": 140 },
    { "month": "2024-06", "quantity": 135 },
    { "month": "2024-07", "quantity": 145 },
    { "month": "2024-08", "quantity": 150 },
    { "month": "2024-09", "quantity": 160 },
    { "month": "2024-10", "quantity": 155 },
    { "month": "2024-11", "quantity": 165 },
    { "month": "2024-12", "quantity": 170 }
  ],
  "forecast_periods": 12,
  "parameters": {
    "seasonality_mode": "multiplicative",
    "yearly_seasonality": true,
    "weekly_seasonality": false,
    "changepoint_prior_scale": 0.05,
    "seasonality_prior_scale": 10,
    "interval_width": 0.95,
    "growth": "linear"
  }
}
```

响应示例：

```json
{
  "product_id": "PROD-001",
  "algorithm": "prophet",
  "forecast_values": [175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230],
  "confidence_intervals": [
    { "lower": 160, "upper": 190 },
    { "lower": 165, "upper": 195 },
    ...
  ],
  "metrics": {
    "mape": 5.2,
    "rmse": 12.5,
    "mae": 10.3
  },
  "generated_at": "2024-01-15T10:30:00.000Z"
}
```

## 参数说明

| 参数 | 类型 | 范围 | 默认值 | 说明 |
|------|------|------|--------|------|
| seasonality_mode | string | additive/multiplicative | multiplicative | 季节性模式 |
| yearly_seasonality | boolean | - | true | 年度季节性 |
| weekly_seasonality | boolean | - | false | 周季节性 |
| changepoint_prior_scale | float | 0.001-0.5 | 0.05 | 变化点灵敏度 |
| seasonality_prior_scale | float | 0.01-10 | 10 | 季节性灵敏度 |
| interval_width | float | 0.5-0.99 | 0.95 | 置信区间宽度 |
| growth | string | linear/logistic/flat | linear | 趋势增长模式 |

## API 文档

启动服务后访问 `http://localhost:8000/docs` 查看 Swagger UI 交互式文档。

## 与前端集成

前端通过 Vite 代理将 `/proxy-forecast` 请求转发到此服务。确保在 `vite.config.ts` 中配置：

```typescript
proxy: {
  '/proxy-forecast': {
    target: 'http://localhost:8000',
    rewrite: (path) => path.replace(/^\/proxy-forecast/, ''),
  }
}
```
