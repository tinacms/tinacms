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
      renderBefore={props => {
        if (!props.data || props.data.length < 1)
          return (
            <div style={{ position: "relative" }}>
              <AddBlockMenu insert={props.insert} index={props.index} visible />
            </div>
          )
      }}
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

const AddBlockMenu = styled(({ insert, index, ...styleProps }) => {
  const [open, setOpen] = React.useState(false)

  const clickHandler = event => {
    event.preventDefault()
    setOpen(open => !open)
  }

  useEffect(() => {
    document.addEventListener(
      "mouseup",
      event => {
        setOpen(false)
      },
      false
    )
  }, [])

  if (!insert) return null

  return (
    <div open={open} {...styleProps}>
      <AddBlockButton onClick={clickHandler} open={open} primary>
        <AddIcon /> Add Block
      </AddBlockButton>
      <BlocksMenu open={open}>
        <BlockOption
          onClick={() => {
            insert(
              { _template: "heading", ...heading.defaultItem },
              (index || -1) + 1
            )
            setOpen(false)
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
            setOpen(false)
          }}
        >
          Image
        </BlockOption>
      </BlocksMenu>
    </div>
  )
})`
  margin-bottom: 1rem;
`

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

const MoveButtons = styled.div`
  display: flex;

  > * {
    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: 2px solid rgba(255, 255, 255, 0.2);
    }
    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
`

const MoveButton = styled(IconButton)`
  width: 2.5rem;
`

const CloseButton = styled(IconButton)`
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const BlockOption = styled.button`
  font-family: "Inter", sans-serif;
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
          <MoveButtons>
            <MoveButton onClick={moveBlockUp} disabled={index === 0} primary>
              <ChevronUpIcon />
            </MoveButton>
            <MoveButton onClick={moveBlockDown} primary>
              <ChevronDownIcon />
            </MoveButton>
          </MoveButtons>
        )}
        {hasIndex && remove && (
          <CloseButton onClick={removeBlock} primary>
            <CloseIcon />
          </CloseButton>
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
  transition-delay: 300ms;

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
    opacity: 0.3;
    transition-delay: 0s;
    ${props =>
      props.active &&
      css`
        opacity: 1;
      `};
  }

  ${AddBlockMenu} {
    opacity: 1;
    pointer-events: all;
    transform: translate3d(-50%, 100%, 0);
    transition-delay: 0s;
  }

  ${BlocksActions} {
    opacity: 1;
    pointer-events: all;
    transform: translate3d(0, -100%, 0);
    transition-delay: 0s;
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
    transition-delay: 300ms;
  }

  &:hover {
    ${BlockFocusOutlineVisible}
  }

  ${AddBlockMenu} {
    position: absolute;
    bottom: -1.5rem;
    left: 50%;
    transform: translate3d(-50%, calc(100% - 2rem), 0);
    width: auto;
    pointer-events: none;
    opacity: 0;
    z-index: 1500;
    transition: all 150ms ease-out;
    transition-delay: 300ms;
    margin: 0;

    &:after {
      content: "";
      display: block;
      position: absolute;
      bottom: 0;
      left: -1.5rem;
      z-index: -1;
      width: calc(100% + 3rem);
      height: calc(100% + 1.5rem);
    }
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
