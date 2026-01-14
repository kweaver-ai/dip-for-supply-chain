# API Contract: [CONTRACT_NAME]

## Overview

**Contract Name**: [CONTRACT_NAME]
**Version**: [VERSION]
**Date**: [DATE]
**Status**: [Draft/In Review/Approved]

**Producer**: [SERVICE/TEAM providing the API]
**Consumer**: [SERVICE/TEAM consuming the API]

## Business Context

### Purpose
[What business problem does this contract solve?]

### Scope
[What functionality is covered by this contract?]

## API Specification

### Endpoint
```
[METHOD] [BASE_URL]/[ENDPOINT_PATH]
```

**Example**:
```
POST /api/v1/features
```

### Authentication
[Authentication method and requirements]

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
X-Request-ID: [UUID] (optional, for tracing)
```

#### Body Schema
```json
{
  "type": "object",
  "required": ["field1", "field2"],
  "properties": {
    "field1": {
      "type": "string",
      "description": "Description of field1",
      "maxLength": 100
    },
    "field2": {
      "type": "integer",
      "description": "Description of field2",
      "minimum": 0
    }
  }
}
```

### Response Format

#### Success Response (200 OK)
```json
{
  "data": {
    "id": "string",
    "field1": "string",
    "field2": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "request_id": "string",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Error Responses

##### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "field1",
        "issue": "Required field is missing"
      }
    ]
  },
  "meta": {
    "request_id": "string",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

##### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

##### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

##### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

##### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Data Types

### Common Types

#### UUID
- **Format**: RFC 4122 UUID v4
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

#### Timestamp
- **Format**: ISO 8601 UTC
- **Example**: `2024-01-01T12:00:00Z`

#### Pagination
```json
{
  "page": 1,
  "page_size": 20,
  "total_count": 150,
  "total_pages": 8
}
```

## Business Rules

### Validation Rules
- [Rule 1]: [Description and enforcement]
- [Rule 2]: [Description and enforcement]

### Business Logic
- [Logic 1]: [Description and when it applies]
- [Logic 2]: [Description and when it applies]

## Performance Requirements

### Response Times
- **Average**: < [X]ms
- **95th percentile**: < [Y]ms
- **99th percentile**: < [Z]ms

### Rate Limits
- [Rate limit specification]

### Throughput
- [Expected requests per second/minute]

## Error Handling

### Retry Logic
[When and how consumers should retry failed requests]

### Circuit Breaker
[When consumers should stop making requests]

## Monitoring & Observability

### Metrics
- **Request Count**: Total requests by endpoint and method
- **Response Times**: Distribution of response times
- **Error Rates**: Error rates by error type
- **Throughput**: Requests per second

### Logging
[What events should be logged and at what level]

### Tracing
[Distributed tracing requirements]

## Security

### Data Protection
[How sensitive data is protected in transit and at rest]

### Audit Trail
[What actions are logged for audit purposes]

## Versioning

### API Versioning
[How API versions are managed and communicated]

### Contract Versioning
[How contract changes are versioned and communicated]

### Breaking Changes
[Process for introducing breaking changes]

## Testing

### Contract Tests
[How to test this contract]

### Mock Data
[Example request/response pairs for testing]

## Dependencies

### Upstream Services
- [Service 1]: [Purpose and criticality]
- [Service 2]: [Purpose and criticality]

### Downstream Services
- [Service 1]: [Purpose and criticality]
- [Service 2]: [Purpose and criticality]

## Support & Maintenance

### Support Contacts
- **Technical Owner**: [Name] ([Email])
- **Business Owner**: [Name] ([Email])
- **On-call**: [Phone/Slack channel]

### Change Management
[Process for requesting changes to this contract]

### Deprecation Policy
[How deprecated endpoints are handled]

## Changelog

### Version [VERSION] ([DATE])
- [Change 1]
- [Change 2]
- [Breaking change notice]

### Version [PREVIOUS_VERSION] ([PREVIOUS_DATE])
- [Previous change 1]
- [Previous change 2]
