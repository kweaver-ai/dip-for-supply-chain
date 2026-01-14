# Feature Specification: 供应商评估分析页面（需求变更）

**Feature Branch**: `supplier-evaluation`  
**Created**: 2024-12-19  
**Updated**: 2024-12-20  
**Status**: Draft  
**Input**: User description: "供应商评估的页面需求变更及AI助手变更"

## Overview

供应商评估分析页面提供两个核心面板：主要物料供应商面板和供应商360°评分卡，并集成专属AI助手支持供应商情况查询和物料供应寻源对话。

## Clarifications

### Session 2024-12-19

- Q: 主要物料供应商面板中，"主要物料"应如何确定？ → A: 按年度采购额自动排序前N个物料（N可配置，默认10个）
- Q: 供应商360°评分卡的评分维度与之前7个评估维度的关系是什么？ → A: 完全替换 - 360°评分卡替代原有的7个维度评估
- Q: 供应商风险评估中的"舆情"、"生产异常"、"法律风险"数据应如何获取和更新？ → A: 混合模式：部分自动采集（如法律风险），部分手动录入（如生产异常、舆情）
- Q: "切换备选供应商"操作的工作流程是什么？ → A: 两步确认：先显示备选供应商列表和对比信息，用户确认后执行切换
- Q: 供应商评估页面的AI助手应如何实现？ → A: 使用现有的CopilotSidebar组件，但配置专属的对话示例和上下文
- Q: "供应商评估页面优化"中的"优化"具体指什么？ → A: 确认保留：仅确认保留现有360°评分卡和风险评估功能，无需额外优化
- Q: 供应商360°评分卡在供应商评估页面应如何显示？ → A: 并列显示：主要物料面板和360°评分卡同时显示在页面上（分左右或上下布局）

### Session 2024-12-20

- Q: 主要物料供应商面板中，"库存量排名前5"的"库存量"具体指什么？ → A: 物料的当前库存量（Material.currentStock）
- Q: 供应商360°评分卡应包含哪些评分维度？ → A: 6个维度：交货准时率、质量评级、风险评级、准时交付率、年度采购额、响应速度（年度采购额为展示指标，不参与评分计算）
- Q: 供应商评估面板中，下拉列表的供应商应按什么指标降序排序？ → A: 按年度采购额降序（供应商的年度总采购金额）
- Q: 当质量评级、风险评级、准时交付率、年度采购额数据为0时，如何处理？ → A: 字段值为0或null/undefined（数据缺失）时，优先从mockdata随机生成
- Q: 外部数据即时搜索（重大质押、法人代表限制高消费等）应如何实现？ → A: 用户查看供应商时实时调用外部API获取最新数据

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看主要物料供应商面板 (Priority: P1)

用户需要查看主要物料的供应商信息，包括年度采购额、风险系数、质量事件，并能够执行切换备选供应商操作。

**Why this priority**: 这是供应商评估的核心功能，帮助用户快速识别关键物料的供应商风险。

**Independent Test**: 访问供应商评估页面，验证主要物料供应商面板显示正确，切换备选供应商功能可用。

**Acceptance Scenarios**:

1. **Given** 用户已登录系统, **When** 用户访问供应商评估页面, **Then** 显示主要物料供应商面板
2. **Given** 存在主要物料数据, **When** 用户查看面板, **Then** 显示物料、供应商、年度采购额、风险系数、质量事件
3. **Given** 用户点击切换备选供应商, **When** 执行操作, **Then** 显示备选供应商列表并允许切换

---

### User Story 2 - 查看供应商360°评分卡 (Priority: P1)

用户需要查看供应商的360°评分卡，包括交货准时率、质量、价格、响应速度等维度评分，以及供应商风险评估（财务状况、舆情、生产异常、法律风险），并能够执行切换备选供应商或寻源操作。

**Why this priority**: 提供全面的供应商评估视图，支持风险决策。

**Independent Test**: 点击供应商，验证360°评分卡显示所有维度和风险评估信息，切换备选供应商和寻源功能可用。

**Acceptance Scenarios**:

1. **Given** 用户在供应商评估页面, **When** 页面加载, **Then** 同时显示主要物料供应商面板和供应商360°评分卡（并列布局）
2. **Given** 用户在供应商评估页面, **When** 用户点击某个供应商, **Then** 更新360°评分卡显示该供应商的评估信息
3. **Given** 供应商有评估数据, **When** 用户查看评分卡, **Then** 显示交货准时率、质量、价格、响应速度等维度评分
4. **Given** 供应商有风险数据, **When** 用户查看风险评估, **Then** 显示财务状况、舆情、生产异常、法律风险信息
5. **Given** 用户需要切换供应商, **When** 点击切换备选供应商或寻源, **Then** 显示相应操作界面

---

### User Story 3 - 使用供应商评估AI助手 (Priority: P2)

用户需要与供应商评估页面的专属AI助手对话，查询供应商情况和进行物料供应寻源。

**Why this priority**: 提供智能化的供应商信息查询和寻源支持。

**Independent Test**: 打开供应商评估页面AI助手，验证对话功能正常，能够回答供应商情况查询和物料寻源问题。

**Acceptance Scenarios**:

1. **Given** 用户在供应商评估页面, **When** 用户打开AI助手, **Then** 显示供应商评估专属助手界面
2. **Given** 用户询问供应商情况, **When** 输入"X供应商最近供应情况如何？", **Then** 助手返回该供应商的供应情况分析
3. **Given** 用户需要寻源, **When** 输入"市面上与XX公司相似的SSD供应商有哪些？", **Then** 助手返回相似供应商推荐列表

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display main material supplier panel with: supplier name, material name, current stock, quality rating, risk rating, on-time delivery rate, annual purchase amount
- **FR-001.1**: System MUST automatically determine "main materials" by sorting materials by current stock (Material.currentStock) in descending order and selecting top 5 materials
- **FR-002**: System MUST support "switch to alternative supplier" action from main material supplier panel
- **FR-002.1**: System MUST implement two-step confirmation workflow: first display alternative supplier list with comparison information, then require user confirmation before executing switch
- **FR-003**: System MUST display supplier 360° scorecard with dimensions: on-time delivery rate, quality rating, risk rating, on-time delivery rate (duplicate for display), annual purchase amount (display only, not scored), response speed
- **FR-003.1**: System MUST display 6 dimensions in 360° scorecard: on-time delivery rate, quality rating, risk rating, on-time delivery rate (duplicate), annual purchase amount (display metric), response speed
- **FR-003.2**: System MUST display main material supplier panel and supplier 360° scorecard side by side (parallel layout) on the supplier evaluation page
- **FR-003.3**: System MUST provide a dropdown list in supplier evaluation panel to select all suppliers, sorted by annual purchase amount in descending order
- **FR-004**: System MUST display supplier risk assessment including: financial status, public sentiment, production anomalies, legal risks (major pledges, legal representative restrictions, etc.)
- **FR-004.1**: System MUST support hybrid data acquisition: automatic collection for legal risks (from public data sources), manual entry for production anomalies and public sentiment
- **FR-004.2**: System MUST perform real-time external API calls when user views a supplier to fetch latest legal risk data (major pledges, legal representative restrictions, etc.)
- **FR-005**: System MUST support "switch to alternative supplier" and "sourcing" actions from 360° scorecard
- **FR-006**: System MUST provide page-specific AI assistant for supplier evaluation page
- **FR-006.1**: System MUST reuse existing CopilotSidebar component with page-specific conversation examples and context
- **FR-007**: System MUST support supplier situation queries (e.g., "X供应商最近供应情况如何？")
- **FR-008**: System MUST support material sourcing queries (e.g., "市面上与XX公司相似的SSD供应商有哪些？")
- **FR-009**: System MUST provide 1-2 conversation examples for the supplier evaluation AI assistant
- **FR-010**: Each page's AI assistant MUST be page-specific and not exceed page scope
- **FR-011**: System MUST generate random mock data for quality rating, risk rating, on-time delivery rate, and annual purchase amount when these fields are 0 or null/undefined (missing data)

### Key Entities *(include if feature involves data)*

- **MainMaterialSupplier**: Material name, supplier name, annual purchase amount, risk coefficient, quality events
- **Supplier360Scorecard**: Supplier ID, dimension scores (delivery, quality, price, response speed), risk assessment details
- **RiskAssessment**: Financial status, public sentiment, production anomalies, legal risks
- **AlternativeSupplier**: Supplier ID, similarity score, recommendation reason
- **AIConversation**: Conversation history, context, responses

**Note**: All entity types MUST be defined in `src/types/ontology.ts` per Principle 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Main material supplier panel displays within 2 seconds of page load
- **SC-002**: Supplier 360° scorecard displays all dimensions and risk assessments correctly
- **SC-003**: AI assistant responds to queries within 3 seconds
- **SC-004**: Switch to alternative supplier action completes within 5 seconds

## Edge Cases

- What happens when a material has no alternative suppliers?
- How does system handle missing risk assessment data?
- What happens when AI assistant cannot find relevant suppliers for sourcing queries?
- How does system handle concurrent supplier switching requests?
- What happens when annual purchase amount data is incomplete for main material determination?

## AI Assistant Conversation Examples

### Example 1: Supplier Situation Query

**User**: "供应商A最近供应情况如何？"

**Assistant**: "根据最新评估数据，供应商A的供应情况如下：
- 交货准时率：88%（良好）
- 质量评分：90分（优秀）
- 价格竞争力：75分（中等）
- 响应速度：88分（良好）
- 综合风险等级：低风险
- 最近质量事件：无重大事件
- 建议：继续保持合作关系，可考虑增加采购量。"

### Example 2: Material Sourcing Query

**User**: "市面上与XX公司相似的SSD供应商有哪些？"

**Assistant**: "基于产品类型和业务特征分析，以下供应商与XX公司相似：
1. **供应商B** - 相似度85%
   - 主要产品：SSD存储设备
   - 价格竞争力：70分
   - 风险等级：中风险
   - 推荐理由：产品线匹配，价格合理
   
2. **供应商C** - 相似度78%
   - 主要产品：SSD及相关存储解决方案
   - 价格竞争力：75分
   - 风险等级：低风险
   - 推荐理由：技术能力相近，风险较低

需要我为您详细对比这些供应商吗？"

