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
import React, { useCallback } from 'react'
import { TinaField, Form } from 'tinacms'

import { Blocks, BlocksProps } from './blocks'

export interface BlocksRenderProps {
  insert(obj: any, index: number): void
  move(from: number, to: number): void
  remove(index: number): void
}
export interface InlineBlocksProps extends BlocksProps {
  // TODO: We shouldn't have to pass this in.
  form: Form
  renderBefore(props: BlocksRenderProps): any // TODO: Proper types
}

export function InlineBlocks({
  name,
  form,
  renderBefore,
  ...props
}: InlineBlocksProps) {
  const EditableBlocks = React.useMemo(
    () =>
      createEditableBlocks({
        form,
        components: props.components,
        renderBefore,
      }),
    [form, props.components]
  )
  return (
    <TinaField name={name} Component={EditableBlocks}>
      <Blocks name={name} {...props} />
    </TinaField>
  )
}

function createEditableBlocks({
  form,
  components,
  renderBefore,
}: {
  form: Form
  components: InlineBlocksProps['components']
  renderBefore: any
}) {
  return function(props: any) {
    return (
      <EditableBlocks
        name={props.input.name}
        components={components}
        data={props.input.value}
        form={form}
        renderBefore={renderBefore}
      />
    )
  }
}

function EditableBlocks({
  name,
  data = [],
  components = {},
  form,
  renderBefore,
}: InlineBlocksProps) {
  const move = useCallback(
    (from: number, to: number) => {
      form.finalForm.mutators.move(name, from, to)
    },
    [form, name]
  )

  const remove = React.useCallback(
    (index: number) => {
      form.finalForm.mutators.remove(name, index)
    },
    [form, name]
  )

  const insert = React.useCallback(
    (block: any, index: number) => {
      form.finalForm.mutators.insert(name, index, block)
    },
    [form, name]
  )

  return (
    <>
      {renderBefore && renderBefore({ insert, move, remove })}
      {data.map((data, index) => {
        const Component = components[data._template]

        return (
          <Component
            data={data}
            index={index}
            name={name}
            move={move}
            remove={remove}
            insert={insert}
          />
        )
      })}
    </>
  )
}
