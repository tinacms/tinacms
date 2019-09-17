import * as React from 'react'

export interface Props {
  onDismiss: Function
  escape?: boolean
  click?: boolean
  disabled?: boolean
  document?: any
}

export class Dismissible extends React.Component<Props, {}> {
  area: any
  get documents() {
    let targets = [document]

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
    let { onDismiss, click, escape, ...props } = this.props

    return <div ref={ref => (this.area = ref)} {...props} />
  }
}
