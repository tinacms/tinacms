import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArrayDrillInView } from './array/array-field.view';
import { BooleanFieldView } from './boolean/boolean-field.view';
import { datetimeFieldStates } from './datetime/datetime-field.states';
import { DatetimeFieldView } from './datetime/datetime-field.view';
import { imageFieldStates } from './image/image-field.states';
import { ImageFieldView } from './image/image-field.view';
import { numberFieldStates } from './number/number-field.states';
import { NumberFieldView } from './number/number-field.view';
import { ObjectFieldView } from './object/object-field.view';
import { referenceFieldStates } from './reference/reference-field.states';
import { ReferenceFieldView } from './reference/reference-field.view';
import { richTextFieldStates } from './rich-text/rich-text-field.states';
import { RichTextFieldView } from './rich-text/rich-text-field.view';
import { selectFieldStates } from './select/select-field.states';
import { SelectFieldView } from './select/select-field.view';
import { stringFieldStates } from './string/string-field.states';
import { StringFieldView } from './string/string-field.view';

const marked = (container: HTMLElement) =>
  container.querySelectorAll('[data-active]');

const widgets = [
  {
    name: 'string input',
    draw: (active: boolean) => (
      <StringFieldView {...stringFieldStates[0].props} active={active} />
    ),
    tag: 'INPUT',
  },
  {
    name: 'string textarea',
    draw: (active: boolean) => (
      <StringFieldView
        {...stringFieldStates[0].props}
        multiline
        active={active}
      />
    ),
    tag: 'TEXTAREA',
  },
  {
    name: 'number',
    draw: (active: boolean) => (
      <NumberFieldView {...numberFieldStates[0].props} active={active} />
    ),
    tag: 'INPUT',
  },
  {
    name: 'datetime',
    draw: (active: boolean) => (
      <DatetimeFieldView {...datetimeFieldStates[0].props} active={active} />
    ),
    tag: 'INPUT',
  },
  {
    name: 'select',
    draw: (active: boolean) => (
      <SelectFieldView {...selectFieldStates[0].props} active={active} />
    ),
    tag: 'BUTTON',
  },
  {
    name: 'reference (combobox)',
    draw: (active: boolean) => (
      <ReferenceFieldView {...referenceFieldStates[0].props} active={active} />
    ),
    tag: 'DIV',
  },
  {
    name: 'boolean',
    draw: (active: boolean) => (
      <BooleanFieldView
        id='featured'
        label='Featured'
        checked={false}
        onChange={() => {}}
        active={active}
      />
    ),
    tag: 'SPAN',
  },
  {
    name: 'rich text frame',
    draw: (active: boolean) => (
      <RichTextFieldView {...richTextFieldStates[0].props} active={active} />
    ),
    tag: 'DIV',
  },
  {
    name: 'image group',
    draw: (active: boolean) => (
      <ImageFieldView {...imageFieldStates[0].props} active={active} />
    ),
    tag: 'DIV',
  },
  {
    name: 'object drill-in card',
    draw: (active: boolean) => (
      <ObjectFieldView
        label='SEO'
        display='drillIn'
        summary='Home'
        active={active}
      />
    ),
    tag: 'BUTTON',
  },
  {
    name: 'array drill-in card',
    draw: (active: boolean) => (
      <ArrayDrillInView label='Blocks' count={2} active={active} />
    ),
    tag: 'BUTTON',
  },
];

describe('widgets show the active look', () => {
  it.each(widgets)(
    '$name carries data-active only while active',
    ({ draw, tag }) => {
      const { container, rerender } = render(draw(false));
      expect(marked(container)).toHaveLength(0);

      rerender(draw(true));
      const [control, ...rest] = marked(container);
      expect(rest).toHaveLength(0);
      expect(control.tagName).toBe(tag);
    }
  );
});
