import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { objectFieldStates } from './object-field.states';
import {
  NOT_SET,
  ObjectFieldView,
  type ObjectFieldViewProps,
} from './object-field.view';

const states: { name: string; props: ObjectFieldViewProps }[] =
  objectFieldStates;

const inert = ({ props }: { props: ObjectFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

const renderView = (props: ObjectFieldViewProps) =>
  render(
    <ObjectFieldView {...props}>
      <input aria-label='Title' />
    </ObjectFieldView>
  );

const ofLook = (display: ObjectFieldViewProps['display']) =>
  states.filter(({ props }) => props.display === display);

const countWords = (count: number) =>
  `${count} invalid ${count === 1 ? 'field' : 'fields'}`;

function expectDrillInCard(props: ObjectFieldViewProps) {
  const card = screen.getByRole('button', {
    name: `Open ${props.label as string}`,
  });
  const count = props.invalidCount ?? 0;
  expect(card).toHaveTextContent(props.summary ?? NOT_SET);
  expect(screen.queryByLabelText('Title')).toBeNull();
  if (count > 0) {
    expect(card).toHaveAccessibleDescription(countWords(count));
  } else {
    expect(card).not.toHaveAccessibleDescription();
  }
}

function expectCollapsible(props: ObjectFieldViewProps) {
  const count = props.invalidCount ?? 0;
  const header = screen.getByRole('button', { expanded: !!props.open });
  expect(header).toHaveTextContent(props.label as string);
  expect(!!screen.queryByLabelText('Title')).toBe(!!props.open);
  if (props.open) {
    expect(header).not.toHaveTextContent(NOT_SET);
    expect(header.querySelector('[data-slot=badge]')).toBeNull();
    return;
  }
  expect(header).toHaveTextContent(props.summary ?? NOT_SET);
  expect(header.querySelector('[data-slot=badge]') !== null).toBe(count > 0);
}

describe('object field states', () => {
  it.each(states)(
    'renders $name without unsaved marks or tooltips',
    ({ props }) => {
      renderView(props);
      expect(screen.queryByText(/unsaved/i)).toBeNull();
      expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
      expect(document.querySelector('[title]')).toBeNull();
      expect(screen.queryByText('(required)') !== null).toBe(!!props.required);
    }
  );

  it.each(ofLook('drillIn'))('draws $name as a card', ({ props }) => {
    renderView(props);
    expectDrillInCard(props);
  });

  it.each(ofLook('collapsible'))('draws $name as a header', ({ props }) => {
    renderView(props);
    expectCollapsible(props);
  });

  it.each(ofLook('fieldset'))(
    'draws $name as a labelled group',
    ({ props }) => {
      renderView(props);
      expect(
        screen.getByRole('group', {
          name: (name) => name.startsWith(props.label as string),
        })
      ).toContainElement(screen.getByLabelText('Title'));
    }
  );

  it('marks a read-only fieldset for its slots', () => {
    renderView({ display: 'fieldset', label: 'SEO', readOnly: true });
    expect(document.querySelector('[data-slot=field-wrapper]')).toHaveAttribute(
      'data-read-only',
      'true'
    );
  });

  it('names a drill-in card by the field name when the label is not text', () => {
    render(
      <ObjectFieldView
        display='drillIn'
        name='seo'
        label={<em>SEO</em>}
        onDrillIn={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Open seo' })).toBeVisible();
  });

  it.each(states.filter(inert))('never opens when $name', async ({ props }) => {
    const onOpenChange = vi.fn();
    const onDrillIn = vi.fn();
    renderView({ ...props, onOpenChange, onDrillIn });
    const button = screen.queryByRole('button');
    if (button) await userEvent.click(button);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onDrillIn).not.toHaveBeenCalled();
  });

  it('folds a collapsible with Enter and Space', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <ObjectFieldView
          display='collapsible'
          label='SEO'
          labelId='seo-label'
          open={open}
          onOpenChange={setOpen}
        >
          <input aria-label='Title' />
        </ObjectFieldView>
      );
    }
    render(<Harness />);
    await userEvent.tab();
    const header = screen.getByRole('button', { name: /SEO/ });
    expect(header).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    await userEvent.keyboard(' ');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('Title')).toBeNull();
  });

  it('opens a drill-in card with Enter and Space', async () => {
    const onDrillIn = vi.fn();
    render(
      <ObjectFieldView display='drillIn' label='SEO' onDrillIn={onDrillIn} />
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Open SEO' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onDrillIn).toHaveBeenCalledTimes(2);
  });

  it('renders the fields in place with no card or header when the object is the open level', () => {
    for (const display of ['fieldset', 'collapsible', 'drillIn'] as const) {
      const { unmount } = renderView({ display, label: 'SEO', inPlace: true });
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.queryByRole('button')).toBeNull();
      unmount();
    }
  });

  it('draws a collapsible closed and a card unnamed when the caller gives no handlers or name', async () => {
    const { unmount } = render(
      <ObjectFieldView display='collapsible' label='SEO'>
        <input aria-label='Title' />
      </ObjectFieldView>
    );
    const header = screen.getByRole('button', { name: /SEO/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    unmount();

    render(<ObjectFieldView display='drillIn' label={<em>SEO</em>} />);
    const card = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(card);
    expect(card).toBeVisible();
  });
});
