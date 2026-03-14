"use strict";
/**
 * Utility functions for sanitizing HTML and generating safe IDs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
exports.sanitizeId = sanitizeId;
exports.hashString = hashString;
exports.truncate = truncate;
exports.stripAnsiCodes = stripAnsiCodes;
exports.sanitizeFilename = sanitizeFilename;
/**
 * Escape HTML special characters to prevent XSS
 * @param str - String to escape
 * @returns HTML-safe string
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/**
 * Generate a safe HTML ID from a string
 * @param str - String to convert to ID
 * @returns Safe ID string (alphanumeric + underscores only)
 */
function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '_');
}
/**
 * Generate a hash code from a string (for clustering)
 * @param str - String to hash
 * @returns Hash code as hex string
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}
/**
 * Truncate string to max length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
/**
 * Strip ANSI escape codes from a string
 * @param str - String containing ANSI codes
 * @returns String with ANSI codes removed
 */
function stripAnsiCodes(str) {
    // Remove ANSI escape sequences (e.g., \x1b[31m, \x1b[0m, etc.)
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
/**
 * Sanitize a string to be used as a safe filename
 * Replaces path separators and other problematic characters while preserving readability
 * Also truncates long filenames to prevent ENAMETOOLONG errors
 * @param str - String to sanitize
 * @param maxLength - Maximum length for the filename (default: 200 to leave room for suffixes)
 * @returns Safe filename string
 */
function sanitizeFilename(str, maxLength = 200) {
    // Replace path separators and colons with double underscores for better readability
    let sanitized = str.replace(/[\/\\:]/g, '__').replace(/[<>"|?*\n\r]/g, '_');
    // Truncate if too long, appending hash for uniqueness
    if (sanitized.length > maxLength) {
        const hash = hashString(str);
        const truncateLength = maxLength - hash.length - 1; // -1 for separator
        sanitized = sanitized.substring(0, truncateLength) + '-' + hash;
    }
    return sanitized;
}
