import { withRef } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common'
import { Eye, SquarePen } from 'lucide-react'
import React from 'react'
import { useMermaidElement } from '../../hooks/use-mermaid-element'
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin'
import { CodeBlock } from '../../plugins/ui/code-block'

const MermaidElementWithRef = ({ config }) => {
  const { mermaidRef } = useMermaidElement()
  return (
    <div contentEditable={false} className="border-border border-b">
      <div ref={mermaidRef}>
        <pre className="mermaid not-tina-prose">{config}</pre>
      </div>
    </div>
  )
}

const Bubble = ({ children }) => {
  return (
    <div className="bg-blue-600 rounded-full p-2 transition-transform duration-200 ease-in-out hover:scale-110">
      {children}
    </div>
  )
}

const DEFAULT_MERMAID_CONFIG = `%% This won't render without implementing a rendering engine <TODO: Link to tina docs>
flowchart TD
    id1(this is an example flow diagram) 
    --> id2(modify me to see changes!)
    id2 
    --> id3(Click the top button to preview the changes)
    --> id4(Learn about mermaid diagrams @ mermaid.js.org)`

export const MermaidElement = withRef<typeof PlateElement>(
  ({ children, nodeProps, element, ...props }, ref) => {
    const [mermaidConfig, setMermaidConfig] = React.useState(
      element.value || DEFAULT_MERMAID_CONFIG
    )
    const [isEditing, setIsEditing] = React.useState(
      mermaidConfig === DEFAULT_MERMAID_CONFIG || false
    )

    const node = {
      type: ELEMENT_MERMAID,
      value: mermaidConfig,
      children: [{ type: 'text', text: '' }],
    }

    return (
      <PlateElement element={element} ref={ref} {...props}>
        <div className="relative group">
          <div className="absolute top-2 right-2 z-10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
            <Bubble>
              {isEditing ? (
                <Eye
                  className="w-5 h-5 fill-white cursor-pointer"
                  onClick={() => {
                    setIsEditing(!isEditing)
                  }}
                />
              ) : (
                <SquarePen
                  className="w-5 h-5 fill-white cursor-pointer"
                  onClick={() => {
                    setIsEditing(!isEditing)
                  }}
                />
              )}
            </Bubble>
          </div>
          {isEditing ? (
            <CodeBlock
              children={''}
              language="yaml"
              {...props}
              element={node}
              defaultValue={mermaidConfig}
              onChangeCallback={(value) => setMermaidConfig(value)}
            />
          ) : (
            <MermaidElementWithRef config={mermaidConfig} />
          )}
          {children}
        </div>
      </PlateElement>
    )
  }
)
