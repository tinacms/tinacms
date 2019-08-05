import * as React from 'react'
import styled from 'styled-components'

interface ToggleProps {
  onClick(): void
}

interface State {
  toggleOn: boolean
}

export class Toggle extends React.Component<ToggleProps, State> {
  static defaultProps = {
    toggleOn: false,
  }

  state = {
    toggleOn: false,
  }

  toggle = () => {
    this.setState({ toggleOn: !this.state.toggleOn })
  }

  render() {
    return (
      <>
        <ToggleWrapper onClick={this.toggle}>
          <Handle />
        </ToggleWrapper>
      </>
    )
  }
}

// Styling
const ToggleWrapper = styled.div`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: #f3f3f3;
  border-radius: 1rem;
`

const Handle = styled.div`
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: black;
  left: 0.12rem;
  top: 50%;
  transform: translate(0, -50%);
`
