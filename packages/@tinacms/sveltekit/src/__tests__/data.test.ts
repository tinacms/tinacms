import { afterEach, describe, expect, it, vi } from 'vitest';
import { subscribeToTinaData } from '../data';
import { tinaField } from '../tina-field';

afterEach(() => vi.unstubAllGlobals());

describe('subscribeToTinaData', () => {
  it('accepts matching editor updates and removes its listener on cleanup', () => {
    const parent = {} as Window;
    const previewWindow = new EventTarget() as unknown as Window;
    Object.defineProperties(previewWindow, {
      parent: { value: parent },
      location: { value: { origin: 'https://site.test' } },
    });
    vi.stubGlobal('window', previewWindow);

    const onUpdate = vi.fn();
    const stop = subscribeToTinaData(
      { id: 'post-id', data: { title: 'Published title' } },
      onUpdate
    );
    const send = (
      source: Window,
      origin: string,
      id: string,
      title: string
    ) => {
      const event = new Event('message');
      Object.defineProperties(event, {
        source: { value: source },
        origin: { value: origin },
        data: { value: { type: 'updateData', id, data: { title } } },
      });
      previewWindow.dispatchEvent(event);
    };

    send(parent, 'https://attacker.test', 'post-id', 'Wrong origin');
    send({} as Window, 'https://site.test', 'post-id', 'Wrong source');
    send(parent, 'https://site.test', 'other-id', 'Wrong form');
    send(parent, 'https://site.test', 'post-id', 'Unsaved title');

    expect(onUpdate).toHaveBeenCalledOnce();
    const updated = onUpdate.mock.calls[0][0];
    expect(updated).toEqual(
      expect.objectContaining({ title: 'Unsaved title' })
    );
    expect(tinaField(updated, 'title')).toBe('post-id---title');

    stop();
    send(parent, 'https://site.test', 'post-id', 'After cleanup');
    expect(onUpdate).toHaveBeenCalledOnce();
  });
});
