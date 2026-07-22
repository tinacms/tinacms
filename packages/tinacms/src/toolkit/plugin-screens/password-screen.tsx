import { UpdatePassword } from '@toolkit/components/account/update-password';
import { createScreen } from '@toolkit/react-screens';
import { KeyRound } from 'lucide-react';

export const PasswordScreenPlugin = createScreen({
  name: 'Change Password',
  Component: UpdatePassword,
  Icon: KeyRound,
  layout: 'fullscreen',
  navCategory: 'Account',
});
