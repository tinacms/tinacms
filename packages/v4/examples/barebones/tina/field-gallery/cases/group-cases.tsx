import { useState } from 'react';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import type { ControlProps } from '../field-frame';
import { GroupSection, type Locked, NestedField } from '../group/group-section';
import { type FieldsArgs, ItemList, type OpenMode } from '../group/item-list';
import { type ListItem, newItem } from '../list/use-list';

const lockedOf = (control: ControlProps): Locked => ({
  readOnly: Boolean(control.readOnly),
  disabled: Boolean(control.disabled),
});

const isUrl = (value: string) => /^(\/|https?:\/\/)\S+$/.test(value);

export interface Seo {
  metaTitle: string;
  metaDescription: string;
}

const seoErrors = (seo: Seo) => ({
  metaTitle: seo.metaTitle.trim() === '' ? 'Enter a meta title.' : undefined,
});

const countErrors = (errors: Record<string, string | undefined>) =>
  Object.values(errors).filter(Boolean).length;

function SeoControl({
  control,
  flags,
  label,
  value,
  saved,
  frozen,
  startClosed,
  onChange,
  onBlur,
}: CaseControlProps<Seo>) {
  const [open, setOpen] = useState(!(frozen || startClosed));
  const locked = lockedOf(control);
  const errors: Partial<ReturnType<typeof seoErrors>> = flags.touched
    ? seoErrors(value)
    : {};
  const set = (patch: Partial<Seo>) => onChange({ ...value, ...patch });
  return (
    <div
      role='group'
      aria-label={label}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur();
      }}
    >
      <GroupSection
        label={label}
        summary={value.metaTitle || 'Not set'}
        open={open}
        onToggle={() => setOpen(!open)}
        dirty={JSON.stringify(value) !== JSON.stringify(saved)}
        errors={countErrors(errors)}
        required={flags.required}
        force={control['data-force']}
      >
        <NestedField
          label='Meta title'
          required
          value={value.metaTitle}
          saved={saved.metaTitle}
          error={errors.metaTitle}
          locked={locked}
          onChange={(metaTitle) => set({ metaTitle })}
        />
        <NestedField
          label='Meta description'
          multiline
          value={value.metaDescription}
          saved={saved.metaDescription}
          locked={locked}
          onChange={(metaDescription) => set({ metaDescription })}
        />
      </GroupSection>
    </div>
  );
}

const SEO: Seo = {
  metaTitle: 'Getting started with TinaCMS',
  metaDescription:
    'Install Tina, model your content, and edit it on your site.',
};

export const groupCase: CaseSpec<Seo> = {
  id: 'object-group',
  title: 'Group, open and closed',
  note: 'The frozen states show the group closed, with its summary. "Try it" starts open. A closed group shows the error count and Unsaved marker of the fields inside it.',
  labelling: 'none',
  label: 'SEO',
  overflowLabel: 'Search engine and social sharing settings',
  empty: { metaTitle: '', metaDescription: '' },
  filled: SEO,
  overflow: {
    metaTitle:
      'Getting started with TinaCMS: install, model your content and edit it visually',
    metaDescription: SEO.metaDescription,
  },
  invalid: { metaTitle: '', metaDescription: SEO.metaDescription },
  dirty: { ...SEO, metaTitle: 'Getting started with Tina' },
  validate: () => [],
  Control: SeoControl,
};

interface Hero {
  heading: string;
  button: { label: string; link: { url: string } };
}

const heroErrors = (hero: Hero) => ({
  heading: hero.heading.trim() === '' ? 'Enter a heading.' : undefined,
  buttonLabel:
    hero.button.label.trim() === '' ? 'Enter a button label.' : undefined,
  url: isUrl(hero.button.link.url)
    ? undefined
    : 'Use a path such as /docs, or a full web address.',
});

function HeroControl({
  control,
  flags,
  label,
  value,
  saved,
  frozen,
  onChange,
  onBlur,
}: CaseControlProps<Hero>) {
  const [open, setOpen] = useState({
    hero: true,
    button: true,
    link: frozen ? false : true,
  });
  const toggle = (level: keyof typeof open) =>
    setOpen({ ...open, [level]: !open[level] });
  const locked = lockedOf(control);
  const errors: Partial<ReturnType<typeof heroErrors>> = flags.touched
    ? heroErrors(value)
    : {};
  const same = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);
  const setButton = (patch: Partial<Hero['button']>) =>
    onChange({ ...value, button: { ...value.button, ...patch } });
  return (
    <div
      role='group'
      aria-label={label}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur();
      }}
    >
      <GroupSection
        label={label}
        summary={value.heading || 'Not set'}
        open={open.hero}
        onToggle={() => toggle('hero')}
        dirty={!same(value, saved)}
        errors={countErrors(errors)}
        force={control['data-force']}
      >
        <NestedField
          label='Heading'
          required
          value={value.heading}
          saved={saved.heading}
          error={errors.heading}
          locked={locked}
          onChange={(heading) => onChange({ ...value, heading })}
        />
        <GroupSection
          label='Button'
          summary={value.button.label || 'Not set'}
          open={open.button}
          onToggle={() => toggle('button')}
          dirty={!same(value.button, saved.button)}
          errors={countErrors({ a: errors.buttonLabel, b: errors.url })}
        >
          <NestedField
            label='Label'
            required
            value={value.button.label}
            saved={saved.button.label}
            error={errors.buttonLabel}
            locked={locked}
            onChange={(buttonLabel) => setButton({ label: buttonLabel })}
          />
          <GroupSection
            label='Link'
            summary={value.button.link.url || 'Not set'}
            open={open.link}
            onToggle={() => toggle('link')}
            dirty={!same(value.button.link, saved.button.link)}
            errors={countErrors({ a: errors.url })}
          >
            <NestedField
              label='URL'
              required
              value={value.button.link.url}
              saved={saved.button.link.url}
              error={errors.url}
              locked={locked}
              onChange={(url) => setButton({ link: { url } })}
            />
          </GroupSection>
        </GroupSection>
      </GroupSection>
    </div>
  );
}

const HERO: Hero = {
  heading: 'Edit your site, on your site',
  button: { label: 'Get started', link: { url: '/docs/setup' } },
};

export const nestedGroupCase: CaseSpec<Hero> = {
  id: 'object-nested',
  title: 'Nested groups, three deep',
  note: 'Hero holds Button, which holds Link. Link starts closed in the frozen states, so its summary, error count and Unsaved marker show at the third level.',
  labelling: 'none',
  label: 'Hero',
  overflowLabel: 'Hero section at the top of the page',
  empty: { heading: '', button: { label: '', link: { url: '' } } },
  filled: HERO,
  overflow: {
    heading:
      'Edit your site, on your site, with a CMS that lives in your repository',
    button: {
      label: 'Get started with the step-by-step setup guide',
      link: { url: '/docs/introduction/setup-guide-for-nextjs-astro-and-hugo' },
    },
  },
  invalid: { ...HERO, button: { ...HERO.button, link: { url: 'docs setup' } } },
  dirty: {
    ...HERO,
    button: { ...HERO.button, link: { url: '/docs/quickstart' } },
  },
  validate: () => [],
  Control: HeroControl,
};

interface Faq {
  question: string;
  answer: string;
}

const FAQS: ListItem<Faq>[] = [
  {
    question: 'What is TinaCMS?',
    answer: 'An open-source CMS that keeps your content in Git.',
  },
  { question: 'Is it free?', answer: 'Yes, the CMS is open source.' },
  {
    question: 'Can I host it myself?',
    answer: 'Yes. Use your own database and auth.',
  },
].map(newItem);

const FAQ_NOUNS = { one: 'question', many: 'questions' };

const faqErrors = (faq: Faq) => ({
  question: faq.question.trim() === '' ? 'Enter a question.' : undefined,
});

const faqSummary = (faq: Faq) => faq.question || 'New question';

function FaqFields({ item, saved, locked, touched, update }: FieldsArgs<Faq>) {
  const errors: Partial<ReturnType<typeof faqErrors>> = touched
    ? faqErrors(item.value)
    : {};
  return (
    <>
      <NestedField
        label='Question'
        required
        value={item.value.question}
        saved={saved?.question}
        error={errors.question}
        locked={locked}
        onChange={(question) => update({ ...item.value, question })}
      />
      <NestedField
        label='Answer'
        multiline
        value={item.value.answer}
        saved={saved?.answer}
        locked={locked}
        onChange={(answer) => update({ ...item.value, answer })}
      />
    </>
  );
}

function makeFaqControl(mode: OpenMode) {
  return function FaqControl(props: CaseControlProps<ListItem<Faq>[]>) {
    return (
      <ItemList
        {...props}
        mode={mode}
        nouns={FAQ_NOUNS}
        makeEmpty={() => ({ question: '', answer: '' })}
        describe={faqSummary}
        summary={faqSummary}
        errorCount={(faq) => countErrors(faqErrors(faq))}
        renderFields={FaqFields}
      />
    );
  };
}

const faqValidate = (items: ListItem<Faq>[], required: boolean) =>
  required && items.length === 0 ? ['Add at least one question.'] : [];

const faqSpec = {
  labelling: 'group' as const,
  label: 'FAQ',
  overflowLabel: 'Frequently asked questions, shown at the end of the page',
  empty: [],
  filled: FAQS,
  overflow: [
    {
      ...FAQS[0],
      value: {
        ...FAQS[0].value,
        question:
          'What is TinaCMS, and how is it different from other headless CMSs?',
      },
    },
    FAQS[1],
    FAQS[2],
  ],
  invalid: [
    FAQS[0],
    { ...FAQS[1], value: { ...FAQS[1].value, question: '' } },
    FAQS[2],
  ],
  dirty: [
    FAQS[0],
    { ...FAQS[1], value: { ...FAQS[1].value, answer: 'Yes.' } },
    FAQS[2],
  ],
  required: true,
  validate: faqValidate,
};

export const groupListInPlaceCase: CaseSpec<ListItem<Faq>[]> = {
  ...faqSpec,
  id: 'list-groups-in-place',
  title: 'List of groups, opening in place',
  note: 'Each item is a card with its collapsed summary. It opens inside the list. A new item opens straight away.',
  Control: makeFaqControl('inPlace'),
};

export const groupListNextLevelCase: CaseSpec<ListItem<Faq>[]> = {
  ...faqSpec,
  id: 'list-groups-next-level',
  title: 'List of groups, opening as the next level',
  note: 'The same list, where an item opens as the next level. This is a plain stand-in; moving between levels and breadcrumbs belong to Document Editor (#7673).',
  Control: makeFaqControl('nextLevel'),
};

export const groupCases = [defineCase(groupCase), defineCase(nestedGroupCase)];
export const groupListCases = [
  defineCase(groupListInPlaceCase),
  defineCase(groupListNextLevelCase),
];
