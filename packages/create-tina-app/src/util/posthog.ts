import { PostHog } from 'posthog-node';
import { createHash, randomUUID } from 'node:crypto';
import { system as getSystemInfo } from 'systeminformation';

export const CreateTinaAppStartedEvent: string = 'create-tina-app-started';
export const CreateTinaAppFinishedEvent: string = 'create-tina-app-finished';

/**
 * Step names for tracking progress through the create-tina-app process
 */
export const TRACKING_STEPS = {
  INIT: 'initializing',
  PRE_RUN_CHECKS: 'pre_run_checks',
  TELEMETRY_SETUP: 'telemetry_setup',
  PKG_MANAGER_SELECT: 'package_manager_selection',
  PROJECT_NAME_INPUT: 'project_name_input',
  TEMPLATE_SELECT: 'template_selection',
  THEME_SELECT: 'theme_selection',
  DIRECTORY_SETUP: 'directory_setup',
  DOWNLOADING_TEMPLATE: 'downloading_template',
  UPDATING_METADATA: 'updating_metadata',
  INSTALLING_PACKAGES: 'installing_packages',
  GIT_INIT: 'git_initialization',
  COMPLETE: 'complete',
} as const;

/**
 * Generate a unique session ID for this run
 */
export function generateSessionId(): string {
  return randomUUID();
}

/**
 * Get a hashed user ID based on system UUID
 * Returns a consistent anonymous identifier for the machine
 */
export async function getAnonymousUserId(): Promise<string> {
  try {
    const sysInfo = await getSystemInfo();
    const systemUuid = sysInfo.uuid || 'unknown';

    if (systemUuid === 'unknown' || !systemUuid) {
      // Fallback to a random UUID if system UUID is not available
      return `fallback-${randomUUID()}`;
    }

    // Hash the system UUID for anonymization
    const hash = createHash('sha256');
    hash.update(systemUuid);
    return hash.digest('hex').substring(0, 32); // First 32 chars is plenty
  } catch (error) {
    // Fallback if systeminformation fails
    return `fallback-${randomUUID()}`;
  }
}

/**
 * Structured error codes for categorizing failures
 */
export const ERROR_CODES = {
  // Validation Errors (VAL_*)
  ERR_VAL_INVALID_TEMPLATE: 'ERR_VAL_INVALID_TEMPLATE',
  ERR_VAL_INVALID_PKG_MANAGER: 'ERR_VAL_INVALID_PKG_MANAGER',
  ERR_VAL_INVALID_PROJECT_NAME: 'ERR_VAL_INVALID_PROJECT_NAME',
  ERR_VAL_UNSUPPORTED_NODE: 'ERR_VAL_UNSUPPORTED_NODE',
  ERR_VAL_NO_PKG_MANAGERS: 'ERR_VAL_NO_PKG_MANAGERS',

  // File System Errors (FS_*)
  ERR_FS_NOT_WRITABLE: 'ERR_FS_NOT_WRITABLE',
  ERR_FS_HAS_CONFLICTS: 'ERR_FS_HAS_CONFLICTS',
  ERR_FS_MKDIR_FAILED: 'ERR_FS_MKDIR_FAILED',
  ERR_FS_CHDIR_FAILED: 'ERR_FS_CHDIR_FAILED',
  ERR_FS_READ_PACKAGE_JSON: 'ERR_FS_READ_PACKAGE_JSON',
  ERR_FS_WRITE_PACKAGE_JSON: 'ERR_FS_WRITE_PACKAGE_JSON',
  ERR_FS_UPDATE_THEME_FAILED: 'ERR_FS_UPDATE_THEME_FAILED',
  ERR_FS_COPY_TEMPLATE_FAILED: 'ERR_FS_COPY_TEMPLATE_FAILED',

  // Network Errors (NET_*)
  ERR_NET_POSTHOG_CONFIG_FETCH: 'ERR_NET_POSTHOG_CONFIG_FETCH',
  ERR_NET_TARBALL_DOWNLOAD: 'ERR_NET_TARBALL_DOWNLOAD',
  ERR_NET_GITHUB_API_FAILED: 'ERR_NET_GITHUB_API_FAILED',
  ERR_NET_REPO_INFO_NOT_FOUND: 'ERR_NET_REPO_INFO_NOT_FOUND',
  ERR_NET_REPO_INVALID_URL: 'ERR_NET_REPO_INVALID_URL',
  ERR_NET_TARBALL_EXTRACT: 'ERR_NET_TARBALL_EXTRACT',

  // Installation Errors (INSTALL_*)
  ERR_INSTALL_PKG_MANAGER_FAILED: 'ERR_INSTALL_PKG_MANAGER_FAILED',
  ERR_INSTALL_PKG_MANAGER_NOT_FOUND: 'ERR_INSTALL_PKG_MANAGER_NOT_FOUND',
  ERR_INSTALL_SPAWN_ERROR: 'ERR_INSTALL_SPAWN_ERROR',
  ERR_INSTALL_TIMEOUT: 'ERR_INSTALL_TIMEOUT',

  // Git Errors (GIT_*)
  ERR_GIT_NOT_INSTALLED: 'ERR_GIT_NOT_INSTALLED',
  ERR_GIT_INIT_FAILED: 'ERR_GIT_INIT_FAILED',
  ERR_GIT_ADD_FAILED: 'ERR_GIT_ADD_FAILED',
  ERR_GIT_COMMIT_FAILED: 'ERR_GIT_COMMIT_FAILED',
  ERR_GIT_CHECKOUT_FAILED: 'ERR_GIT_CHECKOUT_FAILED',
  ERR_GIT_ALREADY_INITIALIZED: 'ERR_GIT_ALREADY_INITIALIZED',

  // User Cancellation (CANCEL_*)
  ERR_CANCEL_PKG_MANAGER_PROMPT: 'ERR_CANCEL_PKG_MANAGER_PROMPT',
  ERR_CANCEL_PROJECT_NAME_PROMPT: 'ERR_CANCEL_PROJECT_NAME_PROMPT',
  ERR_CANCEL_TEMPLATE_PROMPT: 'ERR_CANCEL_TEMPLATE_PROMPT',
  ERR_CANCEL_THEME_PROMPT: 'ERR_CANCEL_THEME_PROMPT',
  ERR_CANCEL_SIGINT: 'ERR_CANCEL_SIGINT',

  // Configuration Errors (CFG_*)
  ERR_CFG_POSTHOG_INIT_FAILED: 'ERR_CFG_POSTHOG_INIT_FAILED',
  ERR_CFG_OSINFO_FETCH_FAILED: 'ERR_CFG_OSINFO_FETCH_FAILED',
  ERR_CFG_TELEMETRY_SETUP_FAILED: 'ERR_CFG_TELEMETRY_SETUP_FAILED',

  // Template Errors (TPL_*)
  ERR_TPL_DOWNLOAD_FAILED: 'ERR_TPL_DOWNLOAD_FAILED',
  ERR_TPL_EXTRACT_FAILED: 'ERR_TPL_EXTRACT_FAILED',
  ERR_TPL_METADATA_UPDATE_FAILED: 'ERR_TPL_METADATA_UPDATE_FAILED',
  ERR_TPL_INTERNAL_COPY_FAILED: 'ERR_TPL_INTERNAL_COPY_FAILED',
  ERR_TPL_THEME_UPDATE_FAILED: 'ERR_TPL_THEME_UPDATE_FAILED',

  // Uncategorized
  ERR_UNCAUGHT: 'ERR_UNCAUGHT',
} as const;

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
 * Sends an event to PostHog for analytics tracking.
 *
 * @param client - The PostHog client instance used to send the event
 * @param distinctId - A unique identifier for the user (hashed system UUID)
 * @param sessionId - A unique identifier for this run/session
 * @param event - The name of the event to track (e.g., 'create-tina-app-started')
 * @param properties - Additional properties to include with the event
 *
 * @remarks
 * - Returns early if the PostHog client is not provided
 * - Skips sending data when `TINA_DEV` environment variable is set to 'true'
 * - Automatically adds a 'system' property with value 'tinacms/create-tina-app'
 * - Includes sessionId in properties to track individual runs
 * - Uses hashed system UUID as distinctId to track unique users anonymously
 * - Logs errors to console if event capture fails
 *
 * @example
 * ```typescript
 * const client = new PostHog('api-key');
 * const userId = await getAnonymousUserId();
 * const sessionId = generateSessionId();
 * postHogCapture(client, userId, sessionId, 'create-tina-app-started', {
 *   template: 'basic',
 *   typescript: true
 * });
 * ```
 */
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
        system: 'tinacms/create-tina-app',
      },
    });
  } catch (error) {
    console.error('Error capturing event:', error);
  }
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
