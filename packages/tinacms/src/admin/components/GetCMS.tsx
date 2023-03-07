/**

*/

import React from 'react'
import { useCMS } from '../../toolkit/src'

const GetCMS = ({ children }: { children: any }) => {
  try {
    const cms = useCMS()
    return <>{children(cms)}</>
  } catch (e) {
    return null
  }
}

export default GetCMS
