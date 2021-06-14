import * as React from 'react'

export class TinaErrorBoundary extends React.Component<
  { id: string },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state && this.state.hasError) {
      return <h1>An error occurred in {this.props.id}</h1>
    }
    return this.props.children
  }
}

export class CMSRecoveryBoundary extends React.Component<
  { initialCMS: any },
  { hasError: true }
> {
  private initialCMS: any
  constructor(props: any) {
    super(props)
    this.initialCMS = props.cms
  }
}
