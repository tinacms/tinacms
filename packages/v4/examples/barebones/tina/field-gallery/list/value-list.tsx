import type { ControlProps } from '../field-frame';
import type { FrameFlags } from '../states';
import { ROW_MAIN, rowInputClasses, SortableList } from './sortable-list';
import type { ListItem, ListLimits, ListNouns } from './use-list';

export interface ItemInputProps {
  id: string;
  'aria-label': string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'data-force'?: 'hover' | 'focus';
  'data-row-main': true;
  disabled?: boolean;
  readOnly?: boolean;
  className: string;
  ref: (element: HTMLInputElement | null) => void;
}

export interface ValueListProps<V> {
  control: ControlProps;
  flags: FrameFlags;
  items: ListItem<V>[];
  onChange: (items: ListItem<V>[]) => void;
  onBlur: () => void;
  limits: ListLimits;
  nouns: ListNouns;
  describe: (value: V) => string;
  makeEmpty: () => V;
  parse: (text: string) => V;
  inputType?: 'text' | 'number';
  itemError: (value: V) => string | undefined;
  renderInput: (
    item: ListItem<V>,
    input: ItemInputProps,
    update: (value: V) => void
  ) => React.ReactNode;
}

// A list of plain values: each item is one input in its card, and the add slot
// takes the next value as typed text.
export function ValueList<V>({
  parse,
  inputType,
  itemError,
  renderInput,
  ...list
}: ValueListProps<V>) {
  const { id } = list.control;
  return (
    <SortableList
      {...list}
      adder={{ kind: 'type', parse, inputType }}
      renderItem={({
        item,
        index,
        label,
        locked,
        force,
        touched,
        focusRef,
        update,
      }) => {
        const error = touched ? itemError(item.value) : undefined;
        const errorId = `${id}-${item.id}-error`;
        return {
          header: renderInput(
            item,
            {
              ...ROW_MAIN,
              id: index === 0 ? id : `${id}-${item.id}`,
              'aria-label': label,
              'aria-invalid': error ? true : undefined,
              'aria-describedby': error ? errorId : undefined,
              'data-force': force,
              disabled: locked.disabled,
              readOnly: locked.readOnly,
              className: rowInputClasses,
              ref: focusRef,
            },
            update
          ),
          error: error ? { id: errorId, message: error } : undefined,
        };
      }}
    />
  );
}
