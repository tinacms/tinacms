import { defaultBlockSchema } from "./default-block-schema"
import { DOMTranslator } from "../Translator"

const translator = DOMTranslator.fromSchema(defaultBlockSchema)

describe("default schema", () => {
  describe("doc is empty or only spaces", () => {
    expectDoc("<p></p>").given(["", " ", "    ", "                               "])
  })

  describe("plain text", () => {
    expectDoc("<p>Text</p>").given("Text")
  })

  describe("extra whitespace", () => {
    expectDoc("<p>Text</p>").given(["Text    ", "    Text", "    Text    "])

    expectDoc("<p>One Two</p>").given(["One  Two", " One  Two", "One  Two ", "  One  Two "])
  })

  describe("Headings", () => {
    expectDoc("<h1>Text</h1>").given([`<h1>Text</h1>`, `<h1 class="">Text</h1>`])
    expectDoc("<h2>Text</h2>").given([`<h2>Text</h2>`])
    expectDoc("<h3>Text</h3>").given([`<h3>Text</h3>`])
    expectDoc("<h4>Text</h4>").given([`<h4>Text</h4>`])
    expectDoc("<h5>Text</h5>").given([`<h5>Text</h5>`])
    expectDoc("<h6>Text</h6>").given([`<h6>Text</h6>`])

    // Classes
    expectDoc(`<h1 class="a-class">Text</h1>`).given([
      `<h1 class="a-class">Text</h1>`,
      `<h1 forestry-class="a-class">Text</h1>`,
    ])

    // IDs
    expectDoc(`<h2 id="an-id">Text</h2>`).given([`<h2 id="an-id">Text</h2>`])
  })

  describe("HTML Comments", () => {
    expectDoc(`<p>Text</p>`).given([
      // Strip Comments
      `Text<!-- Comment -->`,
    ])
  })

  describe("Bold Text", () => {
    expectDoc("<p><strong>Text</strong></p>").given([
      `<strong>Text</strong>`,

      `<b>Text</b>`,
      `<b style="font-weight: lighter">Text</b>`,
      `<b style="font-weight: lighter;">Text</b>`,

      // `Font-weight: bold` is strong, `;` or not
      `<span style="font-weight: bold">Text</span>`,
      `<span style="font-weight: bold;">Text</span>`,
      `<span style="font-weight: bolder">Text</span>`,
      `<span style="font-weight: bolder;">Text</span>`,

      // strip `id` attribute
      `<strong id="an-id">Text</strong>`,

      // Strip duplicates
      `<strong><strong>Text</strong></strong>`,
      `<b><strong>Text</strong></b>`,
      `<b><span style="font-weight: bold">Text</span></b>`,

      // Merge Siblings
      `<b>Te</b><strong>xt</strong>`,
      `<b>Te</b><b>xt</b>`,

      // Strip empty tags
      `<b>Text</b><strong></strong><span style="font-weight: bold"></span><b />`,
    ])

    // Pasting from Google Docs sometimes wraps non-bold text with this input, so it should be ignored.
    expectDoc("<p>Text</p>").given(`<b style="font-weight: normal">Text</b>`)
  })

  // Not supported by Markdown
  // describe("Underlined Text", () => {
  //   expectDoc(`<p><span style="text-decoration: underline;">Text</span></p>`).given([
  //     `<span style="text-decoration: underline;">Text</span>`,
  //     `<span style="text-decoration: underline">Text</span>`,
  //     `<span style="text-decoration: underline; color: red;Text">Text</span>`,
  //
  //     // Merge Siblings
  //     `<span style="text-decoration: underline">Te</span><span style="text-decoration: underline">xt</span>`,
  //   ])
  // })

  describe("U Tag", () => {
    expectDoc("<p>Text</p>").given([
      // Not Supported
      `<u>Text</u>`,
    ])
  })

  describe("Code", () => {
    expectDoc(`<p><code>console.log('Text')</code></p>`).given([`<code>console.log('Text')</code>`])
  })

  describe("Em", () => {
    expectDoc(`<p><em>Text</em></p>`).given([
      `<em>Text</em>`,

      `<i>Text</i>`,

      `<span style="font-style: italic;">Text</span>`,
      `<span style="font-style: italic">Text</span>`,
    ])
  })

  describe("Links", () => {
    expectDoc(`<p><a href="http://google.com">Text</a></p>`).given([
      `<a href="http://google.com">Text</a>`,
      `<a href="http://google.com" editing="editing">Text</a>`,
      `<a href="http://google.com" creating="creating">Text</a>`,
    ])

    expectDoc([
      `<p><a href="http://google.com" title="Text">Text</a></p>`,
      `<p><a title="Text" href="http://google.com">Text</a></p>`,
    ]).given([`<a href="http://google.com" title="Text">Text</a>`])
  })

  describe("Hard Breaks", () => {
    expectDoc(`<p>One<br>Two</p>`).given([`One<br/>Two`, `One<br>Two`])
  })

  // describe("Span Class Attributes", () => {
  //   expectDoc(`<p></p>`).given([
  //     `<span class="one" />`,
  //     `<span class="one"></span>`,
  //   ])
  //
  //   expectDoc(`<p><span class="one">Text</span></p>`).given([
  //     `<span class="one">Text</span>`,
  //   ])
  //
  //   // Custom Bold – Tag order is not important.
  //   expectDoc([
  //     `<p><strong><span class="one">Text</span></strong></p>`,
  //     `<p><span class="one"><strong>Text</strong></span></p>`,
  //   ]).given([
  //     `<span class="one" style="font-weight: bold">Text</span>`,
  //   ])
  // })
})

interface Scenario {
  input: string
  description: string
}

type Rule = Scenario | string
function expectDoc(expect: string | string[]) {
  return {
    given(inputDocs: Rule[] | Rule) {
      const inputs: Rule[] = Array.isArray(inputDocs) ? inputDocs : [inputDocs]
      const expectation = Array.isArray(expect) ? expect.join(" OR ") : expect
      describe(`Expect: ${expectation}`, () => {
        inputs.forEach(rule => {
          const description = (<Scenario>rule).description ? (<Scenario>rule).description : `Given: ${rule}`
          const input = (<Scenario>rule).input ? (<Scenario>rule).input : <string>rule

          it(description, whenParsing(input).expect(expect))
        })
      })
    },
  }
}

function whenParsing(input: string) {
  return {
    expect(output: string | string[]) {
      const o = Array.isArray(output) ? output : [output]
      return () => expect(o).toContain(read(input))
    },
  }
}

function read(document: string): string {
  return translator.stringFromNode(translator.nodeFromString(document))
}
