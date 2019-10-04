import { PMTestHarness } from '../../prosemirror-test-utils'
import { insertHr } from './horizontal-rule-commands'
import { defaultSchema } from '../default-schema'

const { forDoc, doc, p, text, hr } = new PMTestHarness(defaultSchema)

describe('insertHr', () => {
  it('should insert an hr at the cursor', () => {
    //         0       12345
    forDoc(doc(p(text('test'))))
      .withTextSelection(3)
      .apply(insertHr)
      .expect(doc(p(text('te')), hr(), p(text('st'))))
  })

  it('should replace selection with HR', () => {
    //         0       12345
    forDoc(doc(p(text('test'))))
      .withTextSelection(2, 4) // [2, 4)
      .apply(insertHr)
      .expect(doc(p(text('t')), hr(), p(text('t'))))
  })
})
