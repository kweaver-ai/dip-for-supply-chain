# AI助手优化功能规范

## Overview

优化AI助手功能，使其成为每个页面的针对性智能体，负责相关对话和分析。主要改进包括：
1. AI助手侧边栏位置调整：顶部与页眉下部对齐
2. 每个页面配置针对性的对话示例，包括默认开场白和预设问题
3. 所有页面采用对话气泡样式触发AI助手（参考订单交付页面）
4. 移除页眉的AI助手按钮
5. 库存优化页面：AI建议显示在两个智能体之前
6. 产品供应优化页面：重构产品选择和需求预测显示方式
7. 为每个页面添加针对性的AI助手，支持预设问题和对话分析功能

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST position CopilotSidebar top edge aligned with bottom edge of page header using dynamic JavaScript calculation to get header height
- **FR-002**: System MUST configure page-specific AI assistants for each view (cockpit, search, inventory, optimization, delivery, evaluation)
- **FR-003**: System MUST provide default opening message for each page-specific assistant
- **FR-004**: System MUST provide exactly 2 preset questions (suggestions) for each page-specific assistant
- **FR-005**: System MUST implement query handling logic that returns structured contextual answers for preset questions, including status, reason, delays, and recommendations
- **FR-006**: System MUST implement order delivery assistant with example: "黑龙江农垦的订单到哪了？" → Answer about order SO-20231105 *(Note: This is an example requirement illustrating FR-018. The actual implementation requirement is specified in FR-018)*
- **FR-007**: System MUST reset conversation history when user switches pages, each page starts fresh with its default opening message
- **FR-008**: System MUST handle unmatched queries by providing helpful guidance prompting users to use preset questions and offering relevant suggestions
- **FR-009**: System MUST provide a floating chat bubble button on all pages (cockpit, search, inventory, optimization, delivery, evaluation) positioned at fixed bottom-right corner (bottom-8 right-8) with MessageSquare icon and gradient background matching delivery page style
- **FR-010**: System MUST remove the AI assistant button from the page header in SupplyChainApp component
- **FR-011**: System MUST pass toggleCopilot function to all view components (cockpit, search, inventory, optimization, delivery, evaluation) to enable chat bubble interaction
- **FR-012**: System MUST display AI suggestions section BEFORE the two agent sections (产品库存智能体 and 物料库存智能体) on the inventory optimization page
- **FR-013**: System MUST remove the product selector panel from the product supply optimization page
- **FR-014**: System MUST integrate product selection into the Product Supply Analysis panel with: AI suggestions, top 3 products by current inventory level (sorted descending by currentInventoryLevel), and product name search box
- **FR-015**: System MUST integrate demand forecast into Product Supply Analysis panel, displaying independent demand forecast card/block for each product (top 3 + search results) with predicted value, confidence level, chart, and other forecast metrics
- **FR-016**: System MUST remove the separate Optimization Suggestions panel from the product supply optimization page
- **FR-017**: System MUST implement product supply evaluation assistant for product supply optimization page with preset questions about new product BOM configuration and material price impact analysis
- **FR-018**: System MUST implement order supply assistant for delivery page with preset question about order status and delivery feasibility. This requirement encompasses FR-006 (which provides a concrete example: "黑龙江农垦的订单到哪了？" → Answer about order status, delays, and recommendations)
- **FR-019**: System MUST implement inventory assistant for inventory optimization page with preset questions about product/material inventory and order quantity, supporting text-based selection for analysis
- **FR-020**: System MUST implement supplier assistant for supplier evaluation page with preset questions about supplier status and similar supplier recommendations
- **FR-021**: System MUST add T22 product data and hard drive material data to mockData to support preset questions
- **FR-022**: System MUST add SSD material and supplier data to mockData to support supplier evaluation preset questions
- **FR-023**: System MUST implement fuzzy matching for material names (e.g., "北斗定位模块" should match both "GPS定位器" and "北斗接收模块")
- **FR-024**: System MUST handle preset questions with placeholders (e.g., "性能要求：XXXX") by prompting users to input specific requirements after clicking
- **FR-025**: System MUST generate detailed BOM, material supply, and cost optimization analysis for product supply evaluation queries. The analysis MUST include:
  - **BOM Configuration**: Complete list of materials/components with material codes, names, recommended parts, unit costs, and availability status (In Stock, Procure, NPI)
  - **Material Supply Analysis**: Current stock levels, supplier information, lead times, and supply risk assessment for each material
  - **Cost Optimization Analysis**: Total BOM cost estimate, cost breakdown by component, optimization recommendations (e.g., material reuse opportunities, cost reduction strategies), and cost impact of alternative configurations
  - **Format**: Analysis MUST be presented as structured text response with optional rich content (tables, cards) for better readability
- **FR-026**: System MUST provide mock data-based preset answers for all preset questions to support demonstration

### User Stories

- **US-001**: As a user on the order delivery page, I want to ask "黑龙江农垦的订单到哪了？" and receive a detailed answer about order status, delays, and recommendations.
- **US-002**: As a user on the product supply optimization page, I want to ask "准备新上T22植保无人机，性能要求：XXXX，功能要求：XXXX，其他规格XXXX，可用的物料配置是哪些？" and receive detailed BOM, material supply, and cost optimization analysis.
- **US-003**: As a user on the product supply optimization page, I want to ask "硬盘供应涨价50%，对现有产品有哪些影响，如何应对？" and receive impact analysis and response recommendations.
- **US-004**: As a user on the delivery page, I want to ask "黑龙江农垦的订单到哪个环节了？是否可以如期交付" and receive order status and delivery feasibility analysis.
- **US-005**: As a user on the inventory optimization page, I want to ask "植保无人机T20库存如何，订单量如何？" or "北斗定位模块的库存如何？" and receive inventory analysis and optimization suggestions.
- **US-006**: As a user on the supplier evaluation page, I want to ask "北斗科技电子元件有限公司最近供应情况如何？" or "市面上与农业装备零部件供应商公司相似的SSD供应商有哪些？" and receive supplier status and similar supplier recommendations.

## Key Entities

- **Page-specific AI Assistant**: Each view has its own assistant with tailored title, opening message, and query handling
- **Preset Questions**: Clickable suggestion buttons that trigger specific queries
- **Query Handler**: Function that processes user queries and returns contextual responses

## Page-Specific AI Assistant Configurations

### Product Supply Optimization Page - Product Supply Evaluation Assistant

**Title**: 产品供应评估助手

**Preset Questions**:
1. "准备新上T22植保无人机，性能要求：XXXX，功能要求：XXXX，其他规格XXXX，可用的物料配置是哪些？"
   - When clicked, prompts user to input specific requirements (performance, functionality, specifications)
   - Generates detailed BOM configuration, material supply analysis, and cost optimization analysis
   - All data references from mockData (T22 product, materials, suppliers)
   
2. "硬盘供应涨价50%，对现有产品有哪些影响，如何应对？"
   - Analyzes impact of hard drive price increase on existing products
   - Provides response recommendations
   - All product names and material names referenced from mockData

**Query Handling**:
- Supports BOM recommendation queries with rich content display
- Analyzes material supply and cost optimization
- Handles price impact queries with detailed analysis

### Delivery Page - Order Supply Assistant

**Title**: 订单供应助手

**Preset Questions**:
1. "黑龙江农垦的订单到哪个环节了？是否可以如期交付"
   - Queries order status for 黑龙江农垦 (黑龙江农垦总局) from mockData
   - Provides current stage, delivery feasibility, and recommendations
   - All order and customer names referenced from mockData

**Query Handling**:
- Matches customer names from queries to orders in mockData
- Provides order status, delays, and recommendations
- Handles delivery feasibility queries

### Inventory Optimization Page - Inventory Assistant

**Title**: 库存助手

**Preset Questions**:
1. "植保无人机T20库存如何，订单量如何？"
   - Analyzes T20 product inventory and order quantity from mockData
   - Provides inventory status and optimization suggestions
   
2. "北斗定位模块的库存如何？"
   - Uses fuzzy matching to identify "GPS定位器" (MAT-002) and "北斗接收模块" (MAT-007)
   - Analyzes inventory status for matched materials
   - Provides optimization suggestions

**Query Handling**:
- Supports text-based product/material selection in conversation
- Users can input product/material names, AI identifies and analyzes
- Provides inventory analysis and optimization recommendations
- All product and material names referenced from mockData

### Supplier Evaluation Page - Supplier Assistant

**Title**: 供应商助手

**Preset Questions**:
1. "北斗科技电子元件有限公司最近供应情况如何？"
   - Queries supplier status for 北斗科技电子元件有限公司 (SUP-001) from mockData
   - Provides supply status, quality rating, risk assessment, and recommendations
   
2. "市面上与农业装备零部件供应商公司相似的SSD供应商有哪些？"
   - Finds similar suppliers to 农业装备零部件供应商 (SUP-004) for SSD materials
   - Provides supplier recommendations with similarity scores
   - All supplier names and material types referenced from mockData

**Query Handling**:
- Matches supplier names from queries to suppliers in mockData
- Provides supplier status and evaluation information
- Handles similar supplier recommendation queries
- All supplier and material data referenced from mockData

## Success Criteria

- CopilotSidebar top aligns with page header bottom
- Each page has a unique assistant title and opening message
- Preset questions work correctly and return relevant answers
- Order delivery assistant correctly answers example query about 黑龙江农垦 order
- All pages display floating chat bubble button at bottom-right corner
- Page header no longer contains AI assistant button
- Inventory optimization page displays AI suggestions section before the two agent sections
- Product supply optimization page removes separate product selector panel
- Product Supply Analysis panel integrates product selection (top 3 by inventory + search) and AI suggestions
- Each product in Product Supply Analysis panel displays independent demand forecast card with metrics and chart
- Separate Optimization Suggestions panel is removed from product supply optimization page

## Edge Cases

- What if header height changes dynamically? (handled by dynamic calculation)

## Clarifications

### Session 2024-12-19

- Q: How should CopilotSidebar top position be calculated relative to page header? → A: Dynamic calculation using JavaScript to get header height and set top value
- Q: What happens to conversation history when user switches pages? → A: Reset conversation history on page switch, each page starts with default opening message
- Q: How many preset questions should each page have? → A: 2 preset questions per page to keep it simple
- Q: What format should preset question answers use? → A: Structured text responses with key information (status, reason, delay, recommendations) like the order delivery example
- Q: How should queries that don't match preset patterns be handled? → A: Provide helpful guidance prompting users to use preset questions and offer relevant suggestions

### Session 2024-12-19 (Chat Bubble UI)

- Q: Should all pages use the same floating chat bubble style and position as the delivery page? → A: Yes, all pages use identical fixed bottom-right chat bubble (bottom-8 right-8) with MessageSquare icon and gradient background

### Session 2024-12-19 (Page Layout Optimization)

- Q: How should "top 3 products by inventory level" be determined? → A: Sort by current inventory level (currentInventoryLevel) in descending order, select top 3
- Q: How should demand forecast be displayed for each product in the Product Supply Analysis panel? → A: Display independent demand forecast card/block for each product (top 3 + search results) within the Product Supply Analysis panel, including predicted value, confidence level, chart, etc.

### Session 2024-12-XX (Targeted AI Assistants Enhancement)

- Q: How should missing data (T22 product, hard drive material) be handled for preset questions? → A: Add T22 product data and hard drive material data to mockData to ensure all preset questions have corresponding data support
- Q: How should preset questions with placeholders (e.g., "性能要求：XXXX") be handled? → A: Preset questions should retain placeholders, and after clicking, the AI assistant should prompt users to input specific requirements, then generate analysis based on input and mockData
- Q: How should "select a product/inventory for conversation analysis" be implemented on the inventory optimization page? → A: Through conversational text selection - users input product/material names in the conversation (e.g., "分析T20的库存情况"), and the AI assistant identifies and analyzes them
- Q: How should missing SSD supplier data be handled for supplier evaluation preset questions? → A: Add SSD material and supplier data to mockData, keeping preset questions unchanged
- Q: How should "北斗定位模块" be handled when it doesn't exactly match mockData material names? → A: Keep preset question as "北斗定位模块", and the AI assistant should match both "GPS定位器" and "北斗接收模块" when identifying queries

## Assumptions

- Header height is consistent across all pages
- Each page has exactly 2 preset questions
- Query handlers can access page-specific data (orders, inventory, etc.)
- All view components accept toggleCopilot prop function
- Chat bubble button style matches delivery page implementation (gradient background, MessageSquare icon, fixed positioning)
- All product names, supplier names, material names, and order customer names should be referenced from mockData, not hardcoded
- Preset question answers should be provided through mockData-based preset answers for demonstration purposes
- T22 product and hard drive material data will be added to mockData
- SSD material and supplier data will be added to mockData
- AI assistants support fuzzy matching for material/product names to handle variations in user queries

