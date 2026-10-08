import { Button } from '@tinacms/ui/components/button';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@tinacms/ui/components/sidebar';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { LogOutIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { AuthError, type AuthUser } from '../core/auth/contract';
import { useAuthSlice } from '../editor/hooks';

const failureMessage = (cause: unknown, fallback: string): string => {
  if (cause instanceof AuthError) {
    return cause.message;
  }
  return fallback;
};

function SignInScreen({ login }: { login: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = async () => {
    setPending(true);
    setError(null);
    try {
      await login();
    } catch (cause) {
      setError(failureMessage(cause, 'Sign-in failed. Please try again.'));
    } finally {
      setPending(false);
    }
  };
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-lg font-semibold'>Sign in to TinaCMS</h1>
      <Button onClick={signIn} disabled={pending}>
        Sign in
      </Button>
      {error ? (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      ) : null}
    </main>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthSlice();
  if (!auth || auth.status === 'signed-in') return <>{children}</>;
  if (auth.status === 'loading') {
    return (
      <div
        role='status'
        aria-label='Checking sign-in'
        className='flex min-h-svh items-center justify-center p-4'
      >
        <Skeleton className='h-8 w-40' />
      </div>
    );
  }
  if (auth.LoginScreen) return <auth.LoginScreen />;
  return <SignInScreen login={auth.login} />;
}

function SignOut({
  user,
  logout,
}: {
  user: AuthUser;
  logout: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signOut = async () => {
    setPending(true);
    setError(null);
    try {
      await logout();
    } catch (cause) {
      setError(failureMessage(cause, 'Sign-out failed. Please try again.'));
    } finally {
      setPending(false);
    }
  };
  return (
    <SidebarMenu aria-label='Account'>
      <SidebarMenuItem>
        <p className='truncate px-2 py-1.5 text-sm'>
          {user.name ?? user.email ?? user.id}
        </p>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={signOut} disabled={pending}>
          <LogOutIcon className='size-4' aria-hidden='true' />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {error ? (
        <SidebarMenuItem>
          <p role='alert' className='px-2 text-sm text-destructive'>
            {error}
          </p>
        </SidebarMenuItem>
      ) : null}
    </SidebarMenu>
  );
}

export function AccountMenu() {
  const auth = useAuthSlice();
  if (auth?.status !== 'signed-in') return null;
  return <SignOut user={auth.user} logout={auth.logout} />;
}
