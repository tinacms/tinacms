import * as React from 'react'
import { InlineFieldRenderer } from '../components/inline-field-renderer'

export const RefBasedEditingPlugin = {
  __type: 'unstable_wrapper',
  wrap: (children: React.ReactNode) => (
    <>
      {children}
      <InlineFieldRenderer />
    </>
  ),
}
