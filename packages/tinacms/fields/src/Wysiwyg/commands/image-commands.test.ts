import { PMTestHarness } from '../../prosemirror-test-utils'
import { insertImage, alignImage, removeImage } from './image-commands'
import { defaultSchema } from '../default-schema'

const { forDoc, doc, p, text, image } = new PMTestHarness(defaultSchema)

describe('insertImage', () => {
  it('should insert an image with the given src', () => {
    //         01
    forDoc(doc(p()))
      .withTextSelection(1)
      .apply(insertImage, 'test.jpg')
      .expect(doc(p(image({ src: 'test.jpg' }))))
  })

  it('should replace selection with the image', () => {
    //         0       1234567890123
    forDoc(doc(p(text('one two three'))))
      .withTextSelection(5, 8)
      .apply(insertImage, 'test.jpg')
      .expect(doc(p(text('one '), image({ src: 'test.jpg' }), text(' three'))))
  })
})

describe('alignImage', () => {
  it("should set align to 'left' ", () => {
    //         0 1
    forDoc(doc(p(image({ src: 'test.jpg' }))))
      .apply(alignImage, 1, 'left')
      .expect(doc(p(image({ src: 'test.jpg', align: 'left' }))))
  })

  it('should set align to null if given alignment is the current alignment', () => {
    forDoc(doc(p(image({ src: 'test.jpg', align: 'left' }))))
      .apply(alignImage, 1, 'left')
      .expect(doc(p(image({ src: 'test.jpg' }))))
  })

  it('should not run if the given position is not an image', () => {
    forDoc(doc(p(text('test')))).shouldNotRun(alignImage, 2, 'left')
  })
})

describe('removeImage', () => {
  it('should remove the image at the given position', () => {
    forDoc(doc(p(image({ src: 'test.jpg' }))))
      .apply(removeImage, 1)
      .expect(doc(p()))
  })

  it('should not run if the given position is not an image', () => {
    forDoc(doc(p(text('test')))).shouldNotRun(removeImage, 2)
  })
})
