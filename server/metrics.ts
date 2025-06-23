import { Request, Response } from 'express';
import { storage } from './storage';
import express from 'express';
import promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'lawhelp_',
});

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'lawhelp_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'lawhelp_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const activeUsersGauge = new promClient.Gauge({
  name: 'lawhelp_active_users_total',
  help: 'Total number of active users',
});

const chatSessionsTotal = new promClient.Counter({
  name: 'lawhelp_chat_sessions_total',
  help: 'Total number of chat sessions created',
});

const aiQueryDuration = new promClient.Histogram({
  name: 'lawhelp_ai_query_duration_seconds',
  help: 'Duration of AI query processing in seconds',
  buckets: [0.5, 1, 2, 5, 10, 30],
});

const databaseOperationsTotal = new promClient.Counter({
  name: 'lawhelp_database_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'table', 'status'],
});

const databaseConnectionsActive = new promClient.Gauge({
  name: 'lawhelp_database_connections_active',
  help: 'Number of active database connections',
});

// Register custom metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsersGauge);
register.registerMetric(chatSessionsTotal);
register.registerMetric(aiQueryDuration);
register.registerMetric(databaseOperationsTotal);
register.registerMetric(databaseConnectionsActive);

export const metricsRouter = express.Router();

// Metrics endpoint for Prometheus
metricsRouter.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
});

// Health check endpoint
metricsRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Detailed health check
metricsRouter.get('/health/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'healthy', // This would be checked against actual DB
      ai_service: 'healthy',
      websocket: 'healthy'
    }
  };

  try {
    // Add actual service checks here
    res.json(healthCheck);
  } catch (error) {
    res.status(503).json({
      ...healthCheck,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Export metrics for use in other modules
export const metrics = {
  httpRequestsTotal,
  httpRequestDuration,
  activeUsersGauge,
  chatSessionsTotal,
  aiQueryDuration,
  databaseOperationsTotal,
  databaseConnectionsActive
};

// Middleware to track HTTP requests
export const metricsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });

    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: res.statusCode
    }, duration);
  });

  next();
};

interface Metrics {
  total_users: number;
  active_chat_sessions: number;
  total_messages: number;
  lawyers_count: number;
  uptime_seconds: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  response_time_ms: number;
  error_rate_percent: number;
}

class MetricsCollector {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  recordRequest(responseTime: number, isError: boolean = false) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    if (isError) {
      this.errorCount++;
    }
  }

  async collectMetrics(): Promise<Metrics> {
    const users = Array.from((storage as any).users.values());
    const sessions = Array.from((storage as any).chatSessions.values());
    const messages = Array.from((storage as any).chatMessages.values());
    const lawyers = Array.from((storage as any).lawyers.values());

    const activeSessions = sessions.filter(session => session.status === 'active');
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    // Error rate calculation
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    // Average response time
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    return {
      total_users: users.length,
      active_chat_sessions: activeSessions.length,
      total_messages: messages.length,
      lawyers_count: lawyers.length,
      uptime_seconds: uptime,
      memory_usage_mb: memoryUsageMB,
      cpu_usage_percent: 0, // Would need more complex calculation for real CPU usage
      response_time_ms: avgResponseTime,
      error_rate_percent: errorRate
    };
  }

  // Prometheus format metrics
  async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.collectMetrics();

    return `
# HELP lawhelp_total_users Total number of registered users
# TYPE lawhelp_total_users gauge
lawhelp_total_users ${metrics.total_users}

# HELP lawhelp_active_chat_sessions Number of active chat sessions
# TYPE lawhelp_active_chat_sessions gauge
lawhelp_active_chat_sessions ${metrics.active_chat_sessions}

# HELP lawhelp_total_messages Total number of chat messages
# TYPE lawhelp_total_messages counter
lawhelp_total_messages ${metrics.total_messages}

# HELP lawhelp_lawyers_count Total number of registered lawyers
# TYPE lawhelp_lawyers_count gauge
lawhelp_lawyers_count ${metrics.lawyers_count}

# HELP lawhelp_uptime_seconds Application uptime in seconds
# TYPE lawhelp_uptime_seconds counter
lawhelp_uptime_seconds ${metrics.uptime_seconds}

# HELP lawhelp_memory_usage_mb Memory usage in megabytes
# TYPE lawhelp_memory_usage_mb gauge
lawhelp_memory_usage_mb ${metrics.memory_usage_mb}

# HELP lawhelp_response_time_ms Average response time in milliseconds
# TYPE lawhelp_response_time_ms gauge
lawhelp_response_time_ms ${metrics.response_time_ms}

# HELP lawhelp_error_rate_percent Error rate percentage
# TYPE lawhelp_error_rate_percent gauge
lawhelp_error_rate_percent ${metrics.error_rate_percent}

# HELP lawhelp_requests_total Total number of HTTP requests
# TYPE lawhelp_requests_total counter
lawhelp_requests_total ${this.requestCount}
`.trim();
  }
}

export const metricsCollector = new MetricsCollector();

// Metrics endpoint handler
export async function metricsHandler(req: Request, res: Response) {
  try {
    const prometheusMetrics = await metricsCollector.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
}

// Health check endpoint
export function healthHandler(req: Request, res: Response) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - metricsCollector['startTime']) / 1000),
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(health);
}