import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPerson,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { toast } from '@tinacms/ui/components/toast';
import { UserIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { AuthUser } from '../core/auth/contract';
import { useOptionalAuthSlice } from '../editor/hooks';
import { useAuthAction } from './use-auth-action';

function Account({
  user,
  logout,
}: {
  user: AuthUser;
  logout: () => Promise<void>;
}) {
  const signOut = useAuthAction(logout, 'Sign-out failed. Please try again.');
  const failure = signOut.error;
  useEffect(() => {
    if (failure) toast({ tone: 'error', title: failure });
  }, [failure]);
  const name = user.name ?? user.email ?? user.id;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='icon'
            size='sm'
            icon={UserIcon}
            aria-label='Account'
          />
        }
      />
      <DropdownMenuContent align='end' aria-label='Account'>
        <DropdownMenuPerson name={name} sub={user.email} />
        <DropdownMenuItem onClick={signOut.run} disabled={signOut.pending}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountMenu() {
  const auth = useOptionalAuthSlice();
  if (auth?.status !== 'signed-in') return null;
  return <Account user={auth.user} logout={auth.logout} />;
}
