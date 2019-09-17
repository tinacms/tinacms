import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { render } from '@testing-library/react'

import { Dismissible } from './Dismissible'

declare let window: any

const ESC_KEY = new KeyboardEvent('keydown', { keyCode: '27' } as any)
const CLICK = new MouseEvent('click')

let component: any = null
let onDismiss: any = null

beforeEach(() => {
  window.__app_container = document.createElement('div')
  onDismiss = jest.fn()
})

afterEach(() => {
  component.unmount()
})

describe('when window.__app_container is clicked', () => {
  describe('and click=true', () => {
    it('calls onDismiss', () => {
      component = render(<Dismissible click onDismiss={onDismiss} />)

      window.__app_container.dispatchEvent(CLICK)

      expect(onDismiss).toHaveBeenCalled()
    })

    it('calls event.stopPropgation()', () => {
      component = render(<Dismissible click onDismiss={onDismiss} />)
      CLICK.stopPropagation = jest.fn()

      window.__app_container.dispatchEvent(CLICK)

      expect(CLICK.stopPropagation).toHaveBeenCalled()
    })
  })
  describe('and click=false', () => {
    it('does not call onDismiss', () => {
      component = render(<Dismissible click={false} onDismiss={onDismiss} />)

      window.__app_container.dispatchEvent(CLICK)

      expect(onDismiss).not.toHaveBeenCalled()
    })
  })
})

it.skip("should not call onDismiss when it's own area is clicked", () => {
  component = render(<Dismissible onDismiss={onDismiss} />)
  const area = findDOMNode(component.ref('area'))

  area!.dispatchEvent(CLICK)

  expect(onDismiss).not.toHaveBeenCalled()
})

describe('pressing ESC', () => {
  describe('when escape is true', () => {
    it('calls onDismiss', () => {
      component = render(<Dismissible escape onDismiss={onDismiss} />)

      document.dispatchEvent(ESC_KEY)

      expect(onDismiss).toHaveBeenCalled()
    })

    it('calls event.stopPropagation() and ESC is pressed', () => {
      component = render(<Dismissible escape onDismiss={onDismiss} />)
      ESC_KEY.stopPropagation = jest.fn()

      document.dispatchEvent(ESC_KEY)

      expect(ESC_KEY.stopPropagation).toHaveBeenCalled()
    })
  })

  describe('when escape is false', () => {
    it('does not call onDismiss', () => {
      component = render(<Dismissible escape={false} onDismiss={onDismiss} />)

      document.dispatchEvent(ESC_KEY)

      expect(onDismiss).not.toHaveBeenCalled()
    })
  })
})

it.skip('should unmount', () => {
  component = render(<Dismissible escape onDismiss={onDismiss} />)
  window.__app_container.removeEventListener = jest.fn()

  component.unmount()

  expect(window.__app_container.removeEventListener).toHaveBeenCalled()
})
