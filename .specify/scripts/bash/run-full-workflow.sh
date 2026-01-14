#!/usr/bin/env bash

# Full Spec-Driven Development Workflow Runner
#
# This script automates the complete Spec-Driven Development workflow:
# 1. Constitution → 2. Specify → 3. Plan → 4. Tasks → 5. Implement
#
# Usage: ./run-full-workflow.sh "feature description"
#
# Prerequisites:
# - Must be run from project root
# - Requires all prerequisite checks to pass
# - User must provide feature description as argument

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

# Check if feature description is provided
if [[ $# -eq 0 ]]; then
    log_error "Feature description is required"
    echo "Usage: $0 \"feature description\""
    echo "Example: $0 \"Add user authentication with OAuth2\""
    exit 1
fi

FEATURE_DESCRIPTION="$1"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

log_info "Starting Spec-Driven Development workflow"
log_info "Project root: $PROJECT_ROOT"
log_info "Feature: $FEATURE_DESCRIPTION"

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
log_info "Step 1: Checking prerequisites..."
if [[ ! -f ".specify/scripts/bash/check-prerequisites.sh" ]]; then
    log_error "Prerequisite check script not found"
    exit 1
fi

# Run prerequisite checks
if ! bash .specify/scripts/bash/check-prerequisites.sh --json > /dev/null 2>&1; then
    log_error "Prerequisites not met. Please run 'specify check' first."
    exit 1
fi

log_success "Prerequisites check passed"

# Step 2: Constitution (if not exists)
log_info "Step 2: Checking constitution..."
if [[ ! -f ".specify/memory/constitution.md" ]]; then
    log_warning "Constitution not found. You should run '/speckit.constitution' first."
    read -p "Continue without constitution? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Workflow cancelled by user"
        exit 0
    fi
else
    log_success "Constitution found"
fi

# Step 3: Specify feature
log_info "Step 3: Creating feature specification..."
echo "Please run the following command in your AI assistant:"
echo "/speckit.specify $FEATURE_DESCRIPTION"
echo
read -p "Press Enter after running /speckit.specify to continue..."

# Check if spec was created
FEATURE_DIR=$(bash .specify/scripts/bash/check-prerequisites.sh --json 2>/dev/null | grep -o '"FEATURE_DIR":"[^"]*"' | cut -d'"' -f4)
if [[ -z "$FEATURE_DIR" || ! -d "$FEATURE_DIR" ]]; then
    log_error "Feature directory not found. Please ensure /speckit.specify completed successfully."
    exit 1
fi

log_success "Feature specification created: $FEATURE_DIR"

# Step 4: Plan implementation
log_info "Step 4: Creating technical implementation plan..."
echo "Please run the following command in your AI assistant:"
echo "/speckit.plan I am building with React, TypeScript, Node.js, and PostgreSQL"
echo
read -p "Press Enter after running /speckit.plan to continue..."

if [[ ! -f "$FEATURE_DIR/plan.md" ]]; then
    log_error "Plan file not found. Please ensure /speckit.plan completed successfully."
    exit 1
fi

log_success "Technical plan created"

# Step 5: Generate tasks
log_info "Step 5: Generating implementation tasks..."
echo "Please run the following command in your AI assistant:"
echo "/speckit.tasks"
echo
read -p "Press Enter after running /speckit.tasks to continue..."

if [[ ! -f "$FEATURE_DIR/tasks.md" ]]; then
    log_error "Tasks file not found. Please ensure /speckit.tasks completed successfully."
    exit 1
fi

log_success "Implementation tasks generated"

# Step 6: Analyze for consistency (optional but recommended)
log_info "Step 6: Running consistency analysis..."
echo "Please run the following command in your AI assistant:"
echo "/speckit.analyze"
echo
read -p "Press Enter after running /speckit.analyze to continue..."

# Step 7: Implement feature
log_info "Step 7: Starting implementation..."
echo "Please run the following command in your AI assistant:"
echo "/speckit.implement"
echo
read -p "Press Enter after implementation is complete to finish..."

# Final verification
log_info "Step 8: Final verification..."
if [[ ! -f "$FEATURE_DIR/tasks.md" ]]; then
    log_error "Tasks file missing - implementation may not be complete"
    exit 1
fi

log_success "Spec-Driven Development workflow completed!"
log_info "Feature implemented: $FEATURE_DIR"
log_info ""
log_info "Next steps:"
log_info "1. Test the implemented feature"
log_info "2. Run code quality checks"
log_info "3. Create pull request for review"
log_info "4. Update documentation if needed"
