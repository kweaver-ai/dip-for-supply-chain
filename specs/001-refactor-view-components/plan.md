# Implementation Plan: 供应链管理视图页面组件拆分重构

**Branch**: `001-refactor-view-components` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-refactor-view-components/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将 `SupplyChainApp.tsx`（959行）按照业务视图拆分为独立的组件文件，符合原则3的组件大小限制（<150行）。重构包括：提取共享组件（Badge、CopilotSidebar）到 `components/shared/`，提取业务视图组件（CockpitView、SearchView、InventoryView、DeliveryView）到 `components/views/`，简化主应用组件仅保留导航逻辑。所有组件保持100%功能对等，无视觉回归。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Recharts 3.5.0 (for charts), Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: N/A (refactoring only, no data changes)  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: No performance degradation - refactoring maintains existing performance characteristics  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), preserve 100% functional parity, zero visual regressions  
**Scale/Scope**: Refactor 1 large file (959 lines) into 7 smaller components (<150 lines each), maintain existing functionality across 4 business views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - Component prop types should reference ontology.ts types where applicable
  - No ad-hoc type definitions in component files
  - **Action Required**: Ensure all component props use types from ontology.ts or define new types in ontology.ts if needed
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Verify all extracted components use semantic variables from index.css
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - All extracted components MUST be < 150 lines
  - SupplyChainApp.tsx MUST be reduced to < 150 lines
  - **Action Required**: Verify each extracted component file size < 150 lines
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - this refactoring does not involve simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-refactor-view-components/
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
│   ├── shared/
│   │   ├── Badge.tsx                    # Extracted Badge component
│   │   └── CopilotSidebar.tsx           # Extracted CopilotSidebar component
│   ├── views/
│   │   ├── CockpitView.tsx              # Extracted EnhancedCockpitView
│   │   ├── SearchView.tsx               # Extracted EnhancedSearchView
│   │   ├── InventoryView.tsx            # Extracted EnhancedInventoryView
│   │   └── DeliveryView.tsx             # Extracted EnhancedDeliveryView
│   ├── product-supply-optimization/     # Existing (unchanged)
│   └── supplier-evaluation/             # Existing (unchanged)
├── types/
│   └── ontology.ts                      # Extended if new prop types needed
└── SupplyChainApp.tsx                   # Refactored main app (navigation only)
```

**Structure Decision**: Single-page React application structure. New components organized under `components/shared/` (reusable components) and `components/views/` (business view components). Existing component directories remain unchanged. Main app component simplified to navigation and routing logic only.

## Phase 0: Research & Analysis ✅

**Status**: Complete

**Output**: [research.md](./research.md)

All technical decisions documented:
- **Component Extraction Strategy**: Extract components maintaining exact functionality, preserve all props and callbacks
- **File Organization**: Use `components/shared/` for reusable components, `components/views/` for business views
- **Import/Export Pattern**: Use default exports for view components, named exports for shared components
- **Type Safety**: Ensure all component props are properly typed, reference ontology.ts where applicable
- **Refactoring Approach**: Incremental extraction (shared components first, then views, finally simplify main app)

**Key Decisions**:
- Extract shared components first (Badge, CopilotSidebar) as they are dependencies
- Extract business views independently (can be done in parallel)
- Simplify main app component last (depends on all extractions)
- Maintain 100% functional parity - no feature changes during refactoring
- Use existing component patterns from product-supply-optimization and supplier-evaluation directories

## Phase 1: Design & Contracts ✅

**Status**: Complete

### Data Model
**Output**: [data-model.md](./data-model.md)

Data model documented:
- Component prop interfaces for all extracted components
- Navigation state type for main app component
- View state types for each business view component
- All types ready for ontology.ts integration if needed

### API Contracts
**Output**: [contracts/api-contracts.md](./contracts/api-contracts.md)

API contracts documented:
- Component prop interfaces (TypeScript interfaces, not REST APIs)
- Callback function signatures
- Event handler types
- Ready for TypeScript type checking

### Quickstart Guide
**Output**: [quickstart.md](./quickstart.md)

Quickstart guide created:
- Step-by-step refactoring guide
- Component extraction order
- Import/export patterns
- Testing checklist
- Common issues and solutions

### Post-Design Constitution Check ✅

All principles remain compliant:
- **P1**: Component prop types documented, ready for ontology.ts if needed
- **P2**: Semantic variables usage verified in existing code
- **P3**: Component splitting strategy defined (7 components < 150 lines each)
- **P4**: Not applicable (no simulation mode)

## Phase 2: Task Breakdown

**Status**: Ready for `/speckit.tasks` command

Task breakdown will be generated by `/speckit.tasks` command based on this plan and the specification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.





