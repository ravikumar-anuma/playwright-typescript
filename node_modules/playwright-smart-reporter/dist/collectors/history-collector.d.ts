import type { TestHistory, TestHistoryEntry, TestResultData, RunSummary, RunMetadata, SmartReporterOptions } from '../types';
/**
 * Manages test history persistence and retrieval
 */
export declare class HistoryCollector {
    private history;
    private options;
    private outputDir;
    private currentRun;
    private startTime;
    constructor(options: SmartReporterOptions, outputDir: string);
    /**
     * Load test history from disk
     */
    loadHistory(): void;
    /**
     * Update history with test results
     */
    updateHistory(results: TestResultData[]): void;
    /**
     * Get history for a specific test
     */
    getTestHistory(testId: string): TestHistoryEntry[];
    /**
     * Get full history
     */
    getHistory(): TestHistory;
    /**
     * Get current run metadata
     */
    getCurrentRun(): RunMetadata;
    /**
     * Get options
     */
    getOptions(): SmartReporterOptions;
    /**
     * Get baseline run for comparison (if enabled)
     */
    getBaselineRun(): RunSummary | null;
}
