export * from './posthog';

export {
  initializePostHog,
  getPostHogClient,
  identifyUser,
  resetPostHog,
  captureEvent,
} from './posthogProvider';
