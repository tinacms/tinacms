import { Button } from '@tinacms/ui/components/button';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@tinacms/ui/components/combobox';
import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { type Ref, useMemo } from 'react';

export interface ReferenceFieldViewDocument {
  /** The stored value: the document's path. */
  value: string;
  /** What the box shows and search matches. */
  label: string;
  /** The line under the label, such as `Authors · content/authors/ada.md`. */
  meta: string;
  /** The list heading. Set only when the field names several collections. */
  group?: string;
  /** The collection that listed the document, for opening it. */
  collection: string;
}

export type ReferenceFieldViewProps = Pick<
  FieldWrapperProps,
  | 'label'
  | 'htmlFor'
  | 'labelId'
  | 'required'
  | 'errors'
  | 'help'
  | 'helpId'
  | 'warnings'
> & {
  id: string;
  documents: ReferenceFieldViewDocument[];
  /** The stored path, or `null` when there is none. */
  value: string | null;
  onChange?: (value: string | null) => void;
  /** Leave it out to hide the Open button. */
  onOpen?: (document: ReferenceFieldViewDocument) => void;
  /** True only once every list has loaded and none lists the stored path. */
  missing?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
};

interface DocumentGroup {
  /** The collection name, so collections with equal labels stay apart. */
  value: string;
  label: string;
  items: ReferenceFieldViewDocument[];
}

const hasGroups = (documents: ReferenceFieldViewDocument[]) =>
  documents.length > 0 &&
  documents.every((document) => document.group !== undefined);

const groupDocuments = (
  documents: ReferenceFieldViewDocument[]
): DocumentGroup[] => {
  const groups = new Map<string, DocumentGroup>();
  for (const document of documents) {
    const group = groups.get(document.collection);
    if (group) group.items.push(document);
    else
      groups.set(document.collection, {
        value: document.collection,
        label: document.group ?? document.collection,
        items: [document],
      });
  }
  return [...groups.values()];
};

function DocumentOption({
  document,
}: {
  document: ReferenceFieldViewDocument;
}) {
  return (
    <ComboboxItem value={document}>
      <span className='flex min-w-0 flex-col'>
        <span className='truncate'>{document.label}</span>
        <span className='truncate text-sm text-muted-foreground'>
          {document.meta}
        </span>
      </span>
    </ComboboxItem>
  );
}

/**
 * The Reference field's search box, list and Open button inside the Field
 * Wrapper, with no editor state. `ReferenceField` feeds it from the form and
 * the content lists; the state catalogue feeds it by hand. It derives nothing
 * about loading or a missing document: the caller passes `missing` and
 * `placeholder`.
 */
export function ReferenceFieldView({
  id,
  documents,
  value,
  onChange,
  onOpen,
  missing = false,
  placeholder = 'Search documents…',
  disabled = false,
  readOnly = false,
  ref,
  ...frame
}: ReferenceFieldViewProps) {
  const found = documents.find((document) => document.value === value);
  // A stored path no list answers still fills the box, as it was saved.
  const selected = useMemo<ReferenceFieldViewDocument | null>(
    () =>
      found ??
      (value === null
        ? null
        : { value, label: value, meta: value, collection: '' }),
    [found, value]
  );
  const editable = !disabled && !readOnly;
  const clearable = (!frame.required || missing) && editable && value !== null;
  const grouped = hasGroups(documents);
  const items = useMemo(
    () => (grouped ? groupDocuments(documents) : documents),
    [grouped, documents]
  );

  return (
    <FieldWrapper {...frame} disabled={disabled}>
      <div className='flex items-center gap-1.5'>
        <Combobox
          items={items}
          value={selected}
          isItemEqualToValue={(item, chosen) => item.value === chosen.value}
          disabled={disabled}
          readOnly={readOnly}
          onValueChange={(next: ReferenceFieldViewDocument | null) =>
            onChange?.(next?.value ?? null)
          }
        >
          <ComboboxInput
            ref={ref}
            id={id}
            className='min-w-0 flex-1'
            disabled={disabled}
            showClear={clearable}
            triggerTabbable={false}
            clearTabbable
            placeholder={placeholder}
            aria-invalid={frame.errors?.length ? true : undefined}
            aria-describedby={frame.help ? frame.helpId : undefined}
          />
          <ComboboxContent className='w-max min-w-(--anchor-width)'>
            <ComboboxEmpty>No documents match.</ComboboxEmpty>
            <ComboboxList>
              {grouped
                ? (group: DocumentGroup) => (
                    <ComboboxGroup key={group.value} items={group.items}>
                      <ComboboxLabel>{group.label}</ComboboxLabel>
                      <ComboboxCollection>
                        {(document: ReferenceFieldViewDocument) => (
                          <DocumentOption
                            key={document.value}
                            document={document}
                          />
                        )}
                      </ComboboxCollection>
                    </ComboboxGroup>
                  )
                : (document: ReferenceFieldViewDocument) => (
                    <DocumentOption key={document.value} document={document} />
                  )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {onOpen ? (
          <span className='size-8 flex-none'>
            {found && !missing && !disabled ? (
              <Button
                variant='icon'
                size='sm'
                icon='external'
                aria-label={`Open ${found.value}`}
                onClick={() => onOpen(found)}
              />
            ) : null}
          </span>
        ) : null}
      </div>
    </FieldWrapper>
  );
}
