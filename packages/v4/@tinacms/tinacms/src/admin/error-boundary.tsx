import { Component, type ReactNode } from 'react';

export interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  error: Error | null;
}

// React gives no hook for an error boundary. This must stay a class.
export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(cause: unknown): AdminErrorBoundaryState {
    if (cause instanceof Error) return { error: cause };
    return { error: new Error(String(cause)) };
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role='alert' className='p-4 text-sm'>
        <p className='font-semibold text-destructive'>
          TinaCMS could not start.
        </p>
        <p className='mt-1 text-muted-foreground'>{error.message}</p>
      </div>
    );
  }
}
