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

import {
  removeLinkBeingEdited,
  stopEditingLink,
  updateLinkBeingEdited,
  startEditingLink,
  insertLinkToFile,
} from './link-commands'
import { PMTestHarness } from '../../prosemirror-test-utils'
import { defaultSchema } from '../default-schema'

const { forDoc, shouldNotRun, doc, p, link, text } = new PMTestHarness(
  defaultSchema
)

/**
 * stopEditingLink(state, dispatch)
 */

describe('stopEditingLink', () => {
  it('should not run on an empty doc', () => {
    shouldNotRun(stopEditingLink, doc(p()))
  })

  it("should not change a link that's not being edited", () => {
    shouldNotRun(stopEditingLink, doc(p(link('test', { href: '/test' }))))
  })

  it("should set editing to 'editing' on a link", () => {
    forDoc(doc(p(link('test', { href: '/test', editing: 'editing' }))))
      .apply(stopEditingLink)
      .expect(doc(p(link('test', { href: '/test', editing: '' }))))
  })

  it("should set editing to '' on all links", () => {
    forDoc(
      doc(
        p(
          link('one', { href: '/one', editing: 'editing' }),
          link('two', { href: '/two', editing: 'editing' })
        )
      )
    )
      .apply(stopEditingLink)
      .expect(
        doc(
          p(
            link('one', { href: '/one', editing: '' }),
            link('two', { href: '/two', editing: '' })
          )
        )
      )
  })

  it("should set editing creating to '' on a link", () => {
    forDoc(
      doc(
        p(
          link('test', {
            href: '/test',
            editing: 'editing',
            creating: 'creating',
          })
        )
      )
    )
      .apply(stopEditingLink)
      .expect(
        doc(p(link('test', { href: '/test', editing: '', creating: '' })))
      )
  })

  it("should set editing and creating to '' on all links", () => {
    forDoc(
      doc(
        p(
          link('one', {
            href: '/one',
            editing: 'editing',
            creating: 'creating',
          }),
          link('two', { href: '/two', editing: 'editing', creating: '' })
        )
      )
    )
      .apply(stopEditingLink)
      .expect(
        doc(
          p(
            link('one', { href: '/one', editing: '', creating: '' }),
            link('two', { href: '/two', editing: '', creating: '' })
          )
        )
      )
  })
})

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
              editing: '',
              creating: '',
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
              editing: '',
              creating: '',
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
              editing: '',
              creating: '',
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
    forDoc(doc(p(link('one', { href: '/one', editing: 'editing' }))))
      .apply(removeLinkBeingEdited)
      .expect(doc(p(text('one'))))
  })

  it("should not remove a link that's not being edited", () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .apply(removeLinkBeingEdited)
      .expect(doc(p(link('one', { href: '/one' }))))
  })

  it('should remove a link being edited no matter where it is', () => {
    forDoc(
      doc(
        p(
          link('one', { href: '/one' }),
          link('two', { href: '/two', editing: 'editing' })
        )
      )
    )
      .apply(removeLinkBeingEdited)
      .expect(doc(p(link('one', { href: '/one' }), text('two'))))
  })
})

/**
 * updateLinkBeingEdited(state, dispatchi, attrs)
 */
describe('updateLinkBeingEdited', () => {
  it('should set href on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one', editing: 'editing' }))))
      .apply(updateLinkBeingEdited, {
        href: '/one-edit',
        editing: 'editing',
        creating: '',
      })
      .expect(doc(p(link('one', { href: '/one-edit', editing: 'editing' }))))
  })

  it('should set title on link being edited', () => {
    forDoc(doc(p(link('one', { href: '/one', editing: 'editing' }))))
      .apply(updateLinkBeingEdited, {
        href: '/one',
        editing: 'editing',
        creating: '',
        title: 'Link Title',
      })
      .expect(
        doc(
          p(
            link('one', {
              href: '/one',
              editing: 'editing',
              title: 'Link Title',
            })
          )
        )
      )
  })
})

/**
 * startEditingLink(state, dispatch)
 */
describe('startEditingLink', () => {
  it('should not run whene Selection is not on a link', () => {
    forDoc(doc(p()))
      .withTextSelection(2)
      .shouldNotRun(startEditingLink)
  })

  it('should not run if the Selection is not a cursor', () => {
    forDoc(doc(p(link('one', { href: '/one' }))))
      .withTextSelection(3, 5)
      .shouldNotRun(startEditingLink)
  })

  describe('if selection is a cursor', () => {
    it('should run if you click at the start of a link', () => {
      forDoc(doc(p(link('one', { href: '/one', editing: '', creating: '' }))))
        .withTextSelection(2)
        .apply(startEditingLink)
        .expect(doc(p(link('one', { href: '/one', editing: 'editing' }))))
    })

    it('should run if you click in the middle of the link', () => {
      forDoc(doc(p(link('one', { href: '/one', editing: '', creating: '' }))))
        .withTextSelection(3)
        .apply(startEditingLink)
        .expect(doc(p(link('one', { href: '/one', editing: 'editing' }))))
    })
  })
})
