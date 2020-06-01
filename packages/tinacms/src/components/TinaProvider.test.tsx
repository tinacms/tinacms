import { render } from '@testing-library/react'
import React from 'react'
import { TinaProvider, CMS } from '../../build'
import { TinaCMS } from '..'

describe('TinaProvider', () => {
  describe('when passed an instance of CMS', () => {
    it('throws no error', () => {
      render(<TinaProvider cms={new CMS()} />)
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

      expect(t).toThrowError('Prop cms is not an instance of CMS.')
    })
  })
})
