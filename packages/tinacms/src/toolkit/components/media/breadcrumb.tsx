import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbItemLink,
  BreadcrumbList,
  Breadcrumb as BreadcrumbNav,
  BreadcrumbSeparator,
  FinalBreadcrumbItem,
} from '@toolkit/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/components/ui/dropdown-menu';
import { Folder } from 'lucide-react';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../admin/components/ui/tooltip';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  directory?: string;
  setDirectory: (_directory: string) => void;
}

const ROOT_LABEL = 'Media';

// Split a directory into the crumbs leading to it, root first. Each crumb
// carries the directory it navigates to, so callers never re-derive the path.
function toCrumbs(directory: string) {
  // Normalize: ensure non-root directories always have a leading slash so that
  // split('/') produces '' as the first element, which renders as the root.
  const normalized =
    directory && !directory.startsWith('/') ? `/${directory}` : directory;

  return normalized.split('/').map((part, index, parts) => ({
    label: part === '' ? ROOT_LABEL : part,
    directory: parts.slice(0, index + 1).join('/'),
  }));
}

export function Breadcrumb({
  directory = '',
  setDirectory,
  ...props
}: BreadcrumbProps) {
  const crumbs = toCrumbs(directory);

  const firstCrumb = crumbs[0];
  const secondLastCrumb = crumbs.length > 2 ? crumbs[crumbs.length - 2] : null;
  const lastCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 1] : null;
  const dropdownCrumbs = crumbs.length > 3 ? crumbs.slice(1, -2) : [];

  return (
    <div className='flex min-w-0 items-center gap-1.5' {...props}>
      {/* Anchors the path. shrink-0 keeps it visible when the crumbs truncate. */}
      <Folder
        aria-hidden='true'
        className='size-4 shrink-0 fill-current text-tina-orange'
      />

      <BreadcrumbNav className='min-w-0'>
        <BreadcrumbList className='flex-nowrap text-nowrap overflow-hidden'>
          {/* First crumb: the media root */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='flex min-w-0 shrink'>
                  {lastCrumb ? (
                    <BreadcrumbItemLink
                      breadcrumb={firstCrumb.label}
                      onClick={() => setDirectory(firstCrumb.directory)}
                    />
                  ) : (
                    <FinalBreadcrumbItem breadcrumb={firstCrumb.label} />
                  )}
                </span>
              </TooltipTrigger>
              {directory && (
                <TooltipContent
                  side='bottom'
                  align='start'
                  className='shadow-md max-w-xs break-all'
                >
                  {directory}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Dropdown for middle crumbs */}
          {dropdownCrumbs.length > 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className='flex items-center gap-1'>
                    <BreadcrumbEllipsis className='size-4' />
                    <span className='sr-only'>Toggle menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    {dropdownCrumbs.map((crumb) => (
                      <DropdownMenuItem
                        key={crumb.directory}
                        onClick={(e) => {
                          e.preventDefault();
                          setDirectory(crumb.directory);
                        }}
                      >
                        {crumb.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}

          {/* Second last crumb */}
          {secondLastCrumb && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItemLink
                breadcrumb={secondLastCrumb.label}
                onClick={() => setDirectory(secondLastCrumb.directory)}
              />
            </>
          )}

          {/* Last crumb: the directory currently open */}
          {lastCrumb && (
            <>
              <BreadcrumbSeparator />
              <FinalBreadcrumbItem breadcrumb={lastCrumb.label} />
            </>
          )}
        </BreadcrumbList>
      </BreadcrumbNav>
    </div>
  );
}
