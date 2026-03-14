/**
 * Utility functions for formatting durations, dates, and other display values
 */
/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "1.5s", "2.3m", "450ms")
 */
export declare function formatDuration(ms: number): string;
/**
 * Format timestamp to localized string
 * @param timestamp - ISO timestamp string
 * @returns Localized date/time string
 */
export declare function formatTimestamp(timestamp: string): string;
/**
 * Format date to short format
 * @param timestamp - ISO timestamp string
 * @returns Short date format (e.g., "Jan 15")
 */
export declare function formatShortDate(timestamp: string): string;
/**
 * Format percentage
 * @param value - Decimal value (e.g., 0.85)
 * @returns Formatted percentage (e.g., "85%")
 */
export declare function formatPercent(value: number): string;
/**
 * Format number with commas
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
export declare function formatNumber(value: number): string;
