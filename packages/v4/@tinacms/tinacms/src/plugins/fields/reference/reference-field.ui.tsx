import { useQueries } from '@tanstack/react-query';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@tinacms/ui/components/combobox';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useRef } from 'react';
import {
  CONTENT_STALE_TIME,
  contentKeys,
  useContentSlice,
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { ReferenceFieldSchema } from './reference-field.schema';

interface ReferenceOption {
  value: string;
  label: string;
}

interface ReferenceOptions {
  options: ReferenceOption[];
  isLoading: boolean;
  error: Error | null;
}

// `useCollectionDocuments` reads one collection, and a reference field can name
// several. `useQueries` takes the whole set in one call, so the hook order
// stays stable.
const useReferenceOptions = (collections: string[]): ReferenceOptions => {
  const content = useContentSlice();
  return useQueries({
    queries: collections.map((collection) => ({
      queryKey: contentKeys.list(collection),
      queryFn: () => content.list(collection),
      staleTime: CONTENT_STALE_TIME,
    })),
    combine: (results) => ({
      options: results.flatMap(
        (result) =>
          result.data?.map((summary) => ({
            value: summary.path,
            label: summary.path,
          })) ?? []
      ),
      isLoading: results.some((result) => result.isLoading),
      error: results.find((result) => result.error)?.error ?? null,
    }),
  });
};

const placeholderFor = ({ isLoading, error }: ReferenceOptions): string => {
  if (isLoading) return 'Loading…';
  if (error) return 'Could not load documents';
  return 'Search documents…';
};

export function ReferenceField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ReferenceFieldSchema>();
  const [value, setValue] = useFieldValue<string | null>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  const lookup = useReferenceOptions(field.collections);
  const { options, isLoading, error } = lookup;

  // A stored path whose document is gone stays selectable, so opening the
  // field does not silently drop the reference.
  const missing =
    value && !isLoading && !error && !options.some((o) => o.value === value)
      ? { value, label: `${value} (missing)` }
      : null;

  const items = missing ? [missing, ...options] : options;
  const selected = items.find((item) => item.value === value) ?? null;
  const unusable = isLoading || error !== null;

  return (
    <FieldWrapper errors={error ? [...errors, error.message] : errors}>
      <Combobox
        items={items}
        value={selected}
        onValueChange={(next: ReferenceOption | null) =>
          setValue(next?.value ?? null)
        }
      >
        <ComboboxInput
          ref={inputRef}
          id={address}
          disabled={unusable}
          showClear={!field.required}
          placeholder={placeholderFor(lookup)}
        />
        <ComboboxContent>
          <ComboboxEmpty>No documents match.</ComboboxEmpty>
          <ComboboxList>
            {(item: ReferenceOption) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
}
