/**
 * Comprehensive validation utilities for the portfolio application
 * Provides type-safe validation for various data types and edge cases
 */

import { logger } from './logger';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * URL validation with comprehensive checks
 */
export const validateUrl = (
  url: string,
  options: {
    allowedProtocols?: string[];
    requireHttps?: boolean;
    allowLocalhost?: boolean;
  } = {}
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const urlObj = new URL(url);

    // Check protocol
    const allowedProtocols = options.allowedProtocols || [
      'http:',
      'https:',
      'mailto:',
    ];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      errors.push(
        `Invalid protocol: ${urlObj.protocol}. Allowed: ${allowedProtocols.join(', ')}`
      );
    }

    // Check HTTPS requirement
    if (options.requireHttps && urlObj.protocol !== 'https:') {
      errors.push('HTTPS is required for this URL');
    }

    // Check localhost
    if (
      !options.allowLocalhost &&
      (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1')
    ) {
      errors.push('Localhost URLs are not allowed');
    }

    // Check for suspicious patterns
    if (urlObj.hostname.includes('..') || urlObj.hostname.includes('//')) {
      errors.push('Suspicious URL pattern detected');
    }

    // Check for very long URLs
    if (url.length > 2048) {
      warnings.push('URL is very long, consider shortening');
    }
  } catch {
    errors.push('Invalid URL format');
  }

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
};

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
    return { isValid: false, errors };
  }

  // Length check
  if (email.length > 254) {
    errors.push('Email address is too long');
  }

  // Check for common typos
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && !commonDomains.includes(domain)) {
    warnings.push('Uncommon email domain detected');
  }

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
};

/**
 * GitHub username validation
 */
export const validateGitHubUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  // GitHub username rules
  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }

  if (username.length < 1 || username.length > 39) {
    errors.push('Username must be between 1 and 39 characters');
  }

  if (!/^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/.test(username)) {
    errors.push(
      'Username can only contain alphanumeric characters and hyphens (not at start/end)'
    );
  }

  if (username.startsWith('-') || username.endsWith('-')) {
    errors.push('Username cannot start or end with a hyphen');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Image URL validation - supports both absolute URLs and relative/local paths
 */
export const validateImageUrl = (url: string): ValidationResult => {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Image URL is required'],
    };
  }

  const trimmedUrl = url.trim();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if it's a relative/local path (starts with / or ./)
  const isRelativePath =
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('./') ||
    trimmedUrl.startsWith('../');

  if (isRelativePath) {
    // For relative paths, just check for valid image extensions
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.avif',
      '.ico',
    ];
    const hasImageExtension = imageExtensions.some(
      ext =>
        trimmedUrl.toLowerCase().endsWith(ext) ||
        trimmedUrl.toLowerCase().includes(ext)
    );

    if (!hasImageExtension) {
      warnings.push(
        'Relative path does not appear to be an image (no common image extension found)'
      );
    }

    // Check for path traversal attempts
    if (trimmedUrl.includes('..') && trimmedUrl.split('..').length > 2) {
      errors.push('Invalid path: potential path traversal detected');
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }

  // For absolute URLs, validate as URL
  try {
    const urlValidation = validateUrl(trimmedUrl, {
      allowedProtocols: ['https:', 'http:'],
      requireHttps: false,
      allowLocalhost: process.env.NODE_ENV === 'development',
    });

    if (!urlValidation.isValid) {
      return urlValidation;
    }

    // Check for common image extensions
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.avif',
      '.ico',
    ];
    const hasImageExtension = imageExtensions.some(ext =>
      trimmedUrl.toLowerCase().includes(ext)
    );

    if (!hasImageExtension) {
      warnings.push(
        'URL does not appear to be an image (no common image extension found)'
      );
    }

    const result: ValidationResult = {
      isValid: true,
      errors,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  } catch {
    return {
      isValid: false,
      errors: ['Invalid image URL format'],
    };
  }
};

/**
 * Project data validation
 */
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  githubUrl?: string;
  color?: string;
}

export const validateProjectData = (project: ProjectData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!project.id || project.id.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (!project.title || project.title.trim().length === 0) {
    errors.push('Project title is required');
  }

  if (!project.description || project.description.trim().length === 0) {
    errors.push('Project description is required');
  }

  // Length validations
  if (project.title && project.title.length > 100) {
    errors.push('Project title is too long (max 100 characters)');
  }

  if (project.description && project.description.length > 500) {
    warnings.push(
      'Project description is quite long (max 500 characters recommended)'
    );
  }

  // Tags validation
  if (!Array.isArray(project.tags)) {
    errors.push('Tags must be an array');
  } else {
    if (project.tags.length === 0) {
      warnings.push('No tags provided for project');
    }

    if (project.tags.length > 10) {
      warnings.push('Too many tags (max 10 recommended)');
    }

    project.tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        errors.push(`Tag at index ${index} is invalid`);
      } else if (tag.length > 20) {
        warnings.push(
          `Tag "${tag}" is quite long (max 20 characters recommended)`
        );
      }
    });
  }

  // URL validations
  if (project.githubUrl) {
    const githubValidation = validateUrl(project.githubUrl, {
      allowedProtocols: ['https:'],
      requireHttps: true,
    });
    if (!githubValidation.isValid) {
      errors.push(`Invalid GitHub URL: ${githubValidation.errors.join(', ')}`);
    }
  }

  if (project.image) {
    try {
      const imageValidation = validateImageUrl(project.image);
      if (!imageValidation.isValid) {
        // Only treat as error if it's a critical issue, warnings are acceptable
        const criticalErrors = imageValidation.errors.filter(
          err => !err.includes('does not appear to be an image')
        );
        if (criticalErrors.length > 0) {
          errors.push(`Invalid image URL: ${criticalErrors.join(', ')}`);
        }
      }
      if (imageValidation.warnings && imageValidation.warnings.length > 0) {
        warnings.push(...imageValidation.warnings);
      }
    } catch (error) {
      logger.warn('Error validating project image', {
        projectId: project.id,
        imageUrl: project.image,
        error: error instanceof Error ? error.message : String(error),
      });
      warnings.push('Could not validate image URL');
    }
  }

  // Color validation
  if (project.color && !/^[a-zA-Z]+$/.test(project.color)) {
    errors.push('Color must be a valid color name');
  }

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
};

/**
 * Skill data validation
 */
export interface SkillData {
  name: string;
  value: number;
  icon?: React.ReactNode;
  details?: string;
  projects?: string[];
  years?: number;
}

export const validateSkillData = (skill: SkillData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!skill.name || skill.name.trim().length === 0) {
    errors.push('Skill name is required');
  }

  if (typeof skill.value !== 'number' || skill.value < 0 || skill.value > 100) {
    errors.push('Skill value must be a number between 0 and 100');
  }

  // Length validations
  if (skill.name && skill.name.length > 50) {
    errors.push('Skill name is too long (max 50 characters)');
  }

  if (skill.details && skill.details.length > 200) {
    warnings.push(
      'Skill details are quite long (max 200 characters recommended)'
    );
  }

  // Years validation
  if (skill.years !== undefined) {
    if (
      typeof skill.years !== 'number' ||
      skill.years < 0 ||
      skill.years > 50
    ) {
      errors.push('Years of experience must be a number between 0 and 50');
    }
  }

  // Projects validation
  if (skill.projects && Array.isArray(skill.projects)) {
    if (skill.projects.length > 10) {
      warnings.push('Too many projects listed (max 10 recommended)');
    }

    skill.projects.forEach((project, index) => {
      if (typeof project !== 'string' || project.trim().length === 0) {
        errors.push(`Project at index ${index} is invalid`);
      } else if (project.length > 50) {
        warnings.push(`Project "${project}" name is quite long`);
      }
    });
  }

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
};

/**
 * Safe URL creation with validation and error handling
 */
export const createSafeUrl = (url: string, baseUrl?: string): URL | null => {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    logger.warn('Empty or invalid URL string provided', { url, baseUrl });
    return null;
  }

  try {
    const trimmedUrl = url.trim();
    const urlValidation = validateUrl(trimmedUrl, {
      allowedProtocols: ['http:', 'https:', 'mailto:'],
      requireHttps: false,
      allowLocalhost: process.env.NODE_ENV === 'development',
    });

    if (!urlValidation.isValid) {
      logger.warn('Invalid URL provided', {
        url: trimmedUrl,
        errors: urlValidation.errors,
        baseUrl,
      });
      return null;
    }

    return baseUrl ? new URL(trimmedUrl, baseUrl) : new URL(trimmedUrl);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to create URL', err, { url, baseUrl });
    return null;
  }
};

/**
 * Sanitize HTML content - removes potentially dangerous HTML/JavaScript
 * Note: For production use, consider integrating DOMPurify for comprehensive sanitization
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '');
  } catch (error) {
    logger.error(
      'Failed to sanitize HTML',
      error instanceof Error ? error : new Error(String(error)),
      { htmlLength: html.length }
    );
    return '';
  }
};

/**
 * Validate and sanitize user input with comprehensive checks
 */
export const validateAndSanitizeInput = (
  input: unknown,
  maxLength: number = 1000,
  minLength: number = 0
): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} => {
  const errors: string[] = [];

  if (input === null || input === undefined) {
    return { isValid: false, sanitized: '', errors: ['Input is required'] };
  }

  if (typeof input !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      errors: ['Input must be a string'],
    };
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    errors.push(`Input is too short (min ${minLength} characters)`);
  }

  if (trimmed.length > maxLength) {
    errors.push(`Input is too long (max ${maxLength} characters)`);
  }

  if (trimmed.length === 0 && minLength > 0) {
    errors.push('Input cannot be empty');
  }

  const sanitized = sanitizeHtml(trimmed);

  if (sanitized.length !== trimmed.length && trimmed.length > 0) {
    errors.push('Input contained potentially unsafe content that was removed');
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
};
