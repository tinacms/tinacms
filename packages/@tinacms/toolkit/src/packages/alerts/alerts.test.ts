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

import { Alerts } from './alerts'
import { EventBus } from '../core'

jest.useFakeTimers()

const events = new EventBus()

describe('Alerts', () => {
  it('is empty by default', () => {
    const alerts = new Alerts(events)

    expect(alerts.all).toHaveLength(0)
  })
  describe('calling alerts.add("info", "Test")', () => {
    it('creates alert with message: "Test"', () => {
      const alerts = new Alerts(events)

      alerts.info('Test')

      const testAlert = alerts.all.pop()
      expect(testAlert?.message).toBe('Test')
    })
    it('creates alert with level: "info"', () => {
      const alerts = new Alerts(events)

      alerts.info('Test')

      const testAlert = alerts.all.pop()
      expect(testAlert?.level).toBe('info')
    })
    it.skip('will remove the message after 3000ms', async () => {
      const alerts = new Alerts(events)
      alerts.info('Test')

      jest.runOnlyPendingTimers()

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000)
      expect(alerts.all).toHaveLength(0)
    })
  })
  describe('calling alerts.add("info", "Test", 1351)', () => {
    it.skip('the message is removed after 1.351 seconds', async () => {
      const alerts = new Alerts(events)

      alerts.info('Test', 1351)

      jest.runOnlyPendingTimers()
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1351)
      expect(alerts.all).toHaveLength(0)
    })
    describe('when the dismiss callback is called before the time is up', () => {
      it('is fine and dandy', () => {
        const alerts = new Alerts(events)
        const dismiss = alerts.info('Test')

        dismiss()

        jest.runOnlyPendingTimers()
        expect(alerts.all).toHaveLength(0)
      })
    })
  })

  describe('#subscribe(listener)', () => {
    it('does not call listener', () => {
      const listener = jest.fn()
      const alerts = new Alerts(events)

      alerts.subscribe(listener)

      expect(listener).not.toHaveBeenCalled()
    })
    it('listener is called after `add` is called', () => {
      const listener = jest.fn()
      const alerts = new Alerts(events)
      alerts.subscribe(listener)

      alerts.add('info', 'Test')

      expect(listener).toHaveBeenCalled()
    })
    it('listener is called after `dismiss` is called', () => {
      const listener = jest.fn()
      const alerts = new Alerts(events)
      const dismiss = alerts.info('Test')
      alerts.subscribe(listener)

      dismiss()

      expect(listener).toHaveBeenCalled()
    })
  })
  describe('alerts.info("Information", 2000)', () => {
    it('calls alerts.add("info", "Information", 2000)', () => {
      const alerts = new Alerts(events)
      alerts.add = jest.fn()

      alerts.info('Information', 2000)

      expect(alerts.add).toHaveBeenCalledWith('info', 'Information', 2000)
    })
  })
  describe('alerts.success("Hooray!", 6000)', () => {
    it('calls alerts.add("success", "Hooray!", 6000)', () => {
      const alerts = new Alerts(events)
      alerts.add = jest.fn()

      alerts.success('Hooray!', 6000)

      expect(alerts.add).toHaveBeenCalledWith('success', 'Hooray!', 6000)
    })
  })
  describe('alerts.warn("Warning", 40)', () => {
    it('calls alerts.add("warn", "Warning", 40)', () => {
      const alerts = new Alerts(events)
      alerts.add = jest.fn()

      alerts.warn('Warning', 40)

      expect(alerts.add).toHaveBeenCalledWith('warn', 'Warning', 40)
    })
  })
  describe('alerts.error("Error", 560)', () => {
    it('calls alerts.add("error", "Error", 560)', () => {
      const alerts = new Alerts(events)
      alerts.add = jest.fn()

      alerts.error('Error', 560)

      expect(alerts.add).toHaveBeenCalledWith('error', 'Error', 560)
    })
  })
})
