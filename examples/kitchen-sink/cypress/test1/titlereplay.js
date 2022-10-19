import url from 'url'
import { createRunner } from '@puppeteer/replay'

export const flow = {
  title: 'title',
  steps: [
    {
      type: 'setViewport',
      width: 1237,
      height: 984,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
    {
      type: 'navigate',
      url: 'http://localhost:3000/admin/index.html#/preview',
      assertedEvents: [
        {
          type: 'navigation',
          url: 'http://localhost:3000/admin/index.html#/preview',
          title: 'TinaCMS',
        },
      ],
    },
    {
      type: 'click',
      target: 'main',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      offsetY: 24.7109375,
      offsetX: 204,
    },
    {
      type: 'keyDown',
      target: 'main',
      key: 'Shift',
    },
    {
      type: 'change',
      value: 'A',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
    {
      type: 'keyUp',
      key: 'Shift',
      target: 'main',
    },
    {
      type: 'change',
      value: 'A ',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
    {
      type: 'keyDown',
      target: 'main',
      key: 'Shift',
    },
    {
      type: 'change',
      value: 'A N',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
    {
      type: 'keyUp',
      key: 'Shift',
      target: 'main',
    },
    {
      type: 'change',
      value: 'A New ',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
    {
      type: 'keyDown',
      target: 'main',
      key: 'Shift',
    },
    {
      type: 'change',
      value: 'A New H',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
    {
      type: 'keyUp',
      key: 'Shift',
      target: 'main',
    },
    {
      type: 'click',
      target: 'main',
      selectors: [['#title-assert']],
      offsetY: 10,
      offsetX: 37.25,
      frame: [0],
    },
    {
      type: 'change',
      value: 'A New Hope',
      selectors: [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      target: 'main',
    },
  ],
}

export async function run(extension) {
  const runner = await createRunner(flow, extension)
  await runner.run()
}

if (process && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  await run()
}
