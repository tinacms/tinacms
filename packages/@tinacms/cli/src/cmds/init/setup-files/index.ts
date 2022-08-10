/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import chalk from 'chalk'
export const adminPage = `import { TinaAdmin } from 'tinacms';
export default TinaAdmin;
`

export const blogPost = `---
title: Vote For Pedro
---
# Welcome to the blog.

> To edit this site head over to the [\`/admin\`](/admin) route. Then click the pencil icon in the bottom lefthand corner to start editing 🦙.

# Dixi gaude Arethusa

<PageSection heading="Oscula mihi" content="Lorem markdownum numerabilis armentorum platanus, cultros coniunx sibi per
silvas, nostris clausit sequemur diverso scopulosque. Fecit tum alta sed non
falcato murmura, geminas donata Amyntore, quoque Nox. Invitam inquit, modo
nocte; ut ignis faciemque manes in imagine sinistra ut mucrone non ramos
sepulcro supplex. Crescentesque populos motura, fit cumque. Verumque est; retro
sibi tristia bracchia Aetola telae caruerunt et."/>


## Mutato fefellimus sit demisit aut alterius sollicito

Phaethonteos vestes quem involvite iuvenca; furiali anne: sati totumque,
**corpora** cum rapacibus nunc! Nervis repetatne, miserabile doleas, deprensum
hunc, fluctus Threicio, ad urbes, magicaeque, quid. Per credensque series adicis
poteram [quidem](#)! Iam uni mensas victrix
vittas ut flumina Satyri adulter; bellum iacet domitae repercusso truncis urnis
mille rigidi sub taurum.


`

export const nextPostPage = ({
  usingSrc,
}: {
  usingSrc: boolean
}) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
  // This is a demo file once you have tina setup feel free to delete this file
  
  import Head from 'next/head'
  import { createGlobalStyle } from 'styled-components'
  import { useTina } from 'tinacms/dist/edit-state'
  import { TinaMarkdown } from 'tinacms/dist/rich-text'
  import client from '${
    usingSrc ? '../' : ''
  }../../../.tina/__generated__/client'
  
  // Styles for markdown
  const GlobalStyle = createGlobalStyle\`
    h1,h2,h3,h4,h5 {
      margin-bottom: 1.5rem;
      margin-top: 1.5rem;
    }
    blockquote {
      background-color: rgb(209,250,229);
    }
    h1 {
      font-size: 45px;
    }
    h2 {
      font-size: 35px;
    }
    h3 {
      font-size: 25px;
    }
    h4 {
      font-size: 22px;
    }
    ul {
      padding-left: 0;
    }
    li {
      list-style-type: none;
    }
    a {
      font-weight: bold;
      color: rgb(59,130,246);
      text-decoration: underline;
    }
    \`
  
  const BlogPage = (props) => {
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    })
  
    return (
      <>
        <Head>
          {/* Tailwind CDN */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css"
            integrity="sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Head>
        <div>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <h1 className="text-3xl m-8 text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {data.post.title}
            </h1>
            <ContentSection content={data.post.body}></ContentSection>
          </div>
          <div className="bg-green-100 text-center">
            Lost and looking for a place to start?
            <a
              href="https://tina.io/guides/tina-cloud/getting-started/overview/"
              className="text-blue-500 underline"
            >
              {' '}
              Check out this guide
            </a>{' '}
            to see how add TinaCMS to an existing Next.js site.
          </div>
        </div>
      </>
    )
  }
  
  export const getStaticProps = async ({ params }) => {
    let data = {}
    let query = {}
    let variables = { relativePath: \`\${params.filename}.mdx\` }
    try {
      const res = await client.queries.post(variables)
      query = res.query
      data = res.data
      variables = res.variables
    } catch {
      // swallow errors related to document creation
    }
  
    return {
      props: {
        variables: variables,
        data: data,
        query: query,
        //myOtherProp: 'some-other-data',
      },
    }
  }
  
  export const getStaticPaths = async () => {
    const postsListData = await client.queries.postConnection()
  
    return {
      paths: postsListData.data.postConnection.edges.map((post) => ({
        params: { filename: post.node._sys.filename },
      })),
      fallback: false,
    }
  }
  
  export default BlogPage
  
  const PageSection = (props) => {
    return (
      <>
        <h2>{props.heading}</h2>
        <p>{props.content}</p>
      </>
    )
  }
  
  const components = {
    PageSection: PageSection,
  }
  
  const ContentSection = ({ content }) => {
    return (
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
          <div
            className="relative h-full text-lg max-w-prose mx-auto"
            aria-hidden="true"
          >
            <svg
              className="absolute top-12 left-full transform translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)"
              />
            </svg>
            <svg
              className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
              />
            </svg>
            <svg
              className="absolute bottom-12 left-full transform translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="d3eb07ae-5182-43e6-857d-35c643af9034"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"
              />
            </svg>
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <TinaMarkdown components={components} content={content} />
            <GlobalStyle />
          </div>
        </div>
      </div>
    )
  }`

export const AppJsContent = (usingSrc: boolean, extraImports?: string) => {
  const importLine = `import Tina from '${
    usingSrc ? '../' : ''
  }../.tina/components/TinaDynamicProvider.js'`

  return `${importLine}
${extraImports || ''}

const App = ({ Component, pageProps }) => {
  return (
    <Tina>
      <Component {...pageProps} />
    </Tina>
  )
}

export default App
`
}
export const AppJsContentPrintout = (
  usingSrc: boolean,
  extraImports?: string
) => {
  const importLine = chalk.green(
    `+ import Tina from '${
      usingSrc ? '../' : ''
    }../.tina/components/TinaDynamicProvider.js'`
  )

  return `${importLine}
  ${extraImports || ''}

  const App = ({ Component, pageProps }) => {
  return (
    ${chalk.green('+ <Tina>')}
        <Component {...pageProps} />
    ${chalk.green('+ </Tina>')}
  )
}

export default App
`
}
