import React from 'react'
import { BiCopyAlt } from 'react-icons/bi'

interface CopyFieldProps {
  label?: string
  description?: string
  value: any
}

export const CopyField = ({ label, description, value }: CopyFieldProps) => {
  const [copied, setCopied] = React.useState(false)
  const [fadeOut, setFadeOut] = React.useState(false)

  return (
    <div className="w-full">
      {label && (
        <label className="w-full mb-1 block flex-1  text-sm font-bold leading-5 text-gray-700">
          {label}
        </label>
      )}
      <span
        onClick={() => {
          if (copied === true) return
          setCopied(true)
          setTimeout(() => {
            setFadeOut(true)
          }, 2500)
          setTimeout(() => {
            setCopied(false)
            setFadeOut(false)
          }, 3000)

          navigator.clipboard.writeText(value)
        }}
        className={`shadow-inner text-base leading-5 whitespace-normal break-all px-3 py-2 text-gray-600 w-full bg-gray-50 border border-gray-200 transition-all ease-out duration-150 rounded-md relative overflow-hidden appearance-none flex items-center w-full cursor-pointer hover:bg-white hover:text-blue-500  ${
          copied ? `pointer-events-none` : ``
        }`}
      >
        <BiCopyAlt className="relative text-blue-500 shrink-0 w-5 h-auto mr-1.5 -ml-0.5 z-20" />{' '}
        {value}{' '}
        {copied && (
          <span
            className={`${
              fadeOut ? `opacity-0` : `opacity-100`
            } text-blue-500 transition-opacity	duration-500 absolute right-0 w-full h-full px-3 py-2 bg-white bg-opacity-90 flex items-center justify-center text-center tracking-wide font-medium z-10`}
          >
            <span>Copied to clipboard!</span>
          </span>
        )}
      </span>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}
