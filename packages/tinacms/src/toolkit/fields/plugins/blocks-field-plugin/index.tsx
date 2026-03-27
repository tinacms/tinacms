import * as React from 'react';
import type { Field, Form } from '@toolkit/forms';
import { Droppable, Draggable, SortableProvider } from '../dnd-kit-wrapper';
import {
  GroupLabel,
  ItemDeleteButton,
  ItemHeader,
  DragHandle,
  ItemClickTarget,
} from '../group-list-field-plugin';
import { useCMS } from '@toolkit/react-core/use-cms';
import { useEvent } from '@toolkit/react-core';
import type {
  FieldHoverEvent,
  FieldFocusEvent,
} from '@toolkit/fields/field-events';
import { BlockSelector } from './block-selector';
import { BlockSelectorBig } from './block-selector-big';
import { BiPencil } from 'react-icons/bi';
import { EmptyList, ListFieldMeta, ListPanel } from '../list-field-meta';

export interface BlocksFieldDefinititon extends Field {
  component: 'blocks';
  templates: {
    [key: string]: BlockTemplate;
  };
}

export interface BlockTemplate {
  label: string;
  defaultItem?: object | (() => object);
  fields?: Field[];
  /**
   * An optional function which generates `props` for
   * this items's `li`.
   */
  itemProps?: (item: object) => {
    /**
     * The `key` property used to optimize the rendering of lists.
     *
     * If rendering is causing problems, use `defaultItem` to
     * generate a unique key for the item.
     *
     * Reference:
     * * https://reactjs.org/docs/lists-and-keys.html
     */
    key?: string;
    /**
     * The label to be display on the list item.
     */
    label?: string;
  };
}

interface BlockFieldProps {
  input: any;
  meta: any;
  field: BlocksFieldDefinititon;
  form: any;
  tinaForm: Form;
  index?: number;
}

const Blocks = ({
  tinaForm,
  form,
  field,
  input,
  meta,
  index,
}: BlockFieldProps) => {
  // Tracks object references of blocks added during this editor session.
  // Object-reference tracking is robust to reordering, prepending, and deletion.
  // Cleared when the form is saved (becomes pristine).
  const [newObjects, setNewObjects] = React.useState<Set<object>>(new Set());

  const listRef = React.useRef<HTMLElement | null>(null);

  // Clear badges when the form is saved
  const prevPristine = React.useRef(meta.pristine);
  React.useEffect(() => {
    if (!prevPristine.current && meta.pristine) {
      setNewObjects(new Set());
    }
    prevPristine.current = meta.pristine;
  }, [meta.pristine]);

  const addItem = React.useCallback(
    (name: string, template: BlockTemplate, sourceRect?: DOMRect) => {
      let obj: any = {};
      if (typeof template.defaultItem === 'function') {
        obj = template.defaultItem();
      } else {
        obj = template.defaultItem || {};
      }
      obj._template = name;

      setNewObjects((prev) => new Set(prev).add(obj));

      if (sourceRect && listRef.current) {
        const listEl = listRef.current;
        const labelText = template.label || name;

        // Create floating label at the click position
        const floatingEl = document.createElement('span');
        floatingEl.textContent = labelText;
        floatingEl.style.cssText = [
          'position: fixed',
          `top: ${sourceRect.top}px`,
          `left: ${sourceRect.left}px`,
          'margin: 0',
          'font-size: 0.75rem',
          'font-weight: 600',
          'color: #EC4815',
          'background: transparent',
          'padding: 4px 8px',
          'pointer-events: none',
          'z-index: 2147483647',
          'white-space: nowrap',
        ].join('; ');
        document.body.appendChild(floatingEl);

        form.mutators.push(field.name, obj);

        // Double-rAF: wait for React to render the new item
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const getDirectText = (el: Element) => {
              let text = '';
              for (const node of el.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) text += node.textContent || '';
              }
              return text.trim();
            };

            const findAndAnimate = (retries = 5) => {
              const allSpans = listEl.querySelectorAll('span');
              let targetEl: Element | null = null;
              for (let i = allSpans.length - 1; i >= 0; i--) {
                if (getDirectText(allSpans[i]) === labelText) {
                  targetEl = allSpans[i];
                  break;
                }
              }

              if (!targetEl) {
                if (retries > 0) {
                  setTimeout(() => findAndAnimate(retries - 1), 50);
                } else {
                  floatingEl.remove();
                }
                return;
              }

              (targetEl as HTMLElement).scrollIntoView({ block: 'nearest' });
              const destRect = targetEl.getBoundingClientRect();

              (targetEl as HTMLElement).style.opacity = '0';

              floatingEl.style.transition = 'top 500ms ease-in-out, left 500ms ease-in-out';
              requestAnimationFrame(() => {
                floatingEl.style.top = `${destRect.top}px`;
                floatingEl.style.left = `${destRect.left}px`;
              });

              const onEnd = () => {
                floatingEl.remove();
                (targetEl as HTMLElement).style.opacity = '1';
              };
              floatingEl.addEventListener('transitionend', onEnd, { once: true });
              setTimeout(onEnd, 600); // safety fallback
            };

            findAndAnimate();
          });
        });
      } else {
        form.mutators.push(field.name, obj);
      }
    },
    [field.name, form.mutators]
  );

  const items = input.value || [];

  // @ts-ignore
  const isMax = items.length >= (field.max || Infinity);
  // @ts-ignore
  const isMin = items.length <= (field.min || 0);
  // @ts-ignore
  const fixedLength = field.min === field.max;

  return (
    <ListFieldMeta
      name={input.name}
      label={field.label}
      description={field.description}
      error={meta.error}
      triggerHoverEvents={false}
      index={index}
      tinaForm={tinaForm}
      actions={
        (!fixedLength || (fixedLength && !isMax)) &&
        // @ts-ignore
        (!field.visualSelector ? (
          <BlockSelector templates={field.templates} addItem={addItem} />
        ) : (
          <BlockSelectorBig
            label={field.label || field.name}
            templates={field.templates}
            addItem={addItem}
          />
        ))
      }
    >
      <ListPanel>
        <Droppable droppableId={field.name} type={field.name}>
          {(provider) => (
            <div ref={(el: any) => { const inner = (provider as any).innerRef; if (typeof inner === 'function') inner(el); else if (inner) inner.current = el; listRef.current = el; }} className='edit-page--list-parent'>
              {items.length === 0 && <EmptyList />}
              <SortableProvider
                items={items.map((_, index) => `${field.name}.${index}`)}
              >
                {items.map((block: any, index: any) => {
                  const template = field.templates[block._template];

                  if (!template) {
                    return (
                      <InvalidBlockListItem
                        // NOTE: Supressing warnings, but not helping with render perf
                        key={index}
                        index={index}
                        field={field}
                        tinaForm={tinaForm}
                      />
                    );
                  }

                  const itemProps = (item: object) => {
                    if (!template.itemProps) return {};
                    return template.itemProps(item);
                  };
                  return (
                    <BlockListItem
                      // NOTE: Supressing warnings, but not helping with render perf
                      key={index}
                      block={block}
                      template={template}
                      index={index}
                      field={field}
                      tinaForm={tinaForm}
                      isMin={isMin}
                      fixedLength={fixedLength}
                      isNew={newObjects.has(block)}
                      {...itemProps(block)}
                    />
                  );
                })}
              </SortableProvider>
              {provider.placeholder}
            </div>
          )}
        </Droppable>
      </ListPanel>
    </ListFieldMeta>
  );
};

interface BlockListItemProps {
  tinaForm: Form;
  field: BlocksFieldDefinititon;
  index: number;
  block: any;
  template: BlockTemplate;
  label?: string;
  isMin?: boolean;
  fixedLength?: boolean;
  isNew?: boolean;
}

const BlockListItem = ({
  label,
  tinaForm,
  field,
  index,
  template,
  isMin,
  fixedLength,
  isNew,
}: BlockListItemProps) => {
  const cms = useCMS();

  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index);
  }, [tinaForm, field, index]);

  const { dispatch: setHoveredField } =
    useEvent<FieldHoverEvent>('field:hover');
  const { dispatch: setFocusedField } =
    useEvent<FieldFocusEvent>('field:focus');

  return (
    <Draggable key={index} draggableId={`${field.name}.${index}`} index={index}>
      {(provider, snapshot) => (
        <>
          <ItemHeader provider={provider} isDragging={snapshot.isDragging}>
            <DragHandle
              isDragging={snapshot.isDragging}
              dragHandleProps={provider.dragHandleProps}
            />
            <ItemClickTarget
              onClick={() => {
                const state = tinaForm.finalForm.getState();
                if (state.invalid === true) {
                  // @ts-ignore
                  cms.alerts.error(
                    'Cannot navigate away from an invalid form.'
                  );
                  return;
                }

                cms.dispatch({
                  type: 'forms:set-active-field-name',
                  value: {
                    formId: tinaForm.id,
                    fieldName: `${field.name}.${index}`,
                  },
                });
                setFocusedField({
                  id: tinaForm.id,
                  fieldName: `${field.name}.${index}`,
                });
              }}
              onMouseOver={() =>
                setHoveredField({
                  id: tinaForm.id,
                  fieldName: `${field.name}.${index}`,
                })
              }
              onMouseOut={() => setHoveredField({ id: null, fieldName: null })}
            >
              <GroupLabel>
                {label || template.label}
                {isNew && (
                  <span className='ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-600 leading-none'>
                    New
                  </span>
                )}
              </GroupLabel>
              <BiPencil className='h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out' />
            </ItemClickTarget>
            {(!fixedLength || (fixedLength && !isMin)) && (
              <ItemDeleteButton disabled={isMin} onClick={removeItem} />
            )}
          </ItemHeader>
        </>
      )}
    </Draggable>
  );
};

const InvalidBlockListItem = ({
  tinaForm,
  field,
  index,
}: {
  tinaForm: Form;
  field: Field;
  index: number;
}) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index);
  }, [tinaForm, field, index]);

  return (
    <Draggable key={index} draggableId={`${field.name}.${index}`} index={index}>
      {(provider, snapshot) => (
        <ItemHeader provider={provider} isDragging={snapshot.isDragging}>
          <DragHandle
            isDragging={snapshot.isDragging}
            dragHandleProps={provider.dragHandleProps}
          />
          <ItemClickTarget>
            <GroupLabel error>Invalid Block</GroupLabel>
          </ItemClickTarget>
          <ItemDeleteButton onClick={removeItem} />
        </ItemHeader>
      )}
    </Draggable>
  );
};

export const BlocksField = Blocks;

export const BlocksFieldPlugin = {
  name: 'blocks',
  Component: BlocksField,
};
