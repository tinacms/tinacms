import React from 'react'
import styled, { css } from 'styled-components'
import { Button, ButtonGroup } from '../ui'
import { DynamicLink } from '../ui/DynamicLink'
import data from '../../content/docs-navigation.json'
import Link from 'next/link'

interface NavProps {
  color?: 'white' | 'secondary' | 'seafoam' | 'light'
  open: boolean
}

export const DocsHeaderNav = styled(
  React.memo(({ color, ...styleProps }: NavProps) => {
    return (
      <div {...styleProps}>
        <ul>
          {data &&
            data.map(({ id, href, label }) => {
              return (
                <li key={id}>
                  <DynamicLink href={href} passHref>
                    <a>{label}</a>
                  </DynamicLink>
                </li>
              )
            })}
        </ul>
        <div className="actions">
          <ButtonGroup>
            <Link href="https://app.tina.io/signin">
              <Button size="small" color="blueInverted">
                Sign In
              </Button>
            </Link>
            <Link href="/docs/setup-overview/">
              <Button size="small" color="blue">
                Get Started
              </Button>
            </Link>
          </ButtonGroup>
        </div>
      </div>
    )
  })
)`
  position: relative;
  grid-area: header;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 2rem;

  ul {
    list-style-type: none;
    display: flex;
    justify-content: flex-end;
    margin: 0 1rem 0 0;

    @media (max-width: 1200px) {
      display: none;
    }
  }

  li {
    margin: 0 1.5rem;

    a {
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

  .actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;

    > * {
      width: auto;
    }
  }

  --color-background: white;
  --color-foreground: var(--color-orange);

  ${(props) =>
    props.color &&
    props.color === 'secondary' &&
    css`
      --color-background: var(--color-secondary);
      --color-foreground: var(--color-orange);
    `};

  ${(props) =>
    props.color &&
    props.color === 'seafoam' &&
    css`
      --color-background: var(--color-seafoam);
      --color-foreground: var(--color-orange);
    `};

  ${(props) =>
    props.color &&
    props.color === 'light' &&
    css`
      --color-background: var(--color-light);
      --color-foreground: var(--color-orange);

      ${Button} {
        border: 1px solid var(--color-light-dark);
      }
    `};
`
