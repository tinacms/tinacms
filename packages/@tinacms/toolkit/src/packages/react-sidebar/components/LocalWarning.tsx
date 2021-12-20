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
import { AiFillWarning } from 'react-icons/ai'

export const LocalWarning = () => {
  return (
    <a
      style={{
        display: 'flex',
        width: '100%',
        fontSize: '14px',
        alignItems: 'center',
        padding: '6px 14px',
        color: '#ab9e58',
        backgroundColor: '#f4efd3',
        borderBottom: '1px solid #F5E06E',
      }}
      href="https://tina.io/docs/tina-cloud/"
      target="_blank"
    >
      <AiFillWarning
        style={{
          width: '16px',
          height: 'auto',
          display: 'inline-block',
          marginRight: '4px',
          opacity: '0.7',
          fill: '#ab9e58',
        }}
      />{' '}
      You are currently in
      <strong style={{ marginLeft: '3px', color: 'inherit' }}>
        Local Mode
      </strong>
    </a>
  )
}
