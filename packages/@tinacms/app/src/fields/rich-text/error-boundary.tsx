import React from 'react';

interface Props {
  children: React.ReactNode;
  onDismiss: () => void;
}

/**
 * The raw editor fails in more than one way: its chunk is loaded lazily, so the
 * import can reject, and it serializes the field on render, so content it can't
 * represent throws. Either one unmounts the whole admin without a boundary,
 * leaving a blank page.
 *
 * The heading names the outcome rather than a cause, since the boundary cannot
 * tell them apart. The message underneath is the one thing that lets an editor
 * act — "Marks inside inline code are not supported" says which formatting to
 * undo — and it is what a bug report needs verbatim.
 */
export class RawEditorErrorBoundary extends React.Component<
  Props,
  { message: string | null }
> {
  state: { message: string | null } = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error?.message ?? '' };
  }

  componentDidCatch(error: Error) {
    console.error('Raw markdown editor failed to open:', error);
  }

  render() {
    if (this.state.message === null) {
      return this.props.children;
    }
    // `whitespace-normal` because the field wrapper sets `nowrap`, which this
    // would otherwise inherit and clip the message.
    return (
      <div className='p-4 text-sm whitespace-normal text-gray-700'>
        <p className='mb-2'>
          Couldn't open this field in raw markdown. Your content hasn't changed.
        </p>
        {this.state.message ? (
          <p className='mb-3 font-mono text-xs break-words text-gray-500'>
            {this.state.message}
          </p>
        ) : null}
        <button
          type='button'
          className='rounded border border-gray-200 bg-white px-2 py-1 font-medium shadow hover:bg-blue-500 hover:text-white'
          onClick={() => {
            this.setState({ message: null });
            this.props.onDismiss();
          }}
        >
          Back to rich-text editor
        </button>
      </div>
    );
  }
}
