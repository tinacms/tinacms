import { randomUUID } from 'node:crypto';
import { PostHog } from 'posthog-node';
import fetchPostHogConfig from './fetchPostHogConfig';

export function generateSessionId(): string {
  return randomUUID();
}

export const BuildInvokeEvent = 'tinacms-cli-build-invoke';
export type BuildInvokeEventPayload = {
  hasLocalOption: boolean;
  hasContentLocal: boolean;
  skipIndexing: boolean;
  partialReindex: boolean;
  hasPreviewName: boolean;
  specifiesTinaGraphQLVersions?: boolean;
  skipCloudChecks: boolean;
  skipSearchIndex: boolean;
};

export const BuildFinishedEvent = 'tinacms-cli-build-finished';
export type BuildFinishedEventPayload = {
  success: boolean;
  durationMs: number;
  errorCode?: string;
};

export async function initializePostHog(
  configEndpoint?: string,
  disableGeoip?: boolean
): Promise<PostHog | null> {
  // Skip the config fetch + client construction entirely when contributors
  // are iterating on the CLI locally. Saves the network round-trip on every
  // dev invocation.
  if (process.env.TINA_DEV === 'true') return null;

  let apiKey: string | undefined;
  let endpoint: string | undefined;

  if (configEndpoint) {
    const config = await fetchPostHogConfig(configEndpoint);
    apiKey = config.POSTHOG_API_KEY;
    endpoint = config.POSTHOG_ENDPOINT;
  }

  if (!apiKey) return null;

  return new PostHog(apiKey, {
    host: endpoint,
    disableGeoip: disableGeoip ?? true,
  });
}

export function postHogCapture(
  client: PostHog,
  distinctId: string,
  event: string,
  properties: Record<string, any>
): void {
  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        system: 'tinacms/cli',
      },
    });
  } catch (error) {
    console.error('Error capturing event:', error);
  }
}
