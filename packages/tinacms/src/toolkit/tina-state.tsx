import { AnyField } from './forms';
import { Form } from './react-tinacms';
import { TinaCMS } from './tina-cms';

type FormListItem =
  | {
      type: 'document';
      path: string;
      formId: string;
      subItems: FormListItem[];
    }
  | { type: 'list'; label: string };

type FormList = {
  label: string;
  id: string;
  items: FormListItem[];
  // This value is somewhat duplicated from whats inside the items array, but it makes cleaning
  // Up orphaned forms easier.
  formIds: string[];
};

type Breadcrumb = {
  label: string;
  formId: string;
  formName: string;
  namespace: string[];
};

export type TinaAction =
  | {
      type: 'forms:add';
      value: Form;
    }
  | {
      type: 'forms:remove';
      value: string;
    }
  | {
      type: 'forms:clear';
    }
  | {
      type: 'form-lists:add';
      value: FormList;
    }
  | {
      type: 'form-lists:remove';
      value: string;
    }
  | {
      type: 'forms:set-active-form-id';
      value: string;
    }
  | {
      type: 'forms:set-active-field-name';
      value: { formId: string; fieldName: string };
    }
  | {
      type: 'form-lists:clear';
    }
  | {
      type: 'set-edit-mode';
      value: 'visual' | 'basic';
    }
  | {
      type: 'increment-operation-index';
    }
  | {
      type: 'set-quick-editing-supported';
      value: boolean;
    }
  | {
      type: 'set-quick-editing-enabled';
      value?: boolean;
    }
  | {
      type: 'toggle-quick-editing-enabled';
    }
  | {
      type: 'toggle-edit-state';
    }
  | {
      type: 'sidebar:set-display-state';
      value: TinaState['sidebarDisplayState'] | 'openOrFull';
    }
  | {
      type: 'sidebar:set-loading-state';
      value: boolean;
    };

export interface TinaState {
  breadcrumbs: Breadcrumb[];
  activeFormId: string | null;
  /**
   * Forms are wrapped here because we need `activeFieldName` to be reactive, so adding it as a propery
   * on the Form class won't work, unfortunately. So "form" at this level means tinaForm + activeFieldName
   *
   * The activeFieldName should probably not be in global state, and having it here means that forms
   * only work if they're registered as part of this top-level state. At the risk of touching too much code
   * all at once, putting state this high up at least allows us to not have to touch the Form class too much.
   * Longer term, replaceing Form with something stateful seems like the right approach
   */
  forms: { activeFieldName?: string | null; tinaForm: Form }[];
  formLists: FormList[];
  editingMode: 'visual' | 'basic';
  isLoadingContent: boolean;
  quickEditSupported: boolean;
  sidebarDisplayState: 'closed' | 'open' | 'fullscreen';
}

export const initialState = (cms: TinaCMS): TinaState => {
  return {
    breadcrumbs: [],
    activeFormId: null,
    forms: [],
    formLists: [],
    editingMode: 'basic',
    isLoadingContent: false,
    quickEditSupported: false,
    sidebarDisplayState: cms?.sidebar?.defaultState || 'open',
  };
};

// Our reducer function that uses a switch statement to handle our actions
export function tinaReducer(state: TinaState, action: TinaAction): TinaState {
  switch (action.type) {
    case 'set-quick-editing-supported':
      return {
        ...state,
        quickEditSupported: action.value,
      };
    case 'set-edit-mode':
      return { ...state, editingMode: action.value };
    case 'forms:add':
      if (state.forms.find((f) => f.tinaForm.id === action.value.id)) {
        return state;
      }
      return { ...state, forms: [...state.forms, { tinaForm: action.value }] };
    case 'forms:remove':
      return {
        ...state,
        forms: state.forms.filter((form) => form.tinaForm.id !== action.value),
      };
    case 'form-lists:clear': {
      return {
        ...state,
        quickEditSupported: false,
        breadcrumbs: [],
        activeFormId: null,
        formLists: [],
        forms: [],
      };
    }
    case 'form-lists:add': {
      let formListItemExists = false;
      const nextFormLists = state.formLists.map((formList) => {
        if (formList.id === action.value.id) {
          formListItemExists = true;
          return action.value;
        }
        return formList;
      });

      if (formListItemExists) {
        return state;
      }

      if (!formListItemExists) {
        nextFormLists.push(action.value);
      }

      let activeFormId = state.activeFormId;
      if (!activeFormId && state.formLists.length === 0) {
        action.value.items.forEach((item) => {
          if (!activeFormId) {
            if (item.type === 'document') {
              const form = state.forms.find(
                ({ tinaForm }) => item.formId === tinaForm.id
              );
              if (!form.tinaForm.global) {
                activeFormId = item.formId;
              }
            }
          }
        });
      }

      const breadcrumbs = calculateBreadcrumbs(state.forms, activeFormId, '');

      return {
        ...state,
        activeFormId,
        breadcrumbs,
        formLists: nextFormLists,
        isLoadingContent: false,
      };
    }
    case 'form-lists:remove': {
      const nextFormLists = state.formLists.filter(
        ({ id }) => id !== action.value
      );
      const allFormIdsListed: string[] = [];
      nextFormLists.forEach((formList) => {
        formList.formIds.forEach((id) => {
          allFormIdsListed.push(id);
        });
      });

      // Only keep forms that are associated with remaing form lists
      const nextForms = state.forms.filter(({ tinaForm }) =>
        allFormIdsListed.includes(tinaForm.id)
      );

      return {
        ...state,
        quickEditSupported: false,
        // Always set it to null for now, this will become more annoying for users
        // when `useTina` hooks are mounting client-side as a result of the app itself
        // rather than route navigation
        activeFormId: null,
        forms: nextForms,
        formLists: nextFormLists,
      };
    }
    case 'forms:set-active-form-id':
      if (action.value !== state.activeFormId) {
        const newActiveForm = state.forms.find(
          (form) => form.tinaForm.id === action.value
        );

        const breadcrumbs = calculateBreadcrumbs(
          state.forms,
          action.value,
          newActiveForm?.activeFieldName || ''
        );
        return {
          ...state,
          breadcrumbs,
          activeFormId: action.value,
        };
      }
      return state;
    case 'forms:set-active-field-name':
      if (state.activeFormId === action.value.formId) {
        const existingForm = state.forms.find(
          (form) => form.tinaForm.id === action.value.formId
        );

        if (existingForm?.activeFieldName === action.value.fieldName) {
          // If the active field name is already set, do nothing
          return state;
        }
      }

      const forms = state.forms.map((form) => {
        if (form.tinaForm.id === action.value.formId) {
          return {
            tinaForm: form.tinaForm,
            activeFieldName: action.value.fieldName,
          };
        }
        return form;
      });

      const breadcrumbs = calculateBreadcrumbs(
        state.forms,
        action.value.formId,
        action.value.fieldName
      );

      return {
        ...state,
        breadcrumbs,
        forms,
        activeFormId: action.value.formId,
      };
    case 'toggle-edit-state': {
      return state.sidebarDisplayState === 'closed'
        ? { ...state, sidebarDisplayState: 'open' }
        : {
            ...state,
            sidebarDisplayState: 'closed',
          };
    }
    case 'sidebar:set-display-state': {
      // In some cases, you may only care that the sidebar is open, regardless
      // whether it's "open" or "full"
      if (action.value === 'openOrFull') {
        if (state.sidebarDisplayState === 'closed') {
          return {
            ...state,
            sidebarDisplayState: 'open',
          };
        }
        return state;
      }
      if (action.value === 'open') {
        return {
          ...state,
          sidebarDisplayState: action.value,
        };
      }
      return { ...state, sidebarDisplayState: action.value };
    }
    case 'sidebar:set-loading-state': {
      return { ...state, isLoadingContent: action.value };
    }
    default:
      throw new Error(`Unhandled action ${action.type}`);
      return state;
  }
}

export function calculateBreadcrumbs(
  forms: { activeFieldName?: string | null; tinaForm: Form }[],
  activeFormId: string,
  activeFieldName: string = ''
): Breadcrumb[] {
  const form = forms.find(
    (form) => form.tinaForm.id === activeFormId
  )?.tinaForm;

  if (!form) {
    // couldn't find the active form
    return [];
  }

  const makeCrumb = (
    field: {
      label?: string;
      name?: string;
      namespace?: string[];
    },
    path: string
  ): Breadcrumb => {
    return {
      label: typeof field.label === 'string' ? field.label : field.name,
      formId: form.id,
      formName: path,
      namespace: field.namespace || [],
    };
  };

  if (!activeFieldName) {
    const fieldGroup = form.getActiveField('');
    return [makeCrumb(fieldGroup, '')];
  }

  const breadcrumbs: Breadcrumb[] = [];
  let activePath = activeFieldName.split('.');

  while (activePath.length > 0) {
    let fieldGroup = null;
    try {
      fieldGroup = form.getActiveField(activePath.join('.'));
    } catch (error) {
      // swallow the error to continue up the tree
      // This can happen when you have a structure like form -> object -> rich-text -> component
    }

    if ((fieldGroup as any)?.__type === 'form') {
      // If we reach the form itself - we stop
      break;
    }

    const isListField = !!(fieldGroup as AnyField)?.list;
    const pathEndsWithDigit = /^\d+$/.test(activePath[activePath.length - 1]);
    if (isListField && !pathEndsWithDigit) {
      // continue up the tree since we should be on a list item, not the list itself
      activePath = activePath.slice(0, -1);
      continue;
    }

    if (fieldGroup) {
      // If we found a fieldGroup, we create a breadcrumb for it
      const lastInsertedCrumb = breadcrumbs.length > 0 ? breadcrumbs[0] : null;
      const newCrumb = makeCrumb(fieldGroup, activePath.join('.'));
      if (
        !lastInsertedCrumb ||
        lastInsertedCrumb.label !== newCrumb.label ||
        lastInsertedCrumb.namespace.join('.') !== newCrumb.namespace.join('.')
      ) {
        breadcrumbs.unshift(newCrumb);
      }
    }

    if (activePath.length > 0) {
      const fieldType = (fieldGroup as AnyField)?.type;
      if (
        fieldType === 'rich-text' ||
        (activePath[activePath.length - 2] === 'children' && pathEndsWithDigit)
      ) {
        // if activePath ends with ['children', '\d+']
        activePath = activePath.slice(0, -3);
      } else {
        // continue up the tree
        activePath = activePath.slice(0, -1);
      }
    }
  }

  // ensure that the last breadcrumb is the form itself
  if (!breadcrumbs.some((crumb) => !crumb.formName)) {
    const fieldGroup = form.getActiveField('');
    breadcrumbs.unshift(makeCrumb(fieldGroup, ''));
  }

  return breadcrumbs;
}
