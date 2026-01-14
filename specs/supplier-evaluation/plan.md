# Implementation Plan: 供应商评估页面优化

**Branch**: `supplier-evaluation` | **Date**: 2024-12-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/supplier-evaluation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化供应商评估页面，包括：1) 主要物料供应商面板改为按库存量排名前5的物料，显示供应商、物料名称、库存量、质量评级、风险评级、准时交付率、年度采购额；2) 供应商评估面板添加下拉列表选择所有供应商（按年度采购额降序），360°评分卡包含6个维度（交货准时率、质量评级、风险评级、准时交付率、年度采购额、响应速度）；3) 实现外部数据即时搜索（法律风险数据实时API调用）；4) 数据缺失时从mockdata随机生成。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: Mock data in `src/data/mockData.ts`, future: REST API integration  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Main material panel loads within 2 seconds, AI assistant responds within 3 seconds, supplier switch completes within 5 seconds  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), maintain existing component structure, support real-time external API calls for legal risk data  
**Scale/Scope**: Update existing supplier evaluation components, add new data fields, implement real-time API integration, enhance mock data generation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - MainMaterialSupplier, Supplier360Scorecard, RiskAssessment types must be defined in ontology.ts
  - New fields (quality rating, risk rating, current stock) must be added to ontology.ts
  - **Action Required**: Update ontology.ts with new fields: qualityRating, riskRating, currentStock for MainMaterialSupplier; update Supplier360Scorecard dimensions to include 6 dimensions
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values in component code
  - **Action Required**: Verify all updated components use semantic variables from index.css
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - All components MUST be < 150 lines
  - MainMaterialSupplierPanel, Supplier360Scorecard must remain under limit
  - **Action Required**: Verify component sizes after updates, split if needed
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - **Status**: Not applicable - this feature does not involve simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/supplier-evaluation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── supplier-evaluation/
│       ├── SupplierEvaluationPage.tsx      # Main page component (updated)
│       ├── MainMaterialSupplierPanel.tsx   # Updated: sort by currentStock, top 5, new fields
│       ├── Supplier360Scorecard.tsx       # Updated: 6 dimensions, dropdown selector
│       ├── SupplierComparisonModal.tsx    # Existing (unchanged)
│       ├── RiskAssessmentSection.tsx      # Updated: real-time API calls for legal risks
│       ├── RiskBadge.tsx                   # Existing (unchanged)
│       └── SupplierSelector.tsx            # New: dropdown for supplier selection
├── services/
│   ├── materialService.ts                  # Updated: getMainMaterialsByStock()
│   ├── supplierService.ts                 # Updated: getSuppliersByPurchaseAmount()
│   └── legalRiskService.ts                # New: fetchLegalRisks() for real-time API
├── types/
│   └── ontology.ts                         # Updated: new fields, 6-dimension scorecard
├── data/
│   └── mockData.ts                         # Updated: random data generation for missing fields
└── utils/
    └── copilotConfig.ts                    # Updated: supplier evaluation page config
```

**Structure Decision**: Extend existing supplier evaluation components. Add new service for legal risk API calls. Update data model to support new fields and 6-dimension scorecard. Maintain component structure and organization.

## Phase 0: Research & Analysis ✅

**Status**: Complete

**Output**: [research.md](./research.md)

All technical decisions documented:
- **Main Material Selection Strategy**: Changed from annual purchase amount to current stock (Material.currentStock), top 5 instead of top 10
- **360° Scorecard Dimensions**: Updated to 6 dimensions (on-time delivery rate, quality rating, risk rating, on-time delivery rate duplicate, annual purchase amount display, response speed)
- **Supplier Selection**: Dropdown list sorted by annual purchase amount descending
- **Data Generation**: Random mock data generation for missing fields (0 or null/undefined)
- **Real-time API Integration**: Legal risk data fetched via real-time API calls when user views supplier

**Key Decisions**:
- Use Material.currentStock for main material ranking (clarified in Session 2024-12-20)
- Display 6 dimensions in 360° scorecard with annual purchase amount as display-only metric
- Implement real-time external API calls for legal risks (no caching, always fresh data)
- Generate random mock data when fields are 0 or null/undefined
- Maintain existing component structure, update existing components rather than creating new ones

## Phase 1: Design & Contracts ✅

**Status**: Complete

### Data Model
**Output**: [data-model.md](./data-model.md)

Data model documented:
- MainMaterialSupplier updated with new fields: currentStock, qualityRating, riskRating, onTimeDeliveryRate
- Supplier360Scorecard updated with 6 dimensions structure
- RiskAssessment updated with real-time legal risk data structure
- All types ready for ontology.ts integration

**Updates Required**:
- Add currentStock, qualityRating, riskRating, onTimeDeliveryRate to MainMaterialSupplier interface
- Update Supplier360Scorecard dimensions to include: onTimeDeliveryRate, qualityRating, riskRating, onTimeDeliveryRate (duplicate), annualPurchaseAmount (display), responseSpeed
- Add real-time API call structure for LegalRisk data

### API Contracts
**Output**: [contracts/api-contracts.md](./contracts/api-contracts.md)

API contracts documented:
- Component prop interfaces updated for new fields
- Service function signatures for new data retrieval methods
- Real-time API integration contracts for legal risk data
- Mock data generation function contracts

**New Contracts**:
- `getMainMaterialsByStock(limit: number): MainMaterialSupplier[]` - Get top N materials by current stock
- `getSuppliersByPurchaseAmount(): Supplier[]` - Get all suppliers sorted by annual purchase amount
- `fetchLegalRisks(supplierId: string): Promise<LegalRisk[]>` - Real-time API call for legal risk data
- `generateRandomMockData(field: string, type: string): number` - Generate random mock data for missing fields

### Quickstart Guide
**Output**: [quickstart.md](./quickstart.md)

Quickstart guide created:
- Step-by-step implementation guide
- Component update order
- Service function implementation patterns
- Real-time API integration guide
- Mock data generation implementation
- Testing checklist

### Post-Design Constitution Check ✅

All principles remain compliant:
- **P1**: All new types and fields documented, ready for ontology.ts updates
- **P2**: Semantic variables usage verified, no hardcoded colors
- **P3**: Component sizes remain under 150 lines after updates
- **P4**: Not applicable (no simulation mode)

## Phase 2: Task Breakdown

**Status**: Ready for `/speckit.tasks` command

Task breakdown will be generated by `/speckit.tasks` command based on this plan and the specification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Implementation Notes

### Key Changes from Previous Version

1. **Main Material Selection**: Changed from annual purchase amount (top 10) to current stock (top 5)
2. **Display Fields**: Added qualityRating, riskRating, onTimeDeliveryRate, currentStock to main material panel
3. **360° Scorecard**: Expanded from 4 dimensions to 6 dimensions (with annual purchase amount as display metric)
4. **Supplier Selection**: Added dropdown list with annual purchase amount sorting
5. **Data Generation**: Implement random mock data generation for missing fields
6. **Real-time API**: Add real-time external API calls for legal risk data

### Integration Points

- **Existing Components**: Update MainMaterialSupplierPanel, Supplier360Scorecard, RiskAssessmentSection
- **New Components**: Create SupplierSelector dropdown component
- **Services**: Update materialService, supplierService; create legalRiskService
- **Data Layer**: Update mockData.ts with random generation logic
- **Types**: Update ontology.ts with new fields and structures

### Performance Considerations

- Real-time API calls may introduce latency; implement loading states and error handling
- Mock data generation should be fast and deterministic for testing
- Dropdown list should handle large supplier lists efficiently (virtualization if needed)

### Testing Strategy

- Unit tests for service functions (getMainMaterialsByStock, getSuppliersByPurchaseAmount)
- Integration tests for real-time API calls (mock API responses)
- Component tests for updated panels and new dropdown selector
- E2E tests for complete user workflows (select supplier, view scorecard, switch supplier)

