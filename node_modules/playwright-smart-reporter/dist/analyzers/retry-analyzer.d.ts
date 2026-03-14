import type { TestResultData, TestHistoryEntry } from '../types';
/**
 * Analyzes test retry patterns to identify tests that frequently need retries
 */
export declare class RetryAnalyzer {
    private retryFailureThreshold;
    constructor(retryFailureThreshold?: number);
    /**
     * Analyze retry pattern for a test
     * @param test - The test result to analyze
     * @param history - Historical test results for this test
     */
    analyze(test: TestResultData, history: TestHistoryEntry[]): void;
    /**
     * Calculate detailed retry information
     * @param test - The test result
     * @param history - Historical test results
     * @returns Retry information object
     */
    private calculateRetryInfo;
    /**
     * Check if test needs attention due to retry patterns
     */
    needsAttention(test: TestResultData): boolean;
    /**
     * Get retry summary for a test
     */
    getRetrySummary(test: TestResultData): string;
    /**
     * Calculate retry rate from all results
     */
    calculateRetryRate(results: TestResultData[]): number;
    /**
     * Get tests that need attention due to retries
     */
    getProblematicTests(results: TestResultData[]): TestResultData[];
}
