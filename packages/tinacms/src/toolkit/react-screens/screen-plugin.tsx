import React from 'react'
import { Plugin } from '@toolkit/core'

/**
 * Represents a Screen that should be accessible via the CMS.
 *
 * The purpose of these screens is to give a way to display information
 * about the website that is not suited to inline editing. Example use
 * cases may include:
 *
 * * User Management
 * * CI build status
 * * Website Metadata e.g. SEO
 * * Layout Configuration e.g. Menus
 */
export interface ScreenPlugin<ExtraProps = {}> extends Plugin {
  __type: 'screen'
  Component(props: ScreenComponentProps & ExtraProps): React.ReactElement
  Icon: any
  layout: 'fullscreen' | 'popup'
}

/**
 * The set of props passed to all Screen Components.
 */
export interface ScreenComponentProps {
  close(): void
}

/**
 * An options object used to create Screen Plugins.
 */
export interface ScreenOptions<ExtraProps = {}> {
  name: string
  Component: React.FC<ExtraProps & ScreenComponentProps>
  Icon: any
  layout?: ScreenPlugin['layout']
  props?: ExtraProps
}

/**
 * Creates screen plugins.
 *
 * @param options
 */
export function createScreen<ExtraProps>({
  Component,
  props,
  ...options
}: ScreenOptions<ExtraProps>): ScreenPlugin<ExtraProps> {
  return {
    __type: 'screen',
    layout: 'popup',
    ...options,
    Component(screenProps) {
      return <Component {...screenProps} {...props} />
    },
  }
}
