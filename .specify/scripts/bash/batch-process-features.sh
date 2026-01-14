#!/usr/bin/env bash

# Batch Feature Processing Script
#
# This script helps process multiple features in batch mode,
# useful for bulk operations or automated workflows.
#
# Usage: ./batch-process-features.sh [OPTIONS] [FEATURE_PATTERN]
#
# Options:
#   --list          List all available features
#   --analyze       Run analysis on all features
#   --status        Show status of all features
#   --clean         Clean up completed features (move to archive)
#   --help, -h      Show this help message
#
# Examples:
#   ./batch-process-features.sh --list
#   ./batch-process-features.sh --analyze "user-*"
#   ./batch-process-features.sh --status

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

# Function to list all features
list_features() {
    log_info "Available features in specs/:"

    if [[ ! -d "specs" ]]; then
        log_warning "No specs directory found"
        return 1
    fi

    local count=0
    for feature_dir in specs/*/; do
        if [[ -d "$feature_dir" ]]; then
            local feature_name=$(basename "$feature_dir")
            local spec_file="$feature_dir/spec.md"
            local plan_file="$feature_dir/plan.md"
            local tasks_file="$feature_dir/tasks.md"

            echo -n "📁 $feature_name"

            if [[ -f "$spec_file" ]]; then echo -n " ✓ spec"; else echo -n " ✗ spec"; fi
            if [[ -f "$plan_file" ]]; then echo -n " ✓ plan"; else echo -n " ✗ plan"; fi
            if [[ -f "$tasks_file" ]]; then echo -n " ✓ tasks"; else echo -n " ✗ tasks"; fi

            # Check for implementation status
            if [[ -f "$tasks_file" ]]; then
                # Count completed tasks (basic check)
                local total_tasks=$(grep -c "^### " "$tasks_file" 2>/dev/null || echo "0")
                local completed_tasks=$(grep -c "\[x\]" "$tasks_file" 2>/dev/null || echo "0")
                echo -n " (${completed_tasks}/${total_tasks} tasks)"
            fi

            echo ""
            ((count++))
        fi
    done

    if [[ $count -eq 0 ]]; then
        log_warning "No features found"
    else
        log_success "Found $count features"
    fi
}

# Function to analyze features
analyze_features() {
    local pattern="${1:-*}"

    log_info "Analyzing features matching pattern: $pattern"

    local analyzed=0
    local issues_found=0

    for feature_dir in specs/$pattern/; do
        if [[ -d "$feature_dir" ]]; then
            local feature_name=$(basename "$feature_dir")
            log_info "Analyzing: $feature_name"

            # Check for required files
            local missing_files=()

            if [[ ! -f "$feature_dir/spec.md" ]]; then
                missing_files+=("spec.md")
            fi

            if [[ ! -f "$feature_dir/plan.md" ]]; then
                missing_files+=("plan.md")
            fi

            if [[ ! -f "$feature_dir/tasks.md" ]]; then
                missing_files+=("tasks.md")
            fi

            if [[ ${#missing_files[@]} -gt 0 ]]; then
                log_warning "Missing files: ${missing_files[*]}"
                ((issues_found++))
            fi

            # Check for consistency issues
            if [[ -f "$feature_dir/spec.md" && -f "$feature_dir/plan.md" ]]; then
                # Basic consistency check - look for obvious mismatches
                local spec_tech=$(grep -i "technology\|tech\|stack" "$feature_dir/spec.md" | head -1 || echo "")
                local plan_tech=$(grep -i "technology\|tech\|stack" "$feature_dir/plan.md" | head -1 || echo "")

                if [[ -n "$spec_tech" && -n "$plan_tech" ]]; then
                    # Simple check for technology alignment
                    if ! grep -q "$(echo "$spec_tech" | tr '[:upper:]' '[:lower:]')" <(echo "$plan_tech" | tr '[:upper:]' '[:lower:]') 2>/dev/null; then
                        log_warning "Potential technology mismatch between spec and plan"
                        ((issues_found++))
                    fi
                fi
            fi

            ((analyzed++))
        fi
    done

    log_success "Analyzed $analyzed features"
    if [[ $issues_found -gt 0 ]]; then
        log_warning "Found $issues_found issues across all features"
    else
        log_success "No issues found"
    fi
}

# Function to show feature status
show_status() {
    log_info "Feature development status overview:"

    if [[ ! -d "specs" ]]; then
        log_warning "No specs directory found"
        return 1
    fi

    local total_features=0
    local completed_features=0
    local in_progress_features=0
    local not_started_features=0

    for feature_dir in specs/*/; do
        if [[ -d "$feature_dir" ]]; then
            ((total_features++))
            local feature_name=$(basename "$feature_dir")
            local tasks_file="$feature_dir/tasks.md"

            if [[ -f "$tasks_file" ]]; then
                local total_tasks=$(grep -c "^### " "$tasks_file" 2>/dev/null || echo "0")
                local completed_tasks=$(grep -c "\[x\]" "$tasks_file" 2>/dev/null || echo "0")

                if [[ $total_tasks -gt 0 ]]; then
                    if [[ $completed_tasks -eq $total_tasks ]]; then
                        ((completed_features++))
                        echo -e "✅ $feature_name - Completed ($completed_tasks/$total_tasks tasks)"
                    elif [[ $completed_tasks -gt 0 ]]; then
                        ((in_progress_features++))
                        echo -e "🔄 $feature_name - In Progress ($completed_tasks/$total_tasks tasks)"
                    else
                        ((not_started_features++))
                        echo -e "⏳ $feature_name - Not Started (0/$total_tasks tasks)"
                    fi
                else
                    ((not_started_features++))
                    echo -e "📝 $feature_name - Spec Only (no tasks yet)"
                fi
            else
                ((not_started_features++))
                echo -e "📝 $feature_name - Spec Only (no tasks yet)"
            fi
        fi
    done

    echo ""
    log_info "Summary:"
    echo "  Total Features: $total_features"
    echo "  ✅ Completed: $completed_features"
    echo "  🔄 In Progress: $in_progress_features"
    echo "  ⏳ Not Started: $not_started_features"
}

# Function to clean up completed features
cleanup_features() {
    log_warning "This will move completed features to archive. Continue? (y/N): "
    read -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleanup cancelled"
        return 0
    fi

    local archive_dir="specs/archive"
    mkdir -p "$archive_dir"

    local cleaned=0

    for feature_dir in specs/*/; do
        if [[ -d "$feature_dir" && $(basename "$feature_dir") != "archive" ]]; then
            local feature_name=$(basename "$feature_dir")
            local tasks_file="$feature_dir/tasks.md"

            if [[ -f "$tasks_file" ]]; then
                local total_tasks=$(grep -c "^### " "$tasks_file" 2>/dev/null || echo "0")
                local completed_tasks=$(grep -c "\[x\]" "$tasks_file" 2>/dev/null || echo "0")

                if [[ $total_tasks -gt 0 && $completed_tasks -eq $total_tasks ]]; then
                    log_info "Archiving completed feature: $feature_name"
                    mv "$feature_dir" "$archive_dir/"
                    ((cleaned++))
                fi
            fi
        fi
    done

    if [[ $cleaned -gt 0 ]]; then
        log_success "Archived $cleaned completed features"
    else
        log_info "No completed features to archive"
    fi
}

# Main script logic
case "${1:-}" in
    --list)
        list_features
        ;;
    --analyze)
        analyze_features "$2"
        ;;
    --status)
        show_status
        ;;
    --clean)
        cleanup_features
        ;;
    --help|-h|"")
        echo "Batch Feature Processing Script"
        echo ""
        echo "Usage: $0 [OPTIONS] [FEATURE_PATTERN]"
        echo ""
        echo "Options:"
        echo "  --list          List all available features"
        echo "  --analyze       Run analysis on features (supports glob patterns)"
        echo "  --status        Show development status of all features"
        echo "  --clean         Archive completed features"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 --list"
        echo "  $0 --analyze 'user-*'"
        echo "  $0 --status"
        ;;
    *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
