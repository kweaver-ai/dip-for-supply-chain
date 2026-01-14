---
description: Create or update project governing principles and development guidelines
handoffs:
  - label: Start Feature Development
    agent: speckit.specify
    prompt: Begin developing features using the established principles
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Constitution Creation Process

1. **Understand Project Context**: Analyze the project structure, technology stack, and existing codebase to understand what principles are needed.

2. **Identify Key Principles**: Determine 2-5 core principles that will guide development. Common principles include:
   - Type safety and data consistency
   - Code quality and testing standards
   - Architecture and technology choices
   - Development workflow and collaboration
   - Performance and scalability requirements

3. **Create Constitution File**: Generate `.specify/memory/constitution.md` following the constitution template with:
   - Clear principle names and descriptions
   - Specific rules for each principle
   - Rationale for why each principle matters
   - Governance procedures for amendments

4. **Validate Principles**: Ensure principles are:
   - Specific and measurable
   - Aligned with project goals
   - Realistic for the team to follow
   - Flexible enough to evolve

## Output Format

Create the constitution file at `.specify/memory/constitution.md` with proper versioning and amendment procedures.

## Success Criteria

- Constitution file created successfully
- Principles are clear and actionable
- Team alignment on the principles
- Foundation established for consistent development
