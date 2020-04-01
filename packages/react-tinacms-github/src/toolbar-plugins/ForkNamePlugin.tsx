import { FieldMeta } from 'tinacms'
import styled from 'styled-components'
import { color } from '@tinacms/styles'
import React from 'react'

export const ForkNamePlugin = (forkName: string) => ({
  __type: 'toolbar:widget',
  name: 'current-fork',
  weight: 1,
  props: { forkName },
  component: ForkInfo,
})

const MetaLink = styled.a`
  display: block;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  color: ${color.primary('dark')};
`

const ForkInfo = ({ forkName }) => {
  return (
    <FieldMeta name={'Fork'}>
      <MetaLink target="_blank" href={`https://github.com/${forkName}`}>
        {forkName}
      </MetaLink>
    </FieldMeta>
  )
}
