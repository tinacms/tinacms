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
import { Button } from '@tinacms/toolkit'

const LoginPage = () => {
  const { setEdit } = useEditState()
  const login = () => setEdit(true)
  return (
    <AuthTemplate heading="Tina &ndash; Log In">
      <div className="flex w-full flex-1 gap-4 items-center justify-end">
        <Button
          onClick={() => {
            window.location.href = '/'
          }}
          variant="white"
          size="custom"
          className="text-base h-12 px-6 flex-shrink-0 flex-grow-0"
        >
          <MdOutlineArrowBack className="w-6 h-auto mr-1.5 opacity-80" /> Back
          To Site
        </Button>
        <Button
          onClick={() => login()}
          variant="primary"
          size="custom"
          className="text-base h-12 px-6 flex-1"
          type="submit"
        >
          <BiLogIn className="w-6 h-auto mr-2 opacity-80" /> Edit With Tina
        </Button>
      </div>
    </AuthTemplate>
  )
}

export default LoginPage
