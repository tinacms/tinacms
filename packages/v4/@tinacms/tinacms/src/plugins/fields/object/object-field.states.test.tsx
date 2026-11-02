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

describe('object field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    renderView(props);
    const label = props.label as string;
    const count = props.invalidCount ?? 0;
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(document.querySelector('[title]')).toBeNull();

    if (props.display === 'drillIn') {
      const card = screen.getByRole('button', { name: `Open ${label}` });
      expect(card).toHaveTextContent(props.summary ?? NOT_SET);
      expect(screen.queryByLabelText('Title')).toBeNull();
      if (count > 0) {
        expect(card).toHaveAccessibleDescription(
          `${count} invalid ${count === 1 ? 'field' : 'fields'}`
        );
      } else {
        expect(card).not.toHaveAccessibleDescription();
      }
      return;
    }

    if (props.display === 'collapsible') {
      const header = screen.getByRole('button', { expanded: !!props.open });
      expect(header).toHaveTextContent(label);
      expect(!!screen.queryByLabelText('Title')).toBe(!!props.open);
      if (props.open) {
        expect(header).not.toHaveTextContent(NOT_SET);
        expect(header.querySelector('[data-slot=badge]')).toBeNull();
      } else {
        expect(header).toHaveTextContent(props.summary ?? NOT_SET);
        expect(header.querySelector('[data-slot=badge]') !== null).toBe(
          count > 0
        );
      }
      return;
    }

    expect(screen.getByRole('group', { name: label })).toContainElement(
      screen.getByLabelText('Title')
    );
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
});
