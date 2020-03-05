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
import { InlineField } from './inline-field'

/**
 * Blocks
 */

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
  return (
    <InlineField name={name}>
      {({ input, form }) => {
        const allData: { _template: string }[] = input.value || []

        const move = (from: number, to: number) => {
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
            value={{ insert, move, remove, blocks, count: allData.length }}
          >
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
    <InlineBlockContext.Provider value={{ name, ...block }}>
      <block.Component data={data} index={index} />
    </InlineBlockContext.Provider>
  )
}

export interface InlineBlockContext extends Block {
  name: string
}
export const InlineBlockContext = React.createContext<InlineBlockContext | null>(
  null
)

export function useInlineBlock() {
  const inlineFormContext = React.useContext(InlineBlockContext)

  if (!inlineFormContext) {
    throw new Error('useInlineBlock must be within an InlineBlockContext')
  }

  return inlineFormContext
}
