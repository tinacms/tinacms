import * as React from 'react'
import { BasePasswordField, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'
import { Button } from '@toolkit/styles'

interface ExtraProps {
  placeholder: string
  confirmPlaceholder: string
  disabled?: boolean
}

const PasswordMask = '********'

export const PasswordFieldComponent = wrapFieldsWithMeta<
  {},
  InputProps & ExtraProps
>(({ field, form, meta, input, children }) => {
  const ref1 = React.useRef(null)
  const ref2 = React.useRef(null)
  const [error, setError] = React.useState(false)
  const [password, setPassword] = React.useState<string | undefined>()
  const [confirmPassword, setConfirmPassword] = React.useState<
    string | undefined
  >()

  React.useEffect(() => {
    if (password) {
      if (password === confirmPassword) {
        setError(false)
        form.change(field.name, password)
      } else {
        setError(true)
        form.change(field.name, '')
      }
    }
  }, [password, confirmPassword])

  return (
    <div className="flex flex-row space-x-4">
      <BasePasswordField
        autoComplete={'off'}
        value={password ?? PasswordMask}
        ref={ref1}
        disabled={field?.disabled ?? false}
        error={error}
        placeholder={field.placeholder || 'Password'}
        onKeyDown={(_) => {
          if (password === undefined) {
            setPassword('')
          }
          if (confirmPassword === undefined) {
            setConfirmPassword('')
          }
        }}
        onChange={(event) => {
          setPassword(event.target.value)
        }}
      />
      <BasePasswordField
        autoComplete={'off'}
        ref={ref2}
        value={confirmPassword ?? PasswordMask}
        disabled={field?.disabled ?? false}
        error={error}
        placeholder={field.confirmPlaceholder || 'Confirm Password'}
        onKeyDown={(_) => {
          if (password === undefined) {
            setPassword('')
          }
          if (confirmPassword === undefined) {
            setConfirmPassword('')
          }
        }}
        onChange={(event) => {
          setConfirmPassword(event.target.value)
        }}
      />
      <Button
        variant={'secondary'}
        disabled={password === undefined && confirmPassword === undefined}
        onClick={() => {
          setError(false)
          setPassword(undefined)
          setConfirmPassword(undefined)
          form.change(field.name, undefined)
        }}
      >
        Reset
      </Button>
    </div>
  )
})

export const PasswordFieldPlugin = {
  name: 'password',
  Component: PasswordFieldComponent,
  validate(value: any, values: any, meta: any, field: any) {
    let password = value
    if (Array.isArray(value)) {
      password = value[0]
    }
    if (password !== undefined) {
      if (field.required && !password) {
        return 'Required'
      }
    }
  },
  parse,
}
