import React from 'react'
import { Img } from '../img'
import { useLocaleInfo } from '../locale-info'
import { Markdown } from '../markdown'
import { useTheme } from '../theme'
import { DisplayText } from '../typographqy'
import type { TinaTemplate } from 'tinacms'
import { Selector } from '../../zeus'
import { getTinaField, Response } from '../util'

const linkOptions = [
  { label: 'Link', value: 'link' },
  { label: 'Tel', value: 'tel' },
  { label: 'Sign Up', value: 'signUpLink' },
  { label: 'Sign Up Personal', value: 'signUpLinkPersonal' },
  { label: 'Sign In', value: 'signInLink' },
]

export const action = {
  label: 'Action',
  name: 'action',
  type: 'object',
  fields: [
    {
      label: 'Call to Action',
      name: 'callToAction',
      type: 'string',
    },
    {
      label: 'Link Text',
      name: 'linkText',
      // required: true,
      type: 'string',
    },
    {
      label: 'Link',
      name: 'link',
      // required: true,
      type: 'string',
      options: linkOptions,
    },
    {
      label: 'Link Override',
      name: 'linkOverride',
      // description: "Provide a raw value to link (can't be internationalized)",
      type: 'string',
    },
    {
      label: 'Secondary Text',
      name: 'secondaryText',
      type: 'string',
    },
    {
      label: 'Secondary Link',
      name: 'secondaryLink',
      type: 'string',
      options: linkOptions,
    },
    {
      label: 'Secondary Link Override',
      name: 'secondaryLinkOverride',
      // description: "Provide a raw value to link (can't be internationalized)",
      type: 'string',
    },
  ],
}

export const heroTemplate = (textFields): TinaTemplate => ({
  label: 'Hero',
  name: 'hero',
  fields: [
    ...textFields,
    {
      label: 'Image',
      name: 'image',
      type: 'image',
    },
    action,
  ],
  ui: {
    defaultItem: {
      title: "Let's put something down here...",
      description: 'And something here too',
      image: 'https://placehold.it/2000x1500',
    },
  },
})

export const actionQuery = Selector('PageBlocksHeroAction')({
  callToAction: true,
  link: true,
  linkText: true,
  linkOverride: true,
  secondaryLink: true,
  secondaryText: true,
  secondaryLinkOverride: true,
})

export const blockHeroQuery = Selector('PageBlocksHero')({
  title: true,
  description: true,
  image: true,
  action: actionQuery,
})

type Hero = Response<'PageBlocksHero', typeof blockHeroQuery>
export type Action = Response<'PageBlocksHeroAction', typeof actionQuery>

export function HeroWithSlantImage(props: Hero) {
  const bg = 'bg-gray-900'
  const text = 'text-gray-900'
  return (
    <div className={`relative ${bg} overflow-hidden`}>
      <div className="max-w-7xl mx-auto relative z-30">
        <div
          className={`relative z-10 py-40 sm:pb-20 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:py-72`}
        >
          {/* <main className="mx-auto max-w-7xl px-4 mt-10 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"> */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="sm:text-center lg:text-left">
              <div>
                <DisplayText
                  tinaField={getTinaField(props, 'title')}
                  variant={'light'}
                >
                  {props.title}
                </DisplayText>
              </div>
              <Markdown classNames="mt-4 md:mt-8">{props.description}</Markdown>
              {props.action && <ActionBox action={props.action} />}
            </div>
          </main>
        </div>
      </div>
      <div className="hidden lg:block lg:absolute z-20 lg:inset-y-0 lg:left-0 lg:w-1/2 opacity-90">
        <div className={`absolute inset-0 ${bg}`} aria-hidden="true" />
        <svg
          className={`${text} hidden lg:block absolute right-0 inset-y-0 h-full w-1/2  transform translate-x-1/2`}
          fill="currentColor"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="50,0 100,0 50,100 0,100" />
        </svg>
      </div>
      <div className="lg:absolute lg:inset-0">
        <Img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={props.image}
          quality={90}
          lazy={true}
          width={1400}
          alt=""
        />
        <div
          className={`absolute inset-0 bg-indigo-900 mix-blend-multiply opacity-90`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export const useLinksFromAction = (action: Action) => {
  const localeInfo = useLocaleInfo()
  const link = action.linkOverride
    ? action.linkOverride
    : action.link === 'tel'
    ? `tel: ${localeInfo[action.link]}`
    : localeInfo[action.link]
  const secondaryLink = action.secondaryLinkOverride
    ? action.secondaryLinkOverride
    : action.secondaryLink === 'tel'
    ? `tel: ${localeInfo[action.secondaryLink]}`
    : localeInfo[action.secondaryLink]

  return { link, secondaryLink }
}

export const ActionBox = (props: { action: Action }) => {
  const { link, secondaryLink } = useLinksFromAction(props.action)
  return (
    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
      <div className="rounded-md shadow">
        <a
          href={link || ''}
          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
        >
          {props.action?.linkText || ''}
        </a>
      </div>
      {secondaryLink && (
        <div className="mt-3 sm:mt-0 sm:ml-3">
          <a
            href={secondaryLink}
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
          >
            {props.action.secondaryText}
          </a>
        </div>
      )}
    </div>
  )
}

export const ActionSlim = (props: { action?: Action }) => {
  return props.action && props.action.linkText ? (
    <div className="mt-8 flex justify-start">
      <PrimaryButton link={props.action?.link}>
        {props.action.linkText}
      </PrimaryButton>
      {props.action.secondaryText && (
        <SecondaryButton link={props.action.secondaryLink}>
          {props.action.secondaryText}
        </SecondaryButton>
      )}
    </div>
  ) : null
}

type ButtonProps = {
  link: string
  children: React.ReactNode
}
const PrimaryButton = (props: ButtonProps) => {
  const themeContext = useTheme()
  const variant = themeContext.variant
  switch (variant) {
    case 'classic':
      return <ClassicPrimary {...props} />
    case 'modern':
      return <ModernPrimary {...props} />
    case 'standard':
      return <StandardPrimary {...props} />
  }
}

const SecondaryButton = (props: ButtonProps) => {
  const themeContext = useTheme()
  const variant = themeContext.variant
  switch (variant) {
    case 'classic':
      return <ClassicSecondary {...props} />
    case 'modern':
      return <ModernSecondary {...props} />
    case 'standard':
      return <StandardSecondary {...props} />
  }
}

const ClassicPrimary = (props: ButtonProps) => {
  return (
    <div className="inline-flex rounded-md shadow">
      <a
        href={props.link}
        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        {props.children}
      </a>
    </div>
  )
}

const ClassicSecondary = (props: ButtonProps) => {
  return (
    <div className="ml-3 inline-flex">
      <a
        href={props.link}
        className="inline-flex items-center justify-center px-5 py-3 border-2 border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        {props.children}
      </a>
    </div>
  )
}

const StandardPrimary = (props: ButtonProps) => {
  const fontStyles = `uppercase tracking-widest text-sm font-bold `
  return (
    <div className="inline-flex rounded-md shadow">
      <a
        href={props.link}
        className={`inline-flex ${fontStyles} items-center justify-center px-5 py-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700`}
      >
        {props.children}
      </a>
    </div>
  )
}

const StandardSecondary = (props: ButtonProps) => {
  const fontStyles = `uppercase tracking-widest text-sm font-bold `
  return (
    <div className="ml-3 inline-flex">
      <a
        href={props.link}
        className={`inline-flex ${fontStyles} items-center justify-center px-8 py-4 border border-transparent rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200`}
      >
        {props.children}
      </a>
    </div>
  )
}
const ModernPrimary = (props: ButtonProps) => {
  return (
    <div className="inline-flex rounded-none shadow">
      <a
        href={props.link}
        className="inline-flex items-center justify-center px-8 py-5 border border-indigo-100 text-sm tracking-widest uppercase font-normal rounded-none text-white bg-transparent hover:bg-indigo-900"
      >
        {props.children}
      </a>
    </div>
  )
}

const ModernSecondary = (props: ButtonProps) => {
  return (
    <div className="ml-3 inline-flex">
      <a
        href={props.link}
        className="inline-flex items-center justify-center px-8 py-5 border-2 border-indigo-100 text-sm tracking-widest uppercase font-normal rounded-none text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        {props.children}
      </a>
    </div>
  )
}
