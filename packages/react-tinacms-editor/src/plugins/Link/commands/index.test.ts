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
import {
  removeLinkBeingEdited,
  updateLinkBeingEdited,
  insertLinkToFile,
} from '.'

const { forDoc, doc, p, link, text } = new PMTestHarness(defaultSchema)

describe('insertLinkToFile', () => {
  it('should replace text with new link', () => {
    forDoc(doc(p(text('one'))))
      .withTextSelection(0, 4)
      .apply(insertLinkToFile, 'http://www.google.ca')
      .expect(
        doc(
          p(
            link('www.google.ca', {
              href: 'http://www.google.ca',
              title: 'www.google.ca',
            })
          )
        )
      )
  })

  it('should use friendly display name', () => {
    forDoc(doc(p(text('one'))))
      .withTextSelection(0, 4)
      .apply(insertLinkToFile, 'http://www.google.ca/nice_name.jpg')
      .expect(
        doc(
          p(
            link('nice_name.jpg', {
              href: 'http://www.google.ca/nice_name.jpg',
              title: 'nice_name.jpg',
            })
          )
        )
      )
  })

  it('should remove spaces from title', () => {
    forDoc(doc(p(text('one'))))
      .withTextSelection(0, 4)
      .apply(insertLinkToFile, 'http://www.google.ca/nice%20name.jpg')
      .expect(
        doc(
          p(
            link('nice name.jpg', {
              href: 'http://www.google.ca/nice%20name.jpg',
              title: 'nice name.jpg',
            })
          )
        )
      )
  })
})

/**
 * removeLinkBeingEdited(state, dispatch)
 */
describe('removeLinkBeingEdited', () => {
  it('should remove a link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(removeLinkBeingEdited)
      .expect(doc(p(text('one'))))
  })
})

/**
 * updateLinkBeingEdited(state, dispatchi, attrs)
 */
describe('updateLinkBeingEdited', () => {
  it('should set href on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(updateLinkBeingEdited, {
        href: '/one-edit',
      })
      .expect(doc(p(link('one', { href: '/one-edit' }))))
  })

  it('should set title on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(updateLinkBeingEdited, {
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
