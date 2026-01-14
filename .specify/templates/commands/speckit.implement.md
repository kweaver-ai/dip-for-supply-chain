---
description: Execute all tasks to build the feature according to the plan
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Implementation Execution Process

1. **Load Context**: Read all artifacts (`spec.md`, `plan.md`, `tasks.md`) to understand the complete scope.

2. **Task Execution**: Implement tasks in the defined order:
   - Start with foundation tasks
   - Execute parallel tasks concurrently where possible
   - Complete dependent tasks before starting dependent ones
   - Mark tasks as completed with verification

3. **Code Implementation**: Write production-ready code following:
   - Project coding standards
   - Architecture guidelines from plan
   - Test-driven development practices
   - Documentation requirements

4. **Quality Assurance**: Ensure each task meets:
   - Acceptance criteria defined in tasks
   - Code review standards
   - Testing requirements
   - Performance benchmarks

5. **Integration**: Combine implemented components:
   - API integrations
   - UI component assembly
   - Data flow connections
   - End-to-end functionality verification

## Implementation Phases

### Phase 1: Foundation Setup
- Environment configuration
- Basic project structure
- Core dependencies installation

### Phase 2: Core Development
- Component implementation
- API development
- Data layer construction
- Business logic coding

### Phase 3: Integration & Testing
- Component integration
- End-to-end testing
- Performance optimization
- Security validation

### Phase 4: Deployment Preparation
- Documentation completion
- Deployment configuration
- Monitoring setup
- Final validation

## Success Criteria

- All tasks completed and verified
- Feature meets all requirements from spec
- Code is production-ready
- Documentation is complete
- Team can deploy the feature confidently
