/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'

const AuthTemplate = ({
  message,
  children,
}: {
  message?: string
  children: any
}) => {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-blue-900 to-gray-900 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-lg">
        <div className="px-5 py-4 border-b border-gray-150">
          <h2 className="text-2xl font-sans tracking-wide text-gray-700 flex items-center gap-0.5">
            <svg
              viewBox="0 0 32 32"
              fill="#EC4815"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-auto"
            >
              <path d="M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z" />
              <path d="M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z" />
            </svg>
            <span>Tina</span>
          </h2>
        </div>
        {message && (
          <div className="px-5 pt-4">
            <p className="text-base font-sans leading-normal">{message}</p>
          </div>
        )}
        <div className="px-5 py-4 flex gap-4 w-full justify-between">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthTemplate
