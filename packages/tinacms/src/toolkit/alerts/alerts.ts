import React from 'react';
import type { EventBus, Callback, CMSEvent } from '@toolkit/core';
import { toast } from '@toolkit/components/ui/sonner';

export interface EventsToAlerts {
  [key: string]: ToAlert | AlertArgs;
}

export type ToAlert = (event: CMSEvent) => AlertArgs;

export interface AlertArgs {
  level: AlertLevel;
  message: string;
  timeout?: number;
}

export class Alerts {
  private alerts: Map<string, Alert> = new Map();

  private mapEventToAlert = (event: CMSEvent) => {
    const toAlert = this.map[event.type];

    if (toAlert) {
      let getArgs: ToAlert;
      if (typeof toAlert === 'function') {
        getArgs = toAlert;
      } else {
        getArgs = () => toAlert;
      }

      const { level, message, timeout } = getArgs(event);

      this.add(level, message, timeout);
    }
  };

  constructor(
    private events: EventBus,
    private map: EventsToAlerts = {}
  ) {
    this.events.subscribe('*', this.mapEventToAlert);
  }
  setMap(eventsToAlerts: EventsToAlerts) {
    this.map = {
      ...this.map,
      ...eventsToAlerts,
    };
  }

  add(
    level: AlertLevel,
    message: string | React.FunctionComponent,
    timeout = 8000
  ): () => void {
    let id: string | number;

    // Use sonner's toast methods based on level
    // For FunctionComponent messages, render them directly
    // For string messages, use them as-is (URL parsing happens in component)
    const toastMessage =
      typeof message === 'string' ? message : React.createElement(message);

    switch (level) {
      case 'success':
        id = toast.success(toastMessage, {
          duration: timeout,
        });
        break;
      case 'error':
        id = `${message}|${Date.now()}`;
        break;
      case 'warn':
        id = toast.warning(toastMessage, {
          duration: timeout,
        });
        break;
      case 'info':
      default:
        id = toast.info(toastMessage, {
          duration: timeout,
        });
        break;
    }

    const alert = {
      level,
      message,
      timeout,
      id: String(id),
    };

    this.alerts.set(alert.id, alert);

    this.events.dispatch({ type: 'alerts:add', alert });

    const dismiss = () => {
      if (level !== 'error') {
        toast.dismiss(id);
      }

      this.dismiss(alert);
    };

    return dismiss;
  }

  dismiss(alert: Alert) {
    this.alerts.delete(alert.id);
    this.events.dispatch({ type: 'alerts:remove', alert });
  }

  subscribe(cb: Callback) {
    const unsub = this.events.subscribe('alerts', cb);

    return () => unsub();
  }

  get all() {
    return Array.from(this.alerts.values());
  }

  info(message: string | React.FunctionComponent, timeout?: number) {
    return this.add('info', message, timeout);
  }
  success(message: string | React.FunctionComponent, timeout?: number) {
    return this.add('success', message, timeout);
  }
  warn(message: string | React.FunctionComponent, timeout?: number) {
    return this.add('warn', message, timeout);
  }
  error(message: string | React.FunctionComponent, timeout?: number) {
    return this.add('error', message, timeout);
  }
}

export type AlertLevel = 'info' | 'success' | 'warn' | 'error';

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string | React.FunctionComponent;
  timeout: number;
}
