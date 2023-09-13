import * as React from 'react'
import { Callback, CMSEvent } from '@toolkit/core'
import { useCMS } from './use-cms'

export function useCMSEvent<E extends CMSEvent = CMSEvent>(
  event: E['type'] | E['type'][],
  callback: Callback<E>,
  deps: React.DependencyList
) {
  const cms = useCMS()

  React.useEffect(function () {
    return cms.events.subscribe<E>(event, callback)
  }, deps)
}

export const useEventSubscription = useCMSEvent

export function useEvent<E extends CMSEvent = CMSEvent>(eventType: E['type']) {
  const cms = useCMS()
  return {
    dispatch: (event: Omit<E, 'type'>) =>
      cms.events.dispatch({
        ...event,
        type: eventType,
      }),
    subscribe: (callback: (event: E) => any) =>
      cms.events.subscribe(eventType, callback),
  }
}
