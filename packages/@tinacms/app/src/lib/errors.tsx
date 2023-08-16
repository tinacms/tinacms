import React from 'react'
import { TinaCMS } from 'tinacms'

const ErrorModalContent = (props: { title: string; errors: string[] }) => {
  const { title, errors } = props
  return (
    <>
      <div>{title}</div>
      <ul>
        {errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
    </>
  )
}

export const showErrorModal = (
  title: string,
  errors: string[],
  cms: TinaCMS
) => {
  cms.alerts.error(() => <ErrorModalContent title={title} errors={errors} />)
}
