"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs = __importStar(require("fs"));
const smart_reporter_1 = require("./smart-reporter");
vitest_1.vi.mock('fs');
(0, vitest_1.describe)('mergeHistories', () => {
    const mockFs = vitest_1.vi.mocked(fs);
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockFs.existsSync.mockReturnValue(true);
        vitest_1.vi.spyOn(console, 'log').mockImplementation(() => { });
        vitest_1.vi.spyOn(console, 'warn').mockImplementation(() => { });
        vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('merges multiple history files', () => {
        const history1 = {
            runs: [{ runId: 'run-1', timestamp: '2024-01-01T10:00:00Z' }],
            tests: {
                'test-1': [{ passed: true, duration: 1000, timestamp: '2024-01-01T10:00:00Z' }],
            },
            summaries: [{
                    runId: 'run-1',
                    timestamp: '2024-01-01T10:00:00Z',
                    total: 1, passed: 1, failed: 0, skipped: 0,
                    flaky: 0, slow: 0, duration: 1000, passRate: 100,
                }],
        };
        const history2 = {
            runs: [{ runId: 'run-2', timestamp: '2024-01-02T10:00:00Z' }],
            tests: {
                'test-1': [{ passed: false, duration: 1200, timestamp: '2024-01-02T10:00:00Z' }],
                'test-2': [{ passed: true, duration: 800, timestamp: '2024-01-02T10:00:00Z' }],
            },
            summaries: [{
                    runId: 'run-2',
                    timestamp: '2024-01-02T10:00:00Z',
                    total: 2, passed: 1, failed: 1, skipped: 0,
                    flaky: 0, slow: 0, duration: 2000, passRate: 50,
                }],
        };
        mockFs.readFileSync.mockImplementation((path) => {
            if (String(path).includes('history1'))
                return JSON.stringify(history1);
            if (String(path).includes('history2'))
                return JSON.stringify(history2);
            return '';
        });
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['history1.json', 'history2.json'], 'output.json');
        const result = JSON.parse(writtenContent);
        // Check runs are merged and sorted by timestamp
        (0, vitest_1.expect)(result.runs.length).toBe(2);
        (0, vitest_1.expect)(result.runs[0].runId).toBe('run-1');
        (0, vitest_1.expect)(result.runs[1].runId).toBe('run-2');
        // Check tests are merged
        (0, vitest_1.expect)(Object.keys(result.tests).length).toBe(2);
        (0, vitest_1.expect)(result.tests['test-1'].length).toBe(2);
        (0, vitest_1.expect)(result.tests['test-2'].length).toBe(1);
        // Check summaries are merged
        (0, vitest_1.expect)(result.summaries.length).toBe(2);
    });
    (0, vitest_1.it)('deduplicates runs by runId', () => {
        const history = {
            runs: [
                { runId: 'run-1', timestamp: '2024-01-01T10:00:00Z' },
                { runId: 'run-1', timestamp: '2024-01-01T10:00:00Z' }, // Duplicate
            ],
            tests: {},
            summaries: [],
        };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(history));
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['history.json'], 'output.json');
        const result = JSON.parse(writtenContent);
        (0, vitest_1.expect)(result.runs.length).toBe(1);
    });
    (0, vitest_1.it)('respects maxHistoryRuns limit', () => {
        const history = {
            runs: Array(15).fill(null).map((_, i) => ({
                runId: `run-${i}`,
                timestamp: new Date(2024, 0, i + 1).toISOString(),
            })),
            tests: {
                'test-1': Array(15).fill(null).map((_, i) => ({
                    passed: true,
                    duration: 1000,
                    timestamp: new Date(2024, 0, i + 1).toISOString(),
                })),
            },
            summaries: Array(15).fill(null).map((_, i) => ({
                runId: `run-${i}`,
                timestamp: new Date(2024, 0, i + 1).toISOString(),
                total: 1, passed: 1, failed: 0, skipped: 0,
                flaky: 0, slow: 0, duration: 1000, passRate: 100,
            })),
        };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(history));
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['history.json'], 'output.json', 10);
        const result = JSON.parse(writtenContent);
        (0, vitest_1.expect)(result.runs.length).toBe(10);
        (0, vitest_1.expect)(result.tests['test-1'].length).toBe(10);
        (0, vitest_1.expect)(result.summaries.length).toBe(10);
    });
    (0, vitest_1.it)('warns when history file not found', () => {
        mockFs.existsSync.mockReturnValue(false);
        mockFs.writeFileSync.mockImplementation(() => { });
        (0, smart_reporter_1.mergeHistories)(['nonexistent.json'], 'output.json');
        (0, vitest_1.expect)(console.warn).toHaveBeenCalledWith(vitest_1.expect.stringContaining('not found'));
    });
    (0, vitest_1.it)('handles parse errors gracefully', () => {
        mockFs.readFileSync.mockReturnValue('invalid json');
        mockFs.writeFileSync.mockImplementation(() => { });
        // Should not throw
        (0, vitest_1.expect)(() => {
            (0, smart_reporter_1.mergeHistories)(['bad.json'], 'output.json');
        }).not.toThrow();
        (0, vitest_1.expect)(console.error).toHaveBeenCalled();
    });
    (0, vitest_1.it)('uses default maxHistoryRuns of 10', () => {
        const history = {
            runs: Array(20).fill(null).map((_, i) => ({
                runId: `run-${i}`,
                timestamp: new Date(2024, 0, i + 1).toISOString(),
            })),
            tests: {},
            summaries: [],
        };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(history));
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['history.json'], 'output.json');
        const result = JSON.parse(writtenContent);
        (0, vitest_1.expect)(result.runs.length).toBe(10);
    });
    (0, vitest_1.it)('sorts entries by timestamp before slicing', () => {
        const history = {
            runs: [
                { runId: 'run-3', timestamp: '2024-01-03T10:00:00Z' },
                { runId: 'run-1', timestamp: '2024-01-01T10:00:00Z' },
                { runId: 'run-2', timestamp: '2024-01-02T10:00:00Z' },
            ],
            tests: {},
            summaries: [],
        };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(history));
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['history.json'], 'output.json');
        const result = JSON.parse(writtenContent);
        (0, vitest_1.expect)(result.runs[0].runId).toBe('run-1');
        (0, vitest_1.expect)(result.runs[1].runId).toBe('run-2');
        (0, vitest_1.expect)(result.runs[2].runId).toBe('run-3');
    });
    (0, vitest_1.it)('handles empty history files', () => {
        const history = {
            runs: [],
            tests: {},
            summaries: [],
        };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(history));
        let writtenContent = '';
        mockFs.writeFileSync.mockImplementation((_path, content) => {
            writtenContent = String(content);
        });
        (0, smart_reporter_1.mergeHistories)(['empty.json'], 'output.json');
        const result = JSON.parse(writtenContent);
        (0, vitest_1.expect)(result.runs).toEqual([]);
        (0, vitest_1.expect)(result.tests).toEqual({});
        (0, vitest_1.expect)(result.summaries).toEqual([]);
    });
});
