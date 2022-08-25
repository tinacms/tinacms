import React from 'react'
import styled, { css } from 'styled-components'
import { LinkNav } from '../ui/LinkNav'
import TwitterIconSvg from '../../public/svg/twitter-icon.svg'
import GithubIconSvg from '../../public/svg/github-icon.svg'
import { EmailForm } from '../forms/EmailForm'
import { TinaIcon } from 'components/logo'
import Link from 'next/link'

const FooterSocial = styled.div`
  display: flex;
  align-items: center;
  color: inherit;
  margin-bottom: 1rem;

  @media (min-width: 600px) {
    justify-content: flex-end;
    margin-bottom: 0;
  }

  a {
    display: flex;
    align-items: center;
    color: inherit;
  }

  svg {
    width: 2rem;
    height: auto;
    fill: inherit;
    margin-left: 1rem;
  }
`

const FooterForm = styled.div`
  display: flex;
  flex-direction: column;
  color: inherit;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 1rem;

  span {
    margin: 0.5rem 1rem 0.5rem 0;
    white-space: nowrap;
    font-size: 1.25rem;
    line-height: 1;
  }

  @media (min-width: 550px) {
    flex-direction: row;
  }
`

const FooterTop = styled.div`
  display: grid;
  grid-gap: 1rem;
  padding: 2.5rem 2rem;
  background-color: var(--color-background);
  align-items: start;
  grid-template-areas: 'logo' 'social' 'nav';

  @media (min-width: 600px) {
    grid-template-areas: 'logo social' 'nav nav';
  }

  @media (min-width: 800px) {
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-areas: 'logo nav social';
  }

  ${TinaIcon} {
    grid-area: logo;
    margin-bottom: 1rem;
  }

  ${LinkNav} {
    grid-area: nav;
  }

  ${FooterSocial} {
    grid-area: social;
  }
`

const FooterBottom = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem 0 2rem;
  background-color: var(--color-background);

  @media (min-width: 1200px) {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
`

const FootnoteLinks = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem 1rem;
`

const Footnote = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: inherit;
  font-size: 1rem;
  margin: 0 -1rem 1rem -1rem;

  button {
    height: 40px;
    color: white;
    background-color: var(--color-orange);

    &:hover,
    &:focus {
      color: white;
      fill: white;
    }

    &:focus {
      border-color: white;
    }

    svg {
      fill: white;
    }
  }

  p,
  a,
  button {
    white-space: nowrap;
  }

  div {
    padding: 0.5rem 1rem;
  }

  p {
    color: inherit;
    margin: 0;
    font-size: 1rem;
    opacity: 0.65;
  }

  a {
    text-decoration: none;
    color: inherit;
    opacity: 0.65;
    &:hover {
      color: inherit;
      opacity: 1;
    }
  }

  @media (min-width: 500px) {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
`

const FooterDivider = styled.span`
  &:after {
    content: '|';
    margin: 0.5rem;
    opacity: 0.3;
  }
`

export const Footer = styled(({ light, ...styleProps }) => {
  return (
    <div {...styleProps}>
      <FooterTop>
        <TinaIcon />
        <LinkNav />
        <FooterSocial>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=tinacms&repo=tinacms&type=star&count=true&size=large"
            frameBorder="0"
            scrolling="0"
            width="150px"
            height="30px"
          ></iframe>
          <a href="https://twitter.com/tina_cms" target="_blank">
            <TwitterIconSvg />
          </a>
          <a
            className="github"
            href="https://github.com/tinacms/tinacms"
            target="_blank"
          >
            <GithubIconSvg />
          </a>
        </FooterSocial>
      </FooterTop>
      <FooterBottom>
        <FooterForm>
          <span>Stay in touch 👉</span>
          <EmailForm isFooter />
        </FooterForm>
        <Footnote>
          <FootnoteLinks>
            <Link href="/security/" passHref>
              <a>Security</a>
            </Link>
            <FooterDivider />
            <Link href="/telemetry/" passHref>
              <a>Open Source Telemetry</a>
            </Link>
            <FooterDivider />
            <Link href="/terms-of-service/" passHref>
              <a>Terms of Service</a>
            </Link>
            <FooterDivider />
            <Link href="/privacy-notice/" passHref>
              <a>Privacy Notice</a>
            </Link>
            <FooterDivider />
            <a
              href="https://github.com/tinacms/tinacms/blob/master/LICENSE"
              target="_blank"
            >
              License
            </a>
          </FootnoteLinks>
          <div>
            <p>
              &copy; TinaCMS 2019–
              {new Date().getFullYear()}
            </p>
          </div>
        </Footnote>
      </FooterBottom>
    </div>
  )
})`
  grid-area: footer;
  color: white;
  --color-background: var(--color-orange);
  --color-background-dark: var(--color-orange-dark);
  position: relative;
  z-index: 1000;
  flex: 0 1 auto;

  ${TinaIcon} {
    fill: var(--color-white);

    svg {
      height: 3.5rem;
    }
  }

  ${FooterSocial} {
    fill: white;
  }

  ${FooterBottom} {
    --color-background: var(--color-orange-dark);
  }

  ${(props) =>
    props.light &&
    css`
      border-top: 1px solid var(--color-light-dark);
      color: var(--color-orange);
      --color-background: var(--color-light);
      --color-background-dark: var(--color-light-dark);

      ${TinaIcon} {
        fill: var(--color-orange);
      }

      ${FooterSocial} {
        fill: var(--color-orange);
      }

      ${FooterBottom} {
        color: white;
        --color-background: var(--color-orange);
      }
    `};
`
