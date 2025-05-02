import type { Context, Md, Plate } from '../types'
import flatten from 'lodash.flatten'
import { phrasingContent } from './phrasing-content.handler'

export const handleList = (content: Md.List, context: Context): Plate.List => {
  return {
    type: content.ordered ? 'ol' : 'ul',
    children: content.children.map((listItem) =>
      handleListItem(listItem, context)
    ),
  }
}

export const handleListItem = (
  content: Md.ListItem,
  context: Context
): Plate.ListItemElement => {
  return {
    type: 'li',
    children: content.children.map((child) => {
      if (child.type === 'paragraph') {
        return {
          type: 'lic',
          children: flatten(
            child.children.map((child) => phrasingContent(child, context))
          ),
        }
      }
      throw new Error(`Unsupported list item child type: ${child.type}`)
    }),
  }
}
