import React, {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  createContext,
  forwardRef,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  UseComboboxInputResult,
  useComboboxInput,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox/react';

import {
  Combobox,
  ComboboxItem,
  type ComboboxItemProps,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
  useComboboxContext,
  useComboboxStore,
} from '@ariakit/react';
import { cn } from '@tinacms/ui/lib/utils';
import { Point, TElement } from '@udecode/plate';
import { filterWords } from '@udecode/plate-combobox';
import { useComposedRef, useEditorRef } from '@udecode/plate/react';
import { cva } from 'class-variance-authority';

type FilterFn = (
  item: { keywords?: string[]; value: string },
  search: string
) => boolean;

interface InlineComboboxContextValue {
  filter: FilterFn | false;
  inputProps: UseComboboxInputResult['props'];
  inputRef: RefObject<HTMLInputElement>;
  removeInput: UseComboboxInputResult['removeInput'];
  setHasEmpty: (hasEmpty: boolean) => void;
  showTrigger: boolean;
  trigger: string;
}

const InlineComboboxContext = createContext<InlineComboboxContextValue>(
  null as any
);

export const defaultFilter: FilterFn = ({ keywords = [], value }, search) =>
  [value, ...keywords].some((keyword) => filterWords(keyword, search));

interface InlineComboboxProps {
  children: ReactNode;
  element: TElement;
  trigger: string;
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
  setValue?: (value: string) => void;
  showTrigger?: boolean;
  value?: string;
}

const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const [valueState, setValueState] = useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  const setValue = useCallback(
    (newValue: string) => {
      setValueProp?.(newValue);

      if (!hasValueProp) {
        setValueState(newValue);
      }
    },
    [setValueProp, hasValueProp]
  );

  const insertPoint = React.useRef<Point | null>(null);

  useEffect(() => {
    const path = editor.api.findPath(element);

    if (!path) return;

    const point = editor.api.before(path);

    if (!point) return;

    const pointRef = editor.api.pointRef(point);
    insertPoint.current = pointRef.current;

    return () => {
      pointRef.unref();
    };
  }, [editor, element]);

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: true,
    cursorState,
    onCancelInput: (cause) => {
      if (cause !== 'backspace') {
        editor.tf.insertText(trigger + value, {
          at: insertPoint?.current ?? undefined,
        });
      }
    },
    ref: inputRef,
  });

  const [hasEmpty, setHasEmpty] = useState(false);

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [
      trigger,
      showTrigger,
      filter,
      inputRef,
      inputProps,
      removeInput,
      setHasEmpty,
    ]
  );

  const store = useComboboxStore({
    setValue: (newValue) => startTransition(() => setValue(newValue)),
  });

  const items = store.useState('items');

  useEffect(() => {
    if (!store.getState().activeId) {
      store.setActiveId(store.first());
    }
  }, [items, store]);

  return (
    <span contentEditable={false}>
      <ComboboxProvider
        open={
          (items.length > 0 || hasEmpty) &&
          (!hideWhenNoValue || value.length > 0)
        }
        store={store}
      >
        <InlineComboboxContext.Provider value={contextValue}>
          {children}
        </InlineComboboxContext.Provider>
      </ComboboxProvider>
    </span>
  );
};

const InlineComboboxInput = forwardRef<
  HTMLInputElement,
  HTMLAttributes<HTMLInputElement>
>(({ className, ...props }, propRef) => {
  const {
    inputProps,
    inputRef: contextRef,
    showTrigger,
    trigger,
  } = useContext(InlineComboboxContext);

  const store = useComboboxContext();
  const value = store.useState('value');

  const ref = useComposedRef(propRef, contextRef);

  return (
    <>
      {showTrigger && trigger}

      <span className='relative min-h-[1lh]'>
        <span
          aria-hidden='true'
          className='invisible overflow-hidden text-nowrap'
        >
          {value || '\u200B'}
        </span>

        <Combobox
          autoSelect
          className={cn(
            'absolute left-0 top-0 size-full bg-transparent outline-none',
            className
          )}
          ref={ref}
          value={value}
          {...inputProps}
          {...props}
        />
      </span>
    </>
  );
});

InlineComboboxInput.displayName = 'InlineComboboxInput';

const InlineComboboxContent: typeof ComboboxPopover = ({
  className,
  ...props
}) => {
  return (
    <Portal>
      <ComboboxPopover
        className={cn(
          'z-[9999999] box-border max-h-[min(18rem,var(--popover-available-height,18rem))] w-[min(300px,var(--popover-available-width,300px))] overflow-y-auto rounded-md bg-popover p-1 font-sans text-base text-foreground shadow-popover outline-none',
          className
        )}
        fitViewport
        overflowPadding={8}
        {...props}
      />
    </Portal>
  );
};

const comboboxItemVariants = cva(
  'relative box-border flex min-h-9 w-full select-none items-center gap-2.5 rounded-sm px-2.5 text-base text-foreground outline-none aria-disabled:text-muted-foreground',
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: 'text-muted-foreground',
        true: 'cursor-pointer data-[active-item=true]:bg-muted aria-disabled:cursor-default aria-disabled:data-[active-item=true]:bg-transparent',
      },
    },
  }
);

export type InlineComboboxItemProps = {
  keywords?: string[];
} & ComboboxItemProps &
  Required<Pick<ComboboxItemProps, 'value'>>;

const InlineComboboxItem = ({
  className,
  keywords,
  onClick,
  ...props
}: InlineComboboxItemProps) => {
  const { value } = props;

  const { filter, removeInput } = useContext(InlineComboboxContext);

  const store = useComboboxContext();

  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const search = filter && store.useState('value');

  const visible = useMemo(
    () => !filter || filter({ keywords, value }, search as string),
    [filter, value, keywords, search]
  );

  if (!visible) return null;

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      accessibleWhenDisabled
      onClick={(event) => {
        if (props.disabled) return;
        removeInput(true);
        onClick?.(event);
      }}
      {...props}
    />
  );
};

const InlineComboboxEmpty = ({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty } = useContext(InlineComboboxContext);
  const store = useComboboxContext();
  const items = store.useState('items');

  useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div
      className={cn(comboboxItemVariants({ interactive: false }), className)}
    >
      {children}
    </div>
  );
};

export {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
};
