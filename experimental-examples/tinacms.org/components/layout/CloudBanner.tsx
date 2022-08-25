import React from 'react'
import Link from 'next/link'
import { IconRight } from '../blocks'
import { Button, ButtonGroup } from 'components/ui'

export function CloudBanner() {
  return (
    <>
      <div className="banner">
        <div className="banner-content">
          <span className="desktop">
            <p className="text">We're excited about what's coming in 2022!</p>
          </span>
          <Link href="/blog/tinacms-2022/">
            <a className="link">
              <span className="desktop">Read more</span>
              <span className="mobile">From the blog: TinaCMS in 2022</span>
              <IconRight />
            </a>
          </Link>
        </div>
        <div className="actions">
          <ButtonGroup>
            <Link href="https://app.tina.io/">
              <Button size="small" color="blueInverted">
                Sign In
              </Button>
            </Link>
            <Link href="https://tina.io/docs/setup-overview/">
              <Button size="small" color="blue">
                Get Started
              </Button>
            </Link>
          </ButtonGroup>
        </div>
      </div>
      <style jsx>{`
        .desktop {
          display: none;
        }

        @media (min-width: 1200px) {
          .desktop {
            display: initial;
          }
          .mobile {
            display: none;
          }
        }

        .text {
          display: flex;
          align-items: center;
        }

        .wordmark {
          display: inline-flex;
          align-items: center;
          margin-right: 0.5rem;

          :global(svg) {
            height: 1rem;
            width: auto;
            margin-bottom: 0.125rem;
          }
        }

        .banner {
          background: linear-gradient(
            90deg,
            white,
            #f2fdfc 33.3%,
            #e6faf8 100%
          );
          box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.03);
          border-bottom: 1px solid #d1faf6;
          color: var(--color-tina-blue);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          position: relative;
          z-index: 10;
          line-height: 1.2;
          flex: 0 1 auto;
          width: 100%;

          :global(a) {
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            color: inherit;
            transition: opacity 150ms ease-out;
            font-size: 1.125rem;
            opacity: 0.7;

            &:not(:hover) {
              text-decoration: none;
            }
            &:hover {
              opacity: 1;
            }

            @media (min-width: 1200px) {
              margin-left: 1rem;
            }
          }

          :global(em) {
            font-style: normal;
            font-weight: bold;
          }

          @media (min-width: 680px) {
            padding: 0.75rem 1.5rem;
          }
        }

        .banner-content {
          display: flex;
          align-items: center;
        }

        .actions {
          flex: 1 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;

          :global(> *) {
            width: auto;
          }
        }

        .link {
          font-size: 1rem;
          margin-right: 1rem;
          :global(svg) {
            display: none;
            margin-left: 0.5rem;
            height: 1em;
            @media (min-width: 680px) {
              display: inline-block;
            }
          }
          @media (min-width: 680px) {
            margin-right: 2rem;
            white-space: nowrap;
          }
        }

        .tinaCloud {
          display: inline-block;
          white-space: nowrap;
        }
      `}</style>
    </>
  )
}
