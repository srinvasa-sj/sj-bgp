import React, { useEffect, useCallback, DependencyList, useMemo, useRef } from 'react';
import { debounce } from './debounce';

interface DebouncedFunction extends Function {
  cancel?: () => void;
}

// Performance metrics cache
const performanceCache = new Map<string, { 
  renderCount: number;
  totalDuration: number;
  lastRender: number;
}>();

export const useDebounceEffect = (
  effect: () => void,
  deps: DependencyList,
  delay: number
) => {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const handler = debounce(() => effectRef.current(), delay) as DebouncedFunction;
    handler();
    return () => {
      handler.cancel?.();
    };
  }, deps);
};

export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay),
    deps
  );
};

interface PerformanceMetrics {
  renderCount: number;
  averageDuration: number;
  lastRenderDuration: number;
}

export const measureComponentPerformance = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return function MeasuredComponent(props: P) {
    const startTimeRef = useRef(0);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      startTimeRef.current = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;
        
        const metrics = performanceCache.get(componentName) || {
          renderCount: 0,
          totalDuration: 0,
          lastRender: 0
        };
        
        metrics.renderCount++;
        metrics.totalDuration += duration;
        metrics.lastRender = duration;
        
        performanceCache.set(componentName, metrics);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Component Performance - ${componentName}:`, {
            duration: `${duration.toFixed(2)}ms`,
            averageDuration: `${(metrics.totalDuration / metrics.renderCount).toFixed(2)}ms`,
            renderCount: metrics.renderCount,
            props: Object.keys(props)
          });
        }
      };
    });

    // Use Intersection Observer for visibility tracking
    useEffect(() => {
      if (componentRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // Component is visible, start performance measurement
                startTimeRef.current = performance.now();
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(componentRef.current);
        return () => observer.disconnect();
      }
    }, []);

    const memoizedProps = useMemo(() => props, Object.values(props));

    return React.createElement(
      'div',
      { ref: componentRef },
      React.createElement(WrappedComponent, memoizedProps)
    );
  };
};

export const getComponentMetrics = (componentName: string): PerformanceMetrics | null => {
  const metrics = performanceCache.get(componentName);
  if (!metrics) return null;

  return {
    renderCount: metrics.renderCount,
    averageDuration: metrics.totalDuration / metrics.renderCount,
    lastRenderDuration: metrics.lastRender
  };
};

export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ReactNode
) => {
  return class ErrorBoundaryWrapper extends React.Component<P, { hasError: boolean }> {
    private startTime: number = 0;

    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
      this.startTime = performance.now();
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Component Error:', error, errorInfo);
      const duration = performance.now() - this.startTime;
      console.error(`Error occurred after ${duration.toFixed(2)}ms of mounting`);
    }

    render() {
      if (this.state.hasError) {
        return fallback;
      }

      return React.createElement(WrappedComponent, this.props);
    }
  };
}; 