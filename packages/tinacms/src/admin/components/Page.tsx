/**

*/

import React from 'react'
import { LocalWarning, BillingWarning } from '@tinacms/toolkit'

export const PageWrapper = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => {
  return (
    <div className="relative left-0 w-full h-full bg-gray-50 shadow-2xl overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100">
      {children}
    </div>
  )
}

export const PageHeader = ({
  isLocalMode,
  children,
}: {
  isLocalMode?: boolean
  children: React.ReactChild | React.ReactChildren
}) => (
  <>
    {isLocalMode && <LocalWarning />}
    {!isLocalMode && <BillingWarning />}
    <div className="bg-white pb-4 pt-16 border-b border-gray-200 px-12">
      <div className="w-full mx-auto max-w-screen-xl">
        <div className="w-full flex justify-between items-end">{children}</div>
      </div>
    </div>
  </>
)

export const PageBody = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => <div className="py-10 px-12">{children}</div>

export const PageBodyNarrow = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => (
  <div className="py-10 px-12">
    <div className="w-full mx-auto max-w-screen-xl">{children}</div>
  </div>
)
