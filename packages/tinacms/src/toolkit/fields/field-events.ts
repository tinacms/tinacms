import { CMSEvent } from '@toolkit/core/event'

export interface FieldHoverEvent extends CMSEvent {
  type: 'field:hover'
  fieldName: string | null
  id: string
}

export interface FieldFocusEvent extends CMSEvent {
  type: 'field:focus'
  fieldName: string
  id: string
}
