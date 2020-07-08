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

import * as React from 'react'
import { Block } from './block'
import { InlineField } from '../inline-field'
import { useState } from 'react'
import { AddBlockMenu } from './add-block-menu'
import { useInlineForm } from '../inline-form'
import styled from 'styled-components'
import { InlineFieldContext } from '../inline-field-context'
import { useCMS } from 'tinacms'
import { Droppable } from 'react-beautiful-dnd'

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
}

export interface InlineBlocksActions {
  count: number
  insert(index: number, data: any): void
  move(from: number, to: number): void
  remove(index: number): void
  blocks: {
    [key: string]: Block
  }
  activeBlock: number | null
  setActiveBlock: any
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
  className,
  direction = 'vertical',
  itemProps,
  min,
  max,
}: InlineBlocksProps) {
  const cms = useCMS()
  const [activeBlock, setActiveBlock] = useState(-1)
  const { setFocussedField } = useInlineForm()

  return (
    <InlineField name={name}>
      {({ input, form }) => {
        const name = input.name
        const allData: { _template: string }[] = input.value || []

        const move = (from: number, to: number) => {
          const movement = to - from
          setActiveBlock(activeBlock => activeBlock + movement)
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

        return (
          <Droppable droppableId={name} type={name} direction={direction}>
            {provider => (
              <div ref={provider.innerRef} className={className}>
                {
                  <InlineBlocksContext.Provider
                    value={{
                      insert,
                      move,
                      remove,
                      blocks,
                      count: allData.length,
                      activeBlock,
                      setActiveBlock,
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
                        console.warn(
                          'Unrecognized Block of type:',
                          data._template
                        )
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
                    {provider.placeholder}
                  </InlineBlocksContext.Provider>
                }
              </div>
            )}
          </Droppable>
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
  return (
    <InlineFieldContext.Provider value={{ name, ...block }}>
      <block.Component data={data} index={index} {...itemProps} />
    </InlineFieldContext.Provider>
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
