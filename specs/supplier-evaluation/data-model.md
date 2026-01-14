# Data Model: 供应商评估分析页面（需求变更）

**Date**: 2024-12-20 (Updated)  
**Feature**: Supplier Evaluation Analysis Page (Updated Requirements)

## Entity Definitions

All types MUST be defined in `src/types/ontology.ts` per Principle 1.

### MainMaterialSupplier

Represents a main material and its current supplier relationship.

```typescript
interface MainMaterialSupplier {
  materialCode: string;              // Material code
  materialName: string;               // Material name
  supplierId: string;                 // Current supplier ID
  supplierName: string;               // Current supplier name
  currentStock: number;                // Current stock quantity (Material.currentStock)
  qualityRating: number;               // Quality rating (0-100, generated if 0 or null)
  riskRating: number;                  // Risk rating (0-100, lower is better, generated if 0 or null)
  onTimeDeliveryRate: number;          // On-time delivery rate (0-100, percentage, generated if 0 or null)
  annualPurchaseAmount: number;       // Total annual purchase amount (calculated, generated if 0 or null)
  riskCoefficient: number;            // Risk coefficient (0-100)
  qualityEvents: QualityEvent[];     // Array of quality events
  rank: number;                       // Rank by current stock (1-5)
}
```

**Relationships**:
- One-to-many with Material (one material can have multiple suppliers)
- One-to-many with Supplier (one supplier can supply multiple materials)
- Contains array of QualityEvent

**Validation Rules**:
- currentStock must be >= 0
- qualityRating must be between 0 and 100 (generated if 0 or null)
- riskRating must be between 0 and 100 (generated if 0 or null)
- onTimeDeliveryRate must be between 0 and 100 (generated if 0 or null)
- annualPurchaseAmount must be >= 0 (generated if 0 or null)
- riskCoefficient must be between 0 and 100
- rank must be between 1 and 5

### QualityEvent

Represents a quality-related event for a material-supplier relationship.

```typescript
interface QualityEvent {
  eventId: string;                    // Unique event ID
  materialCode: string;                // Material code
  supplierId: string;                 // Supplier ID
  eventType: 'defect' | 'delay' | 'rejection' | 'complaint'; // Event type
  severity: 'low' | 'medium' | 'high' | 'critical'; // Severity level
  description: string;                 // Event description
  eventDate: string;                   // ISO date string
  resolved: boolean;                   // Whether event is resolved
  resolutionDate?: string;            // ISO date string if resolved
}
```

**Relationships**:
- Many-to-one with MainMaterialSupplier

### Supplier360Scorecard

Represents a supplier's 360° evaluation scorecard.

```typescript
interface Supplier360Scorecard {
  supplierId: string;                 // Supplier ID
  supplierName: string;                // Supplier name
  evaluationDate: string;              // ISO date string
  dimensions: {
    onTimeDeliveryRate: number;        // 0-100 score (dimension 1)
    qualityRating: number;             // 0-100 score (dimension 2)
    riskRating: number;                  // 0-100 score (dimension 3, lower is better)
    onTimeDeliveryRate2: number;        // 0-100 score (dimension 4, duplicate for display)
    annualPurchaseAmount: number;       // Display metric only, not scored (dimension 5)
    responseSpeed: number;             // 0-100 score (dimension 6)
  };
  riskAssessment: RiskAssessment;      // Risk assessment details
  overallScore: number;                // Weighted average (0-100, excludes annualPurchaseAmount)
}
```

**Relationships**:
- One-to-one with Supplier
- Contains RiskAssessment

**Validation Rules**:
- onTimeDeliveryRate, qualityRating, riskRating, onTimeDeliveryRate2, responseSpeed must be between 0 and 100
- annualPurchaseAmount must be >= 0 (display metric, not scored)
- overallScore must be between 0 and 100 (calculated from scored dimensions only)

### RiskAssessment

Represents comprehensive risk assessment for a supplier.

```typescript
interface RiskAssessment {
  supplierId: string;                 // Supplier ID
  assessmentDate: string;              // ISO date string
  financialStatus: {
    score: number;                     // 0-100
    creditRating?: string;            // Optional credit rating
    lastUpdated: string;               // ISO timestamp
  };
  publicSentiment: {
    score: number;                     // 0-100 (higher = more positive)
    source: 'manual';                  // Always manual per FR-004.1
    lastUpdated: string;               // ISO timestamp
    notes?: string;                    // Optional notes
  };
  productionAnomalies: {
    count: number;                     // Number of anomalies
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: 'manual';                  // Always manual per FR-004.1
    lastUpdated: string;               // ISO timestamp
    details?: string;                  // Optional details
  };
  legalRisks: {
    score: number;                     // 0-100 (higher = more risk)
    source: 'auto';                    // Always auto per FR-004.1
    lastUpdated: string;               // ISO timestamp
    risks: LegalRisk[];                // Array of legal risk items
  };
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
}
```

**Legal Risk Item**:
```typescript
interface LegalRisk {
  type: 'major_pledge' | 'legal_restriction' | 'lawsuit' | 'other';
  description: string;                 // Risk description
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;                        // ISO date string
  source: string;                      // Data source identifier
}
```

**Relationships**:
- One-to-one with Supplier360Scorecard

### AlternativeSupplier

Represents an alternative supplier recommendation for switching.

```typescript
interface AlternativeSupplier {
  supplierId: string;                 // Alternative supplier ID
  supplierName: string;                // Supplier name
  materialCode: string;                // Material code this alternative applies to
  similarityScore: number;             // Similarity score (0-100)
  recommendationReason: string;       // Why this supplier is recommended
  comparison: {
    onTimeDeliveryRate: number;        // Comparison score
    quality: number;                   // Comparison score
    price: number;                     // Comparison score
    responseSpeed: number;             // Comparison score
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  availability: boolean;               // Whether supplier is available
}
```

**Relationships**:
- Many-to-one with MainMaterialSupplier (multiple alternatives per material)

### SupplierComparison

Represents comparison data for two-step confirmation workflow.

```typescript
interface SupplierComparison {
  currentSupplier: {
    supplierId: string;
    supplierName: string;
    materialCode: string;
    materialName: string;
    scorecard: Supplier360Scorecard;
  };
  alternativeSuppliers: AlternativeSupplier[];
  affectedOrders: {
    orderId: string;
    orderName: string;
    impact: 'none' | 'minor' | 'moderate' | 'major';
  }[];
}
```

**Relationships**:
- Aggregates MainMaterialSupplier and AlternativeSupplier data

## Data Flow

### Main Material Calculation Flow
1. System queries all materials with currentStock field
2. System sorts materials by currentStock (descending)
3. System selects top 5 materials
4. System enriches with supplier, quality rating, risk rating, on-time delivery rate, annual purchase amount
5. System generates random mock data for missing fields (0 or null/undefined)
6. System displays in MainMaterialSupplierPanel with: supplier name, material name, current stock, quality rating, risk rating, on-time delivery rate, annual purchase amount

### Supplier Switch Flow
1. User clicks "切换备选供应商" on main material panel
2. System queries alternative suppliers for the material
3. System calculates comparison metrics
4. System displays SupplierComparisonModal (Step 1: comparison view)
5. User reviews comparison and selects alternative
6. System shows confirmation dialog (Step 2: confirmation)
7. User confirms switch
8. System executes switch and updates data

### Risk Assessment Update Flow
1. **Legal Risks (Real-time API)**:
   - User selects supplier from dropdown list
   - System triggers real-time external API call (FR-004.2)
   - System shows loading state during API call
   - System queries external legal data API (major pledges, legal representative restrictions, etc.)
   - System processes and normalizes data
   - System updates legalRisks in RiskAssessment
   - System recalculates overallRiskLevel
   - System displays updated risk assessment

2. **Production Anomalies & Sentiment (Manual)**:
   - User opens risk assessment form
   - User enters anomaly or sentiment data
   - System validates and saves data
   - System updates RiskAssessment
   - System recalculates overallRiskLevel

### Supplier Selection Flow
1. System queries all suppliers
2. System calculates annual purchase amount per supplier
3. System sorts suppliers by annual purchase amount (descending)
4. System displays in dropdown list
5. User selects supplier from dropdown
6. System updates 360° scorecard with selected supplier data
7. System triggers real-time API call for legal risks (if not cached)

### AI Assistant Query Flow
1. User opens CopilotSidebar on supplier evaluation page
2. User enters query (supplier situation or material sourcing)
3. System parses query intent
4. System queries relevant supplier/evaluation data
5. System formats response using conversation examples
6. System displays response in CopilotSidebar

## State Transitions

### Supplier Switch Lifecycle
```
[Current Supplier] → [Comparison View] → [Confirmation] → [Switching] → [New Supplier]
                                    ↓
                              [Cancelled]
```

### Risk Assessment Update Lifecycle
```
[Stale Data] → [Updating] → [Updated] → [Stale Data]
              (auto/manual)
```

## Data Storage (Current)

### Mock Data Structure
```typescript
// In src/data/mockData.ts
export const mainMaterialSuppliersData: MainMaterialSupplier[] = [
  {
    materialCode: 'MAT-001',
    materialName: '钢材',
    supplierId: 'SUP-001',
    supplierName: '供应商A',
    annualPurchaseAmount: 5000000,
    riskCoefficient: 15,
    qualityEvents: [],
    rank: 1,
  },
  // ... more materials
];

export const supplier360ScorecardsData: Supplier360Scorecard[] = [
  {
    supplierId: 'SUP-001',
    supplierName: '供应商A',
    evaluationDate: '2024-12-01',
    dimensions: {
      onTimeDeliveryRate: 88,
      quality: 90,
      price: 75,
      responseSpeed: 88,
    },
    riskAssessment: { /* ... */ },
    overallScore: 85,
  },
  // ... more scorecards
];
```

### Future API Structure
```typescript
// GET /api/materials/main-suppliers?limit=10
// GET /api/suppliers/:supplierId/scorecard
// GET /api/materials/:materialCode/alternative-suppliers
// POST /api/suppliers/switch
// GET /api/suppliers/:supplierId/risk-assessment
// PUT /api/suppliers/:supplierId/risk-assessment
```

## Constraints & Business Rules

1. **Main Material Selection**: Top 5 by current stock (Material.currentStock) (FR-001.1)
2. **Display Fields**: Must show supplier name, material name, current stock, quality rating, risk rating, on-time delivery rate, annual purchase amount (FR-001)
3. **Supplier Switch**: Requires two-step confirmation (FR-002.1)
4. **Risk Data**: Legal risks real-time API calls, others manual entry (FR-004.1, FR-004.2)
5. **Scorecard Dimensions**: Exactly 6 dimensions: on-time delivery rate, quality rating, risk rating, on-time delivery rate (duplicate), annual purchase amount (display), response speed (FR-003.1)
6. **Supplier Selection**: Dropdown list sorted by annual purchase amount descending (FR-003.3)
7. **Data Generation**: Generate random mock data for quality rating, risk rating, on-time delivery rate, annual purchase amount when 0 or null/undefined (FR-011)
8. **AI Assistant**: Page-specific, uses CopilotSidebar component (FR-006.1)

## Edge Cases Handled

1. **No Alternative Suppliers**: Display message, disable switch action
2. **Missing Risk Data**: Show "数据待更新" placeholder
3. **Incomplete Purchase Data**: Use available data, show warning if incomplete
4. **Concurrent Switch Requests**: Last-write-wins, show conflict warning
5. **AI Query No Results**: Return helpful message suggesting alternative queries
