---
description: Create technical implementation plans with your chosen tech stack
handoffs:
  - label: Break Down Tasks
    agent: speckit.tasks
    prompt: Create actionable tasks from this technical plan
  - label: Clarify Technical Details
    agent: speckit.clarify
    prompt: Get clarification on technical implementation details
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Technical Planning Process

1. **Load Feature Spec**: Read and analyze the `spec.md` file to understand requirements.

2. **Technology Stack Selection**: Choose appropriate technologies based on:
   - Project constraints and existing stack
   - Team expertise and preferences
   - Scalability and performance needs
   - Maintenance and operational considerations

3. **Architecture Design**: Design the technical solution including:
   - System components and interactions
   - Data flow and storage strategy
   - API design and contracts
   - Security and performance considerations

4. **Implementation Strategy**: Define:
   - Development phases and milestones
   - Risk assessment and mitigation
   - Dependencies and prerequisites
   - Success metrics and validation criteria

5. **Create Plan Document**: Generate comprehensive `plan.md` with:
   - Technology choices and rationale
   - Architecture diagrams and descriptions
   - Implementation phases
   - Risk assessment and mitigation strategies

## Additional Artifacts Created

- `research.md` - Technology research and decision rationale
- `data-model.md` - Data structure and database design
- `contracts/` - API and interface contracts
- `quickstart.md` - Implementation quick start guide

## Success Criteria

- Technical approach clearly defined and justified
- Implementation risks identified and mitigated
- Team alignment on technical direction
- Clear path from design to implementation
