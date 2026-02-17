export * from './posthog';

export {
  initializePostHog,
  getPostHogClient,
  identifyUser,
  resetPostHog,
  captureEvent,
  getTelemetryMode,
  isAnonymizedMode,
} from './posthogProvider';

export type { TelemetryMode } from './posthogProvider';
