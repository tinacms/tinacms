import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
import { BiFolder } from 'react-icons/bi';
import { FileText } from 'lucide-react';
import * as React from 'react';
import { FormLists } from './form-list';
import { SidebarContext } from './sidebar';
import { SidebarLoadingPlaceholder } from './sidebar-loading-placeholder';
import { SidebarNoFormsPlaceholder } from './sidebar-no-forms-placeholder';
import { History } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../admin/components/ui/tooltip';

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

  // Find the first document form across all form lists
  const firstFormId = React.useMemo(() => {
    for (const formList of cms.state.formLists) {
      for (const item of formList.items) {
        if (item.type === 'document') {
          return item.formId;
        }
      }
    }
    return null;
  }, [cms.state.formLists]);

  const isMultiform = cms.state.forms.length > 1;
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
  );
  const isEditing = !!activeForm;
  const formMetas = cms.plugins.all<FormMetaPlugin>('form:meta');

  if (isShowingLoading || !initialLoadComplete) {
    // Loading - show when explicitly loading or during initial render
    const LoadingPlaceholder = loadingPlaceholder || SidebarLoadingPlaceholder;
    return <LoadingPlaceholder />;
  }

  if (!cms.state.formLists.length) {
    // No Forms
    return <SidebarNoFormsPlaceholder />;
  }

  const showFormList = isMultiform && !activeForm;
  const showActiveForm = !!activeForm;

  return (
    <>
      {showFormList && (
        <div className='max-h-full overflow-y-auto'>
          <FormLists isEditing={isEditing} />
        </div>
      )}
      {showActiveForm && (
        <FormWrapper isEditing={isEditing} isMultiform={isMultiform}>
          <FormHeader
            activeForm={activeForm}
            branch={cms.api.admin.api.branch}
            repoProvider={cms.api.admin.api.schema.config.config.repoProvider}
            isLocalMode={cms.api?.tina?.isLocalMode}
            firstFormId={firstFormId}
          />
          {formMetas?.map((meta) => (
            <React.Fragment key={meta.name}>
              <meta.Component />
            </React.Fragment>
          ))}
          <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
        </FormWrapper>
      )}
    </>
  );
};

interface FormWrapperProps {
  isEditing: boolean;
  isMultiform: boolean;
  children: React.ReactNode;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ isEditing, children }) => {
  return (
    <div className='flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white'>
      {children}
    </div>
  );
};

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form };
  branch?: string;
  isLocalMode?: boolean;
  firstFormId?: string | null;
  repoProvider?: {
    defaultBranchName?: string;
    historyUrl?: (context: {
      relativePath: string;
      branch: string;
    }) => { url: string };
  };
}

export const FormHeader = ({
  activeForm,
  repoProvider,
  branch,
  isLocalMode,
  firstFormId,
}: FormHeaderProps) => {
  const { formIsPristine } = React.useContext(SidebarContext);

  return (
    <div className='px-4 pt-2 pb-4 flex flex-row flex-nowrap items-center gap-2 bg-gradient-to-t from-white to-gray-50'>
      <ViewToggle
        activeForm={activeForm}
        firstFormId={firstFormId}
        showFileName={true}
      />
      <FormBreadcrumbs className='flex-1 min-w-0 overflow-hidden' />
      <div className='flex items-center gap-2 flex-shrink-0'>
        <FileHistoryProvider
          defaultBranchName={repoProvider?.defaultBranchName}
          historyUrl={repoProvider?.historyUrl}
          contentRelativePath={activeForm.tinaForm.path}
          tinaBranch={branch}
          isLocalMode={isLocalMode}
        />
        <FormStatus pristine={formIsPristine} />
      </div>
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

export const FormBreadcrumbs = ({
  rootBreadcrumbName,
  ...props
}: {
  rootBreadcrumbName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const cms = useCMS();
  const breadcrumbs = cms.state.breadcrumbs;

  if (breadcrumbs.length === 0) {
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
      <BreadcrumbList className='flex-nowrap text-nowrap'>
        {/* First breadcrumb */}
        <BreadcrumbItem className='shrink truncate'>
          <BreadcrumbLink
            asChild
            className='text-gray-700 hover:text-orange-500 truncate'
          >
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                goBack(firstBreadcrumb.formId, firstBreadcrumb.formName);
              }}
            >
              {rootBreadcrumbName || firstBreadcrumb.label}
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>

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
            <BreadcrumbItem className='shrink truncate'>
              <BreadcrumbLink
                asChild
                className='text-gray-700 hover:text-blue-500 truncate'
              >
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    goBack(
                      secondLastBreadcrumb.formId,
                      secondLastBreadcrumb.formName
                    );
                  }}
                >
                  {secondLastBreadcrumb.label}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Last breadcrumb - only use when there is more than 2 breadcrumbs */}
        {lastBreadcrumb && (
          <>
            {breadcrumbs.length > 1 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbPage className='text-gray-700 font-medium'>
                {lastBreadcrumb.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const ViewToggle = ({
  activeForm,
  firstFormId,
  showFileName,
}: {
  activeForm?: { activeFieldName?: string; tinaForm: Form } | null;
  firstFormId?: string | null;
  showFileName?: boolean;
}) => {
  const cms = useCMS();
  const isMultiform = cms.state.forms.length > 1;

  if (!isMultiform) {
    return null;
  }

  const isInListView = !activeForm;
  const fileName = firstFormId
    ? firstFormId.split('/').pop() || 'Default'
    : 'Default';
  // Strip file extension for display
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

  const handleListViewClick = () => {
    if (activeForm) {
      const state = activeForm.tinaForm.finalForm.getState();
      if (state.invalid === true) {
        cms.alerts.error('Cannot navigate away from an invalid form.');
      } else {
        cms.dispatch({ type: 'forms:set-active-form-id', value: null });
      }
    }
  };

  const handleFormViewClick = () => {
    if (firstFormId && !activeForm) {
      cms.dispatch({ type: 'forms:set-active-form-id', value: firstFormId });
    }
  };

  return (
    <div className='inline-flex items-center border border-gray-300 rounded overflow-hidden'>
      <button
        type='button'
        onClick={handleListViewClick}
        disabled={isInListView}
        className={`flex items-center gap-1 px-1.5 py-1 text-xs transition-all duration-150 ${
          isInListView
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer'
        }`}
        title='Explorer View'
      >
        <BiFolder className='w-3.5 h-3.5 flex-shrink-0' />
      </button>
      <button
        type='button'
        onClick={handleFormViewClick}
        disabled={!isInListView}
        className={`flex items-center gap-1 px-1.5 py-1 text-xs transition-all duration-150 ${
          !isInListView
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer'
        }`}
        title='Form View'
      >
        <FileText className='w-3.5 h-3.5 flex-shrink-0' />
        {showFileName && isInListView && (
          <span className='truncate max-w-[120px]'>
            {fileNameWithoutExtension}
          </span>
        )}
      </button>
    </div>
  );
};
