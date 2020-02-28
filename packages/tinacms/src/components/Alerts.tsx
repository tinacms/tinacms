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

import { useCMS, useSubscribable } from '../react-tinacms'
import React from 'react'
import styled from 'styled-components'
import { AlertLevel } from '../tina-cms/alerts'

export function Alerts() {
  const cms = useCMS()

  useSubscribable(cms.alerts)

  return (
    <>
      {cms.alerts.all.map(alert => {
        return (
          <Alert
            key={alert.message}
            level={alert.level}
            onClick={() => {
              cms.alerts.dismiss(alert)
            }}
          >
            {alert.message}
          </Alert>
        )
      })}
    </>
  )
}

const Alert = styled.div<{ level: AlertLevel }>`
  border: 1px solid green;
  background: ${({ level }) => {
    switch (level) {
      case 'info':
        return 'gray'
      case 'success':
        return 'green'
      case 'warn':
        return 'yellow'
      case 'error':
        return 'red'
    }
  }};
  position: absolute;
  bottom: 1rem;
  width: 50%;
  margin-left: auto;
  margin-right: auto;
`
