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
      {form.label}
    </StyledEditingFormTitle>
  )
}

const StyledEditingFormTitle = styled.div<{ isMultiform: Boolean }>`
  cursor: ${p => p.isMultiform && 'pointer'};
  background-color: white;
  border-bottom: 1px solid rgba(51, 51, 51, 0.09);
  display: flex;
  align-items: center;
  padding: ${padding('small')}rem ${padding()}rem;
  color: inherit;
  font-size: 1.2rem;
  transition: color 250ms ease-out;
  svg {
    width: 1.25rem;
    fill: #949494;
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform 250ms ease-out;
  }
  :hover {
    color: ${p => p.isMultiform && `${p.theme.color.primary}`};
    svg {
      transform: translate3d(-7px, 0, 0);
      transition: transform 250ms ease;
    }
  }
`

export default EditingFormTitle
