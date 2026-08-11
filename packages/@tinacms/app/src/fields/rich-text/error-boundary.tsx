import React from 'react';

interface Props {
  children: React.ReactNode;
  onDismiss: () => void;
}

/**
 * The raw editor is a lazy chunk, so a network failure or a dev-server restart
 * makes its import reject. Without a boundary that rejection unmounts the whole
 * admin, leaving a blank page. Keep the failure inside the field and offer a
 * way back to the rich-text editor.
 */
export class RawEditorErrorBoundary extends React.Component<
  Props,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Raw markdown editor failed to load:', error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div className='p-4 text-sm text-gray-700'>
        <p className='mb-3'>
          The raw markdown editor couldn't be loaded. Your content hasn't
          changed.
        </p>
        <button
          type='button'
          className='rounded border border-gray-200 bg-white px-2 py-1 font-medium shadow hover:bg-blue-500 hover:text-white'
          onClick={() => {
            this.setState({ hasError: false });
            this.props.onDismiss();
          }}
        >
          Back to rich-text editor
        </button>
      </div>
    );
  }
}
