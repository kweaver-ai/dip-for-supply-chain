---
description: Define what you want to build (requirements and user stories)
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Specification Creation Process

1. **Parse Feature Description**: Extract the core feature requirements from the user's natural language description.

2. **Generate Feature Branch**: Create a unique branch name using the pattern `[number]-[short-name]`.

3. **Create Feature Directory**: Set up the feature directory structure under `specs/`.

4. **Write Specification**: Create `spec.md` with:
   - Business context and problem statement
   - Functional requirements
   - Non-functional requirements
   - User stories and acceptance criteria
   - Edge cases and constraints

5. **Validate Completeness**: Ensure the spec covers WHAT and WHY, not HOW.

## File Structure Created

```
specs/[number]-[short-name]/
├── spec.md                 # Feature specification
├── plan.md                 # Technical implementation plan (created later)
├── tasks.md                # Implementation tasks (created later)
└── checklists/             # Quality checklists (created later)
    └── [checklist files]
```

## Success Criteria

- Feature directory created with proper naming
- `spec.md` contains clear, unambiguous requirements
- Business value and user needs are well-defined
- Foundation laid for technical planning
