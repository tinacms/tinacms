import { posthog, Properties } from 'posthog-js';

export const TemplateSelectedEvent: string = 'template-selected';
export const PackageManagerSelectedEvent: string = 'package-manager-selected';

export function postHogCapture(event: string, properties: Properties): void {
  if (process.env.TINA_DEV) return;
  const res = posthog.capture(event, {
    ...properties,
    system: 'tinacms/create-tina-app',
  });
  if (res === undefined) {
    console.error(`failed to log ${event} posthog event`);
  }
}
