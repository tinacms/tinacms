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
import { useJsonForm } from 'next-tinacms-json'
import { ModalProvider, BlockTemplate } from 'tinacms'
import {
  InlineForm,
  InlineTextField,
  InlineBlocks,
  BlocksControls,
  BlockText,
  useInlineForm,
} from 'react-tinacms-inline'

/**
 * This is an example page that uses Blocks from Json
 */
export default function BlocksExample({ jsonFile }) {
  const [, form] = useJsonForm(jsonFile)

  if (!form) return null

  return (
    <ModalProvider>
      <InlineForm form={form}>
        <EditToggle />
        <DiscardChanges />
        <h1>
          <InlineTextField name="title" />
        </h1>
        <InlineBlocks name="blocks" blocks={PAGE_BUILDER_BLOCKS} />
      </InlineForm>
    </ModalProvider>
  )
}

/**
 * CallToAction template + Component
 */
const cta_template: BlockTemplate = {
  type: 'cta',
  label: 'Call to Action',
  defaultItem: { url: '', text: 'Signup!' },
  key: undefined,
  fields: [
    { name: 'text', label: 'Text', component: 'text' },
    { name: 'url', label: 'URL', component: 'text' },
  ],
}

function CallToActionBlock({ data, index }) {
  return (
    <BlocksControls index={index}>
      <button
        onClick={() => window.open(data.url, '_blank')}
        style={{ display: 'block', background: 'pink' }}
      >
        {data.text}
      </button>
    </BlocksControls>
  )
}

/**
 * Hero template + Component
 */
const hero_template: BlockTemplate = {
  type: 'hero',
  label: 'Hero',
  defaultItem: { text: 'Spiderman' },
  key: undefined,
  fields: [],
}

function HeroBlock({ index }) {
  return (
    <BlocksControls index={index}>
      <h2>
        My Hero: <BlockText name="text" />
      </h2>
    </BlocksControls>
  )
}

/**
 * This is the Blocks lookup that was passed to `<InlineBlocks>` in the
 * main `BlocksExample` component.
 */
const PAGE_BUILDER_BLOCKS = {
  cta: {
    Component: CallToActionBlock,
    template: cta_template,
  },
  hero: {
    Component: HeroBlock,
    template: hero_template,
  },
}

/**
 * EVERYTHING BELOW HERE IS NOT IMPORTANT TO UNDERSTANDING BLOCKS
 */

BlocksExample.getInitialProps = async function() {
  const blocksData = await import(`../data/blocks.json`)
  return {
    jsonFile: {
      fileRelativePath: `data/blocks.json`,
      data: blocksData.default,
    },
  }
}

/**
 * Toggle
 */
function EditToggle() {
  const { status, deactivate, activate } = useInlineForm()

  return (
    <button
      onClick={() => {
        status === 'active' ? deactivate() : activate()
      }}
    >
      {status === 'active' ? 'Preview' : 'Edit'}
    </button>
  )
}

function DiscardChanges() {
  const { form } = useInlineForm()

  return (
    <button
      onClick={() => {
        form.finalForm.reset()
      }}
    >
      Discard Changes
    </button>
  )
}
