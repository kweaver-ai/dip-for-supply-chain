# Data Model: AI助手优化

**Date**: 2024-12-19  
**Feature**: AI助手优化  
**Phase**: Phase 1 - Design & Contracts

## Entities

### CopilotSidebarProps (Extended)

**Location**: `src/components/shared/CopilotSidebar.tsx`

**Description**: Props interface for CopilotSidebar component, extended with optional `topOffset` prop for dynamic positioning.

**Fields**:
- `isOpen: boolean` - Whether sidebar is visible
- `onClose: () => void` - Close handler function
- `title: string` - Assistant title (page-specific)
- `initialMessages: CopilotMessage[]` - Initial conversation messages (page-specific)
- `suggestions: string[]` - Preset question suggestions (exactly 2 per page)
- `onQuery?: (query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>` - Query handler function (page-specific)
- `topOffset?: number` - **NEW**: Dynamic top offset in pixels (calculated from header height)

**Relationships**:
- Used by: `SupplyChainApp` component
- Extends: Existing `CopilotSidebarProps` interface

**Validation Rules**:
- `suggestions.length === 2` (per FR-004)
- `topOffset >= 0` (if provided)
- `initialMessages.length >= 1` (must have at least opening message)

### PageAssistantConfig

**Location**: `src/utils/copilotConfig.ts` (implicit, returned by `getCopilotConfig`)

**Description**: Configuration object for page-specific AI assistant.

**Fields**:
- `title: string` - Assistant title (e.g., "订单交付助手")
- `initialMessages: CopilotMessage[]` - Default opening message(s)
- `suggestions: string[]` - Exactly 2 preset questions
- `onQuery: (query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>` - Query handler function

**Relationships**:
- Created by: `getCopilotConfig(view: string)` function
- Used by: `SupplyChainApp` component

**Validation Rules**:
- `suggestions.length === 2` (per FR-004)
- `initialMessages.length >= 1`

### CopilotMessage (Existing)

**Location**: `src/components/shared/CopilotSidebar.tsx`

**Description**: Message object in conversation history.

**Fields**:
- `type: 'user' | 'bot'` - Message sender type
- `text: string` - Message text content
- `richContent?: CopilotRichContent` - Optional rich content (tables, cards, etc.)

**State Transitions**:
- Created when user sends message or bot responds
- Reset when page switches (per FR-007)

### QueryHandler Function Type

**Location**: `src/utils/copilotConfig.ts`

**Description**: Function type for processing user queries and returning responses.

**Signature**:
```typescript
(query: string) => Promise<string | { text: string; richContent?: CopilotRichContent }>
```

**Behavior**:
- Processes user query string
- Matches against preset patterns (e.g., order queries, inventory queries)
- Returns structured text response or rich content
- Falls back to guidance message if no pattern matches (per FR-008)

**Examples**:
- Order delivery: "黑龙江农垦的订单到哪了？" → Structured response about order SO-20231105
- Inventory: "哪些产品库存不足？" → List of products with low stock
- Default: "抱歉，我暂时无法理解..." → Guidance message with preset question suggestions

## State Management

### Conversation History

**Location**: `CopilotSidebar` component internal state

**State**: `messages: CopilotMessage[]`

**Lifecycle**:
1. Initialize with `initialMessages` prop
2. Update when user sends message or bot responds
3. Reset when `initialMessages` prop changes (page switch)

**Reset Trigger**: `useEffect` dependency on `initialMessages` prop

### Header Height

**Location**: `useHeaderHeight` hook

**State**: `height: number`

**Lifecycle**:
1. Initialize to 0
2. Calculate on mount using ref
3. Recalculate on window resize
4. Return current height value

## Data Flow

```
SupplyChainApp
  ├─> useHeaderHeight(headerRef) → height: number
  ├─> getCopilotConfig(currentView) → PageAssistantConfig
  ├─> Pass toggleCopilot to all view components
  └─> CopilotSidebar
       ├─> topOffset={height}
       ├─> initialMessages={config.initialMessages}
       ├─> suggestions={config.suggestions}
       └─> onQuery={config.onQuery}
            └─> Process query → Response
                 └─> Update messages state

View Components (CockpitView, SearchView, etc.)
  └─> ChatBubbleButton
       └─> onClick={toggleCopilot}
            └─> Triggers CopilotSidebar open/close
```

## Constraints

- Each page must have exactly 2 preset questions (FR-004)
- Conversation history resets on page switch (FR-007)
- Query handlers must return structured responses for preset questions (FR-005)
- Unmatched queries must return guidance messages (FR-008)
- All pages must have floating chat bubble button (FR-009)
- Header must not contain AI assistant button (FR-010)
- All view components must accept toggleCopilot prop (FR-011)

### ChatBubbleButton (New)

**Location**: Each view component (CockpitView, SearchView, InventoryView, etc.)

**Description**: Floating chat bubble button that triggers AI assistant sidebar.

**Props**:
- `onClick: () => void` - Handler function to toggle copilot sidebar (typically `toggleCopilot`)

**Styling**:
- Fixed position: `bottom-8 right-8`
- Background: Gradient from indigo-600 to purple-600
- Icon: MessageSquare (24px)
- Hover effect: Scale 110%
- Z-index: 40 (below sidebar z-50)

**Relationships**:
- Used by: All view components (cockpit, search, inventory, optimization, delivery, evaluation)
- Triggers: CopilotSidebar component via toggleCopilot function

**Validation Rules**:
- Must be present on all 6 pages
- Must match delivery page styling exactly
- Must have z-index lower than CopilotSidebar (z-50)

### ProductSupplyAnalysisPanel (Extended)

**Location**: `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`

**Description**: Enhanced panel that integrates product selection, AI suggestions, and demand forecast cards.

**Fields** (Extended):
- `analysis: ProductSupplyAnalysis | null` - Existing analysis data
- `loading?: boolean` - Existing loading state
- `products: ProductSupplyAnalysis[]` - **NEW**: All available products for selection
- `selectedProductId: string | null` - **NEW**: Currently selected product ID
- `onProductSelect: (productId: string) => void` - **NEW**: Product selection handler
- `searchQuery: string` - **NEW**: Product name search query
- `onSearchChange: (query: string) => void` - **NEW**: Search query change handler
- `aiSuggestions: string[]` - **NEW**: AI-generated suggestions for product optimization
- `demandForecasts: Map<string, DemandForecast>` - **NEW**: Demand forecast data for each product

**Relationships**:
- Uses: `ProductSupplyAnalysis` from `src/types/ontology.ts`
- Uses: `DemandForecast` from `src/types/ontology.ts`
- Replaces: Separate product selector panel
- Integrates: Demand forecast cards (previously separate panel)

**Validation Rules**:
- Top 3 products sorted by `currentInventoryLevel` descending (per FR-014)
- Search query filters products by name (case-insensitive)
- Each product in selection list must have corresponding demand forecast card
- AI suggestions displayed prominently at top of panel

### InventoryView Layout (Updated)

**Location**: `src/components/views/InventoryView.tsx`

**Description**: Reorganized layout with AI suggestions section displayed before agent sections.

**Layout Order** (Updated):
1. Header section (title, stats, pie chart)
2. **AI suggestions section** (moved from bottom, per FR-012)
3. Product inventory agent section (产品库存智能体)
4. Material inventory agent section (物料库存智能体)
5. Chat bubble button

**Fields** (No changes, only layout reordering):
- `risks: ProductRisk[]` - Product inventory risks
- `matRisks: MaterialRisk[]` - Material inventory risks
- `toggleCopilot: () => void` - Chat bubble trigger

**Relationships**:
- AI suggestions section moved before agent sections
- Agent sections remain unchanged in structure

**Validation Rules**:
- AI suggestions section MUST appear before both agent sections (per FR-012)
- Agent sections remain side-by-side in grid layout

### T22 Product Data (New)

**Location**: `src/data/mockData.ts` (productsData array)

**Description**: Product data for T22植保无人机 to support product supply evaluation preset questions.

**Fields**:
- `productId: string` - Unique product identifier (e.g., 'PROD-010')
- `productName: string` - Product name (e.g., '植保无人机T22')
- `materialCodes: string[]` - Array of material codes used in BOM
- `startSalesDate: string` - Product launch date
- `status: string` - Product status (e.g., '销售中', '停止销售')
- `stockQuantity: number` - Current stock quantity
- `stockUnit: string` - Stock unit (e.g., '套')

**Relationships**:
- References materials in materialsData via materialCodes
- Used by product supply evaluation assistant for BOM configuration queries

**Validation Rules**:
- productId must be unique
- materialCodes must reference existing materials in materialsData
- All fields must be populated for realistic demonstration

### Hard Drive Material Data (New)

**Location**: `src/data/mockData.ts` (materialsData array)

**Description**: Material data for 硬盘 to support price impact analysis queries.

**Fields**:
- `materialCode: string` - Unique material identifier (e.g., 'MAT-HDD-001')
- `materialName: string` - Material name (e.g., '硬盘')
- `applicableProductIds: string[]` - Array of product IDs that use this material
- `warehouseInDate: string` - Warehouse entry date
- `currentStock: number` - Current stock quantity
- `maxStock: number` - Maximum stock level
- `minStock: number` - Minimum stock level

**Relationships**:
- Used by multiple products (referenced in applicableProductIds)
- Used by product supply evaluation assistant for price impact analysis

**Validation Rules**:
- materialCode must be unique
- applicableProductIds must reference existing products
- currentStock must be between minStock and maxStock

### SSD Material and Supplier Data (New)

**Location**: `src/data/mockData.ts` (materialsData and suppliersData arrays)

**Description**: Material and supplier data for SSD to support supplier evaluation preset questions.

**Fields** (Material):
- `materialCode: string` - Unique material identifier (e.g., 'MAT-SSD-001')
- `materialName: string` - Material name (e.g., 'SSD固态硬盘')
- `applicableProductIds: string[]` - Array of product IDs that use this material

**Fields** (Supplier):
- `supplierId: string` - Unique supplier identifier (e.g., 'SUP-009')
- `supplierName: string` - Supplier name (e.g., 'SSD存储设备供应商')
- `materialCode: string` - Material code this supplier provides
- `qualityRating: number` - Quality rating (0-100)
- `riskRating: number` - Risk rating (0-100)
- `onTimeDeliveryRate: number` - On-time delivery rate (0-100)

**Relationships**:
- SSD material used by products (referenced in applicableProductIds)
- SSD supplier provides SSD material
- Used by supplier evaluation assistant for similar supplier recommendations

**Validation Rules**:
- materialCode and supplierId must be unique
- Supplier materialCode must match existing SSD material
- Ratings must be within valid ranges (0-100)

### Fuzzy Matching Function

**Location**: `src/utils/fuzzyMatch.ts`

**Description**: Function that matches material name variations in user queries to actual material names in mockData.

**Signature**:
```typescript
export const fuzzyMatchMaterialName = (
  query: string,
  materials: Material[]
): Material[]
```

**Algorithm**:
1. **Direct Name Matching**: Case-insensitive substring matching
   - Query: "GPS定位器" → Matches material with name containing "GPS定位器"
   - Query: "定位" → Matches materials with names containing "定位"

2. **Alias Mapping**: Predefined alias mappings for common variations
   - Alias structure: `Record<string, string[]>` where key is query term, value is array of actual material names
   - Example: `"北斗定位模块": ["GPS定位器", "北斗接收模块", "RTK定位板"]`

3. **Matching Process**:
   - Step 1: Normalize query (trim, lowercase)
   - Step 2: Check direct matches against material names (case-insensitive contains)
   - Step 3: Check alias mappings - if query matches alias key, return materials matching alias values
   - Step 4: Return all matching materials (can be multiple)

**Alias Mappings** (defined in function):
```typescript
const materialAliases: Record<string, string[]> = {
  '北斗定位模块': ['GPS定位器', '北斗接收模块', 'RTK定位板'],
  // Additional aliases can be added as needed
};
```

**Implementation Details**:
- Case-insensitive matching for both query and material names
- Returns empty array if no matches found
- Returns all matching materials (not just first match)
- Aliases take precedence over direct substring matching when query exactly matches alias key

**Examples**:
- Input: "北斗定位模块" → Output: [Material with name "GPS定位器", Material with name "北斗接收模块"]
- Input: "GPS定位器" → Output: [Material with name "GPS定位器"]
- Input: "定位" → Output: [All materials with names containing "定位"]

### Preset Answer Data Structure

**Location**: `src/data/mockData.ts` or `src/utils/presetAnswers.ts`

**Description**: Structured preset answers for all preset questions, generated from mockData.

**Structure**:
```typescript
interface PresetAnswer {
  questionId: string;
  generateAnswer: (context: QueryContext) => string | { text: string; richContent?: CopilotRichContent };
}

interface QueryContext {
  products?: Product[];
  materials?: Material[];
  suppliers?: Supplier[];
  orders?: Order[];
  userInput?: Record<string, string>; // For placeholder-filled queries
}
```

**Examples**:
- Product supply evaluation: T22 BOM configuration answer references T22 product and materials from mockData
- Order delivery: Order status answer references actual orders from mockData
- Inventory: Inventory analysis answer references products and materials from mockData
- Supplier evaluation: Supplier status answer references suppliers from mockData

**Validation Rules**:
- All answers must reference data from mockData, no hardcoded values
- Product names, supplier names, material names must come from mockData
- Order customer names must come from mockData

## Future Extensions

- Rich content support for order details (tables, cards)
- Query history persistence (if needed in future)
- Multi-language support for assistant messages
- Analytics tracking for query patterns
- Chat bubble animation states (pulsing when new message, badge count)
- Advanced fuzzy matching with machine learning
- Dynamic preset answer generation based on real-time data

