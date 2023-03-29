/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TreeView } from '@lexical/react/LexicalTreeView'
import * as React from 'react'

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  return (
    <TreeView
      viewClassName="mt-4 bg-gray-800 text-white rounded-md p-2 text-xs"
      timeTravelPanelClassName="hidden"
      timeTravelButtonClassName="hidden"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
      editor={editor}
    />
  )
}
