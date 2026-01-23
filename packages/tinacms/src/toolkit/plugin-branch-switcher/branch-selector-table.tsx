'use client';

import { BaseTextField, Select } from '@toolkit/fields';
import { useCMS } from '@toolkit/react-core';
import { Button } from '@toolkit/styles';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import { BiGitBranch, BiLinkExternal, BiLockAlt, BiSearch } from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import { MdOutlineClear } from 'react-icons/md';
import { Branch } from './types';
import { TooltipProvider } from '@toolkit/fields/plugins/mdx-field-plugin/plate/components/plate-ui/tooltip';
import { extractPullRequestId, getFilteredBranchList, sortBranchListFn } from './branch-switcher';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { cn } from '../../lib/utils';

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
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [sortValue, setSortValue] = React.useState<
    'default' | 'updated' | 'name'
  >('default');
  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(
    null
  );

  const cms = useCMS();

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            className='!px-0 hover:border-transparent hover:shadow-none focus:ring-0 text-gray-700'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Branch Name
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className='flex items-center gap-2'>
            {row.original.protected ? (
              <BiLockAlt className='w-4 h-auto opacity-70 text-blue-500 flex-shrink-0' />
            ) : (
              <BiGitBranch className='w-4 h-auto opacity-70 text-gray-600 flex-shrink-0' />
            )}{row.original.name}</div>;
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
          <Button
            variant='ghost'
            className='!px-0 hover:border-transparent hover:shadow-none focus:ring-0 text-gray-700'
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
          </Button>
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
      header: 'Pull Request',
    },
  ];

  const table = useReactTable({
    data: branchList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const filteredBranchList = getFilteredBranchList(
    branchList,
    search,
    currentBranch,
    filter
  ).sort(sortBranchListFn(sortValue));

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
              onChange={(e) => setSearch(e.target.value)}
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
              onChange: (e: any) => setFilter(e.target.value),
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
          <Table className='border rounded-md overflow-x-hidden overflow-y-auto'>
            <TableHeader className='bg-gray-100 !text-gray-700 border-b-2 border-gray-200 rounded-t-md'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn(
                    selectedBranch === row.original.name
                      ? 'bg-blue-100 hover:bg-blue-100'
                      : '',
                    'cursor-pointer'
                  )}
                  key={row.id}
                  onClick={() => setSelectedBranch(row.original.name)}
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
              ))}
            </TableBody>
          </Table>
          {/* <div className='rounded-lg border border-gray-200 overflow-hidden'>
            <div className='min-w-[192px] max-h-[24rem] overflow-y-auto w-full h-full shadow-inner bg-white'>
              <table className='w-full table-auto max-h-[24rem]'>
                <thead className='sticky top-0 z-20 bg-gray-100 border-b-2 border-gray-200'>
                  <tr>
                    <th className={`${tableHeadingStyle} w-auto`}>
                      Branch Name
                    </th>
                    <th
                      className={`${tableHeadingStyle} w-0 whitespace-nowrap text-left`}
                    >
                      Last Updated
                    </th>
                    <th
                      className={`${tableHeadingStyle} w-0 whitespace-nowrap text-left`}
                    >
                      Pull Request
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranchList.map((branch) => (
                    <BranchItem
                      key={branch.name}
                      branch={branch}
                      currentBranch={currentBranch}
                      onChange={onChange}
                      refreshBranchList={refreshBranchList}
                      previewFunction={previewFunction}
                      cms={cms}
                      selectedBranch={selectedBranch}
                      onSelectBranch={setSelectedBranch}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div> */}
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
      <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
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
