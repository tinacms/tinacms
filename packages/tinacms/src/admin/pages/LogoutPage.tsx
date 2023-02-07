/**

*/

import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BiLogOut } from 'react-icons/bi'
import { MdOutlineArrowBack } from 'react-icons/md'
import { useEditState, setEditing } from '@tinacms/sharedctx'
import AuthTemplate from '../components/AuthTemplate'
import { Button, useCMS } from '@tinacms/toolkit'

export const LogoutRedirect = () => {
  const cms = useCMS()
  const { setEdit } = useEditState()
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || '/'
  const logout = async () => {
    if (cms?.api?.tina?.logout) {
      await cms.api.tina.logout()
      if (cms?.api?.tina?.onLogout) {
        await cms?.api?.tina?.onLogout()
      }
    }
    setEdit(false)
  }
  useEffect(() => {
    logout().then(() => {
      window.location.href = slug
    })
  }, [])

  return <div>Redirecting to {slug} ...</div>
}

const logout = () => {
  setEditing(false)
  window.location.href = '/'
}

const LogoutPage = () => {
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
          onClick={() => logout()}
          type="submit"
          variant="primary"
          size="custom"
          className="text-base h-12 px-6 flex-1"
        >
          <BiLogOut className="w-6 h-auto mr-1.5 opacity-80" /> Log Out of Tina
        </Button>
      </div>
    </AuthTemplate>
  )
}

export default LogoutPage
