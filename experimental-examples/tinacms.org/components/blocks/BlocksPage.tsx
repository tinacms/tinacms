import { Layout } from '../layout'
import { NextSeo } from 'next-seo'
import { GlobalStyles } from './GlobalStyles'
import { Blocks } from './Blocks'

export const BlocksPage = ({ data }) => {
  return (
    <>
      {data.seo && (
        <NextSeo
          title={data.seo.title}
          description={data.seo.description}
          openGraph={{
            title: data.seo.title,
            description: data.seo.description,
          }}
        />
      )}
      <Layout>
        {/* TODO: why is there a type error here */}
        {/* @ts-ignore */}
        <Blocks blocks={data.blocks} />
      </Layout>
      <style global jsx>
        {GlobalStyles}
      </style>
    </>
  )
}
