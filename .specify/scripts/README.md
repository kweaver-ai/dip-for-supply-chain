# Spec-Driven Development Scripts

This directory contains automation scripts for the Spec-Driven Development workflow.

## Available Scripts

### Core Workflow Scripts

#### `run-full-workflow.sh`
**Purpose**: Automates the complete Spec-Driven Development workflow
**Usage**:
```bash
./run-full-workflow.sh "feature description"
```
**What it does**:
- Checks prerequisites
- Guides through constitution/specify/plan/tasks/implement steps
- Provides interactive prompts for each phase
- Validates completion at each step

**Example**:
```bash
./run-full-workflow.sh "Add user authentication with OAuth2"
```

### Batch Processing Scripts

#### `batch-process-features.sh`
**Purpose**: Process multiple features in batch mode
**Usage**:
```bash
./batch-process-features.sh [OPTIONS] [PATTERN]
```

**Options**:
- `--list`: List all available features with status
- `--analyze`: Run consistency analysis on features
- `--status`: Show development status overview
- `--clean`: Archive completed features

**Examples**:
```bash
# List all features
./batch-process-features.sh --list

# Analyze features matching pattern
./batch-process-features.sh --analyze "user-*"

# Show status of all features
./batch-process-features.sh --status

# Clean up completed features
./batch-process-features.sh --clean
```

### Validation Scripts

#### `validate-feature.sh`
**Purpose**: Validate a completed feature against quality standards
**Usage**:
```bash
./validate-feature.sh <feature-directory>
```

**What it validates**:
- Required files exist (spec.md, plan.md, tasks.md)
- Specification completeness
- Technical plan adequacy
- Task completion status
- Constitution alignment
- Optional artifacts presence

**Example**:
```bash
./validate-feature.sh specs/001-user-auth
```

### Utility Scripts

#### `check-prerequisites.sh`
**Purpose**: Check if prerequisites are met for Spec-Driven Development
**Usage**:
```bash
./check-prerequisites.sh [OPTIONS]
```

**Options**:
- `--json`: Output in JSON format
- `--require-tasks`: Require tasks.md to exist
- `--include-tasks`: Include tasks.md in available docs
- `--paths-only`: Only output path variables

## Directory Structure

```
scripts/
├── bash/                    # Bash automation scripts
│   ├── run-full-workflow.sh      # Complete workflow automation
│   ├── batch-process-features.sh # Batch feature processing
│   ├── validate-feature.sh       # Feature validation
│   └── check-prerequisites.sh    # Prerequisite checking
└── README.md                # This documentation
```

## Integration with CLI

These scripts are designed to work with the `specify` CLI tool:

```bash
# Initialize project
specify init

# Check environment
specify check

# Then use scripts for workflow automation
./scripts/bash/run-full-workflow.sh "my feature"
```

## Best Practices

### Workflow Automation
1. Use `run-full-workflow.sh` for new features
2. Run `validate-feature.sh` before PR submission
3. Use `batch-process-features.sh --status` for project overview

### Batch Operations
- Use `--analyze` to catch consistency issues early
- Use `--clean` regularly to maintain project hygiene
- Use `--status` in standup meetings or reports

### Validation
- Run validation before code reviews
- Address CRITICAL and HIGH issues before merging
- Use MEDIUM/LOW issues for continuous improvement

## Error Handling

All scripts include proper error handling and will:
- Exit with clear error messages
- Suggest next steps for resolution
- Maintain project state consistency

## Customization

Scripts can be customized by:
- Modifying validation rules in `validate-feature.sh`
- Adding new batch operations in `batch-process-features.sh`
- Extending workflow steps in `run-full-workflow.sh`

## Troubleshooting

### Common Issues

**Script not executable**: Run `chmod +x scripts/bash/*.sh`

**Paths not found**: Ensure running from project root directory

**Prerequisites failing**: Run `specify check` to diagnose environment issues

**Validation failing**: Check the specific error messages and address issues in order

### Getting Help

- Check script help: `./script-name.sh --help`
- Review error messages for specific guidance
- Check the main Spec-Driven Development documentation
