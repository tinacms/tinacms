export interface PostHogConfig {
  POSTHOG_API_KEY?: string;
  POSTHOG_ENDPOINT?: string;
}

export default async function fetchPostHogConfig(
  endpointUrl: string
): Promise<PostHogConfig> {
  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cap latency for offline / firewalled developers. Endpoint is
      // typically single-digit ms when reachable; a timeout returns {}
      // and disables telemetry for this run, which is the right behavior.
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PostHog config: ${response.statusText}`);
    }

    const config = await response.json();
    return {
      POSTHOG_API_KEY: config.api_key,
      POSTHOG_ENDPOINT: config.host,
    };
  } catch {
    return {};
  }
}
