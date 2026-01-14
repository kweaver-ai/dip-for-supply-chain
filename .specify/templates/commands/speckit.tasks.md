---
description: Generate actionable task lists for implementation
handoffs:
  - label: Analyze Implementation Readiness
    agent: speckit.analyze
    prompt: Review the tasks for consistency and completeness
  - label: Start Implementation
    agent: speckit.implement
    prompt: Execute the implementation tasks
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Task Generation Process

1. **Load Context**: Read `spec.md` and `plan.md` to understand requirements and technical approach.

2. **Decompose Work**: Break down the implementation into manageable, actionable tasks with:
   - Clear, specific deliverables
   - Realistic time estimates
   - Proper sequencing and dependencies
   - Parallel execution opportunities where possible

3. **Task Organization**: Structure tasks by:
   - Component or functional area
   - Implementation phase
   - Priority and risk level
   - Team member assignment

4. **Quality Gates**: Include tasks for:
   - Code reviews and testing
   - Documentation updates
   - Integration verification
   - Performance validation

5. **Create Tasks Document**: Generate `tasks.md` with:
   - Task ID numbering system
   - Detailed task descriptions
   - Acceptance criteria for each task
   - Dependencies and blockers
   - Time estimates and priorities

## Task Structure

Each task should include:
- **Task ID**: Unique identifier (e.g., TASK-FE-001)
- **Title**: Clear, actionable description
- **Description**: Detailed work requirements
- **Acceptance Criteria**: Definition of done
- **Dependencies**: Prerequisite tasks
- **Estimate**: Time or complexity estimate
- **Assignee**: Responsible team member

## Success Criteria

- All requirements from spec have corresponding tasks
- Tasks are specific, measurable, and achievable
- Dependencies and sequencing are clear
- Team can begin implementation immediately
