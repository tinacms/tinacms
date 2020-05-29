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

export interface InlineBlocksProps {
  name: string
  blocks: {
    [key: string]: Block
  }
}

export interface InlineBlocksActions {
  count: number
  insert(index: number, data: any): void
  move(froom: number, to: number): void
  remove(index: number): void
  blocks: {
    [key: string]: Block
  }
  activeBlock: number | null
  setActiveBlock: any
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

export function InlineBlocks({ name, blocks }: InlineBlocksProps) {
  const [activeBlock, setActiveBlock] = useState(-1)
  const { status } = useInlineForm()

  return (
    <InlineField name={name}>
      {({ input, form }) => {
        const name = input.name
        const allData: { _template: string }[] = input.value || []

        const move = (from: number, to: number) => {
          const movement = to - from
          setActiveBlock(activeBlock => activeBlock + movement)
          form.mutators.move(name, from, to)
        }

        const remove = (index: number) => {
          form.mutators.remove(name, index)
        }

        const insert = (index: number, block: any) => {
          form.mutators.insert(name, index, block)
        }

        return (
          <InlineBlocksContext.Provider
            value={{
              insert,
              move,
              remove,
              blocks,
              count: allData.length,
              activeBlock,
              setActiveBlock,
            }}
          >
            {allData.length < 1 && status === 'active' && (
              <BlocksEmptyState>
                <AddBlockMenu
                  addBlock={block => insert(1, block)}
                  templates={Object.entries(blocks).map(
                    ([, block]) => block.template
                  )}
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
                  // NOTE: Supressing warnings, but not helping with render perf
                  key={index}
                  index={index}
                  name={blockName}
                  data={data}
                  block={Block}
                />
              )
            })}
          </InlineBlocksContext.Provider>
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
}

export function InlineBlock({ name, data, block, index }: InlineBlockProps) {
  return (
    <InlineFieldContext.Provider value={{ name, ...block }}>
      <block.Component data={data} index={index} />
    </InlineFieldContext.Provider>
  )
}

const BlocksEmptyState = styled.div`
  margin: var(--tina-padding-big) 0;
  position: relative;
`
