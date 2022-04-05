import React from 'react'
import { NextSeo } from 'next-seo'
import { DocsLayout } from 'components/layout'
import { useRouter } from 'next/router'
import * as ga from '../../utils/ga'
import { Actions } from 'components/blocks/Actions'

const pageData = {
  title: 'Getting Started',
  excerpt: 'Whatever',
}

const OverviewTemplate = (props) => {
  const router = useRouter()
  const isBrowser = typeof window !== `undefined`

  React.useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const cards = [
    {
      header: 'Use our CLI Quickstart',
      description:
        'Using the CLI, choose one of our starters and get started locally.',
      link: '/docs/introduction/using-starter/',
    },
    {
      header: 'Add Tina to an Existing Next.js Site',
      description: 'Have an existing NextJS site? Start here!',
      link: '/docs/introduction/tina-init/',
    },
    {
      header: 'Dashboard Quickstart',
      description:
        'Setup a pre-configured Tina project with Tina & Vercel in minutes.',
      link: 'https://app.tina.io/quickstart',
    },
  ]

  return (
    <>
      <NextSeo
        title={pageData.title}
        titleTemplate={'%s | TinaCMS Docs'}
        description={pageData.excerpt}
        openGraph={{
          title: pageData.title,
          description: pageData.excerpt,
          // images: [openGraphImage(frontmatter.title, '| TinaCMS Docs')],
        }}
      />
      <DocsLayout navItems={props.docsNav}>
        <div className="wrapper">
          <div className="intro">
            <h1>Getting Started With Tina</h1>
            <hr />
            <p className="intro-text">
              Tina is a Git-backed headless content management system that
              enables developers and content creators to collaborate seamlessly.
              With Tina, developers can create a custom visual editing
              experience that is perfectly tailored to their site.
            </p>
          </div>
          <div className="cards">
            {cards.map((card) => (
              <a className="card" href={card.link}>
                <h2>{card.header}</h2>
                <p>{card.description}</p>
                <div className="spacer"></div>
                <Actions
                  items={[
                    {
                      variant: 'secondary',
                      label: 'Get Started',
                      icon: 'arrowRight',
                      url: card.link,
                    },
                  ]}
                />
              </a>
            ))}
          </div>
        </div>
        <style jsx>{`
          .wrapper {
            display: block;
            width: 100%;
            position: relative;
            padding: 1rem 2rem 3rem 2rem;
            max-width: 1400px;
            margin: 0 auto;

            @media (min-width: 500px) {
              padding: 1rem 3rem 3rem 3rem;
            }

            @media (min-width: 900px) {
              width: 90%;
            }
          }

          .intro {
            display: block;
            max-width: 960px;
            margin: 0 auto 2.25rem auto;
          }

          .intro-text {
            font-size: 1.25rem;
          }

          .cards {
            border-radius: 0.75rem;
            overflow: hidden;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            width: 100%;
            border: 1px solid var(--color-seafoam-300);
            box-shadow: 0 6px 24px rgba(0, 37, 91, 0.05),
              0 2px 4px rgba(0, 37, 91, 0.03);
          }

          .card {
            width: 100%;
            padding: 2.25rem 2rem;
            width: calc(100% + 1px);
            height: calc(100% + 1px);
            margin: 0 -1px -1px 0;
            border-right: 1px solid var(--color-seafoam-300);
            border-bottom: 1px solid var(--color-seafoam-300);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-decoration: none;
            transition: all ease-out 150ms;
            background-color: transparent;

            h2,
            h3 {
              transition: all ease-out 150ms;
            }

            &:hover {
              background-color: var(--color-seafoam-100);

              h2,
              h3 {
                color: var(--color-secondary);
              }
            }
          }

          .card > *:not(:last-child) {
            margin: 0 0 1rem 0;
          }

          .spacer {
            flex: 1 1 auto;
            margin: 0 !important;
          }
        `}</style>
      </DocsLayout>
    </>
  )
}

export default OverviewTemplate
