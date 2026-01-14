---
description: Cross-artifact consistency & coverage analysis (run after /speckit.tasks, before /speckit.implement)
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Analysis Process

1. **Load All Artifacts**: Read `spec.md`, `plan.md`, and `tasks.md` to perform comprehensive analysis.

2. **Consistency Check**: Identify and report:
   - Terminology inconsistencies across documents
   - Conflicting requirements or decisions
   - Missing alignment between spec and implementation
   - Assumption mismatches

3. **Coverage Analysis**: Verify:
   - All spec requirements have corresponding tasks
   - All technical decisions are justified
   - Edge cases and error scenarios are covered
   - Non-functional requirements are addressed

4. **Quality Assessment**: Evaluate:
   - Completeness of specifications
   - Clarity of requirements and tasks
   - Feasibility of technical approach
   - Risk mitigation adequacy

5. **Generate Report**: Create structured analysis report with:
   - Issues categorized by severity (Critical, High, Medium, Low)
   - Specific recommendations for resolution
   - Next action suggestions

## Analysis Categories

### Critical Issues (Block Implementation)
- Missing core requirements coverage
- Fundamental technical conflicts
- Constitution violations

### High Priority Issues
- Significant gaps in specification
- Major consistency problems
- High-risk technical decisions without mitigation

### Medium Priority Issues
- Minor inconsistencies
- Missing edge case coverage
- Documentation gaps

### Low Priority Issues
- Style and formatting improvements
- Minor terminology inconsistencies
- Optimization opportunities

## Success Criteria

- All critical and high-priority issues identified
- Clear remediation recommendations provided
- Implementation readiness assessment completed
- Team can make informed go/no-go decision
