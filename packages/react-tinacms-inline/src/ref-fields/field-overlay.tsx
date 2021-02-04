import * as React from 'react'
import { FieldRefType } from './use-field-ref'

export function FieldOverlay({
  targetRef,
  children,
}: {
  targetRef: FieldRefType
  children: JSX.Element
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
