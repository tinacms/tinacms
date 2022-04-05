import React from 'react'
import styled, { css } from 'styled-components'
import RightArrowSvg from '../../public/svg/right-arrow.svg'
import { DynamicLink } from '../ui/DynamicLink'
interface NextPrevPageProps {
  title: string
  slug: string
}

interface PaginationProps {
  prevPage?: NextPrevPageProps
  nextPage?: NextPrevPageProps
}

export function DocsPagination({ prevPage, nextPage }: PaginationProps) {
  return (
    <Wrapper>
      {prevPage && prevPage.slug && (
        <DynamicLink href={`${prevPage.slug}`} passHref>
          <PaginationLink previous>
            <span>Previous</span>
            <h5>{prevPage.title}</h5>
            <RightArrowSvg />
          </PaginationLink>
        </DynamicLink>
      )}
      {nextPage && nextPage.slug && (
        <DynamicLink href={`${nextPage.slug}`} passHref>
          <PaginationLink>
            <span>Next</span>
            <h5>{nextPage.title}</h5>
            <RightArrowSvg />
          </PaginationLink>
        </DynamicLink>
      )}
    </Wrapper>
  )
}

export default DocsPagination

/*
 ** Styles ------------------------------------------
 */

interface PaginationLinkProps {
  previous?: boolean
}

const PaginationLink = styled.a<PaginationLinkProps>`
  padding: 1rem;
  display: block;
  flex: 1 1 auto;
  font-family: var(--font-tuner);
  font-weight: regular;
  font-style: normal;
  text-decoration: none;
  background-color: #fafafa;
  color: var(--color-secondary);
  position: relative;
  text-align: right;
  padding-right: 3.5rem;
  margin: 0 1px 1px 0;

  span {
    font-size: 0.9375rem;
    text-transform: uppercase;
    opacity: 0.5;
  }

  h5 {
    font-size: 1.25rem;
    line-height: 1.3;
    margin: 0 !important;
    transition: all 180ms ease-out;
  }

  svg {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 2rem;
    height: auto;
    fill: var(--color-grey);
    transition: all 180ms ease-out;
  }

  &:hover {
    h5 {
      color: var(--color-orange);
    }
    svg {
      fill: var(--color-orange);
    }
  }

  ${(props) =>
    props.previous &&
    css`
      padding-right: 1rem;
      padding-left: 3.5rem;
      text-align: left;

      svg {
        right: auto;
        left: 0.75rem;
        transform: translate3d(0, -50%, 0) rotate(180deg);
      }
    `};
`

const Wrapper = styled.div`
  margin-top: 2rem;
  background-color: var(--color-light-dark);
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1px 0 0 1px;
`
