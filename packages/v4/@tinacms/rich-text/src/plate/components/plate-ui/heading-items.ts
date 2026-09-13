import { type HeadingLevel, isHeadingLevel } from '@tinacms/schema-tools';
import { ParagraphPlugin } from '@udecode/plate/react';
import type { ComponentType, SVGProps } from 'react';
import { Icons } from './icons';

export type HeadingItemIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface HeadingMenuItem {
  description: string;
  icon: HeadingItemIcon;
  label: string;
  value: string;
}

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

export const getHeadingItem = (value: string): HeadingMenuItem | undefined =>
  isHeadingLevel(value) ? headingItemsByLevel[value] : undefined;
