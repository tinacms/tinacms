import styled, { css } from 'styled-components'

interface ButtonProps {
  color?:
    | 'white'
    | 'primary'
    | 'secondary'
    | 'seafoam'
    | 'variable'
    | 'blue'
    | 'blueInverted'
  size?: 'large' | 'small'
}

export const Button = styled.button<ButtonProps>`
  font-size: 1rem;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 150ms ease-out;
  width: max-content;
  transform: translate3d(0px, 0px, 0px);
  display: flex;
  align-items: center;
  background-color: var(--color-seafoam);
  color: var(--color-orange);
  border-radius: 2rem;
  text-transform: uppercase;
  padding: 0 1.25rem;
  height: 45px;
  border: 1px solid #b4f4e0;
  font-family: var(--font-tuner);
  font-weight: regular;
  font-style: normal;
  text-decoration: none !important;
  white-space: nowrap;
  opacity: 1;
  line-height: 1.25;

  svg {
    fill: currentColor;
    margin-left: -0.25em;
    margin-right: 0.125rem;
  }

  &:hover,
  &:focus {
    color: var(--color-orange);
    text-decoration: none;
    transform: translate3d(-1px, -2px, 0);
    transition: transform 180ms ease-out;
  }
  &:focus {
    box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
      rgba(236, 72, 21, 0.7) 0px 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 3px;
  }
  &:focus,
  &:active {
    outline: none;
  }
  &:active {
    filter: none;
  }

  svg {
  }

  ${(props) =>
    props.size === 'small' &&
    css`
      padding: 0 1.25rem;
      height: 38px;
      font-size: 0.95rem;
      line-height: 1;
    `}

  ${(props) =>
    props.color === 'white' &&
    css`
      background-color: white;
      border-color: rgba(0, 0, 0, 0.1);

      &:focus {
        box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
          rgba(255, 255, 255, 0.7) 0px 0px 0px 3px,
          rgba(0, 0, 0, 0.12) 0px 2px 3px;
      }
    `};

  ${(props) =>
    props.color === 'primary' &&
    css`
      background-color: var(--color-orange);
      color: white;
      border-color: var(--color-orange);
      font-weight: bold;

      &:hover,
      &:focus {
        color: white;
      }
    `};

  ${(props) =>
    props.color === 'blue' &&
    css`
      background-color: var(--color-tina-blue);
      border-color: var(--color-tina-blue-dark);
      color: white;
      font-weight: bold;

      &:hover,
      &:focus {
        color: white;
      }

      &:focus {
        box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
          var(--color-tina-blue) 0px 0px 0px 3px,
          rgba(0, 0, 0, 0.12) 0px 2px 3px;
      }
    `};

  ${(props) =>
    props.color === 'blueInverted' &&
    css`
      background-color: white;
      color: var(--color-tina-blue);
      border-color: rgba(0, 0, 0, 0.1);

      &:focus {
        box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
          var(--color-tina-blue) 0px 0px 0px 3px,
          rgba(0, 0, 0, 0.12) 0px 2px 3px;
      }

      &:hover,
      &:focus {
        color: var(--color-tina-blue-dark);
      }
    `};

  ${(props) =>
    props.color === 'secondary' &&
    css`
      background-color: var(--color-secondary);
      color: var(--color-orange);
      border-color: var(--color-secondary);

      &:hover,
      &:focus {
        color: white;
      }
    `};

  ${(props) =>
    props.color === 'variable' &&
    css`
      background-color: var(--color-background);
      color: var(--color-foreground);
      border-color: var(--color-background);
      &:focus {
        background-color: var(--color-background);
        color: var(--color-foreground);
      }
    `};
`

Button.defaultProps = {
  color: 'seafoam',
}

export const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
  margin-right: -1rem;
  margin-bottom: -1rem;

  ${Button} {
    margin-right: 1rem;
    margin-bottom: 1rem;
  }
`
