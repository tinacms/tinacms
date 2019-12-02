import * as React from 'react'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { VIRTUAL_SERVICE_DOMAIN, TINA_CONNECTOR_ID } from '../contants'

const AUTH_COOKIE_KEY = 'tina-auth'

type AUTH_STATE = 'authenticating' | 'authenticated' | 'unauthenticated'

export const AuthContainer = (props: any) => {
  const { authEnvironments, children } = props
  const [authState, setAuthState] = useState<AUTH_STATE>('authenticating')

  const useAuth =
    (authEnvironments || []).indexOf(process.env.NODE_ENV || '') >= 0

  if (!useAuth) {
    return children
  }

  let authToken = Cookies.get(AUTH_COOKIE_KEY)
  if (!authToken) {
    createAuthCookie()
    return
  }

  useEffect(() => {
    const verifyAccess = async () => {
      const result = await fetch('/___tina/teams/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ token: authToken }),
      })
      return result.status == 200
    }
    verifyAccess().then(hasAccess => {
      setAuthState(hasAccess ? 'authenticated' : 'unauthenticated')
    })
  }, [])

  return authState == 'authenticated' ? children : <div>{authState}</div>
}

const createAuthCookie = () => {
  const token = new URL(window.location.href).searchParams.get('token') || ''
  if (!token) {
    window.location.href = `https://api.${VIRTUAL_SERVICE_DOMAIN}/auth-proxy?connector_id=${TINA_CONNECTOR_ID}&origin=${encodeURIComponent(
      window.location.href
    )}`
    return
  }

  Cookies.set(AUTH_COOKIE_KEY, token)
  window.location.href = window.location.href.split('token')[0]
  return
}
