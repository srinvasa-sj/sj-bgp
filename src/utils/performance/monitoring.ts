type PerformanceMetric = {
  startTime: number;
  endTime?: number;
  duration?: number;
  name: string;
  metadata?: Record<string, any>;
};

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private static instance: PerformanceMonitor;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMetric(name: string, metadata?: Record<string, any>) {
    this.metrics.set(name, {
      startTime: performance.now(),
      name,
      metadata
    });
  }

  endMetric(name: string) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log performance metric
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance Metric - ${name}:`, {
          duration: `${metric.duration.toFixed(2)}ms`,
          ...metric.metadata
        });
      }
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startMetric(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endMetric(name);
    }
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startMetric(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      this.endMetric(name);
    }
  }

  getMetrics() {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 