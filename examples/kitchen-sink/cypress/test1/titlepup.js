const puppeteer = require('puppeteer') // v13.0.0 or later

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const timeout = 5000
  page.setDefaultTimeout(timeout)

  {
    const targetPage = page
    await targetPage.setViewport({ width: 1237, height: 984 })
  }
  {
    const targetPage = page
    const promises = []
    promises.push(targetPage.waitForNavigation())
    await targetPage.goto('http://localhost:3000/admin/index.html#/preview')
    await Promise.all(promises)
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    await element.click({
      offset: {
        x: 204,
        y: 24.7109375,
      },
    })
  }
  {
    const targetPage = page
    await targetPage.keyboard.down('Shift')
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A')
    }
  }
  {
    const targetPage = page
    await targetPage.keyboard.up('Shift')
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A ')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A ')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A ')
    }
  }
  {
    const targetPage = page
    await targetPage.keyboard.down('Shift')
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A N')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A N')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A N')
    }
  }
  {
    const targetPage = page
    await targetPage.keyboard.up('Shift')
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A New ')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A New ')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A New ')
    }
  }
  {
    const targetPage = page
    await targetPage.keyboard.down('Shift')
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A New H')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A New H')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A New H')
    }
  }
  {
    const targetPage = page
    await targetPage.keyboard.up('Shift')
  }
  {
    const targetPage = page
    let frame = targetPage.mainFrame()
    frame = frame.childFrames()[0]
    const element = await waitForSelectors([['#title-assert']], frame, {
      timeout,
      visible: true,
    })
    await scrollIntoViewIfNeeded(element, timeout)
    await element.click({
      offset: {
        x: 37.25,
        y: 10,
      },
    })
  }
  {
    const targetPage = page
    const element = await waitForSelectors(
      [
        [
          '[data-test=form\\:content\\/films\\/a-new-hope\\.md] > div > div > div > div:nth-child(2) > input',
        ],
      ],
      targetPage,
      { timeout, visible: true }
    )
    await scrollIntoViewIfNeeded(element, timeout)
    const type = await element.evaluate((el) => el.type)
    if (['select-one'].includes(type)) {
      await element.select('A New Hope')
    } else if (
      [
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email',
      ].includes(type)
    ) {
      await element.type('A New Hope')
    } else {
      await element.focus()
      await element.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, 'A New Hope')
    }
  }

  await browser.close()

  async function waitForSelectors(selectors, frame, options) {
    for (const selector of selectors) {
      try {
        return await waitForSelector(selector, frame, options)
      } catch (err) {
        console.error(err)
      }
    }
    throw new Error(
      'Could not find element for selectors: ' + JSON.stringify(selectors)
    )
  }

  async function scrollIntoViewIfNeeded(element, timeout) {
    await waitForConnected(element, timeout)
    const isInViewport = await element.isIntersectingViewport({ threshold: 0 })
    if (isInViewport) {
      return
    }
    await element.evaluate((element) => {
      element.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'auto',
      })
    })
    await waitForInViewport(element, timeout)
  }

  async function waitForConnected(element, timeout) {
    await waitForFunction(async () => {
      return await element.getProperty('isConnected')
    }, timeout)
  }

  async function waitForInViewport(element, timeout) {
    await waitForFunction(async () => {
      return await element.isIntersectingViewport({ threshold: 0 })
    }, timeout)
  }

  async function waitForSelector(selector, frame, options) {
    if (!Array.isArray(selector)) {
      selector = [selector]
    }
    if (!selector.length) {
      throw new Error('Empty selector provided to waitForSelector')
    }
    let element = null
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i]
      if (element) {
        element = await element.waitForSelector(part, options)
      } else {
        element = await frame.waitForSelector(part, options)
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('>>'))
      }
      if (i < selector.length - 1) {
        element = (
          await element.evaluateHandle((el) =>
            el.shadowRoot ? el.shadowRoot : el
          )
        ).asElement()
      }
    }
    if (!element) {
      throw new Error('Could not find element: ' + selector.join('|'))
    }
    return element
  }

  async function waitForElement(step, frame, timeout) {
    const count = step.count || 1
    const operator = step.operator || '>='
    const comp = {
      '==': (a, b) => a === b,
      '>=': (a, b) => a >= b,
      '<=': (a, b) => a <= b,
    }
    const compFn = comp[operator]
    await waitForFunction(async () => {
      const elements = await querySelectorsAll(step.selectors, frame)
      return compFn(elements.length, count)
    }, timeout)
  }

  async function querySelectorsAll(selectors, frame) {
    for (const selector of selectors) {
      const result = await querySelectorAll(selector, frame)
      if (result.length) {
        return result
      }
    }
    return []
  }

  async function querySelectorAll(selector, frame) {
    if (!Array.isArray(selector)) {
      selector = [selector]
    }
    if (!selector.length) {
      throw new Error('Empty selector provided to querySelectorAll')
    }
    let elements = []
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i]
      if (i === 0) {
        elements = await frame.$$(part)
      } else {
        const tmpElements = elements
        elements = []
        for (const el of tmpElements) {
          elements.push(...(await el.$$(part)))
        }
      }
      if (elements.length === 0) {
        return []
      }
      if (i < selector.length - 1) {
        const tmpElements = []
        for (const el of elements) {
          const newEl = (
            await el.evaluateHandle((el) =>
              el.shadowRoot ? el.shadowRoot : el
            )
          ).asElement()
          if (newEl) {
            tmpElements.push(newEl)
          }
        }
        elements = tmpElements
      }
    }
    return elements
  }

  async function waitForFunction(fn, timeout) {
    let isActive = true
    setTimeout(() => {
      isActive = false
    }, timeout)
    while (isActive) {
      const result = await fn()
      if (result) {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error('Timed out')
  }
})()
