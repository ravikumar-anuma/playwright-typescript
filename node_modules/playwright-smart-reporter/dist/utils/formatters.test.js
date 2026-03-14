"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const formatters_1 = require("./formatters");
(0, vitest_1.describe)('formatDuration', () => {
    (0, vitest_1.it)('formats milliseconds under 1000ms', () => {
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(0)).toBe('0ms');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(100)).toBe('100ms');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(999)).toBe('999ms');
    });
    (0, vitest_1.it)('formats duration in seconds', () => {
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(1000)).toBe('1.0s');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(1500)).toBe('1.5s');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(59999)).toBe('60.0s');
    });
    (0, vitest_1.it)('formats duration in minutes', () => {
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(60000)).toBe('1.0m');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(90000)).toBe('1.5m');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(120000)).toBe('2.0m');
    });
    (0, vitest_1.it)('rounds milliseconds to whole numbers', () => {
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(123.456)).toBe('123ms');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(99.9)).toBe('100ms');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(0.4)).toBe('0ms');
        (0, vitest_1.expect)((0, formatters_1.formatDuration)(50.5)).toBe('51ms');
    });
});
(0, vitest_1.describe)('formatTimestamp', () => {
    (0, vitest_1.it)('formats ISO timestamp to locale string', () => {
        const timestamp = '2024-01-15T10:30:00.000Z';
        const result = (0, formatters_1.formatTimestamp)(timestamp);
        // The exact format depends on locale, but it should be a string
        (0, vitest_1.expect)(typeof result).toBe('string');
        (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)('formatShortDate', () => {
    (0, vitest_1.it)('formats timestamp to short date', () => {
        const timestamp = '2024-01-15T10:30:00.000Z';
        const result = (0, formatters_1.formatShortDate)(timestamp);
        (0, vitest_1.expect)(result).toBe('Jan 15');
    });
    (0, vitest_1.it)('handles different months', () => {
        (0, vitest_1.expect)((0, formatters_1.formatShortDate)('2024-06-20T10:30:00.000Z')).toBe('Jun 20');
        (0, vitest_1.expect)((0, formatters_1.formatShortDate)('2024-12-25T10:30:00.000Z')).toBe('Dec 25');
    });
});
(0, vitest_1.describe)('formatPercent', () => {
    (0, vitest_1.it)('formats decimal to percentage', () => {
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0)).toBe('0%');
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0.5)).toBe('50%');
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0.85)).toBe('85%');
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(1)).toBe('100%');
    });
    (0, vitest_1.it)('rounds to nearest integer', () => {
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0.333)).toBe('33%');
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0.666)).toBe('67%');
        (0, vitest_1.expect)((0, formatters_1.formatPercent)(0.999)).toBe('100%');
    });
});
(0, vitest_1.describe)('formatNumber', () => {
    (0, vitest_1.it)('formats numbers with locale formatting', () => {
        (0, vitest_1.expect)((0, formatters_1.formatNumber)(0)).toBe('0');
        (0, vitest_1.expect)((0, formatters_1.formatNumber)(100)).toBe('100');
        // Note: locale-dependent, may have commas or periods
        const result = (0, formatters_1.formatNumber)(1234);
        (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('handles large numbers', () => {
        const result = (0, formatters_1.formatNumber)(1000000);
        (0, vitest_1.expect)(result).toBeTruthy();
        // Should contain some separator for thousands
        (0, vitest_1.expect)(result.length).toBeGreaterThan(4);
    });
});
