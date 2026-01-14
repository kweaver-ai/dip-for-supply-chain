# Quickstart: 供应商评估分析页面（需求变更）

**Date**: 2024-12-19  
**Feature**: Supplier Evaluation Analysis Page (Updated Requirements)

## Overview

This quickstart guide helps developers understand how to implement the updated supplier evaluation analysis page with main material supplier panel, 360° scorecard, and AI assistant integration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Code editor with TypeScript support
- Understanding of React, TypeScript, and Tailwind CSS

## Setup Steps

### 1. Verify Dependencies

Ensure required dependencies are installed:

```bash
npm list recharts lucide-react react react-dom
```

If missing, install:
```bash
npm install recharts lucide-react
```

### 2. Extend Type Ontology

Add new types to `src/types/ontology.ts`:

```typescript
// Add to ontology.ts

// Main Material Supplier
export interface MainMaterialSupplier {
  materialCode: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  annualPurchaseAmount: number;
  riskCoefficient: number;
  qualityEvents: QualityEvent[];
  rank: number;
}

export interface QualityEvent {
  eventId: string;
  materialCode: string;
  supplierId: string;
  eventType: 'defect' | 'delay' | 'rejection' | 'complaint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  eventDate: string;
  resolved: boolean;
  resolutionDate?: string;
}

// Supplier 360° Scorecard
export interface Supplier360Scorecard {
  supplierId: string;
  supplierName: string;
  evaluationDate: string;
  dimensions: {
    onTimeDeliveryRate: number;
    quality: number;
    price: number;
    responseSpeed: number;
  };
  riskAssessment: RiskAssessment;
  overallScore: number;
}

export interface RiskAssessment {
  supplierId: string;
  assessmentDate: string;
  financialStatus: {
    score: number;
    creditRating?: string;
    lastUpdated: string;
  };
  publicSentiment: {
    score: number;
    source: 'manual';
    lastUpdated: string;
    notes?: string;
  };
  productionAnomalies: {
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: 'manual';
    lastUpdated: string;
    details?: string;
  };
  legalRisks: {
    score: number;
    source: 'auto';
    lastUpdated: string;
    risks: LegalRisk[];
  };
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface LegalRisk {
  type: 'major_pledge' | 'legal_restriction' | 'lawsuit' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  source: string;
}

// Alternative Supplier
export interface AlternativeSupplier {
  supplierId: string;
  supplierName: string;
  materialCode: string;
  similarityScore: number;
  recommendationReason: string;
  comparison: {
    onTimeDeliveryRate: number;
    quality: number;
    price: number;
    responseSpeed: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  availability: boolean;
}
```

### 3. Create Services

Create service files:

**src/services/materialService.ts**:
```typescript
import { ordersData } from '../data/mockData';
import type { MainMaterialSupplier } from '../types/ontology';

export const calculateMainMaterials = (limit: number = 10): MainMaterialSupplier[] => {
  // Aggregate annual purchase amounts by material
  const materialAmounts = new Map<string, number>();
  
  ordersData.forEach(order => {
    // Calculate purchase amount (simplified - use actual calculation)
    const amount = order.quantity * 1000; // Placeholder
    // Map order to material through product
    // For now, use placeholder logic
  });
  
  // Sort and select top N
  // Return enriched MainMaterialSupplier objects
  return []; // Placeholder
};
```

**src/services/supplierService.ts**:
```typescript
import type { AlternativeSupplier, SupplierComparison } from '../types/ontology';

export const getAlternativeSuppliers = (materialCode: string): AlternativeSupplier[] => {
  // Query alternative suppliers for material
  // Calculate similarity scores
  // Return sorted list
  return [];
};

export const getSupplierComparison = (
  materialCode: string,
  currentSupplierId: string
): SupplierComparison | null => {
  // Get current supplier scorecard
  // Get alternative suppliers
  // Calculate affected orders
  // Return comparison data
  return null;
};
```

### 4. Create Components

Create component files in `src/components/supplier-evaluation/`:

- `MainMaterialSupplierPanel.tsx` - Main panel component
- `Supplier360Scorecard.tsx` - Scorecard component
- `SupplierComparisonModal.tsx` - Two-step confirmation modal
- `RiskAssessmentSection.tsx` - Risk assessment display
- `SupplierEvaluationPage.tsx` - Main page component

### 5. Integrate AI Assistant

Update `SupplyChainApp.tsx` to configure CopilotSidebar for supplier evaluation page:

```typescript
{currentView === 'evaluation' && (
  <>
    <SupplierEvaluationPage />
    <CopilotSidebar
      isOpen={copilotOpen}
      onClose={() => setCopilotOpen(false)}
      title="供应商分析智能体"
      initialMessages={[
        { 
          type: 'bot', 
          text: '欢迎使用供应商分析智能体！我可以帮您查询供应商情况、进行物料寻源分析。' 
        }
      ]}
      suggestions={[
        '供应商A最近供应情况如何？',
        '市面上与XX公司相似的SSD供应商有哪些？'
      ]}
    />
  </>
)}
```

## Testing Checklist

### Manual Testing

- [ ] Main material supplier panel displays correctly
- [ ] Materials sorted by annual purchase amount
- [ ] Top N materials displayed (configurable)
- [ ] Risk coefficient and quality events shown
- [ ] Click "切换备选供应商" opens comparison modal
- [ ] Comparison modal shows alternative suppliers
- [ ] Two-step confirmation workflow works
- [ ] Supplier 360° scorecard displays all 4 dimensions
- [ ] Risk assessment shows all risk types
- [ ] AI assistant opens with correct title and examples
- [ ] AI assistant responds to supplier situation queries
- [ ] AI assistant responds to material sourcing queries

### Performance Testing

- [ ] Main material panel loads within 2 seconds (SC-001)
- [ ] AI assistant responds within 3 seconds (SC-003)
- [ ] Supplier switch completes within 5 seconds (SC-004)

### Constitution Compliance

- [ ] All types defined in ontology.ts (P1)
- [ ] No hardcoded colors, only semantic variables (P2)
- [ ] Components under 150 lines or split appropriately (P3)
- [ ] No simulation mode (P4 - N/A)

## Common Issues & Solutions

### Issue: Main materials not calculating correctly
**Solution**: Verify annual purchase amount aggregation logic in materialService.ts

### Issue: Alternative suppliers not showing
**Solution**: Check similarity calculation algorithm in supplierService.ts

### Issue: AI assistant not responding correctly
**Solution**: Verify CopilotSidebar configuration and conversation examples

### Issue: Risk assessment data not updating
**Solution**: Check data source configuration (auto vs manual) per FR-004.1

## Next Steps

1. Implement main material calculation service
2. Create main material supplier panel component
3. Implement supplier 360° scorecard component
4. Create supplier comparison modal with two-step workflow
5. Integrate AI assistant with page-specific configuration
6. Add mock data for new entities
7. Test all user scenarios from spec.md

## References

- Specification: [spec.md](./spec.md)
- Data Model: [data-model.md](./data-model.md)
- API Contracts: [contracts/api-contracts.md](./contracts/api-contracts.md)
- Research: [research.md](./research.md)
