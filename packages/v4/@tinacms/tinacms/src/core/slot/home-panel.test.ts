import { describe, expect, it } from 'vitest';
import { type Capability, type ResolvedSegment, definePlugin } from '../plugin';
import type { HomePanelContribution } from './contract';
import { createHomePanels } from './home-panel';

const Panel = () => null;

const panel = (
  id: string,
  extra: Partial<HomePanelContribution> = {}
): HomePanelContribution => ({
  id,
  component: Panel,
  column: 'main',
  ...extra,
});

const segmentOf = (
  name: string,
  panels: HomePanelContribution[]
): ResolvedSegment => ({
  manifest: definePlugin({ name }),
  segment: { slots: { 'home.panel': panels } },
});

const resolve = (resolved: ResolvedSegment[], provides: Capability[] = []) =>
  createHomePanels(resolved, [
    ...resolved.map(({ manifest }) => manifest),
    definePlugin({ name: 'provider', provides }),
  ]);

const idsOf = (panels: HomePanelContribution[]) => panels.map(({ id }) => id);

describe('home.panel slot', () => {
  it('puts each panel in its desktop column, by `order`, lower first', () => {
    const panels = resolve([
      segmentOf('one', [
        panel('late', { order: 20 }),
        panel('side-late', { column: 'side', order: 5 }),
      ]),
      segmentOf('two', [
        panel('early', { order: 10 }),
        panel('side-early', { column: 'side', order: -1 }),
      ]),
    ]);
    expect(idsOf(panels.main)).toEqual(['early', 'late']);
    expect(idsOf(panels.side)).toEqual(['side-early', 'side-late']);
  });

  it('keeps plugin order, then array order, for a tie, and sorts a missing `order` as 0', () => {
    const panels = resolve([
      segmentOf('one', [panel('a'), panel('b', { order: 0 })]),
      segmentOf('two', [panel('c'), panel('first', { order: -1 })]),
      segmentOf('three', [panel('last', { order: 1 }), panel('d')]),
    ]);
    expect(idsOf(panels.main)).toEqual(['first', 'a', 'b', 'c', 'd', 'last']);
  });

  it('orders the one column by `narrowOrder`, or by `order` without one', () => {
    const panels = resolve([
      segmentOf('one', [
        panel('collections', { order: 10, narrowOrder: 30 }),
        panel('recent', { column: 'side', order: 10, narrowOrder: 20 }),
        panel('branch', { column: 'side', order: 20, narrowOrder: 10 }),
        panel('custom', { order: 25 }),
      ]),
    ]);
    expect(idsOf(panels.narrow)).toEqual([
      'branch',
      'recent',
      'custom',
      'collections',
    ]);
  });

  it('leaves out a panel whose capability no plugin provides, and mounts it when one does', () => {
    const resolved = [
      segmentOf('one', [
        panel('always'),
        panel('needs-media', { dependsOn: ['media'] }),
      ]),
    ];
    expect(idsOf(resolve(resolved).narrow)).toEqual(['always']);
    expect(idsOf(resolve(resolved, ['media']).narrow)).toEqual([
      'always',
      'needs-media',
    ]);
  });

  it('throws for a duplicate id and names both plugins', () => {
    expect(() =>
      resolve([
        segmentOf('one', [panel('stats')]),
        segmentOf('two', [panel('stats')]),
      ])
    ).toThrow(
      /Plugin "two" contributes the Home panel "stats", but plugin "one" already/
    );
  });

  it('throws for a duplicate id even when one of the two is not mounted', () => {
    expect(() =>
      resolve([
        segmentOf('one', [panel('stats', { dependsOn: ['media'] })]),
        segmentOf('two', [panel('stats')]),
      ])
    ).toThrow(/home-panel-duplicate-id/);
  });

  it.each([
    ['an empty id', panel(''), /Plugin "bad" .* empty id/],
    [
      'an unknown column',
      { ...panel('x'), column: 'left' } as unknown as HomePanelContribution,
      /Plugin "bad" .* column "left"/,
    ],
    [
      'an `order` that is not finite',
      panel('x', { order: Number.NaN }),
      /Plugin "bad" .* `order` that is not a finite number/,
    ],
    [
      'an infinite `narrowOrder`',
      panel('x', { narrowOrder: Number.POSITIVE_INFINITY }),
      /Plugin "bad" .* `narrowOrder` that is not a finite number/,
    ],
    [
      'an `order` that is a string',
      { ...panel('x'), order: '1' } as unknown as HomePanelContribution,
      /Plugin "bad" .* `order` that is not a finite number/,
    ],
  ])('throws for %s and names the plugin', (_case, bad, message) => {
    expect(() => resolve([segmentOf('bad', [bad])])).toThrow(message);
  });
});
