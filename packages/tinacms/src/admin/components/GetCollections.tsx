/**

*/

import React from 'react'

import { TinaAdminApi } from '../api'
import type { TinaCMS } from '../../toolkit/src'

export const useGetCollections = (cms: TinaCMS) => {
  const api = new TinaAdminApi(cms)
  return { collections: api.fetchCollections() }
}

const GetCollections = ({ cms, children }: { cms: TinaCMS; children: any }) => {
  const { collections } = useGetCollections(cms)

  return <>{children(collections)}</>
}

export default GetCollections
