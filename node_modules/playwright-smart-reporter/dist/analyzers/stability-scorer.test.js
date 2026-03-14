"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const stability_scorer_1 = require("./stability-scorer");
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
function createRetryInfo(overrides = {}) {
    return {
        totalRetries: 0,
        passedOnRetry: -1,
        failedRetries: 0,
        retryPattern: [true],
        needsAttention: false,
        ...overrides,
    };
}
function createPerformanceMetrics(overrides = {}) {
    return {
        averageDuration: 1000,
        currentDuration: 1000,
        percentChange: 0,
        absoluteChange: 0,
        threshold: 0.2,
        isRegression: false,
        isImprovement: false,
        severity: 'low',
        ...overrides,
    };
}
(0, vitest_1.describe)('StabilityScorer', () => {
    (0, vitest_1.describe)('with default threshold (70)', () => {
        const scorer = new stability_scorer_1.StabilityScorer();
        (0, vitest_1.describe)('scoreTest', () => {
            (0, vitest_1.it)('gives high score to stable passing test', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0,
                    retryInfo: createRetryInfo(),
                    performanceMetrics: createPerformanceMetrics(),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore).toBeDefined();
                (0, vitest_1.expect)(test.stabilityScore?.overall).toBeGreaterThanOrEqual(90);
                (0, vitest_1.expect)(test.stabilityScore?.grade).toBe('A');
                (0, vitest_1.expect)(test.stabilityScore?.needsAttention).toBe(false);
            });
            (0, vitest_1.it)('gives lower score to flaky test', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0.5, // 50% failure rate
                    retryInfo: createRetryInfo(),
                    performanceMetrics: createPerformanceMetrics(),
                });
                scorer.scoreTest(test);
                // With 50% flakiness, flakiness score is 50
                // Overall: 50*0.4 + 90*0.3 + 100*0.3 = 20 + 27 + 30 = 77
                (0, vitest_1.expect)(test.stabilityScore?.flakiness).toBe(50);
                (0, vitest_1.expect)(test.stabilityScore?.overall).toBeLessThan(80);
                // Score 77 is above threshold 70, so needsAttention is false
                (0, vitest_1.expect)(test.stabilityScore?.needsAttention).toBe(false);
            });
            (0, vitest_1.it)('gives lower score to test with performance regression', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0,
                    retryInfo: createRetryInfo(),
                    performanceMetrics: createPerformanceMetrics({
                        isRegression: true,
                        severity: 'high',
                    }),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.performance).toBe(25);
                (0, vitest_1.expect)(test.stabilityScore?.overall).toBeLessThan(100);
            });
            (0, vitest_1.it)('gives lower score to test that needed retries', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0,
                    retryInfo: createRetryInfo({
                        totalRetries: 2,
                        passedOnRetry: 2,
                    }),
                    performanceMetrics: createPerformanceMetrics(),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.reliability).toBe(70); // 100 - (2 * 15)
            });
            (0, vitest_1.it)('gives low score to failed test', () => {
                const test = createTestResult({
                    status: 'failed',
                    flakinessScore: 0,
                    retryInfo: createRetryInfo({
                        totalRetries: 2,
                        failedRetries: 2,
                    }),
                    performanceMetrics: createPerformanceMetrics(),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.reliability).toBeLessThanOrEqual(40);
            });
            (0, vitest_1.it)('gives neutral score to skipped test', () => {
                const test = createTestResult({
                    status: 'skipped',
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.reliability).toBe(75);
            });
            (0, vitest_1.it)('gives 100 flakiness score to new test', () => {
                const test = createTestResult({
                    status: 'passed',
                    // flakinessScore is undefined for new tests
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.flakiness).toBe(100);
            });
        });
        (0, vitest_1.describe)('grade calculation', () => {
            (0, vitest_1.it)('assigns grade A for score >= 90', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0,
                    retryInfo: createRetryInfo(),
                    performanceMetrics: createPerformanceMetrics({ isImprovement: true }),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.grade).toBe('A');
            });
            (0, vitest_1.it)('assigns grade B for score 80-89', () => {
                const test = createTestResult({
                    status: 'passed',
                    flakinessScore: 0.1, // 90% flakiness score
                    retryInfo: createRetryInfo({ totalRetries: 1 }),
                    performanceMetrics: createPerformanceMetrics(),
                });
                scorer.scoreTest(test);
                // This should result in a B grade
                (0, vitest_1.expect)(['A', 'B']).toContain(test.stabilityScore?.grade);
            });
            (0, vitest_1.it)('assigns grade F for very low scores', () => {
                const test = createTestResult({
                    status: 'failed',
                    flakinessScore: 0.8, // 20% flakiness score
                    retryInfo: createRetryInfo({ totalRetries: 3, failedRetries: 3 }),
                    performanceMetrics: createPerformanceMetrics({ isRegression: true, severity: 'high' }),
                });
                scorer.scoreTest(test);
                (0, vitest_1.expect)(test.stabilityScore?.grade).toBe('F');
            });
        });
        (0, vitest_1.describe)('calculateSuiteStats', () => {
            (0, vitest_1.it)('calculates correct stats for test suite', () => {
                const results = [
                    createTestResult({ status: 'passed', flakinessScore: 0 }),
                    createTestResult({ status: 'passed', flakinessScore: 0.4 }),
                    createTestResult({ status: 'failed' }),
                    createTestResult({ status: 'skipped' }),
                    createTestResult({ status: 'passed', performanceTrend: '↑ 50% slower' }),
                ];
                // Score the tests first
                results.forEach(r => scorer.scoreTest(r));
                const stats = scorer.calculateSuiteStats(results);
                (0, vitest_1.expect)(stats.total).toBe(5);
                (0, vitest_1.expect)(stats.passed).toBe(3);
                (0, vitest_1.expect)(stats.failed).toBe(1);
                (0, vitest_1.expect)(stats.skipped).toBe(1);
                (0, vitest_1.expect)(stats.flaky).toBe(1); // One test with flakinessScore >= 0.3
                (0, vitest_1.expect)(stats.slow).toBe(1);
                (0, vitest_1.expect)(stats.passRate).toBe(75); // 3/(3+1) = 75%
            });
            (0, vitest_1.it)('handles empty results', () => {
                const stats = scorer.calculateSuiteStats([]);
                (0, vitest_1.expect)(stats.total).toBe(0);
                (0, vitest_1.expect)(stats.passed).toBe(0);
                (0, vitest_1.expect)(stats.passRate).toBe(0);
                (0, vitest_1.expect)(stats.averageStability).toBe(0);
            });
            (0, vitest_1.it)('calculates average stability correctly', () => {
                const results = [
                    createTestResult({ status: 'passed', flakinessScore: 0 }),
                    createTestResult({ status: 'passed', flakinessScore: 0 }),
                ];
                results.forEach(r => scorer.scoreTest(r));
                const stats = scorer.calculateSuiteStats(results);
                (0, vitest_1.expect)(stats.averageStability).toBeGreaterThan(0);
            });
        });
        (0, vitest_1.describe)('getProblematicTests', () => {
            (0, vitest_1.it)('returns tests that need attention', () => {
                const results = [
                    createTestResult({ testId: 'test-1', flakinessScore: 0 }),
                    createTestResult({ testId: 'test-2', flakinessScore: 0.8 }), // Will need attention
                    createTestResult({ testId: 'test-3', flakinessScore: 0 }),
                ];
                results.forEach(r => scorer.scoreTest(r));
                const problematic = scorer.getProblematicTests(results);
                (0, vitest_1.expect)(problematic.length).toBe(1);
                (0, vitest_1.expect)(problematic[0].testId).toBe('test-2');
            });
        });
        (0, vitest_1.describe)('getSummary', () => {
            (0, vitest_1.it)('returns correct summary for stable test', () => {
                const score = {
                    overall: 95,
                    flakiness: 100,
                    performance: 90,
                    reliability: 100,
                    grade: 'A',
                    needsAttention: false,
                };
                (0, vitest_1.expect)(scorer.getSummary(score)).toBe('Grade A (95/100) - ✅ Stable');
            });
            (0, vitest_1.it)('returns correct summary for test needing attention', () => {
                const score = {
                    overall: 45,
                    flakiness: 50,
                    performance: 25,
                    reliability: 60,
                    grade: 'F',
                    needsAttention: true,
                };
                (0, vitest_1.expect)(scorer.getSummary(score)).toBe('Grade F (45/100) - ⚠️ Needs Attention');
            });
        });
    });
    (0, vitest_1.describe)('with custom threshold', () => {
        (0, vitest_1.it)('uses custom threshold for needsAttention', () => {
            const scorer = new stability_scorer_1.StabilityScorer(95); // Very strict threshold
            const test = createTestResult({
                status: 'passed',
                flakinessScore: 0.1, // 90% flakiness score
                retryInfo: createRetryInfo(),
                performanceMetrics: createPerformanceMetrics(),
            });
            scorer.scoreTest(test);
            // Overall: 90*0.4 + 90*0.3 + 100*0.3 = 36 + 27 + 30 = 93
            // With threshold 95, score 93 is below threshold
            (0, vitest_1.expect)(test.stabilityScore?.overall).toBe(93);
            (0, vitest_1.expect)(test.stabilityScore?.needsAttention).toBe(true);
        });
    });
});
