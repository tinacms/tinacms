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
import ReactDOM from 'react-dom'

export default () => {
  const markerImageLoader = document.getElementsByClassName(
    'image_loading_indicator'
  )
  if (!markerImageLoader.length) return null
  const loaders = []
  for (let i = 0; i < markerImageLoader.length; i++) {
    loaders.push(
      ReactDOM.createPortal(<div>IMAGE LOADER</div>, markerImageLoader[0])
    )
  }
  return <>{loaders}</>
}
