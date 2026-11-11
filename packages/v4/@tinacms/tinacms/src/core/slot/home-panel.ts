import { invariant } from '../invariant';
import type { PluginManifest, ResolvedSegment } from '../plugin';
import {
  DEFAULT_HOME_PANEL_ORDER,
  type HomePanelContribution,
  type HomePanels,
} from './contract';

const isOrder = (value: unknown): boolean =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));

const validatePanel = (
  pluginName: string,
  panel: HomePanelContribution,
  owners: ReadonlyMap<string, string>
): void => {
  invariant(
    typeof panel.id === 'string' && panel.id.length > 0,
    'home-panel-no-id',
    `Plugin "${pluginName}" contributes a Home panel with an empty id.`
  );
  const owner = owners.get(panel.id);
  invariant(
    owner === undefined,
    'home-panel-duplicate-id',
    `Plugin "${pluginName}" contributes the Home panel "${panel.id}", ` +
      `but plugin "${owner}" already contributes a panel with that id.`
  );
  invariant(
    panel.column === 'main' || panel.column === 'side',
    'home-panel-unknown-column',
    `Plugin "${pluginName}" contributes the Home panel "${panel.id}" with the column "${String(panel.column)}". ` +
      'A column is "main" or "side".'
  );
  invariant(
    isOrder(panel.order),
    'home-panel-order-not-finite',
    `Plugin "${pluginName}" contributes the Home panel "${panel.id}" with an \`order\` that is not a finite number.`
  );
  invariant(
    isOrder(panel.narrowOrder),
    'home-panel-narrow-order-not-finite',
    `Plugin "${pluginName}" contributes the Home panel "${panel.id}" with a \`narrowOrder\` that is not a finite number.`
  );
};

const orderOf = ({ order }: HomePanelContribution): number =>
  order ?? DEFAULT_HOME_PANEL_ORDER;

const narrowOrderOf = (panel: HomePanelContribution): number =>
  panel.narrowOrder ?? orderOf(panel);

// `toSorted` is stable, so ties keep plugin order, then array order.
const sortBy = (
  panels: HomePanelContribution[],
  rank: (panel: HomePanelContribution) => number
): HomePanelContribution[] =>
  panels.toSorted((left, right) => rank(left) - rank(right));

// TODO(ADR-013 §5): gate panels on `requires: { permission }` once ADR-008 lands.
export const createHomePanels = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[]
): HomePanels => {
  const provided = new Set(plugins.flatMap((plugin) => plugin.provides));
  const owners = new Map<string, string>();
  const mounted: HomePanelContribution[] = [];
  for (const { manifest, segment } of resolved) {
    for (const panel of segment.slots?.['home.panel'] ?? []) {
      validatePanel(manifest.name, panel, owners);
      owners.set(panel.id, manifest.name);
      if ((panel.dependsOn ?? []).every((it) => provided.has(it))) {
        mounted.push(panel);
      }
    }
  }
  return {
    main: sortBy(
      mounted.filter(({ column }) => column === 'main'),
      orderOf
    ),
    side: sortBy(
      mounted.filter(({ column }) => column === 'side'),
      orderOf
    ),
    narrow: sortBy(mounted, narrowOrderOf),
  };
};
