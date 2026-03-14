/**
 * Gallery Generator - NEW feature for attachment gallery
 * Displays all screenshots, videos, and traces in a grid view with lightbox
 */
import type { TestResultData } from '../types';
/**
 * Generate gallery view of all attachments
 */
export declare function generateGallery(results: TestResultData[]): string;
/**
 * Generate JavaScript for gallery functionality
 */
export declare function generateGalleryScript(): string;
