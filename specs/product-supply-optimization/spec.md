# Feature Specification: 产品供应优化页面

**Feature Branch**: `product-supply-optimization`  
**Created**: 2024-12-19  
**Updated**: 2025-01-29  
**Status**: Draft  
**Input**: User description: "参考设计链接，增加产品供应优化页面，放在库存页面之后"

## Overview

产品供应优化页面提供产品供应的全面分析和优化建议，帮助企业实现更高效的库存管理和供应链优化。页面将作为新的主导航项，放置在库存页面之后。

## Clarifications

### Session 2024-12-19

- Q: 产品供应分析面板应展示哪些核心指标？ → A: 综合指标：供应商数量、平均交货周期、供货稳定性评分、当前库存水平、缺货风险等级
- Q: 需求预测应基于哪些数据源和算法？ → A: 历史订单数据 + 简单移动平均：基于历史订单数据，使用移动平均算法预测未来需求
- Q: 库存优化建议应包含哪些类型和建议优先级？ → A: 补货建议、清库存建议、安全库存调整，优先级分为高/中/低
- Q: 产品供应优化页面的页面布局应如何组织？ → A: 多面板布局：产品供应分析面板、需求预测面板、优化建议面板、风险预警面板，上下排列
- Q: 产品供应优化页面的AI助手应如何实现？ → A: 复用现有CopilotSidebar组件，配置页面专属对话示例和上下文

### Session 2025-01-29

- Q: 产品供应分析面板标题是否显示产品名称？ → A: 保持当前标题"产品供应分析"，仅在面板内容中显示产品名称和新增信息
- Q: 产品业绩及投资回报率（ROI）的数据来源？ → A: 从 ProductLifecycleAssessment 实体获取 ROI 数据，显示为百分比格式（如 "18.5%"）
- Q: 产品库存信息中的"订单量"定义？ → A: 待交付订单数量（状态为"生产中"或"运输中"的订单数量总和）
- Q: 产品建议动作的显示和执行方式？ → A: 显示为可点击按钮，点击后执行动作并记录到 ActionHistory
- Q: 产品生命周期的显示方式？ → A: 从 Product.status 字段获取，显示为中文标签（"销售中"、"停止销售"、"停止扩容"、"停止服务"）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看产品供应分析 (Priority: P1)

用户需要查看各产品的供应情况，包括供应商数量、交货周期、历史供货稳定性等指标。

**Why this priority**: 这是产品供应优化的核心功能，帮助用户了解产品供应现状。

**Independent Test**: 访问产品供应优化页面，验证产品供应分析面板显示正确，包含供应商数量、交货周期、供货稳定性等指标。

**Acceptance Scenarios**:

1. **Given** 用户已登录系统, **When** 用户访问产品供应优化页面, **Then** 显示产品供应分析面板
2. **Given** 存在产品数据, **When** 用户查看分析面板, **Then** 显示各产品的供应商数量、交货周期、历史供货稳定性等指标

---

### User Story 2 - 查看需求预测和优化建议 (Priority: P1)

用户需要查看基于历史数据的需求预测，以及库存优化建议（补货或清库存建议）。

**Why this priority**: 提供数据驱动的决策支持，优化库存管理。

**Independent Test**: 在产品供应优化页面，验证需求预测和优化建议功能正常显示。

**Acceptance Scenarios**:

1. **Given** 用户在产品供应优化页面, **When** 用户查看需求预测, **Then** 显示基于历史数据的未来需求预测
2. **Given** 系统有库存数据, **When** 用户查看优化建议, **Then** 显示补货或清库存的建议

---

### User Story 3 - 使用产品供应优化AI助手 (Priority: P2)

用户需要与产品供应优化页面的专属AI助手对话，查询供应情况和获取优化建议。

**Why this priority**: 提供智能化的产品供应查询和优化建议支持。

**Independent Test**: 打开产品供应优化页面AI助手，验证对话功能正常，能够回答供应查询和优化建议问题。

**Acceptance Scenarios**:

1. **Given** 用户在产品供应优化页面, **When** 用户打开AI助手, **Then** 显示产品供应优化专属助手界面
2. **Given** 用户询问供应情况, **When** 输入查询, **Then** 助手返回产品供应分析
3. **Given** 用户需要优化建议, **When** 输入查询, **Then** 助手返回优化建议

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display product supply analysis panel with comprehensive metrics: supplier count, average delivery cycle, supply stability score, current inventory level, stockout risk level
- **FR-001.1**: System MUST display product name in the panel content (not in the title, which remains "产品供应分析")
- **FR-001.2**: System MUST display product basic information section: product name, product lifecycle (from Product.status), performance and ROI (from ProductLifecycleAssessment.roi)
- **FR-001.3**: System MUST display product inventory information section: product inventory quantity (from Product.stockQuantity), order quantity (sum of orders with status "生产中" or "运输中")
- **FR-001.4**: System MUST display product suggested actions section with conditional logic:
  - IF (stopSalesDate - currentDate < 180 days) AND (inventory > 100): show "促销" action button
  - IF (stopServiceDate - currentDate < 1 year) AND (inventory > 100): show "市场销售提醒" action button
- **FR-001.5**: System MUST implement action buttons that execute actions and record to ActionHistory when clicked
- **FR-002**: System MUST display demand forecast based on historical order data using moving average algorithm
- **FR-002.1**: System MUST calculate demand forecast for future periods (e.g., next 30/60/90 days) using historical order quantities
- **FR-003**: System MUST provide inventory optimization suggestions: replenishment suggestions, clearance suggestions, safety stock adjustments
- **FR-003.1**: System MUST assign priority levels (high/medium/low) to each optimization suggestion
- **FR-004**: System MUST display supplier evaluation for products (quality, price, delivery timeliness)
  - **Clarification**: Supplier evaluation data is sourced from existing Supplier360Scorecard feature (see supplier-evaluation page). This requirement is satisfied by:
    - Displaying key supplier evaluation metrics (quality rating, price competitiveness, delivery timeliness) in the ProductSupplyAnalysisPanel or related panels
    - Providing links to detailed supplier evaluation data in the supplier evaluation page
    - No new supplier evaluation UI components are required; this is a data integration requirement
- **FR-005**: System MUST provide risk alerts for potential supply chain risks
  - **Clarification**: Risk alerts are provided by the existing RiskAlertsPanel component. This requirement is satisfied by:
    - Integrating RiskAlertsPanel into ProductSupplyOptimizationPage layout (per FR-008)
    - RiskAlertsPanel displays supply chain risk alerts with severity levels (low, medium, high, critical)
    - Risk types include: inventory risk, supplier risk, forecast risk, quality risk
    - The component already exists and implements this functionality
- **FR-006**: System MUST provide page-specific AI assistant for product supply optimization page
- **FR-007**: System MUST integrate with existing navigation system, placed after inventory page
- **FR-008**: System MUST organize page layout with multiple panels arranged vertically: product supply analysis panel, demand forecast panel, optimization suggestions panel, risk alerts panel

### Key Entities *(include if feature involves data)*

- **ProductSupplyAnalysis**: Product ID, supplier count, delivery cycle, supply stability metrics
- **DemandForecast**: Product ID, forecast period, predicted demand, confidence level
- **OptimizationSuggestion**: Product ID, suggestion type (replenish/clearance), reason, priority
- **SupplyRiskAlert**: Product ID, risk type, severity, description
- **Product**: Product ID, product name, status (lifecycle stage), stock quantity
- **ProductLifecycleAssessment**: Product ID, ROI percentage
- **Order**: Order ID, product ID, quantity, status (for calculating pending order quantity)
- **ActionHistory**: Action ID, entity type, entity ID, action name, executed timestamp (for recording action executions)

**Note**: All entity types MUST be defined in `src/types/ontology.ts` per Principle 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Product supply analysis panel displays within 2 seconds of page load
- **SC-002**: Demand forecast calculations complete within 3 seconds
- **SC-003**: AI assistant responds to queries within 3 seconds

## Edge Cases

- What happens when a product has no supplier data?
- How does system handle missing historical data for demand forecast?
- What happens when optimization suggestions conflict with current inventory levels?
- What happens when ProductLifecycleAssessment data is missing for a product? (ROI should display as "N/A" or be hidden)
- What happens when a product has no pending orders? (Order quantity should display as 0)
- What happens when stopSalesDate or stopServiceDate is missing? (Suggested actions should not be displayed)
- What happens when multiple action conditions are met simultaneously? (Both action buttons should be displayed)

