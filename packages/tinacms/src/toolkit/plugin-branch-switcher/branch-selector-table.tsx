'use client';

import { BaseTextField, Select } from '@toolkit/fields';
import { useCMS } from '@toolkit/react-core';
import { Button } from '@toolkit/styles';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import {
  BiError,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
  BiPencil,
  BiSearch,
} from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import { GrCircleQuestion } from 'react-icons/gr';
import { MdOutlineClear } from 'react-icons/md';
import { Branch } from './types';
import { TooltipProvider } from '@toolkit/fields/plugins/mdx-field-plugin/plate/components/plate-ui/tooltip';
import { extractPullRequestId, getFilteredBranchList } from './branch-switcher';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@toolkit/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@utils/cn';
import { Badge } from '@toolkit/react-sidebar/components/badge';
import { captureEvent } from '../../lib/posthog/posthogProvider';
import {
  BranchSwitcherDropDownEvent,
  BranchSwitcherPRClickedEvent,
  BranchSwitcherSearchEvent,
} from '../../lib/posthog/posthog';

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
          <span>{`Unknown`}</span>
        </>
      ),
    },
    inprogress: {
      classes: 'text-blue-500 border-blue-500',
      content: () => (
        <>
          <FaSpinner className='w-3 h-auto animate-spin' />
          <span>{`Indexing`}</span>
        </>
      ),
    },
    failed: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className='w-3 h-auto' />
          <span>{`Indexing failed`}</span>
        </>
      ),
    },
    timeout: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className='w-3 h-auto' />
          <span>{`Indexing timed out`}</span>
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

interface BranchSelectorTableProps {
  branchList: Branch[];
  currentBranch: string;
  onChange: (branchName: string) => void;
  refreshBranchList: () => void;
  createBranch: () => void;
}

export default function BranchSelectorTable({
  branchList,
  currentBranch,
  onChange,
  refreshBranchList,
  createBranch,
}: BranchSelectorTableProps) {
  const [filter, setFilter] = React.useState<'content' | 'all'>('content');
  const [search, setSearch] = React.useState('');
  const searchEventFired = React.useRef(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(
    null
  );

  const cms = useCMS();

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <button
            className='text-gray-700 !cursor-pointer font-bold flex items-center gap-1'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Branch Name
            {sorted === 'asc' ? (
              <ArrowUp className='ml-2 h-4 w-4' />
            ) : sorted === 'desc' ? (
              <ArrowDown className='ml-2 h-4 w-4' />
            ) : (
              <ArrowUpDown className='ml-2 h-4 w-4' />
            )}
          </button>
        );
      },
      cell: ({ row }) => {
        const indexingStatus = row.original.indexStatus?.status as Status;
        return (
          <div
            className={cn(
              'flex flex-col gap-2',
              currentBranch === row.original.name
                ? 'border-l border-tina-orange bg-[#f8fafc]'
                : ''
            )}
          >
            <div className='flex items-center gap-2'>
              {row.original.protected ? (
                <BiLockAlt className='w-4 h-auto opacity-70 text-blue-500 flex-shrink-0' />
              ) : (
                <BiGitBranch className='w-4 h-auto opacity-70 text-gray-600 flex-shrink-0' />
              )}
              {row.original.name}
            </div>
            {currentBranch === row.original.name && (
              <div className='w-fit mt-1'>
                <Badge
                  displayIcon={false}
                  calloutStyle='info'
                  className='w-fit flex-shrink-0'
                >
                  <BiPencil className='w-3 h-auto inline-block mr-1' />
                  Currently editing
                </Badge>
              </div>
            )}
            {indexingStatus && indexingStatus !== 'complete' && (
              <div className='w-fit mt-1'>
                <IndexStatus indexingStatus={indexingStatus} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'lastUpdated',
      accessorFn: (row) => row.indexStatus?.timestamp,
      cell: ({ row }) => {
        return (
          <div>
            {formatDistanceToNow(new Date(row.original.indexStatus?.timestamp))}
          </div>
        );
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <button
            className='text-gray-700 !cursor-pointer font-bold flex items-center gap-1'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Updated
            {sorted === 'asc' ? (
              <ArrowUp className='ml-2 h-4 w-4' />
            ) : sorted === 'desc' ? (
              <ArrowDown className='ml-2 h-4 w-4' />
            ) : (
              <ArrowUpDown className='ml-2 h-4 w-4' />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: 'pullRequest',
      cell: ({ row }) => {
        return (
          <PullRequestCell
            branch={row.original}
            cms={cms}
            refreshBranchList={refreshBranchList}
          />
        );
      },
      header: ({ column }) => {
        return <div className='text-gray-700 font-bold'>Pull Request</div>;
      },
    },
  ];

  const filteredBranchList = React.useMemo(() => {
    return getFilteredBranchList(branchList, search, currentBranch, filter);
  }, [branchList, search, currentBranch, filter]);

  // Separate current branch from the rest so it's always first and not affected by sorting
  const currentBranchData = React.useMemo(() => {
    return filteredBranchList.find((b) => b.name === currentBranch);
  }, [filteredBranchList, currentBranch]);

  const otherBranches = React.useMemo(() => {
    return filteredBranchList.filter((b) => b.name !== currentBranch);
  }, [filteredBranchList, currentBranch]);

  const table = useReactTable({
    data: otherBranches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const previewFunction = cms.api.tina.schema?.config?.config?.ui?.previewUrl;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-stretch space-x-4'>
        <div>
          <label
            htmlFor='search'
            className='text-xs mb-1 flex flex-col font-bold'
          >
            Search
          </label>
          <div className='block relative group h-fit mb-auto'>
            <BaseTextField
              placeholder='Branch name or PR #'
              value={search}
              onChange={(e) => {
                if (e.target.value && !searchEventFired.current) {
                  searchEventFired.current = true;
                  captureEvent(BranchSwitcherSearchEvent, {});
                }
                setSearch(e.target.value);
              }}
            />
            {search === '' ? (
              <BiSearch className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150' />
            ) : (
              <button
                onClick={() => {
                  setSearch('');
                }}
                className='outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150'
              >
                <MdOutlineClear className='w-5 h-auto text-gray-600' />
              </button>
            )}
          </div>
        </div>
        <div className='flex flex-col'>
          <label
            htmlFor='branch-type'
            className='text-xs mb-1 flex flex-col font-bold'
          >
            Branch Type
          </label>
          <Select
            name='branch-type'
            input={{
              id: 'branch-type',
              name: 'branch-type',
              value: filter,
              onChange: (e: any) => {
                setFilter(e.target.value);
                captureEvent(BranchSwitcherDropDownEvent, {
                  option: e.target.value,
                });
              },
            }}
            options={[
              {
                label: 'Content',
                value: 'content',
              },
              {
                label: 'All',
                value: 'all',
              },
            ]}
          />
        </div>
        {/* TODO: Add this back when we implement on backend */}
        {/* <div className="flex-1" />
          <div>
            <Button variant="primary" onClick={createBranch}>
              Create Branch <BiPlus className="w-5 h-full ml-1 opacity-70" />
            </Button>
          </div> */}
      </div>
      {filteredBranchList.length === 0 && (
        <div className='block relative text-gray-300 italic py-1'>
          No branches to display
        </div>
      )}
      {filteredBranchList.length > 0 && (
        <TooltipProvider>
          <Table wrapperClassName='border border-gray-200 rounded-md max-h-96'>
            <TableHeader className='bg-gray-100 text-gray-700'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className='sticky top-0 bg-gray-100 shadow-[inset_0_-2px_0_0_#e5e7eb] z-10'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className='bg-white'>
              {/* Current branch is always the first row */}
              {currentBranchData && (
                <TableRow
                  className={cn(
                    'bg-transparent hover:!bg-transparent',
                    currentBranch === currentBranchData.name
                      ? 'border-l-[3px] border-l-tina-orange bg-[#f8fafc]'
                      : ''
                  )}
                >
                  <TableCell>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        {currentBranchData.protected ? (
                          <BiLockAlt className='w-4 h-auto opacity-70 text-blue-500 flex-shrink-0' />
                        ) : (
                          <BiGitBranch className='w-4 h-auto opacity-70 text-gray-600 flex-shrink-0' />
                        )}
                        <p className='font-bold'>{currentBranchData.name}</p>
                      </div>
                      <div className='w-fit mt-1'>
                        <Badge
                          displayIcon={false}
                          calloutStyle='info'
                          className='w-fit flex-shrink-0'
                        >
                          <BiPencil className='w-3 h-auto inline-block mr-1' />
                          Currently editing
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {currentBranchData.indexStatus?.timestamp && (
                      <div>
                        {formatDistanceToNow(
                          new Date(currentBranchData.indexStatus.timestamp)
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <PullRequestCell
                      branch={currentBranchData}
                      cms={cms}
                      refreshBranchList={refreshBranchList}
                    />
                  </TableCell>
                </TableRow>
              )}
              {/* Other branches, sorted by react-table */}
              {table.getRowModel().rows.map((row) => {
                const indexingStatus = row.original.indexStatus
                  ?.status as Status;
                const isComplete = indexingStatus === 'complete';
                const isSelected = selectedBranch === row.original.name;

                const handleRowClick = () => {
                  if (isComplete) {
                    // Toggle selection: if already selected, deselect; otherwise select
                    setSelectedBranch(isSelected ? null : row.original.name);
                  }
                };

                return (
                  <TableRow
                    className={cn(
                      !isComplete &&
                        'bg-gray-50 text-gray-400 hover:!bg-gray-50 cursor-default',
                      isComplete &&
                        isSelected &&
                        'bg-blue-100 hover:bg-blue-100 !cursor-pointer',
                      isComplete && !isSelected && '!cursor-pointer'
                    )}
                    key={row.id}
                    onClick={handleRowClick}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      )}
      <div className='flex justify-end'>
        <Button
          variant='primary'
          onClick={() => {
            onChange(selectedBranch);
          }}
          disabled={!selectedBranch || selectedBranch === currentBranch}
        >
          Open branch in editor
        </Button>
      </div>
    </div>
  );
}

// Separate component to handle per-row creatingPR state
const PullRequestCell = ({
  branch,
  cms,
  refreshBranchList,
}: {
  branch: Branch;
  cms: any;
  refreshBranchList: () => void;
}) => {
  const [creatingPR, setCreatingPR] = React.useState(false);

  const handleCreatePullRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    captureEvent(BranchSwitcherPRClickedEvent, { type: 'Create PR' });
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
    } catch (error: any) {
      console.error('Failed to create pull request:', error);
      cms.alerts.error(error.message);
    } finally {
      setCreatingPR(false);
    }
  };

  if (creatingPR) {
    return (
      <div
        className='flex items-center gap-2'
        onClick={(e) => e.stopPropagation()}
      >
        <FaSpinner className='w-3 h-auto animate-spin text-blue-500' />
        <span className='text-sm text-blue-500'>Creating PR...</span>
      </div>
    );
  }

  if (branch.githubPullRequestUrl) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Button
          variant='white'
          size='custom'
          onClick={() => {
            captureEvent(BranchSwitcherPRClickedEvent, {
              type: 'Open Git Pull Request',
            });
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
      </div>
    );
  }

  // Show "Create PR" button only for non-protected branches when on a protected branch
  if (!branch.protected && cms.api?.tina?.usingProtectedBranch?.()) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
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
      </div>
    );
  }

  return null;
};
