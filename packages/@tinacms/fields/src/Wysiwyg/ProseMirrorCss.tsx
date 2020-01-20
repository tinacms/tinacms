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
  .ProseMirror:focus {
    outline: 0px solid transparent;
  }
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
    border-right: 1px solid #c1c7cd;
    border-bottom: 1px solid #c1c7cd;
    display: inline-table;
    margin: 32px 0 32px 0;
    overflow: visible;
    width: 100%;
  }
  .ProseMirror th {
    background-color: #f0f1f3;
  }
  .ProseMirror table td,
  .ProseMirror table th {
    border-top: 1px solid #c1c7cd;
    border-left: 1px solid #c1c7cd;
    padding: 10px 4px;
    position: relative;
  }
  .ProseMirror .tina_table_header_ext_top {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-right: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    height: 10px;
    width: calc(100% + 2px);
    top: 0;
    left: 0;
    margin: -1px 0 0 -1px;
    transform: translate3d(0, -100%, 0);
    cursor: pointer;
  }
  .ProseMirror div.tina_table_header_ext_top_selected {
    background: #537ff7;
    border-left: 1px solid #013bda;
    border-right: 1px solid #013bda;
    border-top: 1px solid #013bda;
    z-index: 10;
  }
  .ProseMirror .tina_table_header_ext_left {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-bottom: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    height: calc(100% + 2px);
    width: 10px;
    top: 0;
    left: 0;
    margin: -1px 0 0 -1px;
    transform: translate3d(-100%, 0, 0);
    cursor: pointer;
  }
  .ProseMirror div.tina_table_header_ext_left_selected {
    background: #537ff7;
    border-left: 1px solid #013bda;
    border-top: 1px solid #013bda;
    border-bottom: 1px solid #013bda;
    z-index: 10;
  }
  .ProseMirror .tina_table_header_ext_top_left {
    background: #f0f1f3;
    border-left: 1px solid #c1c7cd;
    border-top: 1px solid #c1c7cd;
    position: absolute;
    height: 10px;
    width: 10px;
    top: 0;
    left: 0;
    margin: -1px 0 0 -1px;
    transform: translate3d(-100%,-100%,0);
    border-radius: 5px 0 0 0;
  }
  .ProseMirror div.tina_table_header_ext_top_left_selected {
    background: #2962ff;
    border-left: 1px solid #013bda;
    border-right: 1px solid #013bda;
    border-top: 1px solid #013bda;
    border-bottom: 1px solid #013bda;
    z-index: 10;
  }
  .ProseMirror .selectedCell {
    border: 1px solid #013bda;
  }
`

export const ProseMirrorCss = css`
  .ProseMirror .tinacms-image-wrapper {
    display: inline-block;
    margin: 1em 0;
  }

  ${proseMirrorTableStyles}
`
