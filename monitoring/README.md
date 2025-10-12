# StartupCompass Platform Monitoring

This directory contains the complete monitoring and observability stack for the StartupCompass platform.

## Overview

The monitoring stack includes:

- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Loki** - Log aggregation and analysis
- **Promtail** - Log collection agent
- **Jaeger** - Distributed tracing
- **AlertManager** - Alert routing and notification
- **Node Exporter** - System metrics
- **cAdvisor** - Container metrics
- **Redis Exporter** - Redis metrics
- **Postgres Exporter** - PostgreSQL metrics
- **Blackbox Exporter** - Endpoint monitoring

## Quick Start

### 1. Start the Monitoring Stack

```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Check service status
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Access the Dashboards

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Jaeger**: http://localhost:16686
- **cAdvisor**: http://localhost:8080

### 3. View Logs

```bash
# View logs from all monitoring services
docker-compose -f docker-compose.monitoring.yml logs -f

# View specific service logs
docker-compose -f docker-compose.monitoring.yml logs -f grafana
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │───▶│   Prometheus    │───▶│    Grafana      │
│                 │    │                 │    │                 │
│ - API Gateway   │    │ - Metrics       │    │ - Dashboards    │
│ - User Service  │    │ - Alerts        │    │ - Visualization │
│ - Job Service   │    │ - Rules         │    │ - Analysis      │
│ - Funding Svc   │    │                 │    │                 │
│ - Notification  │    └─────────────────┘    └─────────────────┘
└─────────────────┘             │
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         │              │  AlertManager   │
         │              │                 │
         │              │ - Routing       │
         │              │ - Notifications │
         │              │ - Silencing     │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│    Promtail     │───▶│      Loki       │
│                 │    │                 │
│ - Log Collection│    │ - Log Storage   │
│ - Processing    │    │ - Querying      │
│ - Shipping      │    │ - Indexing      │
└─────────────────┘    └─────────────────┘
```

## Metrics

### Application Metrics

Each service exposes metrics at `/metrics` endpoint:

- **HTTP Metrics**: Request rate, response time, error rate
- **Business Metrics**: User registrations, job applications, funding rounds
- **System Metrics**: Memory usage, CPU usage, database connections

### Infrastructure Metrics

- **System**: CPU, memory, disk, network (Node Exporter)
- **Containers**: Resource usage, restart count (cAdvisor)
- **Database**: Connections, query performance (Postgres Exporter)
- **Cache**: Memory usage, hit rate (Redis Exporter)

### Custom Metrics Examples

```typescript
// Counter example
const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['status', 'source']
});

// Histogram example
const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Gauge example
const activeUsers = new Gauge({
  name: 'active_users_current',
  help: 'Current number of active users',
  labelNames: ['type']
});
```

## Logging

### Log Levels

- **ERROR**: System errors, exceptions, failures
- **WARN**: Warnings, deprecated usage, recoverable errors
- **INFO**: General information, business events
- **DEBUG**: Detailed debugging information

### Log Format

All services use structured JSON logging:

```json
{
  "timestamp": "2023-10-12T10:30:00.000Z",
  "level": "info",
  "service": "user-service",
  "message": "User registered successfully",
  "userId": "user-123",
  "email": "user@example.com",
  "requestId": "req-456",
  "duration": 150
}
```

### Log Aggregation

Promtail collects logs from:
- Application log files
- Docker container logs
- System logs
- Nginx access logs
- Database logs

## Alerting

### Alert Rules

Alerts are defined in `prometheus/rules/alerts.yml`:

- **Service Availability**: Service down, high error rate
- **Performance**: High response time, high CPU/memory usage
- **Database**: Connection issues, slow queries
- **Business**: Registration failures, processing delays

### Alert Routing

AlertManager routes alerts based on severity:

- **Critical**: Immediate notification (email, Slack, PagerDuty)
- **Warning**: Team notification (email, Slack)
- **Info**: Monitoring channel notification (Slack)

### Notification Channels

Configure in `alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@startupcompass.com'
    slack_configs:
      - channel: '#critical-alerts'
    pagerduty_configs:
      - routing_key: 'YOUR_PAGERDUTY_KEY'
```

## Dashboards

### Pre-built Dashboards

1. **Platform Overview**: Service status, request rates, response times
2. **Infrastructure**: CPU, memory, disk, network metrics
3. **Application Performance**: Service-specific metrics
4. **Business Metrics**: User activity, job applications, funding data
5. **Database Performance**: Query performance, connections
6. **Error Analysis**: Error rates, error logs, stack traces

### Custom Dashboards

Create custom dashboards in Grafana:

1. Go to Grafana (http://localhost:3001)
2. Login with admin/admin123
3. Click "+" → "Dashboard"
4. Add panels with PromQL queries

Example PromQL queries:

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

## Tracing

### Distributed Tracing with Jaeger

Services can send traces to Jaeger for request flow analysis:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('user-service');

app.get('/users/:id', async (req, res) => {
  const span = tracer.startSpan('get-user');
  
  try {
    const user = await userService.getUser(req.params.id);
    span.setAttributes({
      'user.id': user.id,
      'user.email': user.email
    });
    res.json(user);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
});
```

## Health Checks

### Endpoint Monitoring

Blackbox Exporter monitors external endpoints:

- Service health endpoints
- API availability
- Database connectivity
- External service dependencies

### Health Check Configuration

```yaml
# In blackbox.yml
modules:
  startup_compass_api:
    prober: http
    http:
      method: GET
      fail_if_not_matches_regexp:
        - '"success":\s*true'
```

## Maintenance

### Data Retention

- **Prometheus**: 200 hours (configurable)
- **Loki**: 168 hours (configurable)
- **Jaeger**: 24 hours (configurable)

### Backup

```bash
# Backup Prometheus data
docker run --rm -v prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz /data

# Backup Grafana dashboards
docker run --rm -v grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

### Scaling

For production environments:

1. **Prometheus**: Use federation or Thanos for multi-instance setup
2. **Grafana**: Use external database (PostgreSQL/MySQL)
3. **Loki**: Use object storage (S3, GCS) for chunks
4. **Jaeger**: Use Elasticsearch or Cassandra backend

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check container memory usage
   docker stats
   
   # Adjust retention periods
   # Edit prometheus.yml and loki.yml
   ```

2. **Missing Metrics**
   ```bash
   # Check Prometheus targets
   curl http://localhost:9090/api/v1/targets
   
   # Verify service metrics endpoints
   curl http://api-gateway:3000/metrics
   ```

3. **Log Collection Issues**
   ```bash
   # Check Promtail status
   docker-compose -f docker-compose.monitoring.yml logs promtail
   
   # Verify log file permissions
   ls -la /var/log/startup-compass/
   ```

### Performance Tuning

1. **Prometheus**
   - Adjust scrape intervals
   - Optimize query performance
   - Use recording rules for complex queries

2. **Grafana**
   - Use query caching
   - Optimize dashboard queries
   - Set appropriate refresh intervals

3. **Loki**
   - Configure proper log retention
   - Use log stream limits
   - Optimize label usage

## Security

### Access Control

- Grafana: User authentication and role-based access
- Prometheus: Network-level security (firewall rules)
- AlertManager: Webhook authentication

### Data Protection

- Use HTTPS for external access
- Encrypt sensitive configuration data
- Regular security updates for all components

## Integration

### CI/CD Integration

Monitor deployment metrics:

```yaml
# In .github/workflows/ci.yml
- name: Check deployment health
  run: |
    curl -f http://localhost:9090/api/v1/query?query=up{job="api-gateway"}
```

### External Services

Connect to external monitoring:

- **DataDog**: Use DataDog agent
- **New Relic**: Use New Relic agent
- **AWS CloudWatch**: Use CloudWatch agent

## Support

For monitoring-related issues:

1. Check service logs
2. Verify configuration files
3. Test network connectivity
4. Review resource usage
5. Consult documentation

Contact: monitoring@startupcompass.com