# Data Model Design: [FEATURE_NAME]

## Overview

**Feature**: [FEATURE_NAME]
**Data Architect**: [DATA_ARCHITECT]
**Date**: [DATE]
**Status**: [Draft/In Review/Approved]

## Business Context

### Data Requirements
[What data does this feature need to store and process?]

### Usage Patterns
- **Read Patterns**: [How will data be queried?]
- **Write Patterns**: [How will data be created/updated?]
- **Volume**: [Expected data volume and growth]
- **Performance**: [Performance requirements]

## Current Data Model Analysis

### Existing Entities
[List existing data entities that will be affected]

### Integration Points
[How does this feature integrate with existing data?]

## Proposed Data Model

### New Entities

#### Entity 1: [ENTITY_NAME]
**Purpose**: [Why this entity exists]

**Attributes**:
- `id`: [Type] - Primary key, [Generation strategy]
- `field1`: [Type] - [Description], [Constraints]
- `field2`: [Type] - [Description], [Constraints]
- `created_at`: DateTime - Record creation timestamp
- `updated_at`: DateTime - Last update timestamp

**Relationships**:
- [Relationship to other entities]

**Business Rules**:
- [Business rules that apply to this entity]

#### Entity 2: [ENTITY_NAME]
**Purpose**: [Why this entity exists]

**Attributes**:
- `id`: [Type] - Primary key, [Generation strategy]
- `field1`: [Type] - [Description], [Constraints]
- `field2`: [Type] - [Description], [Constraints]
- `created_at`: DateTime - Record creation timestamp
- `updated_at`: DateTime - Last update timestamp

**Relationships**:
- [Relationship to other entities]

**Business Rules**:
- [Business rules that apply to this entity]

### Modified Entities

#### Existing Entity: [ENTITY_NAME]
**Changes**: [What changes are being made]

**New Fields**:
- `new_field`: [Type] - [Description], [Constraints]

**Modified Fields**:
- `existing_field`: [Type] → [New Type] - [Reason for change]

## Database Schema

### Tables

#### [table_name]
```sql
CREATE TABLE [table_name] (
    id [TYPE] PRIMARY KEY [GENERATION],
    field1 [TYPE] [CONSTRAINTS],
    field2 [TYPE] [CONSTRAINTS],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (foreign_key) REFERENCES other_table(id)
);
```

### Indexes
- **Primary Keys**: [List primary key indexes]
- **Foreign Keys**: [List foreign key constraints]
- **Performance Indexes**: [List performance optimization indexes]

```sql
-- Performance indexes
CREATE INDEX idx_[table]_[field] ON [table]([field]);
```

## Data Flow

### Create/Update Flow
1. [Step 1]: [Description]
2. [Step 2]: [Description]
3. [Step 3]: [Description]

### Query Flow
1. [Step 1]: [Description]
2. [Step 2]: [Description]
3. [Step 3]: [Description]

## Data Validation

### Business Rules Validation
- [Rule 1]: [Validation logic]
- [Rule 2]: [Validation logic]

### Data Integrity
- [Integrity constraint 1]: [Implementation]
- [Integrity constraint 2]: [Implementation]

## Migration Strategy

### Database Migration
**Migration File**: `migration_[timestamp]_[description].sql`

```sql
-- Migration script
START TRANSACTION;

-- Create new tables
CREATE TABLE new_table (...);

-- Modify existing tables
ALTER TABLE existing_table ADD COLUMN new_field VARCHAR(255);

-- Data migration (if needed)
INSERT INTO new_table SELECT * FROM old_table;

COMMIT;
```

### Rollback Plan
```sql
-- Rollback script
START TRANSACTION;

-- Reverse migration steps
DROP TABLE new_table;
ALTER TABLE existing_table DROP COLUMN new_field;

COMMIT;
```

## Performance Considerations

### Query Optimization
- [Optimization strategy 1]
- [Optimization strategy 2]

### Caching Strategy
- [Caching approach for frequently accessed data]

### Archival Strategy
- [How to handle data growth over time]

## Security Considerations

### Data Protection
- [Sensitive data handling]
- [Encryption requirements]

### Access Control
- [Who can access what data]
- [Audit requirements]

## Testing Strategy

### Unit Tests
- [Data validation tests]
- [Business rule tests]

### Integration Tests
- [End-to-end data flow tests]
- [Performance tests]

## Monitoring & Maintenance

### Metrics to Monitor
- **Data Volume**: [How to track data growth]
- **Query Performance**: [Key queries to monitor]
- **Data Quality**: [Data validation metrics]

### Maintenance Tasks
- **Regular Cleanup**: [Scheduled data cleanup tasks]
- **Index Maintenance**: [Index optimization tasks]
- **Backup Verification**: [Backup integrity checks]

## Dependencies

### Upstream Systems
- [Systems that provide data to this feature]

### Downstream Systems
- [Systems that consume data from this feature]

## Risk Assessment

### Technical Risks
- **Data Loss**: [Impact: High] - [Mitigation strategy]
- **Performance Degradation**: [Impact: Medium] - [Mitigation strategy]

### Business Risks
- **Data Inaccuracy**: [Impact: High] - [Mitigation strategy]
- **Compliance Issues**: [Impact: Critical] - [Mitigation strategy]

## Implementation Timeline

### Phase 1: Design & Development (Week 1-2)
- [ ] Data model design completion
- [ ] Schema creation
- [ ] Basic CRUD operations

### Phase 2: Testing & Refinement (Week 3)
- [ ] Data validation implementation
- [ ] Performance testing
- [ ] Integration testing

### Phase 3: Deployment & Monitoring (Week 4)
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation update
