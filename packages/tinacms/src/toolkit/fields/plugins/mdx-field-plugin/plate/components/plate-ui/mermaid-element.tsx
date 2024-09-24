import React, { useEffect, useState } from 'react'
import { withRef } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common'
import { useMermaidElement } from '../../hooks/use-mermaid-element'
import { Moon, PencilIcon, SunMoon } from 'lucide-react'
import { CodeBlock } from '../../plugins/ui/code-block'
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin'

const LightModeComponent = ({ onToggleMode }) => {
  const [isLightMode, setIsLightMode] = useState(true)

  // Toggle the light mode state
  const handleToggle = () => {
    setIsLightMode((prevMode) => !prevMode)
  }

  // Notify parent component of the class change
  useEffect(() => {
    const modeClass = isLightMode ? 'light-mode' : 'dark-mode'
    if (onToggleMode) {
      onToggleMode(modeClass)
    }
  }, [isLightMode, onToggleMode])

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center w-5 h-5 text-gray-500 cursor-pointer"
      >
        {isLightMode ? <SunMoon /> : <Moon />}
      </button>
    </div>
  )
}
export const MermaidElement = withRef<typeof PlateElement>(
  ({ children, nodeProps, element, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false)
    const [mermaidConfig, setMermaidConfig] = React.useState(
      element.value || ''
    )

    const node = {
      type: ELEMENT_MERMAID,
      value: mermaidConfig,
      children: [{ type: 'text', text: '' }],
    }

    return (
      <PlateElement element={element} ref={ref} {...props}>
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <PencilIcon
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => {
                setIsEditing(!isEditing)
              }}
            />
            <LightModeComponent
              onToggleMode={() => console.log('mode changed')}
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
