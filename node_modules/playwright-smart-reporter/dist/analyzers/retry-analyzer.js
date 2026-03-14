"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryAnalyzer = void 0;
/**
 * Analyzes test retry patterns to identify tests that frequently need retries
 */
class RetryAnalyzer {
    constructor(retryFailureThreshold = 3) {
        this.retryFailureThreshold = retryFailureThreshold;
    }
    /**
     * Analyze retry pattern for a test
     * @param test - The test result to analyze
     * @param history - Historical test results for this test
     */
    analyze(test, history) {
        const retryInfo = this.calculateRetryInfo(test, history);
        test.retryInfo = retryInfo;
    }
    /**
     * Calculate detailed retry information
     * @param test - The test result
     * @param history - Historical test results
     * @returns Retry information object
     */
    calculateRetryInfo(test, history) {
        const totalRetries = test.retry;
        // passedOnRetry: Index of the retry on which test passed (0-based), or -1 if never passed
        const passedOnRetry = test.status === 'passed' && totalRetries > 0 ? totalRetries : -1;
        const failedRetries = test.status === 'failed' || test.status === 'timedOut' ? totalRetries : 0;
        // Build retry pattern (simplified - we don't have individual retry results)
        const retryPattern = [];
        if (totalRetries > 0) {
            // Add failures for all retries before the final attempt
            for (let i = 0; i < totalRetries; i++) {
                retryPattern.push(false);
            }
            // Add final result
            retryPattern.push(test.status === 'passed');
        }
        else {
            retryPattern.push(test.status === 'passed');
        }
        // Check if this test frequently needs retries based on history
        const historyWithRetries = history.filter(h => h.retry && h.retry > 0);
        const needsAttention = totalRetries >= this.retryFailureThreshold ||
            (history.length > 0 && historyWithRetries.length / history.length > 0.5);
        return {
            totalRetries,
            passedOnRetry,
            failedRetries,
            retryPattern,
            needsAttention,
        };
    }
    /**
     * Check if test needs attention due to retry patterns
     */
    needsAttention(test) {
        return test.retryInfo?.needsAttention || false;
    }
    /**
     * Get retry summary for a test
     */
    getRetrySummary(test) {
        const retry = test.retryInfo;
        if (!retry || retry.totalRetries === 0) {
            return 'No retries';
        }
        if (retry.passedOnRetry >= 0) {
            return `Passed on retry ${retry.passedOnRetry + 1}/${retry.totalRetries + 1}`;
        }
        return `Failed after ${retry.totalRetries + 1} attempts`;
    }
    /**
     * Calculate retry rate from all results
     */
    calculateRetryRate(results) {
        const testsWithRetries = results.filter(r => r.retry > 0).length;
        return results.length > 0 ? testsWithRetries / results.length : 0;
    }
    /**
     * Get tests that need attention due to retries
     */
    getProblematicTests(results) {
        return results.filter(r => this.needsAttention(r));
    }
}
exports.RetryAnalyzer = RetryAnalyzer;
