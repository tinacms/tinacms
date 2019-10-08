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
import { Tina, cms } from '@tinacms/tinacms'

cms.registerApi('git')

class MyApp extends App {
  // Only uncomment this method if you have blocking data requirements for
  // every single page in your application. This disables the ability to
  // perform automatic static optimization, causing every page in your app to
  // be server-side rendered.
  //
  // static async getInitialProps(appContext) {
  //   // calls page's `getInitialProps` and fills `appProps.pageProps`
  //   const appProps = await App.getInitialProps(appContext);
  //
  //   return { ...appProps }
  // }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Tina>
        <Component {...pageProps} />
      </Tina>
    )
  }
}

export default MyApp

// Duplicated from gatstby-tinacms-git
cms.registerApi('git', {
  onSubmit(data) {
    return commit(data)
  },
  onChange(data) {
    writeToDisk(data)
  },
  onUploadMedia(data) {
    writeMediaToDisk(data)
  },
  onDelete(data) {
    deleteFromDisk(data)
  },
  isAuthenticated() {
    return true
  },
})

let base = () => {
  let { protocol, hostname, port } = window.location
  return `${protocol}//${hostname}${port != '80' ? `:${port}` : ''}/api`
}

function commit(data) {
  // @ts-ignore
  return fetch(`${base()}/___tina/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}

function writeToDisk(data) {
  // @ts-ignore
  return fetch(
    `${base()}/___tina/${encodeURIComponent(data.fileRelativePath)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    }
  )
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}

function writeMediaToDisk(data) {
  // @ts-ignore
  return fetch(`${base()}/___tina/upload`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}

function deleteFromDisk(data) {
  return fetch(`${base()}/___tina/${encodeURIComponent(data.relPath)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
    .then(response => {
      window.history.back()
    })
    .catch(e => {
      console.error(e)
    })
}
