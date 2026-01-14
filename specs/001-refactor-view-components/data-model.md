# Data Model: 供应链管理视图页面组件拆分重构

**Date**: 2024-12-19  
**Feature**: Component Refactoring for Supply Chain Views  
**Status**: Complete

## Overview

This document defines the component prop interfaces and state types for the refactored components. All types should reference `src/types/ontology.ts` per Principle 1, or use existing types from ontology.ts.

## Component Prop Interfaces

### Badge Component

**Purpose**: Reusable badge component for displaying status indicators

**Props**:
```typescript
interface BadgeProps {
  type: 'critical' | 'warning' | 'success' | 'neutral' | 'info' | 'purple';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
```

**Relationships**:
- Used by: CockpitView, SearchView, InventoryView, DeliveryView
- No data dependencies

**Validation Rules**:
- `type` must be one of the defined string literals
- `size` defaults to 'md' if not provided

---

### CopilotSidebar Component

**Purpose**: AI assistant sidebar component for page-specific queries

**Props**:
```typescript
interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialMessages: Array<{ type: 'user' | 'bot'; text: string }>;
  suggestions: string[];
  onQuery?: (query: string) => Promise<string>;
}
```

**Relationships**:
- Used by: SupplyChainApp (main app)
- State: Internal message state managed by component

**Validation Rules**:
- `isOpen` controls sidebar visibility
- `initialMessages` array must contain valid message objects
- `onQuery` is optional - if not provided, uses default behavior

---

### CockpitView Component

**Purpose**: Supply chain dashboard view with KPIs, charts, and navigation

**Props**:
```typescript
interface CockpitViewProps {
  onNavigate: (view: string) => void;
}
```

**Relationships**:
- Used by: SupplyChainApp
- Data: Mock data defined internally (no external data dependencies for refactoring)

**State**:
- No internal state required (all data is static/mock)

**Validation Rules**:
- `onNavigate` callback must be provided

---

### SearchView Component

**Purpose**: Global search center with Data-Logic-Action analysis

**Props**:
```typescript
interface SearchViewProps {
  // No props required - component is self-contained
}
```

**Relationships**:
- Used by: SupplyChainApp
- Data: Mock search results defined internally

**State**:
- `mode`: 'list' | 'card' (view mode)
- `filter`: 'all' | 'material' | 'order' | 'supplier' | 'product' (filter type)

**Validation Rules**:
- Component manages its own state internally

---

### InventoryView Component

**Purpose**: Inventory optimization center with risk analysis

**Props**:
```typescript
interface InventoryViewProps {
  toggleCopilot: () => void;
}
```

**Relationships**:
- Used by: SupplyChainApp
- Data: Mock inventory risk data defined internally

**State**:
- No internal state required (all data is static/mock)

**Validation Rules**:
- `toggleCopilot` callback must be provided

---

### DeliveryView Component

**Purpose**: Delivery assurance center with order tracking

**Props**:
```typescript
interface DeliveryViewProps {
  toggleCopilot: () => void;
}
```

**Relationships**:
- Used by: SupplyChainApp
- Data: Mock order data defined internally

**State**:
- No internal state required (all data is static/mock)

**Validation Rules**:
- `toggleCopilot` callback must be provided

---

## Navigation State

### SupplyChainApp Navigation State

**Purpose**: Tracks current view in main application component

**Type**:
```typescript
type ViewType = 'cockpit' | 'search' | 'inventory' | 'optimization' | 'delivery' | 'evaluation';
```

**State**:
- `currentView`: ViewType (current active view)
- `copilotOpen`: boolean (AI assistant sidebar visibility)

**Relationships**:
- Controls which view component is rendered
- Passed to view components via props

**Validation Rules**:
- `currentView` must be one of the defined ViewType values
- `copilotOpen` defaults to false

---

## Type Definitions Location

### Current Status

- Component prop types are currently defined inline in SupplyChainApp.tsx
- No types need to be added to ontology.ts for this refactoring (using existing React types)

### Future Considerations

If component prop types need to be shared across multiple files or used in other contexts, they should be moved to `src/types/ontology.ts` per Principle 1.

**Example** (if needed in future):
```typescript
// In src/types/ontology.ts
export interface BadgeProps {
  type: 'critical' | 'warning' | 'success' | 'neutral' | 'info' | 'purple';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
```

## Component Dependencies

### Dependency Graph

```
SupplyChainApp
├── Badge (shared)
├── CopilotSidebar (shared)
├── CockpitView
│   └── Badge (shared)
├── SearchView
│   └── Badge (shared)
├── InventoryView
│   └── Badge (shared)
├── DeliveryView
│   └── Badge (shared)
├── SupplierEvaluationPage (existing)
└── ProductSupplyOptimizationPage (existing)
```

### Import Dependencies

- **Shared components**: Imported by multiple view components
- **View components**: Imported only by SupplyChainApp
- **Main app**: Imports all components

## Notes

- All component props use TypeScript interfaces for type safety
- Props are minimal - components are mostly self-contained
- State management is local to components (no global state needed)
- Mock data is defined internally in components (no external data service dependencies)
- Types can be moved to ontology.ts in future if needed for reuse





