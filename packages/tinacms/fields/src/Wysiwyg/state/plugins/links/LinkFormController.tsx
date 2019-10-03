import { EditorView } from 'prosemirror-view'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

import { LinkForm } from './LinkForm'
import {
  removeLinkBeingEdited,
  stopEditingLink,
  updateLinkBeingEdited,
} from '../../../commands'
import styled, { StyleSheetManager } from 'styled-components'
import { FC } from 'react'

export class LinkFormController {
  clickTarget: HTMLElement | null = null

  constructor(
    protected renderTarget: HTMLElement,
    protected view: EditorView,
    protected frame?: { document: Document }
  ) {
    //
  }

  render = (link: HTMLElement) => {
    this.clickTarget = link
    render(this.component(), this.renderTarget)
  }

  unmount = () => unmountComponentAtNode(this.renderTarget)

  component(): any {
    const minWidth = 240
    const left = calcLeftOffset(this.clickTarget!, this.renderTarget, minWidth)
    const top = `calc(2rem + ${this.clickTarget!.offsetTop -
      this.renderTarget.offsetTop}px)`
    const arrowOffset = calcArrowLeftOffset(
      this.clickTarget!,
      this.renderTarget,
      minWidth
    )
    return (
      <ViewContainer frame={this.frame}>
        <>
          <LinkArrow offset={arrowOffset} top={top}></LinkArrow>
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
        </>
      </ViewContainer>
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

const ViewContainer: FC<{ frame: any }> = ({ frame, children }) => {
  if (!frame) return <>{children}</>
  return (
    <StyleSheetManager target={frame.document.head}>
      {children}
    </StyleSheetManager>
  )
}

const LinkArrow = styled.div<{ offset: string; top: string }>`
  position: absolute;
  top: ${p => p.top};
  left: ${p => p.offset};
  margin-top: 3px;
  transform: translate3d(-50%, -100%, 0);
  width: 1rem;
  height: 0.8rem;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background-color: #f6f6f9;
  z-index: 100;
`

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
    return `-0.5rem`
  }

  const rightEdgeOutsideView = ol + minWidth > ow_rt
  if (rightEdgeOutsideView) {
    return `calc(${ol - (ol + minWidth - ow_rt)}px + 0.5rem)`
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
