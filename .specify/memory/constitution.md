<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 (MINOR: new principle added)
- Modified principles: N/A
- Added sections: Principle 5 - README Documentation Bilingual Requirement
- Removed sections: N/A
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md - Added Principle 5 compliance check
  - ⚠️ README.md - Needs English version (pending)
- Follow-up TODOs:
  - Create README.en.md with English version of project documentation
  - Update existing README.md to clearly indicate bilingual requirement
-->

# ChainNeural Project Constitution

**Project Name**: ChainNeural  
**Constitution Version**: 1.1.0  
**Ratification Date**: 2024-12-19  
**Last Amended Date**: 2024-12-23

## Purpose

This constitution establishes the non-negotiable principles and governance rules for the ChainNeural supply chain visualization and management platform. All code, architecture decisions, and development practices MUST align with these principles.

## Principles

### Principle 1: Type System Ontology

**All data types MUST conform to `src/types/ontology.ts`.**

- All TypeScript interfaces, types, and data structures used throughout the application MUST be defined in or extend from `src/types/ontology.ts`.
- Database table types, API response types, component prop types, and state management types MUST reference the ontology.
- Rationale: Ensures type consistency, single source of truth for data structures, and prevents type drift across the codebase.

### Principle 2: Tailwind v4 Semantic Variables

**Styles MUST use Tailwind v4 semantic variables (e.g., `bg-status-risk`), NOT hardcoded colors.**

- All color values MUST use semantic variable names defined in Tailwind configuration (e.g., `bg-status-risk`, `text-primary`, `border-warning`).
- Hardcoded hex colors (e.g., `#0f1419`, `#3B82F6`) are FORBIDDEN in component code.
- Rationale: Enables consistent theming, easier maintenance, and better accessibility through centralized color definitions.

### Principle 3: Component Size Limit

**When modifying components, if they exceed 150 lines, actively suggest splitting.**

- Components exceeding 150 lines MUST be reviewed for potential extraction of sub-components, hooks, or utility functions.
- Refactoring suggestions MUST be provided during code review or development.
- Rationale: Maintains code readability, testability, and reduces cognitive load for developers.

### Principle 4: Simulation Data Isolation

**Simulation mode data logic MUST be isolated from real data.**

- Simulation mode state, data transformations, and calculations MUST be completely separate from production/real-time data flows.
- Simulation data MUST NOT mutate or interfere with real data structures.
- Clear boundaries MUST exist between simulation and real data handling code paths.
- Rationale: Prevents accidental data corruption, ensures simulation safety, and maintains data integrity for production monitoring.

### Principle 5: README Documentation Bilingual Requirement

**README documentation MUST provide both Chinese and English versions.**

- The main README file (README.md) MUST be available in both Chinese and English.
- English version SHOULD be provided as README.en.md or README.md (with English as primary language).
- Both versions MUST maintain equivalent content and stay synchronized when updates occur.
- Rationale: Ensures accessibility for international developers, improves project adoption, and supports diverse development teams.

## Governance

### Amendment Procedure

1. Proposed amendments MUST be documented with rationale and impact assessment.
2. Amendments require review and approval before implementation.
3. Constitution version MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible principle removals or redefinitions
   - **MINOR**: New principle/section added or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements
4. `LAST_AMENDED_DATE` MUST be updated to the amendment date.

### Compliance Review

- All code changes MUST be validated against these principles during development and code review.
- Violations MUST be addressed before merge approval.
- Automated linting and type checking SHOULD enforce Principle 1 and Principle 2 where possible.

### Version History

- **1.1.0** (2024-12-23): Added Principle 5 - README Documentation Bilingual Requirement
- **1.0.0** (2024-12-19): Initial constitution with four core principles (Type Ontology, Tailwind Semantic Variables, Component Size Limit, Simulation Data Isolation)
