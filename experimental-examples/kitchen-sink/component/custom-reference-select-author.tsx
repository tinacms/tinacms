import React from 'react'

interface CustomDisplayAuthorComponentProps {
  something: string
}

const CustomDisplayAuthorComponent: React.FC<
  CustomDisplayAuthorComponentProps
> = ({ something }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.2rem',
        padding: '10px',
        backgroundColor: '#f0f4f8',
        borderRadius: '8px',
      }}
    >
      <span style={{ marginRight: '8px' }}>🚀</span>
      <span>{something}</span>
    </div>
  )
}

export default CustomDisplayAuthorComponent
