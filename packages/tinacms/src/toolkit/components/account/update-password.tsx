import React, { useState } from 'react'
import { BaseTextField, Button, useCMS } from '@tinacms/toolkit'

export function UpdatePassword(props: {}) {
  const cms = useCMS()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dirty, setDirty] = useState(false)
  const [result, setResult] = useState(null)
  const [formState, setFormState] = useState<'idle' | 'busy'>('idle')

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
      `mutation($password: String!) { updatePassword(password: $password) { id } }`,
      {
        variables: {
          password,
        },
      }
    )) as { updatePassword: { id: string } | null }
    if (!res?.updatePassword?.id) {
      setResult('Error updating password')
    } else {
      setDirty(false)
      setPassword('')
      setConfirmPassword('')
      setResult('Password updated')
    }
    setFormState('idle')
  }

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col space-y-8 p-6">
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
