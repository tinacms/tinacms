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
import styled, { css, keyframes } from 'styled-components'
import { Alerts as AlertsCollection, AlertLevel } from '../alerts'
import {
  AlertIcon,
  InfoIcon,
  WarningIcon,
  ErrorIcon,
  CloseIcon,
} from '../icons'
import { useSubscribable } from '../react-core'
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals'
import { Button } from '../styles'

export interface AlertsProps {
  alerts: AlertsCollection
}

export function Alerts({ alerts }: AlertsProps) {
  useSubscribable(alerts)

  if (!alerts.all.length) {
    return null
  }

  return (
    <>
      <AlertContainer>
        {alerts.all
          .filter((alert) => {
            return alert.level !== 'error'
          })
          .map((alert, i) => {
            return (
              <Alert key={alert.id} index={i} level={alert.level}>
                {alert.level === 'info' && <InfoIcon />}
                {alert.level === 'success' && <AlertIcon />}
                {alert.level === 'warn' && <WarningIcon />}
                <p>{alert.message}</p>
                <CloseAlert
                  onClick={() => {
                    alerts.dismiss(alert)
                  }}
                />
              </Alert>
            )
          })}
      </AlertContainer>
      {alerts.all
        .filter((alert) => {
          return alert.level === 'error'
        })
        .map((alert) => {
          const AlertMessage =
            typeof alert.message === 'string'
              ? () => {
                  return <p className="text-base mb-3">{alert.message}</p>
                }
              : alert.message

          return (
            <Modal key={alert.id}>
              <PopupModal>
                <ModalHeader
                  close={() => {
                    alerts.dismiss(alert)
                  }}
                >
                  <ErrorIcon className="mr-1 w-6 h-auto fill-current inline-block text-red-600" />{' '}
                  Error
                </ModalHeader>
                <ModalBody padded={true}>
                  <div className="tina-prose">
                    <AlertMessage />
                  </div>
                </ModalBody>
                <ModalActions>
                  <div className="flex-1"></div>
                  <Button
                    style={{ flexGrow: 1 }}
                    onClick={() => {
                      alerts.dismiss(alert)
                    }}
                  >
                    Close
                  </Button>
                </ModalActions>
              </PopupModal>
            </Modal>
          )
        })}
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
  z-index: 999999;
  pointer-events: none;
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
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-1);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-grey-9);
  fill: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  pointer-events: all;
  cursor: pointer;
  font-size: var(--tina-font-size-2);
  padding: 8px 4px 8px 12px;
  transition: all var(--tina-timing-short) ease-out;
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
    flex: 1 1 auto;
    white-space: wrap;
    max-width: 680px;
    text-align: left;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex: 0 0 auto;
  }

  ${(props) =>
    props.level === 'info' &&
    css`
      fill: var(--tina-color-primary);
      border-left: 6px solid var(--tina-color-primary);
    `};

  ${(props) =>
    props.level === 'success' &&
    css`
      fill: var(--tina-color-success);
      border-left: 6px solid var(--tina-color-success);
    `};

  ${(props) =>
    props.level === 'warn' &&
    css`
      fill: var(--tina-color-warning-dark);
      border-left: 6px solid var(--tina-color-warning);
    `};

  ${(props) =>
    props.level === 'error' &&
    css`
      fill: var(--tina-color-error);
      border-left: 6px solid var(--tina-color-error);
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
  fill: var(--tina-color-grey-5);
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }
`
