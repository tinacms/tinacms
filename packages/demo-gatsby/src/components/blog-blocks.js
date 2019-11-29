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
import { InlineBlocks } from "react-tinacms-blocks"

export function BlogBlocks({ form, data }) {
  return (
    <InlineBlocks
      form={form}
      name="rawFrontmatter.blocks"
      data={data}
      components={BLOCK_COMPONENTS}
      renderBefore={props => (
        <>
          <br />
          <BlocksActions {...props} />
        </>
      )}
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

function BlocksActions({ index, insert, remove, move }) {
  const hasIndex = index || index === 0
  return (
    <>
      {insert && (
        <button
          onClick={() =>
            insert(
              { _template: "heading", ...heading.defaultItem },
              (index || -1) + 1
            )
          }
        >
          Add Heading
        </button>
      )}
      {insert && (
        <button
          onClick={() =>
            insert(
              { _template: "image", ...image.defaultItem },
              (index || -1) + 1
            )
          }
        >
          Add Image
        </button>
      )}
      {hasIndex && move && (
        <button onClick={() => move(index, index - 1)} disabled={index === 0}>
          Up
        </button>
      )}
      {hasIndex && move && (
        <button onClick={() => move(index, index + 1)}>Down</button>
      )}
      {hasIndex && remove && (
        <button onClick={() => remove(index)}>Remove</button>
      )}
    </>
  )
}

function EditableHeading(props) {
  return (
    <div style={{ border: "5px solid purple" }}>
      <h1>
        <TinaField
          name={`${props.name}.${props.index}.text`}
          Component={PlainText}
        >
          {props.data.text}
        </TinaField>
      </h1>
      <BlocksActions
        {...props}
        defaultItem={{ _template: "heading", ...heading.defaultItem }}
      />
    </div>
  )
}

// Image Block Component
function EditableImage(props) {
  return (
    <p style={{ border: "5px solid green" }}>
      <TinaField
        name={`${props.name}.${props.index}.src`}
        Component={PlainText}
      />
      <TinaField
        name={`${props.name}.${props.index}.alt`}
        Component={PlainText}
      />
      <img {...props.data} />
      <BlocksActions
        {...props}
        defaultItem={{ _template: "image", ...image.defaultItem }}
      />
    </p>
  )
}

function PlainText(props) {
  return <input style={{ background: "transparent " }} {...props.input} />
}

/**
 * HEADING BLOCK
 */
const heading = {
  label: "Heading",
  defaultItem: {
    text: "",
  },
  itemProps: block => ({
    label: `${block.text}`,
  }),
  fields: [{ name: "text", component: "text", label: "Text" }],
}

/**
 * IMAGE BLOCK
 */
// Image Block Template
const image = {
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
