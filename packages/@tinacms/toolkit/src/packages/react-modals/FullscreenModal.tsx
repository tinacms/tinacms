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

import React from 'react'

export const FullscreenModal = ({ className = '', style = {}, ...props }) => (
  <div
    className={`flex flex-col z-0 overflow-visible bg-white rounded-none absolute top-0 left-0 w-full max-w-[1500px] h-full ${className} md:w-[calc(100%-170px)]`}
    style={{
      animation: 'popup-right 150ms ease-out 1',
      ...style,
    }}
    {...props}
  />
)

/**
 * @alias [FullscreenModal]
 * @deprecated
 */
export const ModalFullscreen = FullscreenModal
