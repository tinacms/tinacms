import React from 'react'
import styled, { css } from 'styled-components'

export const Hero = styled(({ overlap, narrow, children, ...styleProps }) => {
  return (
    <div {...styleProps}>
      <HeroTitle narrow={narrow}>{children}</HeroTitle>
    </div>
  )
})`
  position: relative;
  text-align: center;
  padding: 2rem 2rem 6rem 2rem;
  width: 100%;
  overflow: hidden;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: -1px;
    left: 50%;
    bottom: 1.5rem;
    width: calc(100% + 2px);
    min-width: 800px;
    transform: translate3d(-50%, 0, 0);
    background-image: url('/svg/hero-background.svg');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
  }

  @media (min-width: 1200px) {
    padding: 3rem 2rem 8rem 2rem;
  }

  ${(props) =>
    props.overlap &&
    css`
      padding-bottom: 12rem;
      margin-bottom: -6rem;

      @media (min-width: 1200px) {
        padding: 9rem 1rem 21rem 1rem;
        margin-bottom: -14rem;
      }
    `};

  ${(props) =>
    props.mini &&
    css`
      padding: 0;
      height: 3rem;
      margin-bottom: -6rem;

      &:before {
        bottom: 0;
        background-image: url('/svg/hero-background-mini.svg');
      }

      @media (min-width: 1200px) {
        padding: 0;
      }
    `};
`

export const HeroTitle = styled(({ narrow, children, ...styleProps }) => {
  return <h2 {...styleProps}>{children}</h2>
})`
  font-family: var(--font-tuner);
  font-weight: bold;
  font-style: normal;
  font-size: 2.5rem;
  line-height: 1.3;
  letter-spacing: 0.1px;
  display: inline-block;
  color: transparent;
  background: linear-gradient(
    to right,
    var(--color-orange-light),
    var(--color-orange),
    var(--color-orange-dark)
  );
  -webkit-background-clip: text;
  background-clip: text;
  text-align: center;
  margin: 0 auto;
  max-width: 12em;

  @media (min-width: 800px) {
    font-size: 3rem;
  }

  @media (min-width: 1200px) {
    font-size: 3.5rem;
  }

  ${(props) =>
    props.narrow &&
    css`
      max-width: 9em;
    `};
`
