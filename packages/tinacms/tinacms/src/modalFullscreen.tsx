import styled, { keyframes } from 'styled-components'
import * as React from 'react'

const ModalFullscreenKeyframes = keyframes`
  0% {
    transform: translate3d( -2rem, 0, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`

export const ModalFullscreen = styled.div`
  display: block;
  z-index: 1;
  overflow: visible;
  background-color: #fff;
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 170px);
  height: 100%;
  animation: ${ModalFullscreenKeyframes} 150ms ease-out 1;
`
