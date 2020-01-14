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
import React, { useCallback, useEffect, ReactNode, ReactNodeArray } from 'react'
import { TinaField, Form, BlockTemplate } from 'tinacms'
import styled, { css } from 'styled-components'
import {
  Button as TinaButton,
  IconButton,
  radius,
  color,
  shadow,
  font,
} from '@tinacms/styles'
import {
  CloseIcon,
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@tinacms/icons'

import { Blocks, BlocksProps } from './blocks'

export interface BlocksRenderProps {
  insert(obj: any, index: number): void
  move(from: number, to: number): void
  remove(index: number): void
  data: any[]
  templates: BlockTemplate[]
}
export interface InlineBlocksProps extends BlocksProps {
  templates: BlockTemplate[]
  renderBefore(props: BlocksRenderProps): any // TODO: Proper types
}

export function InlineBlocks({
  name,
  form,
  renderBefore,
  templates,
  ...props
}: InlineBlocksProps) {
  const EditableBlocks = React.useMemo(
    () =>
      createEditableBlocks({
        form,
        components: props.components,
        templates,
        renderBefore,
      }),
    [form, props.components]
  )
  return (
    <TinaField name={name} Component={EditableBlocks}>
      <Blocks name={name} form={form} {...props} />
    </TinaField>
  )
}

function createEditableBlocks({
  form,
  components,
  templates,
  renderBefore,
}: {
  form: Form
  components: InlineBlocksProps['components']
  templates: BlockTemplate[]
  renderBefore: any
}) {
  return function(props: any) {
    return (
      <EditableBlocks
        name={props.input.name}
        components={components}
        templates={templates}
        data={props.input.value}
        form={form}
        renderBefore={renderBefore}
      />
    )
  }
}

function EditableBlocks({
  name,
  data,
  components,
  templates,
  form,
  renderBefore,
}: InlineBlocksProps) {
  data = data || []
  components = components || {}

  const move = useCallback(
    (from: number, to: number) => {
      form.mutators.move(name, from, to)
    },
    [form, name]
  )

  const remove = React.useCallback(
    (index: number) => {
      form.mutators.remove(name, index)
    },
    [form, name]
  )

  const insert = React.useCallback(
    (block: any, index: number) => {
      form.mutators.insert(name, index, block)
    },
    [form, name]
  )

  return (
    <>
      {renderBefore && renderBefore({ insert, move, remove, data, templates })}
      {data.map((data, index) => {
        const Component = components[data._template]

        return (
          <Component
            form={form}
            data={data}
            index={index}
            name={name}
            move={move}
            remove={remove}
            insert={insert}
            templates={templates}
          />
        )
      })}
    </>
  )
}

/*
 ** Block Wrapper Component
 */

interface BlockWrapperProps extends InlineBlocksProps {
  insert(obj: any, index: number): void
  index: number
  move(from: number, to: number): void
  remove(index: number): void
  data: any[]
  children: ReactNode | ReactNodeArray
  templates: BlockTemplate[]
}

export const BlockWrapper = ({
  insert,
  index,
  remove,
  move,
  templates,
  children,
  data,
  ...styleProps
}: BlockWrapperProps) => {
  const [active, setActive] = React.useState(false)
  const clickHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    setActive(true)
  }

  useEffect(() => {
    const setInactive = () => setActive(false)

    document.addEventListener('mouseup', setInactive, false)

    return () => document.removeEventListener('mouseup', setInactive)
  }, [])

  if (!insert) return children

  return (
    <BlockFocusOutline {...styleProps} onClick={clickHandler} active={active}>
      <BlocksActions
        insert={insert}
        index={index}
        move={move}
        remove={remove}
        template={templates.find(template => template.type)}
      />
      {children}
      <AddBlockMenu insert={insert} index={index} templates={templates} />
    </BlockFocusOutline>
  )
}

/*
 ** Add Block Menu Component
 */

export const AddBlockMenu = styled(
  ({ insert, index, templates, ...styleProps }) => {
    const [open, setOpen] = React.useState(false)

    const clickHandler = (event: React.MouseEvent) => {
      event.preventDefault()
      setOpen(open => !open)
    }

    useEffect(() => {
      const setInactive = () => setOpen(false)
      document.addEventListener('mouseup', setInactive, false)
      return () => document.removeEventListener('mouseup', setInactive)
    }, [])

    if (!insert) return null

    templates = templates || []

    return (
      <div open={open} {...styleProps}>
        <AddBlockButton onClick={clickHandler} open={open} primary>
          <AddIcon /> Add Block
        </AddBlockButton>
        <BlocksMenu open={open}>
          {templates.map(({ label, type, defaultItem }: BlockTemplate) => (
            <BlockOption
              onClick={() => {
                insert({ _template: type, ...defaultItem }, (index || -1) + 1)
                setOpen(false)
              }}
            >
              {label}
            </BlockOption>
          ))}
          {/* TODO: No templates? Link to docs or something. */}
        </BlocksMenu>
      </div>
    )
  }
)`
  margin-bottom: 16px;
`

const AddBlockButton = styled(TinaButton)`
  font-family: 'Inter', sans-serif;
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

interface BlocksUIProps {
  open?: boolean
  active?: boolean
}

const BlocksMenu = styled.div<BlocksUIProps>`
  min-width: 192px;
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
  box-shadow: ${shadow('big')};
  background-color: white;
  overflow: hidden;
  z-index: 100;
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(-50%, 48px, 0) scale3d(1, 1, 1);
    `};
`

const BlockOption = styled.button`
  font-family: 'Inter', sans-serif;
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: 0 12px;
  height: 40px;
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
  width: 40px;
`

const CloseButton = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
  }
`

const BlocksActions = styled(
  ({ index, insert, remove, move, template, ...styleProps }) => {
    const hasIndex = index || index === 0
    const moveBlockUp = (event: React.MouseEvent) => {
      event.stopPropagation()
      move(index, index - 1)
    }
    const moveBlockDown = (event: React.MouseEvent) => {
      event.stopPropagation()
      move(index, index + 1)
    }
    const removeBlock = (event: React.MouseEvent) => {
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
  top: -24px;
  right: -20px;
  transform: translate3d(0, calc(-100% + 16px), 0);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transition-delay: 300ms;

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    z-index: -1;
    width: calc(100% + 24px);
    height: calc(100% + 24px);
  }

  > * {
    margin: 4px;
  }
`

const BlockFocusOutlineVisible = css<BlocksUIProps>`
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

const BlockFocusOutline = styled.div<BlocksUIProps>`
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
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
    bottom: -24px;
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
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: -96px;
      z-index: -1;
      width: calc(100% + 12rem);
      height: calc(100% + 24px);
      clip-path: polygon(0 0, 100% 0, calc(100% - 96px) 100%, 96px 100%);
    }
  }

  ${props => props.active && BlockFocusOutlineVisible};
`
