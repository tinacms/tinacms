import {
  getDynamicPath,
  BLOG_PATH,
  BLOG_INDEX_PATH,
  DOCS_PATH,
} from './getDynamicPath'

describe('getDynamicPath', () => {
  describe('with static path', () => {
    const STATIC_URL = '/teams'
    it('should return original path', () => {
      const url = getDynamicPath(STATIC_URL)
      expect(url).toEqual(STATIC_URL)
    })

    it('should return original path with root', () => {
      const url = getDynamicPath('/')
      expect(url).toEqual('/')
    })
  })
  describe('with dynamic path', () => {
    describe('- blog post', () => {
      it('should return blog path', () => {
        const url = getDynamicPath('/blog/heres-a-post')
        expect(url).toEqual(BLOG_PATH)
      })
    })
    describe('- blog index', () => {
      it('should return blog index path', () => {
        const url = getDynamicPath('/blog/page/3')
        expect(url).toEqual(BLOG_INDEX_PATH)
      })
    })
    describe('- docs', () => {
      it('should return docs path', () => {
        const url = getDynamicPath('/docs/sub/heres-a-doc')
        expect(url).toEqual(DOCS_PATH)
      })
    })
  })
})
