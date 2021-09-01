import { CMSEvent } from '../core/event'

export interface FieldHoverEvent extends CMSEvent {
  type: 'field:hover'
  fieldName: string | null
}

export interface FieldFocusEvent extends CMSEvent {
  type: 'field:focus'
  fieldName: string
}
