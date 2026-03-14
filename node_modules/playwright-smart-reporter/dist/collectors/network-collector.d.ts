import type { NetworkLogData } from '../types';
export interface NetworkCollectorOptions {
    /** Filter URLs - only include URLs containing this string */
    urlFilter?: string;
    /** Filter by content types (e.g., ['application/json', 'text/html']) */
    contentTypeFilter?: string[];
    /** Exclude static assets (images, fonts, css, js) */
    excludeStaticAssets?: boolean;
    /** Maximum number of entries to include per test */
    maxEntries?: number;
    /** Include request/response headers */
    includeHeaders?: boolean;
    /** Include request/response bodies (when available) */
    includeBodies?: boolean;
}
/**
 * Collects network logs from Playwright trace files
 */
export declare class NetworkCollector {
    private options;
    constructor(options?: NetworkCollectorOptions);
    /**
     * Extract network logs from a trace zip file
     */
    collectFromTrace(tracePath: string): Promise<NetworkLogData>;
    /**
     * Parse a single network entry from trace data
     */
    private parseNetworkEntry;
    /**
     * Check if entry should be included based on filters
     */
    private shouldInclude;
    /**
     * Convert headers array to object
     */
    private headersToObject;
    /**
     * Get content type from response
     */
    private getContentType;
    /**
     * Try to parse JSON, return original string if fails
     */
    private tryParseJson;
    /**
     * Get status text for common HTTP status codes
     */
    private getStatusText;
}
