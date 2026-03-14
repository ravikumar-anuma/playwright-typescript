import type { TestResult } from '@playwright/test/reporter';
import type { AttachmentData } from '../types';
export interface AttachmentCollectorOptions {
    cspSafe?: boolean;
    outputDir?: string;
}
/**
 * Collects and processes test attachments (screenshots, videos, traces)
 */
export declare class AttachmentCollector {
    private options;
    private screenshotCounter;
    constructor(options?: AttachmentCollectorOptions);
    /**
     * Ensure the output directory exists
     */
    private ensureOutputDir;
    /**
     * Save a screenshot to file and return relative path
     * Screenshots are saved directly in the output directory (same as HTML) for Jenkins compatibility
     */
    private saveScreenshotToFile;
    /**
     * Collect all attachments from a test result
     * @param result - Playwright TestResult
     * @returns Attachment data with base64 screenshots (or file paths if cspSafe) and file paths
     */
    collectAttachments(result: TestResult): AttachmentData;
    /**
     * Get the first screenshot (for backwards compatibility)
     * @param attachments - Attachment data
     * @returns First screenshot data URI or undefined
     */
    getFirstScreenshot(attachments: AttachmentData): string | undefined;
    /**
     * Get the first video path (for backwards compatibility)
     * @param attachments - Attachment data
     * @returns First video path or undefined
     */
    getFirstVideo(attachments: AttachmentData): string | undefined;
    /**
     * Check if test has any attachments
     * @param attachments - Attachment data
     * @returns True if any attachments exist
     */
    hasAttachments(attachments: AttachmentData): boolean;
}
