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
const child_process_1 = require("child_process");
function printUsage() {
    console.log(`
Usage: playwright-smart-reporter-view-trace <trace.zip> [options]

Opens the trace using Playwright's native trace viewer:
  npx playwright show-trace <trace.zip>

Options:
  --dir <dir>       Resolve <trace.zip> relative to this directory (default: .)
  -h, --help        Show this help message

Examples:
  playwright-smart-reporter-view-trace ./traces/my-trace.zip
  playwright-smart-reporter-view-trace ./traces/my-trace.zip --dir ./example
`);
}
function parseArgs(argv) {
    const args = argv.slice(2);
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        printUsage();
        process.exit(0);
    }
    const options = {
        rootDir: '.',
        tracePath: '',
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--dir') {
            options.rootDir = args[++i] || options.rootDir;
        }
        else if (!arg.startsWith('-') && !options.tracePath) {
            options.tracePath = arg;
        }
    }
    if (!options.tracePath) {
        console.error('Error: <trace.zip> is required');
        printUsage();
        process.exit(1);
    }
    return options;
}
function runPlaywrightShowTrace(traceFsPath) {
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(npxCmd, ['playwright', 'show-trace', traceFsPath], { stdio: 'inherit' });
        child.on('exit', (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`playwright show-trace exited with code ${code ?? 'unknown'}`));
        });
        child.on('error', reject);
    });
}
function guessReportRoot(traceFsPath) {
    const normalized = traceFsPath.replace(/\\/g, '/');
    const marker = '/traces/';
    const idx = normalized.lastIndexOf(marker);
    if (idx !== -1)
        return normalized.substring(0, idx);
    return path.dirname(traceFsPath);
}
function findTraceUnderRoot(rootDir, tracePath) {
    const root = path.resolve(process.cwd(), rootDir);
    const direct = path.resolve(root, tracePath);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile())
        return direct;
    const fileName = path.basename(tracePath);
    const commonRoots = [
        root,
        path.join(root, 'example'),
        path.join(root, 'blob-reports', 'merged'),
    ];
    for (const base of commonRoots) {
        const candidate = path.join(base, 'traces', fileName);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
            return candidate;
    }
    // Limited search: look for */traces/<fileName> within a few levels
    const deny = new Set(['node_modules', '.git', 'dist']);
    const queue = [{ dir: root, depth: 0 }];
    while (queue.length > 0) {
        const { dir, depth } = queue.shift();
        if (depth > 4)
            continue;
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const ent of entries) {
            if (!ent.isDirectory())
                continue;
            if (deny.has(ent.name))
                continue;
            const child = path.join(dir, ent.name);
            if (ent.name === 'traces') {
                const candidate = path.join(child, fileName);
                if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
                    return candidate;
            }
            else {
                queue.push({ dir: child, depth: depth + 1 });
            }
        }
    }
    return null;
}
async function main() {
    const options = parseArgs(process.argv);
    const configuredRoot = path.resolve(process.cwd(), options.rootDir);
    let traceFsPath = path.resolve(configuredRoot, options.tracePath);
    if (!fs.existsSync(traceFsPath)) {
        // If user passed an absolute path (or a path relative to CWD), use it.
        const asProvided = path.resolve(process.cwd(), options.tracePath);
        if (fs.existsSync(asProvided) && fs.statSync(asProvided).isFile()) {
            traceFsPath = asProvided;
        }
        else {
            const found = findTraceUnderRoot(options.rootDir, options.tracePath);
            if (found)
                traceFsPath = found;
        }
    }
    if (!fs.existsSync(traceFsPath) || !fs.statSync(traceFsPath).isFile()) {
        console.error(`Error: trace file not found: ${traceFsPath}`);
        console.error('Tip: pass --dir pointing at the report folder (the folder that contains smart-report.html and ./traces).');
        console.error(`Example: npx playwright-smart-reporter-view-trace ${JSON.stringify(options.tracePath)} --dir "./example"`);
        process.exit(1);
    }
    // Best-effort hint if users want to run relative to the report folder.
    const reportRoot = guessReportRoot(traceFsPath);
    console.log(`📄 Report folder: ${reportRoot}`);
    await runPlaywrightShowTrace(traceFsPath);
}
void main();
