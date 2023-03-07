import React from 'react'
import { Button } from '@tinacms/toolkit'
import { BiError, BiSync } from 'react-icons/bi'

export const FullscreenError = ({
  title = 'Error',
  errorMessage = 'It looks like something went wrong.',
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="text-red-500 text-4xl mb-6 flex items-center">
        <BiError className="w-12 h-auto fill-current text-red-400 opacity-70 mr-1" />{' '}
        {title}
      </div>
      <p className="text-gray-700 text-xl mb-8">{errorMessage}</p>
      <Button variant="danger" onClick={() => window.location.reload()}>
        <BiSync className="w-7 h-auto fill-current opacity-70 mr-1" /> Reload
      </Button>
    </div>
  )
}
