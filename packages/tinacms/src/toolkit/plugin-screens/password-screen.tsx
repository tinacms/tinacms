import { MdVpnKey } from 'react-icons/md'
import { createScreen } from '@toolkit/react-screens'
import { UpdatePassword } from '@toolkit/components/account/update-password'

export const PasswordScreenPlugin = createScreen({
  name: 'Change Password',
  Component: UpdatePassword,
  Icon: MdVpnKey,
  layout: 'fullscreen',
  navCategory: 'Account',
})
