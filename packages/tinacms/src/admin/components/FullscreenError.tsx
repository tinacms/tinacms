import React from 'react'

export const FullscreenError = ({
  errorMessage = 'It looks like something went wrong',
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="text-red-500 text-4xl mb-4">Error</div>
      <p className="text-gray-700 text-xl mb-8">{errorMessage}</p>
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  )
}
