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
      <div className="fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center z-[999999] pointer-events-none">
        {alerts.all
          .filter((alert) => {
            return alert.level !== 'error'
          })
          .map((alert) => {
            return (
              <Alert key={alert.id} level={alert.level}>
                {alert.level === 'info' && <InfoIcon />}
                {alert.level === 'success' && <AlertIcon />}
                {alert.level === 'warn' && <WarningIcon />}
                <p className="m-0 flex-1 max-w-[680px] text-left">
                  {alert.message}
                </p>
                <CloseAlert
                  onClick={() => {
                    alerts.dismiss(alert)
                  }}
                />
              </Alert>
            )
          })}
      </div>
      {alerts.all
        .filter((alert) => {
          return alert.level === 'error'
        })
        .map((alert) => {
          const AlertMessage =
            typeof alert.message === 'string'
              ? () => {
                  return (
                    <p className="text-base mb-3 overflow-y-auto">
                      {alert.message}
                    </p>
                  )
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

const Alert: React.FC<{ level: AlertLevel }> = ({ level, ...props }) => {
  const fillColor = {
    info: 'var(--tina-color-primary)',
    success: 'var(--tina-color-success)',
    warn: 'var(--tina-color-dark)',
    error: 'var(--tina-color-error)',
  }
  const borderColor = {
    info: 'var(--tina-color-primary)',
    success: 'var(--tina-color-success)',
    warn: 'var(--tina-color-warning)',
    error: 'var(--tina-color-error)',
  }

  return (
    <div
      className={`text-center rounded-[5px] bg-gray-50 border border-solid border-gray-100 text-gray-800 fill-blue-500 font-normal cursor-pointer text-[15px] py-2 pr-1 pl-3 transition-all duration-100 ease-out mb-4 flex items-center min-w-[350px] max-w-full `}
      style={{
        pointerEvents: 'all',
        animationName: 'fly-in-up, fade-in',
        animationTimingFunction: 'ease-out',
        animationIterationCount: 1,
        animationFillMode: 'both',
        animationDuration: '150ms',
        fill: fillColor[level],
        borderLeft: `6px solid ${borderColor[level]}`,
      }}
      {...props}
    />
  )
}

const CloseAlert = ({ ...styleProps }) => (
  <button
    className="border-none bg-transparent p-0 ml-[14px] outline-none fill-gray-400 flex items-center"
    {...styleProps}
  >
    <CloseIcon className="w-5 h-5 flex-grow-0 flex-shrink-0 basis-[auto] mr-2" />
  </button>
)
