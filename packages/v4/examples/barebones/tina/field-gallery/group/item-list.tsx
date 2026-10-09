import { useEffect, useRef, useState } from 'react';
import type { CaseControlProps } from '../case-row';
import { ROW_MAIN, SortableList } from '../list/sortable-list';
import { type ListItem, type ListNouns, newItem } from '../list/use-list';
import { ChevronIcon, ClosedBadges, type Locked } from './group-section';

export type OpenMode = 'inPlace' | 'nextLevel';

export interface FieldsArgs<V> {
  item: ListItem<V>;
  saved?: V;
  locked: Locked;
  touched: boolean;
  update: (value: V) => void;
}

export interface PickerArgs<V> {
  open: boolean;
  anchor: HTMLElement | null;
  onPick: (value: V) => void;
  onPickAll: (values: V[]) => void;
  onClose: () => void;
}

export interface ItemListProps<V> extends CaseControlProps<ListItem<V>[]> {
  mode: OpenMode;
  nouns: ListNouns;
  makeEmpty: () => V;
  describe: (value: V) => string;
  summary: (value: V) => React.ReactNode;
  errorCount: (value: V) => number;
  renderFields: (args: FieldsArgs<V>) => React.ReactNode;
  picker?: (args: PickerArgs<V>) => React.ReactNode;
}

// The next level takes the place of the list, and its first field takes focus.
function NextLevel({ children }: { children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>('input, textarea')?.focus();
  }, []);
  return (
    <div
      ref={panel}
      className='grid gap-3 rounded-md border border-border-subtle bg-card p-3'
    >
      {children}
    </div>
  );
}

const focusFirstField = (containerId: string) =>
  requestAnimationFrame(() =>
    document
      .getElementById(containerId)
      ?.querySelector<HTMLElement>('input, textarea')
      ?.focus()
  );

// A list whose items are groups: each item is a card with its collapsed
// summary, and it opens in place or as the next level.
export function ItemList<V>({
  control,
  flags,
  label,
  value,
  saved,
  onChange,
  onBlur,
  mode,
  nouns,
  makeEmpty,
  describe,
  summary,
  errorCount,
  renderFields,
  picker,
}: ItemListProps<V>) {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [request, setRequest] = useState<{
    index: number;
    anchor: HTMLElement | null;
  } | null>(null);
  const locked: Locked = {
    readOnly: Boolean(control.readOnly),
    disabled: Boolean(control.disabled),
  };
  const headerId = (itemId: string) => `${control.id}-${itemId}-open`;
  const bodyId = (itemId: string) => `${control.id}-${itemId}-body`;
  const savedOf = (itemId: string) =>
    saved.find((item) => item.id === itemId)?.value;
  const openItem = (itemId: string) => {
    if (mode === 'nextLevel') {
      setLevelId(itemId);
      return;
    }
    setOpenIds((ids) => (ids.includes(itemId) ? ids : [...ids, itemId]));
    focusFirstField(bodyId(itemId));
  };
  const toggle = (itemId: string) =>
    setOpenIds(
      openIds.includes(itemId)
        ? openIds.filter((open) => open !== itemId)
        : [...openIds, itemId]
    );
  const insert = (index: number, next: V) => {
    const item = newItem(next);
    onChange([...value.slice(0, index), item, ...value.slice(index)]);
    openItem(item.id);
  };

  const levelIndex = value.findIndex((item) => item.id === levelId);
  if (mode === 'nextLevel' && levelIndex >= 0) {
    const item = value[levelIndex];
    return (
      <NextLevel>
        <button
          type='button'
          onClick={() => {
            setLevelId(null);
            requestAnimationFrame(() =>
              document.getElementById(headerId(item.id))?.focus()
            );
          }}
          className='-ml-1 flex w-fit cursor-pointer items-center gap-1 rounded-sm px-1 text-label text-muted-foreground hover:text-foreground focus-visible:focus-ring'
        >
          <span aria-hidden='true' className='rotate-180'>
            <ChevronIcon />
          </span>
          Back to {label}
        </button>
        <p className='text-sm font-semibold'>{summary(item.value)}</p>
        {renderFields({
          item,
          saved: savedOf(item.id),
          locked,
          touched: Boolean(flags.touched),
          update: (next) =>
            onChange(
              value.map((other) =>
                other.id === item.id ? { ...other, value: next } : other
              )
            ),
        })}
      </NextLevel>
    );
  }

  return (
    <>
      <SortableList
        control={control}
        flags={flags}
        items={value}
        onChange={onChange}
        onBlur={onBlur}
        limits={{}}
        nouns={nouns}
        describe={describe}
        makeEmpty={makeEmpty}
        adder={
          picker
            ? {
                kind: 'request',
                // Open after the click that asked for it, so the picker
                // does not read that same click as one outside it.
                onRequest: (index, anchor) =>
                  setTimeout(() => setRequest({ index, anchor })),
              }
            : { kind: 'button', onAdded: openItem }
        }
        renderItem={({
          item,
          label: itemLabel,
          locked: itemLocked,
          force,
          touched,
          focusRef,
          update,
        }) => {
          const open = mode === 'inPlace' && openIds.includes(item.id);
          const savedValue = savedOf(item.id);
          const dirty =
            savedValue !== undefined &&
            JSON.stringify(savedValue) !== JSON.stringify(item.value);
          const errors = touched ? errorCount(item.value) : 0;
          const go = () =>
            mode === 'inPlace' ? toggle(item.id) : setLevelId(item.id);
          return {
            invalid: errors > 0,
            header: (
              <button
                {...ROW_MAIN}
                type='button'
                id={headerId(item.id)}
                ref={open ? undefined : focusRef}
                data-force={force}
                disabled={itemLocked.disabled}
                aria-expanded={mode === 'inPlace' ? open : undefined}
                onClick={go}
                className='flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xs px-1.5 py-1 text-left text-sm outline-none disabled:cursor-not-allowed'
              >
                {mode === 'inPlace' ? <ChevronIcon open={open} /> : null}
                <span className='flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5'>
                  <span className='min-w-12 flex-1 truncate'>
                    <span className='sr-only'>{itemLabel}: </span>
                    {summary(item.value)}
                  </span>
                  {open ? null : <ClosedBadges dirty={dirty} errors={errors} />}
                </span>
              </button>
            ),
            trailing:
              mode === 'nextLevel' ? (
                <button
                  type='button'
                  tabIndex={-1}
                  aria-hidden='true'
                  disabled={itemLocked.disabled}
                  onClick={go}
                  className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-muted disabled:cursor-not-allowed disabled:hover:bg-transparent'
                >
                  <ChevronIcon />
                </button>
              ) : undefined,
            below: open ? (
              <div
                id={bodyId(item.id)}
                className='grid gap-3 border-t border-border-subtle px-3 py-3'
              >
                {renderFields({
                  item,
                  saved: savedValue,
                  locked: itemLocked,
                  touched,
                  update,
                })}
              </div>
            ) : undefined,
          };
        }}
      />
      {picker
        ? picker({
            open: request !== null,
            anchor: request?.anchor ?? null,
            onPick: (next) => {
              if (request) insert(request.index, next);
              setRequest(null);
            },
            onPickAll: (all) => {
              if (request) {
                onChange([
                  ...value.slice(0, request.index),
                  ...all.map(newItem),
                  ...value.slice(request.index),
                ]);
              }
              setRequest(null);
            },
            onClose: () => setRequest(null),
          })
        : null}
    </>
  );
}
