import * as React from 'react'
import { useCMS } from '@toolkit/react-tinacms/use-cms'
import ReferenceSelect from './reference-select'
import ReferenceLink from './reference-link'
import { ReferenceProps } from './model/reference-props'

export const Reference: React.FC<ReferenceProps> = ({ input, field }) => {
  const cms = useCMS()

  return (
    <div>
      <div className="relative group">
        <ReferenceSelect cms={cms} input={input} field={field} />
      </div>
      <ReferenceLink cms={cms} input={input} />
    </div>
  )
}
