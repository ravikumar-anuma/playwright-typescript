"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sanitizers_1 = require("./sanitizers");
(0, vitest_1.describe)('escapeHtml', () => {
    (0, vitest_1.it)('escapes HTML special characters', () => {
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('<script>')).toBe('&lt;script&gt;');
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('"quotes"')).toBe('&quot;quotes&quot;');
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)("'single'")).toBe('&#039;single&#039;');
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('&ampersand')).toBe('&amp;ampersand');
    });
    (0, vitest_1.it)('handles multiple special characters', () => {
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('<div class="test">content</div>')).toBe('&lt;div class=&quot;test&quot;&gt;content&lt;/div&gt;');
    });
    (0, vitest_1.it)('returns empty string unchanged', () => {
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('')).toBe('');
    });
    (0, vitest_1.it)('returns string without special chars unchanged', () => {
        (0, vitest_1.expect)((0, sanitizers_1.escapeHtml)('hello world')).toBe('hello world');
    });
});
(0, vitest_1.describe)('sanitizeId', () => {
    (0, vitest_1.it)('replaces non-alphanumeric characters with underscores', () => {
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('test-id')).toBe('test_id');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('test.spec.ts')).toBe('test_spec_ts');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('path/to/file')).toBe('path_to_file');
    });
    (0, vitest_1.it)('preserves alphanumeric characters', () => {
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('test123')).toBe('test123');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('ABC')).toBe('ABC');
    });
    (0, vitest_1.it)('handles special characters', () => {
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('test@#$%')).toBe('test____');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeId)('hello world')).toBe('hello_world');
    });
});
(0, vitest_1.describe)('hashString', () => {
    (0, vitest_1.it)('returns consistent hash for same string', () => {
        const hash1 = (0, sanitizers_1.hashString)('test');
        const hash2 = (0, sanitizers_1.hashString)('test');
        (0, vitest_1.expect)(hash1).toBe(hash2);
    });
    (0, vitest_1.it)('returns different hashes for different strings', () => {
        const hash1 = (0, sanitizers_1.hashString)('test1');
        const hash2 = (0, sanitizers_1.hashString)('test2');
        (0, vitest_1.expect)(hash1).not.toBe(hash2);
    });
    (0, vitest_1.it)('returns a hexadecimal string', () => {
        const hash = (0, sanitizers_1.hashString)('test');
        (0, vitest_1.expect)(hash).toMatch(/^[0-9a-f]+$/);
    });
    (0, vitest_1.it)('handles empty string', () => {
        const hash = (0, sanitizers_1.hashString)('');
        (0, vitest_1.expect)(hash).toBe('0');
    });
});
(0, vitest_1.describe)('truncate', () => {
    (0, vitest_1.it)('returns string unchanged if under max length', () => {
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('short', 10)).toBe('short');
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('exact', 5)).toBe('exact');
    });
    (0, vitest_1.it)('truncates long strings with ellipsis', () => {
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('hello world', 8)).toBe('hello...');
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('this is a long string', 10)).toBe('this is...');
    });
    (0, vitest_1.it)('handles edge cases', () => {
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('abc', 3)).toBe('abc');
        (0, vitest_1.expect)((0, sanitizers_1.truncate)('abcd', 3)).toBe('...');
    });
});
(0, vitest_1.describe)('stripAnsiCodes', () => {
    (0, vitest_1.it)('removes ANSI color codes', () => {
        (0, vitest_1.expect)((0, sanitizers_1.stripAnsiCodes)('\x1b[31mred text\x1b[0m')).toBe('red text');
        (0, vitest_1.expect)((0, sanitizers_1.stripAnsiCodes)('\x1b[32mgreen\x1b[0m')).toBe('green');
    });
    (0, vitest_1.it)('removes multiple ANSI codes', () => {
        const input = '\x1b[1m\x1b[31mBold Red\x1b[0m';
        (0, vitest_1.expect)((0, sanitizers_1.stripAnsiCodes)(input)).toBe('Bold Red');
    });
    (0, vitest_1.it)('returns plain text unchanged', () => {
        (0, vitest_1.expect)((0, sanitizers_1.stripAnsiCodes)('plain text')).toBe('plain text');
    });
    (0, vitest_1.it)('handles empty string', () => {
        (0, vitest_1.expect)((0, sanitizers_1.stripAnsiCodes)('')).toBe('');
    });
});
(0, vitest_1.describe)('sanitizeFilename', () => {
    (0, vitest_1.it)('replaces path separators with double underscores', () => {
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('path/to/file')).toBe('path__to__file');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('path\\to\\file')).toBe('path__to__file');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('file:name')).toBe('file__name');
    });
    (0, vitest_1.it)('replaces invalid filename characters', () => {
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('file<name>')).toBe('file_name_');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('file|name')).toBe('file_name');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('file?name')).toBe('file_name');
        (0, vitest_1.expect)((0, sanitizers_1.sanitizeFilename)('file*name')).toBe('file_name');
    });
    (0, vitest_1.it)('handles test IDs with special characters', () => {
        const testId = 'src/tests/login.spec.ts::Login Test';
        const result = (0, sanitizers_1.sanitizeFilename)(testId);
        (0, vitest_1.expect)(result).not.toContain('/');
        (0, vitest_1.expect)(result).not.toContain(':');
        (0, vitest_1.expect)(result).toContain('__');
    });
    (0, vitest_1.it)('truncates very long filenames', () => {
        const longName = 'a'.repeat(300);
        const result = (0, sanitizers_1.sanitizeFilename)(longName);
        (0, vitest_1.expect)(result.length).toBeLessThanOrEqual(200);
    });
    (0, vitest_1.it)('adds hash when truncating for uniqueness', () => {
        const longName1 = 'a'.repeat(300) + '1';
        const longName2 = 'a'.repeat(300) + '2';
        const result1 = (0, sanitizers_1.sanitizeFilename)(longName1);
        const result2 = (0, sanitizers_1.sanitizeFilename)(longName2);
        (0, vitest_1.expect)(result1).not.toBe(result2);
    });
});
