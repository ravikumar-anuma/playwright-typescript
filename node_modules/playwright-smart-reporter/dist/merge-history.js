#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const smart_reporter_1 = require("./smart-reporter");
function printUsage() {
    console.log(`
Usage: playwright-smart-reporter-merge-history <history1.json> <history2.json> [...] -o <output.json>

Merges multiple test-history.json files into a single unified history file.

Options:
  -o, --output <file>    Output file path (required)
  -n, --max-runs <n>     Maximum history runs to keep (default: 10)
  -h, --help             Show this help message

Example:
  playwright-smart-reporter-merge-history machine1/test-history.json machine2/test-history.json -o merged-history.json
`);
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        printUsage();
        process.exit(0);
    }
    const historyFiles = [];
    let outputFile = null;
    let maxRuns = 10;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-o' || arg === '--output') {
            outputFile = args[++i];
        }
        else if (arg === '-n' || arg === '--max-runs') {
            maxRuns = parseInt(args[++i], 10);
        }
        else if (!arg.startsWith('-')) {
            historyFiles.push(arg);
        }
    }
    if (historyFiles.length === 0) {
        console.error('Error: No history files provided');
        printUsage();
        process.exit(1);
    }
    if (!outputFile) {
        console.error('Error: Output file not specified. Use -o <output.json>');
        printUsage();
        process.exit(1);
    }
    console.log(`Merging ${historyFiles.length} history files...`);
    (0, smart_reporter_1.mergeHistories)(historyFiles, outputFile, maxRuns);
}
main();
