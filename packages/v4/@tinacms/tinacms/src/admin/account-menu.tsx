import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@tinacms/ui/components/sidebar';
import { LogOutIcon } from 'lucide-react';
import type { AuthUser } from '../core/auth/contract';
import { useOptionalAuthSlice } from '../editor/hooks';
import { useAuthAction } from './use-auth-action';

function SignOut({
  user,
  logout,
}: {
  user: AuthUser;
  logout: () => Promise<void>;
}) {
  const signOut = useAuthAction(logout, 'Sign-out failed. Please try again.');
  return (
    <SidebarMenu aria-label='Account'>
      <SidebarMenuItem>
        <p className='truncate px-2 py-1.5 text-sm'>
          {user.name ?? user.email ?? user.id}
        </p>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={signOut.run} disabled={signOut.pending}>
          <LogOutIcon className='size-4' aria-hidden='true' />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {signOut.error ? (
        <SidebarMenuItem>
          <p role='alert' className='px-2 text-sm text-destructive'>
            {signOut.error}
          </p>
        </SidebarMenuItem>
      ) : null}
    </SidebarMenu>
  );
}

export function AccountMenu() {
  const auth = useOptionalAuthSlice();
  if (auth?.status !== 'signed-in') return null;
  return <SignOut user={auth.user} logout={auth.logout} />;
}
