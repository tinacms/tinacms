import { Button } from '@tinacms/ui/components/button';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import type { ReactNode } from 'react';
import type { AuthUser } from '../core/auth/contract';
import { useOptionalAuthSlice } from '../editor/hooks';
import { useAuthAction } from './use-auth-action';

function SignInScreen({ login }: { login: () => Promise<void> }) {
  const signIn = useAuthAction(login, 'Sign-in failed. Please try again.');
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-lg font-semibold'>Sign in to TinaCMS</h1>
      <Button onClick={signIn.run} disabled={signIn.pending}>
        Sign in
      </Button>
      {signIn.error ? (
        <p role='alert' className='text-sm text-destructive'>
          {signIn.error}
        </p>
      ) : null}
    </main>
  );
}

function ForbiddenScreen({
  user,
  logout,
}: {
  user: AuthUser;
  logout: () => Promise<void>;
}) {
  const signOut = useAuthAction(logout, 'Sign-out failed. Please try again.');
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-lg font-semibold'>You don't have access</h1>
      <p className='text-sm text-muted-foreground'>
        You are signed in as {user.name ?? user.email ?? user.id}, but this
        account cannot edit this project.
      </p>
      <Button onClick={signOut.run} disabled={signOut.pending}>
        Sign out
      </Button>
      {signOut.error ? (
        <p role='alert' className='text-sm text-destructive'>
          {signOut.error}
        </p>
      ) : null}
    </main>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useOptionalAuthSlice();
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
  if (auth.status === 'forbidden') {
    return <ForbiddenScreen user={auth.user} logout={auth.logout} />;
  }
  if (auth.LoginScreen) return <auth.LoginScreen />;
  return <SignInScreen login={auth.login} />;
}
