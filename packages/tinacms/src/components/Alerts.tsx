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
import styled, { css, keyframes } from 'styled-components'
import { color, radius, font, shadow } from '@tinacms/styles'
import {
  AlertIcon,
  InfoIcon,
  WarningIcon,
  ErrorIcon,
  CloseIcon,
} from '@tinacms/icons'
import { AlertLevel } from '../tina-cms/alerts'

export function Alerts() {
  const cms = useCMS()

  useSubscribable(cms.alerts)

  return (
    <>
      {cms.alerts.all.length > 0 && (
        <AlertContainer>
          {cms.alerts.all.map((alert, i) => {
            return (
              <Alert
                key={alert.id}
                index={i}
                level={alert.level}
                onClick={() => {
                  cms.alerts.dismiss(alert)
                }}
              >
                {alert.level === 'info' && <InfoIcon />}
                {alert.level === 'success' && <AlertIcon />}
                {alert.level === 'warn' && <WarningIcon />}
                {alert.level === 'error' && <ErrorIcon />}
                <p>{alert.message}</p>
                <CloseAlert />
              </Alert>
            )
          })}
        </AlertContainer>
      )}
    </>
  )
}

const AlertContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const AlertEntranceAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

const Alert = styled.div<{ level: AlertLevel; index: number }>`
  text-align: center;
  border: 0;
  border-radius: ${radius('small')};
  box-shadow: ${shadow('small')};
  background-color: ${color.grey(1)};
  border: 1px solid ${color.grey(2)};
  color: ${color.grey(9)};
  fill: ${color.primary()};
  font-weight: 500;
  cursor: pointer;
  font-size: ${font.size(2)};
  padding: 8px 4px 8px 12px;
  transition: all 85ms ease-out;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  min-width: 350px;
  max-width: 100%;

  animation-name: ${AlertEntranceAnimation};
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;

  p {
    margin: 0;
    flex: 1 0 auto;
    text-align: left;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex: 0 0 auto;
  }

  ${props =>
    props.level === 'info' &&
    css`
      fill: ${color.primary()};
      border-left: 6px solid ${color.primary()};
    `};

  ${props =>
    props.level === 'success' &&
    css`
      fill: ${color.success()};
      border-left: 6px solid ${color.success()};
    `};

  ${props =>
    props.level === 'warn' &&
    css`
      fill: ${color.warning('dark')};
      border-left: 6px solid ${color.warning()};
    `};

  ${props =>
    props.level === 'error' &&
    css`
      fill: ${color.error()};
      border-left: 6px solid ${color.error()};
    `};
`

const CloseAlert = styled(({ ...styleProps }) => {
  return (
    <button {...styleProps}>
      <CloseIcon />
    </button>
  )
})`
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 14px;
  outline: none;
  fill: ${color.grey(5)};
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }
`
