import React, { useState } from 'react'
import type { LoginScreenProps } from '@tinacms/schema-tools'
import { AsyncButton } from 'tinacms'

const inputClasses =
  'shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md'

export const UsernamePasswordLoginScreen = ({
  handleAuthenticate,
}: LoginScreenProps) => {
  const [authProps, setAuthProps] = useState<{
    username: string
    password: string
  }>({ username: '', password: '' })

  return (
    <div className="flex items-center justify-center bg-gray-50 p-6 sm:p-8 lg:p-10">
      <div className="max-w-md w-full">
        <h1 className="text-xl pb-4">Sign in to Tina</h1>
        <div className="pb-2">
          <label className="block pb-1">
            <span className="text-gray-700">Username</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className={inputClasses}
            autoComplete="username"
            required
            placeholder="Username"
            value={authProps.username}
            onChange={(e) =>
              setAuthProps((prevState) => ({
                ...prevState,
                username: e.target.value,
              }))
            }
          />
        </div>
        <div className="pb-2">
          <label className="block pb-1">
            <span className="text-gray-700">Password</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={inputClasses}
            autoComplete="current-password"
            required
            placeholder="Password"
            value={authProps.password}
            onChange={(e) =>
              setAuthProps((prevState) => ({
                ...prevState,
                password: e.target.value,
              }))
            }
          />
        </div>
        <div className="pt-2">
          <AsyncButton
            name="Login"
            action={handleAuthenticate}
            primary={true}
          />
        </div>
      </div>
    </div>
  )
}
