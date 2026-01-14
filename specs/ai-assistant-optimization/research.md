# Research: AI助手优化

**Date**: 2024-12-19  
**Feature**: AI助手优化  
**Phase**: Phase 0 - Research & Analysis

## Research Questions

### RQ-001: How to dynamically calculate header height and align sidebar top?

**Decision**: Use React refs and useEffect hook to measure header element height, then pass calculated value to CopilotSidebar component via prop.

**Rationale**:
- React refs provide direct DOM access without breaking React's declarative model
- useEffect ensures calculation happens after DOM render
- Prop-based approach keeps CopilotSidebar component reusable and testable
- Dynamic calculation handles responsive layouts and future header changes

**Alternatives Considered**:
- CSS calc() with CSS variables: Requires setting CSS variable on header, less flexible
- Fixed pixel value: Not responsive, breaks if header height changes
- Intersection Observer API: Overkill for simple height measurement

**Implementation Approach**:
```typescript
// Custom hook: useHeaderHeight.ts
const useHeaderHeight = (headerRef: RefObject<HTMLElement>) => {
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    if (headerRef.current) {
      const updateHeight = () => {
        setHeight(headerRef.current?.offsetHeight || 0);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [headerRef]);
  
  return height;
};
```

### RQ-002: How to reset conversation history when switching pages?

**Decision**: Reset conversation history by updating `initialMessages` prop when `currentView` changes, leveraging React's key prop or useEffect to reset component state.

**Rationale**:
- React's prop update mechanism naturally resets component state when key changes
- useEffect dependency on `currentView` ensures reset happens on page switch
- Keeps conversation history isolated per page as required
- Simple and maintainable approach

**Alternatives Considered**:
- Global conversation store: Adds complexity, not needed for page-specific assistants
- Manual state reset in parent component: More verbose, prop-based approach is cleaner
- Persist conversation across pages: Violates requirement FR-007

**Implementation Approach**:
```typescript
// In SupplyChainApp.tsx
useEffect(() => {
  getCopilotConfig(currentView).then(config => {
    setCopilotProps(config);
    // Conversation history resets automatically when initialMessages prop changes
  });
}, [currentView]);
```

### RQ-003: How to structure page-specific query handlers?

**Decision**: Extend existing `copilotConfig.ts` with query handler functions for each page. Each handler processes queries and returns structured responses.

**Rationale**:
- Centralized configuration file keeps all assistant configs in one place
- Function-based handlers allow complex query processing logic
- Reuses existing pattern already established for evaluation and optimization pages
- Easy to extend with new pages or query patterns

**Alternatives Considered**:
- Separate handler files per page: More files to maintain, less centralized
- Class-based handlers: Overkill for simple query matching and response generation
- External API calls: Not needed for current mock data implementation

**Implementation Approach**:
```typescript
// In copilotConfig.ts
const handleDeliveryQuery = async (query: string) => {
  // Pattern matching for order queries
  if (query.includes('订单') && query.includes('到哪')) {
    // Extract customer name, find order, return structured response
    return structuredResponse;
  }
  // Fallback to guidance message
  return guidanceMessage;
};
```

### RQ-004: What format should structured responses use?

**Decision**: Use plain text with structured formatting (newlines, bullet points) for readability. Rich content (tables, cards) only when needed (already supported via CopilotRichContent).

**Rationale**:
- Plain text is simple and works for most responses
- Structured formatting (newlines, bullets) improves readability
- Rich content support already exists for complex cases (BOM recommendations)
- Consistent with existing implementation patterns

**Alternatives Considered**:
- Markdown rendering: Adds dependency, overkill for simple responses
- HTML rendering: Security concerns, unnecessary complexity
- JSON structure: Too technical for end users

**Implementation Approach**:
```typescript
// Structured text response example
return `查询到订单 SO-20231105。
目前卡在【采购环节】，原因是"液压阀缺货"。
预计延期 7天，无法按原定 11-13 交付。
建议联系采购部催货。`;
```

## Technology Choices

### React Refs for DOM Measurement
- **Choice**: useRef + useEffect for header height measurement
- **Rationale**: Standard React pattern for DOM measurements, no additional dependencies
- **Alternatives**: ResizeObserver API (more complex, not needed for simple height)

### Custom Hook Pattern
- **Choice**: `useHeaderHeight` custom hook
- **Rationale**: Reusable, testable, follows React best practices
- **Alternatives**: Inline useEffect in component (less reusable)

### RQ-005: How to implement consistent floating chat bubble button across all pages?

**Decision**: Extract chat bubble button implementation from DeliveryView into a reusable pattern, apply to all view components with consistent styling (fixed bottom-right, MessageSquare icon, gradient background).

**Rationale**:
- Consistent UI/UX across all pages improves user experience
- Reusable pattern reduces code duplication
- Fixed positioning ensures button is always accessible
- Gradient background matches existing design system

**Alternatives Considered**:
- Shared component for chat bubble: Adds abstraction layer, current approach is simpler
- Different styles per page: Breaks consistency, not needed
- Header button only: Less discoverable, removed per FR-010

**Implementation Approach**:
```typescript
// In each view component (CockpitView, SearchView, etc.)
<button 
  onClick={toggleCopilot} 
  className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
>
  <MessageSquare size={24}/>
</button>
```

### RQ-006: Should header AI assistant button be removed completely?

**Decision**: Yes, remove the AI assistant button from SupplyChainApp header completely. Chat bubble button becomes the primary trigger for AI assistant.

**Rationale**:
- Simplifies UI by removing redundant trigger
- Chat bubble is more discoverable and consistent with modern chat UI patterns
- Reduces header clutter
- All pages now have consistent access point

**Alternatives Considered**:
- Keep both buttons: Redundant, adds confusion
- Hide header button conditionally: Unnecessary complexity
- Move header button to different location: Still redundant with chat bubble

**Implementation Approach**:
```typescript
// In SupplyChainApp.tsx - Remove this section:
// <button onClick={() => setCopilotOpen(!copilotOpen)}>
//   <Bot size={16}/> AI 助手
// </button>
```

### RQ-007: How to reorganize inventory optimization page layout (AI suggestions before agents)?

**Decision**: Move the AI suggestions section (currently at bottom) to display before the two agent sections (产品库存智能体 and 物料库存智能体) in InventoryView component.

**Rationale**:
- AI suggestions provide high-level overview that users should see first
- Placing suggestions before detailed agent sections follows information hierarchy (summary → details)
- Improves user experience by showing actionable insights upfront
- Simple reordering of existing JSX elements, no structural changes needed

**Alternatives Considered**:
- Keep suggestions at bottom: Less prominent, users may miss them
- Create separate top section: Adds complexity, current section can be moved
- Split suggestions between agents: Breaks coherence of AI analysis

**Implementation Approach**:
```typescript
// In InventoryView.tsx - Reorder JSX:
// 1. Header section
// 2. AI suggestions section (moved from bottom)
// 3. Two agent sections (产品库存智能体 and 物料库存智能体)
// 4. Chat bubble button
```

### RQ-008: How to refactor product supply optimization page layout?

**Decision**: 
1. Remove separate product selector panel
2. Integrate product selection into ProductSupplyAnalysisPanel with: AI suggestions, top 3 products by inventory (sorted descending), and search box
3. Integrate demand forecast cards into ProductSupplyAnalysisPanel for each product
4. Remove separate OptimizationSuggestionsPanel

**Rationale**:
- Consolidating product selection into analysis panel reduces UI clutter
- Top 3 products by inventory provides quick access to most relevant products
- Search box enables finding any product when needed
- Demand forecast integrated into analysis panel creates unified product view
- Removing separate optimization panel simplifies page structure while maintaining functionality

**Alternatives Considered**:
- Keep separate product selector: More UI elements, less integrated experience
- Keep separate demand forecast panel: Breaks requirement FR-015
- Keep separate optimization suggestions panel: Violates requirement FR-016
- Show all products in selector: Too many options, top 3 + search is better balance

**Implementation Approach**:
```typescript
// In ProductSupplyOptimizationPage.tsx:
// 1. Remove product selector panel (lines 80-100)
// 2. Remove OptimizationSuggestionsPanel from render
// 3. Update ProductSupplyAnalysisPanel to include:
//    - AI suggestions section
//    - Product selection (top 3 + search box)
//    - Demand forecast cards for each product
//    - Existing analysis metrics
```

### RQ-009: How to handle missing data (T22 product, hard drive material) for preset questions?

**Decision**: Add T22 product data and hard drive material data to mockData to ensure all preset questions have corresponding data support.

**Rationale**:
- Ensures data integrity and consistency
- All preset questions can reference real data from mockData
- No hardcoding of product/material names
- Supports demonstration with realistic data

**Alternatives Considered**:
- Use existing T20 product data to simulate T22: Breaks requirement, T22 is a new product
- Use generic material data: Not specific enough for realistic demonstration
- Hardcode data in query handlers: Violates requirement to reference mockData

**Implementation Approach**:
```typescript
// In mockData.ts - Add T22 product
{ 
  productId: 'PROD-010', 
  productName: '植保无人机T22', 
  materialCodes: ['MAT-001', 'MAT-002', 'MAT-003', 'MAT-004', 'MAT-HDD-001'],
  // ... other fields
}

// Add hard drive material
{
  materialCode: 'MAT-HDD-001',
  materialName: '硬盘',
  applicableProductIds: ['PROD-010', 'PROD-001', 'PROD-002'],
  // ... other fields
}
```

### RQ-010: How to handle missing SSD data for supplier evaluation preset questions?

**Decision**: Add SSD material and supplier data to mockData, keeping preset questions unchanged.

**Rationale**:
- Maintains consistency with other preset questions
- All data references from mockData, no hardcoding
- Supports realistic supplier recommendation queries
- Enables proper similar supplier matching logic

**Alternatives Considered**:
- Modify preset question to use existing material types: Changes user requirement
- Use placeholder data: Not realistic for demonstration
- Skip SSD supplier recommendation: Breaks requirement

**Implementation Approach**:
```typescript
// In mockData.ts - Add SSD material
{
  materialCode: 'MAT-SSD-001',
  materialName: 'SSD固态硬盘',
  applicableProductIds: ['PROD-001', 'PROD-002'],
  // ... other fields
}

// Add SSD supplier
{ 
  supplierId: 'SUP-009', 
  supplierName: 'SSD存储设备供应商', 
  materialName: 'SSD固态硬盘', 
  materialCode: 'MAT-SSD-001',
  // ... other fields
}
```

### RQ-011: How to implement fuzzy matching for material names (e.g., "北斗定位模块")?

**Decision**: Implement fuzzy matching function that matches query terms to multiple material names in mockData (e.g., "北斗定位模块" matches both "GPS定位器" and "北斗接收模块").

**Rationale**:
- Handles user query variations naturally
- Supports common name aliases and variations
- Improves user experience by accepting different phrasings
- Keeps preset questions user-friendly while maintaining data accuracy

**Alternatives Considered**:
- Exact name matching only: Too strict, breaks user experience
- Change preset question to exact material name: Less user-friendly
- Add alias field to material data: More complex, fuzzy matching is simpler

**Implementation Approach**:
```typescript
// In src/utils/fuzzyMatch.ts
import type { Material } from '../types/ontology';

// Alias mappings for material name variations
const materialAliases: Record<string, string[]> = {
  '北斗定位模块': ['GPS定位器', '北斗接收模块', 'RTK定位板'],
  // Additional aliases can be added as needed
};

export const fuzzyMatchMaterialName = (
  query: string,
  materials: Material[]
): Material[] => {
  const queryLower = query.trim().toLowerCase();
  const matches: Material[] = [];
  
  // Step 1: Check direct matches (case-insensitive substring)
  materials.forEach(material => {
    const materialNameLower = material.materialName.toLowerCase();
    if (materialNameLower.includes(queryLower) || queryLower.includes(materialNameLower)) {
      if (!matches.includes(material)) {
        matches.push(material);
      }
    }
  });
  
  // Step 2: Check alias mappings
  Object.entries(materialAliases).forEach(([alias, names]) => {
    const aliasLower = alias.toLowerCase();
    if (queryLower.includes(aliasLower) || aliasLower.includes(queryLower)) {
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

**Algorithm Details**:
1. **Normalization**: Query is trimmed and lowercased for consistent matching
2. **Direct Matching**: Case-insensitive substring matching against material names
3. **Alias Matching**: If query matches alias key, return materials matching alias values
4. **Deduplication**: Ensures no duplicate materials in results
5. **Return**: Array of all matching materials (can be empty or multiple)

### RQ-012: How to handle preset questions with placeholders (e.g., "性能要求：XXXX")?

**Decision**: Preset questions retain placeholders, and after clicking, the AI assistant prompts users to input specific requirements, then generates analysis based on input and mockData.

**Rationale**:
- Keeps preset questions concise and readable
- Allows users to customize requirements
- Interactive approach improves user engagement
- Analysis can be tailored to specific user needs

**Alternatives Considered**:
- Fill placeholders with example values: Less flexible, users may not need those values
- Remove placeholders, simplify question: Loses important context about what information is needed
- Pre-fill with default values: May not match user's actual requirements

**Implementation Approach**:
```typescript
// In copilotConfig.ts - handleProductSupplyEvaluationQuery
if (query.includes('T22') && query.includes('物料配置')) {
  // Check if query contains placeholder
  if (query.includes('XXXX')) {
    return '请提供具体的性能要求、功能要求和其他规格，我将为您生成详细的BOM配置和成本分析。';
  }
  // Process query with user-provided requirements
  // Generate BOM analysis based on requirements and mockData
}
```

### RQ-013: How to provide mock data-based preset answers for demonstration?

**Decision**: Create preset answer data structure in mockData or utility functions that returns detailed, realistic answers for each preset question based on actual mockData values.

**Rationale**:
- Ensures all preset questions have realistic, data-driven answers
- Answers reference actual products, suppliers, materials, orders from mockData
- No hardcoded strings, all data comes from mockData
- Supports consistent demonstration experience

**Alternatives Considered**:
- Hardcode answer strings: Violates requirement to reference mockData
- Generate answers dynamically only: May be inconsistent, preset answers ensure quality
- Use template strings with mockData: Good approach, but need structured preset answer data

**Implementation Approach**:
```typescript
// In mockData.ts or separate presetAnswers.ts
export const presetAnswers = {
  'product-supply-t22-bom': (requirements: { performance?: string, functionality?: string, specs?: string }) => {
    const t22Product = productsData.find(p => p.productName.includes('T22'));
    const materials = materialsData.filter(m => t22Product?.materialCodes.includes(m.materialCode));
    // Generate detailed BOM analysis using actual data
    return `基于您的需求，T22植保无人机的推荐BOM配置如下：\n${/* detailed analysis */}`;
  },
  // ... other preset answers
};
```

## Dependencies

No new dependencies required. Uses existing:
- React hooks (useState, useEffect, useRef)
- TypeScript for type safety
- Existing CopilotSidebar component
- Existing copilotConfig.ts pattern
- Lucide React icons (MessageSquare)
- Existing mockData structure (extended with new products, materials, suppliers)

## Performance Considerations

- Header height calculation: O(1) operation, runs on mount and resize
- Query handler pattern matching: O(n) where n is number of patterns, acceptable for small number of patterns per page
- Conversation reset: O(1) prop update, React handles efficiently

## Security Considerations

- Query handlers process user input: No security concerns for current mock data implementation
- Future: Sanitize user queries if connecting to external APIs

## Accessibility Considerations

- Sidebar positioning: Ensure sidebar remains accessible when header height changes
- Screen readers: Maintain existing accessibility features of CopilotSidebar component

