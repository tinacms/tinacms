/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Rogier Schouten <github@workingcode.ninja>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Vendored subset of async-lock (https://github.com/rogierschouten/async-lock),
 * trimmed to the API surface TinaCMS uses: promise-mode `acquire(key, fn)` on a
 * single string key. Preserves the upstream semantics — per-key serialization,
 * FIFO ordering, and a rejected `fn` rejects the caller without wedging the
 * queue for that key. Lives in this package (rather than a shared util) so it
 * inlines into `dist/client.js` without dragging in a bundler-hostile CJS dep.
 */
export class AsyncLock {
  private queues = new Map<string, Promise<void>>();

  acquire<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.queues.get(key) ?? Promise.resolve();
    const next = prev.then(fn);
    this.queues.set(
      key,
      next.then(
        () => undefined,
        () => undefined
      )
    );
    return next;
  }
}
