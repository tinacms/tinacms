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
import { TinaField } from "tinacms"
import { InlineBlocks, BlockWrapper, AddBlockMenu } from "react-tinacms-blocks"
import { PlainTextInput } from "./plain-text-input"

export function BlogBlocks({ form, data }) {
  return (
    <InlineBlocks
      form={form}
      name="rawFrontmatter.blocks"
      data={data}
      templates={[image, heading]}
      components={BLOCK_COMPONENTS}
      renderBefore={props => {
        if (!props.data || props.data.length < 1)
          return (
            <div style={{ position: "relative" }}>
              {/* Todo: handle the default state in InlineBlocks? */}
              <AddBlockMenu
                insert={props.insert}
                index={props.index}
                templates={props.templates}
              />
            </div>
          )
      }}
    />
  )
}

/**
 * Blocks Components
 */
const BLOCK_COMPONENTS = {
  heading: EditableHeading,
  image: EditableImage,
}

// Heading Block Component
function EditableHeading(props) {
  return (
    <BlockWrapper {...props}>
      <h1>
        <TinaField
          name={`${props.name}.${props.index}.text`}
          Component={PlainTextInput}
        >
          {props.data.text}
        </TinaField>
      </h1>
    </BlockWrapper>
  )
}

// Image Block Component
function EditableImage(props) {
  return (
    <BlockWrapper {...props}>
      <img {...props.data} />
    </BlockWrapper>
  )
}

/**
 * HEADING BLOCK TEMPLATE
 */
const heading = {
  type: "heading",
  label: "Heading",
  defaultItem: {
    text: "",
  },
  itemProps: block => ({
    label: `${block.text}`,
  }),
}

/**
 * IMAGE BLOCK TEMPLATE
 */
const image = {
  type: "image",
  label: "Image",
  defaultItem: {
    text: "",
  },
  itemProps: block => ({
    key: `${block.src}`,
    label: `${block.alt}`,
  }),
  fields: [
    { name: "src", component: "text", label: "Source URL" },
    { name: "alt", component: "text", label: "Alt Text" },
  ],
}
