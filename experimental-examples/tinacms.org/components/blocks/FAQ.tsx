import React from 'react'
import { RichTextWrapper } from '../layout/RichTextWrapper'
import { Wrapper } from '../layout/Wrapper'
import type { TinaTemplate } from '@tinacms/cli'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

export const faqTemplate: TinaTemplate = {
  label: 'FAQ',
  name: 'faq',
  ui: {
    previewSrc: '/img/blocks/faq.png',
    defaultItem: {
      title: 'Frequently Asked Questions',
      questions: [
        {
          question: 'What is Tina?',
          answer:
            'Tina is a Git-backed headless content management system that enables developers and content creators to collaborate seamlessly. With Tina, developers can create a custom visual editing experience that is perfectly tailored to their site.\n',
        },
      ],
      color: 'seafoam',
    },
  },
  fields: [
    { name: 'title', label: 'Title', type: 'string' },
    {
      name: 'intro',
      label: 'Introduction',
      type: 'rich-text',
    },
    {
      name: 'questions',
      label: 'Questions',
      type: 'object',
      list: true,
      fields: [
        { name: 'question', label: 'Question', type: 'string' },
        {
          name: 'answer',
          label: 'Answer',
          type: 'rich-text',
        },
      ],
    },
    {
      name: 'color',
      label: 'Color',
      type: 'string',
      options: [
        {
          label: 'Seafoam',
          value: 'seafoam',
        },
        {
          label: 'White',
          value: 'white',
        },
      ],
    },
  ],
}

export function FaqBlock({ data, index }) {
  return (
    <>
      <section
        key={index}
        className={`faq section ${data.color === 'seafoam' ? 'seafoam' : ''}`}
      >
        <RichTextWrapper>
          <Wrapper narrow>
            <div className="faq-wrapper">
              {data.title && <h3>{data.title}</h3>}
              {data.intro && <TinaMarkdown content={data.intro} />}
              {data.questions &&
                data.questions.map((item, index) => {
                  return (
                    <div key={index}>
                      {item.question && <h4>{item.question}</h4>}
                      {item.answer && <TinaMarkdown content={item.answer} />}
                      {index < data.questions.length - 1 && <hr />}
                    </div>
                  )
                })}
            </div>
          </Wrapper>
        </RichTextWrapper>
      </section>
      <style jsx>{`
        .section {
          padding: 3rem 0;

          @media (min-width: 800px) {
            padding: 5rem 0;
          }
        }

        .seafoam {
          background-color: var(--color-seafoam);
          background: linear-gradient(
            to bottom,
            var(--color-seafoam-200) 8rem,
            var(--color-seafoam-100)
          );
        }

        .faq-wrapper {
          width: 100%;

          :global(h3) {
            font-size: 2rem;
            color: var(--color-secondary);
            font-family: var(--font-tuner);
          }
          :global(p) {
            ${data.intro &&
            `&:first-of-type {
              font-size: 1.5rem;
              margin-bottom: 2.5rem;
            }`}
            color: var(--color-secondary);
          }
        }
      `}</style>
    </>
  )
}
