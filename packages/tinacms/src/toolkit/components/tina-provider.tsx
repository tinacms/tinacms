import * as React from 'react'
import { TinaCMSProvider, TinaCMSProviderProps } from './tina-cms-provider'
import { TinaUI, TinaUIProps } from './tina-ui'

export interface TinaProviderProps extends TinaCMSProviderProps, TinaUIProps {}

export const TinaProvider: React.FC<TinaProviderProps> = ({
  cms,
  children,
  position,
  styled = true,
}) => {
  return (
    <TinaCMSProvider cms={cms}>
      <TinaUI position={position} styled={styled}>
        {children}
      </TinaUI>
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
