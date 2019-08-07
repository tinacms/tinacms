import { FC } from 'react'
import styled from 'styled-components'
import * as React from 'react'

export interface ToggleProps {
  name: string
  onBlur: <T>(event?: React.FocusEvent<T>) => void
  onChange: <T>(event: React.ChangeEvent<T> | any) => void
  onFocus: <T>(event?: React.FocusEvent<T>) => void
  value: any
  checked?: boolean
  disabled?: boolean
}

export const Toggle: FC<ToggleProps> = props => (
  <ToggleElement>
    <ToggleInput id={props.name} type="checkbox" {...props} />
    <ToggleLabel
      htmlFor={props.name}
      role="switch"
      disabled={props.disabled}
      {...props}
    >
      <ToggleSwitch xmlns="http://www.w3.org/2000/svg">
        <g>
          <rect rx="10" id="container" height="20" width="40" />
          <ellipse
            ry="8"
            rx="8"
            id="dot"
            cy="10"
            cx={props.value ? '30' : '10'}
            fill={props.value ? '#000' : '#999'}
          />
        </g>
      </ToggleSwitch>
    </ToggleLabel>
  </ToggleElement>
)

const ToggleElement = styled.div`
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  margin: 0 0 2rem 0;
`

const ToggleLabel = styled.label<{ disabled?: boolean }>`
  background: none;
  color: inherit;
  padding: 0;
  font: inherit;
  opacity: ${props => (props.disabled ? '0.4' : '1')};
  outline: inherit;
  width: 40px;
  height: 20px;
  pointer-events: ${props => (props.disabled ? 'none' : 'inherit')};
`

const ToggleSwitch = styled.svg`
  width: 40px;
  height: 20px;
  overflow: visible;
  rect {
    fill: #f3f3f3;
    transition: all 0.15s ease;
  }
  ellipse {
    transition: all 0.15s ease;
  }
`

const ToggleInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  margin: 0;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &:focus + ${ToggleLabel} {
    > ${ToggleSwitch} {
      rect {
        fill: #dedede;
      }
    }
  }
`
