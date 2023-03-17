/**



*/
import React from 'react'
import { XCircleIcon } from '@heroicons/react/solid'
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
// import { InvalidMarkdownElement } from '@tinacms/mdx/src/parse/plate'
export type EmptyTextElement = { type: 'text'; text: '' }
export type PositionItem = {
  line?: number | null
  column?: number | null
  offset?: number | null
  _index?: number | null
  _bufferIndex?: number | null
}
export type Position = {
  start: PositionItem
  end: PositionItem
}
export type InvalidMarkdownElement = {
  type: 'invalid_markdown'
  value: string
  message: string
  position?: Position
  children: [EmptyTextElement]
}

type ErrorType = {
  message: string
  position?: {
    startColumn: number
    endColumn: number
    startLineNumber: number
    endLineNumber: number
  }
}
export const buildError = (element: InvalidMarkdownElement): ErrorType => {
  return {
    message: element.message,
    position: element.position && {
      endColumn: element.position.end.column,
      startColumn: element.position.start.column,
      startLineNumber: element.position.start.line,
      endLineNumber: element.position.end.line,
    },
  }
}
export const buildErrorMessage = (element: InvalidMarkdownElement): string => {
  if (!element) {
    return ''
  }
  const errorMessage = buildError(element)
  const message = errorMessage
    ? `${errorMessage.message}${
        errorMessage.position
          ? ` at line: ${errorMessage.position.startLineNumber}, column: ${errorMessage.position.startColumn}`
          : ''
      }`
    : null
  return message
}

export function ErrorMessage({ error }: { error: InvalidMarkdownElement }) {
  const message = buildErrorMessage(error)

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button
            className={`p-2 shaodw-lg border ${
              error ? '' : ' opacity-0 hidden '
            }`}
          >
            <span className="sr-only">Errors</span>
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute top-8 w-[300px] -right-3 z-10 mt-3 px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="rounded-md bg-red-50 p-4 overflow-scroll">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 whitespace-pre-wrap">
                        {message}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
