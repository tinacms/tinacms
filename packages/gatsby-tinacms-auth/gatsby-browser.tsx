/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import { useEffect, useState } from 'react'
import { VIRTUAL_SERVICE_DOMAIN, TINA_CONNECTOR_ID } from './contants'
interface Options {
  authEnvironments: string[]
}

exports.wrapRootElement = ({ element }: any, options: Options) => {
  return (
    <TinaTeamsAuth authEnvironments={options.authEnvironments}>
      {element}
    </TinaTeamsAuth>
  )
}

const TinaTeamsAuth = (props: any) => {
  const { authEnvironments, children } = props

  const [authenticated, setAuthenticated] = useState(false)

  let token: string
  if ((authEnvironments || []).indexOf(process.env.NODE_ENV || '') >= 0) {
    token = new URL(window.location.href).searchParams.get('token') || ''
    if (!token) {
      window.location.href = `https://api.${VIRTUAL_SERVICE_DOMAIN}/auth-proxy?connector_id=${TINA_CONNECTOR_ID}&origin=${encodeURIComponent(
        window.location.href
      )}`
      return
    }

    //todo - put token in cookie
    // strip token
  }

  useEffect(() => {
    const verifyAccess = async () => {
      const result = await fetch('/___tina/teams/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ token }),
      })
      // console.log(JSON.stringify('result ' + JSON.stringify(result.status)))
    }
    verifyAccess()
  }, [])

  return children
}
