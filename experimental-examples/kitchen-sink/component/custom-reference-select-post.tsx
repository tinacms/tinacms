// CustomDisplayPostComponent.tsx
import React from 'react'

interface CustomDisplayPostComponentProps {
  title: string
}

const CustomDisplayPostComponent: React.FC<CustomDisplayPostComponentProps> = ({
  title,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.2rem',
        padding: '10px',
        backgroundColor: '#e0f7fa',
        borderRadius: '8px',
      }}
    >
      <span style={{ marginRight: '8px' }}>📝</span>
      <span>{title}</span>
    </div>
  )
}

export default CustomDisplayPostComponent
