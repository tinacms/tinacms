import { Form } from './react-tinacms'

type FormListItem =
  | {
      type: 'document'
      path: string
      formId: string
      subItems: FormListItem[]
    }
  | { type: 'list'; label: string }

type FormList = { label: string; id: string; items: FormListItem[] }

export type TinaAction =
  | {
      type: 'forms:add'
      value: Form
    }
  | {
      type: 'forms:remove'
      value: string
    }
  | {
      type: 'forms:clear'
    }
  | {
      type: 'form-lists:add'
      value: FormList
    }
  | {
      type: 'form-lists:remove'
      value: string
    }
  | {
      type: 'forms:set-active-form-id'
      value: string
    }
  | {
      type: 'forms:set-active-field-name'
      value: { formId: string; fieldName: string }
    }
  | {
      type: 'form-list:clear'
    }
  | {
      type: 'set-edit-mode'
      value: 'visual' | 'basic'
    }

export interface TinaState {
  activeFormId: string | null
  /**
   * Forms are wrapped here because we need `activeFieldName` to be reactive, so adding it as a propery
   * on the Form class won't work, unfortunately. So "form" at this level means tinaForm + activeFieldName
   *
   * TODO: maybe rename this so that it's more clear???
   */
  forms: { activeFieldName?: string | null; tinaForm: Form }[]
  formLists: FormList[]
  editingMode: 'visual' | 'basic'
}

export const initialState: TinaState = {
  activeFormId: null,
  forms: [],
  formLists: [],
  editingMode: 'basic',
}

// Our reducer function that uses a switch statement to handle our actions
export function tinaReducer(state: TinaState, action: TinaAction): TinaState {
  switch (action.type) {
    case 'set-edit-mode':
      return { ...state, editingMode: action.value }
    case 'forms:add':
      if (state.forms.find((f) => f.tinaForm.id === action.value.id)) {
        return state
      }
      return { ...state, forms: [...state.forms, { tinaForm: action.value }] }
    case 'forms:remove':
      return {
        ...state,
        forms: state.forms.filter((form) => form.tinaForm.id !== action.value),
      }
    case 'form-lists:add': {
      if (state.formLists.find((f) => f.id === action.value.id)) {
        return state
      }
      const nextFormLists = [...state.formLists, action.value]

      let activeFormId = null
      if ((state.activeFormId, state.formLists.length === 0)) {
        action.value.items.forEach((item) => {
          if (item.type === 'document') {
            const form = state.forms.find(
              ({ tinaForm }) => item.formId === tinaForm.id
            )
            if (!form.tinaForm.global) {
              activeFormId = item.formId
            }
          }
        })
      }

      return { ...state, activeFormId, formLists: nextFormLists }
    }
    case 'form-lists:remove': {
      const nextFormLists = state.formLists.filter(
        ({ id }) => id !== action.value
      )

      return {
        ...state,
        // Always set it to null for now, this will become more annoying for users
        // when `useTina` hooks are mounting client-side as a result of the app itself
        // rather than route navigation
        activeFormId: null,
        formLists: nextFormLists,
      }
    }
    case 'forms:set-active-form-id':
      if (action.value !== state.activeFormId) {
        return {
          ...state,
          activeFormId: action.value,
        }
      }
      return state
    case 'forms:set-active-field-name':
      const forms = state.forms.map((form) => {
        if (form.tinaForm.id === action.value.formId) {
          return {
            tinaForm: form.tinaForm,
            activeFieldName: action.value.fieldName,
          }
        }
        return form
      })
      return { ...state, forms }
    default:
      throw new Error(`Unhandled action ${action.type}`)
      return state
  }
}
