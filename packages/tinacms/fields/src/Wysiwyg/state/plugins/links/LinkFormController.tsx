import { EditorView } from 'prosemirror-view'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

import { LinkForm } from './LinkForm'
import {
  removeLinkBeingEdited,
  stopEditingLink,
  updateLinkBeingEdited,
} from '../../../commands'

export class LinkFormController {
  clickTarget: HTMLElement | null = null

  constructor(protected renderTarget: HTMLElement, protected view: EditorView) {
    //
  }

  render = (link: HTMLElement) => {
    this.clickTarget = link
    render(this.component(), this.renderTarget)
  }

  unmount = () => unmountComponentAtNode(this.renderTarget)

  component(): any {
    const minWidth = 200
    const arrowSize = 14
    const left = calcLeftOffset(this.clickTarget!, this.renderTarget, minWidth)
    const top = `calc(2rem + ${this.clickTarget!.offsetTop -
      this.renderTarget.offsetTop}px)`
    return (
      <div
      // className={c('link-form--container')}
      >
        <div
          // className={c('link-form--arrow-container')}
          style={{
            left: calcArrowLeftOffset(
              this.clickTarget!,
              this.renderTarget,
              minWidth
            ),
            top,
          }}
        >
          <div
            // className={c('link-form--arrow')}
            style={{
              width: `${arrowSize}px`,
              height: `${arrowSize}px`,
            }}
          />
        </div>
        <LinkForm
          style={{
            left,
            top,
            minWidth: `${minWidth}px`,
          }}
          removeLink={this.removeLink}
          onChange={this.onChange}
          href={this.href}
          title={this.title}
          cancel={this.cancel}
        />
      </div>
    )
  }

  get href() {
    return this.clickTarget!.getAttribute('href')
  }

  get title() {
    return this.clickTarget!.getAttribute('title')
  }

  cancel = () => stopEditingLink(this.view.state, this.view.dispatch)

  removeLink = () => removeLinkBeingEdited(this.view.state, this.view.dispatch)

  onChange = (attrs: any) => {
    updateLinkBeingEdited(this.view.state, this.view.dispatch, {
      ...attrs,
      editing: '',
      creating: '',
    })
  }
}

/**
 * Calculates the leftOffset of the form.
 *
 * It centers the form on the link, unless the form would
 * show up outside of the window, in which case the offset is the edge
 * of the editor.
 *
 * @param {HTMLElement} clickTarget
 * @param {HTMLElement} renderTarget
 * @param {number} minWidth
 * @returns {string}
 */
function calcLeftOffset(
  clickTarget: HTMLElement,
  renderTarget: HTMLElement,
  minWidth: number
) {
  const ow_ct = clickTarget.offsetWidth
  const ol_ct = clickTarget.offsetLeft
  const ow_rt = renderTarget.parentElement!.offsetWidth
  const ol_rt = renderTarget.offsetLeft
  const ol = ol_ct - ol_rt + ow_ct / 2 - minWidth / 2

  let leftEdgeOutsideView = ol < -ol_rt
  if (leftEdgeOutsideView) {
    return `-1rem`
  }

  const rightEdgeOutsideView = ol + minWidth > ow_rt
  if (rightEdgeOutsideView) {
    return `calc(${ol - (ol + minWidth - ow_rt)}px + 1rem)`
  }

  return `${ol}px`
}

function calcArrowLeftOffset(
  clickTarget: HTMLElement,
  renderTarget: HTMLElement,
  _minWidth: number
) {
  const ow_ct = clickTarget.offsetWidth
  const ol_ct = clickTarget.offsetLeft
  const ol_rt = renderTarget.offsetLeft
  const ol = ol_ct - ol_rt + ow_ct / 2
  return `${ol}px`
}
