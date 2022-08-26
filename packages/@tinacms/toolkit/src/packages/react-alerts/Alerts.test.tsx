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

import { render } from '@testing-library/react'
import React from 'react'
import { Alerts } from './Alerts'
import { Alert } from '../alerts'

describe('Alerts', () => {
  it('subscribes to the `alerts`', () => {
    const alerts = createMockAlerts()

    render(<Alerts alerts={alerts} />)

    expect(alerts.subscribe).toHaveBeenCalled()
  })
  describe("when there's no alerts", () => {
    it('renders nothing', () => {
      const alerts = createMockAlerts()

      const { container } = render(<Alerts alerts={alerts} />)

      expect(container.children).toHaveLength(0)
    })
  })
  describe('when there are alerts', () => {
    it('renders one alert', () => {
      const alert: Alert = {
        id: '',
        level: 'success',
        message: 'Hello World',
        timeout: 1000,
      }
      const alerts = createMockAlerts([alert])

      const output = render(<Alerts alerts={alerts} />)

      output.getByText(alert.message)
    })
    describe('clicking an alert', () => {
      it('calls dismiss on the collection', () => {
        const alert: Alert = {
          id: '',
          level: 'success',
          message: 'Hello World',
          timeout: 1000,
        }
        const alerts = createMockAlerts([alert])
        const output = render(<Alerts alerts={alerts} />)

        output.getByRole('button').click()

        expect(alerts.dismiss).toHaveBeenCalledWith(alert)
      })
    })
  })
})

function createMockAlerts(alerts: Alert[] = []): any {
  return {
    get all() {
      return alerts
    },
    subscribe: jest.fn(),
    dismiss: jest.fn(),
  }
}
