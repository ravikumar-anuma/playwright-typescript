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
exports.buildPlaywrightStyleAiPrompt = buildPlaywrightStyleAiPrompt;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Mirrors Playwright HTML reporter "Copy prompt" structure (see playwright-core HTML report bundle).
const PLAYWRIGHT_COPY_PROMPT_INSTRUCTIONS = `
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.
`.trimStart();
function safeRelativePath(rootDir, filePath) {
    const rel = path.relative(rootDir, filePath);
    if (rel.startsWith('..'))
        return filePath;
    return rel;
}
function chunkToString(chunk) {
    return typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
}
function stripAnsi(text) {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
}
function readTextAttachment(config, result, name, maxChars = 80000) {
    const rootDir = config.rootDir;
    const attachment = result.attachments.find((a) => a.name === name);
    if (!attachment)
        return undefined;
    try {
        let content = '';
        if (attachment.body)
            content = attachment.body.toString('utf-8');
        else if (attachment.path)
            content = fs.readFileSync(attachment.path, 'utf-8');
        if (!content.trim())
            return undefined;
        if (content.length > maxChars)
            return content.slice(0, maxChars) + '\n…(truncated)…';
        return content;
    }
    catch {
        if (attachment.path)
            return `Could not read ${name} from: ${safeRelativePath(rootDir, attachment.path)}`;
        return `Could not read ${name}.`;
    }
}
function resultStdoutText(config, result) {
    const fromAttachment = readTextAttachment(config, result, 'stdout', 50000);
    if (fromAttachment)
        return fromAttachment;
    const text = result.stdout.map(chunkToString).join('');
    return text.trim() ? text : undefined;
}
function resultStderrText(config, result) {
    const fromAttachment = readTextAttachment(config, result, 'stderr', 50000);
    if (fromAttachment)
        return fromAttachment;
    const text = result.stderr.map(chunkToString).join('');
    return text.trim() ? text : undefined;
}
function formatNameForCopyPrompt(test) {
    const parts = test.titlePath().filter(Boolean);
    const prefix = parts.slice(0, -1).join(' >> ');
    return prefix ? `${prefix} >> ${test.title}` : test.title;
}
function formatTestError(error) {
    const parts = [];
    if (error.message)
        parts.push(error.message);
    else if (error.value)
        parts.push(error.value);
    else
        parts.push('Unknown error');
    if (error.stack && error.stack !== error.message)
        parts.push(error.stack);
    if (error.snippet)
        parts.push(error.snippet);
    if (error.location?.file)
        parts.push(`at ${error.location.file}:${error.location.line}:${error.location.column}`);
    return parts.join('\n');
}
function pickCopyPromptErrors(formattedErrors) {
    // Matches Playwright logic: keep multiline errors, and keep one-line errors
    // that are not included as a substring of any other error text.
    const oneLine = new Set(formattedErrors.filter((m) => m && !m.includes('\n')));
    for (const error of formattedErrors) {
        for (const candidate of oneLine.keys()) {
            if (error.includes(candidate))
                oneLine.delete(candidate);
        }
    }
    return formattedErrors.filter((m) => m && (m.includes('\n') || oneLine.has(m)));
}
function buildCodeFrame(config, filePath, line, column, context = 2) {
    try {
        const absPath = path.isAbsolute(filePath) ? filePath : path.join(config.rootDir, filePath);
        const content = fs.readFileSync(absPath, 'utf-8');
        const lines = content.split(/\r?\n/);
        const idx = Math.max(0, line - 1);
        const start = Math.max(0, idx - context);
        const end = Math.min(lines.length - 1, idx + context);
        const width = String(end + 1).length;
        const out = [];
        for (let i = start; i <= end; i++) {
            const lineNo = String(i + 1).padStart(width, ' ');
            const marker = i === idx ? '>' : ' ';
            out.push(`${marker} ${lineNo} | ${lines[i] ?? ''}`);
            if (i === idx) {
                const caretPos = Math.max(0, column - 1);
                out.push(`  ${' '.repeat(width)} | ${' '.repeat(caretPos)}^`);
            }
        }
        return out.join('\n');
    }
    catch {
        return undefined;
    }
}
function buildPlaywrightStyleAiPrompt(params) {
    const { config, test, result } = params;
    const testFile = safeRelativePath(config.rootDir, test.location.file);
    const testInfo = [
        `- Name: ${formatNameForCopyPrompt(test)}`,
        `- Location: ${testFile}:${test.location.line}:${test.location.column}`,
    ].join('\n');
    const allErrors = (result.errors ?? []).map(formatTestError);
    const errorsForPrompt = pickCopyPromptErrors(allErrors);
    if (!errorsForPrompt.length)
        return '';
    const lines = [PLAYWRIGHT_COPY_PROMPT_INSTRUCTIONS, '# Test info', '', testInfo];
    const stdout = resultStdoutText(config, result);
    if (stdout)
        lines.push('', '# Stdout', '', '```', stripAnsi(stdout), '```');
    const stderr = resultStderrText(config, result);
    if (stderr)
        lines.push('', '# Stderr', '', '```', stripAnsi(stderr), '```');
    lines.push('', '# Error details');
    for (const errorText of errorsForPrompt)
        lines.push('', '```', stripAnsi(errorText), '```');
    // This is where Playwright includes the page snapshot for AI ("aria snapshot") as markdown:
    // it attaches error-context.md with "# Page snapshot" and a ```yaml block.
    const errorContext = readTextAttachment(config, result, 'error-context', 120000);
    if (errorContext)
        lines.push('', errorContext);
    const lastErrorLoc = result.errors?.[result.errors.length - 1]?.location;
    const frame = lastErrorLoc?.file && lastErrorLoc.line && lastErrorLoc.column
        ? buildCodeFrame(config, lastErrorLoc.file, lastErrorLoc.line, lastErrorLoc.column)
        : buildCodeFrame(config, test.location.file, test.location.line, test.location.column);
    if (frame)
        lines.push('', '# Test source', '', '```ts', frame, '```');
    const prompt = lines.join('\n');
    return prompt.length > 200000 ? prompt.slice(0, 200000) + '\n…(truncated)…' : prompt;
}
