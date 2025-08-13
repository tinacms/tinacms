import { Transition } from '@headlessui/react';
import { useCMS } from '@toolkit/react-tinacms';
import type { TinaState } from '@toolkit/tina-state';
import * as React from 'react';
import { BiEdit, BiChevronDown, BiChevronRight } from 'react-icons/bi';

type FormListItem = TinaState['formLists'][number]['items'][number];
type DocumentFormListItem = Extract<
  TinaState['formLists'][number]['items'][number],
  { type: 'document' }
>;

const Item = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>;
  depth: number;
  setActiveFormId: (id: string) => void;
}) => {
  const cms = useCMS();
  const depths = ['pl-6', 'pl-10', 'pl-14'];
  const form = React.useMemo(
    () => cms.state.forms.find(({ tinaForm }) => item.formId === tinaForm.id),
    [item.formId]
  );

  return (
    <button
      type='button'
      key={item.path}
      onClick={() => setActiveFormId(item.formId)}
      className={`${
        depths[depth]
      } pr-6 py-3 w-full h-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`}
    >
      <BiEdit className='opacity-70 w-5 h-auto text-blue-500 flex-none' />
      <div className='flex-1 flex flex-col gap-0.5 items-start'>
        <div className='group-hover:text-blue-500 font-sans text-xs font-semibold text-gray-700 whitespace-normal'>
          {form.tinaForm.label}
        </div>
        <div className='group-hover:text-blue-500 text-base truncate leading-tight text-gray-600'>
          {form.tinaForm.id}
        </div>
      </div>
    </button>
  );
};
export interface FormsListProps {
  formList: FormListItem[];
  setActiveFormId(id: string): void;
  isEditing: boolean;
  hidden?: boolean;
}

const FormListItem = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>;
  depth: number;
  setActiveFormId: (id: string) => void;
}) => {
  const cms = useCMS();
  const [openNestedGroups, setOpenNestedGroups] = React.useState<
    Record<string, boolean>
  >({});
  const idToLabel = React.useMemo(() => {
    const map = new Map<string, string>();
    cms.state.forms.forEach(({ tinaForm }) => {
      map.set(tinaForm.id, tinaForm.label || '');
    });
    return map;
  }, [cms.state.forms]);
  const getFormLabel = React.useCallback(
    (doc: DocumentFormListItem) => idToLabel.get(doc.formId) || '',
    [idToLabel]
  );
  const normalizeLabel = (value: string) => (value || '').trim().toLowerCase();
  return (
    <div className={'divide-y divide-gray-200'}>
      <Item setActiveFormId={setActiveFormId} item={item} depth={depth} />
      {item.subItems && (
        <ul className='divide-y divide-gray-200'>
          {(() => {
            const rendered: React.ReactNode[] = [];
            const subItems = item.subItems || [];
            for (let i = 0; i < subItems.length; i++) {
              const current = subItems[i];
              if (current.type !== 'document') continue;
              const firstDoc = current as DocumentFormListItem;
              const label = getFormLabel(firstDoc);
              const normalized = normalizeLabel(label);
              const group: DocumentFormListItem[] = [firstDoc];
              let j = i + 1;
              while (
                j < subItems.length &&
                subItems[j].type === 'document' &&
                normalizeLabel(
                  getFormLabel(subItems[j] as DocumentFormListItem)
                ) === normalized
              ) {
                group.push(subItems[j] as DocumentFormListItem);
                j++;
              }

              if (group.length === 1) {
                rendered.push(
                  <li key={`sub-${firstDoc.formId}`}>
                    <Item
                      setActiveFormId={setActiveFormId}
                      depth={depth + 1}
                      item={firstDoc}
                    />
                  </li>
                );
                continue;
              }

              const groupKey = `sub-${i}-${normalized}`;
              const isOpen = openNestedGroups[groupKey] ?? false;
              rendered.push(
                <li
                  key={`sub-group-${groupKey}`}
                  className='divide-y divide-gray-200'
                >
                  <button
                    type='button'
                    onClick={() =>
                      setOpenNestedGroups((s) => ({
                        ...s,
                        [groupKey]: !(s[groupKey] ?? false),
                      }))
                    }
                    className={`pl-10 pr-4 py-3 w-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`}
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {isOpen ? (
                        <BiChevronDown className='w-5 h-auto text-gray-500 flex-none' />
                      ) : (
                        <BiChevronRight className='w-5 h-auto text-gray-500 flex-none' />
                      )}
                      <div className='flex-1 flex flex-col gap-0.5 items-start min-w-0'>
                        <div className='flex items-center gap-2 min-w-0'>
                          <span className='group-hover:text-blue-500 font-sans text-xs font-semibold text-gray-700 truncate'>
                            {label}
                          </span>
                          <span className='flex-none px-2 py-0.5 rounded-full bg-gray-100 text-orange-600 text-[10px] font-semibold uppercase'>
                            referenced
                          </span>
                        </div>
                        <div className='text-xs text-gray-500'>
                          {group.length} items
                        </div>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <ul className='divide-y divide-gray-200'>
                      {group.map((doc) => (
                        <li key={`sub-doc-${doc.formId}`}>
                          <Item
                            setActiveFormId={setActiveFormId}
                            depth={Math.min(depth + 2, 2)}
                            item={doc}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );

              i = j - 1; // skip grouped items
            }
            return rendered;
          })()}
        </ul>
      )}
    </div>
  );
};

export const FormLists = (props: { isEditing: boolean }) => {
  const cms = useCMS();
  return (
    <Transition
      appear={true}
      // show={props.isEditing}
      show={true}
      as={'div'}
      enter='transition-all ease-out duration-150'
      enterFrom='opacity-0 -translate-x-1/2'
      enterTo='opacity-100'
      leave='transition-all ease-out duration-150'
      leaveFrom='opacity-100'
      leaveTo='opacity-0 -translate-x-1/2'
    >
      {cms.state.formLists.map((formList, index) => (
        <div key={`${formList.id}-${index}`}>
          {/* TODO: add labels for each list */}
          <FormList
            isEditing={props.isEditing}
            setActiveFormId={(id) => {
              cms.dispatch({ type: 'forms:set-active-form-id', value: id });
            }}
            formList={formList}
          />
        </div>
      ))}
    </Transition>
  );
};

export const FormList = (props: {
  isEditing: boolean;
  setActiveFormId: (id: string) => void;
  formList: TinaState['formLists'][number];
}) => {
  const cms = useCMS();

  const listItems: TinaState['formLists'][number]['items'] =
    React.useMemo(() => {
      const orderedListItems: TinaState['formLists'][number]['items'] = [];
      const globalItems: TinaState['formLists'][number]['items'] = [];
      const topItems: TinaState['formLists'][number]['items'] = [];
      // Always put global forms at the end
      props.formList.items.forEach((item) => {
        if (item.type === 'document') {
          const form = cms.state.forms.find(
            ({ tinaForm }) => tinaForm.id === item.formId
          );
          if (form.tinaForm.global) {
            globalItems.push(item);
          } else {
            orderedListItems.push(item);
          }
        } else {
          orderedListItems.push(item);
        }
      });
      if (orderedListItems[0]?.type === 'document') {
        topItems.push({ type: 'list', label: 'Documents' });
      }
      let extra = [];
      if (globalItems.length) {
        extra = [{ type: 'list', label: 'Global Documents' }, ...globalItems];
      }
      return [...topItems, ...orderedListItems, ...extra];
    }, [JSON.stringify(props.formList.items)]);

  // Track open/closed state for grouped labels (keyed by start index + label)
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {}
  );
  const idToLabel = React.useMemo(() => {
    const map = new Map<string, string>();
    cms.state.forms.forEach(({ tinaForm }) => {
      map.set(tinaForm.id, tinaForm.label || '');
    });
    return map;
  }, [cms.state.forms]);

  const getFormLabel = React.useCallback(
    (doc: DocumentFormListItem) => idToLabel.get(doc.formId) || '',
    [idToLabel]
  );

  const elements: React.ReactNode[] = [];
  const normalizeLabel = (value: string) => (value || '').trim().toLowerCase();
  for (let i = 0; i < listItems.length; i++) {
    const item = listItems[i];
    if (item.type === 'list') {
      const index = i;
      elements.push(
        <div
          key={`section-${item.label}-${index}`}
          className={`relative group text-left w-full bg-white shadow-sm
   border-gray-100 px-6 -mt-px pb-3 ${
     index > 0
       ? 'pt-6 bg-gradient-to-b from-gray-50 via-white to-white'
       : 'pt-3'
   }`}
        >
          <span
            className={
              'text-sm tracking-wide font-bold text-gray-700 uppercase'
            }
          >
            {item.label}
          </span>
        </div>
      );
      continue;
    }

    // Group adjacent documents with the same label
    const firstDoc = item as DocumentFormListItem;
    const label = getFormLabel(firstDoc);
    const normalized = normalizeLabel(label);
    const group: DocumentFormListItem[] = [firstDoc];
    let j = i + 1;
    while (
      j < listItems.length &&
      listItems[j].type === 'document' &&
      normalizeLabel(getFormLabel(listItems[j] as DocumentFormListItem)) ===
        normalized
    ) {
      group.push(listItems[j] as DocumentFormListItem);
      j++;
    }

    if (group.length === 1) {
      elements.push(
        <FormListItem
          setActiveFormId={(id) => props.setActiveFormId(id)}
          key={firstDoc.formId}
          item={firstDoc}
          depth={0}
        />
      );
      continue; // i will be incremented by the for-loop
    }

    const groupKey = `${i}-${normalized}`;
    const isOpen = openGroups[groupKey] ?? false;
    elements.push(
      <div key={`group-${groupKey}`} className='divide-y divide-gray-200'>
        <button
          type='button'
          onClick={() =>
            setOpenGroups((s) => ({
              ...s,
              [groupKey]: !(s[groupKey] ?? false),
            }))
          }
          className={`pl-6 pr-4 py-3 w-full h-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`}
        >
          <div className='flex items-center gap-2 min-w-0'>
            {isOpen ? (
              <BiChevronDown className='w-5 h-auto text-gray-500 flex-none' />
            ) : (
              <BiChevronRight className='w-5 h-auto text-gray-500 flex-none' />
            )}
            <div className='flex-1 flex flex-col gap-0.5 items-start min-w-0'>
              <div className='group-hover:text-blue-500 font-sans text-xs font-semibold text-gray-700 truncate'>
                {label}
              </div>
              <div className='text-xs text-gray-500'>{group.length} items</div>
            </div>
          </div>
        </button>
        {isOpen && (
          <ul className='divide-y divide-gray-200'>
            {group.map((doc) => (
              <li key={`doc-${doc.formId}`}>
                <FormListItem
                  setActiveFormId={(id) => props.setActiveFormId(id)}
                  item={doc}
                  depth={1}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );

    // Skip over the grouped items
    i = j - 1;
  }

  return (
    <ul>
      <li className={'divide-y divide-gray-200'}>{elements}</li>
    </ul>
  );
};
