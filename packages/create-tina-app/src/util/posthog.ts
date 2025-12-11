import { PostHog } from 'posthog-node';
export const CreateTinaAppStartedEvent: string = 'create-tina-app-started';
export const CreateTinaAppFinishedEvent: string = 'create-tina-app-finished';

export function postHogCapture(
  client: PostHog,
  event: string,
  properties: Record<string, any>
): void {
  if (process.env.TINA_DEV === 'true') return;

  if (!client) {
    console.error(`PostHog client not initialized`);
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
