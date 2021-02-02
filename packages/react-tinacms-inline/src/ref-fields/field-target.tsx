import * as React from 'react'

export function FieldTarget({ onClick }: { onClick: () => void }) {
  const [opacity, setOpacity] = React.useState(0)
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setOpacity(1.0)}
      onMouseLeave={() => setOpacity(0.0)}
      style={{
        width: '100%',
        height: '100%',
        border: '5px solid red',
        opacity,
      }}
    ></div>
  )
}
