#!/usr/bin/env node
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        inputFiles: [],
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-o' || arg === '--output') {
            options.output = args[++i];
        }
        else if (arg === '--max-runs') {
            options.maxRuns = parseInt(args[++i], 10);
            if (isNaN(options.maxRuns)) {
                console.error('Error: --max-runs must be a valid number');
                process.exit(1);
            }
        }
        else if (!arg.startsWith('-')) {
            options.inputFiles.push(arg);
        }
    }
    return options;
}
/**
 * Display usage information
 */
function showUsage() {
    console.log(`
Usage: merge-history [options] <input-files...>

Merge multiple test-history.json files from parallel CI runs.

Options:
  -o, --output <file>    Output file path (default: merged-history.json)
  --max-runs <number>    Limit history size to N most recent runs (optional)
  -h, --help            Show this help message

Examples:
  # Merge two history files
  merge-history history1.json history2.json -o merged.json

  # Merge with glob pattern and limit to 10 runs
  merge-history 'blob-reports/**/test-history.json' -o test-history.json --max-runs 10

  # Merge with max-runs limit
  merge-history ci-run1/test-history.json ci-run2/test-history.json --max-runs 20
`);
}
/**
 * Load a test history file
 */
function loadHistoryFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        // Support both old and new format
        if (parsed.tests) {
            // New format
            return parsed;
        }
        else {
            // Old format: convert to new format
            return {
                runs: [],
                tests: parsed,
                summaries: [],
            };
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to load history from ${filePath}: ${message}`);
    }
}
/**
 * Merge multiple test histories
 */
function mergeHistories(histories) {
    const merged = {
        runs: [],
        tests: {},
        summaries: [],
    };
    // Merge all tests
    for (const history of histories) {
        // Merge test entries
        for (const [testId, entries] of Object.entries(history.tests || {})) {
            if (!merged.tests[testId]) {
                merged.tests[testId] = [];
            }
            merged.tests[testId].push(...entries);
        }
        // Merge run metadata
        if (history.runs) {
            merged.runs.push(...history.runs);
        }
        // Merge summaries
        if (history.summaries) {
            merged.summaries.push(...history.summaries);
        }
    }
    // Remove duplicate runs (by runId)
    const seenRunIds = new Set();
    merged.runs = merged.runs.filter((run) => {
        if (seenRunIds.has(run.runId)) {
            return false;
        }
        seenRunIds.add(run.runId);
        return true;
    });
    // Remove duplicate summaries (by runId)
    const seenSummaryIds = new Set();
    merged.summaries = merged.summaries.filter((summary) => {
        if (seenSummaryIds.has(summary.runId)) {
            return false;
        }
        seenSummaryIds.add(summary.runId);
        return true;
    });
    // Sort runs and summaries by timestamp
    merged.runs.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    merged.summaries.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    // Sort test history entries by timestamp
    for (const testId in merged.tests) {
        merged.tests[testId].sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
    }
    return merged;
}
/**
 * Limit history to most recent N runs
 */
function limitHistory(history, maxRuns) {
    const limited = {
        runs: history.runs.slice(-maxRuns),
        tests: {},
        summaries: history.summaries ? history.summaries.slice(-maxRuns) : [],
    };
    // Get IDs of runs to keep
    const keepRunIds = new Set(limited.runs.map((r) => r.runId));
    // Only keep test entries from runs we're keeping
    if (history.summaries && history.summaries.length > 0) {
        // Calculate how many entries to keep per test
        // based on maxRuns
        const oldestKeptTimestamp = limited.runs.length > 0
            ? new Date(limited.runs[0].timestamp).getTime()
            : 0;
        for (const [testId, entries] of Object.entries(history.tests || {})) {
            limited.tests[testId] = entries.filter((entry) => {
                const entryTime = new Date(entry.timestamp).getTime();
                return entryTime >= oldestKeptTimestamp;
            });
        }
    }
    else {
        // Fallback: keep last maxRuns entries per test
        for (const [testId, entries] of Object.entries(history.tests || {})) {
            limited.tests[testId] = entries.slice(-maxRuns);
        }
    }
    return limited;
}
/**
 * Write merged history to file
 */
function writeHistory(history, outputPath) {
    try {
        const dir = path.dirname(outputPath);
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(history, null, 2));
        console.log(`✓ Merged history written to: ${outputPath}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error writing history file: ${message}`);
        process.exit(1);
    }
}
/**
 * Expand glob patterns in file paths
 */
function expandPaths(patterns) {
    const expanded = [];
    for (const pattern of patterns) {
        // Check if pattern contains glob characters
        if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
            // Use glob expansion via shell
            try {
                const { globSync } = require('glob');
                const matches = globSync(pattern);
                if (matches.length === 0) {
                    console.warn(`Warning: No files matched pattern: ${pattern}`);
                }
                else {
                    expanded.push(...matches);
                }
            }
            catch {
                // Fallback: treat as literal path
                expanded.push(pattern);
            }
        }
        else {
            expanded.push(pattern);
        }
    }
    return [...new Set(expanded)]; // Remove duplicates
}
/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('-h') || args.includes('--help')) {
        showUsage();
        process.exit(0);
    }
    const options = parseArgs();
    // Validate input
    if (options.inputFiles.length === 0) {
        console.error('Error: No input files specified');
        showUsage();
        process.exit(1);
    }
    try {
        // Expand glob patterns
        const expandedFiles = expandPaths(options.inputFiles);
        if (expandedFiles.length === 0) {
            console.error('Error: No input files found');
            process.exit(1);
        }
        // Load all history files
        console.log(`Loading ${expandedFiles.length} history file(s)...`);
        const histories = [];
        for (const filePath of expandedFiles) {
            try {
                const history = loadHistoryFile(filePath);
                histories.push(history);
                console.log(`  ✓ Loaded: ${filePath}`);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`  ✗ Error: ${message}`);
                process.exit(1);
            }
        }
        // Merge histories
        console.log('\nMerging histories...');
        let merged = mergeHistories(histories);
        // Log merge stats before limiting
        const totalTests = Object.keys(merged.tests).length;
        const totalRuns = merged.runs.length;
        console.log(`  ✓ Merged ${totalRuns} unique runs`);
        console.log(`  ✓ Merged ${totalTests} unique tests`);
        // Limit history if requested
        if (options.maxRuns && options.maxRuns > 0) {
            console.log(`\nLimiting history to ${options.maxRuns} most recent runs...`);
            merged = limitHistory(merged, options.maxRuns);
            console.log(`  ✓ Limited to ${merged.runs.length} runs`);
        }
        // Write output
        const outputPath = options.output || 'merged-history.json';
        console.log(`\nWriting output...`);
        writeHistory(merged, outputPath);
        // Print final stats
        console.log('\nMerge Summary:');
        console.log(`  Unique tests: ${Object.keys(merged.tests).length}`);
        console.log(`  Total runs: ${merged.runs.length}`);
        if (merged.summaries && merged.summaries.length > 0) {
            console.log(`  Run summaries: ${merged.summaries.length}`);
            const passRates = merged.summaries.map((s) => s.passRate);
            const avgPassRate = passRates.reduce((a, b) => a + b, 0) / passRates.length;
            console.log(`  Average pass rate: ${Math.round(avgPassRate)}%`);
        }
        process.exit(0);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\nError: ${message}`);
        process.exit(1);
    }
}
// Run main function
main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
