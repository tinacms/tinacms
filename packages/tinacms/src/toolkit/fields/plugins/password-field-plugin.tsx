import * as React from 'react'
import { BasePasswordField, InputProps, Toggle } from '../components'
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
  const [passwordChangeRequired, setPasswordChangeRequired] = React.useState<
    boolean | undefined
  >(input.value.passwordChangeRequired)

  React.useEffect(() => {
    if (password) {
      if (password === confirmPassword) {
        setError(false)
        form.change(field.name, { value: password, passwordChangeRequired })
      } else {
        setError(true)
        form.change(field.name, undefined)
      }
    } else {
      setError(false)
      form.change(field.name, { passwordChangeRequired })
    }
  }, [password, confirmPassword, passwordChangeRequired])

  return (
    <div className="flex flex-col">
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
            setPasswordChangeRequired(true)
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
            setPasswordChangeRequired(undefined)
            form.change(field.name, undefined)
          }}
        >
          Reset
        </Button>
      </div>
      <div className="flex w-full items-center pl-1 pt-3">
        <Toggle
          field={{ name: 'passwordChangeRequired', component: 'toggle' }}
          input={{
            value: passwordChangeRequired ?? true,
            onChange: () => setPasswordChangeRequired(!passwordChangeRequired),
          }}
          name="passwordChangeRequired"
        />
        <div>
          <label className="block font-sans text-xs font-semibold text-gray-700 whitespace-normal h-full items-center ml-1">
            Require Password Change on Next Login
          </label>
        </div>
      </div>
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
    // passwordChangeRequired undefined indicates this is a new user and
    // the password hasn't been set
    if (field.required && password?.passwordChangeRequired === undefined) {
      return 'Required'
    }
  },
  parse,
}
