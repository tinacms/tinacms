import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FieldGalleryScreen } from './gallery-screen';

const liveCopy = (caseId: string) =>
  within(screen.getByTestId(`${caseId}-live`));

function renderGallery() {
  const user = userEvent.setup();
  render(<FieldGalleryScreen />);
  return user;
}

describe('field frame', () => {
  it('names a required field and marks it required', () => {
    renderGallery();
    const title = liveCopy('string-single-line').getByRole('textbox', {
      name: /^Title/,
    });
    expect(title).toHaveAccessibleName('Title (required)');
    expect(title).toHaveAttribute('aria-required', 'true');
    expect(title).toHaveAccessibleDescription(
      'Shown in search results and the browser tab.'
    );
  });

  it('holds an error back until the editor first leaves the field', async () => {
    const user = renderGallery();
    const live = liveCopy('string-single-line');
    const title = live.getByRole('textbox', { name: /^Title/ });

    await user.clear(title);
    expect(live.queryByRole('alert')).not.toBeInTheDocument();

    await user.tab();
    expect(live.getByRole('alert')).toHaveTextContent('Enter a title.');
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription(/Enter a title\./);
  });

  it('updates the error live once it shows', async () => {
    const user = renderGallery();
    const live = liveCopy('string-single-line');
    const title = live.getByRole('textbox', { name: /^Title/ });

    await user.clear(title);
    await user.tab();
    await user.type(title, 'Hello');
    expect(live.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a typed number past the limit as invalid', async () => {
    const user = renderGallery();
    const live = liveCopy('number-limits');
    const minutes = live.getByRole('spinbutton', { name: /^Reading time/ });

    await user.clear(minutes);
    await user.type(minutes, '75');
    await user.tab();
    expect(live.getByRole('alert')).toHaveTextContent('Use 60 or less.');
  });

  it('shows the dirty dot after a change and clears it when the saved value comes back', async () => {
    const user = renderGallery();
    const title = liveCopy('string-single-line').getByRole('textbox', {
      name: /^Title/,
    });

    await user.type(title, '!');
    expect(title).toHaveAccessibleName('Title (required) Unsaved');

    await user.type(title, '{Backspace}');
    expect(title).toHaveAccessibleName('Title (required)');
  });
});

describe('number', () => {
  it('steps with the arrow keys and stops at the maximum', async () => {
    const user = renderGallery();
    const live = liveCopy('number-limits');
    const minutes = live.getByRole('spinbutton', { name: /^Reading time/ });

    await user.clear(minutes);
    await user.type(minutes, '59');
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(minutes).toHaveValue(60);
    expect(live.getByRole('button', { name: 'Increase' })).toBeDisabled();
  });

  it('stops the step buttons inside the field at the limits', async () => {
    const user = renderGallery();
    const live = liveCopy('number-limits');
    const minutes = live.getByRole('spinbutton', { name: /^Reading time/ });

    await user.clear(minutes);
    await user.type(minutes, '2');
    await user.click(live.getByRole('button', { name: 'Decrease' }));
    await user.click(live.getByRole('button', { name: 'Decrease' }));
    expect(minutes).toHaveValue(1);
    expect(live.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    expect(live.getByRole('button', { name: 'Increase' })).toBeEnabled();
  });
});

describe('gallery', () => {
  it('keeps the frozen states out of the tab order', () => {
    renderGallery();
    expect(screen.getByTestId('string-single-line-states')).toHaveAttribute(
      'inert'
    );
  });

  it('says why a state does not apply', () => {
    renderGallery();
    expect(
      within(screen.getByTestId('boolean-checkbox-states')).getByText(
        /Always on or off\./
      )
    ).toBeInTheDocument();
  });
});

describe('clickable labels', () => {
  it('toggles the checkbox from its label', async () => {
    const user = renderGallery();
    const live = liveCopy('boolean-checkbox');
    const box = live.getByRole('checkbox', { name: /^Featured/ });
    expect(box).toBeChecked();
    await user.click(live.getByText('Featured'));
    expect(box).not.toBeChecked();
  });

  it('chooses a radio option from its text', async () => {
    const user = renderGallery();
    const live = liveCopy('select-radio');
    await user.click(live.getByText('Podcast episode'));
    expect(live.getByRole('radio', { name: 'Podcast episode' })).toBeChecked();
  });
});

describe('select', () => {
  it('leaves out "None" when a choice is required', async () => {
    const user = renderGallery();
    await user.click(
      liveCopy('select-dropdown').getByRole('combobox', { name: /^Category/ })
    );
    expect(
      await screen.findByRole('option', { name: 'Guide' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'None' })
    ).not.toBeInTheDocument();
  });

  it('names the radio buttons as one group and moves the choice', async () => {
    const user = renderGallery();
    const live = liveCopy('select-radio');
    const group = live.getByRole('radiogroup', { name: /^Format/ });
    expect(group).toHaveAttribute('aria-required', 'true');

    await user.click(live.getByRole('radio', { name: 'Article' }));
    expect(live.getByRole('radio', { name: 'Article' })).toBeChecked();
    expect(live.getByRole('radio', { name: 'Video' })).not.toBeChecked();
    expect(group).toHaveAccessibleName('Format (required) Unsaved');
  });

  it('keeps multi-select values in the order of the options', async () => {
    const user = renderGallery();
    const live = liveCopy('select-multi');
    const topics = live.getByRole('combobox', { name: /^Topics/ });
    await user.click(topics);
    await user.click(await screen.findByRole('option', { name: 'Deployment' }));
    await user.click(await screen.findByRole('option', { name: 'Search' }));

    const chips = live
      .getAllByText(/^(Editing|Media|Search|Deployment)$/)
      .map((chip) => chip.textContent);
    expect(chips).toEqual(['Editing', 'Media', 'Search', 'Deployment']);
  });

  it('names the button that removes a chosen topic', () => {
    renderGallery();
    expect(
      liveCopy('select-multi').getByRole('button', { name: 'Remove Editing' })
    ).toBeInTheDocument();
  });

  it('counts a topic removed and added back as unchanged', async () => {
    const user = renderGallery();
    const topics = liveCopy('select-multi').getByRole('combobox', {
      name: /^Topics/,
    });
    await user.click(topics);
    await user.click(await screen.findByRole('option', { name: 'Editing' }));
    expect(topics).toHaveAccessibleName('Topics (required) Unsaved');

    await user.click(await screen.findByRole('option', { name: 'Editing' }));
    expect(topics).toHaveAccessibleName('Topics (required)');
  });
});

describe('reference', () => {
  it('shows each document by title, with its collection and path', async () => {
    const user = renderGallery();
    await user.click(
      liveCopy('reference-one').getByRole('combobox', { name: /^Author/ })
    );
    expect(
      await screen.findByRole('option', {
        name: 'Grace Hopper Authors · content/authors/grace.md',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'content/authors/alan.md Authors · content/authors/alan.md',
      })
    ).toBeInTheDocument();
  });

  it('groups documents from several collections under their collection', async () => {
    const user = renderGallery();
    await user.click(
      liveCopy('reference-several').getByRole('combobox', {
        name: /^Related content/,
      })
    );
    expect(await screen.findByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
  });

  it('offers to open the chosen document', () => {
    renderGallery();
    expect(
      liveCopy('reference-one').getByRole('button', {
        name: 'Open Ada Lovelace',
      })
    ).toBeInTheDocument();
  });

  it('warns about a missing document without making the field invalid', async () => {
    const user = renderGallery();
    const live = liveCopy('reference-missing');
    const author = live.getByRole('combobox', { name: /^Author/ });

    expect(live.getByRole('status')).toHaveTextContent(
      'This document no longer exists.'
    );
    expect(author).toHaveValue('content/authors/charles-babbage.md');
    expect(author).not.toHaveAttribute('aria-invalid');

    await user.click(live.getByRole('button', { name: 'Clear' }));
    expect(live.queryByRole('status')).not.toBeInTheDocument();
  });
});

const tagValues = (live: ReturnType<typeof liveCopy>) =>
  live
    .getAllByRole('textbox', { name: /^Tag \d/ })
    .map((input) => (input as HTMLInputElement).value);

const chooseAction = async (
  user: ReturnType<typeof userEvent.setup>,
  live: ReturnType<typeof liveCopy>,
  item: string,
  action: string
) => {
  await user.click(live.getByRole('button', { name: `Actions for ${item}` }));
  await user.click(await screen.findByRole('menuitem', { name: action }));
};

describe('lists', () => {
  it('adds typed tags at the end and keeps focus for the next one', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    const slot = live.getByRole('textbox', { name: 'Add a tag' });
    await user.type(slot, 'Media{Enter}Search{Enter}');

    expect(tagValues(live)).toEqual([
      'Getting started',
      'Visual editing',
      'Self-hosting',
      'Media',
      'Search',
    ]);
    expect(slot).toHaveFocus();
    expect(slot).toHaveValue('');
    expect(live.getByRole('group', { name: /^Tags/ })).toHaveAccessibleName(
      'Tags (required) Unsaved'
    );
  });

  it('adds above, adds below and duplicates below an item', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 2', 'Duplicate');
    expect(tagValues(live)).toEqual([
      'Getting started',
      'Visual editing',
      'Visual editing',
      'Self-hosting',
    ]);

    await chooseAction(user, live, 'Tag 1', 'Add above');
    expect(tagValues(live)[0]).toBe('');
    expect(live.getByRole('textbox', { name: 'Tag 1' })).toHaveFocus();
  });

  it('removes an item straight away and brings it back with Undo', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 2', 'Remove');

    expect(tagValues(live)).toEqual(['Getting started', 'Self-hosting']);
    expect(live.getByText('Removed “Visual editing”.')).toBeInTheDocument();

    await user.click(live.getByRole('button', { name: 'Undo' }));
    expect(tagValues(live)).toEqual([
      'Getting started',
      'Visual editing',
      'Self-hosting',
    ]);
    expect(live.getByRole('textbox', { name: 'Tag 2' })).toHaveFocus();
    expect(live.getByRole('group', { name: /^Tags/ })).toHaveAccessibleName(
      'Tags (required)'
    );
  });

  it('moves focus to the next item after a removal, or to the add slot when none are left', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 2', 'Remove');
    expect(live.getByRole('textbox', { name: 'Tag 2' })).toHaveValue(
      'Self-hosting'
    );
    expect(live.getByRole('textbox', { name: 'Tag 2' })).toHaveFocus();

    await chooseAction(user, live, 'Tag 1', 'Remove');
    await chooseAction(user, live, 'Tag 1', 'Remove');
    expect(live.getByRole('textbox', { name: 'Add a tag' })).toHaveFocus();
  });

  it('keeps only the latest removal for Undo', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 1', 'Remove');
    await chooseAction(user, live, 'Tag 1', 'Remove');

    expect(live.getAllByRole('button', { name: 'Undo' })).toHaveLength(1);
    expect(live.getByText('Removed “Visual editing”.')).toBeInTheDocument();
  });

  it('reorders with the menu', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 1', 'Move down');
    expect(tagValues(live)).toEqual([
      'Visual editing',
      'Getting started',
      'Self-hosting',
    ]);
  });

  it('reorders with the arrow keys on the handle, and says where the item went', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    live.getByRole('button', { name: 'Move Tag 3' }).focus();
    await user.keyboard('{ArrowUp}{ArrowUp}');

    expect(tagValues(live)).toEqual([
      'Self-hosting',
      'Getting started',
      'Visual editing',
    ]);
    expect(
      live.getByText('Moved “Self-hosting” to position 1 of 3.')
    ).toBeInTheDocument();
  });

  it('shows an empty tag error under that tag once the editor leaves the list', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    await chooseAction(user, live, 'Tag 3', 'Add below');
    const added = live.getByRole('textbox', { name: 'Tag 4' });
    expect(added).toHaveFocus();
    expect(live.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(document.body);
    expect(added).toHaveAttribute('aria-invalid', 'true');
    expect(added).toHaveAccessibleDescription('Enter a tag, or remove it.');
  });

  it('shows a whole-list error under the list', async () => {
    const user = renderGallery();
    const live = liveCopy('list-text');
    for (let removed = 0; removed < 3; removed++) {
      await chooseAction(user, live, 'Tag 1', 'Remove');
    }
    await user.click(document.body);
    expect(
      live.getByRole('group', { name: /^Tags/ })
    ).toHaveAccessibleDescription('Add at least one tag.');
  });

  it('turns off the add slot at the maximum and says why', () => {
    renderGallery();
    const live = liveCopy('list-number-limits');
    expect(
      live.getByRole('spinbutton', { name: 'Up to 4 widths.' })
    ).toBeDisabled();
  });

  it('turns off removing at the minimum and says why', async () => {
    const user = renderGallery();
    const live = liveCopy('list-number-limits');
    for (let removed = 0; removed < 3; removed++) {
      await chooseAction(user, live, 'Width 1', 'Remove');
    }
    await user.click(live.getByRole('button', { name: 'Actions for Width 1' }));
    const remove = await screen.findByRole('menuitem', { name: /^Remove/ });
    expect(remove).toHaveAttribute('aria-disabled', 'true');
    expect(remove).toHaveTextContent('At least 1 width.');
  });
});

describe('groups', () => {
  it('shows the summary when closed, and the open fields when open', async () => {
    const user = renderGallery();
    const live = liveCopy('object-group');
    const header = live.getByRole('button', { name: /^SEO/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(live.getByRole('textbox', { name: /^Meta title/ })).toBeVisible();

    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveTextContent('Getting started with TinaCMS');
    expect(
      live.queryByRole('textbox', { name: /^Meta title/ })
    ).not.toBeInTheDocument();
  });

  it('shows the error of a closed group ahead of its Unsaved marker', async () => {
    const user = renderGallery();
    const live = liveCopy('object-group');
    await user.clear(live.getByRole('textbox', { name: /^Meta title/ }));
    await user.click(document.body);
    await user.click(live.getByRole('button', { name: /^SEO/ }));

    const header = live.getByRole('button', { name: /^SEO/ });
    expect(header).toHaveTextContent('1 error');
    expect(header).not.toHaveTextContent('Unsaved');

    await user.click(header);
    await user.type(live.getByRole('textbox', { name: /^Meta title/ }), 'SEO');
    await user.click(document.body);
    await user.click(header);
    expect(header).not.toHaveTextContent('1 error');
    expect(header).toHaveTextContent('Unsaved');
  });

  it('carries a problem at the third level up to every closed level above', async () => {
    const user = renderGallery();
    const live = liveCopy('object-nested');
    const url = live.getByRole('textbox', { name: /^URL/ });
    await user.clear(url);
    await user.type(url, 'docs setup');
    await user.click(document.body);

    await user.click(live.getByRole('button', { name: /^Link/ }));
    expect(live.getByRole('button', { name: /^Link/ })).toHaveTextContent(
      '1 error'
    );
    await user.click(live.getByRole('button', { name: /^Hero/ }));
    expect(live.getByRole('button', { name: /^Hero/ })).toHaveTextContent(
      /1 error$/
    );
  });
});

describe('lists of groups', () => {
  it('opens an item in place', async () => {
    const user = renderGallery();
    const live = liveCopy('list-groups-in-place');
    const item = live.getByRole('button', { name: /^Question 2:/ });
    await user.click(item);
    expect(item).toHaveAttribute('aria-expanded', 'true');
    expect(live.getByRole('textbox', { name: /^Question/ })).toHaveValue(
      'Is it free?'
    );
  });

  it('opens a new item and puts focus in its first field', async () => {
    const user = renderGallery();
    const live = liveCopy('list-groups-in-place');
    await user.click(live.getByRole('button', { name: 'Add a question' }));
    expect(live.getByRole('textbox', { name: /^Question/ })).toHaveFocus();
  });

  it('shows the error of a closed item ahead of its Unsaved marker', async () => {
    const user = renderGallery();
    const live = liveCopy('list-groups-in-place');
    const item = live.getByRole('button', { name: /^Question 2:/ });
    await user.click(item);
    await user.clear(live.getByRole('textbox', { name: /^Question/ }));
    await user.click(document.body);
    await user.click(live.getByRole('button', { name: /^Question 2:/ }));

    const closed = live.getByRole('button', { name: /^Question 2:/ });
    expect(closed).toHaveTextContent('New question');
    expect(closed).toHaveTextContent('1 error');
    expect(closed).not.toHaveTextContent('Unsaved');
  });

  it('opens an item as the next level and comes back to it', async () => {
    const user = renderGallery();
    const live = liveCopy('list-groups-next-level');
    await user.click(live.getByRole('button', { name: /^Question 3:/ }));

    expect(live.getByRole('textbox', { name: /^Question/ })).toHaveValue(
      'Can I host it myself?'
    );
    expect(live.getByRole('textbox', { name: /^Question/ })).toHaveFocus();

    await user.click(live.getByRole('button', { name: 'Back to FAQ' }));
    expect(live.getByRole('button', { name: /^Question 3:/ })).toHaveFocus();
  });
});

describe('blocks', () => {
  const picker = async () =>
    within(await screen.findByRole('dialog', { name: 'Choose a block' }));

  const blockSummaries = (live: ReturnType<typeof liveCopy>) =>
    live
      .getAllByRole('button', { name: /^Block \d+:/ })
      .map((button) => button.textContent?.replace(/^Block \d+: /, ''));

  it('adds a block from the template picker and opens it on its first field', async () => {
    const user = renderGallery();
    const live = liveCopy('blocks-plain');
    await user.click(live.getByRole('button', { name: 'Add a block' }));
    await user.click(
      (await picker()).getByRole('button', { name: /^Call to action/ })
    );

    expect(blockSummaries(live)).toContain('Call to action');
    expect(live.getByRole('textbox', { name: /^Heading/ })).toHaveFocus();
  });

  it('groups the templates and searches them', async () => {
    const user = renderGallery();
    await user.click(
      liveCopy('blocks-plain').getByRole('button', { name: 'Add a block' })
    );
    const list = await picker();
    expect(list.getByRole('group', { name: 'Conversion' })).toBeVisible();

    await user.type(
      list.getByRole('textbox', { name: 'Search blocks' }),
      'quote'
    );
    expect(list.getByRole('button', { name: /^Testimonial/ })).toBeVisible();
    expect(
      list.queryByRole('button', { name: /^Hero/ })
    ).not.toBeInTheDocument();
  });

  it('adds a block above an item from its menu', async () => {
    const user = renderGallery();
    const live = liveCopy('blocks-plain');
    await chooseAction(user, live, 'Block 2', 'Add above');
    await user.click(
      (await picker()).getByRole('button', { name: /^Newsletter sign-up/ })
    );
    expect(blockSummaries(live)[1]).toBe('Newsletter sign-up');
  });

  it('opens a block picked from thumbnails as the next level', async () => {
    const user = renderGallery();
    const live = liveCopy('blocks-visual');
    await user.click(live.getByRole('button', { name: 'Add a block' }));
    await user.click((await picker()).getByRole('button', { name: /^Hero/ }));

    expect(
      live.getByRole('button', { name: 'Back to Page sections' })
    ).toBeInTheDocument();
    expect(live.getByRole('textbox', { name: /^Heading/ })).toHaveFocus();
  });
});

describe('rich text', () => {
  it('names the editor from the field label', async () => {
    renderGallery();
    expect(
      await liveCopy('rich-frame').findByRole('textbox', { name: /^Summary/ })
    ).toBeInTheDocument();
  });
});

describe('images', () => {
  const media = async () =>
    within(await screen.findByRole('dialog', { name: /from Media$/ }));

  it('warns about empty alt text, and Decorative image clears the warning', async () => {
    const user = renderGallery();
    const live = liveCopy('image-single');
    const alt = live.getByRole('textbox', { name: /^Alt text/ });

    await user.clear(alt);
    expect(live.getByRole('status')).toHaveTextContent(
      'Add alt text, or mark the image as decorative.'
    );

    await user.click(live.getByRole('checkbox', { name: 'Decorative image' }));
    expect(live.queryByRole('status')).not.toBeInTheDocument();
    expect(alt).toBeDisabled();
  });

  it('makes empty alt text an error on the alt text field when the schema requires it', async () => {
    const user = renderGallery();
    const live = liveCopy('image-alt-required');
    const alt = live.getByRole('textbox', { name: /^Alt text/ });
    expect(alt).toHaveAttribute('aria-required', 'true');

    await user.clear(alt);
    await user.click(document.body);
    expect(live.getByRole('alert')).toHaveTextContent(
      'Add alt text, or mark the image as decorative.'
    );
    expect(alt).toHaveAttribute('aria-invalid', 'true');
    expect(live.queryByRole('status')).not.toBeInTheDocument();
  });

  it('replaces the image from Media and keeps the field valid', async () => {
    const user = renderGallery();
    const live = liveCopy('image-single');
    await user.click(live.getByRole('button', { name: 'Replace' }));
    await user.click(
      (await media()).getByRole('button', { name: /forest-trail\.jpg/ })
    );

    expect(live.getByText('forest-trail.jpg')).toBeInTheDocument();
    expect(live.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error when a required image is removed', async () => {
    const user = renderGallery();
    const live = liveCopy('image-single');
    await user.click(live.getByRole('button', { name: 'Remove' }));
    await user.click(live.getByRole('button', { name: 'Choose from Media' }));
    await user.keyboard('{Escape}');
    await user.click(document.body);

    expect(live.getByRole('alert')).toHaveTextContent('Choose an image.');
  });

  it('adds several images from Media in the order they were picked', async () => {
    const user = renderGallery();
    const live = liveCopy('image-gallery');
    await user.click(live.getByRole('button', { name: 'Add an image' }));
    const library = await media();
    await user.click(library.getByRole('button', { name: /desert-road\.jpg/ }));
    await user.click(library.getByRole('button', { name: /mountains\.jpg/ }));
    await user.click(library.getByRole('button', { name: 'Add 2 images' }));

    const names = live
      .getAllByRole('button', { name: /^Image \d+:/ })
      .map((button) => button.textContent);
    expect(names.slice(-2)).toEqual([
      expect.stringContaining('desert-road.jpg'),
      expect.stringContaining('mountains.jpg'),
    ]);
  });
});

describe('editor pane and preview', () => {
  const editor = () => within(screen.getByTestId('doc-editor'));
  const previewTarget = (key: string) => {
    const element = screen
      .getByTestId('doc-preview')
      .querySelector(`[data-target="${key}"]`);
    if (!(element instanceof HTMLElement)) throw new Error(`No ${key}`);
    return element;
  };

  it('opens a closed block and focuses its first field from the preview', async () => {
    const user = renderGallery();
    await user.click(
      previewTarget('sections:1').querySelector('h2') as HTMLElement
    );
    await waitFor(() =>
      expect(editor().getByRole('textbox', { name: /^Heading/ })).toHaveFocus()
    );
  });

  it('focuses the item header when the whole block is clicked', async () => {
    const user = renderGallery();
    await user.click(previewTarget('sections:2'));
    await waitFor(() =>
      expect(editor().getByRole('button', { name: /^Block 3:/ })).toHaveFocus()
    );
    expect(
      editor().queryByRole('textbox', { name: /^Quote/ })
    ).not.toBeInTheDocument();
  });

  it('focuses the exact tag that was clicked', async () => {
    const user = renderGallery();
    await user.click(previewTarget('tags:2'));
    await waitFor(() =>
      expect(editor().getByRole('textbox', { name: /^Tag 3/ })).toHaveFocus()
    );
  });

  it('still finds a read-only field', async () => {
    const user = renderGallery();
    await user.click(previewTarget('slug'));
    await waitFor(() =>
      expect(editor().getByRole('textbox', { name: /^Slug/ })).toHaveFocus()
    );
  });

  it('opens a closed group and focuses the field inside', async () => {
    const user = renderGallery();
    await user.click(previewTarget('seo'));
    await waitFor(() =>
      expect(
        editor().getByRole('textbox', { name: /^Meta title/ })
      ).toHaveFocus()
    );
  });

  it('outlines the preview element of the focused field', async () => {
    const user = renderGallery();
    await user.click(editor().getByRole('textbox', { name: /^Title/ }));
    expect(previewTarget('title')).toHaveAttribute('data-active');
    expect(previewTarget('slug')).not.toHaveAttribute('data-active');
  });

  it('outlines the whole section, not the part inside it', async () => {
    const user = renderGallery();
    await user.click(editor().getByRole('textbox', { name: /^Tag 3/ }));
    expect(previewTarget('tags')).toHaveAttribute('data-active');
    expect(previewTarget('tags:2')).not.toHaveAttribute('data-active');
  });

  it('shows every error on save and takes the editor to the first one, then the next', async () => {
    const user = renderGallery();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const heading = await waitFor(() => {
      const field = editor().getByRole('textbox', { name: /^Heading/ });
      expect(field).toHaveFocus();
      return field;
    });
    expect(
      screen.getByText('Not saved. Fix the errors, then save again.')
    ).toBeInTheDocument();

    await user.type(heading, 'Why teams pick Tina');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        editor().getByRole('textbox', { name: /^Meta title/ })
      ).toHaveFocus()
    );
  });
});
