/**

Copyright 2019 Forestry.io Inc

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

import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { render } from '@testing-library/react'

import { Dismissible } from './Dismissible'

const ESC_KEY = new KeyboardEvent('keydown', { keyCode: '27' } as any)
const CLICK = new MouseEvent('click')

let component: any = null
let onDismiss: any = null

beforeEach(() => {
  onDismiss = jest.fn()
})

afterEach(() => {
  component.unmount()
})

describe('when document.body is clicked', () => {
  describe('and click=true', () => {
    it('calls onDismiss', () => {
      component = render(<Dismissible click onDismiss={onDismiss} />)

      document.body.dispatchEvent(CLICK)

      expect(onDismiss).toHaveBeenCalled()
    })

    it('calls event.stopPropgation()', () => {
      component = render(<Dismissible click onDismiss={onDismiss} />)
      CLICK.stopPropagation = jest.fn()

      document.body.dispatchEvent(CLICK)

      expect(CLICK.stopPropagation).toHaveBeenCalled()
    })

    describe('when disabled', () => {
      it('does not call onDismiss', () => {
        component = render(<Dismissible disabled click onDismiss={onDismiss} />)

        document.body.dispatchEvent(CLICK)

        expect(onDismiss).not.toHaveBeenCalled()
      })

      it('does not call event.stopPropgation()', () => {
        component = render(<Dismissible disabled click onDismiss={onDismiss} />)
        CLICK.stopPropagation = jest.fn()

        document.body.dispatchEvent(CLICK)

        expect(CLICK.stopPropagation).not.toHaveBeenCalled()
      })
    })
  })
  describe('and click=false', () => {
    it('does not call onDismiss', () => {
      component = render(<Dismissible click={false} onDismiss={onDismiss} />)

      document.body.dispatchEvent(CLICK)

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

    it('calls event.stopPropagation()', () => {
      component = render(<Dismissible escape onDismiss={onDismiss} />)
      ESC_KEY.stopPropagation = jest.fn()

      document.dispatchEvent(ESC_KEY)

      expect(ESC_KEY.stopPropagation).toHaveBeenCalled()
    })
    describe('if disabled', () => {
      it('does not call onDismiss', () => {
        component = render(<Dismissible escape onDismiss={onDismiss} />)

        document.dispatchEvent(ESC_KEY)

        expect(onDismiss).toHaveBeenCalled()
      })

      it('does not call event.stopPropagation()', () => {
        component = render(<Dismissible escape onDismiss={onDismiss} />)
        ESC_KEY.stopPropagation = jest.fn()

        document.dispatchEvent(ESC_KEY)

        expect(ESC_KEY.stopPropagation).toHaveBeenCalled()
      })
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
  document.body.removeEventListener = jest.fn()

  component.unmount()

  expect(document.body.removeEventListener).toHaveBeenCalled()
})
