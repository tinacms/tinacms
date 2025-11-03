import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button, ButtonProps } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

export interface DropdownButtonItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * The main action to perform when the button is clicked
   */
  onMainAction?: () => void;
  /**
   * Array of dropdown menu items
   */
  items: DropdownButtonItem[];
  /**
   * Whether to show the dropdown arrow in a split button style
   * @default true
   */
  showSplitButton?: boolean;
  /**
   * Alignment of the dropdown menu
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end';
}

/**
 * A button component that combines a primary action with a dropdown menu of additional options.
 *
 * This component follows the split-button pattern found in TinaCMS, where the main button
 * performs a primary action and a small arrow button opens a dropdown menu with additional options.
 *
 * @example
 * // Basic usage with split button
 * <DropdownButton
 *   variant="primary"
 *   onMainAction={() => console.log('Save to new branch')}
 *   items={[
 *     { label: 'Save to protected branch', onClick: () => console.log('Protected') },
 *     { label: 'Save and publish', onClick: () => console.log('Publish') },
 *   ]}
 * >
 *   Save to new branch
 * </DropdownButton>
 *
 * @example
 * // Dropdown-only button (no main action)
 * <DropdownButton
 *   variant="secondary"
 *   showSplitButton={false}
 *   items={[
 *     { label: 'Save to new branch', onClick: () => console.log('New branch') },
 *     { label: 'Save to protected branch', onClick: () => console.log('Protected') },
 *   ]}
 * >
 *   Save options
 * </DropdownButton>
 *
 * @example
 * // With icons and destructive action
 * <DropdownButton
 *   variant="primary"
 *   onMainAction={() => console.log('Save')}
 *   items={[
 *     { label: 'Duplicate', onClick: () => console.log('Duplicate'), icon: <CopyIcon /> },
 *     { label: 'Delete', onClick: () => console.log('Delete'), variant: 'destructive', icon: <TrashIcon /> },
 *   ]}
 * >
 *   Save
 * </DropdownButton>
 */
export const DropdownButton = React.forwardRef<
  HTMLButtonElement,
  DropdownButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'medium',
      busy,
      disabled,
      rounded = 'full',
      children,
      className = '',
      onMainAction,
      items,
      showSplitButton = true,
      align = 'start',
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // If no main action is provided, the entire button opens the dropdown
    if (!onMainAction || !showSplitButton) {
      return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              busy={busy}
              disabled={disabled}
              rounded={rounded}
              className={cn('gap-2', className)}
              {...props}
            >
              {children}
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align} className='z-[100000]'>
            {items.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.variant}
              >
                {item.icon && <span className='mr-2'>{item.icon}</span>}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Split button: main button + dropdown button
    return (
      <div className={cn('inline-flex', className)}>
        <Button
          variant={variant}
          size={size}
          busy={busy}
          disabled={disabled}
          rounded='left'
          onClick={onMainAction}
          className='border-r-0'
          {...props}
        >
          {children}
        </Button>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button
              variant={variant}
              size={size}
              busy={busy}
              disabled={disabled}
              rounded='right'
              className='px-2'
              aria-label='More options'
            >
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <DropdownMenuItem
                  onClick={item.onClick}
                  disabled={item.disabled}
                  variant={item.variant}
                >
                  {item.icon && <span className='mr-2'>{item.icon}</span>}
                  {item.label}
                </DropdownMenuItem>
                {/* Add separator before destructive items */}
                {item.variant === 'destructive' &&
                  index < items.length - 1 &&
                  items[index + 1]?.variant !== 'destructive' && (
                    <DropdownMenuSeparator />
                  )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

DropdownButton.displayName = 'DropdownButton';
