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
import { liftBlockquote } from '.'

const {
  forDoc,
  doc,
  p,
  orderedList,
  bulletList,
  text,
  blockquote,
} = new PMTestHarness(defaultSchema)

describe('liftBlockquote', () => {
  it('should do nothing to paragraph', () => {
    const content = p(text('one'))
    forDoc(doc(content))
      .withTextSelection(2, 4)
      .apply(liftBlockquote)
      .expect(doc(content))
  })

  it('should do nothing to ordered list', () => {
    const content = p(orderedList(text('one')))

    forDoc(doc(content))
      .withTextSelection(2, 5)
      .apply(liftBlockquote)
      .expect(doc(content))
  })

  it('should do nothing to bullet list', () => {
    const content = p(bulletList(text('one')))

    forDoc(doc(content))
      .withTextSelection(2, 5)
      .apply(liftBlockquote)
      .expect(doc(content))
  })

  it('should remove blockquotes', () => {
    const content = p(blockquote(text('one')))

    forDoc(doc(content))
      .withTextSelection(2, 5)
      .apply(liftBlockquote)
      .expect(doc(p(text('one'))))
  })
})
