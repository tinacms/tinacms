import styled, { css } from 'styled-components'

interface SectionProps {
  color?: 'seafoam' | 'white'
}

export const Section = styled.section<SectionProps>`
  padding: 3rem 0;

  @media (min-width: 800px) {
    padding: 5rem 0;
  }

  ${(props) =>
    props.color === 'seafoam' &&
    css`
      background-color: var(--color-seafoam);
      background: linear-gradient(
        to bottom,
        var(--color-seafoam-100),
        var(--color-seafoam-200),
        var(--color-seafoam-300)
      );
    `};
`
