import { flatten } from 'es-toolkit'
import type { Context, Md, Plate } from '../types'
import { phrasingContent } from './phrasing-content.handler'

export const flattenPhrasingContent = (
  children: Md.PhrasingContent[],
  context: Context
): Plate.LicElement[] => {
  const children2 = children.map((child) => phrasingContent(child, context))
  return flatten(Array.isArray(children2) ? children2 : [children2])
}
