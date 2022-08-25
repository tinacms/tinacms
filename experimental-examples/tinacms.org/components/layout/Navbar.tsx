import React from 'react'
import Link from 'next/link'
import { Container } from '../blocks'
import TinaLogo from '../../public/svg/tina-logo.svg'
import data from '../../content/navigation.json'

export function Navbar({}) {
  return (
    <div className="navbar">
      <Container width="wide">
        <div className="navGrid">
          <Link href="/">
            <a className="navLogo">
              <TinaLogo />
            </a>
          </Link>
          <nav className="navWrapper navNav">
            <ul className="navUl">
              {data.map((item) => {
                const { id, href, label } = item

                return (
                  <li key={id} className="navLi">
                    <Link href={href}>{label}</Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="navGithub">
            <iframe
              className="starButton"
              src="https://ghbtns.com/github-btn.html?user=tinacms&repo=tinacms&type=star&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="150px"
              height="30px"
            ></iframe>
          </div>
        </div>
      </Container>
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

        .content {
          display: flex;
          align-items: center;
        }

        .link {
          font-size: 1rem;
        }

        .tinaCloud {
          display: inline-block;
          white-space: nowrap;
        }

        .navbar {
          padding: 2rem 0 1rem 0;
          margin-bottom: -1px;
          background: linear-gradient(to bottom, #d1faf6, #e6faf8);
          flex: 0 1 auto;

          @media (min-width: 1200px) {
            padding: 3.5rem 0 2rem 0;
          }
        }

        .navGrid {
          width: 100%;
          display: grid;
          grid-gap: 1rem;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;

          @media (min-width: 800px) {
            grid-gap: 1rem;
            align-items: center;
            grid-template-columns: auto 1fr auto;
            grid-template-rows: 1fr;
          }
        }

        .navLogo {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 1;
          grid-row-end: 2;
          text-decoration: none;
          padding-bottom: 10px;

          :global(svg) {
            width: 115px;
            height: auto;
          }

          @media (min-width: 800px) {
            grid-column-start: 1;
            grid-column-end: 2;
          }
        }

        .navNav {
          grid-column-start: 1;
          grid-column-end: 3;
          grid-row-start: 2;
          grid-row-end: 3;
          justify-self: center;

          @media (min-width: 800px) {
            grid-column-start: 2;
            grid-column-end: 3;
            grid-row-start: 1;
            grid-row-end: 2;
          }
        }

        .navGithub {
          grid-column-start: 2;
          grid-column-end: 3;
          grid-row-start: 1;
          grid-row-end: 2;
          justify-self: end;
          display: flex;
          align-items: center;

          @media (min-width: 800px) {
            grid-column-start: 3;
            grid-column-end: 4;
          }
        }

        .navUl {
          display: flex;
          margin: 0 -1.5rem;
        }

        .navLi {
          margin: 0 1.75rem;

          :global(a) {
            color: var(--color-blue);
            font-weight: 500;
            opacity: 0.7;
            transition: opacity 150ms ease-out;
            text-decoration: none;
            font-size: 1.125rem;
            &:hover {
              opacity: 1;
            }
          }
        }

        .logomark {
          color: var(--color-orange);
          fill: var(--color-orange);
          display: flex;
          align-items: center;

          :global(svg) {
            margin-top: -5px;
            height: 40px;
            width: auto;
            margin-right: 12px;
          }
        }

        .wordmark {
          font-size: 26px;
          font-weight: bold;
          font-family: var(--font-tuner);

          :global(span) {
            margin-left: 1px;
          }
        }
      `}</style>
    </div>
  )
}
