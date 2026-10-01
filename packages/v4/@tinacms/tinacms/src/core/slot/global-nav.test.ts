import { describe, expect, it } from 'vitest';
import { type ResolvedSegment, definePlugin } from '../plugin';
import type { AdminScreen } from '../screen/contract';
import { createScreenRegistry } from '../screen/registry';
import type { GlobalNavEntry } from './contract';
import { createGlobalNav } from './global-nav';

const Icon = () => null;

const entry = (
  label: string,
  extra: Partial<GlobalNavEntry> = {}
): GlobalNavEntry => ({
  label,
  icon: Icon,
  target: { kind: 'url', href: `https://example.com/${label}` },
  ...extra,
});

const segmentOf = (
  name: string,
  globalNav: GlobalNavEntry[],
  screens: AdminScreen[] = []
): ResolvedSegment => ({
  manifest: definePlugin({ name }),
  segment: { screens, slots: { globalNav } },
});

const labelsOf = (resolved: ResolvedSegment[], provides: string[] = []) => {
  const plugins = [
    ...resolved.map(({ manifest }) => manifest),
    definePlugin({
      name: 'provider',
      provides: provides as ('media' | 'search')[],
    }),
  ];
  return createGlobalNav(
    resolved,
    plugins,
    createScreenRegistry(resolved, plugins)
  ).map(({ label }) => label);
};

describe('global nav slot', () => {
  it('stacks the entries of every plugin instead of conflicting', () => {
    expect(
      labelsOf([
        segmentOf('one', [entry('Help')]),
        segmentOf('two', [entry('Help'), entry('Docs')]),
      ])
    ).toEqual(['Help', 'Help', 'Docs']);
  });

  it('orders by `order`, then by plugin order', () => {
    expect(
      labelsOf([
        segmentOf('one', [entry('Last', { order: 10 }), entry('Middle')]),
        segmentOf('two', [entry('First', { order: -1 }), entry('Tie')]),
      ])
    ).toEqual(['First', 'Middle', 'Tie', 'Last']);
  });

  it('hides an entry whose dependency no plugin provides', () => {
    const resolved = [
      segmentOf('one', [
        entry('Media', { dependsOn: ['media'] }),
        entry('Search', { dependsOn: ['search'] }),
      ]),
    ];
    expect(labelsOf(resolved, ['media'])).toEqual(['Media']);
  });

  it('accepts a screen target that an installed plugin contributes', () => {
    const View = () => null;
    expect(
      labelsOf([
        segmentOf(
          'media',
          [entry('Media', { target: { kind: 'screen', screen: 'media' } })],
          [{ name: 'media', label: 'Media', component: View }]
        ),
      ])
    ).toEqual(['Media']);
  });

  it('rejects a screen target no plugin contributes', () => {
    expect(() =>
      labelsOf([
        segmentOf('one', [
          entry('Ghost', { target: { kind: 'screen', screen: 'ghost' } }),
        ]),
      ])
    ).toThrow(/no installed plugin contributes a screen named "ghost"/);
  });

  it('hides an entry whose screen belongs to a plugin that is not installed', () => {
    expect(
      labelsOf([
        segmentOf('tina:sidebar:media', [
          entry('Media', {
            target: { kind: 'screen', screen: 'media' },
            dependsOn: ['media'],
          }),
        ]),
      ])
    ).toEqual([]);
  });

  it('still rejects a missing screen once the dependencies are met', () => {
    expect(() =>
      labelsOf(
        [
          segmentOf('tina:sidebar:media', [
            entry('Media', {
              target: { kind: 'screen', screen: 'media' },
              dependsOn: ['media'],
            }),
          ]),
        ],
        ['media']
      )
    ).toThrow(/no installed plugin contributes a screen named "media"/);
  });

  it('hides an entry whose screen another plugin removed', () => {
    const View = () => null;
    const resolved = [
      segmentOf(
        'tina:media',
        [entry('Media', { target: { kind: 'screen', screen: 'media' } })],
        [{ name: 'media', label: 'Media', component: View }]
      ),
    ];
    const plugins = [
      ...resolved.map(({ manifest }) => manifest),
      definePlugin({
        name: 'tina:no-media-screen',
        provides: ['screen'],
        overrides: [{ capability: 'screen', key: 'media' }],
      }),
    ];
    expect(
      createGlobalNav(
        resolved,
        plugins,
        createScreenRegistry(resolved, plugins)
      ).map(({ label }) => label)
    ).toEqual([]);
  });

  it('still rejects a missing screen that an override names but nobody contributes', () => {
    const resolved = [
      segmentOf('tina:sidebar:help', [
        entry('Help', { target: { kind: 'screen', screen: 'help' } }),
      ]),
    ];
    const plugins = [
      ...resolved.map(({ manifest }) => manifest),
      definePlugin({
        name: 'tina:no-help-screen',
        provides: ['screen'],
        overrides: [{ capability: 'screen', key: 'help' }],
      }),
    ];
    expect(() =>
      createGlobalNav(
        resolved,
        plugins,
        createScreenRegistry(resolved, plugins)
      )
    ).toThrow(/no installed plugin contributes a screen named "help"/);
  });

  it('rejects an entry with an empty label', () => {
    expect(() => labelsOf([segmentOf('one', [entry('')])])).toThrow(
      /empty label/
    );
  });
});
