import { fi } from 'date-fns/locale';
import { act } from 'react';
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
        const breadcrumbs = calculateBreadcrumbs(state.forms, action.value, '');
        return {
          ...state,
          breadcrumbs,
          activeFormId: action.value,
        };
      }
      return state;
    case 'forms:set-active-field-name':
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
    console.warn(
      '[calculateBreadcrumbs] No form found for activeFormId:',
      activeFormId
    );
    return [];
  }

  const makeCrumb = (field: {
    label?: string;
    name?: string;
  }): Breadcrumb => {
    return {
      label: typeof field.label === 'string' ? field.label : field.name,
      formId: form.id,
      formName: field.name,
    };
  };

  console.log(
    '[calculateBreadcrumbs] Calculating breadcrumbs for active field:',
    activeFieldName,
    'Form ID:',
    activeFormId,
    'Form:',
    form
  );

  if (!activeFieldName) {
    const fieldGroup = form.getActiveField('');
    return [makeCrumb(fieldGroup)];
  }

  const breadcrumbs: Breadcrumb[] = [];
  let activePath = activeFieldName.split('.');
  while (activePath.length > 0) {
    const fieldGroup = form.getActiveField(activePath.join('.'));
    console.log(
      '[calculateBreadcrumbs] Current fieldGroup:',
      fieldGroup,
      'Active path:',
      activePath
    );
    if (!fieldGroup) {
      break;
    }

    breadcrumbs.unshift(makeCrumb(fieldGroup));

    if (!fieldGroup.name) {
      // console.warn(
      //   '[calculateBreadcrumbs] Field group has no name, breaking out of loop:',
      //   fieldGroup
      // );
      break;
    }

    // continue up the tree
    activePath = fieldGroup.name.split('.').slice(0, -1);
    switch ((fieldGroup as any).type) {
      case 'object':
        if ((fieldGroup as any).list) {
          // If the field is a list, we need to go up one more level
          activePath = activePath.slice(0, -1);
        }
        break;
      case 'rich-text':
        // rich-text fields are special, they have a `props` object that contains the actual fields
        // we should've hit a `props` and fields inside are nested under `.children.[\d+]`
        // so we need to go up 2 more levels)
        activePath = activePath.slice(0, -2);
        break;
    }
  }

  // ensure that the last breadcrumb is the form itself
  if (!breadcrumbs.some((crumb) => !crumb.formName)) {
    const fieldGroup = form.getActiveField('');
    breadcrumbs.unshift(makeCrumb(fieldGroup));
  }

  // console.log('[calculateBreadcrumbs] Calculated breadcrumbs:', breadcrumbs);

  return breadcrumbs;
}
