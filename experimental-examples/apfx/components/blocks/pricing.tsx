/* This example requires Tailwind CSS v2.0+ */
import { CheckIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { Markdown } from '../markdown'
import { DisplayText } from '../typographqy'
import { Action, action, useLinksFromAction, actionQuery } from './hero'
import type { TinaTemplate } from 'tinacms'
import { Selector } from '../../zeus'
import { Response } from '../util'

export const pageBlocksComparisonTableTemplate = (textFields): TinaTemplate => {
  return {
    label: 'Comparison Table',
    name: 'comparisonTable',
    ui: {
      defaultItem: {
        title: 'The right price for you, whoever you are',
        description:
          'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Harum sequi unde repudiandae natus.',
      },
    },
    fields: [
      ...textFields,
      {
        label: 'Items',
        name: 'items',
        type: 'object',
        list: true,
        fields: [
          ...textFields,
          {
            label: 'Bullet points',
            name: 'bulletPoints',
            type: 'string',
            list: true,
          },
          {
            label: 'Meta',
            name: 'meta',
            type: 'object',
            list: true,
            templates: [
              {
                label: 'A',
                name: 'a',
                fields: [
                  {
                    type: 'string',
                    name: 'aOne',
                  },
                ],
              },
              {
                label: 'B',
                name: 'b',
                fields: [
                  {
                    type: 'string',
                    name: 'bOne',
                  },
                ],
              },
            ],
          },
        ],
      },
      action,
    ],
  }
}

export const blockComparisonTable = Selector('PageBlocksComparisonTable')({
  title: true,
  subTitle: true,
  description: true,
  action: actionQuery,
  items: {
    title: true,
    subTitle: true,
    description: true,
    bulletPoints: true,
    meta: {
      __typename: true,
      '...on PageBlocksComparisonTableItemsMetaA': {
        aOne: true,
      },
      '...on PageBlocksComparisonTableItemsMetaB': {
        bOne: true,
      },
    },
  },
})

type ComparisonTableType = Response<
  'PageBlocksComparisonTable',
  typeof blockComparisonTable
>

function Pill(props) {
  return (
    <div>
      <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600">
        {props.subTitle}
      </h3>
    </div>
  )
}

function ComparisonCard(props) {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
      <div className="py-8 bg-white">
        <pre>{JSON.stringify(props.item.meta, null, 2)}</pre>
      </div>
      <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
        {props.item.subTitle && <Pill subTitle={props.item.subTitle}></Pill>}
        <DisplayText
          size={'text-2xl lg:text-3xl'}
          classNames="my-4 flex items-baseline"
          variant="dark"
        >
          {props.item.title}
        </DisplayText>
        <Markdown colorVariant="dark">{props.item.description}</Markdown>
      </div>
      {props.item.bulletPoints?.length > 0 && (
        <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
          <ul className="space-y-4">
            {props.item.bulletPoints?.map((bulletPoints) => (
              <li key={bulletPoints} className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckIcon
                    className="h-6 w-6 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <p className="ml-3 text-base text-gray-700">{bulletPoints}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Pricing(props: ComparisonTableType) {
  // console.log(props)
  return (
    <div className="bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none">
            {props.subTitle && (
              <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider">
                {props.subTitle}
              </h2>
            )}
            <DisplayText size={'text-3xl lg:text-5xl py-4'}>
              {props.title}
            </DisplayText>
            {props.description && <Markdown>{props.description}</Markdown>}
          </div>
        </div>
      </div>
      <div className="mt-8 pb-12 bg-indigo-50 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
        <div className="relative">
          <div className="absolute inset-0 h-3/4 bg-gray-900" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-4 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
              {props.items?.map((item, i) => {
                return <ComparisonCard key={i} item={item}></ComparisonCard>
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:mt-5 ">
          <div className="max-w-md mx-auto lg:max-w-5xl ">
            {props.action && <Cta action={props.action} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButtons(props) {
  const { link, secondaryLink } = useLinksFromAction(props.action)
  return (
    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
      <div className="inline-flex rounded-md shadow">
        {props.action?.linkText && (
          <Link href={link}>
            <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              {props.action.linkText}
            </a>
          </Link>
        )}
      </div>
      {props.action.secondaryText && (
        <div className="ml-3 inline-flex rounded-md shadow">
          <Link href={secondaryLink}>
            <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
              {props.action.secondaryText}
            </a>
          </Link>
        </div>
      )}
    </div>
  )
}

export function Cta({ action }: { action: Action }) {
  return (
    <div className="py-4 px-4 sm:px-6 w-full lg:py-12 lg:px-8 lg:flex lg:items-center lg:justify-between">
      <DisplayText variant="dark" size="text-3xl md:text-4xl">
        {action?.callToAction.split('\n').map((textString, index) => {
          return (
            <span
              key={index}
              className={`block ${index === 0 && 'text-indigo-600'}`}
            >
              {textString}
            </span>
          )
        })}
      </DisplayText>
      <ActionButtons action={action}></ActionButtons>
    </div>
  )
}
