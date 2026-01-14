# API Contracts: AI助手优化

**Date**: 2024-12-19  
**Feature**: AI助手优化  
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the API contracts for the AI assistant optimization feature. All contracts are TypeScript function signatures and component props.

## Core Contracts

### getCopilotConfig

**Location**: `src/utils/copilotConfig.ts`

**Signature**:
```typescript
export const getCopilotConfig = async (
  currentView: string
): Promise<Omit<CopilotSidebarProps, 'isOpen' | 'onClose'>>
```

**Description**: Returns page-specific AI assistant configuration based on current view.

**Parameters**:
- `currentView: string` - Current page view identifier ('cockpit' | 'search' | 'inventory' | 'optimization' | 'delivery' | 'evaluation')

**Returns**: Promise resolving to CopilotSidebarProps (excluding isOpen and onClose)

**Response Structure**:
```typescript
{
  title: string;                    // Page-specific assistant title
  initialMessages: CopilotMessage[]; // Default opening message(s)
  suggestions: string[];            // Exactly 2 preset questions
  onQuery?: (query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>;
}
```

**Examples**:
```typescript
// Delivery page
await getCopilotConfig('delivery');
// Returns: {
//   title: '订单交付助手',
//   initialMessages: [{ type: 'bot', text: '我是您的订单交付助手...' }],
//   suggestions: ['黑龙江农垦的订单到哪了？', '哪些订单有延期风险？'],
//   onQuery: handleDeliveryQuery
// }

// Inventory page
await getCopilotConfig('inventory');
// Returns: {
//   title: '库存优化助手',
//   initialMessages: [{ type: 'bot', text: '我是您的库存优化助手...' }],
//   suggestions: ['哪些产品库存不足？', '呆滞库存有哪些？'],
//   onQuery: handleInventoryQuery
// }
```

**Error Handling**: Returns default configuration if view not recognized.

---

### useHeaderHeight

**Location**: `src/hooks/useHeaderHeight.ts` (new file)

**Signature**:
```typescript
export const useHeaderHeight = (
  headerRef: RefObject<HTMLElement>
): number
```

**Description**: Custom React hook that calculates and returns header element height dynamically.

**Parameters**:
- `headerRef: RefObject<HTMLElement>` - React ref to header element

**Returns**: Current header height in pixels (number)

**Behavior**:
- Calculates height on mount
- Recalculates on window resize
- Returns 0 if ref not attached

**Example**:
```typescript
const headerRef = useRef<HTMLDivElement>(null);
const headerHeight = useHeaderHeight(headerRef);

// Use in JSX
<CopilotSidebar topOffset={headerHeight} ... />
```

**Performance**: O(1) calculation, runs on mount and resize events only.

---

### Query Handler Functions

**Location**: `src/utils/copilotConfig.ts` (within `getCopilotConfig`)

**Signature**:
```typescript
(query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>
```

**Description**: Page-specific query handler functions that process user queries and return structured responses.

**Parameters**:
- `query: string` - User's query text

**Returns**: Promise resolving to either:
- Simple string response, OR
- Object with `text` and optional `richContent`

**Response Format**:
```typescript
// Simple response
"查询到订单 SO-20231105。目前卡在【采购环节】，原因是"液压阀缺货"。预计延期 7天，无法按原定 11-13 交付。建议联系采购部催货。"

// Rich content response (if needed)
{
  text: "基于您的需求，为您生成推荐 BOM 配置：",
  richContent: {
    type: 'bom_recommendation',
    data: [...],
    totalCost: '¥ 18,500',
    optimization: '...'
  }
}
```

**Query Patterns** (per page):

#### Product Supply Optimization Page (`handleProductSupplyEvaluationQuery`)
- Pattern: `query.includes('T22') && (query.includes('物料配置') || query.includes('BOM'))`
  - If query contains placeholders (XXXX): Prompts user to input specific requirements
  - If query contains requirements: Generates detailed BOM configuration analysis
  - References: T22 product data, materials from mockData
- Pattern: `query.includes('硬盘') && (query.includes('涨价') || query.includes('影响'))`
  - Analyzes impact of hard drive price increase on existing products
  - References: Hard drive material data, products using hard drive from mockData
  - Returns: Impact analysis and response recommendations
- Fallback: Guidance message with preset question suggestions

#### Delivery Page (`handleOrderSupplyQuery`)
- Pattern: `query.includes('订单') && (query.includes('到哪') || query.includes('环节')) && query.includes('客户名')`
  - Extracts customer name from query (e.g., "黑龙江农垦" → "黑龙江农垦总局")
  - Finds matching orders from mockData
  - Returns: Order status, current stage, delivery feasibility, recommendations
- Pattern: `query.includes('延期') || query.includes('风险')`
  - Identifies orders with delay risk from mockData
  - Returns: List of at-risk orders with reasons and recommendations
- Fallback: Guidance message

#### Inventory Page (`handleInventoryQuery`)
- Pattern: `query.includes('产品名') && (query.includes('库存') || query.includes('订单量'))`
  - Extracts product name from query (e.g., "T20", "植保无人机T20")
  - Finds matching product from mockData
  - Returns: Inventory status, order quantity, optimization suggestions
- Pattern: `query.includes('物料名') && query.includes('库存')`
  - Uses fuzzy matching for material names (e.g., "北斗定位模块" → ["GPS定位器", "北斗接收模块"])
  - Finds matching materials from mockData
  - Returns: Inventory status for matched materials, optimization suggestions
- Fallback: Guidance message

#### Supplier Evaluation Page (`handleSupplierQuery`)
- Pattern: `query.includes('供应商名') && (query.includes('情况') || query.includes('如何'))`
  - Extracts supplier name from query (e.g., "北斗科技电子元件有限公司")
  - Finds matching supplier from mockData
  - Returns: Supply status, quality rating, risk assessment, recommendations
- Pattern: `query.includes('相似') && query.includes('供应商') && query.includes('物料类型')`
  - Extracts material type from query (e.g., "SSD")
  - Finds similar suppliers based on material type and business characteristics
  - References: SSD material and supplier data from mockData
  - Returns: Similar supplier recommendations with similarity scores
- Fallback: Guidance message

#### Other Pages
- Similar pattern matching approach
- Each page has 2-3 query patterns
- Fallback to guidance message

**Error Handling**: Returns guidance message if query doesn't match any pattern.

---

### CopilotSidebar Component Props

**Location**: `src/components/shared/CopilotSidebar.tsx`

**Signature**:
```typescript
export interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialMessages: CopilotMessage[];
  suggestions: string[];
  onQuery?: (query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>;
  topOffset?: number;  // NEW: Dynamic top offset
}
```

**Description**: Props for CopilotSidebar component, extended with `topOffset` for dynamic positioning.

**Props**:
- `isOpen: boolean` - Whether sidebar is visible
- `onClose: () => void` - Close handler
- `title: string` - Assistant title
- `initialMessages: CopilotMessage[]` - Initial conversation messages
- `suggestions: string[]` - Preset questions (exactly 2)
- `onQuery?: ...` - Query handler function
- `topOffset?: number` - **NEW**: Top offset in pixels (defaults to 0 if not provided)

**Usage**:
```typescript
<CopilotSidebar
  isOpen={copilotOpen}
  onClose={() => setCopilotOpen(false)}
  topOffset={headerHeight}
  {...copilotProps}
/>
```

**Styling**: When `topOffset` is provided, sidebar uses `top: ${topOffset}px` instead of `top: 0`.

---

## Data Types

### CopilotMessage

```typescript
export interface CopilotMessage {
  type: 'user' | 'bot';
  text: string;
  richContent?: CopilotRichContent;
}
```

### CopilotRichContent

```typescript
export interface CopilotRichContent {
  type: 'bom_recommendation';
  data: BOMRecommendationComponent[];
  totalCost: string;
  optimization: string;
}
```

### toggleCopilot Function

**Location**: `src/SupplyChainApp.tsx` (passed as prop to view components)

**Signature**:
```typescript
const toggleCopilot = () => void
```

**Description**: Function to toggle CopilotSidebar open/close state. Passed to all view components for chat bubble button interaction.

**Usage**:
```typescript
// In SupplyChainApp.tsx
const [copilotOpen, setCopilotOpen] = useState(false);
const toggleCopilot = () => setCopilotOpen(!copilotOpen);

// Pass to view components
<CockpitView toggleCopilot={() => setCopilotOpen(true)} />
```

**Behavior**:
- Opens sidebar when called
- Typically used with `setCopilotOpen(true)` to open sidebar
- Chat bubble button calls this function on click

---

### Chat Bubble Button Component

**Location**: Each view component (CockpitView, SearchView, InventoryView, etc.)

**Signature**:
```typescript
<button 
  onClick={toggleCopilot} 
  className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
>
  <MessageSquare size={24}/>
</button>
```

**Description**: Floating chat bubble button that triggers AI assistant sidebar. Consistent styling across all pages.

**Props**:
- `onClick: () => void` - Handler function (typically `toggleCopilot`)

**Styling Requirements**:
- Position: Fixed at `bottom-8 right-8`
- Background: Gradient from `indigo-600` to `purple-600`
- Icon: `MessageSquare` from Lucide React (24px)
- Hover: Scale 110%
- Z-index: 40 (below sidebar z-50)
- Shape: Rounded full circle
- Shadow: Large shadow (`shadow-lg`)

**Required On**: All 6 pages (cockpit, search, inventory, optimization, delivery, evaluation)

---

## Integration Points

### SupplyChainApp Integration

```typescript
// Header ref
const headerRef = useRef<HTMLDivElement>(null);
const headerHeight = useHeaderHeight(headerRef);

// Copilot state
const [copilotOpen, setCopilotOpen] = useState(false);

// Copilot config
useEffect(() => {
  getCopilotConfig(currentView).then(setCopilotProps);
}, [currentView]);

// Render - NO header button
<div className="header">
  {/* AI assistant button REMOVED */}
</div>

// Render views with toggleCopilot prop
<CockpitView toggleCopilot={() => setCopilotOpen(true)} />
<SearchView toggleCopilot={() => setCopilotOpen(true)} />
{/* ... other views */}

// Render sidebar
<CopilotSidebar
  isOpen={copilotOpen}
  onClose={() => setCopilotOpen(false)}
  topOffset={headerHeight}
  {...copilotProps}
/>
```

### View Component Integration

```typescript
// In each view component (e.g., CockpitView.tsx)
import { MessageSquare } from 'lucide-react';

const CockpitView = ({ toggleCopilot }: { toggleCopilot: () => void }) => {
  return (
    <div>
      {/* ... page content */}
      
      {/* Floating chat bubble button */}
      <button 
        onClick={toggleCopilot} 
        className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
      >
        <MessageSquare size={24}/>
      </button>
    </div>
  );
};
```

### fuzzyMatchMaterialName

**Location**: `src/utils/copilotConfig.ts` or `src/utils/fuzzyMatch.ts`

**Signature**:
```typescript
export const fuzzyMatchMaterialName = (
  query: string,
  materials: Material[]
): Material[]
```

**Description**: Matches material name variations in user queries to actual material names in mockData.

**Parameters**:
- `query: string` - User query string containing material name (e.g., "北斗定位模块")
- `materials: Material[]` - Array of materials from mockData to search

**Returns**: Array of matching Material objects

**Behavior**:
- Checks if query matches material names directly (case-insensitive)
- Checks against predefined alias mappings
- Returns all matching materials (can be multiple)

**Alias Mappings**:
```typescript
const aliases: Record<string, string[]> = {
  '北斗定位模块': ['GPS定位器', '北斗接收模块', 'RTK定位板'],
  // Additional aliases can be added
};
```

**Examples**:
```typescript
// Input: "北斗定位模块"
// Output: [
//   { materialCode: 'MAT-002', materialName: 'GPS定位器', ... },
//   { materialCode: 'MAT-007', materialName: '北斗接收模块', ... }
// ]

// Input: "GPS定位器"
// Output: [
//   { materialCode: 'MAT-002', materialName: 'GPS定位器', ... }
// ]
```

**Performance**: O(n) where n is number of materials, acceptable for small datasets.

---

### getPresetAnswer

**Location**: `src/utils/presetAnswers.ts` or `src/data/mockData.ts`

**Signature**:
```typescript
export const getPresetAnswer = (
  presetQuestionId: string,
  context?: QueryContext
): string | { text: string; richContent?: CopilotRichContent }
```

**Description**: Returns mock data-based preset answer for demonstration purposes.

**Parameters**:
- `presetQuestionId: string` - Identifier for preset question (e.g., 'product-supply-t22-bom')
- `context?: QueryContext` - Optional context with user input, products, materials, etc.

**Returns**: Preset answer string or rich content object

**QueryContext Structure**:
```typescript
interface QueryContext {
  products?: Product[];
  materials?: Material[];
  suppliers?: Supplier[];
  orders?: Order[];
  userInput?: Record<string, string>; // For placeholder-filled queries
}
```

**Examples**:
```typescript
// T22 BOM configuration
getPresetAnswer('product-supply-t22-bom', {
  products: [t22Product],
  materials: t22Materials,
  userInput: {
    performance: '载重50KG',
    functionality: '支持RTK定位',
    specs: '续航2小时'
  }
});
// Returns: Detailed BOM analysis with materials, costs, optimization suggestions

// Order status
getPresetAnswer('delivery-order-status', {
  orders: [order],
  userInput: { customerName: '黑龙江农垦总局' }
});
// Returns: Order status, current stage, delivery feasibility
```

**Validation Rules**:
- All product names, supplier names, material names must come from mockData
- No hardcoded strings, all data references mockData
- Answers must be realistic and detailed for demonstration

---

## Versioning

- **v1.0**: Initial implementation with dynamic positioning and page-specific assistants
- **v1.1**: Added floating chat bubble button on all pages, removed header AI button
- **v1.2**: Added targeted AI assistants (product supply evaluation, order supply, inventory, supplier) with fuzzy matching and preset answers
- Future: Query history persistence, analytics, multi-language support

