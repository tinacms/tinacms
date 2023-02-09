/**

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
    <AuthTemplate>
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
