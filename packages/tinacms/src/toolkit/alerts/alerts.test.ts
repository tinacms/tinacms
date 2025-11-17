import { EventBus } from '@toolkit/core';
import { describe, it, vi, beforeEach } from 'vitest';
import { Alerts } from './alerts';
import { toast } from '../components/ui/sonner';

// Mock the toast module
vi.mock('../components/ui/sonner', () => ({
  toast: {
    success: vi.fn(() => 'success-toast-id'),
    error: vi.fn(() => 'error-toast-id'),
    warning: vi.fn(() => 'warning-toast-id'),
    info: vi.fn(() => 'info-toast-id'),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
vi.useFakeTimers();

const events = new EventBus();

describe('Alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is empty by default', () => {
    const alerts = new Alerts(events);

    expect(alerts.all).toHaveLength(0);
  });

  describe('Toast Notifications', () => {
    it('triggers toast.info when info alert is added', () => {
      const alerts = new Alerts(events);

      alerts.info('Info message', 5000);

      expect(toast.info).toHaveBeenCalledWith('Info message', {
        duration: 5000,
      });
    });

    it('triggers toast.success when success alert is added', () => {
      const alerts = new Alerts(events);

      alerts.success('Success message', 3000);

      expect(toast.success).toHaveBeenCalledWith('Success message', {
        duration: 3000,
      });
    });

    it('triggers toast.warning when warn alert is added', () => {
      const alerts = new Alerts(events);

      alerts.warn('Warning message', 4000);

      expect(toast.warning).toHaveBeenCalledWith('Warning message', {
        duration: 4000,
      });
    });

    it('does not trigger toast for error alerts', () => {
      const alerts = new Alerts(events);

      alerts.error('Error message');

      // Error alerts don't trigger toasts - they're shown in modals
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('calls toast.dismiss when non-error alert is dismissed', () => {
      const alerts = new Alerts(events);
      const dismiss = alerts.info('Info message');

      dismiss();

      expect(toast.dismiss).toHaveBeenCalledWith('info-toast-id');
    });

    it('does not call toast.dismiss when error alert is dismissed', () => {
      const alerts = new Alerts(events);
      const dismiss = alerts.error('Error message');

      dismiss();

      // Error alerts don't dismiss the toast, only remove from collection
      expect(toast.dismiss).not.toHaveBeenCalled();
    });
  });

  describe('Alert Storage', () => {
    it('stores all alerts in the collection', () => {
      const alerts = new Alerts(events);

      alerts.info('Info');
      alerts.success('Success');
      alerts.warn('Warning');
      alerts.error('Error');

      // All alerts are stored
      expect(alerts.all).toHaveLength(4);
    });

    it('stores error alerts with custom ID', () => {
      const alerts = new Alerts(events);

      alerts.error('Error message');

      const errorAlert = alerts.all[0];
      expect(errorAlert?.level).toBe('error');
      expect(errorAlert?.message).toBe('Error message');
      // Error alerts get a custom timestamp-based ID
      expect(errorAlert?.id).toContain('Error message|');
    });
  });

  describe('calling alerts.add("info", "Test")', () => {
    it('stores info alerts in the collection', () => {
      const alerts = new Alerts(events);

      alerts.info('Test');

      expect(alerts.all).toHaveLength(1);
      expect(alerts.all[0]?.message).toBe('Test');
      expect(alerts.all[0]?.level).toBe('info');
    });
    it.skip('will remove the message after 3000ms', async () => {
      const alerts = new Alerts(events);
      alerts.info('Test');

      vi.runOnlyPendingTimers();

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
      expect(alerts.all).toHaveLength(0);
    });
  });
  describe('calling alerts.add("info", "Test", 1351)', () => {
    it.skip('the message is removed after 1.351 seconds', async () => {
      const alerts = new Alerts(events);

      alerts.info('Test', 1351);

      vi.runOnlyPendingTimers();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1351);
      expect(alerts.all).toHaveLength(0);
    });
    describe('when the dismiss callback is called before the time is up', () => {
      it('is fine and dandy', () => {
        const alerts = new Alerts(events);
        const dismiss = alerts.info('Test');

        dismiss();

        vi.runOnlyPendingTimers();
        expect(alerts.all).toHaveLength(0);
      });
    });
  });

  describe('#subscribe(listener)', () => {
    it('does not call listener', () => {
      const listener = vi.fn();
      const alerts = new Alerts(events);

      alerts.subscribe(listener);

      expect(listener).not.toHaveBeenCalled();
    });
    it('listener is called after `add` is called', () => {
      const listener = vi.fn();
      const alerts = new Alerts(events);
      alerts.subscribe(listener);

      alerts.add('info', 'Test');

      expect(listener).toHaveBeenCalled();
    });
    it('listener is called after `dismiss` is called', () => {
      const listener = vi.fn();
      const alerts = new Alerts(events);
      const dismiss = alerts.info('Test');
      alerts.subscribe(listener);

      dismiss();

      expect(listener).toHaveBeenCalled();
    });
  });
  describe('alerts.info("Information", 2000)', () => {
    it('calls alerts.add("info", "Information", 2000)', () => {
      const alerts = new Alerts(events);
      alerts.add = vi.fn();

      alerts.info('Information', 2000);

      expect(alerts.add).toHaveBeenCalledWith('info', 'Information', 2000);
    });
  });
  describe('alerts.success("Hooray!", 6000)', () => {
    it('calls alerts.add("success", "Hooray!", 6000)', () => {
      const alerts = new Alerts(events);
      alerts.add = vi.fn();

      alerts.success('Hooray!', 6000);

      expect(alerts.add).toHaveBeenCalledWith('success', 'Hooray!', 6000);
    });
  });
  describe('alerts.warn("Warning", 40)', () => {
    it('calls alerts.add("warn", "Warning", 40)', () => {
      const alerts = new Alerts(events);
      alerts.add = vi.fn();

      alerts.warn('Warning', 40);

      expect(alerts.add).toHaveBeenCalledWith('warn', 'Warning', 40);
    });
  });
  describe('alerts.error("Error", 560)', () => {
    it('calls alerts.add("error", "Error", 560)', () => {
      const alerts = new Alerts(events);
      alerts.add = vi.fn();

      alerts.error('Error', 560);

      expect(alerts.add).toHaveBeenCalledWith('error', 'Error', 560);
    });
  });
});
