import { DisplayText } from '../typographqy'
import { Markdown } from '../markdown'
import type { TinaTemplate } from 'tinacms'
import { Selector } from '../../zeus'
import { Response } from '../util'

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

const defaultStat = {
  icon: 'HeartIcon',
  name: 'This is some dummy content!',
  description: defaultText,
}

export const statsWithImageTemplate = (textFields): TinaTemplate => {
  return {
    label: 'Stats With Image',
    name: 'statsWithImage',
    ui: {
      defaultItem: {
        title: 'This is the default feature list title',
        // description: defaultText,
        image:
          'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100',
        stats: [
          {
            title: 'This is the default feature list title',
            // description: defaultText,
          },
        ],
      },
    },
    fields: [
      ...textFields,
      {
        label: 'Image',
        name: 'image',
        type: 'string',
      },
      {
        label: 'Stats',
        name: 'stats',
        type: 'object',
        list: true,
        fields: textFields,
      },
    ],
  }
}

export const blockStatsWithImageQuery = Selector('PageBlocksStatsWithImage')({
  title: true,
  description: true,
  image: true,
  subTitle: true,
  stats: {
    title: true,
    description: true,
  },
})

type StatsWithImageType = Response<
  'PageBlocksStatsWithImage',
  typeof blockStatsWithImageQuery
>

export function StatsWithImage(props: StatsWithImageType) {
  return (
    <div className="relative bg-gray-800">
      <div className="h-80 w-full absolute bottom-0 xl:inset-0 xl:h-full">
        <div className="h-full w-full xl:grid xl:grid-cols-2">
          <div className="h-full xl:relative xl:col-start-2">
            <img
              className="h-full w-full object-cover opacity-25 xl:absolute xl:inset-0"
              src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100"
              alt="People working on laptops"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-800 xl:inset-y-0 xl:left-0 xl:h-full xl:w-32 xl:bg-gradient-to-r"
            />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8 xl:grid xl:grid-cols-2 xl:grid-flow-col-dense xl:gap-x-8">
        <div className="relative pt-12 pb-64 sm:pt-24 sm:pb-64 xl:col-start-1 xl:pb-24">
          {props.subTitle && (
            <h2 className="text-sm font-semibold text-indigo-300 tracking-wide uppercase">
              {props.subTitle}
            </h2>
          )}
          <DisplayText
            variant={'light'}
            size="text-3xl sm:text-4xl"
            classNames="pt-2"
          >
            {props.title}
          </DisplayText>
          <Markdown>{props.description}</Markdown>
          <div className="mt-12 grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2">
            {props.stats?.map((item, index) => (
              <p key={item.title + index}>
                <span className="block text-2xl font-bold text-white">
                  {item.title}
                </span>
                <span className="mt-1 block text-base text-gray-300">
                  {item.description}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
