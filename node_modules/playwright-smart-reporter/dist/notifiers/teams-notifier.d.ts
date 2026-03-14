import type { TestResultData } from '../types';
/**
 * Sends test failure notifications to Microsoft Teams
 */
export declare class TeamsNotifier {
    private webhookUrl?;
    constructor(webhookUrl?: string);
    /**
     * Send notification for test failures
     */
    notify(results: TestResultData[]): Promise<void>;
    /**
     * Send custom message to Teams
     */
    sendMessage(message: string): Promise<void>;
    /**
     * Send rich notification with custom sections
     */
    sendRichNotification(options: {
        title: string;
        summary: string;
        facts: Array<{
            name: string;
            value: string;
        }>;
        text?: string;
        color?: string;
    }): Promise<void>;
    /**
     * Check if notifier is configured
     */
    isConfigured(): boolean;
}
