/**

*/

import { Schema } from '@tinacms/schema-tools'
import type { GraphQLConfig } from '../types'
import {
  resolveMediaRelativeToCloud,
  resolveMediaCloudToRelative,
} from './media-utils'
import { describe, it, expect } from 'vitest'

describe('resolveMedia', () => {
  const schema: Schema<true> = {
    config: {
      branch: '',
      clientId: '',
      token: '',
      build: {
        outputFolder: '',
        publicFolder: '',
      },
      schema: { collections: [] },
      media: {
        tina: {
          publicFolder: 'public',
          mediaRoot: 'uploads',
        },
      },
    },
    collections: [],
  }
  const assetsHost = `assets.tinajs.dev`
  const clientId = `a03ff3e2-1c3a-41af-8afd-ba0d58853191`
  const relativeURL = '/uploads/llama.png'
  const cloudURL = `https://${assetsHost}/${clientId}/llama.png`

  /**
   * When using `useRelativeMedia: true`, the URL should not be changed.
   */
  it('resolves to relative media when useRelativeMedia: true', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: true,
    }

    const resolvedURL = resolveMediaRelativeToCloud(relativeURL, config, schema)
    expect(resolvedURL).toEqual(relativeURL)
  })

  /**
   * When using `useRelativeMedia: false`, the relative URL should be changed to a Cloud URL.
   */
  it('resolves relative media to cloud media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    }

    const resolvedURL = resolveMediaRelativeToCloud(relativeURL, config, schema)
    expect(resolvedURL).toEqual(cloudURL)
  })

  /**
   * When using `useRelativeMedia: false`, the Cloud URL should be changed to relative URL.
   */
  it('resolves cloud media to relative media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    }

    const resolvedURL = resolveMediaCloudToRelative(cloudURL, config, schema)
    expect(resolvedURL).toEqual(relativeURL)
  })

  /**
   * A empty value should return empty, regardless of `useRelativeMedia`
   */
  it('resolves to empty when provided an empty value', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    }

    const aURL = resolveMediaCloudToRelative('', config, schema)
    expect(aURL).toEqual('')

    const bURL = resolveMediaRelativeToCloud('', config, schema)
    expect(bURL).toEqual('')
  })

  /**
   * Missing `media: { tina: { ... }}` config should return the value, regardless of `useRelativeMedia`
   */
  it('persists value when no `tina` config is provided regardless of `useRelativeMedia`', () => {
    const otherSchema: Schema<true> = {
      config: {
        branch: '',
        clientId: '',
        token: '',
        build: {
          outputFolder: '',
          publicFolder: '',
        },
        schema: { collections: [] },
        // @ts-ignore
        media: {},
      },
      collections: [],
    }
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    }

    const resolvedURL = resolveMediaCloudToRelative(
      `https://assets.other-cloud-media-service.com/112233/llama.png`,
      config,
      otherSchema
    )

    expect(resolvedURL).toEqual(
      `https://assets.other-cloud-media-service.com/112233/llama.png`
    )
  })
})
