import * as React from 'react'
import styled from 'styled-components'

import { LeftArrow } from '@tinacms/icons'

//TODO: Make Form Name better
const EditingFormTitle = ({form, setEditingForm }: any) => {
    return (
        <StyledEditingFormTitle onClick={() => setEditingForm(null)}>
            <LeftArrow />
            <h1>{form.name}</h1>
        </StyledEditingFormTitle>
)}

const StyledEditingFormTitle = styled.div`
    background-color: ${p => p.theme.color.light};
    border-bottom: 1px solid rgba(51,51,51,0.04);
    cursor: pointer;
    display: flex;  
    align-items: center;
    padding:  ${p => p.theme.padding}rem;
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
        color: ${p => p.theme.color.primary};
        transition: color 250ms ease;
        svg {
        transform: translate3d(-7px, 0, 0);
        transition: transform 250ms ease;
        }
    }
`

export default EditingFormTitle;