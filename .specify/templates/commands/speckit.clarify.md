---
description: Clarify underspecified areas (recommended before /speckit.plan)
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Clarification Process

1. **Analyze Current Spec**: Review `spec.md` to identify areas needing clarification.

2. **Identify Ambiguities**: Look for:
   - Vague terms and adjectives
   - Missing acceptance criteria
   - Undefined edge cases
   - Unclear user workflows
   - Missing technical constraints

3. **Generate Questions**: Create specific, actionable questions to resolve ambiguities:
   - Focus on information that materially changes implementation
   - Prioritize high-impact clarifications
   - Avoid unnecessary questions about clear requirements

4. **Interactive Dialog**: Engage user in clarification process:
   - Present questions clearly and concisely
   - Provide context for why clarification is needed
   - Offer multiple choice options where appropriate
   - Allow user to defer or decline certain clarifications

5. **Update Specification**: Incorporate clarifications into `spec.md`:
   - Update requirements with specific details
   - Add missing acceptance criteria
   - Define previously vague terms
   - Document clarified assumptions

## Types of Clarifications Needed

### Functional Requirements
- Specific user workflows and interactions
- Data input/output formats
- Error handling behaviors
- Performance expectations

### Non-Functional Requirements
- Response time requirements
- Scalability expectations
- Security requirements
- Accessibility standards

### Business Rules
- Validation rules and constraints
- Business logic edge cases
- Integration requirements
- Compliance needs

## Success Criteria

- All critical ambiguities resolved
- Requirements are specific and testable
- Team has clear understanding of scope
- Foundation ready for technical planning
