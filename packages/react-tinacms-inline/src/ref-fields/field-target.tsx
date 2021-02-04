import * as React from 'react'

export function FieldTarget({ onClick }: { onClick: () => void }) {
  const [opacity, setOpacity] = React.useState('0.0')
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setOpacity('0.3')}
      onMouseLeave={() => setOpacity('0.0')}
      style={{
        position: 'absolute',
        cursor: 'pointer',
        width: 'calc(100% + 32px)',
        height: 'calc(100% + 32px)',
        top: '-16px',
        left: '-16px',
        border: '1px solid var(--tina-color-primary)',
        borderRadius: 'var(--tina-radius-medium)',
        boxShadow: 'var(--tina-shadow-big)',
        opacity,
      }}
    ></div>
  )
}
