# Data Model: 产品供应优化页面

**Date**: 2024-12-19  
**Feature**: Product Supply Optimization Page  
**Status**: Complete

## Overview

This document defines the data model for the Product Supply Optimization page feature. All entity types MUST be defined in `src/types/ontology.ts` per Principle 1.

## Entity Definitions

### 1. ProductSupplyAnalysis

**Purpose**: Represents comprehensive supply analysis metrics for a product

**Fields**:
```typescript
interface ProductSupplyAnalysis {
  productId: string;                    // Product ID (references Product.productId)
  productName: string;                  // Product name
  supplierCount: number;                // Number of suppliers for this product
  averageDeliveryCycle: number;         // Average delivery cycle in days
  supplyStabilityScore: number;         // Supply stability score (0-100)
  currentInventoryLevel: number;        // Current inventory level (units)
  stockoutRiskLevel: 'low' | 'medium' | 'high' | 'critical'; // Stockout risk level
  lastUpdated: string;                  // ISO timestamp
}
```

**Relationships**:
- References `Product.productId`
- Aggregated from `Supplier`, `Order`, `MaterialStock` data

**Validation Rules**:
- `supplierCount` >= 0
- `averageDeliveryCycle` >= 0
- `supplyStabilityScore` in range [0, 100]
- `currentInventoryLevel` >= 0
- `stockoutRiskLevel` must be one of: 'low', 'medium', 'high', 'critical'

**Calculation Notes**:
- `supplierCount`: Count unique suppliers for materials used in this product
- `averageDeliveryCycle`: Average of delivery cycles from historical orders
- `supplyStabilityScore`: Calculated from historical delivery performance (on-time rate, variance)
- `currentInventoryLevel`: Sum of material stocks for materials used in this product
- `stockoutRiskLevel`: Calculated from inventory level vs forecasted demand

---

### 2. DemandForecast

**Purpose**: Represents demand forecast for a product over a future period

**Fields**:
```typescript
interface DemandForecast {
  productId: string;                    // Product ID (references Product.productId)
  productName: string;                  // Product name
  forecastPeriod: number;               // Forecast period in days (30, 60, 90)
  predictedDemand: number;              // Predicted demand quantity
  confidenceLevel: 'low' | 'medium' | 'high'; // Confidence level
  calculationMethod: 'moving_average';  // Calculation method used
  historicalDataPoints: number;         // Number of historical data points used
  lastUpdated: string;                 // ISO timestamp
}
```

**Relationships**:
- References `Product.productId`
- Calculated from `Order` historical data

**Validation Rules**:
- `forecastPeriod` must be one of: 30, 60, 90
- `predictedDemand` >= 0
- `confidenceLevel` must be one of: 'low', 'medium', 'high'
- `calculationMethod` currently only supports 'moving_average'
- `historicalDataPoints` >= 0

**Calculation Notes**:
- `predictedDemand`: Moving average of historical order quantities
- `confidenceLevel`: Based on data availability and variance
  - High: >= 12 data points, low variance
  - Medium: 6-11 data points, moderate variance
  - Low: < 6 data points or high variance
- `historicalDataPoints`: Count of historical orders used in calculation

---

### 3. OptimizationSuggestion

**Purpose**: Represents an optimization suggestion for inventory management

**Fields**:
```typescript
type SuggestionType = 'replenish' | 'clearance' | 'safety_stock_adjustment';
type SuggestionPriority = 'high' | 'medium' | 'low';

interface OptimizationSuggestion {
  suggestionId: string;                 // Unique suggestion ID
  productId: string;                    // Product ID (references Product.productId)
  productName: string;                  // Product name
  suggestionType: SuggestionType;        // Type of suggestion
  priority: SuggestionPriority;         // Priority level
  reason: string;                       // Reason for suggestion
  currentValue: number;                  // Current value (inventory, safety stock, etc.)
  suggestedValue: number;                // Suggested value
  unit: string;                          // Unit of measurement
  estimatedImpact: string;               // Estimated impact description
  createdAt: string;                     // ISO timestamp
}
```

**Relationships**:
- References `Product.productId`

**Validation Rules**:
- `suggestionType` must be one of: 'replenish', 'clearance', 'safety_stock_adjustment'
- `priority` must be one of: 'high', 'medium', 'low'
- `currentValue` >= 0
- `suggestedValue` >= 0
- `reason` must not be empty

**Suggestion Type Details**:
- **replenish**: Suggests increasing inventory
  - Trigger: `currentInventory < safetyStock` OR `forecastedDemand > currentInventory`
  - `suggestedValue`: Recommended replenishment quantity
- **clearance**: Suggests reducing inventory
  - Trigger: `currentInventory > maxStock` OR slow-moving inventory detected
  - `suggestedValue`: Recommended clearance quantity
- **safety_stock_adjustment**: Suggests adjusting safety stock level
  - Trigger: `stockoutRiskLevel == 'high'` OR `safetyStock < recommendedSafetyStock`
  - `suggestedValue`: Recommended safety stock level

---

### 4. SupplyRiskAlert

**Purpose**: Represents a risk alert for potential supply chain disruptions

**Fields**:
```typescript
type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
type RiskType = 'inventory' | 'supplier' | 'forecast' | 'quality';

interface SupplyRiskAlert {
  alertId: string;                      // Unique alert ID
  productId: string;                    // Product ID (references Product.productId)
  productName: string;                   // Product name
  riskType: RiskType;                    // Type of risk
  severity: RiskSeverity;                // Severity level
  title: string;                         // Alert title
  description: string;                   // Alert description
  affectedSuppliers?: string[];          // Affected supplier IDs (optional)
  affectedMaterials?: string[];           // Affected material codes (optional)
  detectedAt: string;                   // ISO timestamp when risk was detected
  acknowledged: boolean;                 // Whether alert has been acknowledged
  acknowledgedAt?: string;               // ISO timestamp when acknowledged (optional)
}
```

**Relationships**:
- References `Product.productId`
- Optionally references `Supplier.supplierId` (via `affectedSuppliers`)
- Optionally references `Material.materialCode` (via `affectedMaterials`)

**Validation Rules**:
- `riskType` must be one of: 'inventory', 'supplier', 'forecast', 'quality'
- `severity` must be one of: 'low', 'medium', 'high', 'critical'
- `title` must not be empty
- `description` must not be empty
- `detectedAt` must be valid ISO timestamp

**Risk Type Details**:
- **inventory**: Low stock levels, stockout risk
- **supplier**: Supplier status issues, delivery delays
- **forecast**: High demand forecast vs low inventory
- **quality**: Quality events from supplier evaluation

---

## Type Definitions for ontology.ts

All types MUST be added to `src/types/ontology.ts`:

```typescript
// ============================================================================
// Product Supply Optimization Types
// ============================================================================

export type StockoutRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ForecastConfidenceLevel = 'low' | 'medium' | 'high';
export type SuggestionType = 'replenish' | 'clearance' | 'safety_stock_adjustment';
export type SuggestionPriority = 'high' | 'medium' | 'low';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskType = 'inventory' | 'supplier' | 'forecast' | 'quality';

export interface ProductSupplyAnalysis {
  productId: string;
  productName: string;
  supplierCount: number;
  averageDeliveryCycle: number;
  supplyStabilityScore: number;
  currentInventoryLevel: number;
  stockoutRiskLevel: StockoutRiskLevel;
  lastUpdated: string;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  forecastPeriod: number;
  predictedDemand: number;
  confidenceLevel: ForecastConfidenceLevel;
  calculationMethod: 'moving_average';
  historicalDataPoints: number;
  lastUpdated: string;
}

export interface OptimizationSuggestion {
  suggestionId: string;
  productId: string;
  productName: string;
  suggestionType: SuggestionType;
  priority: SuggestionPriority;
  reason: string;
  currentValue: number;
  suggestedValue: number;
  unit: string;
  estimatedImpact: string;
  createdAt: string;
}

export interface SupplyRiskAlert {
  alertId: string;
  productId: string;
  productName: string;
  riskType: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  affectedSuppliers?: string[];
  affectedMaterials?: string[];
  detectedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}
```

---

## Data Flow

### Product Supply Analysis Flow
```
Product.productId
  → Get materials (Product.materialCodes)
  → Get suppliers (Supplier.materialCode)
  → Count suppliers → supplierCount
  → Get orders (Order.productId)
  → Calculate delivery cycles → averageDeliveryCycle
  → Calculate stability → supplyStabilityScore
  → Get inventory (MaterialStock.materialCode)
  → Sum inventory → currentInventoryLevel
  → Calculate risk → stockoutRiskLevel
  → ProductSupplyAnalysis
```

### Demand Forecast Flow
```
Product.productId
  → Get historical orders (Order.productId, Order.orderDate)
  → Filter by date range (last N periods)
  → Calculate moving average → predictedDemand
  → Calculate confidence → confidenceLevel
  → DemandForecast
```

### Optimization Suggestions Flow
```
Product.productId
  → Get ProductSupplyAnalysis
  → Get DemandForecast
  → Apply rules:
    - IF inventory < safetyStock → replenish suggestion
    - IF inventory > maxStock → clearance suggestion
    - IF stockoutRiskLevel == 'high' → safety_stock_adjustment suggestion
  → Assign priority based on risk level
  → OptimizationSuggestion[]
```

### Risk Alerts Flow
```
Product.productId
  → Get ProductSupplyAnalysis
  → Get DemandForecast
  → Get Supplier360Scorecard (if available)
  → Check risk factors:
    - Inventory risk: low stock, stockout risk
    - Supplier risk: supplier status, delivery delays
    - Forecast risk: high demand vs low inventory
    - Quality risk: quality events
  → Generate alerts → SupplyRiskAlert[]
```

---

## Edge Cases

### No Supplier Data
- `supplierCount` = 0
- `averageDeliveryCycle` = 0 or null
- `supplyStabilityScore` = 0 or null
- Show warning in UI

### Missing Historical Data
- `historicalDataPoints` < minimum threshold
- `confidenceLevel` = 'low'
- Use available data, show confidence indicator
- Provide fallback forecast if no data available

### Conflicting Suggestions
- Multiple suggestions for same product with different types
- Show all suggestions with priority indicators
- Allow user to acknowledge/dismiss suggestions

### Empty Data States
- No products: Show empty state with guidance
- No forecasts: Show message about insufficient data
- No suggestions: Show message that no optimization needed
- No alerts: Show "All clear" message

---

## Migration Notes

All new types will be added to `src/types/ontology.ts` without modifying existing types. This ensures backward compatibility and follows Principle 1 (Type System Ontology).





