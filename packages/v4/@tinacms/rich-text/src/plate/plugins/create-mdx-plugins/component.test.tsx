import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  bannerTemplate,
  blockValue,
  ctaTemplate,
  inlineValue,
  renderEmbedEditor,
} from '../../../test/embed-harness';
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '.';

/**
 * `aria-expanded` is the one trigger attribute that both popover libraries set.
 * Every other hook (a `data-headlessui-state` attribute, a generated id) belongs
 * to one library, so a locator built on it cannot survive a port and cannot tell
 * a port that works from a port that renders nothing.
 */
const getTrigger = (): HTMLElement => {
  const trigger = document.querySelector('[aria-expanded]');
  if (!(trigger instanceof HTMLElement)) {
    throw new Error('no popover trigger in the document');
  }
  return trigger;
};

const getEditable = (): HTMLElement => {
  const editable = document.querySelector('[contenteditable="true"]');
  if (!(editable instanceof HTMLElement)) {
    throw new Error('no contentEditable in the document');
  }
  return editable;
};

/**
 * The outermost ancestor of a menu item that still excludes the trigger — the
 * panel root, wherever the popover put it. Headless UI renders the panel next
 * to the trigger; a portalled panel lands on `document.body`. Both give the
 * same element here, so a focus assertion built on it survives a port.
 */
const getMenuPanel = (): HTMLElement => {
  const trigger = getTrigger();
  const item = screen.getByText('Edit');
  let panel = item;
  for (
    let node = item.parentElement;
    node !== null;
    node = node.parentElement
  ) {
    if (node.contains(trigger)) {
      break;
    }
    panel = node;
  }
  if (panel === item) {
    throw new Error('menu item has no panel ancestor');
  }
  return panel;
};

const countEmbeds = (children: object[], type: string) =>
  JSON.stringify(children).split(`"${type}"`).length - 1;

describe('embed dot menu', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('inline embed', () => {
    it('renders the trigger as an inline span inside the contentEditable', () => {
      renderEmbedEditor({ value: inlineValue, templates: [ctaTemplate] });

      const trigger = getTrigger();
      const editable = getEditable();

      expect(trigger.tagName).toBe('SPAN');
      expect(editable.contains(trigger)).toBe(true);

      // A void embed is an island: Slate must not treat its chrome as editable
      // text, and a block-level box in an inline run reflows the paragraph.
      const island = trigger.closest('[contenteditable="false"]');
      expect(island).not.toBeNull();
      expect(island?.tagName).toBe('SPAN');

      // Every box the embed puts between the island and the trigger stays
      // inline. A block-level wrapper here breaks the paragraph onto its own
      // line. The paragraph above the island is Plate's own and is not in scope.
      const chrome: string[] = [];
      for (
        let node = trigger.parentElement;
        node !== null && node !== island;
        node = node.parentElement
      ) {
        chrome.push(node.tagName);
      }
      expect(chrome.length).toBeGreaterThan(0);
      expect(chrome).toEqual(chrome.map(() => 'SPAN'));
    });

    it('shows the label from the template title field', () => {
      renderEmbedEditor({ value: inlineValue, templates: [ctaTemplate] });

      expect(screen.getByText('Call to action: Sign up')).toBeInTheDocument();
    });

    it('opens the menu when the trigger is activated, and closes it again', async () => {
      renderEmbedEditor({ value: inlineValue, templates: [ctaTemplate] });

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');

      await user.click(getTrigger());

      expect(screen.getByText('Edit')).toBeVisible();
      expect(screen.getByText('Remove')).toBeVisible();
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      );
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('activates the embed field when Edit is chosen', async () => {
      const { onActivateField } = renderEmbedEditor({
        value: inlineValue,
        templates: [ctaTemplate],
      });

      await user.click(getTrigger());
      expect(onActivateField).not.toHaveBeenCalled();

      await user.click(screen.getByText('Edit'));

      expect(onActivateField).toHaveBeenCalledWith(
        'body.children.0.children.1.props'
      );
    });

    it('deletes the embed node when Remove is chosen', async () => {
      const { editor } = renderEmbedEditor({
        value: inlineValue,
        templates: [ctaTemplate],
      });

      expect(countEmbeds(editor.children, ELEMENT_MDX_INLINE)).toBe(1);

      await user.click(getTrigger());
      await user.click(screen.getByText('Remove'));

      await waitFor(() =>
        expect(countEmbeds(editor.children, ELEMENT_MDX_INLINE)).toBe(0)
      );
    });

    /**
     * This test measures the popover library as much as the component, and it
     * is the weakest instrument in this file. Read the next paragraph before
     * you treat a failure here as a regression.
     *
     * happy-dom drops the DOM selection when the tree mutates inside a focused
     * contentEditable. Slate then reads a selection with a null `anchorNode` in
     * its layout effect, and `toSlateRange` throws. `suppressThrow` does not
     * guard that throw. A control that replaces the menu with a plain
     * conditional `span` — no popover library, no `preventDefault` — reproduces
     * it, so the cause is the environment, not the menu.
     *
     * The current menu passes because Headless UI mounts its panel in a way
     * that happy-dom does not disturb. A different library can fail this test
     * and still be correct in a browser. Verify a replacement in a browser.
     */
    it('keeps the editor selection and keyboard focus when the menu opens', async () => {
      const { editor } = renderEmbedEditor({
        value: inlineValue,
        templates: [ctaTemplate],
      });

      editor.tf.focus();
      editor.tf.select({ path: [0, 0], offset: 3 });
      await waitFor(() => expect(editor.selection).not.toBeNull());
      const before = JSON.stringify(editor.selection);

      await user.click(getTrigger());

      expect(screen.getByText('Edit')).toBeVisible();
      expect(JSON.stringify(editor.selection)).toBe(before);

      // A popover that focuses its own panel on open pulls the caret out of the
      // editor: Slate reads the live DOM selection, so the next keystroke is
      // lost and the embed the editor was on stops being the selected node.
      expect(document.activeElement).not.toBeNull();
      expect(getMenuPanel().contains(document.activeElement)).toBe(false);
    });
  });

  describe('block embed', () => {
    it('renders the trigger inside a non-editable island', () => {
      renderEmbedEditor({ value: blockValue, templates: [bannerTemplate] });

      const trigger = getTrigger();

      expect(trigger.tagName).toBe('SPAN');
      expect(getEditable().contains(trigger)).toBe(true);
      expect(trigger.closest('[contenteditable="false"]')).not.toBeNull();
    });

    it('opens the menu and activates the embed field when Edit is chosen', async () => {
      const { onActivateField } = renderEmbedEditor({
        value: blockValue,
        templates: [bannerTemplate],
      });

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();

      await user.click(getTrigger());
      await user.click(screen.getByText('Edit'));

      expect(onActivateField).toHaveBeenCalledWith('body.children.1.props');
    });

    it('deletes the embed node when Remove is chosen', async () => {
      const { editor } = renderEmbedEditor({
        value: blockValue,
        templates: [bannerTemplate],
      });

      expect(countEmbeds(editor.children, ELEMENT_MDX_BLOCK)).toBe(1);

      await user.click(getTrigger());
      await user.click(screen.getByText('Remove'));

      await waitFor(() =>
        expect(countEmbeds(editor.children, ELEMENT_MDX_BLOCK)).toBe(0)
      );
    });
  });
});
