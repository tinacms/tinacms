/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { updateAnchorBeingEdited, removeAnchorBeingEdited } from '.'

const { forDoc, doc, p, link, text } = new PMTestHarness(defaultSchema)

/**
 * removeLinkBeingEdited(state, dispatch)
 */
describe('removeLinkBeingEdited', () => {
  it('should remove a link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(removeAnchorBeingEdited)
      .expect(doc(p(text('one'))))
  })
})

/**
 * updateLinkBeingEdited(state, dispatchi, attrs)
 */
describe('updateLinkBeingEdited', () => {
  it('should set href on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(updateAnchorBeingEdited, {
        href: '/one-edit',
      })
      .expect(doc(p(link('one', { href: '/one-edit' }))))
  })

  it('should set title on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(updateAnchorBeingEdited, {
        href: '/one',
        title: 'Link Title',
      })
      .expect(
        doc(
          p(
            link('one', {
              href: '/one',
              title: 'Link Title',
            })
          )
        )
      )
  })
})
