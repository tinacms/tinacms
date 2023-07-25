import { render } from '@testing-library/react'
import React from 'react'
import { Alerts } from './alerts'
import { Alert } from '../alerts'
import { describe, it, vi } from 'vitest'

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

      const alertMessage = alert.message
      if (typeof alertMessage === 'string') {
        output.getByText(alertMessage)
      }
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
    subscribe: vi.fn(),
    dismiss: vi.fn(),
  }
}
