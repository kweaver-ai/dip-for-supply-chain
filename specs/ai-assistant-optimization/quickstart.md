# Quick Start: AI助手优化

**Date**: 2024-12-19  
**Feature**: AI助手优化  
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing the AI assistant optimization feature. The implementation involves:
1. Creating a custom hook for dynamic header height calculation
2. Updating CopilotSidebar component to accept topOffset prop
3. Extending copilotConfig.ts with all page-specific configurations
4. Updating SupplyChainApp to use dynamic positioning and reset conversation history
5. Adding floating chat bubble button to all view components
6. Removing AI assistant button from page header
7. Reorganizing inventory optimization page layout (AI suggestions before agents)
8. Refactoring product supply optimization page layout (integrated product selection and demand forecast)
9. Adding T22 product, hard drive material, SSD material and supplier data to mockData
10. Implementing fuzzy matching for material names
11. Implementing preset question placeholder handling
12. Implementing preset answer generation based on mockData
13. Updating query handlers for targeted AI assistants (product supply evaluation, order supply, inventory, supplier)

## Prerequisites

- Existing CopilotSidebar component (`src/components/shared/CopilotSidebar.tsx`)
- Existing copilotConfig.ts (`src/utils/copilotConfig.ts`)
- SupplyChainApp component (`src/SupplyChainApp.tsx`)
- React 19.2.0+, TypeScript 5.9.3+

## Implementation Steps

### Step 1: Create useHeaderHeight Hook

**File**: `src/hooks/useHeaderHeight.ts` (new file)

```typescript
import { useState, useEffect, RefObject } from 'react';

export const useHeaderHeight = (headerRef: RefObject<HTMLElement>): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      const updateHeight = () => {
        setHeight(headerRef.current?.offsetHeight || 0);
      };
      
      updateHeight();
      window.addEventListener('resize', updateHeight);
      
      return () => {
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [headerRef]);

  return height;
};
```

**Verification**: Hook returns 0 initially, then calculates actual height after mount.

---

### Step 2: Update CopilotSidebar Component

**File**: `src/components/shared/CopilotSidebar.tsx`

**Changes**:
1. Add `topOffset?: number` to `CopilotSidebarProps` interface
2. Update component styling to use `topOffset` instead of `top: 0`

```typescript
export interface CopilotSidebarProps {
  // ... existing props
  topOffset?: number;  // NEW
}

export const CopilotSidebar = ({ 
  // ... existing props
  topOffset = 0  // NEW with default
}: CopilotSidebarProps) => {
  // ... existing code

  return (
    <div 
      className={`fixed right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ top: `${topOffset}px`, bottom: 0 }}  // UPDATED
    >
      {/* ... rest of component */}
    </div>
  );
};
```

**Verification**: Sidebar top aligns with header bottom when `topOffset` is provided.

---

### Step 3: Extend copilotConfig.ts

**File**: `src/utils/copilotConfig.ts`

**Changes**: Add configurations for all pages (cockpit, search, inventory, delivery)

**Example for Delivery Page**:
```typescript
if (currentView === 'delivery') {
  const handleDeliveryQuery = async (query: string): Promise<string | { text: string; richContent?: CopilotRichContent }> => {
    // Pattern: Order status query
    if (query.includes('订单') && (query.includes('到哪') || query.includes('状态'))) {
      const { ordersData } = await import('../data/mockData');
      // Extract customer name from query
      const customerMatch = query.match(/(黑龙江|新疆|中粮)/);
      if (customerMatch) {
        const order = ordersData.find(o => o.orderName.includes(customerMatch[1]));
        if (order) {
          return `查询到订单 ${order.orderId}。
目前卡在【${getStageName(order.status)}】，原因是"${order.bottleneck || '未知'}。
预计延期 ${order.delay || 0}天，无法按原定 ${order.dueDate} 交付。
建议联系${getDepartment(order.status)}催货。`;
        }
      }
    }
    
    // Pattern: Delay risk query
    if (query.includes('延期') || query.includes('风险')) {
      // Return list of orders with delays
      return '...';
    }
    
    // Fallback
    return '我是您的订单交付助手。您可以问我："黑龙江农垦的订单到哪了？" 或 "哪些订单有延期风险？"';
  };

  return {
    title: '订单交付助手',
    initialMessages: [
      { type: 'bot' as const, text: '我是您的订单交付助手。您可以问我："黑龙江农垦的订单到哪了？" 或 "哪些订单有延期风险？"' }
    ] as CopilotMessage[],
    suggestions: [
      '黑龙江农垦的订单到哪了？',
      '哪些订单有延期风险？'
    ],
    onQuery: handleDeliveryQuery,
  };
}
```

**Repeat for**: cockpit, search, inventory, optimization (already exists), evaluation (already exists)

**Verification**: Each page returns unique configuration with 2 preset questions.

---

### Step 4: Update SupplyChainApp

**File**: `src/SupplyChainApp.tsx`

**Changes**:
1. Import `useHeaderHeight` hook
2. Add ref to header element
3. Calculate header height
4. Pass `topOffset` to CopilotSidebar
5. Ensure conversation resets on page switch (already handled by useEffect dependency)

```typescript
import { useHeaderHeight } from './hooks/useHeaderHeight';

const SupplyChainApp = () => {
  const [currentView, setCurrentView] = useState<ViewType>('cockpit');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);  // NEW
  const headerHeight = useHeaderHeight(headerRef);  // NEW
  const [copilotProps, setCopilotProps] = useState<Omit<CopilotSidebarProps, 'isOpen' | 'onClose'>>({
    title: '供应链智能助手',
    initialMessages: [{ type: 'bot', text: '欢迎使用供应链智能助手！' }],
    suggestions: [],
  });

  useEffect(() => {
    getCopilotConfig(currentView).then(setCopilotProps);
    // Conversation history resets automatically when initialMessages prop changes
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div ref={headerRef} className="bg-white border-b border-slate-200 shadow-sm">  {/* ADD ref */}
        {/* ... header content */}
      </div>

      {/* Main Content */}
      {/* ... existing content */}

      {/* Copilot Sidebar */}
      <CopilotSidebar
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        topOffset={headerHeight}  // NEW
        {...copilotProps}
      />
    </div>
  );
};
```

**Verification**: 
- Sidebar top aligns with header bottom
- Conversation resets when switching pages
- Each page shows correct assistant title and preset questions
- Header no longer contains AI assistant button

---

### Step 5: Add Floating Chat Bubble Button to All View Components

**Files**: 
- `src/components/views/CockpitView.tsx`
- `src/components/views/SearchView.tsx`
- `src/components/views/InventoryView.tsx` (already has toggleCopilot prop)
- `src/components/views/DeliveryView.tsx` (already has chat bubble - use as reference)
- `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`
- `src/components/supplier-evaluation/SupplierEvaluationPage.tsx`

**Changes**: Add floating chat bubble button matching delivery page style

**Example** (for CockpitView):
```typescript
import { MessageSquare } from 'lucide-react';

const CockpitView = ({ onNavigate, toggleCopilot }: { onNavigate: (view: string) => void; toggleCopilot: () => void }) => {
  // ... existing code

  return (
    <div className="space-y-6 pb-10">
      {/* ... existing content */}
      
      {/* Floating Chat Bubble Button */}
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

**Repeat for**: SearchView, InventoryView (if not already present), ProductSupplyOptimizationPage, SupplierEvaluationPage

**Note**: DeliveryView already has this button - use as reference implementation.

**Verification**: All pages display floating chat bubble button at bottom-right corner.

---

### Step 6: Remove Header AI Assistant Button

**File**: `src/SupplyChainApp.tsx`

**Changes**: Remove the AI assistant button from header section

```typescript
// REMOVE this section:
<div className="flex items-center gap-3">
  <button 
    onClick={() => setCopilotOpen(!copilotOpen)}
    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-shadow flex items-center gap-2"
  >
    <Bot size={16}/>
    AI 助手
  </button>
</div>
```

**Verification**: Header no longer contains AI assistant button.

---

### Step 7: Update SupplyChainApp to Pass toggleCopilot to All Views

**File**: `src/SupplyChainApp.tsx`

**Changes**: Ensure all view components receive toggleCopilot prop

```typescript
{/* Main Content */}
<div className="max-w-7xl mx-auto px-6 py-8">
  {currentView === 'cockpit' && <CockpitView onNavigate={handleNavigate} toggleCopilot={() => setCopilotOpen(true)} />}
  {currentView === 'search' && <SearchView toggleCopilot={() => setCopilotOpen(true)} />}
  {currentView === 'inventory' && <InventoryView toggleCopilot={() => setCopilotOpen(true)} />}
  {currentView === 'optimization' && <ProductSupplyOptimizationPage toggleCopilot={() => setCopilotOpen(true)} />}
  {currentView === 'delivery' && <DeliveryView toggleCopilot={() => setCopilotOpen(true)} />}
  {currentView === 'evaluation' && <SupplierEvaluationPage toggleCopilot={() => setCopilotOpen(true)} />}
</div>
```

**Note**: Some components may need prop interface updates to accept toggleCopilot.

**Verification**: All view components receive toggleCopilot prop and can trigger sidebar.

---

### Step 8: Reorganize Inventory Optimization Page Layout

**File**: `src/components/views/InventoryView.tsx`

**Changes**: Move AI suggestions section to display before the two agent sections

**Before** (current order):
1. Header section
2. Product inventory agent section
3. Material inventory agent section
4. AI suggestions section (at bottom)

**After** (new order):
1. Header section
2. **AI suggestions section** (moved up)
3. Product inventory agent section
4. Material inventory agent section
5. Chat bubble button

```typescript
return (
  <div className="p-8 pb-20">
    {/* Header section */}
    <div className="flex justify-between items-end mb-8">
      {/* ... existing header content */}
    </div>

    {/* AI Suggestions Section - MOVED HERE */}
    <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
      {/* ... existing AI suggestions content */}
    </div>

    {/* Two Agent Sections */}
    <div className="grid grid-cols-2 gap-8">
      {/* Product inventory agent */}
      {/* Material inventory agent */}
    </div>

    {/* Chat bubble button */}
  </div>
);
```

**Verification**: AI suggestions section appears before both agent sections in the layout.

---

### Step 9: Refactor Product Supply Optimization Page Layout

**File**: `src/components/product-supply-optimization/ProductSupplyOptimizationPage.tsx`

**Changes**:
1. Remove separate product selector panel (lines 80-100)
2. Remove OptimizationSuggestionsPanel from render
3. Update ProductSupplyAnalysisPanel to integrate product selection, AI suggestions, and demand forecast cards

**Step 9a: Remove Product Selector Panel**

```typescript
// REMOVE this entire section:
{/* Product Selector */}
{analyses.length > 0 && (
  <div className="bg-white rounded-xl border shadow-sm p-5">
    {/* ... product selector buttons */}
  </div>
)}
```

**Step 9b: Remove OptimizationSuggestionsPanel**

```typescript
// REMOVE this line from render:
<OptimizationSuggestionsPanel suggestions={productSuggestions} loading={false} />
```

**Step 9c: Update ProductSupplyAnalysisPanel Component**

**File**: `src/components/product-supply-optimization/ProductSupplyAnalysisPanel.tsx`

**Changes**: Extend component to include:
- AI suggestions section at top
- Product selection (top 3 by inventory + search box)
- Demand forecast cards for each product

```typescript
interface Props {
  analysis: ProductSupplyAnalysis | null;
  loading?: boolean;
  allProducts?: ProductSupplyAnalysis[];  // NEW: All products for selection
  selectedProductId?: string | null;  // NEW: Currently selected product
  onProductSelect?: (productId: string) => void;  // NEW: Selection handler
  demandForecasts?: Map<string, DemandForecast>;  // NEW: Forecast data per product
}

export const ProductSupplyAnalysisPanel: React.FC<Props> = ({ 
  analysis, 
  loading = false,
  allProducts = [],
  selectedProductId = null,
  onProductSelect,
  demandForecasts = new Map()
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get top 3 products by inventory (sorted descending)
  const top3Products = [...allProducts]
    .sort((a, b) => b.currentInventoryLevel - a.currentInventoryLevel)
    .slice(0, 3);
  
  // Filter products by search query
  const filteredProducts = searchQuery
    ? allProducts.filter(p => 
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : top3Products;
  
  // AI suggestions (mock for now, can be enhanced)
  const aiSuggestions = [
    '建议优先关注库存量前3的产品，及时调整供应策略',
    '根据需求预测，建议提前准备高需求产品的原材料',
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* AI Suggestions Section */}
      <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-600"/>
          AI 建议
        </h3>
        <ul className="text-sm text-slate-700 space-y-1">
          {aiSuggestions.map((suggestion, i) => (
            <li key={i}>• {suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Product Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-slate-700">选择产品:</span>
          {/* Search Box */}
          <input
            type="text"
            placeholder="搜索产品名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredProducts.map(product => (
            <button
              key={product.productId}
              onClick={() => onProductSelect?.(product.productId)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedProductId === product.productId
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {product.productName}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Product Analysis */}
      {analysis && (
        <>
          {/* Existing analysis metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* ... existing metrics */}
          </div>

          {/* Demand Forecast Card for Selected Product */}
          {demandForecasts.has(analysis.productId) && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-slate-800 mb-3">需求预测</h4>
              <DemandForecastCard forecast={demandForecasts.get(analysis.productId)!} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

**Step 9d: Update ProductSupplyOptimizationPage to Pass New Props**

```typescript
// In ProductSupplyOptimizationPage.tsx
const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
const [demandForecasts, setDemandForecasts] = useState<Map<string, DemandForecast>>(new Map());

// Load demand forecasts for all products
useEffect(() => {
  const forecasts = new Map<string, DemandForecast>();
  analyses.forEach(analysis => {
    // Load forecast for each product
    const forecast = getDemandForecast(analysis.productId);
    forecasts.set(analysis.productId, forecast);
  });
  setDemandForecasts(forecasts);
}, [analyses]);

// Update render
<ProductSupplyAnalysisPanel
  analysis={selectedAnalysis}
  loading={false}
  allProducts={analyses}
  selectedProductId={selectedProductId}
  onProductSelect={setSelectedProductId}
  demandForecasts={demandForecasts}
/>

// Remove separate DemandForecastPanel and OptimizationSuggestionsPanel
```

**Verification**:
- Product selector panel removed
- Product selection integrated into ProductSupplyAnalysisPanel
- Top 3 products displayed by default (sorted by inventory descending)
- Search box filters products by name
- AI suggestions displayed in ProductSupplyAnalysisPanel
- Demand forecast cards displayed for each product in selection
- OptimizationSuggestionsPanel removed

---

## Testing Checklist

- [ ] Header height calculates correctly on mount
- [ ] Header height recalculates on window resize
- [ ] Sidebar top aligns with header bottom
- [ ] Each page shows correct assistant title
- [ ] Each page shows exactly 2 preset questions
- [ ] Conversation history resets on page switch
- [ ] Preset questions trigger correct query handlers
- [ ] Query handlers return structured responses
- [ ] Unmatched queries return guidance messages
- [ ] Order delivery query returns correct answer for 黑龙江农垦 order
- [ ] All pages display floating chat bubble button at bottom-right
- [ ] Chat bubble button matches delivery page style (gradient, icon, positioning)
- [ ] Chat bubble button triggers sidebar correctly on all pages
- [ ] Header no longer contains AI assistant button
- [ ] All view components accept toggleCopilot prop
- [ ] Inventory optimization page displays AI suggestions before agent sections
- [ ] Product supply optimization page removes separate product selector panel
- [ ] ProductSupplyAnalysisPanel integrates product selection (top 3 + search)
- [ ] ProductSupplyAnalysisPanel displays AI suggestions
- [ ] Each product in ProductSupplyAnalysisPanel shows demand forecast card
- [ ] OptimizationSuggestionsPanel removed from product supply optimization page

## Common Issues

### Issue: Sidebar not aligning with header
**Solution**: Ensure `headerRef` is attached to correct element and `topOffset` is passed correctly.

### Issue: Conversation not resetting on page switch
**Solution**: Verify `useEffect` dependency includes `currentView` and `initialMessages` prop updates.

### Issue: Query handler not matching patterns
**Solution**: Check pattern matching logic, ensure query text includes expected keywords.

### Issue: Chat bubble button not appearing on some pages
**Solution**: Verify toggleCopilot prop is passed to view component and button is added to component JSX.

### Issue: Chat bubble button z-index conflicts
**Solution**: Ensure button has z-40 and sidebar has z-50 to maintain proper layering.

### Step 10: Add New Data to mockData

**File**: `src/data/mockData.ts`

**Changes**: Add T22 product, hard drive material, SSD material and supplier data

**Step 10a: Add T22 Product**

```typescript
// In productsData array
{ 
  productId: 'PROD-010', 
  productName: '植保无人机T22', 
  materialCodes: ['MAT-001', 'MAT-002', 'MAT-003', 'MAT-004', 'MAT-HDD-001'],
  startSalesDate: '2025-12-01',
  stopSalesDate: undefined,
  stopExpansionDate: undefined,
  stopServiceDate: undefined,
  status: '销售中',
  stockQuantity: Math.floor(Math.random() * 480) + 21,
  stockUnit: '套',
}
```

**Step 10b: Add Hard Drive Material**

```typescript
// In materialsData array
{
  materialCode: 'MAT-HDD-001',
  materialName: '硬盘',
  applicableProductIds: ['PROD-010', 'PROD-001', 'PROD-002'],
  warehouseInDate: generateRandomDate(startDate, endDate),
  warehouseOutDate: Math.random() < 0.3 ? generateRandomDate(new Date('2023-01-01'), endDate) : undefined,
  status: undefined,
  maxStock: 10000,
  minStock: 10,
  currentStock: generateRandomStock(),
}
```

**Step 10c: Add SSD Material**

```typescript
// In materialsData array
{
  materialCode: 'MAT-SSD-001',
  materialName: 'SSD固态硬盘',
  applicableProductIds: ['PROD-001', 'PROD-002'],
  warehouseInDate: generateRandomDate(startDate, endDate),
  warehouseOutDate: Math.random() < 0.3 ? generateRandomDate(new Date('2023-01-01'), endDate) : undefined,
  status: undefined,
  maxStock: 10000,
  minStock: 10,
  currentStock: generateRandomStock(),
}
```

**Step 10d: Add SSD Supplier**

```typescript
// In suppliersData array
{ 
  supplierId: 'SUP-009', 
  supplierName: 'SSD存储设备供应商', 
  materialName: 'SSD固态硬盘', 
  materialCode: 'MAT-SSD-001', 
  contactPhone: '0755-90123456', 
  contactEmail: 'contact@ssd-storage.com', 
  address: '深圳市南山区科技园', 
  creditRating: 'AA', 
  cooperationYears: 3, 
  annualPurchaseAmount: 2800000, 
  qualityRating: 90, 
  riskRating: 15, 
  onTimeDeliveryRate: 94, 
  financialStatus: '良好' 
}
```

**Verification**: All new data entries are accessible from mockData exports.

---

### Step 11: Implement Fuzzy Matching Function

**File**: `src/utils/copilotConfig.ts` or `src/utils/fuzzyMatch.ts` (new file)

**Implementation**:

```typescript
import type { Material } from '../types/ontology';

// Alias mappings for material name variations
const materialAliases: Record<string, string[]> = {
  '北斗定位模块': ['GPS定位器', '北斗接收模块', 'RTK定位板'],
  // Add more aliases as needed
};

export const fuzzyMatchMaterialName = (
  query: string,
  materials: Material[]
): Material[] => {
  const queryLower = query.toLowerCase().trim();
  const matches: Material[] = [];
  
  // Check direct matches
  materials.forEach(material => {
    const materialNameLower = material.materialName.toLowerCase();
    if (materialNameLower.includes(queryLower) || queryLower.includes(materialNameLower)) {
      matches.push(material);
    }
  });
  
  // Check alias mappings
  Object.entries(materialAliases).forEach(([alias, names]) => {
    if (queryLower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(queryLower)) {
      materials.forEach(material => {
        if (names.includes(material.materialName) && !matches.includes(material)) {
          matches.push(material);
        }
      });
    }
  });
  
  return matches;
};
```

**Usage in Query Handlers**:

```typescript
// In handleInventoryQuery
if (query.includes('物料') && query.includes('库存')) {
  const { materialsData } = await import('../data/mockData');
  const matchedMaterials = fuzzyMatchMaterialName(query, materialsData);
  
  if (matchedMaterials.length > 0) {
    return `找到以下相关物料：\n${matchedMaterials.map(m => 
      `- ${m.materialName} (${m.materialCode}): 当前库存 ${m.currentStock}`
    ).join('\n')}`;
  }
}
```

**Verification**: Fuzzy matching correctly identifies materials from query variations.

---

### Step 12: Implement Preset Question Placeholder Handling

**File**: `src/utils/copilotConfig.ts`

**Implementation**:

```typescript
// In handleProductSupplyEvaluationQuery
if (query.includes('T22') && (query.includes('物料配置') || query.includes('BOM'))) {
  // Check if query contains placeholder
  if (query.includes('XXXX') || query.includes('性能要求：') && !query.match(/性能要求：[^X]/)) {
    return `请提供具体的性能要求、功能要求和其他规格，我将为您生成详细的BOM配置和成本分析。

例如：
- 性能要求：载重50KG，续航2小时
- 功能要求：支持RTK定位，自动避障
- 其他规格：工作温度-20°C至50°C

请重新输入您的需求。`;
  }
  
  // Extract requirements from query
  const performanceMatch = query.match(/性能要求[：:]([^，,]+)/);
  const functionalityMatch = query.match(/功能要求[：:]([^，,]+)/);
  const specsMatch = query.match(/其他规格[：:]([^，,]+)/);
  
  // Generate BOM analysis based on requirements and mockData
  const { productsData, materialsData } = await import('../data/mockData');
  const t22Product = productsData.find(p => p.productName.includes('T22'));
  // ... generate detailed BOM analysis
}
```

**Verification**: Placeholder queries prompt user for input, filled queries generate analysis.

---

### Step 13: Implement Preset Answer Generation

**File**: `src/utils/presetAnswers.ts` (new file) or `src/data/mockData.ts`

**Implementation**:

```typescript
import type { Product, Material, Supplier, Order } from '../types/ontology';

interface QueryContext {
  products?: Product[];
  materials?: Material[];
  suppliers?: Supplier[];
  orders?: Order[];
  userInput?: Record<string, string>;
}

export const getPresetAnswer = (
  presetQuestionId: string,
  context?: QueryContext
): string | { text: string; richContent?: CopilotRichContent } => {
  switch (presetQuestionId) {
    case 'product-supply-t22-bom': {
      const t22Product = context?.products?.find(p => p.productName.includes('T22'));
      const materials = context?.materials?.filter(m => 
        t22Product?.materialCodes.includes(m.materialCode)
      );
      
      if (!t22Product || !materials) {
        return '抱歉，未找到T22产品数据。';
      }
      
      return {
        text: `基于您的需求，T22植保无人机的推荐BOM配置如下：`,
        richContent: {
          type: 'bom_recommendation',
          data: materials.map(m => ({
            component: m.materialName,
            part: `${m.materialCode} (推荐)`,
            cost: `¥ ${Math.floor(Math.random() * 5000) + 500}`,
            status: m.currentStock > m.minStock ? 'In Stock' : 'Procure'
          })),
          totalCost: `¥ ${Math.floor(Math.random() * 20000) + 15000} (预估)`,
          optimization: '复用现有物料可降低15%研发成本，且消耗呆滞库存。'
        }
      };
    }
    
    case 'product-supply-hard-drive-price-impact': {
      const hardDrive = context?.materials?.find(m => m.materialName === '硬盘');
      const affectedProducts = context?.products?.filter(p => 
        p.materialCodes.includes(hardDrive?.materialCode || '')
      );
      
      if (!hardDrive || !affectedProducts) {
        return '抱歉，未找到硬盘物料数据。';
      }
      
      return `硬盘供应涨价50%的影响分析：

受影响产品：
${affectedProducts.map(p => `- ${p.productName}: BOM成本上升约5%，建议评估替代料或调整定价策略`).join('\n')}

应对建议：
1. 评估替代物料（如SSD）的可行性和成本
2. 与供应商协商长期价格锁定
3. 调整受影响产品的定价策略
4. 考虑提前采购以锁定当前价格`;
    }
    
    // Add more preset answers as needed
    default:
      return '抱歉，未找到对应的预设答案。';
  }
};
```

**Usage in Query Handlers**:

```typescript
// In handleProductSupplyEvaluationQuery
if (query.includes('T22') && query.includes('物料配置')) {
  const { productsData, materialsData } = await import('../data/mockData');
  return getPresetAnswer('product-supply-t22-bom', {
    products: productsData,
    materials: materialsData,
    userInput: extractUserInput(query)
  });
}
```

**Verification**: Preset answers are generated from mockData and are realistic.

---

### Step 14: Update Query Handlers for Targeted AI Assistants

**File**: `src/utils/copilotConfig.ts`

**Changes**: Update query handlers for each page with new patterns and preset answer integration

**Example for Product Supply Optimization Page**:

```typescript
if (currentView === 'optimization') {
  const handleProductSupplyEvaluationQuery = async (query: string): Promise<string | { text: string; richContent?: CopilotRichContent }> => {
    // T22 BOM configuration query
    if (query.includes('T22') && (query.includes('物料配置') || query.includes('BOM'))) {
      if (query.includes('XXXX')) {
        return '请提供具体的性能要求、功能要求和其他规格...';
      }
      const { productsData, materialsData } = await import('../data/mockData');
      return getPresetAnswer('product-supply-t22-bom', {
        products: productsData,
        materials: materialsData
      });
    }
    
    // Hard drive price impact query
    if (query.includes('硬盘') && (query.includes('涨价') || query.includes('影响'))) {
      const { productsData, materialsData } = await import('../data/mockData');
      return getPresetAnswer('product-supply-hard-drive-price-impact', {
        products: productsData,
        materials: materialsData
      });
    }
    
    return '我是产品供应优化助手。您可以问我："准备新上T22植保无人机，可用的物料配置是哪些？" 或 "硬盘供应涨价50%，对现有产品有哪些影响，如何应对？"';
  };

  return {
    title: '产品供应评估助手',
    initialMessages: [
      { type: 'bot' as const, text: '我是产品供应评估助手。我可以帮您查询产品供应情况、获取优化建议。' }
    ] as CopilotMessage[],
    suggestions: [
      '准备新上T22植保无人机，性能要求：XXXX，功能要求：XXXX，其他规格XXXX，可用的物料配置是哪些？',
      '硬盘供应涨价50%，对现有产品有哪些影响，如何应对？'
    ],
    onQuery: handleProductSupplyEvaluationQuery,
  };
}
```

**Repeat similar updates for**: delivery, inventory, evaluation pages with their respective query patterns and preset answers.

**Verification**: All query handlers correctly process queries and return mockData-based answers.

---

## Testing Checklist

- [ ] Header height calculates correctly on mount
- [ ] Header height recalculates on window resize
- [ ] Sidebar top aligns with header bottom
- [ ] Each page shows correct assistant title
- [ ] Each page shows exactly 2 preset questions
- [ ] Conversation history resets on page switch
- [ ] Preset questions trigger correct query handlers
- [ ] Query handlers return structured responses
- [ ] Unmatched queries return guidance messages
- [ ] Order delivery query returns correct answer for 黑龙江农垦 order
- [ ] All pages display floating chat bubble button at bottom-right
- [ ] Chat bubble button matches delivery page style (gradient, icon, positioning)
- [ ] Chat bubble button triggers sidebar correctly on all pages
- [ ] Header no longer contains AI assistant button
- [ ] All view components accept toggleCopilot prop
- [ ] Inventory optimization page displays AI suggestions before agent sections
- [ ] Product supply optimization page removes separate product selector panel
- [ ] ProductSupplyAnalysisPanel integrates product selection (top 3 + search)
- [ ] ProductSupplyAnalysisPanel displays AI suggestions
- [ ] Each product in ProductSupplyAnalysisPanel shows demand forecast card
- [ ] OptimizationSuggestionsPanel removed from product supply optimization page
- [ ] T22 product data added to mockData and accessible
- [ ] Hard drive material data added to mockData and accessible
- [ ] SSD material and supplier data added to mockData and accessible
- [ ] Fuzzy matching correctly identifies materials from query variations
- [ ] Preset questions with placeholders prompt user for input
- [ ] Preset answers are generated from mockData (no hardcoded values)
- [ ] All product names, supplier names, material names reference mockData
- [ ] Product supply evaluation assistant handles T22 BOM queries correctly
- [ ] Product supply evaluation assistant handles hard drive price impact queries correctly
- [ ] Order supply assistant handles order status queries correctly
- [ ] Inventory assistant handles product/material inventory queries with fuzzy matching
- [ ] Supplier assistant handles supplier status and similar supplier queries correctly

## Common Issues

### Issue: Sidebar not aligning with header
**Solution**: Ensure `headerRef` is attached to correct element and `topOffset` is passed correctly.

### Issue: Conversation not resetting on page switch
**Solution**: Verify `useEffect` dependency includes `currentView` and `initialMessages` prop updates.

### Issue: Query handler not matching patterns
**Solution**: Check pattern matching logic, ensure query text includes expected keywords.

### Issue: Chat bubble button not appearing on some pages
**Solution**: Verify toggleCopilot prop is passed to view component and button is added to component JSX.

### Issue: Chat bubble button z-index conflicts
**Solution**: Ensure button has z-40 and sidebar has z-50 to maintain proper layering.

### Issue: Fuzzy matching not finding materials
**Solution**: Check alias mappings and ensure material names in mockData match expected values.

### Issue: Preset answers contain hardcoded values
**Solution**: Ensure all values are extracted from mockData, no hardcoded strings.

## Next Steps

After implementation:
1. Test all 6 pages for correct assistant configuration
2. Verify all preset questions work correctly
3. Test edge cases (empty queries, special characters, fuzzy matching variations)
4. Verify all data references come from mockData (no hardcoded values)
5. Test preset answer generation for all preset questions
6. Update documentation if needed

