import React, { useCallback } from 'react'
import { TinaField, Form } from 'tinacms'

import { Blocks, BlocksProps } from './blocks'

export interface InlineBlocksProps extends BlocksProps {
  // TODO: We shouldn't have to pass this in.
  form: Form
}

export function InlineBlocks({ name, form, ...props }: InlineBlocksProps) {
  const EditableBlocks = React.useMemo(
    () => createEditableBlocks(form, props.components),
    [form, props.components]
  )
  return (
    <TinaField name={name} Component={EditableBlocks}>
      <Blocks name={name} {...props} />
    </TinaField>
  )
}

function createEditableBlocks(
  form: Form,
  components: InlineBlocksProps['components']
) {
  return function(props: any) {
    return (
      <EditableBlocks
        name={props.input.name}
        components={components}
        data={props.input.value}
        form={form}
      />
    )
  }
}

export function EditableBlocks({
  name,
  data = [],
  components = {},
  form,
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
