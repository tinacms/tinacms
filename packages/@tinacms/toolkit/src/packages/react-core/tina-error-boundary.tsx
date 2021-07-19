/**

Copyright 2021 Forestry.io Holdings, Inc.

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
