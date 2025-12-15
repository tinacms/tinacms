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
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PostHog config: ${response.statusText}`);
    }

    const config = await response.json();
    return {
      POSTHOG_API_KEY: config.api_key,
      POSTHOG_ENDPOINT: config.host,
    };
  } catch (error) {
    console.warn(
      `Failed to fetch PostHog config from endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return {};
  }
}
