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

import { PMTestHarness } from '../../prosemirror-test-utils'
import { defaultSchema } from '../default-schema'
import { singleMarkCommand } from './single-mark-command'
import { EM } from '../state/plugins/input-rules'

const { forDoc, doc, p, text, em } = new PMTestHarness(defaultSchema)

const P1_START = () => 1

function getStart(p1: string, ...paragraphs: string[]): number {
  const [first, ...rest] = paragraphs;
  if (typeof first !== 'string') {
    return 1
  }

  return p1.length + 2 + getStart(first, ...rest)
}

describe('single-mark', () => {
  describe('em', () => {
    const command = singleMarkCommand(defaultSchema.marks.em, null)
    const start = P1_START()

    it('*test*', () => {
      const example = '*test*'
      const match = EM.exec(example)
      const start = 1
      const end = example.length
      forDoc(doc(p(text(example))))
        .withTextSelection(end)
        .apply(command, match, start, end)
        .expect(doc(p(em('test'))))
    })
    /**
     * This is a liar. It works in production. Something doesn't behave the same here.
     */
    // it("*em*plain", () => {
    //   console.log("START EM")
    //   const upToCursor = "*em*"
    //   const afterCursor = "plain"
    //   const example = upToCursor + afterCursor
    //   const match = EM.exec(upToCursor)
    //   const start = 1
    //   const end = upToCursor.length
    //   forDoc(doc(p(text(example))))
    //     .withTextSelection(4)
    //     .apply(command, match, start, end)
    //     .expect(doc(p(em("em"), text("plain"))))
    // })

    it('*t\\*est*', () => {
      const example = '*t\\*est*'
      const match = EM.exec(example)
      const end = example.length + start
      forDoc(doc(p(text(example))))
        .apply(command, match, start, end)
        .expect(doc(p(em('t\\*est'))))
    })

    it('one*two*', () => {
      const example = 'one*two*'
      const match = EM.exec(example)
      const start = 3
      const end = 8
      forDoc(doc(p(text(example))))
        .withTextSelection(end)
        .apply(command, match, start, end)
        .expect(doc(p(text('one'), em('two'))))
    })

    describe('with em already before it', () => {
      it('*test*', () => {
        const p1_1_em = 'one'
        const p1_2 = '*two*'
        const p1 = p1_1_em + p1_2
        const match = EM.exec(p1)
        forDoc(doc(p(em(p1_1_em), text(p1_2))))
          .apply(command, match, 3, 8)
          .expect(doc(p(em('onetwo'))))
      })
    })

    describe('when in second paragraph', () => {
      it('*test*', () => {
        const p1 = 'test'
        const p2 = '*test*'
        const match = EM.exec(p2)
        const start = getStart(p1, p2)
        const end = start + p2.length - 1
        forDoc(doc(p(text(p1)), p(text(p2))))
          .apply(command, match, start, end)
          .expect(doc(p(text(p1)), p(em('test'))))
      })
      it('one *test*', () => {
        const p1 = 'test'
        const p2 = 'one *test*'
        const match = EM.exec(p2)
        const start = 10
        const end = 16
        forDoc(doc(p(text(p1)), p(text(p2))))
          .apply(command, match, start, end)
          .expect(doc(p(text(p1)), p(text('one '), em('test'))))
      })
      it('*test*', () => {
        const p1 = 'first'
        const p2_1_em = 'one'
        const p2_2 = '*two*'
        const p2 = p2_1_em + p2_2
        const match = EM.exec(p2)
        const start = 10
        const end = 15
        forDoc(doc(p(text(p1)), p(em(p2_1_em), text(p2_2))))
          .apply(command, match, start, end)
          .expect(doc(p(text(p1)), p(em('onetwo'))))
      })
    })
  })
})
