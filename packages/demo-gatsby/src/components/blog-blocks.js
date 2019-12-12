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
import React, { useEffect } from "react"
import { TinaField } from "tinacms"
import {
  Button as TinaButton,
  IconButton,
  radius,
  color,
  shadow,
  font,
} from "@tinacms/styles"
import {
  CloseIcon,
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@tinacms/icons"
import { InlineBlocks } from "react-tinacms-blocks"
import { PlainTextInput } from "./plain-text-input"
import styled, { css } from "styled-components"

export function BlogBlocks({ form, data }) {
  return (
    <InlineBlocks
      form={form}
      name="rawFrontmatter.blocks"
      data={data}
      components={BLOCK_COMPONENTS}
      renderBefore={props => (
        <div style={{ position: "relative" }}>
          <AddBlockMenu insert={props.insert} index={props.index} />
        </div>
      )}
    />
  )
}

/**
 * Blocks Components
 */
const BLOCK_COMPONENTS = {
  heading: EditableHeading,
  image: EditableImage,
}

const AddBlockMenu = ({ insert, index }) => {
  const [visible, setVisible] = React.useState(false)

  if (!insert) return null

  return (
    <AddBlockMenuWrapper visible={visible}>
      <AddBlockButton
        onClick={() => setVisible(visible => !visible)}
        open={visible}
        primary
      >
        <AddIcon /> Add Block
      </AddBlockButton>
      <BlocksMenu open={visible}>
        <BlockOption
          onClick={() => {
            insert(
              { _template: "heading", ...heading.defaultItem },
              (index || -1) + 1
            )
            setVisible(false)
          }}
        >
          Heading
        </BlockOption>
        <BlockOption
          onClick={() => {
            insert(
              { _template: "image", ...image.defaultItem },
              (index || -1) + 1
            )
            setVisible(false)
          }}
        >
          Image
        </BlockOption>
      </BlocksMenu>
    </AddBlockMenuWrapper>
  )
}

const AddBlockButton = styled(TinaButton)`
  font-family: "Inter", sans-serif;
  display: flex;
  align-items: center;
  margin: 0 auto;

  &:focus {
    outline: none !important;
  }

  svg {
    height: 70%;
    width: auto;
    margin-right: 0.5em;
    transition: all 150ms ease-out;
  }

  ${props =>
    props.open &&
    css`
      svg {
        transform: rotate(45deg);
      }
    `};
`

const AddBlockMenuWrapperVisible = css`
  opacity: 1;
`

const AddBlockMenuWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  transform: translate3d(0, 50%, 0);
  z-index: 100;
  opacity: 0;
  transition: all 150ms ease-out;

  &:hover {
    ${AddBlockMenuWrapperVisible}
  }

  &:after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${color.primary()};
    transform: translate3d(0, -50%, 0);
    z-index: -1;
  }

  ${props =>
    props.visible &&
    css`
      ${AddBlockMenuWrapperVisible}
    `};
`

const BlocksMenu = styled.div`
  min-width: 12rem;
  border-radius: ${radius()};
  border: 1px solid ${color.grey(2)};
  display: block;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 50% 0;
  box-shadow: ${shadow("big")};
  background-color: white;
  overflow: hidden;
  z-index: 100;

  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(-50%, 3rem, 0) scale3d(1, 1, 1);
    `};
`

const BlockOption = styled.button`
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: 0 0.75rem;
  height: 2.5rem;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color.primary()};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`

const BlocksActions = styled(
  ({ index, insert, remove, move, ...styleProps }) => {
    console.log(insert)
    const hasIndex = index || index === 0
    const moveBlockUp = event => {
      event.stopPropagation()
      move(index, index - 1)
    }
    const moveBlockDown = event => {
      event.stopPropagation()
      move(index, index + 1)
    }
    const removeBlock = event => {
      event.stopPropagation()
      remove(index)
    }
    return (
      <div {...styleProps}>
        {hasIndex && move && (
          <IconButton onClick={moveBlockUp} disabled={index === 0} primary>
            <ChevronUpIcon />
          </IconButton>
        )}
        {hasIndex && move && (
          <IconButton onClick={moveBlockDown} primary>
            <ChevronDownIcon />
          </IconButton>
        )}
        {hasIndex && remove && (
          <IconButton onClick={removeBlock} primary>
            <CloseIcon />
          </IconButton>
        )}
      </div>
    )
  }
)`
  display: flex;
  position: absolute;
  z-index: 1000;
  top: -1.5rem;
  right: -1.25rem;
  transform: translate3d(0, calc(-100% + 1rem), 0);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;

  &:after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    z-index: -1;
    width: calc(100% + 1.5rem);
    height: calc(100% + 1.5rem);
  }

  > * {
    margin: 0.25rem;
  }
`

const BlockFocusOutlineVisible = css`
  &:after {
    opacity: 1;
  }

  ${BlocksActions} {
    opacity: 1;
    pointer-events: all;
    transform: translate3d(0, -100%, 0);
  }
`

const BlockFocusOutline = styled.div`
  position: relative;

  &:after {
    content: "";
    display: block;
    position: absolute;
    left: -1rem;
    top: -1rem;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid ${color.primary()};
    border-radius: ${radius()};
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: all 150ms ease-out;
  }

  &:hover {
    ${BlockFocusOutlineVisible}
  }

  ${props => props.active && BlockFocusOutlineVisible};
`

const BlockWrapper = ({
  insert,
  index,
  remove,
  move,
  children,
  ...styleProps
}) => {
  const [active, setActive] = React.useState(false)
  const blockRef = React.createRef()
  const clickHandler = event => {
    event.preventDefault()
    console.log(blockRef)
    setActive(true)
  }

  useEffect(() => {
    document.addEventListener(
      "mouseup",
      event => {
        setActive(false)
      },
      false
    )
  }, [])

  if (!insert) return children

  return (
    <BlockFocusOutline
      {...styleProps}
      onClick={clickHandler}
      active={active}
      ref={blockRef}
    >
      <BlocksActions
        insert={insert}
        index={index}
        move={move}
        remove={remove}
      />
      {children}
      <AddBlockMenu insert={insert} index={index} />
    </BlockFocusOutline>
  )
}

function EditableHeading(props) {
  return (
    <BlockWrapper {...props}>
      <h1>
        <TinaField
          name={`${props.name}.${props.index}.text`}
          Component={PlainTextInput}
        >
          {props.data.text}
        </TinaField>
      </h1>
    </BlockWrapper>
  )
}

// Image Block Component
function EditableImage(props) {
  return (
    <BlockWrapper {...props}>
      <TinaField
        name={`${props.name}.${props.index}.src`}
        Component={PlainTextInput}
      />
      <TinaField
        name={`${props.name}.${props.index}.alt`}
        Component={PlainTextInput}
      />
      <img {...props.data} />
    </BlockWrapper>
  )
}

/**
 * HEADING BLOCK
 */
const heading = {
  label: "Heading",
  defaultItem: {
    text: "",
  },
  itemProps: block => ({
    label: `${block.text}`,
  }),
  fields: [{ name: "text", component: "text", label: "Text" }],
}

/**
 * IMAGE BLOCK
 */
// Image Block Template
const image = {
  label: "Image",
  defaultItem: {
    text: "",
  },
  itemProps: block => ({
    key: `${block.src}`,
    label: `${block.alt}`,
  }),
  fields: [
    { name: "src", component: "text", label: "Source URL" },
    { name: "alt", component: "text", label: "Alt Text" },
  ],
}
