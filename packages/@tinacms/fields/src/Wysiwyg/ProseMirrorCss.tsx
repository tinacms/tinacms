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

const proseMirrorTableStyles = `
  /* START: copied from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
  .ProseMirror .tableWrapper {
    overflow-x: auto;
  }
  .ProseMirror table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    overflow: hidden;
  }
  .ProseMirror td,
  .ProseMirror th {
    vertical-align: top;
    box-sizing: border-box;
    position: relative;
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
    background: rgba(200, 200, 255, 0.4);
    pointer-events: none;
  }
  /* END: copied from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
  .ProseMirror table {
    display: inline-table;
    margin: 10px;
    overflow: visible;
    width: calc(100% - 20px);
  }
  .ProseMirror th {
    background-color: #f0f1f3;
  }
  .ProseMirror table td,
  .ProseMirror table th {
    border: 1px solid #c1c7cd;
    padding: 10px 4px;
  }
  .ProseMirror .tina_table_header_ext_top {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-right: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    left: -1px;
    top: -1px;
    height: 10px;
    width: calc(100% + 2px);
    transform: translate(0px, -100%);
  }
  .ProseMirror .tina_table_header_ext_left {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-bottom: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    height: calc(100% + 2px);
    width: 10px;
    left: -1px;
    top: -1px;
    transform: translate(-100%, 0);
  }
  .ProseMirror .tina_table_header_ext_top_left {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    top: -1px;
    left: -1px;
    height: 10px;
    width: 10px;
    transform: translate(-100%, -100%);
  }
`

export const ProseMirrorCss = css`
  .ProseMirror .tinacms-image-wrapper {
    display: inline-block;
    margin: 1em 0;
  }

  ${proseMirrorTableStyles}
`
