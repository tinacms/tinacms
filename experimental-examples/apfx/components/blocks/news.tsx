import { Header } from './feature'
import Link from 'next/link'
import type { TinaTemplate } from 'tinacms'
import { Img } from '../img'
import { Selector } from '../../zeus'
import { Response } from '../util'

export const newsTemplate = (textFields): TinaTemplate => ({
  label: 'News',
  name: 'news',
  fields: [
    ...textFields,
    {
      label: 'Items',
      name: 'newsItems',
      type: 'object',
      required: true,
      list: true,
      ui: {
        defaultItem: {
          article: 'content/news/dollar-gains.md',
        },
        itemProps: (item) => {
          if (item) {
            return { label: item.article }
          }
        },
      },
      fields: [
        {
          label: 'Article',
          name: 'article',
          type: 'reference',
          required: true,
          collections: ['news'],
        },
      ],
    },
  ],
  ui: {
    defaultItem: {
      title: 'Get in touch',
      description:
        'Mattis amet hendrerit dolor, quisque lorem pharetra. Pellentesque lacus nisi urna, arcu sociis eu. Orci vel lectus nisl eget eget ut consectetur. Sit justo viverra non adipisicing elit distinctio.',
      newsItems: [
        {
          article: 'content/news/dollar-gains.md',
        },
      ],
    },
  },
})

export const blockNewsQuery = Selector('PageBlocksNews')({
  title: true,
  subTitle: true,
  newsItems: {
    article: {
      '...on News': {
        title: true,
        image: true,
        subTitle: true,
        _sys: {
          filename: true,
        },
      },
    },
  },
})
type NewsType = Response<'PageBlocksNews', typeof blockNewsQuery>

export const News = (props: NewsType) => {
  const overlayColor = 'bg-gray-800'
  const overlayOpacity = 'opacity-90'
  const image =
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80'
  return (
    <div className="relative bg-gray-800 py-20 px-4 sm:px-6 lg:py-40 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <Img
          className="w-full object-cover h-1/3 sm:h-2/3"
          src={image}
          alt=""
        />
        <div
          className={`absolute inset-0 ${overlayColor} mix-blend-multiply ${overlayOpacity} h-1/3 sm:h-2/3`}
          aria-hidden="true"
        />
        <div className="bg-gray-800 h-1/3 sm:h-2/3" />
      </div>
      <div className="relative max-w-7xl mx-auto">
        {/* @ts-ignore */}
        <Header {...props} centered={true} />
        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {props.newsItems
            .filter((item) => item.article)
            .map((item, i) => (
              <Link
                key={`${item.article._sys.filename}-${i}`}
                href={`/news/${item.article._sys.filename}`}
              >
                <a
                  key={item.article._sys.filename}
                  className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-gray-700"
                >
                  <div className="flex-shrink-0">
                    <Img
                      className="h-56 w-full object-cover"
                      width={400}
                      src={
                        item.article.image ||
                        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80'
                      }
                      alt=""
                    />
                  </div>
                  <div className="flex-1 bg-gray-600 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-200">
                        <span className="uppercase">
                          {item.article.subTitle}
                        </span>
                      </p>
                      <span className="block mt-2">
                        <p className="text-xl font-semibold text-white">
                          {item.article.title}
                        </p>
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
