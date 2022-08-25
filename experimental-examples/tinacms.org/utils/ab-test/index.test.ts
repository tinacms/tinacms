import { getABTestResult } from './index'
import { getBucket } from './getBucket'

jest.mock('./getBucket')

const homeAbTest = {
  testId: 'home',
  href: '/',
  variants: [
    {
      testId: 'b',
      href: '/home/b',
    },
  ],
}

const mockGetBucket = jest.fn().mockImplementation(() => 'b')
describe('getABTestResult', () => {
  beforeEach(() => {
    ;(getBucket as any).mockImplementation(mockGetBucket)
  })

  describe('withValidVariant', () => {
    describe('without cookie', () => {
      test('uses random value', () => {
        const result = getABTestResult(homeAbTest, undefined)
        expect(result.bucket).toEqual('b')
        expect(result.url).toEqual('/home/b')
      })

      test('uses root file, and all page variants', () => {
        const result = getABTestResult(homeAbTest, undefined)
        expect(mockGetBucket).toHaveBeenCalledWith(['home', 'b'])
      })
    })
    describe('with cookie', () => {
      test('uses value from cookie', () => {
        const result = getABTestResult(homeAbTest, 'home')
        expect(result.bucket).toEqual('home')
        expect(result.url).toEqual('/')
      })
    })
  })

  describe('withInValidVariant', () => {
    describe('with cookie', () => {
      test('return root file', () => {
        const result = getABTestResult(homeAbTest, 'invalidValue')
        expect(result.bucket).toEqual('home')
        expect(result.url).toEqual('/')
      })
    })
  })
})
