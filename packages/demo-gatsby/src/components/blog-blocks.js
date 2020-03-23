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
import React from "react"
import {
  InlineForm,
  InlineBlocks,
  BlocksControls,
  BlockText,
  BlockTextarea,
} from "react-tinacms-inline"

/*
 ** TODO: figure out why the template isn't working
 */

export function BlogBlocks({ form }) {
  return (
    <InlineForm form={form}>
      <InlineBlocks name="rawFrontmatter.blocks" blocks={BLOCKS}></InlineBlocks>
    </InlineForm>
  )
}

/**
 * Blocks Components
 */

// Heading Block Component
function EditableHeading(props) {
  return (
    <BlocksControls index={props.index}>
      <h1>
        <BlockText name="text" />
      </h1>
    </BlocksControls>
  )
}

// Image Block Component
function EditableImage(props) {
  return (
    <BlocksControls index={props.index}>
      <img {...props.data} />
    </BlocksControls>
  )
}

/**
 * HEADING BLOCK TEMPLATE
 */
const heading_template = {
  type: "heading",
  label: "Heading",
  defaultItem: {
    text: "",
  },
  key: undefined,
  fields: [],
}

/**
 * IMAGE BLOCK TEMPLATE
 */
const image_template = {
  type: "image",
  label: "Image",
  defaultItem: {
    text: "",
  },
  key: undefined,
  fields: [
    { name: "src", component: "text", label: "Source URL" },
    { name: "alt", component: "text", label: "Alt Text" },
  ],
}

export const BLOCKS = {
  heading: {
    Component: EditableHeading,
    template: heading_template,
  },
  image: {
    Component: EditableImage,
    template: image_template,
  },
}
