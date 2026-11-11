import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { Icon } from '@tinacms/ui/components/icon';
import { ReviewUnsavedButton } from '../../admin/review-unsaved';
import { type BranchView, useBranchView } from '../../editor/branch';
import { useContentMode } from '../../editor/content-mode';
import { useUnsavedFormIds } from '../../form/form-store';

const ROW = 'flex min-h-11 min-w-0 items-center gap-3 px-2.5 py-1.5';

function BranchName({ branch }: { branch: BranchView }) {
  if (!branch.name) return null;
  const isProtected = branch.branches.some(
    (candidate) => candidate.name === branch.name && candidate.protected
  );
  return (
    <div className={ROW}>
      <span className='inline-flex flex-none text-muted-foreground'>
        <Icon glyph='branch' size={16} />
      </span>
      <span className='flex min-w-0 flex-col'>
        <span className='font-mono tracking-code wrap-anywhere'>
          {branch.name}
        </span>
        {isProtected ? (
          <span className='text-xs text-muted-foreground'>Protected</span>
        ) : null}
      </span>
    </div>
  );
}

function BranchPanelBody({ branch }: { branch: BranchView }) {
  const unsaved = useUnsavedFormIds().length;
  const isLoading =
    branch.listState !== 'ready' && branch.listState !== 'failed';
  return (
    <HomePanelTray
      title='Branch'
      loading={isLoading ? 2 : false}
      problem={
        branch.listState === 'failed' ? "Couldn't load this branch." : undefined
      }
      onRetry={branch.retryList}
    >
      <div className='flex flex-col'>
        <BranchName branch={branch} />
        {unsaved > 0 ? (
          <div className='mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border px-2 pt-3 pb-1'>
            <span className='text-sm text-muted-foreground'>
              {unsaved === 1
                ? '1 document not saved yet'
                : `${unsaved} documents not saved yet`}
            </span>
            <ReviewUnsavedButton count={unsaved} />
          </div>
        ) : null}
      </div>
    </HomePanelTray>
  );
}

/**
 * The branch that saves go to. It renders nothing unless the content provider
 * offers branches, so Home in local files has no Branch panel.
 */
export function BranchPanel() {
  const mode = useContentMode();
  const branch = useBranchView();
  if (mode !== 'branches' || !branch) return null;
  return <BranchPanelBody branch={branch} />;
}
