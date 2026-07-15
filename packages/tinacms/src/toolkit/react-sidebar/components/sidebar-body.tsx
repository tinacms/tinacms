import { Transition } from '@headlessui/react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbItemLink,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  FinalBreadcrumbItem,
} from '@toolkit/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/components/ui/dropdown-menu';
import { FormBuilder, FormStatus } from '@toolkit/form-builder';
import type { Form } from '@toolkit/forms';
import type { FormMetaPlugin } from '@toolkit/plugin-form-meta';
import { useCMS } from '@toolkit/react-core';
import { History } from 'lucide-react';
import * as React from 'react';
import { BiArrowBack } from 'react-icons/bi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../admin/components/ui/tooltip';
import { collectionListPathForDocument } from './form-breadcrumbs.utils';
import { FormLists } from './form-list';
import { SidebarContext } from './sidebar';
import { SidebarLoadingPlaceholder } from './sidebar-loading-placeholder';
import { SidebarNoFormsPlaceholder } from './sidebar-no-forms-placeholder';

// this is the minimum time to show the loading indicator (in milliseconds)
// this is to prevent the loading indicator from flashing or the 'no forms' placeholder from showing pre-maturely
const minimumTimeToShowLoadingIndicator = 1000;

export interface FormsViewProps {
  loadingPlaceholder?: React.FC;
}

export const FormsView = ({ loadingPlaceholder }: FormsViewProps = {}) => {
  const cms = useCMS();
  const { setFormIsPristine } = React.useContext(SidebarContext);
  const [isShowingLoading, setIsShowingLoading] = React.useState(true); // Default to showing loading
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
  const [lastActiveFormId, setLastActiveFormId] = React.useState<string | null>(
    null
  );

  // Track the last active form ID for the back button
  React.useEffect(() => {
    if (cms.state.activeFormId) {
      setLastActiveFormId(cms.state.activeFormId);
    }
  }, [cms.state.activeFormId]);

  // Handle loading state with minimum display time
  React.useEffect(() => {
    // Always start with loading state
    if (cms.state.isLoadingContent) {
      setIsShowingLoading(true);

      // Even if loading completes quickly, show the placeholder for a minimum time
      const timer = setTimeout(() => {
        if (!cms.state.isLoadingContent) {
          setIsShowingLoading(false);
          setInitialLoadComplete(true);
        }
      }, minimumTimeToShowLoadingIndicator);

      return () => clearTimeout(timer);
    } else {
      // If not loading anymore, check if we need to maintain the placeholder
      const timer = setTimeout(() => {
        setIsShowingLoading(false);
        setInitialLoadComplete(true);
      }, minimumTimeToShowLoadingIndicator);

      return () => clearTimeout(timer);
    }
  }, [cms.state.isLoadingContent]);

  if (isShowingLoading || !initialLoadComplete) {
    // Loading - show when explicitly loading or during initial render
    const LoadingPlaceholder = loadingPlaceholder || SidebarLoadingPlaceholder;
    return <LoadingPlaceholder />;
  }

  if (!cms.state.formLists.length) {
    // No Forms
    return <SidebarNoFormsPlaceholder />;
  }
  const isReferencingManyForms = cms.state.forms.length > 1;
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
  );
  const isEditing = !!activeForm;
  const formMetas = cms.plugins.all<FormMetaPlugin>('form:meta');

  // Single form - no transitions needed. Fall back to the no-forms
  // placeholder when nothing is active (e.g. a listing page that only
  // registered a layout-level global form, so `formLists` is non-empty
  // but the auto-select heuristic skipped the only candidate). Without
  // this the sidebar renders empty and the page looks broken.
  if (!isReferencingManyForms) {
    if (!activeForm) {
      return <SidebarNoFormsPlaceholder />;
    }
    return (
      <div className='flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white'>
        <FormHeader
          activeForm={activeForm}
          branch={cms.api.admin.api.branch}
          repoProvider={cms.api.admin.api.schema.config.config.repoProvider}
          isLocalMode={cms.api?.tina?.isLocalMode}
        />
        {formMetas?.map((meta) => (
          <React.Fragment key={meta.name}>
            <meta.Component />
          </React.Fragment>
        ))}
        <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
      </div>
    );
  }

  // Referencing many forms - coordinate transitions between list and form view
  return (
    <>
      {/* Form List View - shows when not editing */}
      <Transition
        show={!isEditing}
        as='div'
        className='h-full flex flex-col'
        enter='transition-all ease-out duration-150'
        enterFrom='opacity-0 translate-y-1/2'
        enterTo='opacity-100 translate-y-0'
        leave='transition-all ease-out duration-150'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-1/2'
      >
        <FormLists lastActiveFormId={lastActiveFormId} />
      </Transition>

      {/* Form Edit View - shows when editing */}
      <Transition
        show={isEditing}
        as='div'
        className='flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white'
        enter='transition-opacity ease-out duration-150 delay-150'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity ease-out duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        {activeForm && (
          <>
            <FormHeader
              activeForm={activeForm}
              branch={cms.api.admin.api.branch}
              repoProvider={cms.api.admin.api.schema.config.config.repoProvider}
              isLocalMode={cms.api?.tina?.isLocalMode}
            />
            {formMetas?.map((meta) => (
              <React.Fragment key={meta.name}>
                <meta.Component />
              </React.Fragment>
            ))}
            <FormBuilder
              form={activeForm}
              onPristineChange={setFormIsPristine}
            />
          </>
        )}
      </Transition>
    </>
  );
};

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form };
  branch?: string;
  isLocalMode?: boolean;
  repoProvider?: {
    defaultBranchName?: string;
    historyUrl?: (context: {
      relativePath: string;
      branch: string;
    }) => { url: string };
  };
}

// Strip folders and extension from a content path → the bare filename label.
export const getFilename = (path?: string) =>
  path
    ?.split('/')
    .pop()
    ?.replace(/\.[^/.]+$/, '');

export const FormHeader = ({
  activeForm,
  repoProvider,
  branch,
  isLocalMode,
}: FormHeaderProps) => {
  const cms = useCMS();
  const { formIsPristine } = React.useContext(SidebarContext);

  const path = activeForm.tinaForm.path;

  // Leading "back to collection list" crumb, mirroring the admin editor pages.
  let collectionCrumb: { label: string; onClick: () => void } | undefined;
  try {
    const collection = cms.api.tina.schema?.getCollectionByFullPath?.(path);
    if (collection) {
      const tinaPreview = cms.flags.get('tina-preview') || false;
      const href = `${
        tinaPreview ? `/${tinaPreview}/index.html#` : '/admin#'
      }${collectionListPathForDocument(path, collection)}`;
      collectionCrumb = {
        label: collection.label || collection.name,
        onClick: () => {
          window.location.href = href;
        },
      };
    }
  } catch {
    // No collection resolves for this path → render without the back crumb.
  }

  return (
    <div className='px-4 pt-2 pb-4 flex flex-row flex-nowrap justify-between items-center gap-2 bg-gradient-to-t from-white to-gray-50 border-b border-gray-100'>
      <FormBreadcrumbs
        className='w-[calc(100%-3rem)]'
        rootBreadcrumbName={getFilename(path)}
        contentPath={path}
        collectionCrumb={collectionCrumb}
      />
      <FileHistoryProvider
        defaultBranchName={repoProvider?.defaultBranchName}
        historyUrl={repoProvider?.historyUrl}
        contentRelativePath={activeForm.tinaForm.path}
        tinaBranch={branch}
        isLocalMode={isLocalMode}
      />
      <FormStatus pristine={formIsPristine} />
    </div>
  );
};

interface RepositoryProviderProps {
  contentRelativePath: string;
  tinaBranch?: string;
  isLocalMode?: boolean;
  defaultBranchName?: string;
  historyUrl?: (context: {
    relativePath: string;
    branch: string;
  }) => { url: string };
}

export const FileHistoryProvider = ({
  contentRelativePath,
  tinaBranch,
  defaultBranchName,
  historyUrl,
  isLocalMode,
}: RepositoryProviderProps) => {
  if (!historyUrl) {
    return null;
  }

  const branch = isLocalMode ? defaultBranchName || tinaBranch : tinaBranch;

  if (!branch) {
    return null;
  }

  const { url } = historyUrl({
    relativePath: contentRelativePath,
    branch: branch,
  });

  if (!url) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type='button'>
            <a
              href={url}
              target='_blank'
              className='flex items-center gap-1 border-[0.5px] hover:bg-gray-300/10 transition-all duration-300 border-gray-300 rounded-md p-2'
            >
              <History className='size-4 text-gray-700' />
            </a>
          </button>
        </TooltipTrigger>
        <TooltipContent side='top' className='shadow-md'>
          View file history
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Leading crumb that navigates back to the collection's document list.
const CollectionBreadcrumbItem = ({
  label,
  onClick,
}: { label: string; onClick: () => void }) => {
  return (
    <BreadcrumbItem className='shrink min-w-0'>
      <BreadcrumbLink
        asChild
        className='min-w-0 text-gray-700 hover:text-orange-500'
      >
        <button
          type='button'
          onClick={onClick}
          aria-label={`Back to ${label}`}
          className='flex items-center gap-1.5 min-w-0'
        >
          <BiArrowBack className='w-4 h-4 shrink-0 opacity-80' />
          <span className='truncate min-w-0'>{label}</span>
        </button>
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
};

export const FormBreadcrumbs = ({
  rootBreadcrumbName,
  contentPath,
  collectionCrumb,
  ...props
}: {
  rootBreadcrumbName?: string;
  contentPath?: string;
  collectionCrumb?: { label: string; onClick: () => void };
} & React.HTMLAttributes<HTMLDivElement>) => {
  const cms = useCMS();
  const breadcrumbs = cms.state.breadcrumbs;

  if (breadcrumbs.length === 0 && !collectionCrumb) {
    return null;
  }

  const goBack = (formId: string, fieldName: string) => {
    cms.dispatch({
      type: 'forms:set-active-field-name',
      value: {
        formId,
        fieldName,
      },
    });
  };

  const firstBreadcrumb = breadcrumbs[0];
  const secondLastBreadcrumb =
    breadcrumbs.length > 2 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const lastBreadcrumb =
    breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const dropdownBreadcrumbs =
    breadcrumbs.length > 3 ? breadcrumbs.slice(1, -2) : [];

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList className='flex-nowrap text-nowrap overflow-hidden'>
        {/* Leading crumb: back to the collection's document list */}
        {collectionCrumb && (
          <>
            <CollectionBreadcrumbItem
              label={collectionCrumb.label}
              onClick={collectionCrumb.onClick}
            />
            {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
          </>
        )}

        {/* First breadcrumb */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='flex min-w-0 shrink'>
                {breadcrumbs.length > 1 ? (
                  <BreadcrumbItemLink
                    breadcrumb={rootBreadcrumbName || firstBreadcrumb.label}
                    onClick={() =>
                      goBack(firstBreadcrumb.formId, firstBreadcrumb.formName)
                    }
                  />
                ) : (
                  <FinalBreadcrumbItem
                    breadcrumb={rootBreadcrumbName || firstBreadcrumb.label}
                  />
                )}
              </span>
            </TooltipTrigger>
            {contentPath && (
              <TooltipContent
                side='bottom'
                align='start'
                className='shadow-md max-w-xs break-all'
              >
                {contentPath}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Dropdown for middle breadcrumbs */}
        {dropdownBreadcrumbs.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className='flex items-center gap-1'>
                  <BreadcrumbEllipsis className='size-4' />
                  <span className='sr-only'>Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  {dropdownBreadcrumbs.map((breadcrumb) => (
                    <DropdownMenuItem
                      key={breadcrumb.formId}
                      onClick={(e) => {
                        e.preventDefault();
                        goBack(breadcrumb.formId, breadcrumb.formName);
                      }}
                    >
                      {breadcrumb.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Second last breadcrumb */}
        {secondLastBreadcrumb && (
          <>
            <BreadcrumbSeparator />
            {breadcrumbs.length > 1 ? (
              <BreadcrumbItemLink
                breadcrumb={secondLastBreadcrumb.label}
                onClick={() =>
                  goBack(
                    secondLastBreadcrumb.formId,
                    secondLastBreadcrumb.formName
                  )
                }
              />
            ) : (
              <FinalBreadcrumbItem breadcrumb={secondLastBreadcrumb.label} />
            )}
          </>
        )}

        {/* Last breadcrumb - only use when there is more than 2 breadcrumbs */}
        {lastBreadcrumb && (
          <>
            {breadcrumbs.length > 1 && <BreadcrumbSeparator />}
            <FinalBreadcrumbItem breadcrumb={lastBreadcrumb.label} />
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
