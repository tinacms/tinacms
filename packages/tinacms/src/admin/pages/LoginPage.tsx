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
import { BiLogIn } from 'react-icons/bi'
import { MdOutlineArrowBack } from 'react-icons/md'
import { useEditState } from '@tinacms/sharedctx'
import AuthTemplate from '../components/AuthTemplate'

const LoginPage = () => {
  const { setEdit } = useEditState()
  const login = () => setEdit(true)
  return (
    <AuthTemplate message="Please log in to Tina Cloud to access your content.">
      <a
        href="/"
        className="flex-1 text-center inline-flex justify-center items-center px-8 py-3 shadow-sm text-sm leading-4 font-medium rounded-full text-gray-600 border border-gray-150 hover:opacity-80 hover:bg-gray-50 focus:outline-none focus:shadow-outline-blue  transition duration-150 ease-out"
      >
        <MdOutlineArrowBack className="w-6 h-auto mr-1.5 opacity-80" /> Back to
        site
      </a>
      <button
        type="submit"
        onClick={() => login()}
        className="flex-1 justify-center text-center inline-flex items-center px-8 py-3 shadow-sm border border-transparent text-sm leading-4 font-medium rounded-full text-white hover:opacity-80 focus:outline-none focus:shadow-outline-blue  transition duration-150 ease-out"
        style={{ background: '#0084FF' }}
      >
        <BiLogIn className="w-6 h-auto mr-1.5 opacity-80" /> Log in
      </button>
    </AuthTemplate>
  )
}

export default LoginPage
