import React from 'react'
import { Wrapper } from '../layout/Wrapper'
import { Section } from '../layout/Section'
import type { TinaTemplate } from '@tinacms/cli'
import { contentComponents } from './Content'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { actionsTemplate } from './Actions'
import { socialTemplate } from './Social'
import { newsletterTemplate } from './Newsletter'
import { DocsTextWrapper } from '../layout/DocsTextWrapper'

export const columnsTemplate: TinaTemplate = {
  label: 'Columns',
  name: 'columns',
  ui: {
    previewSrc: '/img/blocks/columns.png',
  },
  fields: [
    {
      name: 'options',
      label: 'Options',
      type: 'object',
      fields: [
        {
          name: 'columns',
          label: 'Column Sizes',
          type: 'string',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Not Default',
              value: 'notDefault',
            },
          ],
        },
        {
          name: 'narrow',
          label: 'Narrow',
          type: 'boolean',
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
        {
          name: 'align',
          label: 'Align Content',
          type: 'string',
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Center',
              value: 'center',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
        },
      ],
    },
    {
      name: 'columnOne',
      label: 'Column One',
      type: 'rich-text',
      templates: [
        // @ts-ignore
        actionsTemplate,
        // @ts-ignore
        socialTemplate,
        // @ts-ignore
        newsletterTemplate,
      ],
    },
    {
      name: 'columnTwo',
      label: 'Column Two',
      type: 'rich-text',
      templates: [
        // @ts-ignore
        actionsTemplate,
        // @ts-ignore
        socialTemplate,
        // @ts-ignore
        newsletterTemplate,
      ],
    },
  ],
}

export const ColumnsBlock = ({ data, index }) => {
  return (
    <>
      <Section color={data.options?.color || 'white'}>
        <DocsTextWrapper>
          <Wrapper
            align={data.options?.align || 'left'}
            narrow={data.options?.narrow || false}
          >
            <div className="columns">
              <div className="column">
                {data.columnOne && (
                  <TinaMarkdown
                    components={contentComponents}
                    content={data.columnOne}
                  />
                )}
              </div>
              <div className="column">
                {data.columnTwo && (
                  <TinaMarkdown
                    components={contentComponents}
                    content={data.columnTwo}
                  />
                )}
              </div>
            </div>
          </Wrapper>
        </DocsTextWrapper>
      </Section>
      <style jsx>{`
        .columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-gap: 2rem;
        }

        .column {
          width: 100%;
        }
      `}</style>
    </>
  )
}
