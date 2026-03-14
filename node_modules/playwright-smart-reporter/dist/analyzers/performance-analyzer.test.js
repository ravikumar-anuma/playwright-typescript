"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const performance_analyzer_1 = require("./performance-analyzer");
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
function createHistoryEntry(duration, skipped = false) {
    return {
        passed: true,
        duration,
        timestamp: new Date().toISOString(),
        skipped,
    };
}
(0, vitest_1.describe)('PerformanceAnalyzer', () => {
    (0, vitest_1.describe)('with default threshold (20%)', () => {
        const analyzer = new performance_analyzer_1.PerformanceAnalyzer();
        (0, vitest_1.describe)('analyze', () => {
            (0, vitest_1.it)('marks skipped tests appropriately', () => {
                const test = createTestResult({ status: 'skipped' });
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.performanceTrend).toBe('→ Skipped');
            });
            (0, vitest_1.it)('marks tests with no history as baseline', () => {
                const test = createTestResult();
                analyzer.analyze(test, []);
                (0, vitest_1.expect)(test.performanceTrend).toBe('→ Baseline');
            });
            (0, vitest_1.it)('marks tests with only skipped history as baseline', () => {
                const test = createTestResult();
                const history = [
                    createHistoryEntry(1000, true),
                    createHistoryEntry(1500, true),
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceTrend).toBe('→ Baseline');
            });
            (0, vitest_1.it)('marks stable performance (within threshold)', () => {
                const test = createTestResult({ duration: 1100 }); // 10% slower
                const history = [
                    createHistoryEntry(1000),
                    createHistoryEntry(1000),
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceTrend).toBe('→ Stable');
                (0, vitest_1.expect)(test.averageDuration).toBe(1000);
            });
            (0, vitest_1.it)('marks slower tests (above threshold)', () => {
                const test = createTestResult({ duration: 1500 }); // 50% slower
                const history = [
                    createHistoryEntry(1000),
                    createHistoryEntry(1000),
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceTrend).toBe('↑ 50% slower');
                (0, vitest_1.expect)(test.performanceMetrics?.isRegression).toBe(true);
                (0, vitest_1.expect)(test.performanceMetrics?.severity).toBe('medium');
            });
            (0, vitest_1.it)('marks faster tests (below negative threshold)', () => {
                const test = createTestResult({ duration: 500 }); // 50% faster
                const history = [
                    createHistoryEntry(1000),
                    createHistoryEntry(1000),
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceTrend).toBe('↓ 50% faster');
                (0, vitest_1.expect)(test.performanceMetrics?.isImprovement).toBe(true);
            });
            (0, vitest_1.it)('excludes skipped runs from calculations', () => {
                const test = createTestResult({ duration: 1000 });
                const history = [
                    createHistoryEntry(2000), // real
                    createHistoryEntry(5000, true), // skipped - ignored
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.averageDuration).toBe(2000);
                (0, vitest_1.expect)(test.performanceTrend).toBe('↓ 50% faster');
            });
            (0, vitest_1.it)('calculates performance metrics correctly', () => {
                const test = createTestResult({ duration: 1200 });
                const history = [
                    createHistoryEntry(1000),
                    createHistoryEntry(1000),
                ];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceMetrics).toBeDefined();
                (0, vitest_1.expect)(test.performanceMetrics?.averageDuration).toBe(1000);
                (0, vitest_1.expect)(test.performanceMetrics?.currentDuration).toBe(1200);
                (0, vitest_1.expect)(test.performanceMetrics?.percentChange).toBe(20);
                (0, vitest_1.expect)(test.performanceMetrics?.absoluteChange).toBe(200);
            });
        });
        (0, vitest_1.describe)('severity calculation', () => {
            (0, vitest_1.it)('classifies low severity (under 25%)', () => {
                const test = createTestResult({ duration: 1200 }); // 20% slower
                const history = [createHistoryEntry(1000)];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceMetrics?.severity).toBe('low');
            });
            (0, vitest_1.it)('classifies medium severity (25-50%)', () => {
                const test = createTestResult({ duration: 1350 }); // 35% slower
                const history = [createHistoryEntry(1000)];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceMetrics?.severity).toBe('medium');
            });
            (0, vitest_1.it)('classifies high severity (over 50%)', () => {
                const test = createTestResult({ duration: 1600 }); // 60% slower
                const history = [createHistoryEntry(1000)];
                analyzer.analyze(test, history);
                (0, vitest_1.expect)(test.performanceMetrics?.severity).toBe('high');
            });
        });
        (0, vitest_1.describe)('isSlow', () => {
            (0, vitest_1.it)('returns true for slow tests', () => {
                const test = createTestResult();
                test.performanceTrend = '↑ 50% slower';
                (0, vitest_1.expect)(analyzer.isSlow(test)).toBe(true);
            });
            (0, vitest_1.it)('returns false for stable tests', () => {
                const test = createTestResult();
                test.performanceTrend = '→ Stable';
                (0, vitest_1.expect)(analyzer.isSlow(test)).toBe(false);
            });
            (0, vitest_1.it)('returns false for fast tests', () => {
                const test = createTestResult();
                test.performanceTrend = '↓ 50% faster';
                (0, vitest_1.expect)(analyzer.isSlow(test)).toBe(false);
            });
        });
        (0, vitest_1.describe)('isFaster', () => {
            (0, vitest_1.it)('returns true for faster tests', () => {
                const test = createTestResult();
                test.performanceTrend = '↓ 50% faster';
                (0, vitest_1.expect)(analyzer.isFaster(test)).toBe(true);
            });
            (0, vitest_1.it)('returns false for slow tests', () => {
                const test = createTestResult();
                test.performanceTrend = '↑ 50% slower';
                (0, vitest_1.expect)(analyzer.isFaster(test)).toBe(false);
            });
        });
        (0, vitest_1.describe)('getStatus', () => {
            (0, vitest_1.it)('returns correct status for different trends', () => {
                (0, vitest_1.expect)(analyzer.getStatus('↑ 50% slower')).toBe('slow');
                (0, vitest_1.expect)(analyzer.getStatus('↓ 50% faster')).toBe('fast');
                (0, vitest_1.expect)(analyzer.getStatus('→ Stable')).toBe('stable');
                (0, vitest_1.expect)(analyzer.getStatus(undefined)).toBe('stable');
            });
        });
        (0, vitest_1.describe)('calculateSmartThreshold', () => {
            (0, vitest_1.it)('returns looser threshold for very fast tests', () => {
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(50)).toBe(0.5);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(99)).toBe(0.5);
            });
            (0, vitest_1.it)('returns moderate threshold for fast tests', () => {
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(100)).toBe(0.3);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(500)).toBe(0.3);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(999)).toBe(0.3);
            });
            (0, vitest_1.it)('returns default threshold for normal tests', () => {
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(1000)).toBe(0.2);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(5000)).toBe(0.2);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(9999)).toBe(0.2);
            });
            (0, vitest_1.it)('returns tighter threshold for slow tests', () => {
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(10000)).toBe(0.15);
                (0, vitest_1.expect)(analyzer.calculateSmartThreshold(30000)).toBe(0.15);
            });
        });
    });
    (0, vitest_1.describe)('with custom threshold', () => {
        (0, vitest_1.it)('uses custom threshold for analysis', () => {
            const analyzer = new performance_analyzer_1.PerformanceAnalyzer(0.5); // 50% threshold
            const test = createTestResult({ duration: 1400 }); // 40% slower
            const history = [createHistoryEntry(1000)];
            analyzer.analyze(test, history);
            (0, vitest_1.expect)(test.performanceTrend).toBe('→ Stable'); // Within 50% threshold
        });
    });
});
