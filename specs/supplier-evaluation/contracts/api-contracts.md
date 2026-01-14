# API Contracts: 供应商评估分析页面（需求变更）

**Date**: 2024-12-19  
**Feature**: Supplier Evaluation Analysis Page (Updated Requirements)

## Overview

These contracts define the API structure for future backend integration. Currently, the application uses mock data, but these contracts ensure consistency when API integration is implemented.

## Base URL

```
/api/v1
```

## Endpoints

### 1. Get Main Material Suppliers

**GET** `/materials/main-suppliers`

Get main materials with their suppliers, sorted by annual purchase amount.

**Query Parameters**:
- `limit` (number, optional): Number of materials to return (default: 10)
- `year` (number, optional): Year for purchase amount calculation (default: current year)

**Response** (200 OK):
```json
{
  "materials": [
    {
      "materialCode": "MAT-001",
      "materialName": "钢材",
      "supplierId": "SUP-001",
      "supplierName": "供应商A",
      "annualPurchaseAmount": 5000000,
      "riskCoefficient": 15,
      "qualityEvents": [
        {
          "eventId": "QE-001",
          "eventType": "defect",
          "severity": "low",
          "description": "Minor quality issue",
          "eventDate": "2024-11-15",
          "resolved": true
        }
      ],
      "rank": 1
    }
  ],
  "total": 25,
  "limit": 10
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Calculation failed

---

### 2. Get Supplier 360° Scorecard

**GET** `/suppliers/:supplierId/scorecard`

Get 360° scorecard for a specific supplier.

**Path Parameters**:
- `supplierId` (string, required): Supplier ID

**Response** (200 OK):
```json
{
  "supplierId": "SUP-001",
  "supplierName": "供应商A",
  "evaluationDate": "2024-12-01",
  "dimensions": {
    "onTimeDeliveryRate": 88,
    "quality": 90,
    "price": 75,
    "responseSpeed": 88
  },
  "riskAssessment": {
    "financialStatus": {
      "score": 80,
      "creditRating": "AAA",
      "lastUpdated": "2024-12-01T10:00:00Z"
    },
    "publicSentiment": {
      "score": 75,
      "source": "manual",
      "lastUpdated": "2024-12-01T10:00:00Z",
      "notes": "Generally positive"
    },
    "productionAnomalies": {
      "count": 2,
      "severity": "low",
      "source": "manual",
      "lastUpdated": "2024-12-01T10:00:00Z"
    },
    "legalRisks": {
      "score": 10,
      "source": "auto",
      "lastUpdated": "2024-12-01T10:00:00Z",
      "risks": []
    },
    "overallRiskLevel": "low"
  },
  "overallScore": 85
}
```

**Error Responses**:
- `404 Not Found`: Supplier not found

---

### 3. Get Alternative Suppliers

**GET** `/materials/:materialCode/alternative-suppliers`

Get alternative suppliers for a specific material.

**Path Parameters**:
- `materialCode` (string, required): Material code

**Query Parameters**:
- `limit` (number, optional): Maximum number of alternatives (default: 5)
- `minSimilarity` (number, optional): Minimum similarity score (default: 50)

**Response** (200 OK):
```json
{
  "materialCode": "MAT-001",
  "materialName": "钢材",
  "alternatives": [
    {
      "supplierId": "SUP-002",
      "supplierName": "供应商B",
      "similarityScore": 85,
      "recommendationReason": "产品线匹配，价格合理",
      "comparison": {
        "onTimeDeliveryRate": 80,
        "quality": 85,
        "price": 78,
        "responseSpeed": 82,
        "riskLevel": "medium"
      },
      "availability": true
    }
  ],
  "total": 3
}
```

**Error Responses**:
- `404 Not Found`: Material not found
- `400 Bad Request`: Invalid query parameters

---

### 4. Switch Supplier

**POST** `/suppliers/switch`

Switch supplier for a material (two-step confirmation workflow).

**Request Body**:
```json
{
  "materialCode": "MAT-001",
  "currentSupplierId": "SUP-001",
  "newSupplierId": "SUP-002",
  "confirmationToken": "abc123" // From comparison view
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "materialCode": "MAT-001",
  "oldSupplierId": "SUP-001",
  "newSupplierId": "SUP-002",
  "affectedOrders": [
    {
      "orderId": "ORD-101",
      "impact": "minor"
    }
  ],
  "switchedAt": "2024-12-19T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data or missing confirmation token
- `404 Not Found`: Material or supplier not found
- `409 Conflict`: Supplier switch already in progress
- `422 Unprocessable Entity`: Switch validation failed

---

### 5. Get Supplier Comparison

**GET** `/suppliers/compare`

Get comparison data for supplier switching (Step 1 of two-step workflow).

**Query Parameters**:
- `materialCode` (string, required): Material code
- `currentSupplierId` (string, required): Current supplier ID
- `alternativeSupplierIds` (string[], optional): Specific alternatives to compare (if not provided, returns all alternatives)

**Response** (200 OK):
```json
{
  "currentSupplier": {
    "supplierId": "SUP-001",
    "supplierName": "供应商A",
    "materialCode": "MAT-001",
    "materialName": "钢材",
    "scorecard": {
      "dimensions": {
        "onTimeDeliveryRate": 88,
        "quality": 90,
        "price": 75,
        "responseSpeed": 88
      },
      "overallScore": 85
    }
  },
  "alternativeSuppliers": [
    {
      "supplierId": "SUP-002",
      "supplierName": "供应商B",
      "similarityScore": 85,
      "comparison": {
        "onTimeDeliveryRate": 80,
        "quality": 85,
        "price": 78,
        "responseSpeed": 82,
        "riskLevel": "medium"
      }
    }
  ],
  "affectedOrders": [
    {
      "orderId": "ORD-101",
      "orderName": "订单-101",
      "impact": "minor"
    }
  ],
  "confirmationToken": "abc123" // For Step 2 confirmation
}
```

**Error Responses**:
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: Material or supplier not found

---

### 6. Get/Update Risk Assessment

**GET** `/suppliers/:supplierId/risk-assessment`

Get risk assessment for a supplier.

**Path Parameters**:
- `supplierId` (string, required): Supplier ID

**Response** (200 OK):
```json
{
  "supplierId": "SUP-001",
  "assessmentDate": "2024-12-01",
  "financialStatus": {
    "score": 80,
    "creditRating": "AAA",
    "lastUpdated": "2024-12-01T10:00:00Z"
  },
  "publicSentiment": {
    "score": 75,
    "source": "manual",
    "lastUpdated": "2024-12-01T10:00:00Z",
    "notes": "Generally positive"
  },
  "productionAnomalies": {
    "count": 2,
    "severity": "low",
    "source": "manual",
    "lastUpdated": "2024-12-01T10:00:00Z",
    "details": "Minor production delays"
  },
  "legalRisks": {
    "score": 10,
    "source": "auto",
    "lastUpdated": "2024-12-01T10:00:00Z",
    "risks": []
  },
  "overallRiskLevel": "low"
}
```

**PUT** `/suppliers/:supplierId/risk-assessment`

Update manual risk assessment data (production anomalies, public sentiment).

**Path Parameters**:
- `supplierId` (string, required): Supplier ID

**Request Body**:
```json
{
  "publicSentiment": {
    "score": 75,
    "notes": "Generally positive"
  },
  "productionAnomalies": {
    "count": 2,
    "severity": "low",
    "details": "Minor production delays"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "supplierId": "SUP-001",
  "updatedAt": "2024-12-19T10:00:00Z",
  "overallRiskLevel": "low"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Supplier not found
- `403 Forbidden`: Cannot update auto-sourced data (legal risks)

---

### 7. Material Sourcing Query (AI Assistant)

**POST** `/ai/sourcing-query`

Query for similar suppliers for material sourcing (used by AI assistant).

**Request Body**:
```json
{
  "query": "市面上与XX公司相似的SSD供应商有哪些？",
  "materialType": "SSD",
  "referenceSupplierId": "SUP-001"
}
```

**Response** (200 OK):
```json
{
  "query": "市面上与XX公司相似的SSD供应商有哪些？",
  "results": [
    {
      "supplierId": "SUP-002",
      "supplierName": "供应商B",
      "similarityScore": 85,
      "recommendationReason": "产品线匹配，价格合理",
      "scorecard": {
        "dimensions": {
          "onTimeDeliveryRate": 80,
          "quality": 85,
          "price": 78,
          "responseSpeed": 82
        },
        "overallScore": 81
      }
    }
  ],
  "total": 3
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query
- `404 Not Found`: Reference supplier not found

---

## Data Types

### QualityEventType
```typescript
type QualityEventType = 'defect' | 'delay' | 'rejection' | 'complaint';
```

### SeverityLevel
```typescript
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
```

### RiskLevel
```typescript
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
```

### LegalRiskType
```typescript
type LegalRiskType = 'major_pledge' | 'legal_restriction' | 'lawsuit' | 'other';
```

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Authentication

All endpoints require authentication (future implementation):
- Header: `Authorization: Bearer <token>`
- 401 Unauthorized if token is missing or invalid

## Rate Limiting

- 100 requests per minute per user (future implementation)
- 429 Too Many Requests if limit exceeded
