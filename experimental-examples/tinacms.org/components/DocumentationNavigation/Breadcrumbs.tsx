import React from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { matchActualTarget } from 'utils'

export const ChevronRightIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="inherit"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.208L20.2099 16L11 24.792Z" />
  </svg>
)

export interface DocsNavProps {
  navItems: any
}

const getNestedBreadcrumbs = (
  listItems,
  pagePath,
  breadcrumbs = new Array()
) => {
  for (const listItem of listItems || []) {
    if (matchActualTarget(pagePath, listItem.slug || listItem.href)) {
      breadcrumbs.push(listItem)
      return [listItem]
    }
    const nestedBreadcrumbs = getNestedBreadcrumbs(
      listItem.items,
      pagePath,
      breadcrumbs
    )
    if (nestedBreadcrumbs.length) {
      return [listItem, ...nestedBreadcrumbs]
    }
  }
  return []
}

export function Breadcrumbs({ navItems }: DocsNavProps) {
  const router = useRouter()
  const breadcrumbs = getNestedBreadcrumbs(navItems, router.asPath) || []
  return (
    <>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, i) => (
          <>
            {i != 0 && <ChevronRightIcon />}
            <li>
              <a href={breadcrumb.slug}>
                {breadcrumb.title || breadcrumb.category}
              </a>
            </li>
          </>
        ))}
      </BreadcrumbList>
    </>
  )
}

const BreadcrumbList = styled.ul`
  list-style-type: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 0 !important;
  margin: 0 0 0 0 !important;

  @media (min-width: 1200px) {
    margin: -0.25rem 0 0.5rem 0 !important;
  }

  li {
    position: relative;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  svg {
    opacity: 0.2;
    color: currentColor;
    fill: currentColor;
    height: 1.25rem;
    width: auto;
    margin: 0 0.3rem 0 0.5rem;
    text-align: center;
  }

  a {
    text-decoration-color: transparent !important;
    transition: all 185ms ease-out;
    font-size: 1rem;
    text-transform: uppercase;
    opacity: 0.5 !important;
    color: var(--color-secondary);
    line-height: 1 !important;

    &:hover {
      text-decoration-color: currentColor !important;
      opacity: 1 !important;
    }
  }
`
