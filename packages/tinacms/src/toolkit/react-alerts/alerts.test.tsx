import { render } from '@testing-library/react';
import React from 'react';
import { Alerts } from './alerts';
import { Alert } from '../alerts';
import { ModalProvider } from '../react-modals';
import { describe, it, vi, beforeEach } from 'vitest';

describe('Alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('subscribes to the `alerts`', () => {
    const alerts = createMockAlerts();

    render(<Alerts alerts={alerts} />);

    expect(alerts.subscribe).toHaveBeenCalled();
  });
  describe("when there's no alerts", () => {
    it('renders nothing', () => {
      const alerts = createMockAlerts();

      const { container } = render(<Alerts alerts={alerts} />);

      expect(container.children).toHaveLength(0);
    });
  });
  describe('when there are error alerts', () => {
    it('renders one error alert in a modal', () => {
      const alert: Alert = {
        id: 'error-1',
        level: 'error',
        message: 'Error message',
        timeout: 1000,
      };
      const alerts = createMockAlerts([alert]);

      const output = render(
        <ModalProvider>
          <Alerts alerts={alerts} />
        </ModalProvider>
      );

      // Should render error message in modal
      output.getByText('Error message');
      output.getByText('Error');
    });

    describe('clicking close on an error alert', () => {
      it('calls dismiss on the collection', () => {
        const alert: Alert = {
          id: 'error-1',
          level: 'error',
          message: 'Error message',
          timeout: 1000,
        };
        const alerts = createMockAlerts([alert]);
        const output = render(
          <ModalProvider>
            <Alerts alerts={alerts} />
          </ModalProvider>
        );

        output.getByRole('button', { name: /close/i }).click();

        expect(alerts.dismiss).toHaveBeenCalledWith(alert);
      });
    });
  });
});

function createMockAlerts(alerts: Alert[] = []): any {
  return {
    get all() {
      return alerts;
    },
    subscribe: vi.fn(),
    dismiss: vi.fn(),
  };
}
