import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { SidebarInset } from '@tinacms/ui/components/sidebar';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import { Component, type ReactNode } from 'react';
import type { CollectionSchema } from '../core/schema/types';
import type { HomePanelContribution, HomeTier } from '../core/slot/contract';
import { useContentMode } from '../editor/content-mode';
import { useUnsavedFormIds } from '../form/form-store';
import { useHomePanels } from './hooks';
import { ReviewUnsavedButton } from './review-unsaved';
import type { AdminRoute } from './routing';

const LOCAL_LINE = 'Local files: Tina writes edits straight to disk.';

interface PanelBoundaryState {
  failed: boolean;
}

// React gives no hook for an error boundary. This must stay a class.
class PanelBoundary extends Component<
  { children: ReactNode },
  PanelBoundaryState
> {
  state: PanelBoundaryState = { failed: false };

  static getDerivedStateFromError(): PanelBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <HomePanelTray
        title='Panel'
        problem="Couldn't show this panel."
        onRetry={() => this.setState({ failed: false })}
      />
    );
  }
}

function Panels({
  column,
  panels,
  tier,
}: {
  column: 'main' | 'side' | 'narrow';
  panels: HomePanelContribution[];
  tier: HomeTier;
}) {
  return (
    <div data-home-column={column} className='flex min-w-0 flex-col gap-4'>
      {panels.map(({ id, component: Panel }) => (
        <PanelBoundary key={id}>
          <Panel tier={tier} />
        </PanelBoundary>
      ))}
    </div>
  );
}

/**
 * The landing screen: a dashboard of the panels that plugins contribute to the
 * `home.panel` slot. Review N unsaved is in the head only when there is no
 * Branch panel to hold it.
 */
export function HomePanel(_props: {
  collections: CollectionSchema[];
  navigate: (route: AdminRoute) => void;
}) {
  const tier = useTier();
  const panels = useHomePanels();
  const mode = useContentMode();
  const unsaved = useUnsavedFormIds().length;
  const showReview = mode !== 'branches' && unsaved > 0;
  const isPhone = tier === 'phone';
  return (
    <SidebarInset className='min-w-0'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div
          className={cn(
            'mx-auto flex w-full max-w-360 flex-col gap-6 px-4 pt-7 pb-24',
            tier === 'tablet' && 'px-6',
            tier === 'desktop' && 'px-10'
          )}
        >
          <div
            className={cn(
              'flex gap-3',
              isPhone ? 'flex-col' : 'flex-wrap items-end justify-between gap-4'
            )}
          >
            <div className='flex min-w-0 flex-col gap-1 wrap-anywhere'>
              <h2 className='m-0 text-2xl font-semibold'>Home</h2>
              {mode === 'local' ? (
                <p className='m-0 text-base text-muted-foreground'>
                  {LOCAL_LINE}
                </p>
              ) : null}
            </div>
            {showReview ? (
              <ReviewUnsavedButton count={unsaved} full={isPhone} />
            ) : null}
          </div>
          {tier === 'desktop' ? (
            <div className='grid grid-cols-[minmax(0,1fr)_25rem] items-start gap-4'>
              <Panels column='main' panels={panels.main} tier={tier} />
              <Panels column='side' panels={panels.side} tier={tier} />
            </div>
          ) : (
            <Panels column='narrow' panels={panels.narrow} tier={tier} />
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
