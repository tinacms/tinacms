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

import * as React from 'react'
import { Block } from './block'
import { InlineField } from '../inline-field'
import { AddBlockMenu } from './add-block-menu'
import { useInlineForm } from '../inline-form'
import styled from 'styled-components'
import { InlineFieldContext } from '../inline-field-context'
import { useCMS } from '@einsteinindustries/tinacms'

export interface InlineBlocksProps {
  name: string
  blocks: {
    [key: string]: Block
  }
  className?: string
  direction?: 'vertical' | 'horizontal'
  /**
   * object will be spread to every block child element
   */
  itemProps?: {
    [key: string]: any
  }
  min?: number
  max?: number
  components?: {
    Container?: React.FunctionComponent<BlocksContainerProps>
  }
  children?: React.ReactNode | null
}

export interface BlocksContainerProps {
  className?: string
  children?: React.ReactNode
}

const DefaultContainer = (props: BlocksContainerProps) => {
  return <div {...props} />
}

export interface InlineBlocksActions {
  count: number
  insert(index: number, data: any): void
  duplicate(sourceIndex: number, targetIndex: number): void
  move(from: number, to: number): void
  remove(index: number): void
  blocks: {
    [key: string]: Block
  }
  direction: 'vertical' | 'horizontal'
  min?: number
  max?: number
}

export const InlineBlocksContext = React.createContext<InlineBlocksActions | null>(
  null
)

export function useInlineBlocks() {
  const inlineBlocksContext = React.useContext(InlineBlocksContext)

  if (!inlineBlocksContext) {
    throw new Error('useInlineBlocks must be within an InlineBlocksContext')
  }

  return inlineBlocksContext
}

export function InlineBlocks({
  name,
  blocks,
  className = '',
  direction = 'vertical',
  itemProps,
  min,
  max,
  components = {},
  children = null,
}: InlineBlocksProps) {
  const cms = useCMS()
  const { setFocussedField } = useInlineForm()

  return (
    <InlineField name={name}>
      {({ input, form }) => {
        const name = input.name
        const allData: { _template: string }[] = input.value || []

        const move = (from: number, to: number) => {
          form.mutators.move(name, from, to)
          setFocussedField(`${name}.${to}`)
        }

        const remove = (index: number) => {
          form.mutators.remove(name, index)

          const isOnlyItem = input.value.length === 1
          const isLastItem = input.value.length - 1 === index

          if (isOnlyItem) {
            setFocussedField('')
          } else if (isLastItem) {
            setFocussedField(`${input.name}.${index - 1}`)
          } else {
            setFocussedField(`${input.name}.${index}`)
          }
        }

        const insert = (index: number, block: any) => {
          form.mutators.insert(name, index, block)
          setFocussedField(`${name}.${index}`)
        }

        const duplicate = (sourceIndex: number, targetIndex: number) => {
          form.mutators.insert(name, targetIndex, allData[sourceIndex])
          setFocussedField(`${name}.${targetIndex}`)
        }

        const Container = components.Container || DefaultContainer

        return (
          <Container className={className}>
            <InlineBlocksContext.Provider
              value={{
                insert,
                duplicate,
                move,
                remove,
                blocks,
                count: allData.length,
                direction,
                min,
                max,
              }}
            >
              {allData.length < 1 && cms.enabled && (
                <BlocksEmptyState>
                  <AddBlockMenu
                    addBlock={block => insert(0, block)}
                    blocks={blocks}
                  />
                </BlocksEmptyState>
              )}

              {allData.map((data, index) => {
                const Block = blocks[data._template]

                if (!Block) {
                  console.warn('Unrecognized Block of type:', data._template)
                  return null
                }

                const blockName = `${input.name}.${index}`

                return (
                  <InlineBlock
                    itemProps={itemProps}
                    key={index}
                    index={index}
                    name={blockName}
                    data={data}
                    block={Block}
                  />
                )
              })}

              {children}
            </InlineBlocksContext.Provider>
          </Container>
        )
      }}
    </InlineField>
  )
}

/**
 * InlineBlock
 */
export interface InlineBlockProps {
  index: number
  name: string
  data: any
  block: Block
  itemProps?: {
    [key: string]: any
  }
}

export function InlineBlock({
  name,
  data,
  block,
  index,
  itemProps,
}: InlineBlockProps) {
  return React.useMemo(
    () => (
      <InlineFieldContext.Provider value={{ name, ...block }}>
        <block.Component data={data} name={name} index={index} {...itemProps} />
      </InlineFieldContext.Provider>
    ),
    [
      name,
      // h/t Dan Abramov https://twitter.com/dan_abramov/status/1104414272753487872?s=20
      JSON.stringify(data),
      block,
      index,
      JSON.stringify(itemProps),
    ]
  )
}

export const BlocksEmptyState = styled.div`
  padding: var(--tina-padding-small);
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
