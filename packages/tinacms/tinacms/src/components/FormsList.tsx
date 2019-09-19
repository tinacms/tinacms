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
          {/* <h1>Editable Files</h1> */}
        <ul>
          {forms.map(form => (
            <>
              <li
                key={form.id}
                onClick={() => setActiveForm(form)}
              >
                <h1>{form.name}</h1>
              </li>
              <span />
            </>
          ))}
        </ul>
      </StyledFormList>
    )
  }

  export default FormsList;

  const StyledFormList = styled.section<{ isEditing: Boolean }>`
    padding: ${p => p.theme.padding}rem;
    transition: transform 150ms ease-in;
    transform: translate3d(
        ${p => p.isEditing ? `-100%` : '0'},
        0,
        0
    );
    h1{
      color: #333;
      font-weight: normal;
    }
    span {
      display: block;
      width: 15%;
      background-color: rgba(51,51,51,0.1);
      height: 1px;
      margin: ${p => p.theme.paddingSml}rem 0;
    }
    ul {
        cursor: pointer;
        list-style: none;
        margin: 0;
        padding: 0;
        color: #747474;
        font-size: .8rem;
        li:not(:last-child) {
          margin-bottom: ${p => p.theme.paddingSml}rem;
          padding-bottom: .5rem;
        }
        li {
          color: #333;
          h1 {
            color: inherit;
          }
          transition: color 200ms ease;
        }
        li:hover {
          color: ${p => p.theme.color.primary};
          transition: color 200ms ease;
        }
    }
`
