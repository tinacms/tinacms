import { render } from '@testing-library/react'
import React from 'react'
import { TinaCMSProvider, INVALID_CMS_ERROR } from './tina-cms-provider'
import { TinaCMS } from '@toolkit/tina-cms'
import { CMS } from '@toolkit/core'
import { describe, it, expect } from 'vitest'

describe('TinaCMSProvider', () => {
  describe('when passed an instance of CMS', () => {
    it('throws error', () => {
      const t = () => {
        render(<TinaCMSProvider cms={new CMS() as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
  describe('when passed an instance of TinaCMS', () => {
    it('throws no error', () => {
      render(<TinaCMSProvider cms={new TinaCMS()} />)
    })
  })
  describe('when passed an empty object', () => {
    it('throws an Error', () => {
      const t = () => {
        render(<TinaCMSProvider cms={{} as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
})
