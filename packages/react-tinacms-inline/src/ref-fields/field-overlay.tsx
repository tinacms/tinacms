import * as React from 'react'

export function FieldOverlay({
  targetRef,
  children,
}: {
  targetRef: any
  children: any
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: targetRef?.current?.offsetTop,
        left: targetRef?.current?.offsetLeft,
        width: targetRef?.current?.offsetWidth,
        height: targetRef?.current?.offsetHeight,
      }}
    >
      {children}
    </div>
  )
}
