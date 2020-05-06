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
import styled from 'styled-components'
import { useJsonForm } from 'next-tinacms-json'
import { ModalProvider, BlockTemplate } from 'tinacms'
import {
  InlineForm,
  InlineImageField,
  InlineTextField,
  InlineBlocks,
  BlocksControls,
  BlockText,
  BlockImage,
  BlockTextarea,
  useInlineForm,
} from 'react-tinacms-inline'

/**
 * This is an example page that uses Blocks from Json
 */
export default function BlocksExample({ jsonFile }) {
  const [data, form] = useJsonForm(jsonFile)

  return (
    <ModalProvider>
      <InlineForm form={form}>
        <EditToggle />
        <DiscardChanges />
        <h1>
          <InlineTextField name="title" />
          <InlineImageField
            name="hero_image"
            previewSrc={formValues => formValues.hero_image}
            parse={filename => `/images/${filename}`}
            uploadDir={() => '/public/images/'}
          >
            {props => <ChildImage src={data.hero_image} {...props} />}
          </InlineImageField>
        </h1>
        <Wrap>
          <InlineBlocks name="blocks" blocks={PAGE_BUILDER_BLOCKS} />
        </Wrap>
      </InlineForm>
    </ModalProvider>
  )
}

function ChildImage(props) {
  return <img src={props.previewSrc || props.src} />
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
        My Hero: <StyledBlockText name="text" />
      </h2>
    </BlocksControls>
  )
}

/*
 ** Image template + Component
 */

function ImageBlock({ index, data }) {
  return (
    <BlocksControls index={index}>
      <BlockImage
        name="src"
        previewSrc={formValues => {
          return formValues.blocks[index].src
        }}
        parse={filename => `/images/${filename}`}
        uploadDir={() => '/public/images/'}
      />
    </BlocksControls>
  )
}

const image_template: BlockTemplate = {
  type: 'image',
  label: 'Image',
  defaultItem: {
    _template: 'image',
    src: '/images/davisco-5E5N49RWtbA-unsplash.jpg',
    alt: 'image alt text',
  },
  key: undefined,
  fields: [{ name: 'alt', label: 'Image Alt', component: 'text' }],
}

// Testing the block styled component override

const StyledBlockText = styled(BlockText)`
  color: green;
`

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
  image: {
    Component: ImageBlock,
    template: image_template,
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
export function EditToggle() {
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

export function DiscardChanges() {
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

const Wrap = styled.div`
  max-width: 800px;
  margin: 0 auto;
`
