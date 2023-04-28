/**



*/

import * as React from 'react'
import { TinaCMSProvider, TinaCMSProviderProps } from './TinaCMSProvider'
import { TinaUI, TinaUIProps } from './TinaUI'
import { FormListProvider } from './FormListProvider'

export interface TinaProviderProps extends TinaCMSProviderProps, TinaUIProps {}

export const TinaProvider: React.FC<TinaProviderProps> = ({
  cms,
  children,
  position,
  styled = true,
}) => {
  return (
    <TinaCMSProvider cms={cms}>
      <FormListProvider>
        <TinaUI position={position} styled={styled}>
          {children}
        </TinaUI>
      </FormListProvider>
    </TinaCMSProvider>
  )
}

/**
 * @deprecated This has been renamed to `TinaProvider`.
 */
export const Tina = TinaProvider

/**
 * @deprecated This has been renamed to `TinaProviderProps`.
 */
export type TinaProps = TinaProviderProps
