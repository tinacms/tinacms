import type { ComponentType, SVGProps } from 'react';
import { ParagraphPlugin } from '@udecode/plate/react';
import { isHeadingLevel, type HeadingLevel } from '@tinacms/schema-tools';
import { Icons } from './icons';

// Permissive enough to accept both Lucide icons and the project's
// custom SVG components, both of which only need `className` from
// the caller.
export type HeadingItemIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface HeadingMenuItem {
  description: string;
  icon: HeadingItemIcon;
  label: string;
  value: string;
}

// Builder that preserves the `Record<HeadingLevel, T>` shape without
// `as` — each key is spelled out so TS verifies exhaustiveness.
const buildByLevel = <T>(
  make: (level: HeadingLevel) => T
): Record<HeadingLevel, T> => ({
  h1: make('h1'),
  h2: make('h2'),
  h3: make('h3'),
  h4: make('h4'),
  h5: make('h5'),
  h6: make('h6'),
});

export const headingItemsByLevel: Record<HeadingLevel, HeadingMenuItem> =
  buildByLevel((level) => {
    const depth = level.slice(1);
    return {
      description: `Heading ${depth}`,
      icon: Icons[level],
      label: `Heading ${depth}`,
      value: level,
    };
  });

export const paragraphItem: HeadingMenuItem = {
  description: 'Paragraph',
  icon: Icons.paragraph,
  label: 'Paragraph',
  value: ParagraphPlugin.key,
};

/** Looks up the menu item for any block value. Returns `undefined`
 * for non-heading values so callers can fall back as they see fit
 * (e.g. to `paragraphItem` for the dropdown trigger label). */
export const getHeadingItem = (value: string): HeadingMenuItem | undefined =>
  isHeadingLevel(value) ? headingItemsByLevel[value] : undefined;
