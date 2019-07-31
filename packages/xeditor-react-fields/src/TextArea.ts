import styled, { css } from 'styled-components'

export type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = styled.textarea`
  border: 1px solid #eaeaea;
  border-radius: 0.3rem;
  height: 2rem;
  font-size: 0.9rem;
  padding: 0 0.5rem;
  margin: 0;
  outline: none;
  transition: border 0.2s ease;

  &:focus {
    border-color: #666666;
  }

  &::placeholder {
    font-size: 0.9rem;
    color: #cfd3d7;
  }
  ${(props: TextAreaProps) =>
    props.error &&
    css`
      border-color: red;
      &:focus {
        border-color: red;
      }
    `};
`
