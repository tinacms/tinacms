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
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarList,
  ToolbarMark,
  ToolbarLink,
  useStoreEditorRef,
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
import { Button } from '../../../../../styles'
import { PopupAdder } from './popup'
import { HeaderPopup } from './heading'
import { useCMS } from '../../../../../react-core'

const Wrapper = styled.div`
  display: grid;
  position: relative;
  width: 100%;
  grid-template-columns: 12;
  .slate-ToolbarButton-active {
    svg,
    strong {
      color: var(--tina-color-primary-light);
    }
  }
`
const Basic = styled.div`
  grid-column-start: 1;
  grid-column-end: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 372px;
  background: #fff;
  padding: 10px;
  margin: 12px 0px 4px;
  border-radius: 4px;
  border: 1px solid #efefef;
`
const MdxIcon = styled.div`
  position: absolute;
  top: -28px;
  right: 0px;
  svg {
    width: 20px;
    height: 20px;
  }
`
const Embed = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ToolbarButtons = ({ name, templates }) => {
  // const editor = useStoreEditorRef(useEventEditorId('focus'));

  const cms = useCMS()
  const editor = useStoreEditorRef(name)
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
            url: selectedMedia.previewSrc,
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
    <ToolbarWrapper>
      <div>
        <Wrapper>
          <Basic>
            <HeaderPopup icon={<HeadingIcon />}>
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H1)}
                icon={<strong>H1</strong>}
              />
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H2)}
                icon={<strong>H2</strong>}
              />
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H3)}
                icon={<strong>H3</strong>}
              />
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H4)}
                icon={<strong>H4</strong>}
              />
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H5)}
                icon={<strong>H5</strong>}
              />
              <ToolbarElement
                type={getPlatePluginType(editor, ELEMENT_H6)}
                icon={<strong>H6</strong>}
              />
            </HeaderPopup>
            <ToolbarElement
              type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
              icon={<QuoteIcon />}
            />
            <ToolbarCodeBlock
              type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
              icon={<CodeIcon />}
            />
            <ToolbarLink
              icon={<LinkIcon />}
              // getLinkUrl={async () => {
              //   console.log('get it!')
              //   return 'http://example.com'
              // }}
            />
            {/* <ToolbarImage icon={<ImageIcon />} /> */}
            {/* <ImageButton /> */}
            <ToolbarButton
              icon={<ImageIcon />}
              onMouseDown={() => {
                setEditorSelection(editor.selection)
                // console.log(editor.selection)
                cms.media.open({
                  allowDelete: true,
                  onSelect: (media) => {
                    setSelectedMedia(media)
                  },
                })
              }}
            />
            <ToolbarList
              type={getPlatePluginType(editor, ELEMENT_UL)}
              icon={<UnorderedListIcon />}
            />
            <ToolbarList
              type={getPlatePluginType(editor, ELEMENT_OL)}
              icon={<OrderedListIcon />}
            />
            <ToolbarMark
              type={getPlatePluginType(editor, MARK_BOLD)}
              icon={<BoldIcon />}
            />
            <ToolbarMark
              type={getPlatePluginType(editor, MARK_ITALIC)}
              icon={<ItalicIcon />}
            />
            <ToolbarMark
              type={getPlatePluginType(editor, MARK_UNDERLINE)}
              icon={<UnderlineIcon />}
            />
            <ToolbarMark
              type={getPlatePluginType(editor, MARK_STRIKETHROUGH)}
              icon={<StrikethroughIcon />}
            />
          </Basic>
          <MdxIcon>
            <PopupAdder
              {...popup}
              icon={
                <Button primary small>
                  <Embed>
                    Embed <ArrowDownIcon />
                  </Embed>
                </Button>
              }
            />
          </MdxIcon>
        </Wrapper>
      </div>{' '}
    </ToolbarWrapper>
  )
}

function ArrowDownIcon(props) {
  const title = props.title || 'keyboard arrow down'

  return (
    <svg
      height="24"
      width="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill="none">
        <path
          d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

const ToolbarWrapper = styled.div`
  z-index: 100;
  & > div {
    display: flex;
    flex-wrap: wrap;
  }
`
