import { useEffect, useState } from 'react'

import React from 'react'
import { StrapiAuthenticationModal } from './strapi-auth-modal'
import { useCMS } from 'tinacms'

interface ProviderProps {
  children: any
  onLogin: () => void
  onLogout: () => void
}
export const StrapiProvider = ({
  children,
  onLogin,
  onLogout,
}: ProviderProps) => {
  const [activeModal, setActiveModal] = useState('none')

  const beginAuth = async () => {
    setActiveModal('authenticate')
  }

  const onClose = async () => {
    setActiveModal('none')
  }

  const onAuthSuccess = async () => {
    onLogin()
    setActiveModal('none')
  }

  useCMSEvent('cms:enable', beginAuth, [])
  useCMSEvent('cms:disable', onLogout, [])

  return (
    <>
      {activeModal === 'authenticate' && (
        <StrapiAuthenticationModal
          close={onClose}
          onAuthSuccess={onAuthSuccess}
        />
      )}
      {children}
    </>
  )
}

function useCMSEvent(event: string, callback: any, deps: React.DependencyList) {
  const cms = useCMS()
  useEffect(function() {
    return cms.events.subscribe(event, callback)
  }, deps)
}
