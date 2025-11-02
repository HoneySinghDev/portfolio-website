import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS class conflict resolution
 * Optimized for performance with memoization consideration
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
