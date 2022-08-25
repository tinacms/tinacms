import React from 'react'
import { connectSearchBox } from 'react-instantsearch-dom'
// @ts-ignore
import * as debounce from 'lodash/debounce'
import { IconWrapper, Input, SearchContainer } from './styles'
import { SearchIcon } from './SearchIcon'

/* Copied from SearchBoxProvided in react-instantsearch-dom */
interface SearchBoxProps {
  refine: (...args: any[]) => any
  currentRefinement: string
  isSearchStalled: boolean
  expanded: boolean
}

export default connectSearchBox(
  ({ refine, expanded, ...rest }: SearchBoxProps) => {
    const debouncedSearch = debounce((e: any) => refine(e.target.value), 250)
    const onChange = (e: any) => {
      e.persist()
      debouncedSearch(e)
    }

    return (
      <SearchContainer expanded={expanded}>
        <Input
          type="text"
          placeholder="Search"
          aria-label="Search"
          onChange={onChange}
          expanded={expanded}
          {...rest}
        />
        <IconWrapper>
          <SearchIcon />
        </IconWrapper>
      </SearchContainer>
    )
  }
) as any
