import * as React from 'react'
import styled from 'styled-components'
import { Form } from '@tinacms/core'

interface FormsListProps {
    forms: Form[]
    activeForm: Form | null
    setActiveForm(form: Form): void
    isEditing: Boolean
  }
  const FormsList = ({ forms, activeForm, setActiveForm, isEditing }: FormsListProps) => {
    return (
      <StyledFormList isEditing={isEditing}>
        <h1>Editable Files</h1>
        <ul>
          {forms.map(form => (
            <li
              key={form.name}
              onClick={() => setActiveForm(form)}
            >
              {form.name}
            </li>
          ))}
        </ul>
      </StyledFormList>
    )
  }

  export default FormsList;

  const StyledFormList = styled.section<{ isEditing: Boolean }>`
    padding: ${p => p.theme.padding}rem;
    background-color: ${p => p.theme.color.light};
    border-bottom: 1px solid rgba(51,51,51,0.04);
    transition: transform 150ms ease-in;
    transform: translate3d(
        ${p => p.isEditing ? `-100%` : '0'},
        0,
        0
    );
    h1 {
        font-size: 1.2rem;
        color: #333;
        font-weight: normal;
        padding: 0 0 ${p => p.theme.input.padding} 0;
        margin: 0 0 .85rem 0;
        border-bottom: 0.5px solid lightgray;
    }
    ul {
        cursor: pointer;
        list-style: none;
        margin: 0;
        padding: 0;
        color: #747474;
        font-size: .8rem;
        li:not(:last-child) {
        margin-bottom: ${p => p.theme.input.padding};
        padding-bottom: .5rem;
        }
        li {
        transition: color 250ms ease;
        }
        li:hover {
        color: ${p => p.theme.color.primary};
        transition: color 250ms ease;
        }
    }
`
