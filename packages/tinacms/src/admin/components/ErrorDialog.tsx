import React from 'react'

export const ErrorDialog = (props: {
  title: string
  message: string
  error: Error
}) => {
  return (
    <div
      style={{
        background: '#efefef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>
        {
          '\
        body {\
          margin: 0;\
        }\
      '
        }
      </style>
      <div
        style={{
          background: '#fff',
          maxWidth: '400px',
          padding: '20px',
          fontFamily: "'Inter', sans-serif",
          borderRadius: '5px',
          boxShadow:
            '0 6px 24px rgb(0 37 91 / 5%), 0 2px 4px rgb(0 37 91 / 3%)',
        }}
      >
        <h3 style={{ color: '#eb6337' }}>{props.title}</h3>
        <p>{props.message}:</p>
        <pre
          style={{ marginTop: '1rem', overflowX: 'auto' }}
        >{`${props.error}`}</pre>
        <p>
          See our{' '}
          <a
            className="text-gray-600"
            style={{ textDecoration: 'underline' }}
            href="https://tina.io/docs/errors/faq/"
            target="_blank"
          >
            {' '}
            Error FAQ{' '}
          </a>{' '}
          for more information.
        </p>
      </div>
    </div>
  )
}
