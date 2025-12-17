import { PostHog } from 'posthog-node';
export const CreateTinaAppStartedEvent: string = 'create-tina-app-started';
export const CreateTinaAppFinishedEvent: string = 'create-tina-app-finished';

/**
 * Sends an event to PostHog for analytics tracking.
 *
 * @param client - The PostHog client instance used to send the event
 * @param event - The name of the event to track (e.g., 'create-tina-app-started')
 * @param properties - Additional properties to include with the event
 *
 * @remarks
 * - Returns early if the PostHog client is not provided
 * - Skips sending data when `TINA_DEV` environment variable is set to 'true'
 * - Automatically adds a 'system' property with value 'tinacms/create-tina-app'
 * - Uses 'create-tina-app' as the distinctId for all events
 * - Logs errors to console if event capture fails
 *
 * @example
 * ```typescript
 * const client = new PostHog('api-key');
 * postHogCapture(client, 'create-tina-app-started', {
 *   template: 'basic',
 *   typescript: true
 * });
 * ```
 */
export function postHogCapture(
  client: PostHog,
  event: string,
  properties: Record<string, any>
): void {
  if (process.env.TINA_DEV === 'true') return;

  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId: 'create-tina-app',
      event,
      properties: {
        ...properties,
        system: 'tinacms/create-tina-app',
      },
    });
  } catch (error) {
    console.error('Error capturing event:', error);
  }
}
