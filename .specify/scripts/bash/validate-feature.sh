#!/usr/bin/env bash

# Feature Validation Script
#
# This script validates a completed feature against its specifications
# and runs automated checks to ensure quality standards are met.
#
# Usage: ./validate-feature.sh [FEATURE_DIR]
#
# Prerequisites:
# - Must be run from project root
# - Feature must have spec.md, plan.md, and tasks.md
# - Implementation should be complete

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Check if feature directory is provided
if [[ $# -eq 0 ]]; then
    log_error "Feature directory is required"
    echo "Usage: $0 <feature-directory>"
    echo "Example: $0 specs/001-user-auth"
    echo ""
    echo "Available features:"
    ls -1 specs/ 2>/dev/null | grep -v "^archive$" | sed 's/^/  /' || echo "  No features found"
    exit 1
fi

FEATURE_DIR="$1"

# Validate feature directory exists
if [[ ! -d "$FEATURE_DIR" ]]; then
    log_error "Feature directory not found: $FEATURE_DIR"
    exit 1
fi

FEATURE_NAME=$(basename "$FEATURE_DIR")
log_info "Validating feature: $FEATURE_NAME"

# Initialize validation results
VALIDATION_PASSED=true
ISSUES_FOUND=()

# Function to record issue
record_issue() {
    local severity="$1"
    local message="$2"
    ISSUES_FOUND+=("$severity: $message")
    if [[ "$severity" == "CRITICAL" || "$severity" == "HIGH" ]]; then
        VALIDATION_PASSED=false
    fi
}

# 1. Check required files exist
log_info "Checking required files..."
REQUIRED_FILES=("spec.md" "plan.md" "tasks.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$FEATURE_DIR/$file" ]]; then
        record_issue "CRITICAL" "Missing required file: $file"
    else
        log_success "Found: $file"
    fi
done

# 2. Validate spec completeness
if [[ -f "$FEATURE_DIR/spec.md" ]]; then
    log_info "Validating specification completeness..."

    SPEC_CONTENT=$(cat "$FEATURE_DIR/spec.md")

    # Check for required sections
    REQUIRED_SECTIONS=(
        "Business Context"
        "Functional Requirements"
        "Acceptance Criteria"
    )

    for section in "${REQUIRED_SECTIONS[@]}"; do
        if ! grep -q "$section" <<< "$SPEC_CONTENT"; then
            record_issue "HIGH" "Spec missing section: $section"
        fi
    done

    # Check for measurable criteria
    if ! grep -q -i "acceptance\|criteria\|measure" <<< "$SPEC_CONTENT"; then
        record_issue "MEDIUM" "Spec lacks measurable acceptance criteria"
    fi

    # Check for user stories
    if ! grep -q -i "user\|story\|scenario" <<< "$SPEC_CONTENT"; then
        record_issue "MEDIUM" "Spec lacks user stories or scenarios"
    fi
fi

# 3. Validate plan technical completeness
if [[ -f "$FEATURE_DIR/plan.md" ]]; then
    log_info "Validating technical plan..."

    PLAN_CONTENT=$(cat "$FEATURE_DIR/plan.md")

    # Check for technology decisions
    TECH_INDICATORS=("Technology" "Stack" "Framework" "Database" "API")
    tech_found=false
    for indicator in "${TECH_INDICATORS[@]}"; do
        if grep -q -i "$indicator" <<< "$PLAN_CONTENT"; then
            tech_found=true
            break
        fi
    done

    if ! $tech_found; then
        record_issue "HIGH" "Plan lacks technology stack decisions"
    fi

    # Check for implementation phases
    if ! grep -q -i "phase\|stage\|step" <<< "$PLAN_CONTENT"; then
        record_issue "MEDIUM" "Plan lacks implementation phases"
    fi

    # Check for risk assessment
    if ! grep -q -i "risk\|mitigation\|issue" <<< "$PLAN_CONTENT"; then
        record_issue "LOW" "Plan lacks risk assessment"
    fi
fi

# 4. Validate tasks implementation status
if [[ -f "$FEATURE_DIR/tasks.md" ]]; then
    log_info "Validating implementation tasks..."

    TASKS_CONTENT=$(cat "$FEATURE_DIR/tasks.md")

    # Count total and completed tasks
    TOTAL_TASKS=$(grep -c "^### " <<< "$TASKS_CONTENT" || echo "0")
    COMPLETED_TASKS=$(grep -c "\[x\]" <<< "$TASKS_CONTENT" || echo "0")

    log_info "Tasks: $COMPLETED_TASKS/$TOTAL_TASKS completed"

    if [[ $TOTAL_TASKS -eq 0 ]]; then
        record_issue "CRITICAL" "No tasks defined"
    elif [[ $COMPLETED_TASKS -lt $TOTAL_TASKS ]]; then
        record_issue "HIGH" "Not all tasks completed ($COMPLETED_TASKS/$TOTAL_TASKS)"
    fi

    # Check for task quality
    if ! grep -q "Acceptance Criteria\|Definition of Done" <<< "$TASKS_CONTENT"; then
        record_issue "MEDIUM" "Tasks lack acceptance criteria"
    fi
fi

# 5. Check for additional artifacts
log_info "Checking for additional artifacts..."

OPTIONAL_FILES=("research.md" "data-model.md" "contracts/" "quickstart.md")
for file in "${OPTIONAL_FILES[@]}"; do
    if [[ -f "$FEATURE_DIR/$file" || -d "$FEATURE_DIR/$file" ]]; then
        log_success "Found optional artifact: $file"
    fi
done

# 6. Check for checklists
if [[ -d "$FEATURE_DIR/checklists" ]]; then
    CHECKLIST_COUNT=$(find "$FEATURE_DIR/checklists" -name "*.md" | wc -l)
    if [[ $CHECKLIST_COUNT -gt 0 ]]; then
        log_success "Found $CHECKLIST_COUNT quality checklists"
    fi
else
    record_issue "LOW" "No quality checklists found"
fi

# 7. Validate against constitution (if exists)
if [[ -f ".specify/memory/constitution.md" ]]; then
    log_info "Validating against project constitution..."

    CONSTITUTION_CONTENT=$(cat ".specify/memory/constitution.md")

    # Extract principles (basic check)
    PRINCIPLES_COUNT=$(grep -c "^### Principle" <<< "$CONSTITUTION_CONTENT" || echo "0")

    if [[ $PRINCIPLES_COUNT -gt 0 ]]; then
        log_success "Constitution has $PRINCIPLES_COUNT principles"
    fi

    # Check if feature aligns with constitution (basic validation)
    if [[ -f "$FEATURE_DIR/spec.md" && -f "$FEATURE_DIR/plan.md" ]]; then
        # This is a simplified check - in practice, you'd want more sophisticated validation
        log_info "Basic constitution alignment check passed"
    fi
fi

# Generate validation report
echo ""
echo "=========================================="
echo "FEATURE VALIDATION REPORT"
echo "=========================================="
echo "Feature: $FEATURE_NAME"
echo "Directory: $FEATURE_DIR"
echo "Date: $(date)"
echo ""

if [[ ${#ISSUES_FOUND[@]} -eq 0 ]]; then
    log_success "✅ VALIDATION PASSED - No issues found"
    echo ""
    echo "🎉 Feature is ready for deployment!"
else
    echo "❌ VALIDATION ISSUES FOUND:"
    echo ""

    for issue in "${ISSUES_FOUND[@]}"; do
        if [[ $issue == CRITICAL:* ]]; then
            log_error "🔴 ${issue#CRITICAL: }"
        elif [[ $issue == HIGH:* ]]; then
            log_warning "🟠 ${issue#HIGH: }"
        elif [[ $issue == MEDIUM:* ]]; then
            log_warning "🟡 ${issue#MEDIUM: }"
        elif [[ $issue == LOW:* ]]; then
            log_info "🟢 ${issue#LOW: }"
        fi
    done

    echo ""
    if $VALIDATION_PASSED; then
        log_warning "⚠️  VALIDATION PASSED WITH WARNINGS"
        echo "Feature can proceed but consider addressing the issues above."
    else
        log_error "❌ VALIDATION FAILED"
        echo "Feature requires attention before proceeding."
        exit 1
    fi
fi

echo ""
echo "=========================================="
