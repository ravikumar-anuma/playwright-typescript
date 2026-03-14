"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const retry_analyzer_1 = require("./retry-analyzer");
function createTestResult(overrides = {}) {
    return {
        testId: 'test-1',
        title: 'Test 1',
        file: 'test.spec.ts',
        status: 'passed',
        duration: 1000,
        retry: 0,
        steps: [],
        history: [],
        ...overrides,
    };
}
function createHistoryEntry(retry = 0) {
    return {
        passed: true,
        duration: 1000,
        timestamp: new Date().toISOString(),
        retry,
    };
}
(0, vitest_1.describe)('RetryAnalyzer', () => {
    (0, vitest_1.describe)('with default threshold (3)', () => {
        const analyzer = new retry_analyzer_1.RetryAnalyzer();
        (0, vitest_1.describe)('analyze', () => {
            (0, vitest_1.it)('calculates retry info for test that passed first try', () => {
                const test = createTestResult({ status: 'passed', retry: 0 });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.retryInfo).toBeDefined();
                (0, vitest_1.expect)(test.retryInfo?.totalRetries).toBe(0);
                (0, vitest_1.expect)(test.retryInfo?.passedOnRetry).toBe(-1);
                (0, vitest_1.expect)(test.retryInfo?.failedRetries).toBe(0);
                (0, vitest_1.expect)(test.retryInfo?.retryPattern).toEqual([true]);
                (0, vitest_1.expect)(test.retryInfo?.needsAttention).toBe(false);
            });
            (0, vitest_1.it)('calculates retry info for test that passed on retry', () => {
                const test = createTestResult({ status: 'passed', retry: 2 });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.retryInfo?.totalRetries).toBe(2);
                (0, vitest_1.expect)(test.retryInfo?.passedOnRetry).toBe(2);
                (0, vitest_1.expect)(test.retryInfo?.failedRetries).toBe(0);
                (0, vitest_1.expect)(test.retryInfo?.retryPattern).toEqual([false, false, true]);
                (0, vitest_1.expect)(test.retryInfo?.needsAttention).toBe(false);
            });
            (0, vitest_1.it)('calculates retry info for failed test', () => {
                const test = createTestResult({ status: 'failed', retry: 2 });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.retryInfo?.totalRetries).toBe(2);
                (0, vitest_1.expect)(test.retryInfo?.passedOnRetry).toBe(-1);
                (0, vitest_1.expect)(test.retryInfo?.failedRetries).toBe(2);
                (0, vitest_1.expect)(test.retryInfo?.retryPattern).toEqual([false, false, false]);
            });
            (0, vitest_1.it)('marks test as needing attention when exceeding threshold', () => {
                const test = createTestResult({ status: 'passed', retry: 3 });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.retryInfo?.needsAttention).toBe(true);
            });
            (0, vitest_1.it)('marks test as needing attention based on history', () => {
                const test = createTestResult({ status: 'passed', retry: 0 });
                const history = [
                    createHistoryEntry(1),
                    createHistoryEntry(2),
                    createHistoryEntry(1),
                    createHistoryEntry(0),
                ];
                analyzer.analyze(test, history);
                // 3 out of 4 runs needed retries (75%), should need attention
                (0, vitest_1.expect)(test.retryInfo?.needsAttention).toBe(true);
            });
            (0, vitest_1.it)('handles timedOut status like failed', () => {
                const test = createTestResult({ status: 'timedOut', retry: 1 });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.retryInfo?.failedRetries).toBe(1);
                (0, vitest_1.expect)(test.retryInfo?.passedOnRetry).toBe(-1);
            });
        });
        (0, vitest_1.describe)('needsAttention', () => {
            (0, vitest_1.it)('returns true when retryInfo indicates attention needed', () => {
                const test = createTestResult();
                test.retryInfo = {
                    totalRetries: 3,
                    passedOnRetry: 3,
                    failedRetries: 0,
                    retryPattern: [false, false, false, true],
                    needsAttention: true,
                };
                (0, vitest_1.expect)(analyzer.needsAttention(test)).toBe(true);
            });
            (0, vitest_1.it)('returns false when no retryInfo', () => {
                const test = createTestResult();
                (0, vitest_1.expect)(analyzer.needsAttention(test)).toBe(false);
            });
        });
        (0, vitest_1.describe)('getRetrySummary', () => {
            (0, vitest_1.it)('returns "No retries" for tests without retries', () => {
                const test = createTestResult();
                test.retryInfo = {
                    totalRetries: 0,
                    passedOnRetry: -1,
                    failedRetries: 0,
                    retryPattern: [true],
                    needsAttention: false,
                };
                (0, vitest_1.expect)(analyzer.getRetrySummary(test)).toBe('No retries');
            });
            (0, vitest_1.it)('returns summary for test that passed on retry', () => {
                const test = createTestResult();
                test.retryInfo = {
                    totalRetries: 2,
                    passedOnRetry: 2,
                    failedRetries: 0,
                    retryPattern: [false, false, true],
                    needsAttention: false,
                };
                (0, vitest_1.expect)(analyzer.getRetrySummary(test)).toBe('Passed on retry 3/3');
            });
            (0, vitest_1.it)('returns summary for failed test', () => {
                const test = createTestResult();
                test.retryInfo = {
                    totalRetries: 2,
                    passedOnRetry: -1,
                    failedRetries: 2,
                    retryPattern: [false, false, false],
                    needsAttention: true,
                };
                (0, vitest_1.expect)(analyzer.getRetrySummary(test)).toBe('Failed after 3 attempts');
            });
            (0, vitest_1.it)('handles missing retryInfo', () => {
                const test = createTestResult();
                (0, vitest_1.expect)(analyzer.getRetrySummary(test)).toBe('No retries');
            });
        });
        (0, vitest_1.describe)('calculateRetryRate', () => {
            (0, vitest_1.it)('returns 0 for empty results', () => {
                (0, vitest_1.expect)(analyzer.calculateRetryRate([])).toBe(0);
            });
            (0, vitest_1.it)('calculates retry rate correctly', () => {
                const results = [
                    createTestResult({ retry: 0 }),
                    createTestResult({ retry: 1 }),
                    createTestResult({ retry: 0 }),
                    createTestResult({ retry: 2 }),
                ];
                (0, vitest_1.expect)(analyzer.calculateRetryRate(results)).toBe(0.5);
            });
            (0, vitest_1.it)('returns 0 when no tests have retries', () => {
                const results = [
                    createTestResult({ retry: 0 }),
                    createTestResult({ retry: 0 }),
                ];
                (0, vitest_1.expect)(analyzer.calculateRetryRate(results)).toBe(0);
            });
            (0, vitest_1.it)('returns 1 when all tests have retries', () => {
                const results = [
                    createTestResult({ retry: 1 }),
                    createTestResult({ retry: 2 }),
                ];
                (0, vitest_1.expect)(analyzer.calculateRetryRate(results)).toBe(1);
            });
        });
        (0, vitest_1.describe)('getProblematicTests', () => {
            (0, vitest_1.it)('returns tests that need attention', () => {
                const test1 = createTestResult({ testId: 'test-1', retry: 5 });
                const test2 = createTestResult({ testId: 'test-2', retry: 0 });
                const test3 = createTestResult({ testId: 'test-3', retry: 4 });
                analyzer.analyze(test1, []);
                analyzer.analyze(test2, []);
                analyzer.analyze(test3, []);
                const problematic = analyzer.getProblematicTests([test1, test2, test3]);
                (0, vitest_1.expect)(problematic.length).toBe(2);
                (0, vitest_1.expect)(problematic.map(t => t.testId)).toContain('test-1');
                (0, vitest_1.expect)(problematic.map(t => t.testId)).toContain('test-3');
            });
        });
    });
    (0, vitest_1.describe)('with custom threshold', () => {
        (0, vitest_1.it)('uses custom threshold for attention check', () => {
            const analyzer = new retry_analyzer_1.RetryAnalyzer(1); // Very strict threshold
            const test = createTestResult({ status: 'passed', retry: 1 });
            analyzer.analyze(test, []);
            (0, vitest_1.expect)(test.retryInfo?.needsAttention).toBe(true);
        });
    });
});
