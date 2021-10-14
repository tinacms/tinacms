import React from 'react'
import { useCMS } from '@tinacms/toolkit'

const GetCMS = ({ children }) => {
  try {
    const cms = useCMS()
    return <>{children(cms)}</>
  } catch (e) {
    return null
  }
}

export default GetCMS
