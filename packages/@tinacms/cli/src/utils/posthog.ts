import { PostHog } from 'posthog-node';
import fetchPostHogConfig from './fetchPostHogConfig';

export async function initializePostHog(
    configEndpoint?: string,
    disableGeoip?: boolean
  ): Promise<PostHog | null> {
    let apiKey: string | undefined;
    let endpoint: string | undefined;
  
    if (configEndpoint) {
      const config = await fetchPostHogConfig(configEndpoint);
      apiKey = config.POSTHOG_API_KEY;
      endpoint = config.POSTHOG_ENDPOINT;
    }
  
    if (!apiKey) {
      console.warn(
        'PostHog API key not found. PostHog tracking will be disabled.'
      );
      return null;
    }
  
    return new PostHog(apiKey, {
      host: endpoint,
      disableGeoip: disableGeoip ?? true,
    });
  }

export function postHogCapture(
  client: PostHog,
  distinctId: string,
  sessionId: string,
  event: string,
  properties: Record<string, any>
): void {
  if (process.env.TINA_DEV === 'true') return;

  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        sessionId,
        system: 'tinacms/cli',
      },
    });
  } catch (error) {
    console.error('Error capturing event:', error);
  }
}

interface SanitizedError {
  message: string;
  sanitizedStack: string;
  originalStackHash: string;
}

/**
 * Sanitize a stack trace by removing sensitive local paths
 * while preserving useful debugging information
 */
function sanitizeStackTrace(stack: string): string {
  if (!stack) return '';

  let sanitized = stack;

  // Replace Unix-style user home paths
  sanitized = sanitized.replace(/\/Users\/[^\/]+/g, '<user-home>');

  // Replace Windows-style user paths
  sanitized = sanitized.replace(/[A-Z]:\\Users\\[^\\]+/gi, '<user-home>');

  // Replace workspace paths (keep relative structure from create-tina-app)
  sanitized = sanitized.replace(
    /.*\/(packages\/create-tina-app)\//g,
    '<workspace>/$1/'
  );

  // Replace node_modules references
  sanitized = sanitized.replace(
    /(\/|\\)node_modules(\/|\\)/g,
    '<node_modules>/'
  );

  // Replace package cache paths
  sanitized = sanitized.replace(/\.npm\/_cacache/g, '<pkg-cache>');
  sanitized = sanitized.replace(/\.yarn\/cache/g, '<pkg-cache>');
  sanitized = sanitized.replace(/\.pnpm-store/g, '<pkg-cache>');

  // Replace Windows drive letters
  sanitized = sanitized.replace(/[A-Z]:\\/gi, '<drive>/');

  return sanitized;
}

/**
 * Extract meaningful parts of stack trace
 * Limit to first N frames and remove node internals
 */
function truncateStackTrace(stack: string, maxFrames: number = 5): string {
  const lines = stack.split('\n');
  const filtered = lines
    .filter((line) => {
      // Keep error message line
      if (!line.trim().startsWith('at ')) return true;

      // Filter out node internal frames and noisy library frames
      return (
        !line.includes('node:internal') &&
        !line.includes('node_modules/prompts') &&
        !line.includes('node_modules/ora')
      );
    })
    .slice(0, maxFrames + 1); // +1 for error message line

  return filtered.join('\n');
}

/**
 * Create a simple hash from a string for deduplication
 */
function createSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Sanitize an error object for tracking
 */
function sanitizeError(error: Error): SanitizedError {
  const message = error.message || 'Unknown error';
  const rawStack = error.stack || '';

  // Truncate first to reduce size
  const truncated = truncateStackTrace(rawStack);

  // Then sanitize
  const sanitizedStack = sanitizeStackTrace(truncated);

  // Create hash of original stack for deduplication (without line numbers)
  const stackForHash = rawStack
    .replace(/:\d+:\d+/g, '') // Remove line:column
    .replace(/\/Users\/[^\/]+/g, '')
    .replace(/[A-Z]:\\Users\\[^\\]+/gi, '');

  const originalStackHash = createSimpleHash(stackForHash);

  return {
    message,
    sanitizedStack,
    originalStackHash,
  };
}

/**
 * Capture an error event in PostHog with categorized tracking and sanitized stack traces
 *
 * @param client - The PostHog client instance
 * @param distinctId - A unique identifier for the user (hashed system UUID)
 * @param sessionId - A unique identifier for this run/session
 * @param error - The error object that was thrown
 * @param context - Context about the error including code, category, step, and additional properties
 *
 * @remarks
 * - Sanitizes stack traces to remove local file paths
 * - Maps error categories to three event types:
 *   - 'create-tina-app-error' for technical failures (filesystem, network, installation, git, etc.)
 *   - 'create-tina-app-validation-error' for user input validation issues
 *   - 'create-tina-app-user-cancelled' for user cancellations (Ctrl+C)
 * - Includes error code, sanitized stack, step name, and telemetry data in properties
 * - Non-fatal errors are tracked but allow the process to continue
 *
 * @example
 * ```typescript
 * try {
 *   await downloadTemplate();
 * } catch (err) {
 *   postHogCaptureError(client, userId, sessionId, err as Error, {
 *     errorCode: ERROR_CODES.ERR_TPL_DOWNLOAD_FAILED,
 *     errorCategory: 'template',
 *     step: TRACKING_STEPS.DOWNLOADING_TEMPLATE,
 *     fatal: true,
 *     additionalProperties: { template: 'basic' }
 *   });
 * }
 * ```
 */
export function postHogCaptureError(
  client: PostHog | null,
  distinctId: string,
  sessionId: string,
  error: Error,
  context: {
    errorCode: string;
    errorCategory: string;
    step: string;
    fatal?: boolean;
    additionalProperties?: Record<string, any>;
  }
): void {
  if (process.env.TINA_DEV === 'true') return;
  if (!client) return;

  const { message, sanitizedStack, originalStackHash } = sanitizeError(error);
  const {
    errorCode,
    errorCategory,
    step,
    fatal = true,
    additionalProperties = {},
  } = context;

  // Determine event name based on category type
  let eventName: string;
  if (errorCategory === 'user-cancellation') {
    eventName = 'create-tina-app-user-cancelled';
  } else if (errorCategory === 'validation') {
    eventName = 'create-tina-app-validation-error';
  } else {
    // All technical errors (filesystem, template, installation, git, network, uncategorized)
    eventName = 'create-tina-app-error';
  }

  // Build properties
  const properties = {
    error_code: errorCode,
    error_category: errorCategory,
    error_message: message.substring(0, 500), // Limit message length
    sanitized_stack: sanitizedStack,
    stack_hash: originalStackHash,
    step,
    fatal,
    user_cancelled: errorCategory === 'user-cancellation',
    sessionId,
    ...additionalProperties,
  };

  try {
    client.capture({
      distinctId,
      event: eventName,
      properties: {
        ...properties,
        system: 'tinacms/create-tina-app',
      },
    });
  } catch (captureError) {
    console.error('Error capturing error event:', captureError);
  }
}
