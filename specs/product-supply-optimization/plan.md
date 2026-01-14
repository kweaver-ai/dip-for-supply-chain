# Implementation Plan: 产品供应优化页面

**Branch**: `product-supply-optimization` | **Date**: 2024-12-19 | **Updated**: 2025-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/product-supply-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

产品供应优化页面提供产品供应的全面分析和优化建议，包括产品供应分析面板、需求预测面板、优化建议面板和风险预警面板，采用多面板上下排列布局。需求预测基于历史订单数据使用移动平均算法，库存优化建议包含补货建议、清库存建议和安全库存调整，优先级分为高/中/低。AI助手复用现有CopilotSidebar组件，配置页面专属对话示例和上下文。

**新增功能（2025-01-29）**：产品供应分析面板增强，包括产品基本信息（产品名称、生命周期、ROI）、产品库存信息（库存数量、待交付订单量）、产品建议动作（基于条件的促销和市场销售提醒按钮）。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Recharts 3.5.0 (for charts), Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: In-memory mock data (src/data/mockData.ts), future: backend API integration  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Product supply analysis panel loads < 2 seconds (SC-001), demand forecast calculations complete < 3 seconds (SC-002), AI assistant responds < 3 seconds (SC-003)  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), integrate with existing navigation and CopilotSidebar  
**Scale/Scope**: Multiple products analysis, demand forecast for future periods (30/60/90 days), optimization suggestions with priority levels, risk alerts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - New types MUST be defined in or extend from `src/types/ontology.ts`
  - No ad-hoc type definitions in component files
  - **Action Required**: Add ProductSupplyAnalysis, DemandForecast, OptimizationSuggestion, SupplyRiskAlert types to ontology.ts
  - **Note**: Product, ProductLifecycleAssessment, Order, ActionHistory types already exist in ontology.ts
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Use existing semantic variables from index.css
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - Large components identified and refactoring plan documented
  - **Action Required**: ProductSupplyOptimizationPage should be split if exceeding 150 lines:
    - ProductSupplyAnalysisPanel (analysis metrics + product info + inventory info + suggested actions)
    - DemandForecastPanel (forecast chart and data)
    - OptimizationSuggestionsPanel (suggestions list)
    - RiskAlertsPanel (risk alerts display)
  - **Note**: ProductSupplyAnalysisPanel may need sub-components if it exceeds 150 lines after enhancements
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - this feature does not include simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/product-supply-optimization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── product-supply-optimization/
│   │   ├── ProductSupplyAnalysisPanel.tsx    # Product supply analysis panel (enhanced with product info, inventory info, suggested actions)
│   │   ├── DemandForecastPanel.tsx            # Demand forecast panel
│   │   ├── OptimizationSuggestionsPanel.tsx   # Optimization suggestions panel
│   │   ├── RiskAlertsPanel.tsx                # Risk alerts panel
│   │   └── ProductSupplyOptimizationPage.tsx  # Main page component
│   └── shared/
│       └── CopilotSidebar.tsx                 # Existing AI assistant (reused)
├── services/
│   ├── productSupplyService.ts                # Product supply analysis logic
│   ├── demandForecastService.ts               # Demand forecast calculation (moving average)
│   └── optimizationService.ts                 # Optimization suggestions logic
├── utils/
│   └── entityConfigService.ts                 # Action execution and ActionHistory recording (existing)
├── types/
│   └── ontology.ts                            # Extended with new entity types (Product, ProductLifecycleAssessment, Order, ActionHistory already exist)
├── data/
│   └── mockData.ts                            # Extended with new mock data
└── SupplyChainApp.tsx                         # Updated with new optimization page
```

**Structure Decision**: Single-page React application structure. New components organized under `components/product-supply-optimization/` directory. Services handle business logic (supply analysis, demand forecast, optimization suggestions). Types extended in ontology.ts per Principle 1. AI assistant reuses existing CopilotSidebar with page-specific configuration.

## Phase 0: Research & Analysis ✅

**Status**: Complete

**Output**: [research.md](./research.md)

All technical decisions documented:
- **Product Supply Analysis**: Aggregate metrics from orders, suppliers, and inventory data
- **Demand Forecast**: Moving average algorithm based on historical order quantities
- **Optimization Suggestions**: Rule-based suggestions with priority levels
- **Risk Alerts**: Risk detection based on inventory levels, supplier status, and forecast
- **AI Assistant**: Reuse CopilotSidebar with page-specific configuration
- **Page Layout**: Multiple panels arranged vertically

**Key Decisions**:
- Moving average algorithm for demand forecast (simple, effective)
- Priority-based optimization suggestions (high/medium/low)
- Multi-panel vertical layout for comprehensive view
- Component reuse for AI assistant
- Service layer separation for business logic
- Product information display in panel content (not in title)
- ROI data from ProductLifecycleAssessment entity
- Pending order quantity calculation from Order status
- Action buttons with ActionHistory recording
- Product lifecycle from Product.status field

## Phase 1: Design & Contracts ✅

**Status**: Complete

### Data Model
**Output**: [data-model.md](./data-model.md)

Data model documented:
- ProductSupplyAnalysis entity with comprehensive metrics
- DemandForecast entity with period-based predictions
- OptimizationSuggestion entity with type and priority
- SupplyRiskAlert entity with severity and description
- All types ready for ontology.ts integration

### API Contracts
**Output**: [contracts/api-contracts.md](./contracts/api-contracts.md)

API contracts documented:
- Product supply analysis endpoints
- Demand forecast calculation endpoints
- Optimization suggestions endpoints
- Risk alerts endpoints
- Request/response schemas specified
- Error handling defined
- Ready for future backend integration

### Quickstart Guide
**Output**: [quickstart.md](./quickstart.md)

Quickstart guide created:
- Step-by-step implementation guide
- Code examples for types, services, components
- AI assistant integration instructions
- Testing checklist
- Common issues and solutions

### Post-Design Constitution Check ✅

All principles remain compliant:
- **P1**: Types defined, ready for ontology.ts (Product, ProductLifecycleAssessment, Order, ActionHistory already exist)
- **P2**: Semantic variables usage documented
- **P3**: Component splitting strategy defined (5 components < 150 lines each, ProductSupplyAnalysisPanel may need sub-components)
- **P4**: Not applicable (no simulation mode)

**Enhancement Notes (2025-01-29)**:
- ProductSupplyAnalysisPanel enhancements (FR-001.1 to FR-001.5) use existing types from ontology.ts
- Action execution reuses existing entityConfigService.ts (executeAction function)
- No new types required, only new UI sections and conditional logic

## Phase 2: Task Breakdown

**Status**: Ready for `/speckit.tasks` command

Task breakdown will be generated by `/speckit.tasks` command based on this plan and the specification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

