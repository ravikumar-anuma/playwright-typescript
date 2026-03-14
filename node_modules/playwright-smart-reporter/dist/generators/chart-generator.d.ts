/**
 * Chart Generator - Handles all chart generation (trend charts, duration, flaky, slow)
 */
import type { TestResultData, TestHistory } from '../types';
export interface ChartData {
    results: TestResultData[];
    history: TestHistory;
    startTime: number;
}
/**
 * Generate the main trend chart showing pass/fail trends over time
 */
export declare function generateTrendChart(data: ChartData): string;
