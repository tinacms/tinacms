import React from 'react'
import { withRef } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common'
import { useMermaidElement } from '../../hooks/use-mermaid-element'
import { PencilIcon } from 'lucide-react'
import { Input } from './input'
export const MermaidElement = withRef<typeof PlateElement>(
  ({ nodeProps, ...props }, ref) => {
    const { children } = props
    const { mermaidRef } = useMermaidElement()
    const [isEditing, setIsEditing] = React.useState(false)

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
            <Input />
          ) : (
            <MermaidElementWithRef
              key={`${isEditing}`}
              mermaidRef={mermaidRef}
            />
          )}
          {children}
        </div>
      </PlateElement>
    )
  }
)

const MermaidElementWithRef = ({ mermaidRef }) => (
  <div contentEditable={false}>
    <div ref={mermaidRef}>
      <pre className="mermaid">
        {`
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
                }`}
      </pre>
    </div>
  </div>
)
