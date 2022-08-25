import React, { createContext } from 'react'
import styled, { css } from 'styled-components'
import { DocsNavProps } from './DocumentationNavigation'
import { useRouter } from 'next/router'
import { matchActualTarget } from 'utils'
import { DynamicLink } from 'components/ui'
import docsLinks from '../../content/docs-navigation.json'

interface NavTitleProps {
  level: number
  selected: boolean
}

const NavTitle = styled.a<NavTitleProps>`
  position: relative;
  display: block;
  text-decoration: none;
  transition: all 180ms ease-out 0s;
  cursor: pointer;
  color: var(--color-secondary);
  font-family: var(--font-primary);
  font-size: 0.9375rem;
  opacity: 0.75;
  line-height: 1.3;
  padding: 0.125rem 0.5rem 0.125rem 1.125rem;

  &:hover {
    opacity: 1;
  }

  span {
    display: inline-block;
    background: white;
    padding-right: 0.75rem;

    &:before {
      content: '';
      display: block;
      position: absolute;
      left: 1.125rem;
      top: 50%;
      height: 1px;
      margin-top: -3px;
      width: 100%;
      border-bottom: 5px dotted var(--color-grey-1);
      z-index: -1;
    }
  }

  ${(props: any) =>
    props.level === 0 &&
    css`
      opacity: 1;
      color: var(--color-orange);
      font-family: var(--font-tuner);
      font-size: 1.25rem;
      padding: 0.5rem 0.5rem 0.125rem 1.125rem;
    `}

  ${(props: any) =>
    props.level === 1 &&
    css`
      font-size: 1rem;
      opacity: 1;
    `}

    ${(props: any) =>
    props.level === 2 &&
    css`
      opacity: 0.875;
    `}


  ${(props: any) =>
    props.selected &&
    css`
      opacity: 1;
      color: var(--color-orange);
      font-weight: bold;
    `}
`

const hasNestedSlug = (navItems = [], slug) => {
  for (let item of navItems) {
    if (matchActualTarget(item.slug || item.href, slug)) {
      return true
    }
    if (item.items) {
      if (hasNestedSlug(item.items, slug)) {
        return true
      }
    }
  }
  return false
}

const NavLevel = ({
  navListElem,
  categoryData,
  level = 0,
}: {
  navListElem?: any
  categoryData: any
  level?: number
}) => {
  const navLevelElem = React.useRef(null)
  const router = useRouter()
  // const expandChildren =
  // matchActualTarget(categoryData.slug || categoryData.href, router.asPath) ||
  //   hasNestedSlug(categoryData.items, router.asPath) //matchActualTarget(router.asPath, categoryData.slug)
  const expandChildren = !categoryData.expandOnSelect
    ? true
    : matchActualTarget(
        categoryData.slug || categoryData.href,
        router.asPath
      ) || hasNestedSlug(categoryData.items, router.asPath) //matchActualTarget(router.asPath, categoryData.slug)
  const isSelected = router.asPath == categoryData.slug && level !== 0

  React.useEffect(() => {
    if (
      navListElem &&
      navLevelElem.current &&
      navListElem.current &&
      isSelected
    ) {
      const topOffset = navLevelElem.current.getBoundingClientRect().top - 32
      // navListElem.current.scrollTo({
      //   top: topOffset,
      //   behavior: 'auto',
      //   block: 'nearest',
      //   inline: 'start',
      // })
    }
  }, [navLevelElem, navListElem, isSelected])

  return (
    <>
      <NavLabelContainer beta={categoryData.beta}>
        <DynamicLink href={categoryData.slug} passHref>
          <NavTitle ref={navLevelElem} level={level} selected={isSelected}>
            {isSelected ? (
              <span>{categoryData.title || categoryData.category}</span>
            ) : (
              categoryData.title || categoryData.category
            )}
          </NavTitle>
        </DynamicLink>
      </NavLabelContainer>
      {expandChildren && categoryData.items && (
        <NavLevelChildContainer level={level}>
          {(categoryData.items || []).map((item) => (
            <NavLevel
              navListElem={navListElem}
              level={level + 1}
              categoryData={item}
            />
          ))}
        </NavLevelChildContainer>
      )}
    </>
  )
}

interface NavLevelChildContainerProps {
  level: number
}

const NavLevelChildContainer = styled.div<NavLevelChildContainerProps>`
  position: relative;
  display: block;
  padding-left: 0.675rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;

  ${(props: any) =>
    props.level === 0 &&
    css`
      padding-left: 0.75rem;
      padding-top: 0.25rem;
      padding-bottom: 0.125rem;
    `}
`

const NavLabelContainer = styled.div<{ beta: boolean }>`
  display: flex;
  &:last-child {
    padding-bottom: 0.375rem;
  }

  ${(props: { beta: boolean }) =>
    props.beta &&
    css`
      a::after {
        display: -ms-inline-flexbox;
        content: 'Experimental';
        font-size: 12px;
        font-weight: bold;
        background-color: #f9ebe6;
        border: 1px solid #edcdc4;
        width: fit-content;
        padding: 2px 5px;
        border-radius: 5px;
        letter-spacing: 0.25px;
        color: #ec4815;
        margin-right: 5px;
        margin-left: 5px;
        line-height: 1;
        vertical-align: middle;
        height: fit-content;
        align-self: center;
      }
    `}
`

export const DocsNavigationList = ({ navItems }: DocsNavProps) => {
  const router = useRouter()
  const navListElem = React.useRef(null)

  return (
    <>
      <MobileMainNav>
        {docsLinks &&
          docsLinks.map(({ id, href, label }) => {
            return (
              <DynamicLink href={href} passHref>
                <a key={id}>{label}</a>
              </DynamicLink>
            )
          })}
      </MobileMainNav>
      <DocsNavigationContainer ref={navListElem}>
        {navItems.map((categoryData) => (
          <NavLevel navListElem={navListElem} categoryData={categoryData} />
        ))}
      </DocsNavigationContainer>
    </>
  )
}

const MobileMainNav = styled.div`
  padding: 0.5rem 0;
  background: var(--color-grey-1);
  border-bottom: 1px solid var(--color-light-dark);

  a {
    display: block;
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.375rem 1rem 0.375rem 1rem;
    color: var(--color-orange);
    margin: 0;
    font-family: var(--font-tuner);
    font-style: normal;
    opacity: 1;
    transition: transform 180ms ease-out;
    line-height: 1;

    &:hover,
    &:focus {
      text-decoration: none;
      transform: translate3d(-1px, -2px, 0);
    }
  }

  @media (min-width: 1200px) {
    display: none;
  }
`

const DocsNavigationContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0 1.5rem 0;
  margin-right: -1px;

  @media (min-width: 1600px) {
    padding: 1rem 1rem 2rem 1rem;
  }
`

const AnchorIcon = styled.span`
  display: inline-block;
  position: relative;
  transform: translate3d(0, 0, 0);
  transition: all 150ms ease-out;
`
