import { render } from '@testing-library/react'
import React from 'react'
import { TinaProvider, INVALID_CMS_ERROR } from './TinaProvider'
import { TinaCMS } from '../tina-cms'
import { CMS } from '@tinacms/core'

describe('TinaProvider', () => {
  describe('when passed an instance of CMS', () => {
    it('throws error', () => {
      const t = () => {
        render(<TinaProvider cms={new CMS() as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
  describe('when passed an instance of TinaCMS', () => {
    it('throws no error', () => {
      render(<TinaProvider cms={new TinaCMS()} />)
    })
  })
  describe('when passed an empty object', () => {
    it('throws an Error', () => {
      const t = () => {
        render(<TinaProvider cms={{} as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
})
