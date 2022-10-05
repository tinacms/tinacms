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

export const PopupModal = ({ className = '', style = {}, ...props }) => (
  <div
    className={`block z-0 overflow-visible bg-gray-50 rounded-[5px] my-10 mx-auto w-[460px] max-w-[90%] ${className}`}
    style={{
      animation: 'popup-down 150ms ease-out 1',
      ...style,
    }}
    {...props}
  />
)

/**
 * @alias [PopupModal]
 * @deprecated
 */
export const ModalPopup = PopupModal
