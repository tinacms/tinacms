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

// For some reason ResizeObserver can't be found
// Type definitions for non-npm package resize-observer-browser 0.1
// Project: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver, https://developers.google.com/web/updates/2016/10/resizeobserver, https://wicg.github.io/ResizeObserver/
// Definitions by: Chives <https://github.com/chivesrs>
//                 William Furr <https://github.com/wffurr>
//                 Alexander Shushunov <https://github.com/AlexanderShushunov>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
interface ResizeObserverOptions {
  /**
   * Sets which box model the observer will observe changes to. Possible values
   * are `content-box` (the default), and `border-box`.
   *
   * @default 'content-box'
   */
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box' | undefined
}

interface ResizeObserverSize {
  readonly inlineSize: number
  readonly blockSize: number
}

interface ResizeObserver {
  disconnect(): void
  observe(target: Element, options?: ResizeObserverOptions): void
  unobserve(target: Element): void
}

declare const ResizeObserver: {
  new (callback: ResizeObserverCallback): ResizeObserver
  prototype: ResizeObserver
}

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void
}

interface ResizeObserverEntry {
  readonly target: Element
  readonly contentRect: DOMRectReadOnly
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly devicePixelContentBoxSize?:
    | ReadonlyArray<ResizeObserverSize>
    | undefined
}
