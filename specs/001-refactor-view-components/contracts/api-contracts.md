# API Contracts: 供应链管理视图页面组件拆分重构

**Date**: 2024-12-19  
**Feature**: Component Refactoring for Supply Chain Views  
**Status**: Complete

## Overview

This document defines the component prop interfaces and callback signatures for the refactored components. Since this is a React component refactoring (not a REST API), "API contracts" refers to TypeScript interfaces and function signatures.

## Component Prop Contracts

### Badge Component

**File**: `src/components/shared/Badge.tsx`

**Props Interface**:
```typescript
interface BadgeProps {
  type: 'critical' | 'warning' | 'success' | 'neutral' | 'info' | 'purple';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
```

**Export**: Named export `Badge`

**Usage Example**:
```typescript
import { Badge } from '@/components/shared/Badge';

<Badge type="critical" size="sm">高优先级</Badge>
```

---

### CopilotSidebar Component

**File**: `src/components/shared/CopilotSidebar.tsx`

**Props Interface**:
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

**Export**: Named export `CopilotSidebar`

**Callback Signatures**:
- `onClose(): void` - Called when sidebar close button is clicked
- `onQuery(query: string): Promise<string>` - Optional async function to handle user queries

**Usage Example**:
```typescript
import { CopilotSidebar } from '@/components/shared/CopilotSidebar';

<CopilotSidebar
  isOpen={copilotOpen}
  onClose={() => setCopilotOpen(false)}
  title="供应链智能助手"
  initialMessages={[{ type: 'bot', text: '欢迎使用供应链智能助手！' }]}
  suggestions={['查询订单状态', '分析库存风险']}
  onQuery={async (query) => { /* handle query */ }}
/>
```

---

### CockpitView Component

**File**: `src/components/views/CockpitView.tsx`

**Props Interface**:
```typescript
interface CockpitViewProps {
  onNavigate: (view: string) => void;
}
```

**Export**: Default export `CockpitView`

**Callback Signatures**:
- `onNavigate(view: string): void` - Called when user clicks navigation elements

**Usage Example**:
```typescript
import CockpitView from '@/components/views/CockpitView';

<CockpitView onNavigate={(view) => setCurrentView(view)} />
```

---

### SearchView Component

**File**: `src/components/views/SearchView.tsx`

**Props Interface**:
```typescript
interface SearchViewProps {
  // No props required
}
```

**Export**: Default export `SearchView`

**Usage Example**:
```typescript
import SearchView from '@/components/views/SearchView';

<SearchView />
```

---

### InventoryView Component

**File**: `src/components/views/InventoryView.tsx`

**Props Interface**:
```typescript
interface InventoryViewProps {
  toggleCopilot: () => void;
}
```

**Export**: Default export `InventoryView`

**Callback Signatures**:
- `toggleCopilot(): void` - Called when user clicks AI assistant button

**Usage Example**:
```typescript
import InventoryView from '@/components/views/InventoryView';

<InventoryView toggleCopilot={() => setCopilotOpen(true)} />
```

---

### DeliveryView Component

**File**: `src/components/views/DeliveryView.tsx`

**Props Interface**:
```typescript
interface DeliveryViewProps {
  toggleCopilot: () => void;
}
```

**Export**: Default export `DeliveryView`

**Callback Signatures**:
- `toggleCopilot(): void` - Called when user clicks AI assistant button

**Usage Example**:
```typescript
import DeliveryView from '@/components/views/DeliveryView';

<DeliveryView toggleCopilot={() => setCopilotOpen(true)} />
```

---

## Main App Component Contract

### SupplyChainApp Component

**File**: `src/SupplyChainApp.tsx`

**Props Interface**:
```typescript
// No props - root component
```

**State Interface**:
```typescript
type ViewType = 'cockpit' | 'search' | 'inventory' | 'optimization' | 'delivery' | 'evaluation';

interface SupplyChainAppState {
  currentView: ViewType;
  copilotOpen: boolean;
}
```

**Export**: Default export `SupplyChainApp`

---

## Type Definitions

### Message Type

**Used by**: CopilotSidebar

```typescript
type MessageType = 'user' | 'bot';

interface Message {
  type: MessageType;
  text: string;
}
```

### View Type

**Used by**: SupplyChainApp

```typescript
type ViewType = 'cockpit' | 'search' | 'inventory' | 'optimization' | 'delivery' | 'evaluation';
```

---

## Error Handling

### Component Prop Validation

- **TypeScript**: Compile-time type checking ensures correct prop types
- **Runtime**: React will warn about missing required props in development mode

### Callback Error Handling

- **onQuery**: Should handle errors internally and return error message string
- **onNavigate**: No error handling required (simple state update)
- **toggleCopilot**: No error handling required (simple state update)

---

## Import/Export Patterns

### Shared Components

```typescript
// Export pattern
export const Badge: React.FC<BadgeProps> = ({ type, children, size = 'md' }) => { /* ... */ };
export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({ /* ... */ }) => { /* ... */ };

// Import pattern
import { Badge, CopilotSidebar } from '@/components/shared/Badge';
```

### View Components

```typescript
// Export pattern
const CockpitView: React.FC<CockpitViewProps> = ({ onNavigate }) => { /* ... */ };
export default CockpitView;

// Import pattern
import CockpitView from '@/components/views/CockpitView';
```

---

## Migration Notes

### Current State

- All components are defined inline in `SupplyChainApp.tsx`
- Props are defined inline with component definitions
- No explicit prop interfaces

### Target State

- Components extracted to separate files
- Explicit prop interfaces defined
- Proper import/export statements
- TypeScript type checking enabled

### Breaking Changes

- **None**: This is a refactoring-only change
- All component interfaces remain identical
- Only file locations and import paths change

---

## Testing Contracts

### Component Testing

Each component should be tested with:
- Required props provided
- Optional props omitted (test defaults)
- Callback functions called correctly
- Edge cases (empty arrays, null values, etc.)

### Integration Testing

- Main app renders all view components correctly
- Navigation between views works
- Shared components render in all contexts
- Callbacks are invoked correctly

---

## Notes

- All contracts are TypeScript interfaces (not REST APIs)
- Contracts ensure type safety and component interoperability
- No runtime API calls - all data is mock/static
- Contracts can be extended in future if components need new props





