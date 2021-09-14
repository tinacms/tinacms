/**

Copyright 2021 Forestry.io Holdings, Inc.

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

export type SlateNodeType =
  | {
      type: 'heading_one'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_two'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_three'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_four'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_five'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_six'
      children: SlateNodeType[]
    }
  | {
      type: 'paragraph'
      children: SlateNodeType[]
    }
  | {
      children: SlateNodeType[]
      link: string
      type: 'link'
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'text'
      bold?: boolean
      italic?: boolean
      text: string
    }
  | {
      type: 'mdxJsxTextElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'mdxJsxFlowElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'code_block'
      language: string
      children: SlateNodeType[]
    }
  | {
      type: 'image'
      link: string
      caption: string
    }
  | {
      type: 'thematic_break'
    }
