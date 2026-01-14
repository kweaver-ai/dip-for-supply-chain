---
description: Convert implementation tasks to GitHub issues for project management
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Issue Creation Process

1. **Load Tasks**: Read `tasks.md` to understand all implementation tasks.

2. **Categorize Tasks**: Group tasks by:
   - Component or functional area
   - Implementation phase
   - Priority and complexity
   - Team member assignment

3. **Generate GitHub Issues**: Create issues for each task with:
   - Clear, actionable titles
   - Detailed descriptions from task specifications
   - Proper labels (priority, type, component)
   - Acceptance criteria as checkboxes
   - Dependencies and blockers noted

4. **Link Issues**: Establish relationships between issues:
   - Mark blocking dependencies
   - Create milestone for feature completion
   - Set up project board integration

5. **Track Progress**: Set up progress tracking:
   - Issue templates for consistent reporting
   - Progress indicators and status updates
   - Completion verification checklists

## Issue Structure

### Title Format
- `TASK-[ID]: [Brief Description]`
- Example: `TASK-FE-001: Implement user authentication component`

### Issue Body Template
- **Description**: Detailed task requirements
- **Acceptance Criteria**: Definition of done
- **Dependencies**: Blocking issues or prerequisites
- **Estimate**: Time or complexity estimate
- **Labels**: Priority, component, type tags

### Labels Used
- **Priority**: `priority-high`, `priority-medium`, `priority-low`
- **Type**: `type-feature`, `type-bug`, `type-refactor`
- **Component**: `component-frontend`, `component-backend`, `component-api`
- **Status**: `status-ready`, `status-in-progress`, `status-blocked`

## Success Criteria

- All tasks converted to trackable issues
- Clear ownership and priorities assigned
- Dependencies properly mapped
- Team can track progress through GitHub interface
- Project management workflow established
