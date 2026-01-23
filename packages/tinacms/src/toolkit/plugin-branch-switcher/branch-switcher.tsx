import { BaseTextField, FieldLabel, Select } from '@toolkit/fields';
import { LoadingDots, PrefixedTextField } from '@toolkit/form-builder';
import { useCMS } from '@toolkit/react-core';
import { Button } from '@toolkit/styles';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import {
  BiError,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
  BiPencil,
  BiRefresh,
  BiSearch,
} from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import { GrCircleQuestion } from 'react-icons/gr';
import { MdArrowForward, MdOutlineClear } from 'react-icons/md';
import { useBranchData } from './branch-data';
import { BranchSwitcherLegacy } from './branch-switcher-legacy';
import { Branch, BranchSwitcherProps } from './types';
import { Badge } from '@toolkit/react-sidebar/components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@toolkit/fields/plugins/mdx-field-plugin/plate/components/plate-ui/tooltip';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import BranchSelectorTable from './branch-selector-table';

type ListState = 'loading' | 'ready' | 'error';

export const tableHeadingStyle =
  'px-3 py-3 text-left text-xs font-bold text-gray-700 tracking-wider sticky top-0 bg-gray-100 z-20 border-b-2 border-gray-200 ';

export function formatBranchName(str: string): string {
  const pattern = /[^/\w-]+/g; // regular expression pattern to match invalid special characters
  const formattedStr = str.replace(pattern, '-'); // remove special characters
  return formattedStr.toLowerCase();
}

export const BranchSwitcher = (props: BranchSwitcherProps) => {
  const cms = useCMS();
  // MOCK: Force editorial workflow for testing - REMOVE AFTER TESTING
  const usingEditorialWorkflow = true; // was: cms.api.tina.usingEditorialWorkflow;
  if (usingEditorialWorkflow) {
    return <EditoralBranchSwitcher {...props} />;
  } else {
    return <BranchSwitcherLegacy {...props} />;
  }
};

export const EditoralBranchSwitcher = ({
  listBranches,
  createBranch,
  chooseBranch,
  setModalTitle,
}: BranchSwitcherProps) => {
  const cms = useCMS();
  // MOCK: Override local mode check for testing - REMOVE AFTER TESTING
  const isLocalMode = false; // was: cms.api?.tina?.isLocalMode;

  // MOCK DATA - REMOVE AFTER TESTING
  const mockBranches: Branch[] = [
    {
      name: 'main',
      protected: true,
      indexStatus: { status: 'complete', timestamp: Date.now() - 86400000 },
    },
    {
      name: 'tina/homepage-update',
      protected: false,
      indexStatus: { status: 'complete', timestamp: Date.now() - 3600000 },
      githubPullRequestUrl: 'https://github.com/org/repo/pull/42',
    },
    {
      name: 'tina/new-blog-post',
      protected: false,
      indexStatus: { status: 'complete', timestamp: Date.now() - 7200000 },
    },
    {
      name: 'tina/footer-changes',
      protected: false,
      indexStatus: { status: 'inprogress', timestamp: Date.now() - 1800000 },
    },
    {
      name: 'tina/broken-index',
      protected: false,
      indexStatus: { status: 'failed', timestamp: Date.now() - 172800000 },
    },
    {
      name: 'develop',
      protected: true,
      indexStatus: { status: 'complete', timestamp: Date.now() - 43200000 },
      githubPullRequestUrl: 'https://github.com/org/repo/pull/99',
    },
    {
      name: 'tina/unknown-status',
      protected: false,
      indexStatus: { status: 'unknown', timestamp: Date.now() },
    },
  ];
  const mockListBranches = () => Promise.resolve(mockBranches);
  const [viewState, setViewState] = React.useState<'list' | 'create'>('list');
  const [listState, setListState] = React.useState<ListState>('loading');
  const [branchList, setBranchList] = React.useState([] as Branch[]);
  const { currentBranch } = useBranchData();
  const initialBranch = React.useMemo(() => currentBranch, []);
  // when modal closes, refresh page is currentBranch has changed
  React.useEffect(() => {
    if (initialBranch != currentBranch) {
      window.location.reload();
    }
  }, [currentBranch]);

  React.useEffect(() => {
    if (!setModalTitle) return;
    if (viewState === 'create') {
      setModalTitle('Create Branch');
    } else {
      setModalTitle('Branch List');
    }
  }, [viewState, setModalTitle]);

  const handleCreateBranch = React.useCallback((value) => {
    setListState('loading');
    createBranch({
      branchName: formatBranchName(value),
      baseBranch: currentBranch,
    }).then(async (createdBranchName) => {
      cms.alerts.success('Branch created.');
      setBranchList((oldBranchList) => {
        return [
          ...oldBranchList,
          {
            indexStatus: { status: 'unknown' },
            name: createdBranchName,
          },
        ];
      });
      setListState('ready');
    });
  }, []);

  const refreshBranchList = React.useCallback(async () => {
    setListState('loading');
    // MOCK: Using mockListBranches instead - REMOVE AFTER TESTING
    await mockListBranches() // was: listBranches()
      .then((data: Branch[]) => {
        setBranchList(data);
        setListState('ready');
      })
      .catch(() => setListState('error'));
  }, []);

  // load branch list
  React.useEffect(() => {
    refreshBranchList();
  }, []);

  // Keep branch list up to date
  React.useEffect(() => {
    // MOCK: Skip polling for index status - REMOVE AFTER TESTING
    return;

    if (listState === 'ready') {
      const cancelFuncs = [];
      // update all branches that have indexing status of 'inprogress' or 'unknown'
      branchList
        .filter(
          (x) =>
            x?.indexStatus?.status === 'inprogress' ||
            x?.indexStatus?.status === 'unknown'
        )
        .forEach(async (x) => {
          const [
            // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
            waitForIndexStatusPromise,
            // Calling this function will cancel the polling
            cancelWaitForIndexFunc,
          ] = cms.api.tina.waitForIndexStatus({
            ref: x.name,
          });
          cancelFuncs.push(cancelWaitForIndexFunc);
          waitForIndexStatusPromise
            // @ts-ignore
            .then((indexStatus) => {
              setBranchList((previousBranchList) => {
                // update the index status of the branch
                const newBranchList = Array.from(previousBranchList);
                const index = newBranchList.findIndex((y) => y.name === x.name);
                newBranchList[index].indexStatus = indexStatus;
                return newBranchList;
              });
            })
            .catch((e) => {
              if (e.message === 'AsyncPoller: cancelled') return;
              console.error(e);
            });
        });
      return () => {
        cancelFuncs.forEach((x) => {
          x();
        });
      };
    }
  }, [listState, branchList.length]);

  return (
    <div className='w-full flex justify-center p-5'>
      <div className='w-full max-w-form'>
        {isLocalMode ? (
          <div className='px-6 py-8 w-full h-full flex flex-col items-center justify-center'>
            <p className='text-base mb-4 text-center'>
              <AiFillWarning className='w-7 h-auto inline-block mr-0.5 opacity-70 text-yellow-600' />
            </p>
            <p className='text-base mb-6 text-center'>
              Tina's branch switcher isn't available in local mode.{' '}
              <a
                target='_blank'
                className='transition-all duration-150 ease-out text-blue-600 hover:text-blue-400 hover:underline no-underline'
                href='https://tina.io/docs/r/what-is-tinacloud/'
              >
                Learn more about moving to production with TinaCloud.
              </a>
            </p>
            <p>
              <Button
                href='https://tina.io/docs/r/what-is-tinacloud/'
                target='_blank'
                as='a'
              >
                Read Our Docs{' '}
                <MdArrowForward className='w-5 h-auto ml-1.5 opacity-80' />
              </Button>
            </p>
          </div>
        ) : viewState === 'create' ? (
          <BranchCreator
            currentBranch={currentBranch}
            setViewState={setViewState}
            handleCreateBranch={handleCreateBranch}
          />
        ) : listState === 'loading' ? (
          <div style={{ margin: '32px auto', textAlign: 'center' }}>
            <LoadingDots color={'var(--tina-color-primary)'} />
          </div>
        ) : (
          <>
            {listState === 'ready' ? (
              <BranchSelectorTable
                currentBranch={currentBranch}
                branchList={branchList}
                refreshBranchList={refreshBranchList}
                createBranch={() => {
                  setViewState('create');
                }}
                onChange={(branchName) => {
                  chooseBranch(branchName);
                }}
              />
            ) : (
              <div className='px-6 py-8 w-full h-full flex flex-col items-center justify-center'>
                <p className='text-base mb-4 text-center'>
                  An error occurred while retrieving the branch list.
                </p>
                <Button className='mb-4' onClick={refreshBranchList}>
                  Try again <BiRefresh className='w-6 h-full ml-1 opacity-70' />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const getFilteredBranchList = (
  branchList: Branch[],
  search: string,
  currentBranchName: string,
  filter: 'content' | 'all' = 'all'
) => {
  const filteredBranchList = branchList
    .filter((branch) => {
      if (!search) return true;
      if (branch.name === currentBranchName) return true;

      const searchLower = search.toLowerCase();
      const nameMatch = branch.name.toLowerCase().includes(searchLower);

      // Also check if search matches PR reference
      let prMatch = false;
      if (branch.githubPullRequestUrl) {
        const prId = extractPullRequestId(branch.githubPullRequestUrl);
        prMatch = prId.toLowerCase().includes(searchLower);
      }

      return nameMatch || prMatch;
    })
    .filter((branch) => {
      // always show protected branches (e.g. main)
      if (branch.protected) return true;
      if (filter === 'all') return true;
      if (filter === 'content') {
        return branch.name.startsWith('tina/');
      }
    });
  const currentBranchItem = branchList.find(
    (branch) => branch.name === currentBranchName
  );

  // return list with current branch at top
  return [
    currentBranchItem ||
      ({
        name: currentBranchName,
        indexStatus: { status: 'failed' },
      } as Branch),
    ...filteredBranchList.filter((branch) => branch.name !== currentBranchName),
  ];
};

export const sortBranchListFn = (sortValue: 'default' | 'updated' | 'name') => {
  return (a: Branch, b: Branch) => {
    if (sortValue === 'default') {
      // Default sorting logic
      // Implement your own logic here if needed
      return 0;
    } else if (sortValue === 'updated') {
      // Sort by last updated logic
      return b.indexStatus.timestamp - a.indexStatus.timestamp;
    } else if (sortValue === 'name') {
      // Sort by branch name logic
      return a.name.localeCompare(b.name);
    }
  };
};

const BranchCreator = ({ setViewState, handleCreateBranch, currentBranch }) => {
  const [branchName, setBranchName] = React.useState('');

  return (
    <form>
      <div className=''>
        <p className='text-base text-gray-700 mb-4'>
          Create a new branch from <strong>{currentBranch}</strong>.
        </p>
        <div className='mb-3'>
          <FieldLabel name='current-branch-name'>
            Current Branch Name
          </FieldLabel>
          <BaseTextField
            name='current-branch-name'
            value={currentBranch}
            disabled
          />
        </div>
        <div className='mb-6'>
          <FieldLabel name='branch-name'>New Branch Name</FieldLabel>
          <PrefixedTextField
            placeholder=''
            name='branch-name'
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
        </div>
      </div>
      <div className='w-full flex justify-between gap-4 items-center'>
        <Button
          style={{ flexGrow: 1 }}
          onClick={() => {
            setViewState('list');
          }}
        >
          Cancel
        </Button>
        <Button
          variant='primary'
          type='submit'
          style={{ flexGrow: 2 }}
          disabled={branchName === ''}
          onClick={() => {
            handleCreateBranch('tina/' + branchName);
          }}
        >
          Create Branch <BiGitBranch className='w-5 h-full ml-1 opacity-70' />
        </Button>
      </div>
    </form>
  );
};

export const extractPullRequestId = (url: string): string => {
  return url.split('/').pop() || '';
};

export const BranchItem = ({
  branch,
  currentBranch,
  onChange,
  refreshBranchList,
  previewFunction,
  cms,
  selectedBranch,
  onSelectBranch,
}: {
  branch: Branch;
  currentBranch: string;
  onChange: (branchName: string) => void;
  refreshBranchList: () => void;
  previewFunction?: any;
  cms: any;
  selectedBranch: string | null;
  onSelectBranch: (branchName: string | null) => void;
}) => {
  const [creatingPR, setCreatingPR] = React.useState(false);

  const handleCreatePullRequest = async () => {
    if (creatingPR) return;

    setCreatingPR(true);
    try {
      const res = await cms.api.tina.createPullRequest({
        baseBranch: cms.api.tina.branch,
        branch: branch.name,
        title: `${branch.name.replace('tina/', '').replace('-', ' ')} (PR from TinaCMS)`,
      });

      refreshBranchList();

      cms.alerts.success(
        `Pull request created successfully! ${res.url ? `View in GitHub: ${res.url}` : ''}`
      );
    } catch (error) {
      console.error('Failed to create pull request:', error);
      cms.alerts.error(error.message);
    } finally {
      setCreatingPR(false);
    }
  };

  const isCurrentBranch = branch.name === currentBranch;
  const isSelected = selectedBranch === branch.name;
  // @ts-ignore
  const indexingStatus = branch?.indexStatus?.status;

  const handleRowClick = () => {
    if (indexingStatus === 'complete' && !isCurrentBranch) {
      onSelectBranch(isSelected ? null : branch.name);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`text-base border-l-0 transition-colors border-t-0 border-r-0 outline-none transition-all ease-out duration-150 ${
        indexingStatus !== 'complete'
          ? 'bg-gray-50 text-gray-400'
          : isCurrentBranch
            ? 'border-b-2 border-gray-50'
            : isSelected
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-50 cursor-pointer'
              : 'border-b-2 border-gray-50 hover:bg-gray-50/50 cursor-pointer'
      }`}
    >
      <td
        className={`pl-3 pr-3 max-w-xs ${isCurrentBranch ? 'py-2.5' : 'py-1.5'}`}
      >
        <div className='flex flex-col'>
          <div className='flex items-center gap-1 min-w-0'>
            {branch.protected ? (
              <BiLockAlt className='w-4 h-auto opacity-70 text-blue-500 flex-shrink-0' />
            ) : (
              <BiGitBranch className='w-4 h-auto opacity-70 text-gray-600 flex-shrink-0' />
            )}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className='text-sm leading-tight truncate block min-w-0 cursor-default'>
                  {branch.name}
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side='top'>{branch.name}</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </div>
          {isCurrentBranch && (
            <div className='w-fit mt-1'>
              <Badge
                calloutStyle='info'
                className='w-fit flex-shrink-0'
                displayIcon={false}
              >
                <BiPencil className='w-3 h-auto inline-block mr-1' />
                Currently editing
              </Badge>
            </div>
          )}
          {indexingStatus !== 'complete' && (
            <div className='w-fit mt-1'>
              <IndexStatus indexingStatus={branch.indexStatus.status} />
            </div>
          )}
        </div>
      </td>
      <td className='px-3 py-1.5 min-w-0'>
        {creatingPR ? (
          <div className='flex items-center gap-2'>
            <div>
              <div className='text-xs font-bold text-blue-600'>Creating PR</div>
              <span className='text-sm leading-tight text-blue-500'>
                Please wait...
              </span>
            </div>
            <FaSpinner className='w-3 h-auto animate-spin text-blue-500' />
          </div>
        ) : (
          <span className='text-sm leading-tight whitespace-nowrap'>
            {formatDistanceToNow(new Date(branch.indexStatus.timestamp), {
              addSuffix: true,
            })}
          </span>
        )}
      </td>
      <td className='px-3 py-1.5 flex' onClick={(e) => e.stopPropagation()}>
        {branch.githubPullRequestUrl ? (
          <Button
            variant='white'
            size='custom'
            onClick={() => {
              window.open(branch.githubPullRequestUrl, '_blank');
            }}
            className='cursor-pointer h-9 px-2 flex items-center gap-1'
            title='Open Git Pull Request'
          >
            <BiLinkExternal className='h-3.5 w-auto text-gray-700 flex-shrink-0' />
            <span className='text-sm truncate max-w-[120px]'>
              PR: {extractPullRequestId(branch.githubPullRequestUrl)}
            </span>
          </Button>
        ) : !branch.protected &&
          !creatingPR &&
          cms.api.tina.usingProtectedBranch() ? (
          <Button
            variant='white'
            size='custom'
            onClick={handleCreatePullRequest}
            className='cursor-pointer h-9 px-2 flex items-center gap-1'
            title='Create Pull Request'
          >
            <BiGitBranch className='h-3.5 w-auto text-gray-700 flex-shrink-0' />
            <span className='text-sm whitespace-nowrap'>Create PR</span>
          </Button>
        ) : null}
      </td>
    </tr>
  );
};

type Status = 'failed' | 'unknown' | 'complete' | 'inprogress' | 'timeout';

const IndexStatus = ({ indexingStatus }: { indexingStatus: Status }) => {
  const styles: {
    [key in Status]: {
      classes: string;
      content: () => JSX.Element;
    };
  } = {
    complete: {
      classes: '',
      content: () => <></>,
    },
    unknown: {
      classes: 'text-blue-500 border-blue-500',
      content: () => (
        <>
          <GrCircleQuestion className='w-3 h-auto' />
          <span className=''>{`Unknown`}</span>
        </>
      ),
    },
    inprogress: {
      classes: 'text-blue-500 border-blue-500',
      content: () => (
        <>
          <FaSpinner className='w-3 h-auto animate-spin' />
          <span className=''>{`Indexing`}</span>
        </>
      ),
    },
    failed: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className='w-3 h-auto' />
          <span className=''>{`Indexing failed`}</span>
        </>
      ),
    },
    timeout: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className='w-3 h-auto' />
          <span className=''>{`Indexing timed out`}</span>
        </>
      ),
    },
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border space-x-1 ${styles[indexingStatus].classes}`}
    >
      {styles[indexingStatus].content()}
    </span>
  );
};
