import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { type Tier, useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { ReviewUnsavedButton } from '../../admin/review-unsaved';
import type { AdminScreenProps } from '../../core/screen/contract';
import { useContentMode } from '../../editor/content-mode';
import { useUnsavedFormIds } from '../../form/form-store';
import { BranchPanel } from './branch-panel';
import { CollectionsPanel } from './collections-panel';
import { RecentDocumentsPanel } from './recent-documents-panel';

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

function Column({
  name,
  children,
}: {
  name: 'main' | 'side' | 'narrow';
  children: ReactNode;
}) {
  return (
    <div data-home-column={name} className='flex min-w-0 flex-col gap-4'>
      {children}
    </div>
  );
}

const CONTAINER_TABLET_MIN = 528;
const CONTAINER_DESKTOP_MIN = 1040;

const tierOfWidth = (width: number): Tier => {
  if (width >= CONTAINER_DESKTOP_MIN) return 'desktop';
  return width >= CONTAINER_TABLET_MIN ? 'tablet' : 'phone';
};

// Home can sit beside the navigator tree, so its layout follows its own width. Until it is measured, the window decides.
const useHomeTier = () => {
  const windowTier = useTier();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.borderBoxSize[0]?.inlineSize ?? 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return { ref: setElement, tier: width > 0 ? tierOfWidth(width) : windowTier };
};

// Review N unsaved is in the head only when there is no Branch panel to hold it.
export function HomeScreen(_props: AdminScreenProps) {
  const { ref, tier } = useHomeTier();
  const mode = useContentMode();
  const unsaved = useUnsavedFormIds().length;
  const showReview = mode !== 'branches' && unsaved > 0;
  const isPhone = tier === 'phone';
  const collections = (
    <PanelBoundary>
      <CollectionsPanel tier={tier} />
    </PanelBoundary>
  );
  const recent = (
    <PanelBoundary>
      <RecentDocumentsPanel tier={tier} />
    </PanelBoundary>
  );
  const branch = (
    <PanelBoundary>
      <BranchPanel />
    </PanelBoundary>
  );
  return (
    <div
      ref={ref}
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
            <p className='m-0 text-base text-muted-foreground'>{LOCAL_LINE}</p>
          ) : null}
        </div>
        {showReview ? (
          <ReviewUnsavedButton count={unsaved} full={isPhone} />
        ) : null}
      </div>
      {tier === 'desktop' ? (
        <div className='grid grid-cols-[minmax(0,1fr)_25rem] items-start gap-4'>
          <Column name='main'>{collections}</Column>
          <Column name='side'>
            {recent}
            {branch}
          </Column>
        </div>
      ) : (
        <Column name='narrow'>
          {branch}
          {recent}
          {collections}
        </Column>
      )}
    </div>
  );
}
