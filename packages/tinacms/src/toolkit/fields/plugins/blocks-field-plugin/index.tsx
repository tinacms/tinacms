import * as React from 'react';
import type { Field, Form } from '@toolkit/forms';
import { Droppable, Draggable } from 'react-beautiful-dnd';
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
  const addItem = React.useCallback(
    (name: string, template: BlockTemplate) => {
      let obj: any = {};
      if (typeof template.defaultItem === 'function') {
        obj = template.defaultItem();
      } else {
        obj = template.defaultItem || {};
      }
      obj._template = name;
      form.mutators.push(field.name, obj);
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
            <div ref={provider.innerRef} className='edit-page--list-parent'>
              {items.length === 0 && <EmptyList />}
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
                    {...itemProps(block)}
                  />
                );
              })}
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
}

const BlockListItem = ({
  label,
  tinaForm,
  field,
  index,
  template,
  isMin,
  fixedLength,
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
            <DragHandle isDragging={snapshot.isDragging} />
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
              <GroupLabel>{label || template.label}</GroupLabel>
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
          <DragHandle isDragging={snapshot.isDragging} />
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
