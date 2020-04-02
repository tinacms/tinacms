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

import React from 'react'
import App from 'next/app'
import { Tina, TinaCMS, withTina } from 'tinacms'
import { GitClient, GitMediaStore } from '@tinacms/git-client'
import { Toolbar } from '@tinacms/react-toolbar'

export default class Site extends App {
  constructor() {
    super()
    this.cms = new TinaCMS({
      sidebar: {
        position: 'overlay',
        hidden: process.env.NODE_ENV === 'production',
      },
    })
    const client = new GitClient('http://localhost:3000/___tina')
    this.cms.registerApi('git', client)
    this.cms.media.store = new GitMediaStore(client)
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Tina cms={this.cms}>
        <Toolbar />
        <Component {...pageProps} />
      </Tina>
    )
  }
}

// const client = new GitClient('http://localhost:3000/___tina')

// export default withTina(App, {
//   apis: {
//     git: client,
//   },
//   media: {
//     store: new GitMediaStore(client),
//   },
//   sidebar: {
//     hidden: process.env.NODE_ENV === 'production',
//   },
// })
