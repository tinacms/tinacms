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
import React from 'react'
import { Transforms } from 'slate'
import styled from 'styled-components'
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_UL,
  MARK_BOLD,
  ToolbarButton,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  CodeBlockToolbarButton,
  BlockToolbarButton,
  ListToolbarButton,
  MarkToolbarButton,
  LinkToolbarButton,
  usePlateEditorRef,
  getPlatePluginType,
} from '@udecode/plate'
import {
  HeadingIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ImageIcon,
  QuoteIcon,
  OrderedListIcon,
  CodeIcon,
  UnorderedListIcon,
  UnderlineIcon,
  LinkIcon,
} from './icons'
import { PopupAdder } from './popup'
import { HeaderPopup } from './heading'
import { useCMS } from '../../../../../react-core'

const Wrapper = styled.div`
  z-index: 100;
  padding-top: 6px;
  position: relative;
  width: 100%;
`
const ToolbarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  background: var(--tina-color-grey-0);
  color: var(--tina-color-grey-10);
  margin: 0;
  border-radius: var(--tina-radius-small);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--tina-color-grey-2);
  margin-bottom: 14px;

  span[class*='ToolbarButton'],
  button {
    padding: 8px;
    border: 1px solid var(--tina-color-grey-2);
    width: auto;
    height: auto;
    border-left: none;
    margin: 0 0 -1px 0;
    flex-grow: 1;
    max-width: 3rem;
    transition: background 150ms ease-out;

    &:not(disabled):hover {
      background: var(--tina-color-grey-1);
    }

    svg {
      width: 20px;
      height: auto;
    }
  }
`
const EmbedButtunWrapper = styled.div`
  position: absolute;
  top: -34px;
  right: 0px;
`

export const ToolbarButtons = ({ name, templates }) => {
  const cms = useCMS()
  const editor = usePlateEditorRef(name)
  const popup = {
    showButton: true,
    onAdd: (template) => {
      Transforms.insertNodes(editor, [
        {
          type: template.inline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement',
          name: template.name,
          props: template.defaultItem,
          ordered: false,
          children: [
            {
              // @ts-ignore BaseEditor fix
              type: 'text',
              text: '',
            },
          ],
        },
      ])
    },
    templates: templates,
  }
  const [editorSelection, setEditorSelection] = React.useState(null)
  const [selectedMedia, setSelectedMedia] = React.useState(null)

  React.useEffect(() => {
    if (selectedMedia) {
      Transforms.insertNodes(
        editor,
        [
          {
            type: 'img',
            url: selectedMedia.src || selectedMedia.previewSrc,
            alt: '',
            caption: '',
            children: [
              {
                // @ts-ignore BaseEditor fix
                type: 'text',
                text: '',
              },
            ],
          },
        ],
        {
          at: editorSelection,
        }
      )
      setSelectedMedia(null)
    }
  }, [selectedMedia])

  return (
    <Wrapper>
      <ToolbarWrapper>
        <HeaderPopup icon={<HeadingIcon />}>
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H1)}
            icon={<strong>H1</strong>}
          />
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H2)}
            icon={<strong>H2</strong>}
          />
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H3)}
            icon={<strong>H3</strong>}
          />
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H4)}
            icon={<strong>H4</strong>}
          />
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H5)}
            icon={<strong>H5</strong>}
          />
          <BlockToolbarButton
            type={getPlatePluginType(editor, ELEMENT_H6)}
            icon={<strong>H6</strong>}
          />
        </HeaderPopup>
        <BlockToolbarButton
          type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
          icon={<QuoteIcon />}
        />
        <CodeBlockToolbarButton
          type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
          icon={<CodeIcon />}
        />
        <LinkToolbarButton icon={<LinkIcon />} />
        <ToolbarButton
          icon={<ImageIcon />}
          onMouseDown={() => {
            setEditorSelection(editor.selection)
            cms.media.open({
              allowDelete: true,
              onSelect: (media) => {
                setSelectedMedia(media)
              },
            })
          }}
        />
        <ListToolbarButton
          type={getPlatePluginType(editor, ELEMENT_UL)}
          icon={<UnorderedListIcon />}
        />
        <ListToolbarButton
          type={getPlatePluginType(editor, ELEMENT_OL)}
          icon={<OrderedListIcon />}
        />
        <MarkToolbarButton
          type={getPlatePluginType(editor, MARK_BOLD)}
          icon={<BoldIcon />}
        />
        <MarkToolbarButton
          type={getPlatePluginType(editor, MARK_ITALIC)}
          icon={<ItalicIcon />}
        />
        <MarkToolbarButton
          type={getPlatePluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
        />
        <MarkToolbarButton
          type={getPlatePluginType(editor, MARK_STRIKETHROUGH)}
          icon={<StrikethroughIcon />}
        />
      </ToolbarWrapper>
      <EmbedButtunWrapper>
        <PopupAdder {...popup} />
      </EmbedButtunWrapper>
    </Wrapper>
  )
}
