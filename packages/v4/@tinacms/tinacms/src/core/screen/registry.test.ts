import { describe, expect, it } from 'vitest';
import { type ResolvedSegment, definePlugin } from '../plugin';
import type { AdminScreen } from './contract';
import { createScreenRegistry, screenList } from './registry';

const View = () => null;

const screen = (
  name: string,
  extra: Partial<AdminScreen> = {}
): AdminScreen => ({
  name,
  label: name,
  component: View,
  ...extra,
});

const segmentOf = (name: string, screens: AdminScreen[]): ResolvedSegment => ({
  manifest: definePlugin({ name }),
  segment: { screens },
});

const labelsOf = (resolved: ResolvedSegment[]) =>
  screenList(createScreenRegistry(resolved)).map((entry) => entry.label);

describe('admin screen registry', () => {
  it('composes the screens of every plugin', () => {
    const registry = createScreenRegistry([
      segmentOf('media-plugin', [screen('media')]),
      segmentOf('search-plugin', [screen('search')]),
    ]);
    expect([...registry.keys()]).toEqual(['media', 'search']);
  });

  it('takes more than one screen from a single plugin', () => {
    const registry = createScreenRegistry([
      segmentOf('workflow', [screen('branches'), screen('pull-requests')]),
    ]);
    expect([...registry.keys()]).toEqual(['branches', 'pull-requests']);
  });

  it('ignores a plugin that contributes no screen', () => {
    expect(
      createScreenRegistry([
        { manifest: definePlugin({ name: 'bare' }), segment: {} },
      ]).size
    ).toBe(0);
  });

  it('rejects two plugins claiming one screen name', () => {
    expect(() =>
      createScreenRegistry([
        segmentOf('first', [screen('media')]),
        segmentOf('second', [screen('media')]),
      ])
    ).toThrow(/both contribute an admin screen named "media"/);
  });

  it('rejects a screen name that holds a slash', () => {
    expect(() =>
      createScreenRegistry([
        segmentOf('media-plugin', [screen('media/photos')]),
      ])
    ).toThrow(/admin-screen-name-has-slash/);
  });

  it('rejects an empty screen name', () => {
    expect(() =>
      createScreenRegistry([segmentOf('media-plugin', [screen('')])])
    ).toThrow(/admin-screen-no-name/);
  });
});

describe('screen navigation order', () => {
  it('sorts by the declared order, low to high', () => {
    expect(
      labelsOf([
        segmentOf('a', [screen('third', { label: 'Third', order: 30 })]),
        segmentOf('b', [screen('first', { label: 'First', order: 10 })]),
        segmentOf('c', [screen('second', { label: 'Second', order: 20 })]),
      ])
    ).toEqual(['First', 'Second', 'Third']);
  });

  it('gives the same order whichever way the plugin list is written', () => {
    const media = segmentOf('media-plugin', [
      screen('media', { label: 'Media' }),
    ]);
    const search = segmentOf('search-plugin', [
      screen('search', { label: 'Search' }),
    ]);
    expect(labelsOf([media, search])).toEqual(labelsOf([search, media]));
  });

  it('breaks a tie by name, and not by registration', () => {
    expect(
      labelsOf([
        segmentOf('z-plugin', [screen('zebra', { label: 'Zebra' })]),
        segmentOf('a-plugin', [screen('apple', { label: 'Apple' })]),
      ])
    ).toEqual(['Apple', 'Zebra']);
  });

  it('lets a negative order sit above the default', () => {
    expect(
      labelsOf([
        segmentOf('a', [screen('media', { label: 'Media' })]),
        segmentOf('b', [screen('home', { label: 'Home', order: -10 })]),
      ])
    ).toEqual(['Home', 'Media']);
  });
});
