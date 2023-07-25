import { MdOutlineCloud } from 'react-icons/md'

import { Plugin } from '@toolkit/core'

/**
 * Represents a Tina Cloud Config that should be accessible via the CMS.
 *
 * The purpose of these configs is to give a way to display & edit information
 * about TIna Cloud Configuration
 * cases may include:
 *
 * * Tina Cloud Project Configuration
 * * User Management
 */
export interface CloudConfigPlugin extends Plugin {
  __type: 'cloud-config'
  text?: string
  Icon: any
  link: {
    text: string
    href: string
  }
}

/**
 * An options object used to create Cloud Config Plugins.
 */
export interface CloudConfigOptions {
  name: string
  text?: string
  link: {
    text: string
    href: string
  }
}

/**
 * Creates cloud config plugins.
 *
 * @param options
 */
export function createCloudConfig({
  ...options
}: CloudConfigOptions): CloudConfigPlugin {
  return {
    __type: 'cloud-config',
    Icon: MdOutlineCloud,
    ...options,
  }
}
