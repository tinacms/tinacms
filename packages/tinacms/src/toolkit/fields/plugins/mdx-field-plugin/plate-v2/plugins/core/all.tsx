import {
  createAlignPlugin,
  createAutoformatPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createDeletePlugin,
  createDeserializeCsvPlugin,
  createDeserializeDocxPlugin,
  createDeserializeMdPlugin,
  createExitBreakPlugin,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHorizontalRulePlugin,
  createImagePlugin,
  createIndentPlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLineHeightPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTabbablePlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTogglePlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TOGGLE,
  ELEMENT_TR,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate'
import { createCaptionPlugin } from '@udecode/plate-caption'
import {
  createPlugins,
  PlateElement,
  PlateLeaf,
  type RenderAfterEditable,
} from '@udecode/plate-common'
import { createDndPlugin } from '@udecode/plate-dnd'
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
} from '@udecode/plate-excalidraw'

import { createJuicePlugin } from '@udecode/plate-juice'
import {
  createColumnPlugin,
  ELEMENT_COLUMN_GROUP,
  ELEMENT_COLUMN,
} from '@udecode/plate-layout'
import { createBlockSelectionPlugin } from '@udecode/plate-selection'
import { BlockquoteElement } from '../../components/blockquote-element'
import { CodeBlockElement } from '../../components/code-block-element'
import { CodeLeaf } from '../../components/code-leaf'
import { CodeLineElement } from '../../components/code-line-element'
import { CodeSyntaxLeaf } from '../../components/code-syntax-leaf'
import { ColumnElement } from '../../components/column-element'
import { ColumnGroupElement } from '../../components/column-group-element'
import { ExcalidrawElement } from '../../components/excalidraw-element'
import { HeadingElement } from '../../components/heading-element'
import { HighlightLeaf } from '../../components/highlight-leaf'
import { HrElement } from '../../components/hr-element'
import { ImageElement } from '../../components/image-element'
import { KbdLeaf } from '../../components/kbd-leaf'
import { LinkElement } from '../../components/link-element'
import { LinkFloatingToolbar } from '../../components/link-floating-toolbar'
import { ListElement } from '../../components/list-element'
import { MediaEmbedElement } from '../../components/media-embed-element'
import { MentionElement } from '../../components/mention-element'
// import { MentionInputElement } from '../../components/mention-input-element'
import { ParagraphElement } from '../../components/paragraph-element'
import { withPlaceholders } from '../../components/placeholder'
import {
  TableCellElement,
  TableCellHeaderElement,
} from '../../components/table-cell-element'
import { TodoListElement } from '../../components/todo-list-element'
import { ToggleElement } from '../../components/toggle-element'
import { withDraggables } from '../../components/with-draggables'
import { createEmojiPlugin } from '@udecode/plate-emoji'
import { withProps } from '@udecode/cn'
import { TableElement } from '../../components/table-element'
import { TableRowElement } from '../../components/table-row-element'

export const AllPlugins = createPlugins(
  [
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHorizontalRulePlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
    }),
    createImagePlugin(),
    createCaptionPlugin({
      options: {
        pluginKeys: [
          // ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED
        ],
      },
    }),
    createTodoListPlugin(),
    createExcalidrawPlugin(),
    createTogglePlugin(),
    createColumnPlugin(),
    createListPlugin(),
    createMediaEmbedPlugin(),
    createMentionPlugin(),
    createTablePlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
    createHighlightPlugin(),
    createKbdPlugin(),
    createAlignPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
          ],
        },
      },
    }),
    createIndentPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK
          ],
        },
      },
    }),
    createLineHeightPlugin({
      inject: {
        props: {
          defaultNodeValue: 1.5,
          validNodeValues: [1, 1.2, 1.5, 2, 3],
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
          ],
        },
      },
    }),
    createAutoformatPlugin({
      options: {
        rules: [
          // Usage: https://platejs.org/docs/autoformat
        ],
        enableUndoOnDelete: true,
      },
    }),
    createBlockSelectionPlugin({
      options: {
        sizes: {
          top: 0,
          bottom: 0,
        },
      },
    }),
    createDndPlugin({
      options: { enableScroller: true },
    }),
    createEmojiPlugin(),
    createExitBreakPlugin({
      options: {
        rules: [
          {
            hotkey: 'mod+enter',
          },
          {
            hotkey: 'mod+shift+enter',
            before: true,
          },
          {
            hotkey: 'enter',
            query: {
              start: true,
              end: true,
              // allow: KEYS_HEADING,
            },
            relative: true,
            level: 1,
          },
        ],
      },
    }),
    createNodeIdPlugin(),
    createResetNodePlugin({
      options: {
        rules: [
          // Usage: https://platejs.org/docs/reset-node
        ],
      },
    }),
    createDeletePlugin(),
    createSoftBreakPlugin({
      options: {
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [
                // ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD
              ],
            },
          },
        ],
      },
    }),
    createTabbablePlugin(),
    createTrailingBlockPlugin({
      options: { type: ELEMENT_PARAGRAPH },
    }),
    createDeserializeDocxPlugin(),
    createDeserializeCsvPlugin(),
    createDeserializeMdPlugin(),
    createJuicePlugin(),
  ],
  {
    components: withDraggables(
      withPlaceholders({
        [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
        [ELEMENT_CODE_BLOCK]: CodeBlockElement,
        [ELEMENT_CODE_LINE]: CodeLineElement,
        [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
        [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
        [ELEMENT_HR]: HrElement,
        [ELEMENT_IMAGE]: ImageElement,
        [ELEMENT_LINK]: LinkElement,
        [ELEMENT_TOGGLE]: ToggleElement,
        [ELEMENT_COLUMN_GROUP]: ColumnGroupElement,
        [ELEMENT_COLUMN]: ColumnElement,
        [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
        [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
        [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
        [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
        [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
        [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
        [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
        [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
        [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
        [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
        [ELEMENT_MENTION]: MentionElement,
        // [ELEMENT_MENTION_INPUT]: MentionInputElement,
        [ELEMENT_PARAGRAPH]: ParagraphElement,
        [ELEMENT_TABLE]: TableElement,
        [ELEMENT_TR]: TableRowElement,
        [ELEMENT_TD]: TableCellElement,
        [ELEMENT_TH]: TableCellHeaderElement,
        [ELEMENT_TODO_LI]: TodoListElement,
        [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
        [MARK_CODE]: CodeLeaf,
        [MARK_HIGHLIGHT]: HighlightLeaf,
        [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
        [MARK_KBD]: KbdLeaf,
        [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
        [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
        [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
        [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
      })
    ),
  }
)
