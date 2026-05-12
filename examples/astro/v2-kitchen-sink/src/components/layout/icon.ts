/**
 * Icon name registry shared between the Tina schema (which uses Object.keys
 * for the icon dropdown) and the runtime renderer in icon.astro. Keep this
 * file as a plain TS module so the Tina build can import it at config time
 * without resolving any Astro runtime.
 */
export const IconOptions = {
  Tina: 'Tina',
  BiLayer: 'BiLayer',
  BiSearchAlt2: 'BiSearchAlt2',
  BiTerminal: 'BiTerminal',
} as const;

export type IconName = keyof typeof IconOptions;
