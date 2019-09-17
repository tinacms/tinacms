import * as React from 'react'

type Window = any

export interface Props {
  onDismiss: Function
  escape?: boolean
  click?: boolean
}

declare let window: Window

export class Dismissible extends React.Component<Props, {}> {
  area: any
  componentDidMount() {
    if (this.props.click) {
      window.__app_container.addEventListener('click', this.handleDocumentClick)
    }

    if (this.props.escape) {
      document.addEventListener('keydown', this.handleEscape)
    }
  }

  componentWillUnmount() {
    window.__app_container.removeEventListener(
      'click',
      this.handleDocumentClick
    )
    document.removeEventListener('keydown', this.handleEscape)
  }

  handleDocumentClick = (event: MouseEvent) => {
    const area: any = this.area

    if (!area.contains(event.target)) {
      this.props.onDismiss(event)
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  }

  handleEscape = (event: KeyboardEvent) => {
    if (event.keyCode == 27) {
      this.props.onDismiss(event)
      event.stopPropagation()
    }
  }

  render() {
    let { onDismiss, click, escape, ...props } = this.props

    return <div ref={ref => (this.area = ref)} {...props} />
  }
}
