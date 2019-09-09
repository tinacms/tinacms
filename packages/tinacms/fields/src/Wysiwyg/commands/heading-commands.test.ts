import { deleteEmptyHeading, toggleHeader } from "./heading-commands"
import { PMTestHarness } from "@forestryio/prosemirror-test-utils"
import { defaultBlockSchema } from "../schema"

let { forDoc, doc, p, text, strong, em, heading } = new PMTestHarness(defaultBlockSchema)

describe("deleteEmptyHeading", () => {
  it("should delete an empty heading", () => {
    forDoc(doc(heading(1)))
      .withTextSelection(1)
      .apply(deleteEmptyHeading)
      .expect(doc(p()))
  })

  it("should not run if cursor is outside of a heading", () => {
    forDoc(doc(p(text("First Paragraph")), heading(1)))
      .withTextSelection(0)
      .shouldNotRun(deleteEmptyHeading)
  })

  it("should not run if cursor is in a non-empty heading", () => {
    forDoc(doc(heading(1, text("First Paragraph"))))
      .withTextSelection(1)
      .shouldNotRun(deleteEmptyHeading)
  })

  it("should not run if seletion is not a cursor", () => {
    forDoc(doc(heading(1)))
      .withTextSelection(1, 2)
      .shouldNotRun(deleteEmptyHeading)
  })
})

describe("toggleHeader", () => {
  let toggleH1 = toggleHeader(defaultBlockSchema.nodes.heading, { level: 1 }, defaultBlockSchema.nodes.paragraph, null)

  describe("toggleH1", () => {
    describe("with empty content", () => {
      it("should convert empty paragraph to empty h1", () => {
        forDoc(doc(p()))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1)))
      })

      it("should convert empty h1 to empty paragraph", () => {
        forDoc(doc(heading(1)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(p()))
      })

      it("should convert empty h2 to empty h1", () => {
        forDoc(doc(heading(2)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1)))
      })
    })

    describe("with plain text content", () => {
      const content = text("Hello World")

      it("should convert paragraph to h1 and keep plain text content", () => {
        forDoc(doc(p(content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1, content)))
      })

      it("should convert h1 to paragraph and keep plain text content", () => {
        forDoc(doc(heading(1, content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(p(content)))
      })

      it("should convert h2 to h1 and keep plain text content", () => {
        forDoc(doc(heading(2, content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1, content)))
      })
    })

    describe("marked up content", () => {
      const content = [text("Hello "), strong("stong"), em(" em "), text("world!")]

      it("should convert paragrah to h1 and keep marked up content", () => {
        forDoc(doc(p(...content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1, ...content)))
      })

      it("should convert h1 to paragraph and keep marked up content", () => {
        forDoc(doc(heading(1, ...content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(p(...content)))
      })

      it("should convert h2 to h1 and keep marked up content", () => {
        forDoc(doc(heading(2, ...content)))
          .withTextSelection(1)
          .apply(toggleH1)
          .expect(doc(heading(1, ...content)))
      })
    })
  })
})
