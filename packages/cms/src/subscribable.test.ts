import { Subscribeable } from './subscribable'

class Example extends Subscribeable {
  notify() {
    this.notifiySubscribers()
  }
}
describe('Subscribable', () => {
  describe('#subscribe', () => {
    it('does not callback initially', () => {
      let subscribable = new Example()
      let callback = jest.fn()

      subscribable.subscribe(callback)

      expect(callback).not.toHaveBeenCalled()
    })
    it('calls the callback when notify', () => {
      let subscribable = new Example()
      let callback = jest.fn()
      subscribable.subscribe(callback)

      subscribable.notify()

      expect(callback).toHaveBeenCalled()
    })
    it('calls the callback on subsequent calls', () => {
      let subscribable = new Example()
      let callback = jest.fn()
      subscribable.subscribe(callback)

      subscribable.notify()
      subscribable.notify()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(3)
    })
    it('returns an unsubscribe function', () => {
      let subscribable = new Example()
      let callback = jest.fn()
      let unsubscribe = subscribable.subscribe(callback)

      subscribable.notify()
      unsubscribe()
      subscribable.notify()

      expect(callback).toHaveBeenCalledTimes(1)
    })
    describe('when there are multiple subscribers', () => {
      it('calls them all each time', () => {
        let subscribable = new Example()
        let cb1 = jest.fn()
        let cb2 = jest.fn()
        subscribable.subscribe(cb1)
        subscribable.subscribe(cb2)

        subscribable.notify()
        subscribable.notify()
        subscribable.notify()

        expect(cb1).toHaveBeenCalledTimes(3)
        expect(cb2).toHaveBeenCalledTimes(3)
      })
    })
  })
  describe('when already subscribed', () => {
    describe('after calling #unsubscribe', () => {
      it('does not call the callback', () => {
        let subscribable = new Example()
        let cb1 = jest.fn()
        subscribable.subscribe(cb1)

        subscribable.notify()
        subscribable.unsubscribe(cb1)
        subscribable.notify()

        expect(cb1).toHaveBeenCalledTimes(1)
      })
      it('does not unsubscribe other callbacks', () => {
        let subscribable = new Example()
        let cb1 = jest.fn()
        let cb2 = jest.fn()
        subscribable.subscribe(cb1)
        subscribable.subscribe(cb2)

        subscribable.notify()
        subscribable.unsubscribe(cb1)
        subscribable.notify()

        expect(cb2).toHaveBeenCalledTimes(2)
      })
    })
  })
})
