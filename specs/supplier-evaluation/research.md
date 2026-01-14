# Research: 供应商评估分析页面（需求变更）

**Date**: 2024-12-20 (Updated)  
**Feature**: Supplier Evaluation Analysis Page (Updated Requirements)

## Technology Decisions

### Main Material Calculation Strategy

**Decision**: Calculate main materials by sorting materials by current stock (Material.currentStock) and selecting top 5

**Rationale**:
- Aligns with FR-001.1 requirement (automatic sorting by current stock, top 5)
- Uses existing Material entity with currentStock field
- Reflects actual inventory levels, not just purchase history
- Fixed top 5 provides focused view of key materials

**Implementation Approach**:
- Query all materials with currentStock field
- Sort descending by currentStock
- Select top 5 materials
- Enrich with supplier, quality rating, risk rating, on-time delivery rate, annual purchase amount
- Display: supplier name, material name, current stock, quality rating, risk rating, on-time delivery rate, annual purchase amount

**Alternatives considered**:
- Annual purchase amount: Changed per new requirements to focus on inventory levels
- Manual selection: Too much maintenance overhead
- Configurable top N: Fixed to top 5 per requirements

### Supplier Comparison Modal Pattern

**Decision**: Two-step confirmation modal with comparison table

**Rationale**:
- Follows FR-002.1 requirement (two-step confirmation workflow)
- Provides transparency before critical action
- Reduces accidental switches
- Standard UX pattern for destructive actions

**Implementation Approach**:
- Step 1: Display alternative suppliers with comparison metrics
- Step 2: User confirms switch action
- Show impact preview (affected orders, contracts)
- Clear cancel/confirm actions

**Alternatives considered**:
- One-step switch: Too risky for business operations
- Approval workflow: Overkill for this use case, adds delay

### 360° Scorecard Visualization

**Decision**: Use card-based layout with 6 dimension scores and risk badges

**Rationale**:
- Aligns with FR-003.1 requirement (6 dimensions in 360° scorecard)
- Provides comprehensive supplier evaluation view
- Clear visual hierarchy
- Consistent with existing UI patterns

**Visualization Components**:
- Dimension score cards: on-time delivery rate, quality rating, risk rating, on-time delivery rate (duplicate), annual purchase amount (display only), response speed
- Risk assessment section with expandable details
- Supplier dropdown selector sorted by annual purchase amount
- Action buttons (switch supplier, sourcing)

**Implementation Details**:
- Annual purchase amount displayed as metric, not scored
- On-time delivery rate appears twice (clarified in requirements)
- All dimensions displayed in grid layout for easy comparison

**Alternatives considered**:
- Radar chart: Less intuitive for 6 dimensions
- Table view: Less visually appealing
- Dashboard widgets: Too complex for this use case

### Risk Assessment Data Acquisition

**Decision**: Hybrid approach - real-time API calls for legal risks, manual for others

**Rationale**:
- Follows FR-004.1 and FR-004.2 requirements
- Legal risks require real-time data (major pledges, legal representative restrictions)
- Production anomalies and sentiment require human judgment
- Real-time API ensures latest legal risk information

**Data Sources**:
- Legal risks: Real-time external API calls when user views supplier (FR-004.2)
  - Public enterprise credit platforms APIs
  - Court records APIs
  - Major pledge databases
  - Legal restriction databases
- Production anomalies: Manual entry form
- Public sentiment: Manual entry form
- Financial status: Calculated from existing financial data

**Implementation Approach**:
- Trigger API call when user selects supplier from dropdown
- Show loading state during API call
- Handle API errors gracefully (fallback to cached data if available)
- Update risk assessment display with fresh data
- Cache API responses for performance (optional, but always fetch fresh on user request)

**Alternatives considered**:
- Cached data only: Does not meet "instant search" requirement
- Batch pre-loading: Too expensive, not real-time
- Full automation: Inaccurate for subjective data
- Full manual: Too much maintenance overhead

### AI Assistant Integration

**Decision**: Reuse existing CopilotSidebar component with page-specific configuration

**Rationale**:
- Follows FR-006.1 requirement
- Maintains UI consistency across pages
- Reduces development effort
- Allows page-specific customization

**Configuration Approach**:
- Page-specific title: "供应商分析智能体"
- Custom initial messages with supplier evaluation context
- Conversation examples (supplier situation query, material sourcing query)
- Context-aware responses based on supplier evaluation data

**Alternatives considered**:
- New component: Duplicates code, breaks consistency
- External AI service: Overkill for current requirements, adds complexity
- Rule-based only: Less flexible, harder to extend

### Supplier Selection Strategy

**Decision**: Dropdown list with all suppliers sorted by annual purchase amount (descending)

**Rationale**:
- Follows FR-003.3 requirement
- Provides easy access to all suppliers
- Sorting by annual purchase amount highlights key suppliers
- Standard UI pattern for selection

**Implementation Approach**:
- Query all suppliers from data source
- Calculate annual purchase amount per supplier
- Sort descending by annual purchase amount
- Display in dropdown/select component
- Update 360° scorecard when supplier selected

**Alternatives considered**:
- Pagination: Not needed for typical supplier count
- Search filter: Can be added later if supplier list grows
- Alphabetical sorting: Less useful than purchase amount sorting

### Mock Data Generation Strategy

**Decision**: Generate random mock data for missing fields (0 or null/undefined)

**Rationale**:
- Follows FR-011 requirement
- Ensures UI always displays data
- Supports development and testing
- Provides realistic data ranges

**Implementation Approach**:
- Check if qualityRating, riskRating, onTimeDeliveryRate, annualPurchaseAmount are 0 or null/undefined
- Generate random values within realistic ranges:
  - qualityRating: 60-100 (0-100 scale)
  - riskRating: 0-40 (0-100 scale, lower is better)
  - onTimeDeliveryRate: 70-100 (percentage)
  - annualPurchaseAmount: 100000-5000000 (RMB)
- Use deterministic random generation for testing consistency
- Store generated values to avoid regeneration on re-render

**Alternatives considered**:
- Fixed default values: Less realistic
- User input required: Blocks UI display
- External data source: Adds dependency

### Supplier Sourcing Algorithm

**Decision**: Similarity-based matching using product type, price range, and risk level

**Rationale**:
- Supports material sourcing queries (FR-008)
- Provides actionable recommendations
- Uses existing supplier data
- Simple and maintainable

**Matching Criteria**:
- Product/material type match
- Price competitiveness score
- Risk level compatibility
- Geographic proximity (if available)

**Alternatives considered**:
- Machine learning: Overkill, requires training data
- Manual curation: Not scalable
- External API: Adds dependency and cost

## Best Practices Applied

### React Component Patterns
- Functional components with hooks
- Props interface definitions
- Memoization for expensive calculations (useMemo)
- Proper key props for list rendering
- Modal pattern for confirmations

### Data Management
- Service layer for business logic separation
- Mock data structure matching real API format
- Type-safe data transformations
- Error handling for missing data

### Performance Optimization
- Lazy loading for modal components
- Memoized calculations for main materials
- Efficient filtering and sorting
- Debounced search inputs (if needed)

## Integration Points

### Existing System Integration
- Extends Supplier and Material types from ontology.ts
- Uses existing order data for annual purchase calculation
- Integrates with existing CopilotSidebar component
- Follows existing navigation patterns

### Future API Integration Points
- Main material calculation endpoint
- Supplier comparison endpoint
- Risk assessment data endpoints (legal risks API)
- Supplier sourcing/search endpoint
- Alternative supplier recommendation endpoint

## Open Questions Resolved

1. **Q: How to determine main materials?**
   - A: Automatic sorting by current stock (Material.currentStock), top 5 (updated 2024-12-20)

2. **Q: How to handle supplier switching?**
   - A: Two-step confirmation with comparison view

3. **Q: How to acquire risk assessment data?**
   - A: Real-time API calls for legal risks, manual for others (updated 2024-12-20)

4. **Q: How to implement AI assistant?**
   - A: Reuse CopilotSidebar with page-specific configuration

5. **Q: How many dimensions in 360° scorecard?**
   - A: 6 dimensions: on-time delivery rate, quality rating, risk rating, on-time delivery rate (duplicate), annual purchase amount (display), response speed (updated 2024-12-20)

6. **Q: How to handle missing data (0 or null/undefined)?**
   - A: Generate random mock data for quality rating, risk rating, on-time delivery rate, annual purchase amount (updated 2024-12-20)

7. **Q: How to select suppliers in evaluation panel?**
   - A: Dropdown list with all suppliers sorted by annual purchase amount descending (updated 2024-12-20)
