"use strict";
/**
 * Utility functions for formatting durations, dates, and other display values
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = formatDuration;
exports.formatTimestamp = formatTimestamp;
exports.formatShortDate = formatShortDate;
exports.formatPercent = formatPercent;
exports.formatNumber = formatNumber;
/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "1.5s", "2.3m", "450ms")
 */
function formatDuration(ms) {
    if (ms < 1000)
        return `${Math.round(ms)}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}
/**
 * Format timestamp to localized string
 * @param timestamp - ISO timestamp string
 * @returns Localized date/time string
 */
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
/**
 * Format date to short format
 * @param timestamp - ISO timestamp string
 * @returns Short date format (e.g., "Jan 15")
 */
function formatShortDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}
/**
 * Format percentage
 * @param value - Decimal value (e.g., 0.85)
 * @returns Formatted percentage (e.g., "85%")
 */
function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
}
/**
 * Format number with commas
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
function formatNumber(value) {
    return value.toLocaleString();
}
