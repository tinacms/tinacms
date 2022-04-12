import * as Icons from '@heroicons/react/outline'
import React from 'react'
import { Markdown } from '../markdown'
import { DisplayText, SubTitleText } from '../typographqy'
import { Selector } from '../../zeus'
import { Response, getTinaField } from '../util'
import { Overlay, overlayField } from './header'
import type { TinaTemplate } from 'tinacms'

const defaultText = {
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua ad ad non deserunt sunt.',
        },
      ],
    },
  ],
}

const defaultFeature = {
  icon: 'HeartIcon',
  name: 'This is some dummy content!',
  description: defaultText,
}

export const featureTemplate = (textFields): TinaTemplate => {
  return {
    label: 'Feature List',
    name: 'feature',
    ui: {
      defaultItem: {
        title: 'This is the default feature list title',
        description: defaultText,
        featureStyle: '4-wide-grid',
        features: [defaultFeature],
      },
    },
    fields: [
      ...textFields,
      {
        label: 'Style',
        name: 'featureStyle',
        type: 'string',
        options: ['4-wide-grid', '2-wide-grid', '3-column'],
      },
      {
        label: 'Features',
        name: 'features',
        type: 'object',
        required: true,
        list: true,
        ui: {
          defaultItem: defaultFeature,
          itemProps: (item) => {
            if (item) {
              return { label: item.name }
            }
          },
        },
        fields: [
          {
            label: 'Icon',
            name: 'icon',
            type: 'string',
            required: true,
            options: Object.keys(Icons),
          },
          {
            label: 'Label',
            name: 'name',
            required: true,
            type: 'string',
          },
          {
            label: 'Description',
            name: 'description',
            required: true,
            type: 'rich-text',
          },
        ],
      },
      overlayField,
    ],
  }
}

export const blockFeatureQuery = Selector('PageBlocksFeature')({
  title: true,
  description: true,
  subTitle: true,
  featureStyle: true,
  features: {
    icon: true,
    name: true,
    description: true,
  },
  overlay: {
    image: true,
    overlayColor: true,
    overlayOpacity: true,
  },
})

type FeatureProps = Response<'PageBlocksFeature', typeof blockFeatureQuery>
type Feature = FeatureProps['features'][number]

const Wrapper = (
  props: Pick<FeatureProps, 'overlay'> & {
    children: JSX.Element | JSX.Element[]
  }
) => {
  return (
    <Overlay {...props.overlay}>
      <div className="relative z-30 max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-32 lg:py-48 lg:max-w-7xl lg:px-8">
        {props.children}
      </div>
    </Overlay>
  )
}

const Icon = (props: { feature: Feature }) => {
  const InnerIcon = Icons[props.feature.icon]
  if (!InnerIcon) {
    return null
  }
  return (
    <div>
      <span className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500">
        <InnerIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </span>
    </div>
  )
}

export function FourWideGrid(props: FeatureProps) {
  return (
    <Wrapper {...props}>
      <Header {...props} />
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
        {props.features?.map((feature, index) => {
          return (
            <div key={feature.name + index}>
              <Icon feature={feature} />
              <div className="mt-6">
                <FeatureName>{feature.name}</FeatureName>
                <Markdown classNames="mt-4 md:mt-8 mt-4">
                  {feature.description}
                </Markdown>
                {/* <p className="mt-2 text-base text-indigo-200">
                </p> */}
              </div>
            </div>
          )
        })}
      </div>
    </Wrapper>
  )
}

function Hr({ centered }: { centered?: boolean }) {
  return (
    <div className={`flex items-center ${centered && 'lg:justify-center'}`}>
      <div className="w-48 h-1 mt-8 bg-white rounded-sm" />
    </div>
  )
}
export function TwoWideGrid(props: FeatureProps) {
  return (
    <Wrapper {...props}>
      <Header {...props} centered={true} />
      <div className="mt-10">
        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {props.features.map((feature, index) => {
            // console.log(feature, getTinaField(feature, 'name'))
            const Icon = Icons[feature.icon]
            return (
              <div key={feature.name + index} className="relative">
                <dt>
                  <div
                    data-tinafield={getTinaField(feature, 'icon')}
                    className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white"
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div data-tinafield={getTinaField(feature, 'name')}>
                    <FeatureName classNames={`ml-16`}>
                      {feature.name}
                    </FeatureName>
                  </div>
                </dt>
                <div data-tinafield={getTinaField(feature, 'description')}>
                  <Markdown className="mt-2 ml-16 text-base text-gray-100">
                    {feature.description}
                  </Markdown>
                </div>
              </div>
            )
          })}
        </dl>
      </div>
    </Wrapper>
  )
}

export function ThreeWideGrid(props: FeatureProps) {
  return (
    <Wrapper {...props}>
      <Header {...props} centered={true} />
      <dl className="space-y-10 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {props.features.map((feature, index) => {
          const Icon = Icons[feature.icon]
          return (
            <div key={feature.name + index}>
              <dt>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <FeatureName>{feature.name}</FeatureName>
              </dt>
              <Markdown className="mt-2 text-base text-gray-100">
                {feature.description}
              </Markdown>
            </div>
          )
        })}
      </dl>
    </Wrapper>
  )
}

export const Header = (props: FeatureProps & { centered?: boolean }) => {
  return (
    <div className={`${props.centered && 'lg:text-center'} pb-4 md:pb-12`}>
      <SubTitleText>{props.subTitle}</SubTitleText>
      <DisplayText classNames="mt-4" size="text-4xl sm:text-5xl">
        {props.title}
      </DisplayText>
      <Hr centered={props.centered} />
      <Markdown classNames="mt-8">{props.description}</Markdown>
    </div>
  )
}

const FeatureName = (props: {
  classNames?: string
  children: React.ReactNode
}) => {
  return (
    <h3 className={`text-lg mt-4 font-medium text-white ${props.classNames}`}>
      {props.children}
    </h3>
  )
}
