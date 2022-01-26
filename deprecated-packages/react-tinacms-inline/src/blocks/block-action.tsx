import styled, { css } from 'styled-components'

interface BlockActionProps {
  active?: boolean
  disabled?: boolean
  onClick?: any
  ref?: any
}

export const BlockAction = styled.div<BlockActionProps>`
  background-color: ${(p) =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${(p) =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  fill: ${(p) =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  outline: none;
  border: none;
  padding: 4px 6px;
  transition: all 85ms ease-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  &:not(:last-child) {
    border-right: 1px solid var(--tina-color-grey-2);
  }
  svg {
    width: 26px;
    height: auto;
  }

  ${(props) =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`
