import { CMS } from './cms';
import { CMSEvent, EventBus } from './event';

describe('CMS', () => {
  describe('when constructed without options', () => {
    it('instantiates without error', () => {
      const cms = new CMS();

      expect(cms).toBeInstanceOf(CMS);
    });
    it('is disabled', () => {
      const cms = new CMS();

      expect(cms.disabled).toBe(true);
    });
  });
  describe('when constructed with options', () => {
    describe('without enabled set', () => {
      it('is disabled', () => {
        const options = {};

        const cms = new CMS(options);

        expect(cms.disabled).toBe(true);
      });
    });
    describe('with enabled set to `true`', () => {
      it('is enabled ', () => {
        const options = {
          enabled: true,
        };

        const cms = new CMS(options);

        expect(cms.enabled).toBe(true);
      });
    });
    describe('with enabled set to `false`', () => {
      it('is disabled', () => {
        const options = {
          enabled: false,
        };

        const cms = new CMS(options);

        expect(cms.disabled).toBe(true);
      });
    });
    describe('containing a plugin', () => {
      it('will have the plugin', () => {
        const plugin = { __type: 'test', name: 'Example' };

        const cms = new CMS({
          plugins: [plugin],
        });

        expect(cms.plugins.all('test')).toContain(plugin);
      });
    });
    describe('containing an api', () => {
      it('will have that api', () => {
        const test = { foo: 'bar' };

        const cms = new CMS({
          apis: {
            test,
          },
        });

        expect(cms.api.test).toBe(test);
      });
    });
  });

  describe('#registerApi', () => {
    describe('when the API has `events` of type EventBus', () => {
      it('events dispatched to the API are also sent through the CMS', () => {
        const listener = vi.fn();
        const event: CMSEvent = { type: 'api:example' };
        const example = { events: new EventBus() };
        const cms = new CMS({ apis: { example } });
        cms.events.subscribe('*', listener);

        cms.api.example.events.dispatch(event);

        expect(listener).toHaveBeenCalledWith(event);
      });

      it('forwards global-bus events to the api bus without recursing', () => {
        const cms = new CMS();
        const api = { events: new EventBus() };
        cms.registerApi('thing', api);

        const seen: CMSEvent[] = [];
        api.events.subscribe('cms:did', (e) => seen.push(e));
        // would stack-overflow if the two '*' bridges bounced the event back and forth
        cms.events.dispatch({ type: 'cms:did' });

        expect(seen).toHaveLength(1);
      });

      it('bridges a new event dispatched synchronously by a listener mid-forward', () => {
        const cms = new CMS();
        const api = { events: new EventBus() };
        cms.registerApi('thing', api);

        const seenOnApi: CMSEvent[] = [];
        api.events.subscribe('secondary:event', (e) => seenOnApi.push(e));
        // reacting to the bridged event by dispatching a different one must not
        // be swallowed by the re-entrancy guard
        cms.events.subscribe('thing:did', () => {
          cms.events.dispatch({ type: 'secondary:event' });
        });

        api.events.dispatch({ type: 'thing:did' });

        expect(seenOnApi).toHaveLength(1);
      });
    });
  });
});
