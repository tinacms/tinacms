export * from './posthog';

export {
  initializePostHog,
  getPostHogClient,
  identifyUser,
  resetPostHog,
  captureEvent,
  getTelemetryMode,
  isAnonymousMode,
} from './posthogProvider';

export type { TelemetryMode } from './posthogProvider';
