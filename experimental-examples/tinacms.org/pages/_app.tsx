import React, { useEffect } from 'react'
import App from 'next/app'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DefaultSeo } from 'next-seo'
import data from '../content/siteConfig.json'
import TagManager from 'react-gtm-module'
import { GlobalStyle } from 'components/styles/GlobalStyle'
import 'components/styles/fontImports.css'
import path from 'path'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

// the following line will cause all content files to be available in a serverless context
path.resolve('./content/')

const MainLayout = ({ Component, pageProps }) => {
  return (
    <>
      <DefaultSeo
        title={data.seoDefaultTitle}
        titleTemplate={'%s | ' + data.title}
        description={data.description}
        openGraph={{
          type: 'website',
          locale: 'en_CA',
          url: data.siteUrl,
          site_name: data.title,
          images: [
            {
              url: 'https://tinacms.org/img/tina-twitter-share.png',
              width: 1200,
              height: 628,
              alt: `TinaCMS`,
            },
          ],
        }}
        twitter={{
          handle: data.social.twitterHandle,
          site: data.social.twitterHandle,
          cardType: 'summary_large_image',
        }}
      />
      <Head>
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="theme-color" content="#E6FAF8" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  )
}

// TODO: Probably should use hooks here
class Site extends App {
  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      TagManager.initialize({
        gtmId: process.env.GTM_ID,
      })
    }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <TinaEditProvider
        editMode={
          <TinaCMS
            apiURL={process.env.NEXT_PUBLIC_TINA_ENDPOINT}
            // @ts-ignore
            cmsCallback={(cms) => {
              import('react-tinacms-editor').then(({ MarkdownFieldPlugin }) => {
                cms.plugins.add(MarkdownFieldPlugin)
              })
              cms.flags.set('tina-admin', true)
              cms.flags.set('rich-text-alt', true)
              cms.flags.set('branch-switcher', true)

              import('tinacms').then(({ RouteMappingPlugin }) => {
                const RouteMapping = new RouteMappingPlugin(
                  (collection, document) => {
                    if (['page'].includes(collection.name)) {
                      if (document.sys.filename === 'home') {
                        return `/`
                      }
                      return `/${document.sys.filename}`
                    }

                    if (['post'].includes(collection.name)) {
                      return `/blog/${document.sys.filename}`
                    }

                    return undefined
                  }
                )

                cms.plugins.add(RouteMapping)
              })
            }}
            mediaStore={async () => {
              // Load media store dynamically so it only loads in edit mode
              const pack = await import('next-tinacms-cloudinary')
              return pack.TinaCloudCloudinaryMediaStore
            }}
          >
            <MainLayout Component={Component} pageProps={pageProps} />
          </TinaCMS>
        }
      >
        <MainLayout Component={Component} pageProps={pageProps} />
      </TinaEditProvider>
    )
  }
}

export default Site
