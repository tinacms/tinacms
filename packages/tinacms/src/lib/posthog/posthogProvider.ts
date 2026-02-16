import posthog, { PostHog } from 'posthog-js';

let posthogClient: PostHog | null = null;
let isInitialized = false;
let initializationPromise: Promise<PostHog | null> | null = null;

interface PostHogConfigResponse {
  api_key?: string;
  host?: string;
}

const POSTHOG_CONFIG_ENDPOINT = 'https://identity-v2.tinajs.io/v2/posthog-token';

/**
 * Fetch PostHog configuration from the TinaCloud identity service.
 */
async function fetchPostHogConfig(): Promise<PostHogConfigResponse> {
  try {
    const response = await fetch(POSTHOG_CONFIG_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch PostHog config: ${response.statusText}`);
      return {};
    }

    return await response.json();
  } catch (error) {
    console.warn(
      'Failed to fetch PostHog config:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {};
  }
}

/**
 * Initialize PostHog client for browser-side analytics.
 * Fetches config from TinaCloud identity service.
 * Call this once at app startup (e.g., in TinaCloudProvider or TinaAdmin).
 */
export async function initializePostHog(): Promise<PostHog | null> {
  // Return existing client if already initialized
  if (isInitialized && posthogClient) {
    return posthogClient;
  }

  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Skip in dev mode
  if (process.env.TINA_DEV === 'true') {
    return null;
  }

  initializationPromise = (async () => {
    const config = await fetchPostHogConfig();

    if (!config.api_key) {
      console.warn(
        'PostHog API key not found. PostHog tracking will be disabled.'
      );
      return null;
    }

    posthog.init(config.api_key, {
      api_host: config.host || 'https://us.i.posthog.com',
      persistence: 'localStorage',
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
    });

    posthogClient = posthog;
    isInitialized = true;

    return posthogClient;
  })();

  return initializationPromise;
}

/**
 * Get the PostHog client instance.
 * Returns null if not initialized.
 */
export function getPostHogClient(): PostHog | null {
  return posthogClient;
}

/**
 * Identify a user in PostHog.
 * Call this after authentication.
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, any>
): void {
  if (posthogClient) {
    posthogClient.identify(userId, properties);
  }
}

/**
 * Reset PostHog identity.
 * Call this on logout.
 */
export function resetPostHog(): void {
  if (posthogClient) {
    posthogClient.reset();
  }
}

/**
 * Capture an event in PostHog.
 */
export function captureEvent(
  event: string,
  properties?: Record<string, any>
): void {
  if (!posthogClient) {
    return;
  }

  try {
    posthogClient.capture(event, {
      ...properties,
      system: 'tinacms/tinacms',
    });
  } catch (error) {
    console.error('Error capturing PostHog event:', error);
  }
}
