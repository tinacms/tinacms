/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

import { codes } from 'micromark-util-symbol/codes'
import { directiveContainer } from './directive-container'
import { directiveLeaf } from './directive-leaf'
import { directiveText } from './directive-text'

/**
 * @returns {Extension}
 */
export function directive() {
  return {
    text: { [codes.colon]: directiveText },
    flow: { [codes.colon]: [directiveContainer, directiveLeaf] },
  }
}
