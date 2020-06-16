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

import { PMTestHarness } from '../../../test-utils'
import { defaultSchema } from '../../../test-utils/test-schema'
import { insertImage, insertImageList, alignImage, removeImage } from '.'

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

describe('insertImageList', () => {
  it('should insert list of images with the given src', () => {
    //         01
    forDoc(doc(p()))
      .withTextSelection(1)
      .apply(insertImageList, ['test1.jpg', 'test2.jpg'])
      .expect(doc(p(image({ src: 'test1.jpg' }), image({ src: 'test2.jpg' }))))
  })

  it('should replace selection with the image list', () => {
    //         0       1234567890123
    forDoc(doc(p(text('one two three'))))
      .withTextSelection(5, 8)
      .apply(insertImageList, ['test1.jpg', 'test2.jpg'])
      .expect(
        doc(
          p(
            text('one '),
            image({ src: 'test1.jpg' }),
            image({ src: 'test2.jpg' }),
            text(' three')
          )
        )
      )
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
