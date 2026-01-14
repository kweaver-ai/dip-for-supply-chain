# API Contracts: 产品供应优化页面

**Date**: 2024-12-19  
**Feature**: Product Supply Optimization Page  
**Status**: Complete

## Overview

This document defines API contracts for the Product Supply Optimization page feature. These contracts are designed for future backend integration. Currently, the implementation uses in-memory mock data via service layer functions.

## API Endpoints

### 1. Get Product Supply Analysis

**Endpoint**: `GET /api/products/{productId}/supply-analysis`

**Purpose**: Retrieve comprehensive supply analysis metrics for a product

**Request**:
```typescript
// Path parameters
{
  productId: string;  // Product ID
}

// Query parameters (optional)
{
  includeHistory?: boolean;  // Include historical trends (default: false)
}
```

**Response**:
```typescript
{
  success: true;
  data: ProductSupplyAnalysis;
  timestamp: string;  // ISO timestamp
}

// Error response
{
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Server error

**Example Request**:
```http
GET /api/products/PROD-001/supply-analysis?includeHistory=false
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "productId": "PROD-001",
    "productName": "产品A",
    "supplierCount": 3,
    "averageDeliveryCycle": 15,
    "supplyStabilityScore": 85,
    "currentInventoryLevel": 1200,
    "stockoutRiskLevel": "low",
    "lastUpdated": "2024-12-19T10:00:00Z"
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

### 2. Get All Products Supply Analysis

**Endpoint**: `GET /api/products/supply-analysis`

**Purpose**: Retrieve supply analysis for all products

**Request**:
```typescript
// Query parameters (optional)
{
  limit?: number;           // Limit number of results (default: 100)
  offset?: number;          // Offset for pagination (default: 0)
  sortBy?: 'supplierCount' | 'averageDeliveryCycle' | 'supplyStabilityScore' | 'stockoutRiskLevel';
  sortOrder?: 'asc' | 'desc';  // Sort order (default: 'asc')
  filterRiskLevel?: StockoutRiskLevel[];  // Filter by risk level
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    products: ProductSupplyAnalysis[];
    total: number;
    limit: number;
    offset: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

**Example Request**:
```http
GET /api/products/supply-analysis?limit=10&sortBy=stockoutRiskLevel&sortOrder=desc
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": "PROD-001",
        "productName": "产品A",
        "supplierCount": 3,
        "averageDeliveryCycle": 15,
        "supplyStabilityScore": 85,
        "currentInventoryLevel": 1200,
        "stockoutRiskLevel": "low",
        "lastUpdated": "2024-12-19T10:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

### 3. Get Demand Forecast

**Endpoint**: `GET /api/products/{productId}/demand-forecast`

**Purpose**: Retrieve demand forecast for a product

**Request**:
```typescript
// Path parameters
{
  productId: string;  // Product ID
}

// Query parameters
{
  forecastPeriod: number;  // Forecast period in days (30, 60, or 90)
  method?: 'moving_average' | 'exponential_smoothing';  // Calculation method (default: 'moving_average')
}
```

**Response**:
```typescript
{
  success: true;
  data: DemandForecast;
  timestamp: string;
}

// Error response
{
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid forecast period or method
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Server error

**Example Request**:
```http
GET /api/products/PROD-001/demand-forecast?forecastPeriod=30&method=moving_average
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "productId": "PROD-001",
    "productName": "产品A",
    "forecastPeriod": 30,
    "predictedDemand": 500,
    "confidenceLevel": "high",
    "calculationMethod": "moving_average",
    "historicalDataPoints": 12,
    "lastUpdated": "2024-12-19T10:00:00Z"
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

### 4. Get Multiple Products Demand Forecast

**Endpoint**: `GET /api/products/demand-forecast`

**Purpose**: Retrieve demand forecasts for multiple products

**Request**:
```typescript
// Query parameters
{
  productIds?: string[];     // Product IDs (if not provided, returns all)
  forecastPeriod: number;     // Forecast period in days (30, 60, or 90)
  method?: 'moving_average' | 'exponential_smoothing';  // Calculation method
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    forecasts: DemandForecast[];
    total: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid forecast period or method
- `500 Internal Server Error`: Server error

---

### 5. Get Optimization Suggestions

**Endpoint**: `GET /api/products/{productId}/optimization-suggestions`

**Purpose**: Retrieve optimization suggestions for a product

**Request**:
```typescript
// Path parameters
{
  productId: string;  // Product ID
}

// Query parameters (optional)
{
  suggestionType?: SuggestionType[];      // Filter by suggestion type
  priority?: SuggestionPriority[];        // Filter by priority
  limit?: number;                         // Limit number of results (default: 10)
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    suggestions: OptimizationSuggestion[];
    total: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Server error

**Example Request**:
```http
GET /api/products/PROD-001/optimization-suggestions?priority=high&limit=5
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "suggestionId": "SUG-001",
        "productId": "PROD-001",
        "productName": "产品A",
        "suggestionType": "replenish",
        "priority": "high",
        "reason": "当前库存低于安全库存水平",
        "currentValue": 500,
        "suggestedValue": 1000,
        "unit": "units",
        "estimatedImpact": "降低缺货风险，提高供应稳定性",
        "createdAt": "2024-12-19T10:00:00Z"
      }
    ],
    "total": 1
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

### 6. Get All Products Optimization Suggestions

**Endpoint**: `GET /api/products/optimization-suggestions`

**Purpose**: Retrieve optimization suggestions for all products

**Request**:
```typescript
// Query parameters (optional)
{
  suggestionType?: SuggestionType[];
  priority?: SuggestionPriority[];
  productIds?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    suggestions: OptimizationSuggestion[];
    total: number;
    limit: number;
    offset: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

### 7. Get Risk Alerts

**Endpoint**: `GET /api/products/{productId}/risk-alerts`

**Purpose**: Retrieve risk alerts for a product

**Request**:
```typescript
// Path parameters
{
  productId: string;  // Product ID
}

// Query parameters (optional)
{
  severity?: RiskSeverity[];     // Filter by severity
  riskType?: RiskType[];          // Filter by risk type
  acknowledged?: boolean;         // Filter by acknowledgment status
  limit?: number;                 // Limit number of results (default: 10)
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    alerts: SupplyRiskAlert[];
    total: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Server error

**Example Request**:
```http
GET /api/products/PROD-001/risk-alerts?severity=high&acknowledged=false
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": "ALERT-001",
        "productId": "PROD-001",
        "productName": "产品A",
        "riskType": "inventory",
        "severity": "high",
        "title": "库存水平低于安全库存",
        "description": "当前库存500单位，低于安全库存800单位，存在缺货风险",
        "affectedSuppliers": ["SUP-001"],
        "affectedMaterials": ["MAT-001"],
        "detectedAt": "2024-12-19T10:00:00Z",
        "acknowledged": false
      }
    ],
    "total": 1
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

### 8. Get All Products Risk Alerts

**Endpoint**: `GET /api/products/risk-alerts`

**Purpose**: Retrieve risk alerts for all products

**Request**:
```typescript
// Query parameters (optional)
{
  severity?: RiskSeverity[];
  riskType?: RiskType[];
  productIds?: string[];
  acknowledged?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'severity' | 'detectedAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    alerts: SupplyRiskAlert[];
    total: number;
    limit: number;
    offset: number;
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

### 9. Acknowledge Risk Alert

**Endpoint**: `POST /api/products/risk-alerts/{alertId}/acknowledge`

**Purpose**: Acknowledge a risk alert

**Request**:
```typescript
// Path parameters
{
  alertId: string;  // Alert ID
}

// Request body (optional)
{
  notes?: string;  // Optional acknowledgment notes
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    alert: SupplyRiskAlert;  // Updated alert with acknowledged: true
  };
  timestamp: string;
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Alert not found
- `400 Bad Request`: Alert already acknowledged
- `500 Internal Server Error`: Server error

**Example Request**:
```http
POST /api/products/risk-alerts/ALERT-001/acknowledge
Content-Type: application/json

{
  "notes": "已通知采购部门处理"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "alert": {
      "alertId": "ALERT-001",
      "productId": "PROD-001",
      "productName": "产品A",
      "riskType": "inventory",
      "severity": "high",
      "title": "库存水平低于安全库存",
      "description": "当前库存500单位，低于安全库存800单位，存在缺货风险",
      "detectedAt": "2024-12-19T10:00:00Z",
      "acknowledged": true,
      "acknowledgedAt": "2024-12-19T10:05:00Z"
    }
  },
  "timestamp": "2024-12-19T10:05:00Z"
}
```

---

## Error Codes

### Common Error Codes

- `PRODUCT_NOT_FOUND`: Product with specified ID does not exist
- `INVALID_FORECAST_PERIOD`: Forecast period must be 30, 60, or 90 days
- `INVALID_CALCULATION_METHOD`: Calculation method not supported
- `INSUFFICIENT_HISTORICAL_DATA`: Not enough historical data for forecast
- `ALERT_NOT_FOUND`: Alert with specified ID does not exist
- `ALERT_ALREADY_ACKNOWLEDGED`: Alert has already been acknowledged
- `INVALID_QUERY_PARAMETERS`: Query parameters are invalid
- `INTERNAL_SERVER_ERROR`: Unexpected server error

---

## Service Layer Functions (Current Implementation)

Since the current implementation uses in-memory mock data, the following service layer functions mirror the API contracts:

### productSupplyService.ts
- `getProductSupplyAnalysis(productId: string): ProductSupplyAnalysis | null`
- `getAllProductsSupplyAnalysis(options?: QueryOptions): ProductSupplyAnalysis[]`

### demandForecastService.ts
- `calculateDemandForecast(productId: string, forecastPeriod: number): DemandForecast | null`
- `calculateMultipleProductsForecast(productIds: string[], forecastPeriod: number): DemandForecast[]`

### optimizationService.ts
- `getOptimizationSuggestions(productId: string, options?: FilterOptions): OptimizationSuggestion[]`
- `getAllProductsOptimizationSuggestions(options?: QueryOptions): OptimizationSuggestion[]`

### riskAlertService.ts (to be created)
- `getRiskAlerts(productId: string, options?: FilterOptions): SupplyRiskAlert[]`
- `getAllProductsRiskAlerts(options?: QueryOptions): SupplyRiskAlert[]`
- `acknowledgeRiskAlert(alertId: string, notes?: string): SupplyRiskAlert | null`

---

## Future Backend Integration

When integrating with a backend API:

1. Replace service layer functions with API client functions
2. Add authentication headers to requests
3. Implement request/response interceptors for error handling
4. Add request caching for performance optimization
5. Implement retry logic for failed requests
6. Add request timeout handling

---

## OpenAPI Specification

A complete OpenAPI 3.0 specification can be generated from these contracts for API documentation and client code generation.





