import React, { useEffect, useState } from 'react'
import { BaseTextField, Button, useCMS } from '@tinacms/toolkit'

export function UpdatePassword(props: {}) {
  const cms = useCMS()
  const client = cms.api.tina
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dirty, setDirty] = useState(false)
  const [result, setResult] = useState(null)
  const [formState, setFormState] = useState<'idle' | 'busy'>('idle')
  const [passwordChangeRequired, setPasswordChangeRequired] =
    useState<boolean>(false)

  // check if the password is required to be changed
  useEffect(() => {
    client?.authProvider
      ?.getUser()
      .then((user) =>
        setPasswordChangeRequired(user?.passwordChangeRequired ?? false)
      )
  }, [])

  let err = null
  if (dirty && password !== confirmPassword) {
    err = 'Passwords do not match'
  }

  if (dirty && !password) {
    err = 'Please enter a password'
  }

  const updatePassword = async () => {
    setResult(null)
    setFormState('busy')
    const res = (await cms.api.tina.request(
      `mutation($password: String!) { updatePassword(password: $password) }`,
      {
        variables: {
          password,
        },
      }
    )) as { updatePassword: boolean | null }
    if (!res?.updatePassword) {
      setResult('Error updating password')
    } else {
      setDirty(false)
      setPassword('')
      setConfirmPassword('')
      setResult('Password updated')
      setPasswordChangeRequired(false)
      // sleep for 1 second to allow the user to see the success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      client?.authProvider
        ?.logout()
        .then(async () => {
          if (typeof client?.onLogout === 'function') {
            await client.onLogout()
          }
          window.location.href = new URL(window.location.href).pathname
        })
        .catch((e) => console.error(e))
    }
    setFormState('idle')
  }

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col space-y-8 p-6">
          {passwordChangeRequired && (
            <div className="text-center text-red-500">
              Your password has expired. Please update your password.
            </div>
          )}
          <label className="block">
            <span className="text-gray-700">New Password</span>
            <BaseTextField
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              className={
                err
                  ? 'border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }
              value={password}
              onKeyDown={() => {
                setDirty(true)
                setResult(null)
              }}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Confirm New Password</span>
            <BaseTextField
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm password"
              className={
                err
                  ? 'border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }
              value={confirmPassword}
              onKeyDown={() => {
                setDirty(true)
                setResult(null)
              }}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {result && (
            <div className="text-center text-sm text-gray-500">{result}</div>
          )}
          {err && <div className="text-center text-sm text-red-500">{err}</div>}
          <Button
            onClick={updatePassword}
            disabled={err}
            variant={'primary'}
            busy={formState === 'busy'}
          >
            Update
          </Button>
        </div>
      </div>
    </>
  )
}
