import type { FullConfig, TestCase, TestResult } from '@playwright/test/reporter';
export declare function buildPlaywrightStyleAiPrompt(params: {
    config: FullConfig;
    test: TestCase;
    result: TestResult;
}): string;
