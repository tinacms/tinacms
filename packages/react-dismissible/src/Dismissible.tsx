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

import * as React from 'react'

export interface Props {
  /**
   * The function that called in response to a dismissal.
   */
  onDismiss: Function

  /**
   * If `true`, pressing `ESC` key will trigger a dismissal. Default: `false`
   */
  escape?: boolean

  /**
   * When `true` clicking outside of the surrounding area triggers a dismissal. Default: `false`
   */
  click?: boolean

  /**
   * When `true` there will be no dismissals. Default: `false`
   */
  disabled?: boolean

  /**
   * An extra Document to add the event listeners too.
   *
   * Used when the dismissible area is inside of an iframe.
   */
  document?: Document
}

export class Dismissible extends React.Component<Props, {}> {
  area: any
  get documents() {
    const targets = [document]

    if (this.props.document) {
      targets.push(this.props.document)
    }
    return targets
  }
  componentDidMount() {
    if (this.props.click) {
      this.documents.forEach(document =>
        document.body.addEventListener('click', this.handleDocumentClick)
      )
    }

    if (this.props.escape) {
      this.documents.forEach(document =>
        document.addEventListener('keydown', this.handleEscape)
      )
    }
  }

  componentWillUnmount() {
    this.documents.forEach(document =>
      document.body.removeEventListener('click', this.handleDocumentClick)
    )
    this.documents.forEach(document =>
      document.removeEventListener('keydown', this.handleEscape)
    )
  }

  handleDocumentClick = (event: MouseEvent) => {
    if (this.props.disabled) return

    const area: any = this.area

    if (!area.contains(event.target)) {
      this.props.onDismiss(event)
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  }

  handleEscape = (event: KeyboardEvent) => {
    if (this.props.disabled) return

    if (event.keyCode == 27) {
      this.props.onDismiss(event)
      event.stopPropagation()
    }
  }

  render() {
    const { onDismiss, click, escape, ...props } = this.props

    return <div ref={ref => (this.area = ref)} {...props} />
  }
}
