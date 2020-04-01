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
