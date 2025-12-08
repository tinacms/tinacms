import React from 'react';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { useEditorContext } from '../../editor-context';

const useRawMarkdownToolbarButton = () => {
  const { setRawMode } = useEditorContext();

  const onMouseDown = () => {
    setRawMode(true);
  };

  return {
    props: {
      onMouseDown,
      pressed: false,
    },
  };
};

type RawMarkdownToolbarButtonProps = React.ComponentPropsWithoutRef<
  typeof ToolbarButton
> & {
  clear?: string | string[];
};

export const RawMarkdownToolbarButton: React.ForwardRefExoticComponent<
  RawMarkdownToolbarButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, RawMarkdownToolbarButtonProps>(
  ({ clear, ...rest }, ref) => {
    const { props } = useRawMarkdownToolbarButton();
    return (
      <ToolbarButton
        ref={ref}
        tooltip='Raw Markdown'
        {...rest}
        {...props}
        data-testid='markdown-button'
      >
        <Icons.raw />
      </ToolbarButton>
    );
  }
);

RawMarkdownToolbarButton.displayName = 'RawMarkdownToolbarButton';
