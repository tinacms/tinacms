import React from 'react'
import { withRef } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common'
import { useMermaidElement } from '../../hooks/use-mermaid-element'
import { PencilIcon } from 'lucide-react'
import { CodeBlock } from '../../plugins/ui/code-block'
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin'

export const MermaidElement = withRef<typeof PlateElement>(
  ({ children, nodeProps, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false)
    //! TODO: Remove this hardcoded value
    const [mermaidConfig, setMermaidConfig] = React.useState(`
              ---
              config:
                theme: dark
              ---
              classDiagram
                Animal <|-- Duck
                Animal <|-- Fish
                Animal <|-- Zebra
                Animal : +int age
                Animal : +String gender
                Animal: +isMammal()
                Animal: +mate()
                class Duck{
                  +String beakColor
                  +swim()
                  +quack()
                }
                class Fish{
                  -int sizeInFeet
                  -canEat()
                }
                class Zebra{
                  +bool is_wild
                  +run()
                }`)

    const node = {
      type: ELEMENT_MERMAID,
      value: mermaidConfig,
      children: [{ type: 'text', text: '' }],
    }

    return (
      <PlateElement ref={ref} {...props}>
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <PencilIcon
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => {
                setIsEditing(!isEditing)
              }}
            />
          </div>
          {isEditing ? (
            <CodeBlock
              children={''}
              language="yaml"
              {...props}
              element={node}
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

const MermaidElementWithRef = ({ config }) => {
  const { mermaidRef } = useMermaidElement()
  return (
    <div contentEditable={false}>
      <div ref={mermaidRef}>
        <pre className="mermaid">{config}</pre>
      </div>
    </div>
  )
}
