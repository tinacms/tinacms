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

import { css } from 'styled-components'

const paddingX = 8
const paddingY = 6
const borderWidth = 1
const controlSize = 12

const proseMirrorTableStyles = `
  .ProseMirror {
    display: inline-block
  }
  .ProseMirror .tableWrapper {
    overflow-x: auto;
  }
  .ProseMirror .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    z-index: 20;
    background-color: #adf;
    pointer-events: none;
  }
  .ProseMirror.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
  /* Give selected cells a blue overlay */
  .ProseMirror .selectedCell:after {
    z-index: 2;
    position: absolute;
    content: '';
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 132, 255, 0.25);
    /* This provides a bullet-proof border for selected cells even with border collapsing */
    box-shadow: 0 0 0 1px #0574E4;
    pointer-events: none;
  }
  .ProseMirror:focus {
    outline: 0px solid transparent;
  }
  .ProseMirror table {
    border-collapse: collapse;
    table-layout: fixed;
    display: inline-table;
    margin: 32px 0 32px 0;
    overflow: visible;
    width: 100%;
  }
  .ProseMirror th {
    background-color: #F6F6F9;
  }
  .ProseMirror table td,
  .ProseMirror table th {
    border: 1px solid #E1DDEC;
    padding: ${paddingY}px ${paddingX}px;
    position: relative;
    vertical-align: top;
    box-sizing: border-box;
  }
  .ProseMirror .tina_table_header_ext_top {
    background: #F6F6F9;
    border: 1px solid #E1DDEC;
    position: absolute;
    height: ${controlSize}px;
    width: calc(100% + ${borderWidth * 2}px);
    transform: translate(${(borderWidth + paddingX) * -1}px, ${(controlSize +
  paddingY) *
  -1}px);
    cursor: pointer;
    z-index: 1;
    user-select: none;
  }
  .ProseMirror div.tina_table_header_ext_top_selected {
    background: #0084ff;
    border-color: #0574E4;
    z-index: 10;
  }
  .ProseMirror .tina_table_header_ext_left {
    background: #F6F6F9;
    border: 1px solid #E1DDEC;
    position: absolute;
    height: calc(100% + ${borderWidth * 2}px);
    width: ${controlSize}px;
    transform: translate(${(controlSize + paddingX) * -1}px, ${(borderWidth +
  paddingY) *
  -1}px);
    cursor: pointer;
    z-index: 1;
    user-select: none;
  }
  .ProseMirror div.tina_table_header_ext_left_selected {
    background: #0084ff;
    border-color: #0574E4;
    z-index: 10;
  }
  .ProseMirror .tina_table_header_ext_top_left {
    background: #F6F6F9;
    border: 1px solid #E1DDEC;
    position: absolute;
    height: ${controlSize}px;
    width: ${controlSize}px;
    transform: translate(${(controlSize + paddingX) * -1}px, ${(controlSize +
  paddingY) *
  -1}px);
    border-radius: 5px 0 0 0;
    z-index: 1;
    cursor: pointer;
    user-select: none;
  }
  .ProseMirror div.tina_table_header_ext_top_left_selected {
    background: #0084ff;
    border-color: #0574E4;
    z-index: 10;
  }
  .ProseMirror .selectedCell {
    border-color: transparent;
  }
`

export const ProseMirrorCss = css`
  .ProseMirror .tinacms-image-wrapper {
    display: inline-block;
    margin: 1em 0;
  }

  ${proseMirrorTableStyles}
`
