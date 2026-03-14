import type { TestResultData, TestHistoryEntry } from '../types';
/**
 * Analyzes test performance trends and regressions
 */
export declare class PerformanceAnalyzer {
    private performanceThreshold;
    constructor(performanceThreshold?: number);
    /**
     * Analyze performance trend for a test
     */
    analyze(test: TestResultData, history: TestHistoryEntry[]): void;
    /**
     * Get human-readable performance trend
     */
    private getPerformanceTrend;
    /**
     * Calculate detailed performance metrics
     */
    private calculateMetrics;
    /**
     * Check if test is slow compared to history
     */
    isSlow(test: TestResultData): boolean;
    /**
     * Check if test improved performance
     */
    isFaster(test: TestResultData): boolean;
    /**
     * Get performance status for filtering
     */
    getStatus(trend?: string): 'slow' | 'fast' | 'stable';
    /**
     * Calculate smart thresholds based on test duration
     * Shorter tests should have tighter thresholds
     */
    calculateSmartThreshold(duration: number): number;
}
