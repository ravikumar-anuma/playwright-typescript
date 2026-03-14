import type { TestResultData } from '../types';
/**
 * Sends test failure notifications to Slack
 */
export declare class SlackNotifier {
    private webhookUrl?;
    constructor(webhookUrl?: string);
    /**
     * Send notification for test failures
     */
    notify(results: TestResultData[]): Promise<void>;
    /**
     * Send custom message to Slack
     */
    sendMessage(message: string): Promise<void>;
    /**
     * Send rich notification with custom blocks
     */
    sendRichNotification(options: {
        title: string;
        summary: string;
        fields: Array<{
            name: string;
            value: string;
        }>;
        color?: 'good' | 'warning' | 'danger';
    }): Promise<void>;
    /**
     * Check if notifier is configured
     */
    isConfigured(): boolean;
}
