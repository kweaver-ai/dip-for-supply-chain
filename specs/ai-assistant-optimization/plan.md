# Implementation Plan: AI助手优化

**Branch**: `ai-assistant-optimization` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/ai-assistant-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化AI助手功能，使其成为每个页面的针对性智能体。主要改进包括：1) 使用JavaScript动态计算页眉高度，将CopilotSidebar顶部与页眉底部对齐；2) 为每个页面配置针对性的对话示例，包括默认开场白和2个预设问题；3) 实现结构化查询处理逻辑，返回包含状态、原因、延期、建议等信息的详细回答；4) 切换页面时重置对话历史，确保每个页面上下文独立；5) 所有页面采用统一的对话气泡样式触发AI助手（固定右下角位置）；6) 移除页眉的AI助手按钮；7) 库存优化页面：AI建议显示在两个智能体之前；8) 产品供应优化页面：移除产品选择面板，重构产品供应分析面板集成产品选择（前3个+搜索）和AI建议，为每个产品显示独立需求预测卡片，移除单独的优化建议面板；9) 为产品供应优化页面添加产品供应评估助手，支持T22植保无人机BOM配置查询和硬盘涨价影响分析；10) 为订单交付页面添加订单供应助手，支持订单状态和交付可行性查询；11) 为库存优化页面添加库存助手，支持产品/物料库存查询和文本选择分析；12) 为供应商评估页面添加供应商助手，支持供应商状态查询和相似供应商推荐；13) 在mockData中新增T22产品、硬盘物料、SSD物料和供应商数据以支持预设问题。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React DOM, Lucide React (icons), Tailwind CSS v4.1.17  
**Storage**: In-memory mock data (src/data/mockData.ts), existing order/inventory data structures, NEW: T22 product, hard drive material, SSD material and supplier data  
**Testing**: Manual testing, future: React Testing Library / Vitest  
**Target Platform**: Web browser (modern browsers supporting ES2020+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Sidebar positioning calculation < 100ms, query response < 1 second, page switch conversation reset < 50ms, fuzzy matching for material names < 50ms  
**Constraints**: Must follow Constitution principles (type ontology, semantic variables, component size limits), integrate with existing CopilotSidebar component and navigation system, all product/supplier/material/order names must reference mockData (no hardcoding), preset question answers must use mockData-based preset answers for demonstration  
**Scale/Scope**: 6 pages (cockpit, search, inventory, optimization, delivery, evaluation), each with 2 preset questions, dynamic header height calculation, floating chat bubble button on all pages, inventory page layout reorganization (AI suggestions before agents), product supply optimization page layout refactoring (integrated product selection and demand forecast), 4 new targeted AI assistants (product supply evaluation, order supply, inventory, supplier), new mockData entries (T22 product, hard drive material, SSD material and supplier), fuzzy matching for material name variations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Reference**: `.specify/memory/constitution.md`

### Principle Compliance Checklist

- [x] **P1 - Type System Ontology**: All data types conform to `src/types/ontology.ts`
  - New types MUST be defined in or extend from `src/types/ontology.ts`
  - No ad-hoc type definitions in component files
  - **Action Required**: No new types needed - reuse existing CopilotMessage and CopilotRichContent types
  
- [x] **P2 - Tailwind v4 Semantic Variables**: Styles use semantic variables, NOT hardcoded colors
  - All colors use semantic tokens (e.g., `bg-status-risk`, `text-primary`)
  - No hex color values (e.g., `#0f1419`, `#3B82F6`) in component code
  - **Action Required**: Use existing semantic variables from index.css
  
- [x] **P3 - Component Size Limit**: Components exceeding 150 lines reviewed for splitting
  - Large components identified and refactoring plan documented
  - **Action Required**: CopilotSidebar (93 lines) and copilotConfig.ts (124 lines) are within limits. Monitor if additions exceed 150 lines.
  
- [x] **P4 - Simulation Data Isolation**: Simulation mode logic isolated from real data
  - Clear separation between simulation and production data flows
  - No mutation of real data structures by simulation code
  - **Status**: Not applicable - this feature does not include simulation mode

**Violations**: None identified. All principles can be followed with proper implementation.

## Project Structure

### Documentation (this feature)

```text
specs/ai-assistant-optimization/
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
│   │   └── CopilotSidebar.tsx                 # Updated: Add dynamic top positioning prop
│   ├── views/
│   │   ├── CockpitView.tsx                    # Updated: Add floating chat bubble button
│   │   ├── SearchView.tsx                     # Updated: Add floating chat bubble button
│   │   ├── InventoryView.tsx                 # Updated: Move AI suggestions section before agent sections
│   │   ├── DeliveryView.tsx                   # Reference: Already has chat bubble button
│   │   └── ...                                # Other views updated similarly
│   └── product-supply-optimization/
│       ├── ProductSupplyOptimizationPage.tsx  # Updated: Remove product selector panel, remove OptimizationSuggestionsPanel
│       └── ProductSupplyAnalysisPanel.tsx     # Updated: Integrate product selection (top 3 + search), AI suggestions, demand forecast cards
├── utils/
│   └── copilotConfig.ts                        # Updated: Add all page-specific configurations
├── hooks/
│   └── useHeaderHeight.ts                      # New: Custom hook for dynamic header height calculation
└── SupplyChainApp.tsx                          # Updated: Remove header AI button, pass toggleCopilot to all views
```

**Structure Decision**: Single-page React application structure. New hook `useHeaderHeight.ts` handles dynamic header height calculation. CopilotSidebar component updated to accept `topOffset` prop. copilotConfig.ts extended with configurations for all 6 pages (cockpit, search, inventory, optimization, delivery, evaluation). SupplyChainApp updated to reset conversation history on page switch and remove header AI button. All view components updated to include floating chat bubble button matching delivery page style. InventoryView restructured to display AI suggestions section before the two agent sections (产品库存智能体 and 物料库存智能体). ProductSupplyOptimizationPage refactored: product selector panel removed, ProductSupplyAnalysisPanel enhanced to integrate product selection (top 3 by inventory + search box), AI suggestions, and demand forecast cards for each product. OptimizationSuggestionsPanel removed as separate panel.

## Phase 0: Research & Analysis ✅

**Status**: Complete

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
- Use React refs and useEffect to dynamically calculate header height
- Create custom hook `useHeaderHeight` for reusable header height calculation
- Reset conversation history by updating `initialMessages` prop when page changes
- Extend existing `copilotConfig.ts` with configurations for all pages
- Use consistent floating chat bubble button style across all pages (fixed bottom-right, MessageSquare icon, gradient background)
- Remove header AI assistant button to simplify UI and use chat bubble as primary trigger
- Reorganize inventory optimization page: Move AI suggestions section before agent sections for better information hierarchy
- Refactor product supply optimization page: Remove separate product selector panel, integrate product selection into ProductSupplyAnalysisPanel with top 3 products by inventory + search, integrate demand forecast cards, remove separate OptimizationSuggestionsPanel
- Add T22 product data and hard drive material data to mockData to support product supply evaluation preset questions
- Add SSD material and supplier data to mockData to support supplier evaluation preset questions
- Implement fuzzy matching for material names (e.g., "北斗定位模块" matches both "GPS定位器" and "北斗接收模块")
- Handle preset questions with placeholders by prompting users to input specific requirements after clicking
- Generate detailed BOM, material supply, and cost optimization analysis for product supply evaluation queries
- Provide mock data-based preset answers for all preset questions to support demonstration
- All product names, supplier names, material names, and order customer names must reference mockData, not hardcoded

## Phase 1: Design & Contracts ✅

**Status**: Complete

### Data Model

See [data-model.md](./data-model.md) for entity definitions.

**Key Entities**:
- **CopilotSidebarProps**: Extended with optional `topOffset` prop for dynamic positioning
- **PageAssistantConfig**: Configuration object for each page (title, opening message, 2 preset questions, query handler)
- **QueryResponse**: Structured response format (text, optional richContent)
- **ChatBubbleButton**: Floating button component with consistent styling across all pages (fixed bottom-right, MessageSquare icon, gradient background)
- **ProductSupplyAnalysisPanel** (Extended): Enhanced panel integrating product selection (top 3 by inventory + search), AI suggestions, and demand forecast cards for each product
- **InventoryView Layout** (Updated): Reorganized layout with AI suggestions section displayed before agent sections
- **T22 Product Data** (New): Product data in mockData for T22植保无人机 to support BOM configuration queries
- **Hard Drive Material Data** (New): Material data in mockData for 硬盘 to support price impact analysis queries
- **SSD Material and Supplier Data** (New): Material and supplier data in mockData for SSD to support similar supplier recommendation queries
- **Fuzzy Matching Logic**: Material name matching function that handles variations (e.g., "北斗定位模块" → ["GPS定位器", "北斗接收模块"])
- **Preset Answer Data**: Mock data-based preset answers for all preset questions to support demonstration

### API Contracts

See [contracts/](./contracts/) directory for detailed API specifications.

**Key Contracts**:
- `getCopilotConfig(view: string)`: Returns page-specific assistant configuration
- `useHeaderHeight(headerRef: RefObject<HTMLElement>)`: Returns calculated header height
- Query handlers: Each page has its own query handler function that processes user queries
  - `handleProductSupplyEvaluationQuery(query: string)`: Handles T22 BOM configuration and hard drive price impact queries
  - `handleOrderSupplyQuery(query: string)`: Handles order status and delivery feasibility queries
  - `handleInventoryQuery(query: string)`: Handles product/material inventory queries with fuzzy matching
  - `handleSupplierQuery(query: string)`: Handles supplier status and similar supplier recommendation queries
- `toggleCopilot: () => void`: Function passed to all view components to trigger sidebar open/close
- Chat bubble button: Consistent implementation across all view components
- `fuzzyMatchMaterialName(query: string, materials: Material[])`: Matches material name variations (e.g., "北斗定位模块" → ["GPS定位器", "北斗接收模块"])
- `getPresetAnswer(presetQuestionId: string)`: Returns mock data-based preset answer for demonstration

### Quick Start

See [quickstart.md](./quickstart.md) for implementation guide.

## Phase 2: Implementation Tasks

**Status**: Pending - See [tasks.md](./tasks.md) (created by `/speckit.tasks` command)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

