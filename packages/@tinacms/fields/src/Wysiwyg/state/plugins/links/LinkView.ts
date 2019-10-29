/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { Schema } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import {
  stopEditingLink,
  startEditingLink,
  renderLinkForm,
  unmountLinkForm,
} from '../../../commands'

export class LinkView {
  visible = false
  linkBeingEdited: Element | null = null
  skippedLinkControlClick: boolean = false

  constructor(
    public view: EditorView,
    public schema: Schema,
    public renderTarget: HTMLElement,
    public extraDoc?: Document
  ) {
    document.addEventListener('click', this.handleClick)
    if (extraDoc) extraDoc.addEventListener('click', this.handleClick)
    window.addEventListener('resize', this.unmountLinkForm)
  }

  destroy = (): void => {
    document.removeEventListener('click', this.handleClick)
    if (this.extraDoc) this.extraDoc.addEventListener('click', this.handleClick)
    window.removeEventListener('resize', this.unmountLinkForm)
    this.renderTarget.parentElement!.removeChild(this.renderTarget)
  }

  handleClick = (e: MouseEvent) => {
    const eventTarget = e.target as HTMLElement
    const clickedInsideEditor = this.view.dom.contains(eventTarget)
    const clickedLink = this.isValidLink(eventTarget)

    if (this.shouldStopEditing(eventTarget)) {
      stopEditingLink(this.view.state, this.view.dispatch)
    }

    if (clickedInsideEditor && clickedLink) {
      e.preventDefault()
      e.stopPropagation()
      if (e.metaKey) {
        const href = clickedLink.getAttribute('href');
        window.open(href ? href : undefined, '_blank')
      } else {
        startEditingLink(this.view.state, this.view.dispatch)
      }
    }
  }

  shouldStopEditing(eventTarget: Element) {
    const clickedInsideOverlay = this.renderTarget.contains(eventTarget)
    const creatingNewLink =
      this.linkBeingEdited &&
      this.linkBeingEdited.getAttribute('creating') === 'creating'
    const firstClickAfterCreatingNewLink =
      creatingNewLink && !this.skippedLinkControlClick

    this.skippedLinkControlClick = !!creatingNewLink

    return (
      this.visible && !clickedInsideOverlay && !firstClickAfterCreatingNewLink
    )
  }

  /**
   * Check's clicked element and it's ancestors to see if a link was clicked.
   *
   * @param {Element} eventTarget
   * @returns {Element}
   */
  isValidLink(eventTarget: HTMLElement) {
    let link
    let el: HTMLElement | null = eventTarget

    while (!link && el) {
      if (el.tagName.toLowerCase() === 'a') {
        link = el
      } else {
        el = el.parentElement
      }
    }

    const noSelection = (this.view.state.selection as any).$cursor

    return link && noSelection ? link : null
  }

  update(view: EditorView): void {
    this.view = view

    this.linkBeingEdited = this.view.dom.querySelector("a[editing='editing']")

    if (!this.linkBeingEdited && this.visible) {
      this.unmountLinkForm()
    }

    if (this.linkBeingEdited && !this.visible) {
      this.renderLinkForm(this.linkBeingEdited)
    }
  }

  renderLinkForm(link: Element) {
    this.visible = true

    renderLinkForm(this.view, link)
  }

  unmountLinkForm = () => {
    this.visible = false

    unmountLinkForm(this.view)
  }
}
