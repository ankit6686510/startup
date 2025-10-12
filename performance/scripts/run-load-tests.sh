#!/bin/bash

# StartupCompass Platform Load Testing Script
# This script runs comprehensive load tests using multiple tools

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULTS_DIR="./performance/results/$(date +%Y%m%d_%H%M%S)"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing dependencies: ${missing_deps[*]}"
        error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    success "All dependencies are installed"
}

# Check if the application is running and healthy
check_application_health() {
    log "Checking application health..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$BASE_URL/health" > /dev/null; then
            local health_status=$(curl -s "$BASE_URL/health" | jq -r '.status // "unknown"')
            if [ "$health_status" = "healthy" ]; then
                success "Application is healthy"
                return 0
            else
                warning "Application status: $health_status (attempt $attempt/$max_attempts)"
            fi
        else
            warning "Health check failed (attempt $attempt/$max_attempts)"
        fi
        
        sleep 5
        ((attempt++))
    done
    
    error "Application health check failed after $max_attempts attempts"
    return 1
}

# Start the application if not running
start_application() {
    log "Starting application..."
    
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        
        # Wait for services to start
        log "Waiting for services to start..."
        sleep 30
        
        if check_application_health; then
            success "Application started successfully"
        else
            error "Failed to start application"
            exit 1
        fi
    else
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
}

# Create results directory
setup_results_directory() {
    log "Setting up results directory: $RESULTS_DIR"
    mkdir -p "$RESULTS_DIR"
    
    # Create subdirectories for different test types
    mkdir -p "$RESULTS_DIR/artillery"
    mkdir -p "$RESULTS_DIR/k6"
    mkdir -p "$RESULTS_DIR/custom"
    mkdir -p "$RESULTS_DIR/reports"
}

# Run Artillery load tests
run_artillery_tests() {
    log "Running Artillery load tests..."
    
    if ! command -v artillery &> /dev/null; then
        warning "Artillery not found, installing..."
        npm install -g artillery
    fi
    
    local config_file="./performance/load-testing/artillery-config.yml"
    
    if [ ! -f "$config_file" ]; then
        error "Artillery config file not found: $config_file"
        return 1
    fi
    
    # Update target URL in config
    sed "s|target: 'http://localhost:3000'|target: '$BASE_URL'|g" "$config_file" > "$RESULTS_DIR/artillery/config.yml"
    
    # Run different test scenarios
    local scenarios=("warm-up" "load-test" "stress-test" "spike-test")
    
    for scenario in "${scenarios[@]}"; do
        log "Running Artillery $scenario scenario..."
        
        artillery run \
            --config "$RESULTS_DIR/artillery/config.yml" \
            --output "$RESULTS_DIR/artillery/${scenario}-results.json" \
            2>&1 | tee "$RESULTS_DIR/artillery/${scenario}-output.log"
        
        # Generate HTML report
        if [ -f "$RESULTS_DIR/artillery/${scenario}-results.json" ]; then
            artillery report \
                "$RESULTS_DIR/artillery/${scenario}-results.json" \
                --output "$RESULTS_DIR/artillery/${scenario}-report.html"
            
            success "Artillery $scenario test completed"
        else
            error "Artillery $scenario test failed"
        fi
    done
}

# Run k6 load tests
run_k6_tests() {
    log "Running k6 load tests..."
    
    if ! command -v k6 &> /dev/null; then
        warning "k6 not found, installing..."
        
        # Install k6 based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
            echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
            sudo apt-get update
            sudo apt-get install k6
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install k6
        else
            error "Unsupported OS for k6 installation"
            return 1
        fi
    fi
    
    local script_file="./performance/load-testing/k6-script.js"
    
    if [ ! -f "$script_file" ]; then
        error "k6 script file not found: $script_file"
        return 1
    fi
    
    # Run different test scenarios
    local scenarios=("constant_load" "ramping_load" "spike_test" "stress_test")
    
    for scenario in "${scenarios[@]}"; do
        log "Running k6 $scenario scenario..."
        
        BASE_URL="$BASE_URL" k6 run \
            --scenario-name "$scenario" \
            --out json="$RESULTS_DIR/k6/${scenario}-results.json" \
            --summary-export="$RESULTS_DIR/k6/${scenario}-summary.json" \
            "$script_file" \
            2>&1 | tee "$RESULTS_DIR/k6/${scenario}-output.log"
        
        if [ $? -eq 0 ]; then
            success "k6 $scenario test completed"
        else
            error "k6 $scenario test failed"
        fi
    done
}

# Run custom performance tests
run_custom_tests() {
    log "Running custom performance tests..."
    
    # Database performance test
    log "Testing database performance..."
    curl -s -w "@./performance/scripts/curl-format.txt" \
        "$BASE_URL/startups?page=1&limit=100" \
        -o "$RESULTS_DIR/custom/db-test-response.json" \
        > "$RESULTS_DIR/custom/db-test-timing.txt"
    
    # API response time test
    log "Testing API response times..."
    local endpoints=(
        "/health"
        "/startups"
        "/jobs"
        "/funding"
        "/users/profile"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "Testing endpoint: $endpoint"
        
        # Test with authentication if needed
        if [[ "$endpoint" == "/users/profile" ]]; then
            # Get auth token first
            local auth_response=$(curl -s -X POST "$BASE_URL/auth/login" \
                -H "Content-Type: application/json" \
                -d '{"email":"test@example.com","password":"TestPassword123!"}')
            
            local token=$(echo "$auth_response" | jq -r '.data.token // empty')
            
            if [ -n "$token" ]; then
                curl -s -w "@./performance/scripts/curl-format.txt" \
                    -H "Authorization: Bearer $token" \
                    "$BASE_URL$endpoint" \
                    -o "$RESULTS_DIR/custom/endpoint-${endpoint//\//_}-response.json" \
                    > "$RESULTS_DIR/custom/endpoint-${endpoint//\//_}-timing.txt"
            else
                warning "Could not get auth token for $endpoint"
            fi
        else
            curl -s -w "@./performance/scripts/curl-format.txt" \
                "$BASE_URL$endpoint" \
                -o "$RESULTS_DIR/custom/endpoint-${endpoint//\//_}-response.json" \
                > "$RESULTS_DIR/custom/endpoint-${endpoint//\//_}-timing.txt"
        fi
    done
    
    success "Custom performance tests completed"
}

# Generate comprehensive report
generate_report() {
    log "Generating comprehensive performance report..."
    
    local report_file="$RESULTS_DIR/reports/performance-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>StartupCompass Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>StartupCompass Performance Test Report</h1>
        <p><strong>Generated:</strong> $(date)</p>
        <p><strong>Base URL:</strong> $BASE_URL</p>
        <p><strong>Test Duration:</strong> $(date -d @$(($(date +%s) - 3600)) '+%H:%M:%S')</p>
    </div>
    
    <div class="section">
        <h2>Test Summary</h2>
        <div class="metric">
            <strong>Artillery Tests:</strong> 
            <span class="$([ -f "$RESULTS_DIR/artillery/load-test-results.json" ] && echo "success" || echo "error")">
                $([ -f "$RESULTS_DIR/artillery/load-test-results.json" ] && echo "✓ Completed" || echo "✗ Failed")
            </span>
        </div>
        <div class="metric">
            <strong>k6 Tests:</strong> 
            <span class="$([ -f "$RESULTS_DIR/k6/constant_load-results.json" ] && echo "success" || echo "error")">
                $([ -f "$RESULTS_DIR/k6/constant_load-results.json" ] && echo "✓ Completed" || echo "✗ Failed")
            </span>
        </div>
        <div class="metric">
            <strong>Custom Tests:</strong> 
            <span class="$([ -f "$RESULTS_DIR/custom/db-test-timing.txt" ] && echo "success" || echo "error")">
                $([ -f "$RESULTS_DIR/custom/db-test-timing.txt" ] && echo "✓ Completed" || echo "✗ Failed")
            </span>
        </div>
    </div>
    
    <div class="section">
        <h2>Key Metrics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
            </tr>
EOF

    # Add metrics from test results if available
    if [ -f "$RESULTS_DIR/custom/endpoint-_health-timing.txt" ]; then
        local health_time=$(grep "time_total" "$RESULTS_DIR/custom/endpoint-_health-timing.txt" | awk '{print $2}')
        echo "            <tr><td>Health Check Response Time</td><td>${health_time}s</td><td class=\"$(awk "BEGIN {print ($health_time < 0.1) ? \"success\" : \"warning\"}")\">${health_time}s</td></tr>" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF
        </table>
    </div>
    
    <div class="section">
        <h2>Test Files</h2>
        <ul>
EOF

    # List all generated files
    find "$RESULTS_DIR" -type f -name "*.json" -o -name "*.html" -o -name "*.log" | while read -r file; do
        local relative_path=${file#$RESULTS_DIR/}
        echo "            <li><a href=\"$relative_path\">$relative_path</a></li>" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF
        </ul>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            <li>Monitor response times during peak hours</li>
            <li>Set up automated performance testing in CI/CD pipeline</li>
            <li>Implement caching for frequently accessed data</li>
            <li>Consider database query optimization</li>
            <li>Monitor memory usage and garbage collection</li>
        </ul>
    </div>
</body>
</html>
EOF

    success "Performance report generated: $report_file"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Stop any running load tests
    pkill -f artillery || true
    pkill -f k6 || true
    
    # Compress results
    if [ -d "$RESULTS_DIR" ]; then
        tar -czf "${RESULTS_DIR}.tar.gz" -C "$(dirname "$RESULTS_DIR")" "$(basename "$RESULTS_DIR")"
        success "Results compressed to ${RESULTS_DIR}.tar.gz"
    fi
}

# Main execution
main() {
    log "Starting StartupCompass Platform Load Testing"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --base-url)
                BASE_URL="$2"
                shift 2
                ;;
            --skip-start)
                SKIP_START=true
                shift
                ;;
            --artillery-only)
                ARTILLERY_ONLY=true
                shift
                ;;
            --k6-only)
                K6_ONLY=true
                shift
                ;;
            --custom-only)
                CUSTOM_ONLY=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --base-url URL      Base URL for testing (default: http://localhost:3000)"
                echo "  --skip-start        Skip starting the application"
                echo "  --artillery-only    Run only Artillery tests"
                echo "  --k6-only          Run only k6 tests"
                echo "  --custom-only      Run only custom tests"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Check dependencies
    check_dependencies
    
    # Setup results directory
    setup_results_directory
    
    # Start application if needed
    if [ "$SKIP_START" != "true" ]; then
        if ! check_application_health; then
            start_application
        fi
    else
        check_application_health || exit 1
    fi
    
    # Run tests based on options
    if [ "$ARTILLERY_ONLY" = "true" ]; then
        run_artillery_tests
    elif [ "$K6_ONLY" = "true" ]; then
        run_k6_tests
    elif [ "$CUSTOM_ONLY" = "true" ]; then
        run_custom_tests
    else
        # Run all tests
        run_artillery_tests
        run_k6_tests
        run_custom_tests
    fi
    
    # Generate report
    generate_report
    
    success "Load testing completed successfully!"
    log "Results available in: $RESULTS_DIR"
}

# Run main function
main "$@"