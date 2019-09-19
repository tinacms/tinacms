import * as React from 'react'
import styled from 'styled-components'
import { padding, color } from '@tinacms/styles'

import { LeftArrowIcon } from '@tinacms/icons'

const EditingFormTitle = ({ form, setEditingForm, isMultiform }: any) => {
  return (
    <StyledEditingFormTitle
      isMultiform={isMultiform}
      onClick={() => isMultiform && setEditingForm(null)}
    >
      {isMultiform && <LeftArrowIcon />}
      <HeadingOne>{form.label}</HeadingOne>
    </StyledEditingFormTitle>
  )
}

const StyledEditingFormTitle = styled.div<{ isMultiform: Boolean }>`
  cursor: ${p => p.isMultiform && 'pointer'};
  background-color: ${p => p.theme.color.light};
  border-bottom: 1px solid rgba(51, 51, 51, 0.04);
  display: flex;
  align-items: center;
  padding: ${padding('small')}rem ${padding()}rem;
  color: inherit;
  transition: color 250ms ease;
  svg {
    width: 15px;
    fill: #949494;
    height: 15px;
    transform: translate3d(-4px, 0, 0);
    transition: transform 250ms ease;
  }
  :hover {
    color: ${p => p.isMultiform && `${p.theme.color.primary}`};
    transition: color 250ms ease;
    svg {
      transform: translate3d(-7px, 0, 0);
      transition: transform 250ms ease;
    }
  }
`

const HeadingOne = styled.h1`
  margin: 0;
`

export default EditingFormTitle
