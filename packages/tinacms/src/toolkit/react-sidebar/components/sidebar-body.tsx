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
import { EllipsisVertical } from 'lucide-react';
import * as React from 'react';
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
  const isMultiform = cms.state.forms.length > 1;
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
  );
  const isEditing = !!activeForm;
  if (isMultiform && !activeForm) {
    return <FormLists isEditing={isEditing} />;
  }
  const formMetas = cms.plugins.all<FormMetaPlugin>('form:meta');
  return (
    <>
      {activeForm && (
        <FormWrapper isEditing={isEditing} isMultiform={isMultiform}>
          <FormHeader activeForm={activeForm} />
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
    <div
      className='flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white'
      style={
        isEditing
          ? {
              transform: 'none',
              animationName: 'fly-in-left',
              animationDuration: '150ms',
              animationDelay: '0',
              animationIterationCount: 1,
              animationTimingFunction: 'ease-out',
            }
          : {
              transform: 'translate3d(100%, 0, 0)',
            }
      }
    >
      {children}
    </div>
  );
};

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form };
}

export const FormHeader = ({ activeForm }: FormHeaderProps) => {
  const { formIsPristine } = React.useContext(SidebarContext);

  return (
    <div className='px-4 pt-2 pb-4 flex flex-row flex-nowrap justify-between items-center gap-2 bg-gradient-to-t from-white to-gray-50'>
      <MultiformSelector activeForm={activeForm} />
      <FormBreadcrumbs className='w-[calc(100%-3rem)]' />
      <FormStatus pristine={formIsPristine} />
    </div>
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
            className='text-gray-700 hover:text-blue-500 truncate'
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
                      className='cursor-pointer text-gray-700 hover:text-blue-500'
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

const MultiformSelector = ({
  activeForm,
}: {
  activeForm: { activeFieldName?: string; tinaForm: Form };
}) => {
  const cms = useCMS();
  const isMultiform = cms.state.forms.length > 1;

  if (!isMultiform) {
    return null;
  }
  return (
    <button
      type='button'
      className='pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150'
      onClick={() => {
        const state = activeForm.tinaForm.finalForm.getState();
        if (state.invalid === true) {
          cms.alerts.error('Cannot navigate away from an invalid form.');
        } else {
          cms.dispatch({ type: 'forms:set-active-form-id', value: null });
        }
      }}
    >
      <EllipsisVertical className='h-5 w-auto opacity-70' />
    </button>
  );
};
