import type { EditorThemeClasses } from 'lexical'

const classNames = (...strings: string[]) => strings.join(' ')
const blockClasses = 'my-0'
/** prose sets a bold font, making bold marks impossible to see */
const headerClasses = 'font-normal'

export const exampleTheme: EditorThemeClasses = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  highlight: 'bg-blue-400',
  link: 'text-blue-500',
  // using prose for now
  heading: {
    h1: classNames(
      blockClasses,
      headerClasses,
      'text-4xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
    ),
    h2: classNames(
      blockClasses,
      headerClasses,
      'text-3xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
    ),
    h3: classNames(
      blockClasses,
      headerClasses,
      'text-2xl font-semibold mb-4 last:mb-0 mt-6 first:mt-0'
    ),
    h4: classNames(
      blockClasses,
      headerClasses,
      'text-xl font-bold mb-4 last:mb-0 mt-6 first:mt-0'
    ),
    h5: classNames(
      blockClasses,
      headerClasses,
      'text-lg font-bold mb-4 last:mb-0 mt-6 first:mt-0'
    ),
    h6: classNames(
      blockClasses,
      headerClasses,
      'text-base font-bold mb-4 last:mb-0 mt-6 first:mt-0'
    ),
  },
  paragraph: 'text-base font-normal mb-2 last:mb-0',
  quote: 'not-italic mb-4 last:mb-0 border-l-4 border-gray-200 pl-3',
  // code: "font-mono text-sm bg-gray-100 mb-4",
  // code: "PlaygroundEditorTheme__code",
  bold: 'font-bold',
  italic: 'font-italic',
  code: 'block bg-gray-100 rounded-sm shadow-sm font-mono text-xs leading-5 my-4 px-3 py-3 relative',
  codeHighlight: {
    atrule: 'text-[#07a]',
    attr: 'text-[#07a]',
    boolean: 'text-[#905]',
    builtin: 'text-[#690]',
    cdata: 'text-[slategray]',
    char: 'text-[#690]',
    class: 'text-[#dd4a68]',
    'class-name': 'text-[#dd4a68]',
    comment: 'text-[slategray]',
    constant: 'text-[#905]',
    deleted: 'text-[#905]',
    doctype: 'text-[slategray]',
    entity: 'text-[#9a6e3a]',
    function: 'text-[#dd4a68]',
    important: 'text-[#e90]',
    inserted: 'text-[#690]',
    keyword: 'text-[#07a]',
    namespace: 'text-[#e90]',
    number: 'text-[#905]',
    operator: 'text-[#9a6e3a]',
    prolog: 'text-[slategray]',
    property: 'text-[#905]',
    punctuation: 'text-[#999]',
    regex: 'text-[#e90]',
    selector: 'text-[#690]',
    string: 'text-[#690]',
    symbol: 'text-[#905]',
    tag: 'text-[#905]',
    url: 'text-[#9a6e3a]',
    variable: 'text-[#e90]',
  },
  text: {
    bold: 'font-bold',
    code: 'font-mono bg-gray-100',
    italic: 'italic',
    strikethrough: 'line-through',
    // subscript: 'PlaygroundEditorTheme__textSubscript',
    // superscript: 'PlaygroundEditorTheme__textSuperscript',
    // underline: 'PlaygroundEditorTheme__textUnderline',
    // underlineStrikethrough: 'PlaygroundEditorTheme__textUnderlineStrikethrough',
  },
  list: {
    // listitem: "",
    // listitemChecked: "",
    // listitemUnchecked: "",
    nested: {
      listitem: 'list-none',
    },
    ol: 'mb-2 pl-5',
    olDepth: [
      'list-decimal',
      'list-[upper-alpha]',
      'list-[lower-alpha]',
      'list-[upper-roman]',
      'list-[lower-roman]',
    ],
    ul: 'mb-2 pl-5',
    listitem: 'mb-2',
  },
  tableWrapper: 'overflow-hidden  max-w-full overflow-hidden ',
  table:
    'min-w-[100px] divide-y divide-gray-300 border-gray-200 border rounded-md block overflow-scroll',
  tableRow: 'divide-x divide-gray-200',
  tableCell: 'px-2 min-w-[200px] prose-p:m-2',
  tableCellHeader: 'bg-gray-100',
  tableAddColumns: 'PlaygroundEditorTheme__tableAddColumns',
  tableAddRows: 'PlaygroundEditorTheme__tableAddRows',
  tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer:
    'PlaygroundEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'PlaygroundEditorTheme__tableCellEditing',
  tableCellPrimarySelected: 'PlaygroundEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
  tableCellSelected: 'PlaygroundEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'PlaygroundEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'PlaygroundEditorTheme__tableCellResizeRuler',
  tableSelected: 'PlaygroundEditorTheme__tableSelected',
}
