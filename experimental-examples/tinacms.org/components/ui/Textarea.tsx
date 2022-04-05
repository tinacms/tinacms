import styled, { css } from 'styled-components'

export const Textarea = styled.textarea`
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 2px 3px rgba(0, 0, 0, 0.12);
  border: 0;
  border-radius: 5px;
  background: white;
  color: var(--color-secondary);
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  cursor: text;
  width: 100%;
  padding: 0.75rem 1rem;
  transition: all 85ms ease-out;
  font-family: var(--font-tuner);
  font-size: 16px;
  ::placeholder {
    opacity: 1;
    font-family: inherit;
    font-size: 1rem;
    transition: opacity 180ms ease-out;
  }
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
      rgba(236, 72, 21, 0.2) 0px 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 3px;
  }
  &:focus {
    box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset,
      rgba(236, 72, 21, 0.7) 0px 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 3px;
  }
  &:focus,
  &:active {
    outline: none;
    ::placeholder {
      opacity: 0.5;
      transition: opacity 200ms ease;
    }
  }
`
