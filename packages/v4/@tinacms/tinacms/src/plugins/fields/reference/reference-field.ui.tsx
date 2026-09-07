import { useQueries } from '@tanstack/react-query';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
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
// several. The hook order stays stable because `useQueries` takes the whole set
// in one call.
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
  return 'Select…';
};

export function ReferenceField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ReferenceFieldSchema>();
  const [value, setValue] = useFieldValue<string | null>(address);
  const errors = useFieldErrors(address);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => triggerRef.current?.focus());

  const lookup = useReferenceOptions(field.collections);
  console.log('field.collections', field.collections);
  console.log('lookup' , lookup);
  const { options, isLoading, error } = lookup;

  const noneItem = { value: '', label: 'None' };
  const missingItem =
    value && !isLoading && !error && !options.some((o) => o.value === value)
      ? { value, label: `${value} (missing)` }
      : null;

  const items = [
    ...(field.required ? [] : [noneItem]),
    ...(missingItem ? [missingItem] : []),
    ...options,
  ];

  return (
    <FieldWrapper errors={errors}>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(newValue) =>
          setValue(newValue === '' ? null : newValue)
        }
      >
        <SelectTrigger ref={triggerRef} id={address} disabled={isLoading || !!error}>
          <SelectValue placeholder={placeholderFor(lookup)} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
